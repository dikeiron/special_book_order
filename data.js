export const PAPER_SPECS = [
  { id: 'snow-100', name: '스노우 100g', g: 100 },
  { id: 'snow-120', name: '스노우 120g', g: 120 },
  { id: 'snow-150', name: '스노우 150g', g: 150 },
  { id: 'snow-180', name: '스노우 180g', g: 180 },
  { id: 'snow-200', name: '스노우 200g', g: 200 },
  { id: 'snow-250', name: '스노우 250g', g: 250 },
  { id: 'art-100', name: '아트 100g', g: 100 },
  { id: 'art-120', name: '아트 120g', g: 120 },
  { id: 'art-150', name: '아트 150g', g: 150 },
  { id: 'art-180', name: '아트 180g', g: 180 },
  { id: 'art-200', name: '아트 200g', g: 200 },
  { id: 'mojo-80', name: '모조 80g', g: 80 },
  { id: 'mojo-100', name: '모조 100g', g: 100 },
  { id: 'rendezvous-130', name: '랑데뷰 130g', g: 130 },
  { id: 'rendezvous-160', name: '랑데뷰 160g', g: 160 },
  { id: 'rendezvous-190', name: '랑데뷰 190g', g: 190 },
  { id: 'rendezvous-210', name: '랑데뷰 210g', g: 210 },
  { id: 'rendezvous-240', name: '랑데뷰 240g', g: 240 }
];

export const SIZES = [
  { id: 'a4', name: 'A4 (210x297)', width: 210, height: 297 },
  { id: 'a5', name: 'A5 (148x210)', width: 148, height: 210 },
  { id: 'b5', name: 'B5 (182x257)', width: 182, height: 257 },
  { id: 'b4', name: 'B4 (257x364)', width: 257, height: 364 },
  { id: '16k', name: '16절 (188x260)', width: 188, height: 260 },
  { id: '32k', name: '32절 (128x188)', width: 128, height: 188 },
  { id: 'custom', name: '직접입력', width: 0, height: 0 }
];

export const BINDING_METHODS = [
  { id: 'perfect', name: '무선제본' },
  { id: 'saddle', name: '중철제본' },
  { id: 'wire', name: '와이어제본' },
  { id: 'hardcover', name: '양장제본' }
];

export const FINISHING_OPTIONS = [
  '없음', '무광코팅', '유광코팅', '부분코팅', '금박', '은박', '먹박', '청박', '적박', '형압', '타공', '미싱', '에폭시'
];

export const PRICING = {
  standardPaper: 50,
  premiumPaper: 150,
  colorPrint: 100,
  bwPrint: 20,
  bindingBase: 2000
};
