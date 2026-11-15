import { useDeferredValue, useMemo, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { fontListUrl, type FontMeta } from '../lib/api';
import type { Font } from '../types';

const SHOWN = 40;

/** Fontsource API에서 웹폰트 목록을 받아 검색하고 고른다. 목록은 한 번만 받고 검색은 브라우저에서 한다. */
export function FontPicker({ value, onChange }: { value: Font | null; onChange: (f: Font | null) => void }) {
  const [koreanOnly, setKoreanOnly] = useState(true);
  const [query, setQuery] = useState('');
  const q = useDeferredValue(query.trim().toLowerCase());
  const { data, error, loading } = useFetch<FontMeta[]>(fontListUrl(koreanOnly));

  const matches = useMemo(() => {
    if (!data) return [];
    const list = q ? data.filter((f) => f.family.toLowerCase().includes(q)) : data;
    return list.slice(0, SHOWN);
  }, [data, q]);

  return (
    <div className="picker">
      <div className="picker-head">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="글꼴 이름 검색"
          aria-label="글꼴 검색"
        />
        <button type="button" className="ghost" onClick={() => onChange(null)} disabled={!value}>
          기본
        </button>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={koreanOnly} onChange={(e) => setKoreanOnly(e.target.checked)} />
        <span>한글 지원 글꼴만</span>
      </label>
      {error && <p className="error">글꼴 목록을 불러오지 못했어요 ({error})</p>}
      {loading && <p className="hint">목록 불러오는 중…</p>}
      <ul className="font-list">
        {matches.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              aria-pressed={value?.id === f.id}
              className={value?.id === f.id ? 'on' : ''}
              onClick={() => onChange({ id: f.id, family: f.family, weights: f.weights })}
            >
              <span>{f.family}</span>
              <small>{f.category}</small>
            </button>
          </li>
        ))}
      </ul>
      {data && <p className="hint">{data.length}개 중 {matches.length}개 표시</p>}
    </div>
  );
}
