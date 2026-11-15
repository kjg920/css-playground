import { useEffect, useState } from 'react';

/**
 * useState와 같지만 값이 바뀌면 localStorage에 저장한다.
 * revive는 저장소에서 읽은 값을 검사·보정한다. 저장소가 손상되었거나 막혀도 앱은 초기값으로 계속 동작한다.
 */
export function useLocalStorage<T>(key: string, initial: () => T, revive: (raw: unknown) => T = (v) => v as T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return revive(JSON.parse(raw));
    } catch {
      /* 읽기 실패 시 초기값 */
    }
    return initial();
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* 용량 초과나 접근 거부는 무시한다 */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
