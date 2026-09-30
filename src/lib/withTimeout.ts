// A page whose JS hangs (an infinite loop, a promise that never resolves,
// a detached execution context after an unexpected redirect) can make a
// bare `await` block forever — Playwright's page.evaluate/screenshot calls
// have no built-in timeout of their own. Without a bound, one bad page
// stalls the entire crawl indefinitely instead of failing that one page
// and moving on. Every await on a page's own JS in the capture path should
// go through this rather than a bare `await`.
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
