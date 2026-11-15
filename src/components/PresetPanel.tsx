import { memo, useDeferredValue, useMemo, useState, type FormEvent } from 'react';
import { toCss } from '../lib/css';
import type { Preset, Style } from '../types';

interface Props {
  presets: Preset[];
  activeId: string | null;
  onCreate: (name: string, tags: string[]) => void;
  onUpdate: (id: string, patch: Partial<Pick<Preset, 'name' | 'tags' | 'fav'>>, withStyle: boolean) => void;
  onDelete: (id: string) => void;
  onLoad: (p: Preset) => void;
}

const parseTags = (t: string) => [...new Set(t.split(/[,\s#]+/).map((x) => x.trim()).filter(Boolean))].slice(0, 6);

/** 저장한 스타일의 등록·수정·삭제·검색. */
export function PresetPanel({ presets, activeId, onCreate, onUpdate, onDelete, onLoad }: Props) {
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const q = useDeferredValue(query.trim().toLowerCase());

  const shown = useMemo(
    () =>
      presets
        .filter((p) => (!favOnly || p.fav) && (!q || p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))))
        .sort((a, b) => Number(b.fav) - Number(a.fav) || b.updatedAt - a.updatedAt),
    [presets, q, favOnly],
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    onCreate(n, parseTags(tags));
    setName('');
    setTags('');
  };

  return (
    <section className="presets" aria-label="내 프리셋">
      <form className="preset-form" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 (예: 메인 CTA)" maxLength={30} aria-label="프리셋 이름" required />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="태그 (쉼표로 구분)" aria-label="태그" />
        <button type="submit">현재 스타일 저장</button>
      </form>

      <div className="preset-search">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름·태그 검색" aria-label="프리셋 검색" />
        <label className="toggle">
          <input type="checkbox" checked={favOnly} onChange={(e) => setFavOnly(e.target.checked)} />
          <span>★만</span>
        </label>
      </div>

      {shown.length === 0 && <p className="hint">{presets.length ? '검색 결과가 없어요.' : '저장한 프리셋이 없어요.'}</p>}

      <ul className="preset-list">
        {shown.map((p) =>
          editing === p.id ? (
            <EditRow
              key={p.id}
              preset={p}
              onSave={(n, t, withStyle) => {
                onUpdate(p.id, { name: n, tags: t }, withStyle);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <li key={p.id} className={p.id === activeId ? 'active' : ''}>
              <button type="button" className="preset-main" onClick={() => onLoad(p)} title="불러오기">
                <Thumb style={p.style} />
                <span className="preset-meta">
                  <strong>{p.name}</strong>
                  <small>{p.tags.map((t) => `#${t}`).join(' ') || (p.style.kind === 'button' ? '버튼' : '카드')}</small>
                </span>
              </button>
              <div className="preset-actions">
                <button type="button" className="icon-btn" aria-label={p.fav ? '즐겨찾기 해제' : '즐겨찾기'} aria-pressed={p.fav} onClick={() => onUpdate(p.id, { fav: !p.fav }, false)}>
                  {p.fav ? '★' : '☆'}
                </button>
                <button type="button" className="icon-btn" aria-label="수정" onClick={() => setEditing(p.id)}>
                  ✎
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  aria-label="삭제"
                  onClick={() => confirm(`'${p.name}'을(를) 삭제할까요?`) && onDelete(p.id)}
                >
                  ✕
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function EditRow({ preset, onSave, onCancel }: { preset: Preset; onSave: (name: string, tags: string[], withStyle: boolean) => void; onCancel: () => void }) {
  const [name, setName] = useState(preset.name);
  const [tags, setTags] = useState(preset.tags.join(', '));
  const [withStyle, setWithStyle] = useState(false);
  return (
    <li className="editing">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave(name.trim(), parseTags(tags), withStyle);
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} aria-label="이름" autoFocus required />
        <input value={tags} onChange={(e) => setTags(e.target.value)} aria-label="태그" placeholder="태그" />
        <label className="toggle">
          <input type="checkbox" checked={withStyle} onChange={(e) => setWithStyle(e.target.checked)} />
          <span>지금 편집 중인 스타일로 덮어쓰기</span>
        </label>
        <div className="row">
          <button type="submit">저장</button>
          <button type="button" className="ghost" onClick={onCancel}>
            취소
          </button>
        </div>
      </form>
    </li>
  );
}

/**
 * 프리셋 미리보기 썸네일. 진짜 CSS를 쓰되 클래스 이름이 겹치지 않도록 프리셋마다 고유 접두어로 감싼다.
 * memo로 감싸서 스타일이 바뀐 프리셋만 다시 그린다.
 */
let thumbSeq = 0;

const Thumb = memo(function Thumb({ style }: { style: Style }) {
  const [scope] = useState(() => `t${++thumbSeq}`);
  const css = useMemo(() => {
    const mini: Style = { ...style, kind: 'button', hover: 'none', fullOnMobile: false, padX: 8, padY: 4, fontSize: 12, shadow: Math.min(style.shadow, 2) };
    return toCss(mini).replace(/\.my-button/g, `.${scope} .my-button`);
  }, [style, scope]);
  return (
    <span className={`thumb ${scope}`} aria-hidden="true">
      <style>{css}</style>
      <span className="my-button">{style.icon ? <span className="icon" /> : 'Aa'}</span>
    </span>
  );
});
