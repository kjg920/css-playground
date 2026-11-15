import { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { iconSearchUrl, type IconSearch } from '../lib/api';
import { iconUrl } from '../lib/css';

/** Iconify API로 아이콘을 검색해서 버튼·카드에 넣는다. */
export function IconPicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [query, setQuery] = useState('arrow');
  const q = useDebounce(query.trim(), 350);
  const { data, error, loading } = useFetch<IconSearch>(q.length >= 2 ? iconSearchUrl(q) : null);

  return (
    <div className="picker">
      <div className="picker-head">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="영어로 검색 (예: heart, cart)"
          aria-label="아이콘 검색"
        />
        <button type="button" className="ghost" onClick={() => onChange(null)} disabled={!value}>
          없음
        </button>
      </div>
      {value && <p className="hint">선택됨: {value}</p>}
      {error && <p className="error">아이콘을 불러오지 못했어요 ({error})</p>}
      {loading && !data && <p className="hint">검색 중…</p>}
      {data && data.icons.length === 0 && <p className="hint">결과가 없어요. 다른 영어 단어로 찾아보세요.</p>}
      <div className="icon-grid" aria-busy={loading}>
        {data?.icons.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={name}
            aria-pressed={value === name}
            className={value === name ? 'on' : ''}
            onClick={() => onChange(name)}
          >
            <span className="mask-icon" style={{ maskImage: `url(${iconUrl(name)})` }} />
          </button>
        ))}
      </div>
    </div>
  );
}
