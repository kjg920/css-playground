import { useRef } from 'react';
import { contrast } from '../lib/css';
import type { Hover, Kind, Style } from '../types';
import { ColorField, Section, Segmented, Slider, Toggle } from './Field';
import { FontPicker } from './FontPicker';
import { IconPicker } from './IconPicker';
import { PalettePicker } from './PalettePicker';

type Update = (patch: Partial<Style>) => void;

const KINDS: Record<Kind, string> = { button: '버튼', card: '카드' };
const HOVERS: Record<Hover, string> = { none: '없음', lift: '떠오름', grow: '커짐', glow: '빛남', dim: '어둡게' };

/**
 * 키마다 한 번만 만든 setter를 돌려준다.
 * 매 렌더마다 새 함수를 넘기면 memo로 감싼 입력 줄이 전부 다시 그려지기 때문이다.
 */
function useSetters(update: Update) {
  const ref = useRef({ update, cache: new Map<string, (v: never) => void>() });
  ref.current.update = update;
  return <K extends keyof Style>(k: K): ((v: Style[K]) => void) => {
    const { cache } = ref.current;
    let fn = cache.get(k);
    if (!fn) {
      fn = (v: never) => ref.current.update({ [k]: v });
      cache.set(k, fn);
    }
    return fn as (v: Style[K]) => void;
  };
}

export function Controls({ style: s, update }: { style: Style; update: Update }) {
  const set = useSetters(update);
  const ratio = contrast(s);
  const grade = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA 큰 글자만' : '부족';
  const isCard = s.kind === 'card';

  return (
    <div className="controls">
      <Segmented label="종류" value={s.kind} options={KINDS} onChange={set('kind')} />

      <Section title="내용">
        <div className="field">
          <label htmlFor="txt">{isCard ? '제목' : '글자'}</label>
          <input id="txt" value={s.text} maxLength={40} onChange={(e) => update({ text: e.target.value })} />
        </div>
        {isCard && (
          <div className="field">
            <label htmlFor="body">본문</label>
            <textarea id="body" rows={3} value={s.body} maxLength={200} onChange={(e) => update({ body: e.target.value })} />
          </div>
        )}
      </Section>

      <Section title="색">
        <ColorField label="배경" value={s.bg} onChange={set('bg')} />
        <Toggle label="그라디언트" value={s.gradient} onChange={set('gradient')} />
        {s.gradient && (
          <>
            <ColorField label="그라디언트 끝" value={s.bg2} onChange={set('bg2')} />
            <Slider label="각도" value={s.angle} min={0} max={360} step={5} unit="°" onChange={set('angle')} />
          </>
        )}
        <ColorField label="글자" value={s.fg} onChange={set('fg')} />
        <p className={`contrast ${ratio < 4.5 ? 'bad' : ''}`} role="status">
          명도 대비 {ratio.toFixed(2)} : 1 · {grade}
        </p>
      </Section>

      <Section title="배색 추천 (The Color API)" open={false}>
        <PalettePicker base={s.bg} onPick={(k, hex) => update(k === 'bg2' ? { bg2: hex, gradient: true } : { [k]: hex })} />
      </Section>

      <Section title="모양">
        <Slider label="둥근 모서리" value={s.radius} min={0} max={40} unit="px" onChange={set('radius')} />
        <Slider label="가로 여백" value={s.padX} min={0} max={64} unit="px" onChange={set('padX')} />
        <Slider label="세로 여백" value={s.padY} min={0} max={48} unit="px" onChange={set('padY')} />
        <Slider label="테두리 두께" value={s.borderWidth} min={0} max={8} unit="px" onChange={set('borderWidth')} />
        {s.borderWidth > 0 && <ColorField label="테두리 색" value={s.border} onChange={set('border')} />}
        <Slider label="그림자" value={s.shadow} min={0} max={5} onChange={set('shadow')} />
        {isCard && <Slider label="최대 너비" value={s.width} min={200} max={600} step={10} unit="px" onChange={set('width')} />}
      </Section>

      <Section title="글자">
        <Slider label="크기" value={s.fontSize} min={10} max={32} unit="px" onChange={set('fontSize')} />
        <Slider label="굵기" value={s.fontWeight} min={100} max={900} step={100} onChange={set('fontWeight')} />
      </Section>

      <Section title="글꼴 (Fontsource)" open={false}>
        <FontPicker value={s.font} onChange={set('font')} />
      </Section>

      <Section title="아이콘 (Iconify)" open={false}>
        <IconPicker value={s.icon} onChange={set('icon')} />
      </Section>

      <Section title="동작 · 반응형">
        <Segmented label="마우스를 올리면" value={s.hover} options={HOVERS} onChange={set('hover')} />
        <Toggle label="모바일(480px 이하)에서 꽉 채우기" value={s.fullOnMobile} onChange={set('fullOnMobile')} />
      </Section>
    </div>
  );
}
