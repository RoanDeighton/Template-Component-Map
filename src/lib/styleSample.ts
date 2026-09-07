import { Page } from "playwright";

export interface StyleSample {
  path: string; // index-path selector, e.g. "main>2" (2nd direct child of main)
  tag: string;
  classes: string;
  backgroundColor: string;
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  paddingTop: string;
  paddingBottom: string;
  marginTop: string;
  marginBottom: string;
  top: number;
  width: number;
  height: number;
}

/**
 * Samples resolved (actual, cascade-applied) computed styles for the page's
 * top-level structural sections: header/nav, each direct child of <main>
 * (or <body> if no <main>), and footer. This is how we get real spacing/
 * color/typography values instead of estimating them from a screenshot.
 */
// NOTE: this evaluate callback is serialized and re-run inside the page's
// own JS context, which has none of the Node/esbuild runtime around it. Any
// *named* function/const-arrow declared inside it trips esbuild's dev helper
// injection (a `__name(fn, "fn")` call referencing a helper that only exists
// in the original bundle) once Playwright extracts just this one function's
// source and re-evaluates it standalone in the browser. So: gather the
// target elements first, then build entries with a single unnamed arrow
// passed directly to .map(), never assigned to a name of its own.
export async function sampleStyles(page: Page): Promise<StyleSample[]> {
  return page.evaluate(() => {
    const targets: { el: Element; path: string }[] = [];
    const header = document.querySelector("header");
    if (header) targets.push({ el: header, path: "header" });

    const main = document.querySelector("main") || document.body;
    Array.from(main.children).forEach((child, i) => {
      if (child.tagName === "SCRIPT" || child.tagName === "STYLE") return;
      targets.push({ el: child, path: `main>${i}` });
    });

    const footer = document.querySelector("footer");
    if (footer) targets.push({ el: footer, path: "footer" });

    return targets.map((t) => {
      const cs = getComputedStyle(t.el);
      const rect = t.el.getBoundingClientRect();
      return {
        path: t.path,
        tag: t.el.tagName.toLowerCase(),
        classes: (t.el.getAttribute("class") || "").trim(),
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
  });
}
