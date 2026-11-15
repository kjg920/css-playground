import { useEffect, useState } from 'react';

/** 값이 delay 동안 바뀌지 않을 때만 갱신된 값을 돌려준다. 검색어 입력마다 API를 부르지 않기 위해 쓴다. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
