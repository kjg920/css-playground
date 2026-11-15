import { useEffect, useState } from 'react';

type State<T> = { data: T | null; error: string | null; loading: boolean };

/** 같은 URL은 세션 동안 한 번만 요청한다. 진행 중인 요청도 공유해서 중복 호출을 막는다. */
const cache = new Map<string, Promise<unknown>>();

function load<T>(url: string): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<T>;
    });
    p.catch(() => cache.delete(url)); // 실패한 요청은 다음에 다시 시도할 수 있게 지운다
    cache.set(url, p);
  }
  return p;
}

/** url이 null이면 요청하지 않는다. url이 바뀌면 이전 응답은 버린다. */
export function useFetch<T>(url: string | null): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: false });

  useEffect(() => {
    if (!url) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    let alive = true;
    setState((s) => ({ ...s, error: null, loading: true }));
    load<T>(url).then(
      (data) => alive && setState({ data, error: null, loading: false }),
      (e: Error) => alive && setState({ data: null, error: e.message, loading: false }),
    );
    return () => {
      alive = false;
    };
  }, [url]);

  return state;
}
