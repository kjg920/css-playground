import { DEFAULT_STYLE, type Style } from '../types';

const HEX = /^#[0-9a-f]{6}$/i;
const HOVERS = ['none', 'lift', 'grow', 'glow', 'dim'];
const ICON = /^[a-z0-9-]+:[a-z0-9-]+$/;
const FONT_ID = /^[a-z0-9-]+$/;
const FONT_FAMILY = /^[\p{L}\p{N} .-]+$/u;

/**
 * 바깥에서 들어온 값(공유 링크, localStorage)을 안전한 Style로 고친다.
 * 알 수 없는 키는 버리고, 타입이 틀리거나 빠진 값은 기본값으로 채운다.
 */
export function sanitize(input: unknown): Style {
  const p = (input && typeof input === 'object' ? input : {}) as Record<string, any>;
  const out: Record<string, unknown> = { ...DEFAULT_STYLE };
  for (const [k, def] of Object.entries(DEFAULT_STYLE)) {
    if (def !== null && typeof p[k] === typeof def) out[k] = p[k];
  }
  for (const k of ['bg', 'bg2', 'fg', 'border'] as const) {
    if (!HEX.test(out[k] as string)) out[k] = DEFAULT_STYLE[k];
  }
  if (out.kind !== 'button' && out.kind !== 'card') out.kind = DEFAULT_STYLE.kind;
  if (!HOVERS.includes(out.hover as string)) out.hover = DEFAULT_STYLE.hover;
  out.shadow = Math.max(0, Math.min(5, Math.round(out.shadow as number) || 0));
  // 아이콘·글꼴 이름은 CSS 안에 그대로 들어가므로 형식을 엄격히 검사해 CSS 주입을 막는다
  out.icon = typeof p.icon === 'string' && ICON.test(p.icon) ? p.icon : null;
  const f = p.font;
  out.font =
    f && FONT_ID.test(f.id) && FONT_FAMILY.test(f.family) && Array.isArray(f.weights) && f.weights.length && f.weights.every(Number.isInteger)
      ? { id: f.id, family: f.family, weights: f.weights }
      : null;
  return out as unknown as Style;
}

/** 스타일을 URL 해시에 담는다. 한글이 섞여도 안전하도록 UTF-8 바이트를 base64url로 바꾼다. */
export function encodeStyle(s: Style): string {
  const bytes = new TextEncoder().encode(JSON.stringify(s));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeStyle(code: string): Style | null {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    return sanitize(JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))));
  } catch {
    return null;
  }
}

export const readHash = () => {
  const m = location.hash.match(/^#s=(.+)$/);
  return m ? decodeStyle(m[1]) : null;
};
