import { useCallback, useEffect, useState } from 'react';
import { CodeView } from './components/CodeView';
import { Controls } from './components/Controls';
import { PresetPanel } from './components/PresetPanel';
import { Preview } from './components/Preview';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fontCssUrl, nearestWeight } from './lib/css';
import { SEED_PRESETS } from './lib/seed';
import { encodeStyle, readHash, sanitize } from './lib/share';
import { DEFAULT_STYLE, type Preset, type Style } from './types';

type Pane = 'edit' | 'preview' | 'saved';
const PANES: Record<Pane, string> = { edit: '편집', preview: '미리보기·코드', saved: '내 프리셋' };

/** 저장소의 프리셋 목록을 검사한다. 모양이 틀린 항목은 버리고 스타일은 보정한다. */
const revivePresets = (raw: unknown): Preset[] =>
  Array.isArray(raw)
    ? raw
        .filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string')
        .map((p) => ({
          id: p.id,
          name: p.name,
          tags: Array.isArray(p.tags) ? p.tags.filter((t: unknown) => typeof t === 'string') : [],
          fav: p.fav === true,
          style: sanitize(p.style),
          updatedAt: Number(p.updatedAt) || 0,
        }))
    : SEED_PRESETS;

const newId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function App() {
  const [style, setStyle] = useLocalStorage<Style>('pg:style', () => DEFAULT_STYLE, sanitize);
  const [presets, setPresets] = useLocalStorage<Preset[]>('pg:presets', () => SEED_PRESETS, revivePresets);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pane, setPane] = useState<Pane>('edit');
  const [toast, setToast] = useState<string | null>(null);

  // 공유 링크로 들어왔으면 링크의 스타일이 마지막 작업보다 우선한다. 적용 후 주소는 깨끗하게 돌려놓는다.
  useEffect(() => {
    const shared = readHash();
    if (!shared) return;
    setStyle(shared);
    history.replaceState(null, '', location.pathname);
    setToast('공유받은 스타일을 불러왔어요');
  }, [setStyle]);

  // 고른 글꼴의 CSS만 필요할 때 한 번 붙인다. 같은 파일은 다시 붙이지 않는다.
  const fontId = style.font?.id;
  const fontWeight = style.font ? nearestWeight(style.font.weights, style.fontWeight) : 0;
  useEffect(() => {
    if (!fontId) return;
    const href = fontCssUrl(fontId, fontWeight);
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [fontId, fontWeight]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const update = useCallback((patch: Partial<Style>) => setStyle((s) => ({ ...s, ...patch })), [setStyle]);

  const create = (name: string, tags: string[]) => {
    const p: Preset = { id: newId(), name, tags, fav: false, style, updatedAt: Date.now() };
    setPresets((ps) => [p, ...ps]);
    setActiveId(p.id);
    setToast(`'${name}' 저장했어요`);
  };

  const updatePreset = (id: string, patch: Partial<Pick<Preset, 'name' | 'tags' | 'fav'>>, withStyle: boolean) =>
    setPresets((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch, ...(withStyle && { style }), updatedAt: Date.now() } : p)));

  const remove = (id: string) => {
    setPresets((ps) => ps.filter((p) => p.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const load = (p: Preset) => {
    setStyle(p.style);
    setActiveId(p.id);
    setPane('edit');
  };

  const share = async () => {
    const url = `${location.origin}${location.pathname}#s=${encodeStyle(style)}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast('공유 링크를 복사했어요');
    } catch {
      prompt('이 링크를 복사하세요', url);
    }
  };

  const reset = () => {
    if (confirm('편집 중인 스타일을 처음 상태로 되돌릴까요?')) {
      setStyle(DEFAULT_STYLE);
      setActiveId(null);
    }
  };

  return (
    <div className="app" data-pane={pane}>
      <header className="topbar">
        <h1>
          <span className="logo" aria-hidden="true" />
          CSS 플레이그라운드
        </h1>
        <div className="row">
          <button type="button" className="ghost" onClick={reset}>
            초기화
          </button>
          <button type="button" onClick={share}>
            공유 링크
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="화면 전환">
        {(Object.keys(PANES) as Pane[]).map((k) => (
          <button key={k} type="button" aria-current={pane === k} className={pane === k ? 'on' : ''} onClick={() => setPane(k)}>
            {PANES[k]}
          </button>
        ))}
      </nav>

      <main className="layout">
        <aside className="pane pane-edit">
          <Controls style={style} update={update} />
        </aside>
        <div className="pane pane-preview">
          <Preview style={style} />
          <CodeView style={style} />
        </div>
        <aside className="pane pane-saved">
          <h2>내 프리셋 ({presets.length})</h2>
          <PresetPanel
            presets={presets}
            activeId={activeId}
            onCreate={create}
            onUpdate={updatePreset}
            onDelete={remove}
            onLoad={load}
          />
        </aside>
      </main>

      <div className="toast" role="status" aria-live="polite" data-show={!!toast}>
        {toast}
      </div>
    </div>
  );
}
