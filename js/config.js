/* ===== CONFIG ===== */
let _incomingOAuthCode = null;
try {
  const _s = window.location.search || '';
  const _h = window.location.hash || '';
  _incomingOAuthCode = new URLSearchParams(_s).get('code');
  if(!_incomingOAuthCode && _h.includes('code=')){
    const _q = _h.split('?')[1] || _h.replace(/^#/, '');
    _incomingOAuthCode = new URLSearchParams(_q).get('code');
  }
} catch(e){}

try {
  localStorage.removeItem('tt_confirming_details');
  localStorage.removeItem('tt_oauth_in_flight');
} catch(e){}

const _isOAuthIncoming = !!(
  _incomingOAuthCode ||
  (window.location.search && window.location.search.includes('code=')) ||
  (window.location.hash && (window.location.hash.includes('code=') || window.location.hash.includes('access_token=') || window.location.hash.includes('refresh_token='))) ||
  sessionStorage.getItem('tt_oauth_pending') === '1'
);

if(_isOAuthIncoming){
  localStorage.removeItem('tt_logged_out');
}

const SUPABASE_URL="https://hjogdvqwwbgzgwtdlrak.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_gURnxsEPWoxUqqAqnEtJ_g_EmUlUgUZ";
let WHATSAPP="919999999999";
let UPI_ID="yourname@upi", UPI_NAME="Thaarai Tex";
let sb=null;
try { sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY); } catch(e){ console.error(e); }

/* ===== ICONS ===== */
const ic=(p,c='w-5 h-5 text-slate-800')=>`<svg viewBox="0 0 24 24" class="${c}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICONS={
  truck:ic('<rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>','w-5 h-5 text-slate-800'),
  cash:ic('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>','w-5 h-5 text-slate-800'),
  handloom:ic('<path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>','w-5 h-5 text-slate-800'),
  upi:ic('<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>','w-5 h-5 text-slate-800'),
  tag:ic('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>','w-5 h-5 text-slate-800'),
  filter:ic('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>','w-4 h-4 text-slate-800'),
  phone:ic('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>','w-3.5 h-3.5 inline mr-1 text-gray-400'),
  mail:ic('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>','w-3.5 h-3.5 inline mr-1 text-gray-400'),
  mapPin:ic('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>','w-3.5 h-3.5 inline mr-1 text-gray-400'),
  whatsapp:ic('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>','w-4 h-4 inline mr-1.5 text-emerald-600'),
  edit:ic('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>','w-3 h-3 inline mr-1 text-gray-600'),
  logout:ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>','w-3.5 h-3.5 inline mr-1 text-rose-500'),
  back:ic('<path d="M15 19l-7-7 7-7"/>','w-5 h-5'),
  chev:ic('<path d="M9 5l7 7-7 7"/>','w-4 h-4 text-gray-400'),
  star:ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>','w-3.5 h-3.5 text-amber-500 inline fill-amber-500'),
  starEmpty:ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>','w-3.5 h-3.5 text-amber-300 inline')
};

/* ===== HELPERS ===== */
const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Number(n||0).toLocaleString('en-IN');
const img=p=>esc(p.images?.[0]||'https://placehold.co/600x750?text=Thaarai+Tex');
const store={get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
let coupon='', wish=new Set();
let buyNowItem = null;

/* ===== PRODUCT ID GENERATOR (FIXED SYSTEM REFERENCE) ===== */
function getProductId(pOrId){
  if(!pOrId) return 'TT-1001';
  if(typeof pOrId === 'object'){
    if(pOrId.product_id && String(pOrId.product_id).trim()) return String(pOrId.product_id).trim().toUpperCase();
    if(pOrId.sku && String(pOrId.sku).trim()) return String(pOrId.sku).trim().toUpperCase();
    if(pOrId.code && String(pOrId.code).trim()) return String(pOrId.code).trim().toUpperCase();
    pOrId = pOrId.id;
  }
  const s = String(pOrId || '').trim();
  if(!s) return 'TT-1001';
  if(/^TT-[A-Z0-9]+$/i.test(s)) return s.toUpperCase();
  if(/^\d+$/.test(s)) return 'TT-' + String(1000 + Number(s));
  const clean = s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return 'TT-' + (clean.slice(0, 6) || 'ITEM');
}

const off=p=>p.mrp>p.price?Math.round((p.mrp-p.price)/p.mrp*100):0;
function toast(m, isError=false){
  const el=$('#toast');
  const msgEl=$('#toast-msg');
  const iconEl=$('#toast-icon');
  if(!el || !msgEl) return;

  const cleanMsg = String(m||'').replace(/[\u2705\u2713\u2714\uFE0F]/g, '').trim();
  const isErr = isError || /error|failed|cannot|failed|invalid/i.test(cleanMsg);
  msgEl.textContent = cleanMsg;

  if(iconEl){
    if(isErr){
      iconEl.className = 'w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100';
      iconEl.innerHTML = '<span class="text-xs font-black">✕</span>';
    } else {
      iconEl.className = '';
      iconEl.innerHTML = `
        <svg class="toast-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="toast-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="toast-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      `;
    }
  }

  clearTimeout(el._t);
  el.style.visibility = 'visible';
  requestAnimationFrame(()=>{
    el.classList.remove('opacity-0', 'translate-y-3', 'scale-95');
    el.classList.add('opacity-100', 'translate-y-0', 'scale-100');
  });

  el._t=setTimeout(()=>{
    el.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
    el.classList.add('opacity-0', 'translate-y-3', 'scale-95');
    setTimeout(()=>{
      if(el.classList.contains('opacity-0')){
        el.style.visibility = 'hidden';
      }
    }, 320);
  }, 2600);
}

/* Chrome-Style Neon Loading Line Control (0% -> 100% smooth fill) */
let _neonBarTimer = null;
let _neonHideTimer = null;
let _neonBarPct = 0;

function showNeonLoader(){
  const el = $('#neon-loader');
  const bar = $('#neon-loader-bar');
  if(!el) return;
  if(_neonBarTimer) clearInterval(_neonBarTimer);
  if(_neonHideTimer) clearTimeout(_neonHideTimer);

  if(bar){
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth;
    bar.style.transition = 'width 240ms cubic-bezier(0.22, 1, 0.36, 1)';
    _neonBarPct = 18;
    bar.style.width = _neonBarPct + '%';
    _neonBarTimer = setInterval(() => {
      if(_neonBarPct < 90){
        _neonBarPct += Math.max(3, Math.round((92 - _neonBarPct) * 0.25));
        if(_neonBarPct > 92) _neonBarPct = 92;
        bar.style.width = _neonBarPct + '%';
      }
    }, 120);
  }

  el.style.visibility = 'visible';
  el.classList.remove('opacity-0');
  el.classList.add('opacity-100');
}

function hideNeonLoader(){
  const el = $('#neon-loader');
  const bar = $('#neon-loader-bar');
  if(!el) return;
  if(_neonBarTimer) clearInterval(_neonBarTimer);
  if(_neonHideTimer) clearTimeout(_neonHideTimer);

  if(bar){
    bar.style.transition = 'width 180ms ease-out';
    bar.style.width = '100%';
  }

  _neonHideTimer = setTimeout(() => {
    el.classList.remove('opacity-100');
    el.classList.add('opacity-0');
    setTimeout(() => {
      if(el.classList.contains('opacity-0')){
        el.style.visibility = 'hidden';
        if(bar){
          bar.style.transition = 'none';
          bar.style.width = '0%';
        }
      }
    }, 220);
  }, 180);
}

/* Custom In-App Modal Dialog for Confirmations & Alerts */
function showModalDialog({ title = 'Confirm Action', message = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = {}){
  return new Promise(resolve => {
    let modal = $('#app-confirm-modal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'app-confirm-modal';
      modal.className = 'fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 animate-scaleUp text-center">
        <div class="w-12 h-12 mx-auto rounded-full ${danger ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-800'} flex items-center justify-center shadow-soft">
          ${danger ? `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          ` : `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          `}
        </div>
        <div>
          <h3 class="font-extrabold text-base text-gray-900">${esc(title)}</h3>
          <p class="text-xs text-gray-500 mt-1.5 leading-relaxed">${esc(message)}</p>
        </div>
        <div class="grid grid-cols-2 gap-2.5 pt-2">
          ${cancelText ? `
            <button id="modal-dlg-cancel" type="button" class="w-full rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 py-3 text-xs font-bold text-gray-700 transition active:scale-95">
              ${esc(cancelText)}
            </button>
          ` : ''}
          <button id="modal-dlg-confirm" type="button" class="w-full rounded-2xl ${danger ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'} py-3 text-xs font-bold shadow-soft transition active:scale-95 ${!cancelText ? 'col-span-2' : ''}">
            ${esc(confirmText)}
          </button>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');

    const cleanUp = (result) => {
      modal.classList.add('hidden');
      resolve(result);
    };

    const confirmBtn = $('#modal-dlg-confirm');
    const cancelBtn = $('#modal-dlg-cancel');
    if(confirmBtn) confirmBtn.onclick = () => cleanUp(true);
    if(cancelBtn) cancelBtn.onclick = () => cleanUp(false);
  });
}

/* ===== CUSTOMER IDENTITY & PERSISTENT SYNC ===== */
let OC={list:[]};
let ofilter='all', addrEdit=null;
const profile=()=>{
  const p = store.get('profile');
  if(!p) return null;
  const cleanPhone = String(p.phone || '').replace(/\D/g, '');
  const isNumericName = /^\d+$/.test(String(p.name || '').trim());
  if(cleanPhone === '9876543210' || cleanPhone === '9999999999' || isNumericName || !cleanPhone || !p.name){
    localStorage.removeItem('profile');
    try { if(sb) sb.auth.signOut().then(); } catch(e){}
    return null;
  }
  return p;
};

let cart = [];
async function loadCartCloud(){
  try{
    const p = profile();
    if(!p) { cart = store.get('cart')||[]; saveCartBadge(); return; }
    if(sb){
      const {data} = await sb.rpc('get_user_cart', {p_phone: p.phone});
      cart = Array.isArray(data) ? data : (store.get('cart')||[]);
    } else {
      cart = store.get('cart')||[];
    }
  }catch{ cart = store.get('cart')||[]; }
  saveCartBadge();
}
async function saveCartCloud(){
  const p = profile();
  store.set('cart', cart);
  saveCartBadge();
  if(p && sb) {
    try{ await sb.rpc('save_user_cart', {p_phone: p.phone, p_items: cart}); }catch{}
  }
}
function saveCart(){ saveCartCloud(); }
function saveCartBadge(){
  const n = cart.reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('.cc').forEach(e=>{e.textContent=n;e.classList.toggle('hidden',!n)});
}

async function getAddrs(){
  try{
    const p = profile();
    if(!p) return store.get('addrs:none')||[];
    if(sb){
      const {data} = await sb.rpc('get_user_addresses', {p_phone: p.phone});
      if(data && data.length) return data;
    }
    return store.get('addrs:'+p.phone)||[];
  }catch{ return store.get('addrs:none')||[]; }
}
async function setAddrs(L){
  const p = profile();
  if(p) {
    store.set('addrs:'+p.phone, L);
    if(sb){
      try{
        await sb.rpc('save_user_addresses', {p_phone: p.phone, p_addresses: L});
        if(L && L.length){
          const cleanPhone = String(p.phone).replace(/\D/g, '').slice(-10);
          sb.from('customers').update({ address: L[0], last_active: new Date().toISOString() }).eq('phone', cleanPhone || p.phone).then();
        }
      }catch{}
    }
  } else {
    store.set('addrs:none', L);
  }
}

const heart=a=>`<svg width="17" height="17" viewBox="0 0 24 24" fill="${a?'#e11d48':'none'}" stroke="${a?'#e11d48':'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>`;
const stars=n=>{
  const filled = Math.round(n);
  let html = '';
  for(let i=0; i<5; i++){
    html += (i < filled) ? ICONS.star : ICONS.starEmpty;
  }
  return `<span class="inline-flex items-center gap-0.5">${html}</span>`;
};

