import { DEFAULT_STYLE, type Preset, type Style } from '../types';

const make = (id: string, name: string, tags: string[], patch: Partial<Style>): Preset => ({
  id,
  name,
  tags,
  fav: false,
  style: { ...DEFAULT_STYLE, ...patch },
  updatedAt: 0,
});

/** 처음 방문했을 때 보여줄 예시. 사용자가 지우면 다시 생기지 않는다. */
export const SEED_PRESETS: Preset[] = [
  make('seed-1', '기본 CTA', ['버튼', '메인'], {}),
  make('seed-2', '선셋 그라디언트', ['버튼', '그라디언트'], {
    gradient: true, bg: '#f97316', bg2: '#db2777', radius: 999, padX: 28, hover: 'glow', icon: 'material-symbols:favorite-rounded', text: '좋아요',
  }),
  make('seed-3', '테두리 버튼', ['버튼', '보조'], {
    bg: '#ffffff', fg: '#111827', border: '#111827', borderWidth: 2, shadow: 0, radius: 6, hover: 'dim', icon: null, text: '더 보기',
  }),
  make('seed-4', '소개 카드', ['카드'], {
    kind: 'card', text: '빠른 시작', bg: '#ffffff', fg: '#1f2937', border: '#e5e7eb', borderWidth: 1, radius: 16, padX: 24, padY: 24, shadow: 3, fontWeight: 600, icon: 'material-symbols:rocket-launch-rounded',
  }),
];
