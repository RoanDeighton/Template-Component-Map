import { Page } from "playwright";

// Ported from ~/code/Sequence (a sibling full-page-screenshot browser
// extension that solved this exact problem before this tool did): a still
// image can't show motion, so a `position: sticky`/`fixed` element sampled
// once per scroll slice has no single correct instantaneous state — it
// either repeats down the stitched image at wherever each slice happened
// to catch it (a floating "book a tour" pill bar, a sticky nav) or smears
// across slice boundaries (a scroll-linked reveal animation, a parallax
// drift). The general fix, same as Sequence's `unstickLargeElements` +
// `setChromeHidden`: small chrome-shaped fixed/sticky elements are shown
// once (on the first slice) and hidden after; larger sticky sections are
// converted to normal document flow so they render at their resting state
// instead of repeating; anything with a live-driven `transform` gets frozen
// once it's actually seen to change.
//
// One addition beyond what Sequence needs: Sequence never re-reads the DOM
// after a capture (the tab gets reloaded or closed next), so it never
// reverts the position/transform overrides it applies, only the
// visibility ones. This tool captures `page.content()` right after the
// screenshot (see crawl.ts) on the same page, so every override made here
// must be reverted by restoreStitchChrome() before that happens, or the
// saved page.html would permanently bake in `style="visibility:hidden"`
// and the un-stuck `position: relative` overrides.
//
// Written as a plain JS source string, not a real TS function, and
// injected via page.evaluate(INSTALL_SCRIPT) rather than
// page.evaluate(installStitchChrome): a function defined in this module
// gets compiled by esbuild (tsx's transpiler), which wraps nested named
// functions in a `__name(fn, "name")` call for name preservation — that
// helper lives in the compiled module, not in the function's own source,
// so `fn.toString()` (how Playwright serializes a function into the page)
// ships a reference to a helper that doesn't exist there. A string is
// never compiled, so it has no such reference to begin with.
const INSTALL_SCRIPT = `
(function () {
  var w = window;
  if (w.__stitchChrome) return;

  var state = {
    domDirty: true,
    stickyDirty: true,
    knownChrome: [],
    unstuck: [],
    frozenTransforms: new Map(),
    frozenOverrides: [],
  };

  var observer = new MutationObserver(function (mutations) {
    if (state.domDirty && state.stickyDirty) return;
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (state.knownChrome.some(function (h) { return h.el === m.target; })) continue;
      if (m.type === "childList") {
        state.domDirty = true;
        state.stickyDirty = true;
      } else {
        if (m.attributeName === "style") state.stickyDirty = true;
        var cs = getComputedStyle(m.target);
        if (cs.position === "fixed" || cs.position === "sticky") {
          state.domDirty = true;
          state.stickyDirty = true;
        }
      }
      if (state.domDirty && state.stickyDirty) break;
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  function collectAll(root, out) {
    var all = root.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      out.push(el);
      if (el.shadowRoot) collectAll(el.shadowRoot, out);
    }
    return out;
  }

  function setOverride(list, el, prop, value) {
    list.push({ el: el, prop: prop, prevValue: el.style.getPropertyValue(prop) });
    el.style.setProperty(prop, value, "important");
  }

  // Large sticky sections -> normal flow, plus freezing any element whose
  // inline transform is actively being live-driven (a scroll-linked
  // parallax effect). Small chrome-shaped sticky elements are left for
  // setChromeHidden, which already handles "show once on slice 1" for
  // both fixed and sticky chrome.
  function unstickLargeElements() {
    if (!state.stickyDirty) return;
    state.stickyDirty = false;

    var viewportHeight = window.innerHeight;
    var viewportWidth = window.innerWidth;
    var barMaxHeightFraction = 0.35;
    var barMinWidthFraction = 0.8;
    var widgetMaxWidthFraction = 0.3;
    var widgetMaxHeightFraction = 0.2;
    var cornerZoneFraction = 0.3;

    function isCornerWidget(rect) {
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (rect.width > viewportWidth * widgetMaxWidthFraction) return false;
      if (rect.height > viewportHeight * widgetMaxHeightFraction) return false;
      var nearTop = rect.top < viewportHeight * cornerZoneFraction;
      var nearBottom = rect.bottom > viewportHeight * (1 - cornerZoneFraction);
      var nearLeft = rect.left < viewportWidth * cornerZoneFraction;
      var nearRight = rect.right > viewportWidth * (1 - cornerZoneFraction);
      return (nearTop || nearBottom) && (nearLeft || nearRight);
    }

    var all = collectAll(document.body, []);
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var cs = getComputedStyle(el);

      if (cs.position === "sticky" && !state.unstuck.some(function (u) { return u.el === el; })) {
        var rect = el.getBoundingClientRect();
        var isBar = rect.height > 0 && rect.height <= viewportHeight * barMaxHeightFraction && rect.width >= viewportWidth * barMinWidthFraction;
        var isWidget = isCornerWidget(rect);
        if (!isBar && !isWidget) {
          ["position", "top", "left", "right", "bottom"].forEach(function (prop) {
            setOverride(state.unstuck, el, prop, prop === "position" ? "relative" : "auto");
          });
        }
      }

      if (cs.transform !== "none" && !state.frozenTransforms.has(el)) {
        var prevSeen = state.frozenTransforms.get(el);
        state.frozenTransforms.set(el, cs.transform);
        if (prevSeen !== undefined && prevSeen !== cs.transform) {
          setOverride(state.frozenOverrides, el, "transform", "none");
        }
      }
    }
  }

  // Hides small persistent chrome (nav bar, sticky/fixed footer strip,
  // floating "book a tour"/chat corner widgets) after the first slice, so
  // it isn't redrawn at the same spot on every slice. Shown again
  // (reverted) on the first slice so the capture still reflects what a
  // visitor actually sees on load. Returns whether anything was newly
  // hidden, so the caller can give the page a moment to repaint.
  function setChromeHidden(hidden) {
    // Known chrome (found on a previous call) is always shown then
    // re-hidden here, every call, regardless of domDirty — only the scan
    // for NEW chrome below is gated by domDirty. Getting this backwards
    // (clearing the known list instead of persisting it) means anything
    // found once only stays hidden on slices where something new happens
    // to mutate the DOM at the same time, and reappears on every other
    // slice — exactly the repeat bug this function exists to prevent.
    state.knownChrome.forEach(function (h) {
      if (h.prevValue) h.el.style.setProperty("visibility", h.prevValue);
      else h.el.style.removeProperty("visibility");
    });

    if (!hidden) return false;

    state.knownChrome.forEach(function (h) {
      h.el.style.setProperty("visibility", "hidden", "important");
    });

    if (!state.domDirty) return false;
    state.domDirty = false;

    var viewportHeight = window.innerHeight;
    var viewportWidth = window.innerWidth;
    var barMaxHeightFraction = 0.35;
    var barMinWidthFraction = 0.8;
    var widgetMaxWidthFraction = 0.3;
    var widgetMaxHeightFraction = 0.2;
    var cornerZoneFraction = 0.3;

    function isCornerWidget(rect) {
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (rect.width > viewportWidth * widgetMaxWidthFraction) return false;
      if (rect.height > viewportHeight * widgetMaxHeightFraction) return false;
      var nearTop = rect.top < viewportHeight * cornerZoneFraction;
      var nearBottom = rect.bottom > viewportHeight * (1 - cornerZoneFraction);
      var nearLeft = rect.left < viewportWidth * cornerZoneFraction;
      var nearRight = rect.right > viewportWidth * (1 - cornerZoneFraction);
      return (nearTop || nearBottom) && (nearLeft || nearRight);
    }

    var hidSomethingNew = false;
    var all = collectAll(document.body, []);
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (state.knownChrome.some(function (h) { return h.el === el; })) continue;
      var cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      if (cs.visibility === "hidden") continue;

      var rect = el.getBoundingClientRect();
      var isBar = rect.height > 0 && rect.height <= viewportHeight * barMaxHeightFraction && rect.width >= viewportWidth * barMinWidthFraction;
      var isWidget = isCornerWidget(rect);

      if (isBar || isWidget) {
        setOverride(state.knownChrome, el, "visibility", "hidden");
        hidSomethingNew = true;
      }
    }
    return hidSomethingNew;
  }

  function restore() {
    observer.disconnect();
    [state.knownChrome, state.unstuck, state.frozenOverrides].forEach(function (list) {
      list.forEach(function (entry) {
        if (entry.prevValue) entry.el.style.setProperty(entry.prop, entry.prevValue);
        else entry.el.style.removeProperty(entry.prop);
      });
    });
    delete w.__stitchChrome;
  }

  function measureHeight() {
    var de = document.documentElement;
    var body = document.body;
    return Math.max(de.scrollHeight, body ? body.scrollHeight : 0, de.offsetHeight, body ? body.offsetHeight : 0);
  }

  // Scrolls, then polls scrollHeight until it stops changing for
  // stableForMs (or maxWaitMs elapses) instead of a flat sleep, so a
  // widget that's still fetching or a layout shift that's still resolving
  // gets real time to settle without paying a fixed worst-case delay on
  // every slice of every page regardless of whether anything is happening.
  function scrollAndWaitStable(y, stableForMs, maxWaitMs) {
    window.scrollTo(0, y);
    return new Promise(function (resolve) {
      var start = Date.now();
      var lastHeight = measureHeight();
      var lastChangeAt = start;
      function check() {
        var now = Date.now();
        var height = measureHeight();
        if (height !== lastHeight) {
          lastHeight = height;
          lastChangeAt = now;
        }
        var isStable = now - lastChangeAt >= stableForMs;
        var timedOut = now - start >= maxWaitMs;
        if (isStable || timedOut) {
          resolve({ totalHeight: lastHeight, viewportHeight: window.innerHeight });
        } else {
          setTimeout(check, 50);
        }
      }
      check();
    });
  }

  w.__stitchChrome = {
    unstickLargeElements: unstickLargeElements,
    setChromeHidden: setChromeHidden,
    restore: restore,
    scrollAndWaitStable: scrollAndWaitStable,
    measureHeight: measureHeight,
  };
})();
`;

export async function prepareStitchChrome(page: Page): Promise<void> {
  await page.evaluate(INSTALL_SCRIPT);
  await page.evaluate(() => (window as any).__stitchChrome.unstickLargeElements());
}

export async function scrollAndWaitStable(page: Page, y: number, stableForMs: number, maxWaitMs: number): Promise<{ totalHeight: number; viewportHeight: number }> {
  return page.evaluate(
    ([y, stableForMs, maxWaitMs]) => (window as any).__stitchChrome.scrollAndWaitStable(y, stableForMs, maxWaitMs),
    [y, stableForMs, maxWaitMs] as [number, number, number],
  );
}

// Returns whether this call hid something for the first time (a settle
// repaint is worth waiting for only then), and also re-checks large sticky
// elements every call — cheap no-op via its own dirty flag when nothing
// relevant has changed since the last check, but needed every slice to
// catch anything that mounts or turns fixed/sticky later (a client-rendered
// widget gated behind its own data fetch).
export async function settleChromeForSlice(page: Page, hideChrome: boolean): Promise<boolean> {
  const justHidChrome = await page.evaluate((hidden) => (window as any).__stitchChrome.setChromeHidden(hidden), hideChrome);
  await page.evaluate(() => (window as any).__stitchChrome.unstickLargeElements());
  return justHidChrome;
}

// Must run before anything else re-reads the DOM (page.content() for
// page.html, in crawl.ts) — see the module comment above for why.
export async function restoreStitchChrome(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as any;
    if (w.__stitchChrome) w.__stitchChrome.restore();
  });
}
