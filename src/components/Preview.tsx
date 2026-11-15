import { useMemo, useState } from 'react';
import { className, toCss } from '../lib/css';
import type { Style } from '../types';

const VIEWPORTS = { mobile: ['모바일', 375], tablet: ['태블릿', 768], desktop: ['데스크톱', 1200] } as const;
type Viewport = keyof typeof VIEWPORTS;

/**
 * 생성한 CSS를 그대로 <style>로 넣어 실제 결과를 보여준다.
 * 미리보기 틀은 container 쿼리를 쓰므로, 창 크기를 바꾸지 않아도 틀 폭만으로 반응형 동작을 확인할 수 있다.
 */
export function Preview({ style: s }: { style: Style }) {
  const [vp, setVp] = useState<Viewport>('desktop');
  const [dark, setDark] = useState(false);
  const css = useMemo(() => toCss(s, 'container'), [s]);
  const cls = className(s);
  const icon = s.icon ? <span className="icon" aria-hidden="true" /> : null;

  return (
    <section className="preview" aria-label="미리보기">
      <div className="preview-bar">
        <div className="segmented" role="radiogroup" aria-label="화면 크기">
          {(Object.keys(VIEWPORTS) as Viewport[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={vp === k} className={vp === k ? 'on' : ''} onClick={() => setVp(k)}>
              {VIEWPORTS[k][0]}
            </button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
          <span>어두운 배경</span>
        </label>
      </div>

      <div className={`stage ${dark ? 'dark' : ''}`}>
        <div className="frame" style={{ maxWidth: VIEWPORTS[vp][1] }}>
          <style>{css}</style>
          <span className="frame-width">{VIEWPORTS[vp][1]}px</span>
          {s.kind === 'button' ? (
            <button type="button" className={cls}>
              {icon}
              {s.text}
            </button>
          ) : (
            <article className={cls}>
              {icon}
              <h3>{s.text}</h3>
              <p>{s.body}</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
