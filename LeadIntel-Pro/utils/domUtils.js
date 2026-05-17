export function safeQuerySelector(
  selector,
  parent = document
) {

  try {

    return parent.querySelector(selector);

  } catch (error) {

    console.warn(
      `Invalid selector: ${selector}`,
      error
    );

    return null;
  }
}

export function safeQuerySelectorAll(
  selector,
  parent = document
) {

  try {

    return [...parent.querySelectorAll(selector)];

  } catch (error) {

    console.warn(
      `Invalid selector: ${selector}`,
      error
    );

    return [];
  }
}

export function getCleanText(element) {

  if (!element) {
    return "";
  }

  return element.textContent
    .replace(/\s+/g, " ")
    .trim();
}

export function elementExists(selector) {

  return Boolean(
    safeQuerySelector(selector)
  );
}

export function wait(ms = 1000) {

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitForElement(
  selector,
  timeout = 10000
) {

  return new Promise((resolve) => {

    const existing =
      safeQuerySelector(selector);

    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {

      const element =
        safeQuerySelector(selector);

      if (element) {

        observer.disconnect();

        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {

      observer.disconnect();

      resolve(null);

    }, timeout);
  });
}

export function normalizeLinkedInUrl(url = "") {

  try {

    const parsed = new URL(url);

    parsed.search = "";
    parsed.hash = "";

    let cleanUrl = parsed.toString();

    cleanUrl = cleanUrl
      .replace(/\/$/, "");

    return cleanUrl.toLowerCase();

  } catch {

    return url.trim().toLowerCase();
  }
}

export function isLinkedInProfileUrl(url = "") {

  return /linkedin\.com\/in\//i.test(url);
}

export function createSafeId(value = "") {

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function debounce(callback, delay = 300) {

  let timeout;

  return (...args) => {

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export function throttle(callback, limit = 1000) {

  let waiting = false;

  return (...args) => {

    if (waiting) {
      return;
    }

    callback(...args);

    waiting = true;

    setTimeout(() => {
      waiting = false;
    }, limit);
  };
}