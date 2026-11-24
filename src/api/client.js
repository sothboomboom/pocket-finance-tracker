// Fake network layer: calls src/mock/ (our pretend server) as if it were a real API.
// Components never use it directly; they go through hooks in src/hooks/.

// Long enough for loading skeletons and spinners to appear, short enough not to feel slow.
const FAKE_LATENCY_MS = 250;

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }

  /** Field errors, e.g. { amount: 'Amount must be more than 0' } */
  get fieldErrors() {
    return this.details?.fieldErrors ?? {};
  }
}

function abortError() {
  return new DOMException('The request was aborted', 'AbortError');
}

/** Resolves after `ms`, or rejects early if `signal` aborts (a newer request replaced this one). */
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const timeoutId = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        reject(abortError());
      },
      { once: true },
    );
  });
}

/**
 * Runs a mock function after a fake delay, like an HTTP call.
 * The result is deep-copied so a component can't change the stored data by accident.
 */
export async function request(handler, { signal } = {}) {
  await wait(FAKE_LATENCY_MS, signal);
  const result = await handler();
  return result === undefined ? null : structuredClone(result);
}
