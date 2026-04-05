import { PAPER_SPECS, FINISHING_OPTIONS, SIZES, BINDING_METHODS, PRICING } from './data.js';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzaYE7z43VsuNPp6ZpzXz4TY0W4Wcpc92ec3peMckQddMMQd8b4eRpb54nXUZJTy6Rs/exec';

// --- State Management ---
let cart = [];
let state = {
  size: SIZES[0].name,
  customSize: { width: 0, height: 0 },
  binding: BINDING_METHODS[0].id,
  quantity: 1,
  coverMaterial: '스노우 250g',
  coverFinishing: new Set(['무광코팅']),
  innerMaterial: '모조 80g',
  innerPages: 16,
  innerPrintSides: 'double',
  innerPrintColor: 'color',
  interleafMode: 'none',
  interleafCount: 0,
  interleafPositions: '',
  endpaperMode: 'none',
  bookTitle: '',
};

// --- DOM Elements ---
const sizeGrid = document.getElementById('size-options');
const bindingGrid = document.getElementById('binding-options');
const coverMaterialSelect = document.getElementById('cover-material');
const finishingGrid = document.getElementById('finishing-options');
const innerMaterialSelect = document.getElementById('inner-material');
const interleafModeGrid = document.getElementById('interleaf-mode');
const interleafDetails = document.getElementById('interleaf-details');
const endpaperModeGrid = document.getElementById('endpaper-mode');
const quantityInput = document.getElementById('quantity');
const innerPagesInput = document.getElementById('inner-pages');
const printSidesGrid = document.getElementById('print-sides');
const printColorGrid = document.getElementById('print-color');
const interleafCountInput = document.getElementById('interleaf-count');
const interleafPositionsInput = document.getElementById('interleaf-positions');
const titleInput = document.getElementById('book-title');
const nameInput = document.getElementById('orderer-name');
const phoneInput = document.getElementById('orderer-phone');
const postcodeInput = document.getElementById('postcode');
const addrInput = document.getElementById('delivery-address');
const addrDetailInput = document.getElementById('delivery-address-detail');
const searchAddressBtn = document.getElementById('search-address-btn');

const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total-amount');

// New Buttons & Containers
const confirmBookBtn = document.getElementById('confirm-book-btn');
const confirmAndMoreBtn = document.getElementById('confirm-and-more-btn');
const addMoreBooksBtn = document.getElementById('add-more-books-btn');
const goToShippingBtn = document.getElementById('go-to-shipping-btn');
const cartListContainer = document.getElementById('cart-list');

// --- Helper Functions ---
function createOptionBtn(label, value, isActive, onClick) {
  const btn = document.createElement('div');
  btn.className = 'option-btn' + (isActive ? ' active' : '');
  btn.textContent = label;
  btn.dataset.value = value;
  btn.addEventListener('click', () => {
    if (onClick) onClick(value);
  });
  return btn;
}

function getCoverCategory(materialName) {
  const match = PAPER_SPECS.cover.find(c => materialName.startsWith(c.type));
  return match ? match.category : 'Common';
}

function findPaperSpec(part, materialName) {
    if (!materialName) return null;
    return PAPER_SPECS[part].find(p => materialName.startsWith(p.type));
}

function calculateSpineWidth() {
  const coverSpec = findPaperSpec('cover', state.coverMaterial);
  const innerSpec = findPaperSpec('inner', state.innerMaterial);

  let innerTotalThickness = 0;
  let totalSheets = 0;
  if (innerSpec) {
    const weightMatch = state.innerMaterial.match(/\d+/);
    const weight = weightMatch ? parseInt(weightMatch[0]) : 80;
    const perSheet = innerSpec.thickness[weight] || 0.12;
    totalSheets = state.innerPrintSides === 'single' ? state.innerPages : Math.ceil(state.innerPages / 2);
    innerTotalThickness = totalSheets * perSheet;
  }

  let coverTotalThickness = 0;
  if (coverSpec) {
    const weightMatch = state.coverMaterial.match(/\d+/);
    const weight = weightMatch ? parseInt(weightMatch[0]) : 250;
    coverTotalThickness = (coverSpec.thickness[weight] || 0.3) * 2;
  }

  return {
    width: (innerTotalThickness + coverTotalThickness).toFixed(1),
    sheets: totalSheets
  };
}

function calculatePrice(book = state) {
  let subtotal = PRICING.base;

  subtotal += PRICING.binding[book.binding] || 0;
  const coverCat = getCoverCategory(book.coverMaterial);
  subtotal += PRICING.paper[coverCat] || 500;

  book.coverFinishing.forEach(f => {
    if (f.includes('박')) subtotal += PRICING.finishing.foil;
    if (f.includes('에폭시')) subtotal += PRICING.finishing.varnish;
    if (f.includes('타공')) subtotal += PRICING.finishing.punching;
    if (f.includes('코팅')) subtotal += PRICING.finishing.coating;
    if (f.includes('형압')) subtotal += PRICING.finishing.embossing;
    if (f.includes('화이트')) subtotal += PRICING.finishing.whitePrint;
  });

  let basePagePrice = book.innerPrintColor === 'bw' ? 20 : 100;
  subtotal += book.innerPages * basePagePrice;

  if (book.interleafMode !== 'none') {
    subtotal += book.interleafCount * (book.interleafMode === 'printed' ? 500 : 200);
  }

  if (book.endpaperMode !== 'none') {
    const pages = book.endpaperMode === 'both' ? 2 : 1;
    subtotal += pages * 400;
  }

  const totalPagesPrinted = book.quantity * book.innerPages;
  let discountRate = 0;
  if (totalPagesPrinted >= 50000) discountRate = 0.25;
  else if (totalPagesPrinted >= 10000) discountRate = 0.15;
  else if (totalPagesPrinted >= 3000) discountRate = 0.05;

  const subtotalBeforeDiscount = subtotal * book.quantity;
  const discountAmount = Math.floor(subtotalBeforeDiscount * discountRate);
  const finalSubtotal = subtotalBeforeDiscount - discountAmount;

  const tax = Math.round(finalSubtotal * 0.1);
  const total = finalSubtotal + tax;

  return { subtotal: finalSubtotal, tax, total, discountAmount, discountRate, totalPagesPrinted };
}

// --- UI Sync Functions ---
function renderOptions() {
  sizeGrid.innerHTML = '';
  SIZES.forEach(s => {
    const btn = createOptionBtn(s.name, s.name, s.name === state.size, (val) => {
      state.size = val;
      document.getElementById('custom-size-fields').style.display = val === '직접입력' ? 'grid' : 'none';
      updateUI();
    });
    sizeGrid.appendChild(btn);
  });

  bindingGrid.innerHTML = '';
  BINDING_METHODS.forEach(b => {
    const btn = createOptionBtn(b.name, b.id, b.id === state.binding, (val) => {
      state.binding = val;
      document.getElementById('saddle-warning').style.display = val === 'saddle' ? 'block' : 'none';
      updateUI();
    });
    bindingGrid.appendChild(btn);
  });

  coverMaterialSelect.innerHTML = '';
  PAPER_SPECS.cover.forEach(c => {
    c.weights.forEach(w => {
      const option = document.createElement('option');
      option.value = `${c.type} ${w}g`;
      option.textContent = `${c.type} ${w}g`;
      coverMaterialSelect.appendChild(option);
    });
  });

  finishingGrid.innerHTML = '';
  const GROUP_NAMES = { foil: '박가공', varnish: '에폭시', punching: '타공', coating: '코팅', embossing: '형압', whitePrint: '특수' };
  Object.entries(FINISHING_OPTIONS).forEach(([groupName, options]) => {
    const header = document.createElement('div');
    header.className = 'finishing-group-header';
    header.style.cssText = 'grid-column:1/-1; font-size:0.7rem; color:var(--primary); margin-top:0.5rem;';
    header.textContent = GROUP_NAMES[groupName] || groupName;
    finishingGrid.appendChild(header);

    options.forEach(opt => {
      if (opt === '없음') return;
      const btn = createOptionBtn(opt, opt, state.coverFinishing.has(opt), (val) => {
        if (state.coverFinishing.has(val)) {
          state.coverFinishing.delete(val);
        } else {
          // --- Mutual Exclusivity for Coating (Matt/Gloss) ---
          if (val === '무광코팅') state.coverFinishing.delete('유광코팅');
          if (val === '유광코팅') state.coverFinishing.delete('무광코팅');
          
          state.coverFinishing.add(val);
        }
        updateUI();
      });
      finishingGrid.appendChild(btn);
    });
  });

  innerMaterialSelect.innerHTML = '';
  PAPER_SPECS.inner.forEach(c => {
    c.weights.forEach(w => {
      const option = document.createElement('option');
      option.value = `${c.type} ${w}g`;
      option.textContent = `${c.type} ${w}g`;
      innerMaterialSelect.appendChild(option);
    });
  });
}

function updateSelections() {
  // Update grids
  Array.from(sizeGrid.children).forEach(btn => btn.classList.toggle('active', btn.dataset.value === state.size));
  Array.from(bindingGrid.children).forEach(btn => btn.classList.toggle('active', btn.dataset.value === state.binding));
  Array.from(finishingGrid.children).forEach(btn => {
    if (btn.dataset.value) btn.classList.toggle('active', state.coverFinishing.has(btn.dataset.value));
  });
  Array.from(printSidesGrid.children).forEach(btn => btn.classList.toggle('active', btn.dataset.value === state.innerPrintSides));
  Array.from(printColorGrid.children).forEach(btn => btn.classList.toggle('active', btn.dataset.value === state.innerPrintColor));
  Array.from(interleafModeGrid.children).forEach(btn => btn.classList.toggle('active', btn.dataset.value === state.interleafMode));
  Array.from(endpaperModeGrid.children).forEach(btn => btn.classList.toggle('active', btn.dataset.value === state.endpaperMode));

  coverMaterialSelect.value = state.coverMaterial;
  innerMaterialSelect.value = state.innerMaterial;
}

function updateUI() {
  updateSelections();
  updateMockup();
  updateSummary();
}

function updateMockup() {
  const spine = document.getElementById('book-spine');
  const top = document.querySelector('.side.top');
  const front = document.querySelector('.side.front');
  const label = document.getElementById('mockup-label');

  const spineData = calculateSpineWidth();
  const spineDisplay = document.getElementById('spine-width-display');
  if (spineDisplay) spineDisplay.textContent = `(책등: ${spineData.width}mm)`;

  const visualThickness = Math.max(3, spineData.width * 3);
  spine.style.width = visualThickness + 'px';
  spine.style.left = -visualThickness + 'px';
  top.style.height = visualThickness + 'px';
  top.style.top = -visualThickness + 'px';
  front.style.transform = `translateZ(${visualThickness / 2}px)`;

  label.textContent = state.bookTitle || (state.size + ' BROCHURE');
}

function updateSummary() {
  const priceInfo = calculatePrice(state);
  const summaryContent = document.getElementById('summary-content');
  if (!summaryContent) return;
  summaryContent.innerHTML = '';

  const items = [
    { label: '프로젝트', value: state.bookTitle || '제목 없음' },
    { label: '사이즈', value: state.size },
    { label: '제본', value: BINDING_METHODS.find(b => b.id === state.binding).name },
    { label: '수량', value: state.quantity.toLocaleString() + ' 부' },
    { label: '내지', value: state.innerPages.toLocaleString() + ' P' }
  ];

  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'summary-item';
    div.innerHTML = `<span>${it.label}</span><span>${it.value}</span>`;
    summaryContent.appendChild(div);
  });

  subtotalEl.textContent = priceInfo.subtotal.toLocaleString() + ' 원';
  taxEl.textContent = priceInfo.tax.toLocaleString() + ' 원';
  totalEl.textContent = priceInfo.total.toLocaleString() + ' 원';

  updateGrandTotal();
}

function updateGrandTotal() {
  let grandtotal = 0;
  cart.forEach(item => { grandtotal += calculatePrice(item).total; });
  const finalPriceBox = document.getElementById('final-price-summary');
  if (finalPriceBox) {
    const sub = Math.round(grandtotal / 1.1);
    const tax = grandtotal - sub;
    finalPriceBox.innerHTML = `
      총 공급가액: ${sub.toLocaleString()}원 / 부가세: ${tax.toLocaleString()}원<br>
      <strong style="color:var(--primary); font-size:1.8rem;">최종 합계: ${grandtotal.toLocaleString()}원</strong>
    `;
  }
}

function renderCart() {
  cartListContainer.innerHTML = '';
  if (cart.length === 0) {
    cartListContainer.innerHTML = '<p style="text-align:center; padding:3rem; opacity:0.5;">장바구니가 비어있습니다.</p>';
    return;
  }
  cart.forEach((book, index) => {
    const pi = calculatePrice(book);
    const div = document.createElement('div');
    div.className = 'card cart-item';
    div.style.marginBottom = '1rem';
    div.style.padding = '1rem';
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="color:var(--primary);">${book.bookTitle || '미지정 책자'}</strong><br>
                <small>${book.size} / ${BINDING_METHODS.find(b => b.id === book.binding).name} / ${book.innerPages}p / ${book.quantity}부</small>
            </div>
            <div style="text-align:right;">
                <strong>${pi.total.toLocaleString()}원</strong><br>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ff6b6b; cursor:pointer;">[삭제]</button>
            </div>
        </div>
    `;
    cartListContainer.appendChild(div);
  });
}

window.removeFromCart = (index) => {
  cart.splice(index, 1);
  renderCart();
  updateGrandTotal();
};

window.changeStep = (stepNumber) => {
  document.querySelectorAll('.step').forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === stepNumber));
  document.querySelectorAll('.step-content').forEach(c => c.classList.toggle('active', c.id === `step-${stepNumber}`));
  window.scrollTo(0, 0);
};

// --- Initialization ---
function init() {
  renderOptions();
  
  // 1. 초기값 동기화 (사전에 정의한 '스노우 250g', '무광코팅' 등)
  if (!state.coverMaterial) state.coverMaterial = coverMaterialSelect.value;
  if (!state.innerMaterial) state.innerMaterial = innerMaterialSelect.value;
  
  coverMaterialSelect.value = state.coverMaterial;
  innerMaterialSelect.value = state.innerMaterial;

  // 2. 리스너 등록 (동일)
  coverMaterialSelect.addEventListener('change', (e) => { state.coverMaterial = e.target.value; updateUI(); });
  innerMaterialSelect.addEventListener('change', (e) => { state.innerMaterial = e.target.value; updateUI(); });
  printSidesGrid.addEventListener('click', (e) => { if (e.target.dataset.value) { state.innerPrintSides = e.target.dataset.value; updateUI(); } });
  printColorGrid.addEventListener('click', (e) => { if (e.target.dataset.value) { state.innerPrintColor = e.target.dataset.value; updateUI(); } });
  interleafModeGrid.addEventListener('click', (e) => { if (e.target.dataset.value) { 
      state.interleafMode = e.target.dataset.value; 
      interleafDetails.style.display = state.interleafMode === 'none' ? 'none' : 'block';
      updateUI(); 
  }});
  endpaperModeGrid.addEventListener('click', (e) => { if (e.target.dataset.value) { state.endpaperMode = e.target.dataset.value; updateUI(); } });

  quantityInput.addEventListener('input', (e) => { state.quantity = parseInt(e.target.value) || 1; updateUI(); });
  innerPagesInput.addEventListener('input', (e) => { state.innerPages = parseInt(e.target.value) || 2; updateUI(); });
  titleInput.addEventListener('input', (e) => { state.bookTitle = e.target.value; updateUI(); });

  phoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 3 && val.length <= 7) val = val.slice(0, 3) + '-' + val.slice(3);
    else if (val.length > 7) val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
    e.target.value = val;
  });

  searchAddressBtn.addEventListener('click', () => {
    new daum.Postcode({
      oncomplete: function(data) {
        postcodeInput.value = data.zonecode;
        addrInput.value = data.address;
        addrDetailInput.focus();
      }
    }).open();
  });

  // 3. 장바구니/추가구매 액션 리스너
  function resetBookState() {
    state = { ...state, bookTitle: '', quantity: 1, innerPages: 16, coverFinishing: new Set(['무광코팅']) };
    titleInput.value = '';
    quantityInput.value = 1;
    innerPagesInput.value = 16;
    updateUI();
  }

  function addCurrentToCart() {
    const bookToPush = JSON.parse(JSON.stringify(state));
    bookToPush.coverFinishing = new Set(state.coverFinishing);
    cart.push(bookToPush);
    renderCart();
  }

  confirmAndMoreBtn.addEventListener('click', () => {
    addCurrentToCart();
    resetBookState();
    changeStep(1);
    alert('이미 한 권이 담겼습니다! 이어서 다음 책의 사양을 선택해 주세요.');
  });

  confirmBookBtn.addEventListener('click', () => {
    addCurrentToCart();
    changeStep(4);
  });

  addMoreBooksBtn.addEventListener('click', () => {
    resetBookState();
    changeStep(1);
  });

  goToShippingBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert('장바구니가 비어있습니다.');
    changeStep(5);
  });

  // 최종 주문 접수 리스너
  document.getElementById('order-btn').addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!name || !phone) return alert('주문자 정보를 입력해주세요.');

    const btn = document.getElementById('order-btn');
    btn.disabled = true;
    btn.textContent = '주문 전송 중...';

    try {
      const timestamp = new Date().toLocaleString();
      const address = `(${postcodeInput.value}) ${addrInput.value} ${addrDetailInput.value}`;
      
      const promises = cart.map(book => {
        const pi = calculatePrice(book);
        const data = {
          timestamp,
          title: book.bookTitle,
          orderer: name,
          phone: phone,
          address,
          size: book.size, binding: BINDING_METHODS.find(b => b.id === book.binding).name,
          quantity: book.quantity, coverMaterial: book.coverMaterial,
          coverFinishing: Array.from(book.coverFinishing).join(', '),
          innerMaterial: book.innerMaterial, innerPages: book.innerPages,
          innerPrintSides: book.innerPrintSides === 'double' ? '양면' : '단면',
          innerPrintColor: book.innerPrintColor === 'color' ? '컬러' : '흑백',
          interleaf: book.interleafMode !== 'none' ? `O (${book.interleafCount}매)` : 'X',
          endpaper: book.endpaperMode !== 'none' ? 'O' : 'X',
          subtotal: pi.subtotal, tax: pi.tax, total: pi.total
        };
        return fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      });

      await Promise.all(promises);
      alert('주문이 접수되었습니다!');
      location.reload();
    } catch (e) {
      alert('오류 발생');
    } finally {
      btn.disabled = false;
      btn.textContent = '최종 주문하기';
    }
  });

  // 4. 즉시 실행: 1부 가격 바로 노출 위해 업데이트 강제 실행
  updateUI();
}

init();
