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
  if (materialName.includes('랑데뷰') || materialName.includes('아르떼')) return 'premium';
  if (materialName.includes('스노우') || materialName.includes('아트')) return 'snow-art';
  return 'standard';
}

function calculatePrice(itemState) {
  const sizeSpec = SIZES.find(s => s.name === itemState.size) || SIZES[0];
  const paperCount = itemState.innerPrintSides === 'double' ? Math.ceil(itemState.innerPages / 2) : itemState.innerPages;
  const isPremium = itemState.innerMaterial.includes('랑데뷰') || itemState.innerMaterial.includes('아르떼');
  const paperPrice = isPremium ? PRICING.premiumPaper : PRICING.standardPaper;
  const printPrice = itemState.innerPrintColor === 'color' ? PRICING.colorPrint : PRICING.bwPrint;
  
  let unitPrice = (paperCount * (paperPrice + printPrice)) + 1500;
  if (itemState.binding === 'saddle') unitPrice *= 0.8;
  if (itemState.binding === 'wire') unitPrice += 1000;
  
  const discount = Math.min(0.4, (itemState.quantity / 500) * 0.2);
  const discountedPrice = Math.round(unitPrice * (1 - discount));
  
  const subtotal = discountedPrice * itemState.quantity;
  const tax = Math.round(subtotal * 0.1);
  return { subtotal, tax, total: subtotal + tax };
}

function changeStep(stepNum) {
  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  document.getElementById('step-' + stepNum).classList.add('active');
  document.querySelectorAll('.step').forEach(el => {
    el.classList.remove('active');
    if (parseInt(el.dataset.step) === stepNum) el.classList.add('active');
  });
  window.scrollTo(0, 0);
}

function renderCart() {
  cartListContainer.innerHTML = '';
  if (cart.length === 0) {
    cartListContainer.innerHTML = '<p style="text-align:center; padding: 2rem; opacity:0.6;">아직 담긴 책자가 없습니다.</p>';
    return;
  }
  cart.forEach((book, idx) => {
    const pi = calculatePrice(book);
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:var(--primary); font-size:1.1rem;">${book.bookTitle || '미지정 책자'}</strong><br>
          <small>${book.size} / ${BINDING_METHODS.find(b => b.id === book.binding).name} / ${book.innerPages}p / ${book.quantity}부</small>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;">${pi.total.toLocaleString()}원</div>
          <button class="remove-cart-btn" data-index="${idx}" style="background:none; border:none; color:#ef4444; font-size:0.8rem; cursor:pointer; padding:5px;">삭제</button>
        </div>
      </div>
    `;
    div.querySelector('.remove-cart-btn').addEventListener('click', (e) => {
      cart.splice(idx, 1);
      renderCart();
      updateUI();
    });
    cartListContainer.appendChild(div);
  });
}

function updateSummary() {
  const summaryContent = document.getElementById('summary-content');
  summaryContent.innerHTML = '';
  const pi = calculatePrice(state);
  
  const items = [
    { label: '프로젝트', value: state.bookTitle || '제목 없음' },
    { label: '사이즈', value: state.size },
    { label: '제본', value: BINDING_METHODS.find(b => b.id === state.binding).name },
    { label: '수량', value: state.quantity.toLocaleString() + ' 부' },
    { label: '내지', value: state.innerPages.toLocaleString() + ' P' }
  ];

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'summary-item';
    div.innerHTML = `<span>${item.label}</span><span>${item.value}</span>`;
    summaryContent.appendChild(div);
  });

  subtotalEl.textContent = pi.subtotal.toLocaleString() + '원';
  taxEl.textContent = pi.tax.toLocaleString() + '원';
  totalEl.textContent = pi.total.toLocaleString() + '원';
}

function updateUI() {
  updateSummary();
  const pi = calculatePrice(state);
  const mockupContainer = document.getElementById('mockup-container');
  mockupContainer.innerHTML = `
    <div style="padding:1.5rem; text-align:center; background:#f8fafc; border-radius:12px; border:2px dashed #cbd5e1;">
      <h4 style="margin-bottom:10px; color:var(--primary);">${state.bookTitle || '나만의 책'}</h4>
      <div style="font-size:0.8rem; line-height:1.6;">
        ${state.size} / ${BINDING_METHODS.find(b => b.id === state.binding).name}<br>
        표지: ${state.coverMaterial} (${Array.from(state.coverFinishing).join(', ')})<br>
        내지: ${state.innerMaterial} (${state.innerPages}p)
      </div>
      <div style="margin-top:15px; font-weight:800; font-size:1.2rem; color:var(--secondary);">
        1권당 ${Math.round(pi.total / state.quantity).toLocaleString()}원
      </div>
    </div>
  `;
}

// --- Initialization ---
function init() {
  // 1. Render Options
  sizeGrid.innerHTML = '';
  SIZES.forEach(s => {
    const btn = createOptionBtn(s.name, s.name, state.size === s.name, (val) => {
      state.size = val;
      document.getElementById('custom-size-fields').style.display = val === '직접입력' ? 'grid' : 'none';
      init();
      updateUI();
    });
    sizeGrid.appendChild(btn);
  });

  bindingGrid.innerHTML = '';
  BINDING_METHODS.forEach(b => {
    const btn = createOptionBtn(b.name, b.id, state.binding === b.id, (val) => {
      state.binding = val;
      init();
      updateUI();
    });
    bindingGrid.appendChild(btn);
  });

  coverMaterialSelect.innerHTML = PAPER_SPECS.map(p => `<option value="${p.name}" ${state.coverMaterial === p.name ? 'selected' : ''}>${p.name}</option>`).join('');
  coverMaterialSelect.addEventListener('change', (e) => { state.coverMaterial = e.target.value; updateUI(); });

  finishingGrid.innerHTML = '';
  const finishingOptions = FINISHING_OPTIONS;
  finishingOptions.forEach(opt => {
    if (opt === '없음') return;
    const btn = createOptionBtn(opt, opt, state.coverFinishing.has(opt), (val) => {
      if (state.coverFinishing.has(val)) {
        state.coverFinishing.delete(val);
      } else {
        if (val === '무광코팅') state.coverFinishing.delete('유광코팅');
        if (val === '유광코팅') state.coverFinishing.delete('무광코팅');
        state.coverFinishing.add(val);
      }
      updateUI();
    });
    finishingGrid.appendChild(btn);
  });

  innerMaterialSelect.innerHTML = PAPER_SPECS.map(p => `<option value="${p.name}" ${state.innerMaterial === p.name ? 'selected' : ''}>${p.name}</option>`).join('');
  innerMaterialSelect.addEventListener('change', (e) => { state.innerMaterial = e.target.value; updateUI(); });

  // 2. Event Listeners
  titleInput.addEventListener('input', (e) => { state.bookTitle = e.target.value; updateUI(); });
  quantityInput.addEventListener('input', (e) => { state.quantity = parseInt(e.target.value) || 1; updateUI(); });
  innerPagesInput.addEventListener('input', (e) => { state.innerPages = parseInt(e.target.value) || 2; updateUI(); });

  document.querySelectorAll('#print-sides .option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.innerPrintSides = btn.dataset.value;
      document.querySelectorAll('#print-sides .option-btn').forEach(b => b.classList.toggle('active', b === btn));
      updateUI();
    });
  });

  document.querySelectorAll('#print-color .option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.innerPrintColor = btn.dataset.value;
      document.querySelectorAll('#print-color .option-btn').forEach(b => b.classList.toggle('active', b === btn));
      updateUI();
    });
  });

  // 3. Cart & Navigation
  function resetBookState() {
    state = { ...state, bookTitle: '', quantity: 1, innerPages: 16, coverFinishing: new Set(['무광코팅']) };
    titleInput.value = '';
    quantityInput.value = 1;
    innerPagesInput.value = 16;
    updateUI();
  }

  function addCurrentToCart() {
    const bookToPush = { ...state, coverFinishing: new Set(state.coverFinishing) };
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
    if (cart.length === 0) return alert('주문목록이 비어있습니다.');
    changeStep(5);
  });

  // 4. Final Order
  document.getElementById('order-btn').addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addrInput.value.trim() + ' ' + addrDetailInput.value.trim();
    if (!name || !phone) return alert('주문자 정보를 입력해주세요.');

    const btn = document.getElementById('order-btn');
    btn.disabled = true; btn.textContent = '주문 전송 중...';

    try {
      const timestamp = new Date().toLocaleString();
      const promises = cart.map(book => {
        const pi = calculatePrice(book);
        const data = {
          timestamp, title: book.bookTitle, orderer: name, phone: phone, address,
          size: book.size, binding: BINDING_METHODS.find(b => b.id === book.binding).name,
          quantity: book.quantity, total: pi.total
        };
        return fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      });
      await Promise.all(promises);
      alert('주문이 성공적으로 접수되었습니다!');
      location.reload();
    } catch (e) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      btn.disabled = false; btn.textContent = '최종 주문하기 ➜';
    }
  });

  // 5. Postcode API
  searchAddressBtn.addEventListener('click', () => {
    new daum.Postcode({
      oncomplete: (data) => {
        postcodeInput.value = data.zonecode;
        addrInput.value = data.roadAddress;
        addrDetailInput.focus();
      }
    }).open();
  });

  updateUI();
}

init();
