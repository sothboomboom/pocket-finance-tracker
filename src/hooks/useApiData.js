import { useCallback, useEffect, useState } from 'react';

/**
 * Loads data whenever `deps` change. status: 'loading' | 'success' | 'error'.
 * keepPrevious keeps old data on screen (isRefreshing) instead of flashing a skeleton.
 * Outdated requests are aborted, so a slow response can't overwrite a newer one.
 */
export function useApiData(loader, deps, { keepPrevious = false } = {}) {
  const depsKey = JSON.stringify(deps);
  const [state, setState] = useState({ key: null, data: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loader({ signal: controller.signal })
      .then((data) => setState({ key: depsKey, data, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        // A failed reload keeps the data already on screen.
        setState((prev) => ({ key: depsKey, data: prev.key === depsKey ? prev.data : null, error }));
      });
    return () => controller.abort();
    // `loader` is a new function every render; depsKey already tracks what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const isCurrent = state.key === depsKey;
  const showPrevious = !isCurrent && keepPrevious && state.data !== null;
  const data = isCurrent || showPrevious ? state.data : null;
  let status = 'loading';
  if (isCurrent) status = data !== null ? 'success' : 'error';
  if (showPrevious) status = 'success';

  return { data, status, error: isCurrent ? state.error : null, reload, isRefreshing: showPrevious };
}
