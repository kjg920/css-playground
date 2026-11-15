export type Kind = 'button' | 'card';
export type Hover = 'none' | 'lift' | 'grow' | 'glow' | 'dim';

export interface Font {
  id: string;
  family: string;
  weights: number[];
}

/** 버튼과 카드가 함께 쓰는 하나의 평평한 스타일 모델. 카드 전용 값(body, width)은 버튼에서 무시된다. */
export interface Style {
  kind: Kind;
  text: string;
  body: string;
  bg: string;
  bg2: string;
  gradient: boolean;
  angle: number;
  fg: string;
  border: string;
  borderWidth: number;
  radius: number;
  padX: number;
  padY: number;
  fontSize: number;
  fontWeight: number;
  shadow: number;
  hover: Hover;
  width: number;
  fullOnMobile: boolean;
  font: Font | null;
  icon: string | null;
}

export interface Preset {
  id: string;
  name: string;
  tags: string[];
  fav: boolean;
  style: Style;
  updatedAt: number;
}

export const DEFAULT_STYLE: Style = {
  kind: 'button',
  text: '시작하기',
  body: '버튼과 카드를 직접 꾸며 보고, 마음에 들면 CSS를 복사해 가세요.',
  bg: '#6366f1',
  bg2: '#ec4899',
  gradient: false,
  angle: 135,
  fg: '#ffffff',
  border: '#4f46e5',
  borderWidth: 0,
  radius: 10,
  padX: 22,
  padY: 12,
  fontSize: 16,
  fontWeight: 600,
  shadow: 2,
  hover: 'lift',
  width: 320,
  fullOnMobile: true,
  font: null,
  icon: 'material-symbols:arrow-forward-rounded',
};
