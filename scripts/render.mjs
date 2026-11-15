// 앱 전체가 오류 없이 렌더링되는지 확인: node scripts/render.mjs
import { createServer } from 'vite';
import assert from 'node:assert/strict';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { createElement } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { DEFAULT_STYLE } = await vite.ssrLoadModule('/src/types.ts');
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  const { Preview } = await vite.ssrLoadModule('/src/components/Preview.tsx');
  const { Controls } = await vite.ssrLoadModule('/src/components/Controls.tsx');

  const html = renderToString(createElement(App));
  assert.match(html, /CSS 플레이그라운드/);
  assert.match(html, /기본 CTA/); // 예시 프리셋
  for (const kind of ['button', 'card']) {
    const s = { ...DEFAULT_STYLE, kind, gradient: true, borderWidth: 2 };
    assert.match(renderToString(createElement(Preview, { style: s })), kind === 'card' ? /<article class="my-card"/ : /<button type="button" class="my-button"/);
    renderToString(createElement(Controls, { style: s, update() {} }));
  }
  console.log('렌더링 확인 통과', html.length, 'bytes');
} finally {
  await vite.close();
}
