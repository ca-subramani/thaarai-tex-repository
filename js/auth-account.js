/* ===== LOGIN ===== */
async function loginView(passedUser = null){
  const p = profile(), accUI = SET.account_ui || {};

  // --- STATE 1: ALREADY LOGGED IN -> REDIRECT TO ACCOUNT HUB ---
  if(p){
    confirmArmed = false;
    window._confirmLoginState = null;
    window._confirmingDetails = false;
    try {
      localStorage.removeItem('tt_confirming_details');
      sessionStorage.removeItem('tt_confirming_details');
    } catch(e){}
    $('#tabbar')?.classList.remove('hidden');
    $('#nav-back')?.classList.remove('!hidden');
    $('#foot')?.classList.remove('!hidden');
    setNav();
    location.hash = '#/account/hub';
    await account('hub');
    return;
  }

  // Only resolve Google OAuth user if actively returning from OAuth or currently confirming in this tab session
  let googleUser = passedUser;
  const isLoggedOut = localStorage.getItem('tt_logged_out') === '1';
  const hasActiveOAuthFlow = Boolean(
    passedUser ||
    _incomingOAuthCode ||
    _isOAuthIncoming ||
    sessionStorage.getItem('tt_oauth_pending') === '1' ||
    sessionStorage.getItem('tt_confirming_details') === '1' ||
    window._cachedGoogleUser
  );

  if(isLoggedOut || !hasActiveOAuthFlow){
    googleUser = null;
    window._cachedGoogleUser = null;
    try {
      sessionStorage.removeItem('tt_cached_google_user');
      sessionStorage.removeItem('tt_confirming_details');
    } catch(e){}
  } else {
    if(!googleUser && window._cachedGoogleUser){
      googleUser = window._cachedGoogleUser;
    }
    if(!googleUser && sb){
      googleUser = await resolveOAuthUser();
    }
    if(!googleUser){
      try {
        const cached = sessionStorage.getItem('tt_cached_google_user');
        if(cached) googleUser = JSON.parse(cached);
      } catch(e){}
    }
  }

  if(googleUser){
    window._cachedGoogleUser = googleUser;
    try {
      sessionStorage.setItem('tt_cached_google_user', JSON.stringify(googleUser));
    } catch(e){}
  }

  // If returning customer exists in Supabase, fetch their profile details
  let existingCust = null;
  if(googleUser && googleUser.email && sb){
    try {
      const { data } = await sb.from('customers').select('*').ilike('email', googleUser.email).order('last_active', { ascending: false }).limit(1);
      if(data && data.length > 0) existingCust = data[0];
      else {
        const { data: singleData } = await sb.from('customers').select('*').ilike('email', googleUser.email).maybeSingle();
        existingCust = singleData;
      }
    } catch(e){}
  }

  // Also check local profile storage for existing user data matching this email
  const localProf = store.get('profile');
  if(!existingCust && localProf && localProf.email && googleUser && googleUser.email && localProf.email.toLowerCase() === googleUser.email.toLowerCase() && localProf.phone){
    existingCust = localProf;
  }

  // Auto-login returning user if their phone is already saved
  if(googleUser && googleUser.email && existingCust && existingCust.phone){
    const cleanPhone = String(existingCust.phone).replace(/\D/g, '').slice(-10);
    if(cleanPhone.length === 10){
      const googleRealName = (googleUser.user_metadata?.full_name || googleUser.user_metadata?.name || '').trim();
      const profileName = (existingCust.name || googleRealName || googleUser.email.split('@')[0] || 'Customer').trim();
      await setProfile(profileName, cleanPhone, googleUser.email, googleRealName);
      confirmArmed = false;
      window._confirmLoginState = null;
      window._confirmingDetails = false;
      window._cachedGoogleUser = null;
      try {
        localStorage.removeItem('tt_confirming_details');
        sessionStorage.removeItem('tt_confirming_details');
        sessionStorage.removeItem('tt_cached_google_user');
        localStorage.removeItem('tt_oauth_in_flight');
        localStorage.removeItem('tt_oauth_pending');
        sessionStorage.removeItem('tt_oauth_pending');
        _incomingOAuthCode = null;
        const cleanUrl = window.location.origin + window.location.pathname + '#/';
        window.history.replaceState({ thaaraiHomeGuard: true }, '', cleanUrl);
      } catch(e){}
      $('#confirm-login-modal')?.remove();
      $('#tabbar')?.classList.remove('hidden');
      $('#nav-back')?.classList.add('sm:hidden');
      $('#msb')?.classList.remove('!hidden');
      $('#msearch')?.classList.remove('!hidden');
      $('#foot')?.classList.remove('!hidden');
      document.querySelector('header a[href="#/cart"]')?.classList.remove('!hidden');
      document.documentElement.classList.remove('overflow-hidden', 'overscroll-none');
      document.body.classList.remove('overflow-hidden', 'overscroll-none', 'touch-none');
      setNav();
      const welcomeMsg = 'Welcome back, ' + profileName.split(' ')[0] + '!';
      await home();
      try { if(typeof armHomeGuard === 'function') armHomeGuard(); } catch(e){}
      hideNeonLoader();
      setTimeout(() => toast(welcomeMsg), 300);
      return;
    }
  }

  // --- STATE 2: GOOGLE SIGN-IN COMPLETE -> ASK PROFILE NAME & MOBILE NUMBER ---
  if(googleUser){
    window._confirmingDetails = true;
    try {
      sessionStorage.setItem('tt_confirming_details', '1');
    } catch(e){}
    $('#tabbar')?.classList.add('hidden');
    $('#nav-back')?.classList.remove('!hidden', 'hidden');
    $('#nav-back')?.classList.remove('sm:hidden');
    $('#msb')?.classList.add('!hidden');
    $('#msearch')?.classList.add('!hidden');
    $('#foot')?.classList.add('!hidden');
    document.querySelector('header a[href="#/cart"]')?.classList.add('!hidden');
    window.scrollTo(0, 0);

    window._confirmLoginState = {
      isModalOpen: () => {
        const popup = document.getElementById('confirm-login-modal');
        return Boolean(popup && !popup.classList.contains('hidden') && popup.style.display !== 'none');
      },
      showModal: () => {
        showConfirmLoginPopup();
      },
      hideModal: () => {
        const popup = document.getElementById('confirm-login-modal');
        if(popup){
          popup.style.display = 'none';
          popup.classList.add('hidden');
        }
      },
      goBack: () => {
        return handleConfirmBackNavigation();
      }
    };

    window._confirmGuardArmed = false;
    try {
      history.pushState({ thaaraiLoginPage: true }, '', '#/login');
      history.pushState({ thaaraiConfirmCard: true }, '', '#/login');
    } catch(e){}
    const googleRealName = (googleUser.user_metadata?.full_name || googleUser.user_metadata?.name || '').trim();
    const defaultProfileName = (existingCust?.name || googleRealName || (googleUser.email ? googleUser.email.split('@')[0] : '')).trim();
    const defaultPhone = existingCust?.phone ? String(existingCust.phone).replace(/\D/g, '').slice(-10) : '';

    app.innerHTML = `
      <div id="confirm-details-card" class="max-w-sm mx-auto bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 space-y-4 shadow-soft my-2 relative z-10">
        <div class="text-center space-y-2">
          <div>
            <h2 class="font-extrabold text-lg tracking-tight text-slate-900">Complete Your Profile</h2>
            <p class="text-[11px] text-slate-500 mt-1">Just one step left to finish signing in</p>
          </div>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 max-w-full">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-3.5 h-3.5 shrink-0">
            <span class="text-[11px] font-bold text-slate-700 truncate">${esc(googleUser.email)}</span>
          </div>
        </div>

        <!-- Hidden Google Real Name (uneditable, not visible to user) -->
        <input type="hidden" id="google-real-name" value="${esc(googleRealName)}">

        <div class="space-y-3.5">
          <div>
            <label for="ln" class="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
            <input id="ln" autofocus autocomplete="name" autocorrect="off" autocapitalize="words" spellcheck="false" type="text" maxlength="60" placeholder="Enter your full name" value="${esc(defaultProfileName)}" class="w-full rounded-2xl border border-slate-200 bg-slate-50/40 focus:bg-white px-4 py-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition">
            <p class="text-[10px] text-slate-400 mt-1 font-medium">Shown on your orders & delivery labels</p>
          </div>

          <div>
            <label for="lp" class="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number <span class="text-slate-400 font-medium">(10 digits)</span></label>
            <div class="flex items-center w-full rounded-2xl border border-slate-200 bg-slate-50/40 focus-within:bg-white overflow-hidden focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition">
              <span class="inline-flex items-center justify-center shrink-0 whitespace-nowrap min-w-[56px] px-3.5 py-3.5 text-[16px] font-normal text-slate-700 bg-slate-100 border-r border-slate-200 select-none tracking-wider">+91</span>
              <input id="lp" type="tel" maxlength="10" inputmode="numeric" placeholder="Enter 10-digit mobile number" value="${esc(defaultPhone)}" class="min-w-0 flex-1 w-full bg-transparent px-3.5 py-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none">
            </div>
            <p class="text-[11px] text-slate-500 mt-1.5 flex items-start gap-1.5 font-medium leading-relaxed">
              <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>Used for order confirmation &amp; delivery updates.</span>
            </p>
          </div>
        </div>

        <div class="pt-1">
          <button id="btn-confirm-login" type="button" class="${btn} w-full !py-3.5 text-xs font-bold shadow-soft">
            Confirm &amp; Complete Login
          </button>
        </div>
      </div>

      <div class="fixed bottom-4 inset-x-0 mx-auto w-full max-w-sm px-4 z-20" style="padding-bottom:env(safe-area-inset-bottom,0px)">
        <button id="btn-switch-account" type="button" class="w-full flex items-center justify-center rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-700 py-3.5 px-4 text-xs font-bold transition active:scale-[0.98] shadow-soft">
          <span>Login with different Gmail account</span>
        </button>
      </div>
    `;

    const nameInput = $('#ln');
    const phoneInput = $('#lp');
    if(nameInput){
      const focusTarget = (el = nameInput) => {
        if(!el) return;
        try {
          if(document.activeElement !== el){
            el.focus({ preventScroll: true });
          }
          const val = el.value || '';
          if(typeof el.setSelectionRange === 'function'){
            el.setSelectionRange(val.length, val.length);
          }
        } catch(e){}
      };

      focusTarget(nameInput);

      nameInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
          e.preventDefault();
          focusTarget(phoneInput);
        }
      });
    }

    $('#btn-confirm-login').onclick = async () => {
      const profileName = ($('#ln')?.value || '').trim();
      const rawPhone = ($('#lp')?.value || '').trim();
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
      const googleName = ($('#google-real-name')?.value || '').trim();

      if(profileName.length < 2){
        toast('Please enter your profile name');
        $('#ln')?.focus();
        return;
      }
      if(!/^[6-9]\d{9}$/.test(cleanPhone)){
        toast('Please enter a valid 10-digit mobile number');
        $('#lp')?.focus();
        return;
      }

      const b = $('#btn-confirm-login');
      if(b){ b.disabled = true; b.textContent = 'Logging in...'; }
      await setProfile(profileName, cleanPhone, googleUser.email, googleName);
      confirmArmed = false;
      window._confirmLoginState = null;
      window._confirmingDetails = false;
      window._cachedGoogleUser = null;
      try {
        localStorage.removeItem('tt_confirming_details');
        sessionStorage.removeItem('tt_confirming_details');
        sessionStorage.removeItem('tt_cached_google_user');
        localStorage.removeItem('tt_oauth_in_flight');
        localStorage.removeItem('tt_oauth_pending');
        sessionStorage.removeItem('tt_oauth_pending');
        _incomingOAuthCode = null;
        const cleanUrl = window.location.origin + window.location.pathname + '#/';
        window.history.replaceState({ thaaraiHomeGuard: true }, '', cleanUrl);
      } catch(e){}
      $('#confirm-login-modal')?.remove();
      $('#tabbar')?.classList.remove('hidden');
      $('#nav-back')?.classList.add('sm:hidden');
      $('#msb')?.classList.remove('!hidden');
      $('#msearch')?.classList.remove('!hidden');
      $('#foot')?.classList.remove('!hidden');
      document.querySelector('header a[href="#/cart"]')?.classList.remove('!hidden');
      document.documentElement.classList.remove('overflow-hidden', 'overscroll-none');
      document.body.classList.remove('overflow-hidden', 'overscroll-none', 'touch-none');
      setNav();
      await home();
      try { if(typeof armHomeGuard === 'function') armHomeGuard(); } catch(e){}
      setTimeout(() => {
        toast('Welcome, ' + profileName.split(' ')[0] + '!');
      }, 300);
    };

    $('#btn-switch-account').onclick = async () => {
      const sbBtn = $('#btn-switch-account');
      if(sbBtn){ sbBtn.disabled = true; }
      showNeonLoader();
      try {
        confirmArmed = false;
        window._confirmLoginState = null;
        window._confirmingDetails = false;
        window._cachedGoogleUser = null;
        try {
          localStorage.removeItem('tt_confirming_details');
          sessionStorage.removeItem('tt_confirming_details');
          sessionStorage.removeItem('tt_cached_google_user');
        } catch(e){}
        $('#confirm-login-modal')?.remove();
        $('#tabbar')?.classList.remove('hidden');
        $('#nav-back')?.classList.add('sm:hidden');
        $('#msb')?.classList.remove('!hidden');
        $('#msearch')?.classList.remove('!hidden');
        $('#foot')?.classList.remove('!hidden');
        document.querySelector('header a[href="#/cart"]')?.classList.remove('!hidden');
        document.documentElement.classList.remove('overflow-hidden', 'overscroll-none');
        document.body.classList.remove('overflow-hidden', 'overscroll-none', 'touch-none');
        await clearProfile();
        location.hash = '#/login';
        await loginView();
      } finally {
        hideNeonLoader();
      }
    };
    return;
  }

  // --- STATE 3: PROFESSIONAL E-COMMERCE GOOGLE LOGIN PAGE ---
  confirmArmed = false;
  window._confirmLoginState = null;
  window._confirmingDetails = false;
  try {
    localStorage.removeItem('tt_confirming_details');
    sessionStorage.removeItem('tt_confirming_details');
  } catch(e){}
  $('#tabbar')?.classList.remove('hidden');
  $('#nav-back')?.classList.remove('!hidden');
  $('#foot')?.classList.remove('!hidden');
  document.querySelector('header a[href="#/cart"]')?.classList.remove('!hidden');
  document.documentElement.classList.remove('overflow-hidden', 'overscroll-none');
  document.body.classList.remove('overflow-hidden', 'overscroll-none', 'touch-none');

  const brandName = SET.brand?.name || 'Thaarai Tex';
  app.innerHTML = `
    <style>
      @keyframes ttWaveA {
        0%   { transform: translate3d(-12%, -10%, 0) rotate(0deg) scale(1); }
        25%  { transform: translate3d(10%, -14%, 0) rotate(90deg) scale(1.08); }
        50%  { transform: translate3d(14%, 10%, 0) rotate(180deg) scale(0.96); }
        75%  { transform: translate3d(-8%, 14%, 0) rotate(270deg) scale(1.05); }
        100% { transform: translate3d(-12%, -10%, 0) rotate(360deg) scale(1); }
      }
      @keyframes ttWaveB {
        0%   { transform: translate3d(12%, 10%, 0) rotate(360deg) scale(1.04); }
        25%  { transform: translate3d(-14%, 8%, 0) rotate(270deg) scale(0.95); }
        50%  { transform: translate3d(-10%, -14%, 0) rotate(180deg) scale(1.1); }
        75%  { transform: translate3d(14%, -8%, 0) rotate(90deg) scale(1); }
        100% { transform: translate3d(12%, 10%, 0) rotate(0deg) scale(1.04); }
      }
      .tt-animated-box {
        background: #0b1220;
      }
      .tt-animated-box::before,
      .tt-animated-box::after {
        content: "";
        position: absolute;
        inset: -45%;
        pointer-events: none;
        will-change: transform;
      }
      .tt-animated-box::before {
        background: radial-gradient(circle at 35% 35%, rgba(5, 150, 105, 0.55) 0%, rgba(4, 120, 87, 0.25) 38%, transparent 68%);
        animation: ttWaveA 17s linear infinite;
      }
      .tt-animated-box::after {
        background: radial-gradient(circle at 65% 65%, rgba(16, 185, 129, 0.42) 0%, rgba(6, 95, 70, 0.28) 40%, transparent 70%);
        animation: ttWaveB 23s linear infinite;
      }
      .tt-animated-box > * {
        position: relative;
        z-index: 1;
      }
    </style>
    <div class="max-w-sm mx-auto my-6 sm:my-10 px-1">
      <div class="tt-animated-box border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <!-- Brand & Welcome Header -->
        <div class="text-center space-y-2 pt-1">
          <p class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">${esc(brandName)} Account</p>
          <h2 class="font-extrabold text-xl tracking-tight text-white">${esc(accUI.title || 'Welcome Back')}</h2>
          <p class="text-xs text-slate-300 leading-relaxed">${esc(accUI.subtitle || 'Sign in with your Google account to get started.')}</p>
        </div>

        <!-- Primary Google Sign-In CTA -->
        <div class="space-y-3 pt-1">
          <button id="btn-user-google" type="button" class="w-full flex items-center justify-center gap-3 rounded-2xl bg-white hover:bg-slate-50 py-3.5 px-4 text-xs font-extrabold text-slate-900 shadow-lg transition active:scale-[0.98]">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-5 h-5 shrink-0" loading="lazy">
            <span>Continue with Google</span>
          </button>

          <div class="text-center text-[11px] text-slate-300/80 font-medium pt-1">
            <span>100% secure one-tap authentication</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const bg = $('#btn-user-google');
  if(bg){
    bg.onclick = async () => {
      if(bg.disabled) return;
      bg.disabled = true;
      bg.classList.add('opacity-70');
      showNeonLoader();

      try {
        if(window.location.protocol === 'file:'){
          hideNeonLoader();
          bg.disabled = false;
          bg.classList.remove('opacity-70');
          await showModalDialog({
            title: 'Live Website Required',
            message: 'Google Sign-In cannot redirect back to a local file (file:///...). Please test Google Sign-In on your live website (https://thaaraitex.in) or via a local web server.',
            confirmText: 'Understood',
            cancelText: ''
          });
          return;
        }

        if(!sb){
          throw new Error('Authentication service is currently unavailable. Please refresh and try again.');
        }

        // Clear logged out flag and mark active OAuth flow in sessionStorage only
        localStorage.removeItem('tt_logged_out');
        sessionStorage.setItem('tt_oauth_pending', '1');

        const cleanTarget = window.location.origin + (window.location.pathname || '/');

        const { error } = await sb.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: cleanTarget,
            queryParams: {
              prompt: 'select_account'
            }
          }
        });
        if(error) throw error;
      } catch(err){
        hideNeonLoader();
        bg.disabled = false;
        bg.classList.remove('opacity-70');
        sessionStorage.removeItem('tt_oauth_pending');
        toast(err.message || 'Google Sign-In error');
      }
    };
  }

  if(!window._confirmLoginState && !document.getElementById('confirm-details-card')){
    try{
      localStorage.removeItem('tt_confirming_details');
      sessionStorage.removeItem('tt_confirming_details');
    }catch(e){}
  }
  if(!isUserConfirmingDetails()) confirmArmed = false;
}

/* ===== ACCOUNT ===== */
const STL={pending:'text-slate-700 font-bold bg-slate-100 px-3 py-1 rounded-full',verified:'text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-full',dispatched:'text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full',delivered:'text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full',cancelled:'text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full'};
const SLBL={pending:'Pending',verified:'Processing',dispatched:'Shipped',delivered:'Delivered',cancelled:'Cancelled'};
const GRP={all:()=>true,pending:o=>o.order_status==='pending',verified:o=>o.order_status==='verified',dispatched:o=>o.order_status==='dispatched',delivered:o=>o.order_status==='delivered',cancelled:o=>o.order_status==='cancelled'};
const PAYLBL={COD:'Cash on Delivery',UPI:'UPI'};

async function fetchOrders(){
  const p=profile();if(!p)return[];
  try{
    if(sb){
      const {data,error}=await sb.rpc('my_orders',{p_phone:p.phone});
      if(error)throw new Error(error.message);
      OC={list:data||[]};return OC.list;
    }
  }catch{}
  return [];
}

function hubHtml(pf){
  const row=(svg,label,href,badge='')=>`<a href="${href}" class="flex items-center justify-between py-3 px-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition group"><div class="flex items-center gap-3.5"><span class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">${svg}</span><span class="font-bold text-sm text-gray-900">${label}</span></div><div class="flex items-center gap-2">${badge}${ICONS.chev}</div></a>`;
  const s=d=>`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return `<div class="max-w-md mx-auto bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-gray-100 min-h-[calc(100dvh-166px)] sm:min-h-0 flex flex-col">
    <div class="flex items-center justify-between pb-2"><button onclick="location.hash='#/'" aria-label="Back" class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100">${ICONS.back}</button><h2 class="font-extrabold text-base text-gray-900">Profile</h2><div class="w-8"></div></div>
    <div class="flex flex-col items-center mt-2">
      <div class="w-20 h-20 rounded-full p-1 border-2 border-slate-200 shadow-soft flex items-center justify-center bg-white"><div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-2xl font-extrabold">${esc((pf.name[0]||'C').toUpperCase())}</div></div>
      <h3 class="text-base font-bold text-gray-900 mt-2.5">${esc(pf.name)}</h3>
      <p class="text-xs text-gray-500 font-medium mt-0.5">+91 ${esc(pf.phone)}</p>
    </div>
    <div class="my-auto py-3 space-y-1 divide-y divide-gray-50">
      ${row(s('<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>'),'Edit Profile','#/account/profile')}
      ${row(s('<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>'),'Shopping Address','#/account/addresses')}
      ${row(s('<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>'),'Wishlist','#/account/wishlist')}
      ${row(s('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>'),'Order History','#/account/orders')}
    </div>
    <div class="mt-auto pt-3 border-t text-center"><button id="lgo" class="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center justify-center mx-auto py-1.5">${ICONS.logout}Logout</button></div>
  </div>`;
}

function orderCard(o){
  const d=new Date(o.created_at), shortId=String(o.id).slice(0,8).toUpperCase();
  const items = o.items || [];
  const firstItem = items[0] || {};
  const imgSrc = firstItem.image || firstItem.image_url || 'https://placehold.co/80x100?text=Product';
  const prodName = firstItem.name || firstItem.product_name || (items.length > 1 ? `${items.length} Products` : 'Order Item');
  const countExtra = items.length > 1 ? ` +${items.length - 1} more` : '';
  const statusLabel = SLBL[o.order_status] || o.order_status || 'Pending';

  return `
    <a href="#/account/order-detail?id=${encodeURIComponent(o.id)}" class="flex items-center gap-3.5 bg-white rounded-2xl p-3.5 shadow-soft border border-gray-100 hover:border-slate-300 hover:shadow-md transition active:scale-[0.99] group">
      <img src="${esc(imgSrc)}" alt="${esc(prodName)}" class="w-14 h-16 object-cover rounded-xl bg-gray-50 border shrink-0">
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold text-gray-400 font-mono">#${esc(shortId)}</span>
          <span class="text-[10px] text-gray-400 font-medium">${d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
        </div>
        <h4 class="text-xs font-bold text-gray-900 truncate mt-0.5">${esc(prodName)}<span class="text-[11px] font-normal text-gray-500">${esc(countExtra)}</span></h4>
        <div class="flex items-center justify-between gap-2 mt-1.5">
          <span class="inline-block text-[10px] font-bold ${STL[o.order_status] || 'text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full'}">${esc(statusLabel)}</span>
          <span class="text-xs font-black text-slate-900">${inr(o.total)}</span>
        </div>
      </div>
      <div class="text-gray-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition shrink-0 pl-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </div>
    </a>
  `;
}

async function ordersHtml(pf){
  if(!pf)return loginNeeded('Please sign in to see your orders.');
  const list=await fetchOrders();
  const emptyMsg = SET.account_ui?.emptyOrders || 'No orders yet. Start shopping';
  const chips=[['all','All'],['pending','Pending'],['verified','Processing'],['dispatched','Shipped'],['delivered','Delivered'],['cancelled','Cancelled']];
  return `<div class="max-w-md mx-auto space-y-4 my-2">
    ${topbar('My Orders','#/account/hub')}
    <div class="flex gap-2 overflow-x-auto no-scrollbar py-1">${chips.map(c=>`<button data-f="${c[0]}" class="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${ofilter===c[0]?'bg-slate-900 text-white shadow-soft':'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}">${c[1]}${c[0]==='all'?'':' ('+list.filter(GRP[c[0]]).length+')'}</button>`).join('')}</div>
    <div class="space-y-4 pt-1">${list.filter(GRP[ofilter]||GRP.all).map(orderCard).join('')||`<div class="bg-white rounded-3xl p-10 text-center text-gray-400 text-xs border border-gray-100 shadow-soft">${esc(emptyMsg)}. <a href="#/shop" class="underline font-bold text-slate-900">Start shopping</a></div>`}</div></div>`;
}

async function orderDetailView(orderId,pf){
  if(!pf){app.innerHTML=loginNeeded('Please login to view this order.');return}
  let list=OC.list||[];
  if(!list.length)list=await fetchOrders();
  const ord=list.find(o=>String(o.id)===orderId||String(o.id).slice(0,8).toUpperCase()===String(orderId).toUpperCase());
  if(!ord){app.innerHTML=`<div class="max-w-md mx-auto text-center py-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-soft my-4 space-y-3"><p class="text-xs text-gray-500">This order was not found in your account.</p><a href="#/account/orders" class="${btn} inline-block !py-2.5">Back to Orders</a></div>`;return}
  const items=ord.items||[], status=ord.order_status||'pending', steps=['pending','verified','dispatched','delivered'], cur=steps.indexOf(status);
  const shortNo=String(ord.id).slice(0,8).toUpperCase(), createdAt=new Date(ord.created_at);
  const deliveryDate = ord.delivered_at || ord.delivery_date || ord.expected_delivery_date || ord.estimated_delivery_date || new Date(createdAt.getTime() + 5 * 864e5);
  const deliveryDateLabel = ord.delivered_at || ord.delivery_date ? 'Delivery date' : 'Estimated delivery';
  // Extract complete shipping address object
  let ship = {};
  if(ord.address){
    if(typeof ord.address === 'object') {
      ship = { ...ord.address };
    } else if(typeof ord.address === 'string'){
      const tr = ord.address.trim();
      if((tr.startsWith('{') && tr.endsWith('}')) || (tr.startsWith('[') && tr.endsWith(']'))){
        try {
          const parsed = JSON.parse(tr);
          if(parsed && typeof parsed === 'object') ship = { ...parsed };
        } catch(e){}
      }
    }
  }

  // Fallback to customer or profile saved address if order address is missing fields
  const savedAddrs = await getAddrs();
  const matchedSaved = savedAddrs.find(sa => sa.phone === (ord.phone || pf.phone) || sa.def) || savedAddrs[0] || {};

  const recipient = ord.name || ord.customer_name || ship.name || matchedSaved.name || pf.name || '';
  const phone = ord.phone || ord.mobile_number || ship.phone || matchedSaved.phone || pf.phone || '';
  const doorNoAndStreet = ship.line || ship.address_line || ship.street || ship.door_no || (typeof ord.address === 'string' && !ord.address.trim().startsWith('{') ? ord.address.trim() : '') || matchedSaved.line || ord.line || '';
  const area = ship.area || matchedSaved.area || '';
  const city = ship.city || matchedSaved.city || ord.city || '';
  const state = ship.state || matchedSaved.state || ord.state || 'Tamil Nadu';
  const pincode = ship.pincode || ship.pin || matchedSaved.pincode || ord.pincode || '';

  // Construct comprehensive formatted address
  let addressLines = [];
  if(doorNoAndStreet) addressLines.push(doorNoAndStreet);
  if(area && !doorNoAndStreet.toLowerCase().includes(area.toLowerCase())) addressLines.push(area);
  const cityState = [city, state].filter(Boolean).join(', ');
  if(cityState) addressLines.push(cityState);
  if(pincode) addressLines.push(`Pincode: ${pincode}`);
  addressLines.push('India');

  const formattedAddress = addressLines.filter(Boolean).join('\n');
  const supportMsg = SET.account_ui?.supportText || 'Contact support on WhatsApp';
  app.innerHTML=`<div class="max-w-md mx-auto space-y-4 my-2">
    ${topbar('Order #'+esc(shortNo),'#/account/orders')}
    <div class="bg-white rounded-3xl p-5 shadow-soft border border-gray-100 space-y-4">
      <div class="flex justify-between items-start"><div><span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Status</span><h3 class="font-extrabold text-sm text-gray-900 mt-0.5">${esc(SLBL[status]||status)}</h3><p class="text-[11px] text-gray-500 mt-0.5">Placed ${createdAt.toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p></div><span class="text-xs ${STL[status]||''}">${esc(SLBL[status]||status)}</span></div>
      <div class="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-xs"><div><span class="block text-gray-500">${deliveryDateLabel}</span><b class="mt-1 block text-gray-900">${new Date(deliveryDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</b></div>${ord.tracking_id?`<div><span class="block text-gray-500">Tracking number</span><b class="mt-1 block text-gray-900">${esc(ord.tracking_id)}</b></div>`:''}</div>
      ${status==='cancelled'?'':`<div class="grid grid-cols-4 gap-1.5 text-center">${['Placed','Confirmed','Shipped','Delivered'].map((st,i)=>`<div><div class="h-1.5 rounded-full mb-1.5 ${i<=cur?'bg-slate-900':'bg-gray-200'}"></div><span class="text-[10px] font-bold ${i<=cur?'text-slate-900':'text-gray-400'}">${st}</span></div>`).join('')}</div>`}
    </div>
    <div class="bg-white rounded-3xl p-5 shadow-soft border border-gray-100 space-y-3"><h3 class="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Ordered products (${items.length})</h3>
      <div class="divide-y divide-gray-100">${items.map(i=>{const productId=i.product_id??i.id, productHref=productId!==undefined&&productId!==null?'#/p/'+encodeURIComponent(productId):'';return `<div class="py-3 flex items-center gap-3.5"><a ${productHref?`href="${productHref}"`:''} class="shrink-0 ${productHref?'cursor-pointer':''}"><img src="${esc(i.image||'https://placehold.co/100x120?text=Saree')}" alt="${esc(i.name||'Ordered saree')}" class="w-16 h-20 object-cover rounded-2xl bg-gray-50 border"></a><div class="flex-1 min-w-0"><div class="flex items-center gap-1.5 flex-wrap"><${productHref?'a href="'+productHref+'"':'span'} class="font-bold text-xs text-gray-900 truncate block">${esc(i.name||'Saree')}</${productHref?'a':'span'}></div><p class="text-[11px] text-gray-500 mt-1">Unit price: ${inr(i.price)} · Quantity: <b class="text-gray-900 font-bold">${i.quantity||1}</b></p><b class="text-xs text-slate-900 mt-1 block">${inr(Number(i.price||0)*Number(i.quantity||1))}</b></div></div>`}).join('')}</div></div>

    <!-- Complete Detailed Delivery Address -->
    <div class="bg-white rounded-3xl p-5 shadow-soft border border-gray-100 space-y-2.5 text-xs">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <svg class="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Full Delivery Address
        </h3>
        <span class="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Shipping Destination</span>
      </div>
      <div class="space-y-2 pt-1">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-900 text-sm">${esc(recipient || pf.name || 'Customer')}</span>
          ${phone ? `<span class="text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full select-all">+91 ${esc(phone)}</span>` : ''}
        </div>
        ${formattedAddress ? `
          <div class="text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-gray-100 space-y-1">
            <p class="whitespace-pre-line">${esc(formattedAddress)}</p>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Complete Payment & Order Attributes -->
    <div class="bg-white rounded-3xl p-5 shadow-soft border border-gray-100 space-y-2 text-xs">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">Payment Summary & Verification</h3>
        <span class="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">#TT-${esc(shortNo)}</span>
      </div>
      <div class="flex justify-between text-gray-600 pt-1"><span>Payment Method</span><b class="text-gray-900">${esc(PAYLBL[ord.payment_method]||ord.payment_method||'')}</b></div>
      ${ord.tracking_id ? `<div class="flex justify-between text-gray-600"><span>Courier Tracking No</span><b class="text-slate-900 font-mono">${esc(ord.tracking_id)}</b></div>` : ''}
      ${ord.coupon?`<div class="flex justify-between text-gray-600"><span>Coupon Applied</span><b class="text-slate-900">${esc(ord.coupon)}</b></div>`:''}
      ${ord.discount?`<div class="flex justify-between text-gray-600"><span>Discount</span><b class="text-emerald-700 font-bold">−${inr(ord.discount)}</b></div>`:''}
      <div class="flex justify-between text-gray-600"><span>Shipping / Delivery</span><b class="text-emerald-700 font-bold">FREE</b></div>
      <div class="flex justify-between text-sm font-extrabold text-slate-900 border-t pt-2.5 mt-2"><span>Total Amount</span><span class="text-emerald-700 font-black text-base">${inr(ord.total)}</span></div>
    </div>
    <div class="text-center pt-2"><a href="https://wa.me/${esc(WHATSAPP)}?text=${encodeURIComponent('Hi, I need help with my order #'+shortNo)}" target="_blank" rel="noopener" class="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">${ICONS.whatsapp}<span>${esc(supportMsg)}</span></a></div></div>`;
}

function profileHtml(pf){
  return `<div class="max-w-md mx-auto bg-white rounded-3xl p-6 shadow-soft border border-gray-100 my-2">
    <div class="flex items-center justify-between pb-4 border-b"><button onclick="location.hash='#/account/hub'" aria-label="Back" class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100">${ICONS.back}</button><h2 class="font-extrabold text-sm text-gray-900">Edit Profile</h2><div class="w-8"></div></div>
    <div class="space-y-4 mt-4">
      ${input('pn','Full Name',`maxlength="60" value="${esc(pf.name)}"`)}
      ${input('pp','Mobile Number (10 digits)',`maxlength="10" inputmode="numeric" value="${esc(pf.phone)}"`)}
      <p class="text-[11px] text-gray-400">Orders, wishlist, cart and addresses are saved against your mobile number.</p>
      ${pf.email ? `
        <div class="rounded-2xl bg-gray-50 p-3 text-xs border border-gray-100 flex items-center justify-between">
          <span class="text-gray-500 font-medium">Google Account</span>
          <span class="font-bold text-slate-800 text-xs truncate max-w-[200px]">${esc(pf.email)}</span>
        </div>
      ` : ''}
      <button id="ps" class="${btn} w-full mt-2">Save Changes</button></div></div>`;
}

async function addressesHtml(){
  const L=await getAddrs(), a=addrEdit;
  const backTarget = a ? 'window._cancelAddrEdit()' : '#/account/hub';
  return `<div class="max-w-md mx-auto space-y-4 my-2">
    ${topbar('Shopping Address', backTarget)}
    ${a?`<div class="bg-white rounded-3xl p-5 shadow-soft border border-gray-100 space-y-3"><b class="text-xs block text-gray-900 font-extrabold">${a.id?'Edit':'Add New'} Address</b>
      ${input('a-name','Full name',`value="${esc(a.name||'')}"`)}${input('a-phone','Mobile number',`maxlength="10" value="${esc(a.phone||profile()?.phone||'')}"`)}${input('a-pin','Pincode',`maxlength="6" value="${esc(a.pincode||'')}"`)}
      <div class="grid grid-cols-2 gap-2">${input('a-city','City',`value="${esc(a.city||'')}"`)}${input('a-state','State',`value="${esc(a.state||'Tamil Nadu')}"`)}</div>
      <label class="block text-xs font-semibold text-gray-700">Door no, street, area<textarea id="a-line" rows="2" class="mt-1 w-full border border-gray-200 rounded-2xl p-2.5 text-xs outline-none">${esc(a.line||'')}</textarea></label>
      <div class="flex gap-2 pt-2"><button id="asv" class="${btn} flex-1 !py-3">Save</button><button id="acn" class="px-5 py-2.5 border rounded-full text-xs font-bold">Cancel</button></div></div>`
    :`<button id="addA" class="bg-white border-2 border-dashed border-gray-300 hover:border-slate-900 rounded-3xl w-full py-3.5 font-bold text-xs text-slate-900 transition shadow-soft">+ Add New Address</button>`}
    <div class="space-y-3">${L.map(x=>`<div class="bg-white rounded-3xl p-4 shadow-soft border border-gray-100 text-xs"><div class="flex items-center justify-between"><b class="text-gray-900">${esc(x.name)}</b>${x.def?'<span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">DEFAULT</span>':''}</div>
      <p class="text-gray-500 mt-1">${esc(x.phone)}</p><p class="text-gray-700 mt-1 leading-relaxed">${esc(x.line)}, ${esc(x.city)}, ${esc(x.state)} - <b>${esc(x.pincode)}</b></p>
      <div class="mt-3 pt-2 border-t flex items-center justify-between font-bold text-[11px]"><button data-ad="${esc(x.id)}" class="text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Delete</button><div class="flex items-center gap-3">${x.def?'':`<button data-adef="${esc(x.id)}" class="text-gray-400 hover:text-gray-600 underline">Set as Default</button>`}<button data-ae="${esc(x.id)}" class="text-slate-900 hover:underline flex items-center gap-1">${ICONS.edit}Edit</button></div></div></div>`).join('')||(a?'':'<p class="text-center text-xs text-gray-400 py-8">No saved addresses.</p>')}</div></div>`;
}

async function wishHtml(){
  let wp=[];if(wish.size){try{const {data}=await sb.from('products').select('*').in('id',[...wish]);wp=data||[]}catch{}}
  return `<div class="max-w-4xl mx-auto space-y-4 my-2">${topbar('My Wishlist ('+wp.length+')','#/account/hub')}
    ${wp.length?grid(wp):'<div class="bg-white rounded-3xl p-12 text-center text-gray-400 text-xs border border-gray-100 shadow-soft">Your wishlist is empty.</div>'}</div>`;
}

async function account(section,params){
  const pf=profile();
  if(!pf&&section!=='orders'&&section!=='order-detail'){location.hash='#/login';return}
  if(section==='order-detail'){await orderDetailView(params.get('id')||'',pf);return}
  let body='';
  if(section==='orders')body=await ordersHtml(pf);
  else if(section==='profile')body=profileHtml(pf);
  else if(section==='addresses')body=await addressesHtml();
  else if(section==='wishlist')body=await wishHtml();
  else {
    app.className = 'max-w-6xl mx-auto px-4 pt-5 pb-20 sm:pb-28 sm:min-h-[75vh]';
    document.documentElement.classList.add('overflow-hidden', 'overscroll-none');
    document.body.classList.add('overflow-hidden', 'overscroll-none', 'touch-none');
    body = hubHtml(pf);
  }
  app.innerHTML=body;
  window._cancelAddrEdit = () => {
    addrEdit = null;
    history.back();
  };
  app.onclick=async e=>{
    const t=e.target,d=t.dataset,again=()=>account(section,params);
    if(t.id==='lgo' || t.closest('#lgo')){
      showNeonLoader();
      try {
        await clearProfile();
        toast('Logged out successfully');
        location.hash = '#/login';
        await loginView();
      } finally {
        hideNeonLoader();
      }
      return;
    }
    if(d.f){ofilter=d.f;again()}
    if(t.id==='ps'){
      const name=$('#pn').value.trim(),phone=$('#pp').value.trim();
      if(name.length<2)return toast('Enter your name');
      if(!/^[6-9]\d{9}$/.test(phone))return toast('Enter a valid mobile number');
      await setProfile(name,phone,pf.email,pf.google_name);toast('Saved ✓');location.hash='#/account/hub'}
    if(t.id==='addA'){
      addrEdit={};
      try { history.pushState({ inAddrEdit: true }, '', location.href); } catch(e){}
      again();
    }
    if(d.ae){
      showNeonLoader();
      try {
        const L=await getAddrs();
        addrEdit=L.find(x=>x.id===d.ae);
        try { history.pushState({ inAddrEdit: true }, '', location.href); } catch(e){}
        await again();
      } finally {
        hideNeonLoader();
      }
    }
    if(d.ad){
      const ok = await showModalDialog({
        title: 'Delete Address?',
        message: 'Are you sure you want to delete this saved delivery address from your account?',
        confirmText: 'Delete',
        cancelText: 'Keep Address',
        danger: true
      });
      if(ok){
        let L=await getAddrs();
        await setAddrs(L.filter(x=>x.id!==d.ad));
        toast('Address removed ✓');
        again();
      }
    }
    if(d.adef){let L=await getAddrs();await setAddrs(L.map(x=>({...x,def:x.id===d.adef})));again()}
    if(t.id==='acn'){
      addrEdit=null;
      history.back();
    }
    if(t.id==='asv'){
      const n={name:$('#a-name').value.trim(),phone:$('#a-phone').value.trim(),pincode:$('#a-pin').value.trim(),city:$('#a-city').value.trim(),state:$('#a-state').value.trim(),line:$('#a-line').value.trim()};
      if(!n.name||!n.city||!n.state||!n.line)return toast('Please fill all fields');
      if(!/^[6-9]\d{9}$/.test(n.phone))return toast('Enter a valid mobile number');
      if(!/^[1-9]\d{5}$/.test(n.pincode))return toast('Enter a valid 6-digit pincode');
      let L=await getAddrs();
      if(addrEdit.id){n.id=addrEdit.id;n.def=addrEdit.def;L=L.map(x=>x.id===n.id?n:x)}else{n.id=Date.now().toString(36);n.def=!L.length;L.push(n)}
      await setAddrs(L);addrEdit=null;toast('Address saved ✓');again()}
  };
}

