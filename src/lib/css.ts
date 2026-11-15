import type { Hover, Style } from '../types';

/** 그림자 단계 0~5. 단계마다 한 번만 만들어 두고 재사용한다. */
const SHADOWS = [
  'none',
  '0 1px 2px rgb(0 0 0 / .12)',
  '0 2px 6px rgb(0 0 0 / .14)',
  '0 6px 16px rgb(0 0 0 / .16)',
  '0 12px 28px rgb(0 0 0 / .2)',
  '0 20px 44px rgb(0 0 0 / .26)',
];

const HOVER: Record<Hover, (s: Style) => string> = {
  none: () => '',
  lift: (s) => `transform: translateY(-2px);\n  box-shadow: ${SHADOWS[Math.min(s.shadow + 1, 5)]};`,
  grow: () => 'transform: scale(1.04);',
  glow: (s) => `box-shadow: 0 0 0 4px ${s.bg}55, ${SHADOWS[s.shadow]};`,
  dim: () => 'filter: brightness(.9);',
};

export const iconUrl = (icon: string) => `https://api.iconify.design/${icon.replace(':', '/')}.svg`;

export const fontCssUrl = (id: string, weight: number) =>
  `https://cdn.jsdelivr.net/npm/@fontsource/${id}/${weight}.css`;

/** 글꼴이 지원하는 굵기 중 원하는 값에 가장 가까운 것을 고른다. */
export const nearestWeight = (weights: number[], want: number) =>
  weights.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a), weights[0] ?? want);

export const className = (s: Style) => (s.kind === 'button' ? 'my-button' : 'my-card');

/**
 * 스타일을 CSS 문자열로 바꾼다.
 * query가 'container'면 미리보기 틀의 폭에 반응하고, 'media'면 실제 화면 폭에 반응한다.
 * 같은 함수가 미리보기와 내보내기 코드를 함께 만들기 때문에 둘이 어긋나지 않는다.
 */
export function toCss(s: Style, query: 'media' | 'container' = 'media'): string {
  const c = `.${className(s)}`;
  const bg = s.gradient ? `linear-gradient(${s.angle}deg, ${s.bg}, ${s.bg2})` : s.bg;
  const isBtn = s.kind === 'button';
  const hover = HOVER[s.hover](s);
  const at = query === 'media' ? '@media' : '@container';

  const rules = [
    isBtn ? 'display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: .5em;' : 'display: flex;\n  flex-direction: column;\n  gap: .6em;',
    isBtn ? '' : `width: 100%;\n  max-width: ${s.width}px;\n  box-sizing: border-box;`,
    `padding: ${s.padY}px ${s.padX}px;`,
    `background: ${bg};`,
    `color: ${s.fg};`,
    `border: ${s.borderWidth ? `${s.borderWidth}px solid ${s.border}` : 'none'};`,
    `border-radius: ${s.radius}px;`,
    s.font ? `font-family: '${s.font.family}', sans-serif;` : 'font-family: inherit;',
    `font-size: ${s.fontSize}px;`,
    `font-weight: ${s.fontWeight};`,
    'line-height: 1.4;',
    `box-shadow: ${SHADOWS[s.shadow]};`,
    isBtn ? 'cursor: pointer;' : '',
    hover ? 'transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;' : '',
  ].filter(Boolean);

  let css = `${c} {\n  ${rules.join('\n  ')}\n}\n`;
  if (hover) css += `\n${c}:hover {\n  ${hover}\n}\n`;
  if (isBtn) css += `\n${c}:focus-visible {\n  outline: 3px solid ${s.border};\n  outline-offset: 2px;\n}\n`;
  if (s.icon) {
    css += `\n${c} .icon {\n  width: 1.2em;\n  height: 1.2em;\n  flex: none;\n  background: currentColor;\n  mask: url(${iconUrl(s.icon)}) center / contain no-repeat;\n}\n`;
  }
  if (!isBtn) {
    css += `\n${c} h3 {\n  margin: 0;\n  font-size: 1.25em;\n}\n\n${c} p {\n  margin: 0;\n  font-weight: 400;\n  opacity: .85;\n}\n`;
  }
  if (s.fullOnMobile) {
    css += `\n${at} (max-width: 480px) {\n  ${c} {\n    ${isBtn ? 'width: 100%;' : 'max-width: none;'}\n    padding: ${Math.round(s.padY * 0.85)}px ${Math.round(s.padX * 0.85)}px;\n  }\n}\n`;
  }
  return css;
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function toHtml(s: Style): string {
  const icon = s.icon ? '<span class="icon" aria-hidden="true"></span>' : '';
  return s.kind === 'button'
    ? `<button class="my-button">${icon}${esc(s.text)}</button>`
    : `<article class="my-card">\n  ${icon}\n  <h3>${esc(s.text)}</h3>\n  <p>${esc(s.body)}</p>\n</article>`.replace('\n  \n', '\n');
}

export function fontImport(s: Style): string {
  return s.font ? `@import url('${fontCssUrl(s.font.id, nearestWeight(s.font.weights, s.fontWeight))}');\n\n` : '';
}

/* ---------- WCAG 대비 ---------- */

const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};

/** 두 색의 명도 대비(1~21). 그라디언트면 더 나쁜 쪽 끝을 기준으로 삼는다. */
export function contrast(s: Style): number {
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const r = ratio(s.fg, s.bg);
  return s.gradient ? Math.min(r, ratio(s.fg, s.bg2)) : r;
}
