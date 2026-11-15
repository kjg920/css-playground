import { useEffect, useMemo, useState } from 'react';
import { fontImport, toCss, toHtml } from '../lib/css';
import type { Style } from '../types';

type Tab = 'css' | 'html';

export function CodeView({ style }: { style: Style }) {
  const [tab, setTab] = useState<Tab>('css');
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => (tab === 'css' ? fontImport(style) + toCss(style) : toHtml(style)), [style, tab]);

  // '복사됨' 표시는 잠깐만 보여준다. 다시 누르거나 화면을 떠나면 타이머를 정리한다
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      alert('복사하지 못했어요. 코드를 직접 선택해서 복사해 주세요.');
    }
  };

  return (
    <section className="code" aria-label="생성된 코드">
      <div className="code-bar">
        <div className="segmented small" role="tablist">
          {(['css', 'html'] as Tab[]).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <button type="button" onClick={copy}>
          {copied ? '복사됨 ✓' : '코드 복사'}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </section>
  );
}
