// 핵심 순수 함수 동작 확인: node scripts/check.mjs
import { createServer } from 'vite';
import assert from 'node:assert/strict';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { toCss, toHtml, contrast, nearestWeight } = await vite.ssrLoadModule('/src/lib/css.ts');
  const { encodeStyle, decodeStyle, sanitize } = await vite.ssrLoadModule('/src/lib/share.ts');
  const { DEFAULT_STYLE } = await vite.ssrLoadModule('/src/types.ts');

  const css = toCss(DEFAULT_STYLE);
  assert.match(css, /\.my-button \{/);
  assert.match(css, /@media \(max-width: 480px\)/);
  assert.match(toCss(DEFAULT_STYLE, 'container'), /@container \(max-width: 480px\)/);
  assert.match(css, /mask: url\(https:\/\/api\.iconify\.design\/material-symbols\/arrow-forward-rounded\.svg\)/);

  const card = { ...DEFAULT_STYLE, kind: 'card', text: '<b>x</b>' };
  assert.match(toCss(card), /max-width: 320px/);
  assert.match(toHtml(card), /&lt;b&gt;x&lt;\/b&gt;/);

  assert.equal(contrast({ ...DEFAULT_STYLE, fg: '#000000', bg: '#ffffff', gradient: false }).toFixed(0), '21');
  assert.equal(nearestWeight([300, 400, 700], 600), 700);

  const s = { ...DEFAULT_STYLE, text: '한글 버튼 😀', radius: 3 };
  assert.deepEqual(decodeStyle(encodeStyle(s)), s);
  assert.equal(decodeStyle('!!garbage'), null);

  const fixed = sanitize({ hover: 'evil', bg: 'red;}', shadow: 99, icon: null, kind: 'x', extra: 1 });
  assert.equal(fixed.hover, DEFAULT_STYLE.hover);
  assert.equal(fixed.bg, DEFAULT_STYLE.bg);
  assert.equal(fixed.shadow, 5);
  assert.equal(fixed.icon, null);
  assert.equal(fixed.kind, 'button');
  assert.ok(!('extra' in fixed));
  assert.equal(sanitize({ icon: 'a:b) } body { display:none' }).icon, null);
  assert.equal(sanitize({ font: { id: 'x', family: "x'; }", weights: [400] } }).font, null);
  assert.deepEqual(sanitize({ font: { id: 'noto-sans-kr', family: 'Noto Sans KR', weights: [400] } }).font.id, 'noto-sans-kr');
  assert.match(toCss(DEFAULT_STYLE), /border: none;/);

  console.log('모든 확인 통과');
  console.log(css);
} finally {
  await vite.close();
}
