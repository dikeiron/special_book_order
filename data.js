export const PAPER_SPECS = {
  cover: [
    { type: '모조', weights: [220, 260], category: 'Common', thickness: { 220: 0.28, 260: 0.32 } },
    { type: '스노우', weights: [250, 300], category: 'Common', thickness: { 250: 0.26, 300: 0.32 } },
    { type: '랑데뷰 (수입지)', weights: [190, 210, 240], category: 'Premium', thickness: { 190: 0.25, 210: 0.28, 240: 0.32 } },
    { type: '아티젠 (수입지)', weights: [190, 210, 240], category: 'Premium', thickness: { 190: 0.25, 210: 0.28, 240: 0.32 } },
    { type: '아르떼 (수입지)', weights: [190, 210, 240], category: 'Premium', thickness: { 190: 0.25, 210: 0.28, 240: 0.32 } },
    { type: '에코블랙 (색상지)', weights: [240], category: 'Color', thickness: { 240: 0.32 } },
    { type: '플라이크 블랙 (색상지)', weights: [240], category: 'Color', thickness: { 240: 0.32 } },
    { type: '플라이크 레드 (색상지)', weights: [240], category: 'Color', thickness: { 240: 0.32 } },
    { type: '플라이크 블루 (색상지)', weights: [240], category: 'Color', thickness: { 240: 0.32 } },
  ],
  inner: [
    { type: '모조', weights: [80, 100, 120, 150, 180, 220, 260], thickness: { 80: 0.1, 100: 0.12, 120: 0.15, 150: 0.18, 180: 0.22, 220: 0.28, 260: 0.32 } },
    { type: '스노우화이트', weights: [80, 100, 120, 150, 180], thickness: { 80: 0.08, 100: 0.1, 120: 0.12, 150: 0.15, 180: 0.2 } },
    { type: '랑데뷰 (수입지)', weights: [90, 130, 190, 210], thickness: { 90: 0.12, 130: 0.17, 190: 0.25, 210: 0.28 } },
    { type: '아티젠 (수입지)', weights: [90, 130, 190, 210], thickness: { 90: 0.12, 130: 0.17, 190: 0.25, 210: 0.28 } },
    { type: '아르떼 (수입지)', weights: [90, 130, 190, 210], thickness: { 90: 0.12, 130: 0.17, 190: 0.25, 210: 0.28 } },
  ]
};

export const FINISHING_OPTIONS = {
  coating: ['없음', '무광코팅', '유광코팅'],
  whitePrint: ['없음', '화이트인쇄 (색상지전용)'],
  punching: ['없음', '모양타공'],
  varnish: ['없음', '바니쉬(에폭시)'],
  foil: ['없음', '무광금박', '유광금박', '은박', '투명박'],
  embossing: ['없음', '엠보싱 (형압)', '디보싱 (형압)']
};

export const SIZES = [
  { name: 'A4', width: 210, height: 297 },
  { name: 'B5', width: 182, height: 257 },
  { name: 'A5', width: 148, height: 210 },
  { name: '직접입력', width: 0, height: 0 }
];

export const BINDING_METHODS = [
  { id: 'perfect', name: '무선제본', description: '가장 일반적인 제본 방식' },
  { id: 'saddle', name: '중철제본', description: '4의 배수 페이지만 가능', minPages: 8, maxPages: 64, step: 4 },
  { id: 'hardcover', name: '하드커버', description: '고급스러운 딱딱한 표지' },
  { id: 'spring', name: '스프링제본', description: '넘김이 편한 스프링 방식' },
  { id: 'wire', name: '와이어제본', description: '깔끔한 와이어 타입' }
];

// Mock Pricing (Base costs in KRW)
export const PRICING = {
  base: 5000,
  paper: {
    Common: 500,
    Premium: 1200,
    Color: 1500
  },
  binding: {
    perfect: 2000,
    saddle: 1000,
    hardcover: 8000,
    spring: 2500,
    wire: 3000
  },
  finishing: {
    foil: 3000,
    varnish: 2500,
    punching: 4000,
    coating: 1500,
    embossing: 3500,
    whitePrint: 5000
  },
  innerPagePrice: 150 // Per page
};
