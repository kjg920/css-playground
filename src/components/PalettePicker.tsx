import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { SCHEME_MODES, schemeUrl, type Scheme, type SchemeMode } from '../lib/api';
import type { Style } from '../types';

type Target = Extract<keyof Style, 'bg' | 'bg2' | 'fg' | 'border'>;
const TARGETS: Record<Target, string> = { bg: '배경', bg2: '그라디언트 끝', fg: '글자', border: '테두리' };

/** The Color API로 현재 배경색에 어울리는 배색을 받아서 원하는 자리에 적용한다. */
export function PalettePicker({ base, onPick }: { base: string; onPick: (k: Target, hex: string) => void }) {
  const [mode, setMode] = useState<SchemeMode>('analogic');
  const [target, setTarget] = useState<Target>('bg2');
  // 기준색은 버튼을 눌렀을 때만 확정해서, 색을 고르는 동안 요청이 쏟아지지 않게 한다
  const [requested, setRequested] = useState<string | null>(null);
  const { data, error, loading } = useFetch<Scheme>(requested);

  return (
    <div className="picker">
      <div className="picker-head">
        <select value={mode} onChange={(e) => setMode(e.target.value as SchemeMode)} aria-label="배색 방식">
          {Object.entries(SCHEME_MODES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setRequested(schemeUrl(base, mode))} disabled={loading}>
          {loading ? '불러오는 중…' : '배색 추천'}
        </button>
      </div>
      {error && <p className="error">배색을 불러오지 못했어요 ({error})</p>}
      {data && (
        <>
          <div className="segmented small" role="radiogroup" aria-label="적용할 곳">
            {(Object.keys(TARGETS) as Target[]).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={target === k}
                className={target === k ? 'on' : ''}
                onClick={() => setTarget(k)}
              >
                {TARGETS[k]}
              </button>
            ))}
          </div>
          <div className="swatches">
            {data.colors.map((c, i) => (
              <button
                key={i}
                type="button"
                className="swatch"
                style={{ background: c.hex.value }}
                title={`${c.name.value} ${c.hex.value}`}
                aria-label={`${c.name.value} ${c.hex.value}을 ${TARGETS[target]}에 적용`}
                onClick={() => onPick(target, c.hex.value.toLowerCase())}
              />
            ))}
          </div>
          <p className="hint">색을 누르면 {TARGETS[target]}에 적용돼요.</p>
        </>
      )}
    </div>
  );
}
