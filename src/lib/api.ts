/** 사용하는 외부 Open API 세 가지. 모두 키 없이 브라우저에서 바로 호출할 수 있다(CORS 허용). */

// Iconify: 아이콘 검색
export interface IconSearch {
  icons: string[];
  total: number;
}
export const iconSearchUrl = (q: string) =>
  `https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=48`;

// The Color API: 기준색으로 배색 만들기
export const SCHEME_MODES = {
  analogic: '유사색',
  complement: '보색',
  triad: '3색 조화',
  quad: '4색 조화',
  monochrome: '단색 계열',
  'analogic-complement': '유사+보색',
} as const;
export type SchemeMode = keyof typeof SCHEME_MODES;
export interface Scheme {
  colors: { hex: { value: string }; name: { value: string } }[];
}
export const schemeUrl = (hex: string, mode: SchemeMode) =>
  `https://www.thecolorapi.com/scheme?hex=${hex.slice(1)}&mode=${mode}&count=6`;

// Fontsource: 웹폰트 목록
export interface FontMeta {
  id: string;
  family: string;
  weights: number[];
  category: string;
}
export const fontListUrl = (koreanOnly: boolean) =>
  `https://api.fontsource.org/v1/fonts${koreanOnly ? '?subsets=korean' : ''}`;
