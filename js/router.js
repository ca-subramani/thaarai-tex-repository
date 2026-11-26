/* ===== ROUTER ===== */
let _routing = false;
async function route(){
  if(_routing) return;
  _routing = true;

  try {
    app.onclick=null;if(window._bt)clearInterval(window._bt);
    document.title=(SET.brand?.name || 'Thaarai Tex') + (SET.brand?.tagline ? ' | ' + SET.brand.tagline : '');

    const rawHash = location.hash || '';
    const rawSearch = location.search || '';
    const isOAuthReturn = !!(
      _incomingOAuthCode ||
      rawSearch.includes('code=') ||
      rawHash.includes('code=') ||
      rawHash.includes('access_token=') ||
      rawHash.includes('refresh_token=') ||
      sessionStorage.getItem('tt_oauth_pending') === '1'
    );

    const p = profile();

    // 0. STRICT Lock guard: if user is confirming details in State 2, NEVER leave this page!
    if(isUserConfirmingDetails()){
      if(!location.hash.startsWith('#/login')){
        try {
          history.pushState({ thaaraiConfirmLock: true, t: Date.now() }, '', '#/login');
        } catch(e){}
        location.hash = '#/login';
      }
      if(document.getElementById('confirm-details-card')){
        return;
      }
      return await loginView(window._cachedGoogleUser);
    }

    // 1. If returning from OAuth and profile is not yet completed:
    if(isOAuthReturn && !p){
      // Clear confirming flags so popup doesn't fire prematurely during OAuth loading
      window._confirmingDetails = false;
      try {
        history.replaceState({ thaaraiOAuthResolved: true }, '', '#/login');
      } catch(e){}
      location.hash = '#/login';
      app.innerHTML = `
        <div class="max-w-sm mx-auto bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 shadow-soft my-10">
          <div class="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-spin">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
          </div>
          <p class="text-xs font-bold text-slate-800">Signing in with Google…</p>
          <p class="text-[11px] text-gray-400">Verifying account details, please wait.</p>
        </div>
      `;
      const user = await resolveOAuthUser();
      return await loginView(user);
    }

    // 2. Only resume Name & Number confirmation if actively confirming in this tab session on #/login
    if(!p && rawHash.startsWith('#/login') && sessionStorage.getItem('tt_confirming_details') === '1' && localStorage.getItem('tt_logged_out') !== '1'){
      const user = await resolveOAuthUser();
      if(user && user.email){
        return await loginView(user);
      }
    }

    const [path,qs]=(location.hash||'#/').slice(1).split('?'), params=new URLSearchParams(qs||'');
    $('#tabbar').classList.toggle('hidden',path.startsWith('/p/')||path==='/checkout');
    const isHomePage = (path === '/' || path === '');
    const footEl = $('#foot');
    if(footEl) footEl.classList.toggle('hidden', !isHomePage);
    document.querySelectorAll('.tb').forEach(a=>{const on=a.dataset.tb.split('|').some(k=>k==='/'?(path==='/'||path===''):path.startsWith(k));a.style.color=on?'#0f172a':'#94a3b8'});
    
    // Don't show loading animation on profile tab (#/login or #/account/hub) or edit profile (#/account/profile)
    const skipLoader = path === '/login' || path === '/account/hub' || path === '/account' || path === '/account/profile';
    if(!skipLoader) showNeonLoader();
    try{
      if(path==='/'||path==='')await home();
      else if(path==='/shop')await shop(params);
      else if(path.startsWith('/p/'))await product(path.slice(3));
      else if(path==='/cart')await cartView();
      else if(path==='/checkout')await checkout();
      else if(path.startsWith('/account'))await account(path.split('/')[2]||'hub',params);
      else if(path==='/login'){
        if(profile()){
          location.hash = '#/account/hub';
          await account('hub');
        } else {
          await loginView();
        }
      }
      else app.innerHTML='<p class="text-center py-20 text-xs text-gray-400">Page not found.</p>';
    }catch(err){console.error(err);app.innerHTML='<p class="text-center text-rose-600 py-20 text-xs">Error: '+esc(err.message||err)+'</p>';}
    finally {
      hideNeonLoader();
    }
    window.scrollTo(0,0);
  } finally {
    _routing = false;
  }
}

window.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)e.preventDefault()},{passive:false});
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['+','=','-','0'].includes(e.key))e.preventDefault()},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(b){e.preventDefault();e.stopPropagation();toggleWish(b.dataset.w)}},true);
$('#sf').onsubmit=e=>{e.preventDefault();location.hash='#/shop?q='+encodeURIComponent($('#q').value.trim())};
$('#sf2').onsubmit=e=>{e.preventDefault();location.hash='#/shop?q='+encodeURIComponent($('#q2').value.trim());$('#msearch').classList.add('hidden')};
$('#msb').onclick=()=>{$('#msearch').classList.toggle('hidden');$('#q2').focus()};

/* ===== FIX: BRAND CLICK NAVIGATION (NEVER SHOWS EXIT DIALOG) ===== */
$('#brand').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  if(location.hash !== '#/' && location.hash !== '#' && location.hash !== '') {
    location.hash = '#/';
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

/* ===== HOME TAB HARD RELOAD & BACK TRAP LOOP ===== */
let currentRoute = location.hash || '#/';
let isLinkNavigation = false;

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if(link){
    const h = link.getAttribute('href');
    if(h && (h.startsWith('#') || h.startsWith('/#'))){
      isLinkNavigation = true;
      setTimeout(() => { isLinkNavigation = false; }, 400);
    }
  }
}, true);

function armHomeGuard(){
  try {
    const s = { thaaraiHomeGuard: true, t: Date.now() };
    history.pushState(s, '', '#/');
  } catch(e){}
}

function isUserConfirmingDetails(){
  if(profile()){
    window._confirmLoginState = null;
    window._confirmingDetails = false;
    try {
      localStorage.removeItem('tt_confirming_details');
      sessionStorage.removeItem('tt_confirming_details');
    } catch(e){}
    return false;
  }
  const card = document.getElementById('confirm-details-card');
  return Boolean(card && (window._confirmLoginState || window._confirmingDetails));
}

function showConfirmLoginPopup(){
  if(!isUserConfirmingDetails()) return;
  let popup = $('#confirm-login-modal');
  if(!popup){
    popup = document.createElement('div');
    popup.id = 'confirm-login-modal';
    popup.className = 'fixed inset-0 z-[99999999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200';
    popup.style.cssText = 'z-index: 99999999 !important; position: fixed !important; inset: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important;';
    document.body.appendChild(popup);
  }
  popup.style.display = 'flex';
  popup.classList.remove('hidden');
  popup.innerHTML = `
    <div class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 animate-scaleUp text-center" style="position: relative; z-index: 100000000;">
      <div class="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-soft">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div>
        <h3 class="font-extrabold text-base text-gray-900">Please Confirm Login</h3>
        <p class="text-xs text-gray-500 mt-1.5 leading-relaxed">
          Please enter your name and mobile number and click <strong>Confirm & Complete Login</strong> to proceed. You cannot go back until your details are confirmed.
        </p>
      </div>
      <div class="pt-2">
        <button id="btn-popup-confirm-login" type="button" class="${btn} w-full !py-3.5 text-xs font-bold shadow-soft">
          Confirm Login
        </button>
      </div>
    </div>
  `;

  const confirmBtn = $('#btn-popup-confirm-login');
  if(confirmBtn){
    confirmBtn.onclick = () => {
      popup.style.display = 'none';
      popup.classList.add('hidden');
      try { history.replaceState({ thaaraiConfirmCard: true }, '', '#/login'); } catch(e){}
      const submitBtn = $('#btn-confirm-login');
      if(submitBtn) submitBtn.click();
      else $('#ln')?.focus();
    };
  }
  popup.onclick = (e) => {
    if(e.target === popup){
      popup.style.display = 'none';
      popup.classList.add('hidden');
      try { history.pushState({ thaaraiConfirmCard: true, t: Date.now() }, '', '#/login'); } catch(e){}
      $('#ln')?.focus();
    }
  };
}

async function handleConfirmBackNavigation(){
  if(!isUserConfirmingDetails()) return false;
  confirmArmed = false;
  window._confirmLoginState = null;
  window._confirmingDetails = false;
  window._cachedGoogleUser = null;
  try {
    localStorage.removeItem('tt_confirming_details');
    sessionStorage.removeItem('tt_confirming_details');
    sessionStorage.removeItem('tt_cached_google_user');
    sessionStorage.removeItem('tt_oauth_pending');
    localStorage.removeItem('tt_oauth_pending');
    localStorage.removeItem('tt_oauth_in_flight');
    _incomingOAuthCode = null;
  } catch(e){}
  $('#confirm-login-modal')?.remove();
  $('#tabbar')?.classList.remove('hidden');
  $('#nav-back')?.classList.add('sm:hidden');
  $('#msb')?.classList.remove('!hidden');
  $('#msearch')?.classList.remove('!hidden');
  $('#foot')?.classList.remove('!hidden');
  try {
    history.replaceState({ thaaraiHomeGuard: true }, '', '#/');
    history.pushState({ thaaraiLoginPage: true }, '', '#/login');
  } catch(e){}
  await clearProfile();
  await loginView();
  return true;
}
window.handleConfirmBackNavigation = handleConfirmBackNavigation;

window.addEventListener('popstate', event => {
  // 0. Handle Confirm Login page (State 2) back navigation & Android swipe
  if(isUserConfirmingDetails()){
    handleConfirmBackNavigation();
    return;
  }
  // 1. Close open modals first
  const lb = $('#hd-lightbox');
  if(lb && !lb.classList.contains('hidden')){
    lb.classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden', 'touch-none');
    return;
  }
  const sortModal = $('#sort-page-modal');
  if(sortModal && !sortModal.classList.contains('hidden')){
    sortModal.classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden', 'touch-none');
    return;
  }
  const fl = $('#fl');
  if(fl && !fl.classList.contains('hidden')){
    fl.classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden', 'touch-none');
    return;
  }

  const current = location.hash || '#/';

  // Handle Address Edit cancellation on Back gesture
  if(addrEdit){
    addrEdit = null;
    account('addresses');
    return;
  }

  // Handle Checkout Stepper back navigation (Steps 2, 3, 4, and sub-pages)
  if(window._checkoutState){
    const wasHandled = window._checkoutState.goBack();
    if(wasHandled){
      return;
    } else {
      window._checkoutState = null;
      if(location.hash.startsWith('#/checkout')){
        history.back();
        return;
      }
    }
  }

  // 2. Traps back swipe / back button on Home: ALWAYS hard reload home
  if(current === '#/' || current === '#' || current === ''){
    try {
      history.pushState({ thaaraiHomeGuard: true }, '', '#/');
    } catch(e){}
    location.href = '#/';
    window.location.reload();
    return;
  }

  // 3. For all other pages, route() immediately renders the previous page
  route();
});

// Header back navigation button: If on home, reload home
$('#nav-back').onclick = () => {
  if(isUserConfirmingDetails()){
    handleConfirmBackNavigation();
    return;
  }
  const lb = $('#hd-lightbox');
  if(lb && !lb.classList.contains('hidden')){
    lb.classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden', 'touch-none');
    return;
  }
  const sortModal = $('#sort-page-modal');
  if(sortModal && !sortModal.classList.contains('hidden')){
    sortModal.classList.add('hidden');
    document.body.style.overflow = '';
    return;
  }
  const fl = $('#fl');
  if(fl && !fl.classList.contains('hidden')){
    fl.classList.add('hidden');
    document.body.style.overflow = '';
    return;
  }

  const current = location.hash || '#/';
  if(addrEdit){
    addrEdit = null;
    history.back();
    return;
  }
  if(current === '#/' || current === '' || current === '#'){
    location.href = '#/';
    window.location.reload();
    return;
  }
  if(current.startsWith('#/shop?')){
    location.hash = '#/shop';
    return;
  }

  // Header back button handling in checkout
  if(window._checkoutState){
    const wasHandled = window._checkoutState.goBack();
    if(wasHandled) return;
  }

  history.back();
};

window.addEventListener('hashchange', (e) => {
  if(isUserConfirmingDetails()){
    if(!location.hash.startsWith('#/login')){
      handleConfirmBackNavigation();
    }
    return;
  }
  route();
});

const originalRoute = route;
route = async function(){
  currentRoute = location.hash || '#/';
  await originalRoute();
  if(currentRoute === '#/' || currentRoute === '' || currentRoute === '#'){
    armHomeGuard();
  }
};

// Home tab navigation handler
const homeTab = document.querySelector('a[data-tb="/"]');
if(homeTab){
  homeTab.addEventListener('click', (e) => {
    e.preventDefault();
    if(location.hash !== '#/' && location.hash !== '#' && location.hash !== ''){
      location.hash = '#/';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      home();
    }
  });
}


// Pre-check: If returning from Google OAuth and user is not yet logged in, pin hash to #/login
if(_isOAuthIncoming && !profile()){
  if(location.hash !== '#/login'){
    location.hash = '#/login';
  }
}

Promise.all([initAuth(), loadSiteSettings()]).then(() => {
  route();
});
