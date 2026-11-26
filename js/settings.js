/* ===== DYNAMIC SITE SETTINGS WITH USER-FRIENDLY ADMIN CONTROLS ===== */
const SET={
  brand:{name:'Thaarai Tex',tagline:'Pure Sarees & Handloom',logo:''},
  header:{searchPlaceholder:'சேலைகளைத் தேடுங்கள்… Search sarees',showShopLink:true,shopLinkLabel:'Shop'},
  hero:{
    eyebrow:'THAARAI TEX · HANDLOOM EDITION',
    title:'A legacy woven into every thread',
    subtitle:'Discover handpicked authentic sarees, crafted with the art and patience of master weavers.',
    button:'Explore the collection',
    buttonLink:'#/shop',
    secButton:'View all sarees',
    secButtonLink:'#/shop',
    image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    badge:'HANDLOOM · EST. WITH CARE'
  },
  home_categories:[
    { name: 'Sarees', subtitle: 'Exclusive Handloom', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', query: 'Sarees' },
    { name: 'Lungies', subtitle: 'Comfort & Heritage', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', query: 'Lungies' },
    { name: 'Soft Silk', subtitle: 'Royal & Elegant', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80', query: 'Soft Silk' },
    { name: 'Poonam', subtitle: 'Daily & Party Wear', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80', query: 'Poonam' },
    { name: 'Pattu', subtitle: 'Traditional Grandeur', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', query: 'Pattu' },
    { name: 'Cotton', subtitle: 'Breathable Pure Weave', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80', query: 'Cotton' }
  ],
  about:{
    badge:'Authentic Weaves',
    title:'Crafted with Tradition',
    text:'Thaarai Tex brings you handpicked, authentic handloom sarees directly from traditional weavers. Every piece reflects meticulous artistry, premium fabrics, and timeless elegance.',
    button:'Explore Collections',
    buttonLink:'#/shop',
    image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  },
  trust_badges:[
    {title: 'Free Delivery', desc: 'Direct to doorstep'},
    {title: 'Cash on Delivery', desc: 'Pay when you receive'},
    {title: 'Wholesale Price', desc: 'Direct weaver rates'},
    {title: '100% Handloom', desc: 'Pure authentic quality'}
  ],
  shop_ui:{
    title:'The collection',
    subtitle:'Explore our finest handwoven selections',
    fabrics:['Silk','Cotton','Semi Silk','Linen'],
    sortNewest:'Newest Arrivals',
    sortLow:'Price: Low to High',
    sortHigh:'Price: High to Low',
    emptyText:'பொருட்கள் எதுவும் இல்லை. No products found.'
  },
  account_ui:{
    title:'Your Profile Details',
    subtitle:'உங்கள் பெயர் மற்றும் மொபைல் எண்ணை உள்ளிடவும்.',
    supportText:'Contact support on WhatsApp',
    emptyOrders:'No orders yet. Start shopping'
  },
  footer:{
    about:'Handloom sarees direct from the weavers.',
    phone:'',
    email:'',
    address:'Melur, Tamil Nadu',
    whatsapp:'919999999999',
    upi:'yourname@upi',
    upiName:'Thaarai Tex',
    copyright:'© 2026 Thaarai Tex. All rights reserved.'
  }
};

function applySettings(){
  const b=SET.brand, f=SET.footer, h=SET.header||{};
  const brandEl=$('#brand');
  if(brandEl){
    if(b.logo){
      brandEl.innerHTML=`<img src="${esc(b.logo)}" alt="${esc(b.name)}" class="h-9 object-contain max-w-[160px]"><span class="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">${esc(b.tagline||'')}</span>`;
    }else{
      brandEl.innerHTML=`<span class="font-extrabold text-xl uppercase tracking-tight text-slate-900">${esc(b.name)}</span><span class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">${esc(b.tagline)}</span>`;
    }
  }
  if(h.searchPlaceholder){
    if($('#q')) $('#q').placeholder = h.searchPlaceholder;
    if($('#q2')) $('#q2').placeholder = h.searchPlaceholder;
  }
  const topShop = $('#top-shop-link');
  if(topShop){
    topShop.textContent = h.shopLinkLabel || 'Shop';
    topShop.style.display = h.showShopLink === false ? 'none' : '';
  }
  const footEl=$('#foot');
  if(footEl){
    footEl.innerHTML=`<div class="max-w-6xl mx-auto px-4 grid sm:grid-cols-3 gap-6 text-left"><div><b class="text-white text-sm">${esc(b.name)}</b><p class="mt-2 leading-relaxed text-gray-400">${esc(f.about)}</p></div>
     <div><b class="text-white text-sm">Contact</b><p class="mt-2 leading-6 text-gray-400">${f.phone?`${ICONS.phone}<a href="tel:${esc(f.phone)}">${esc(f.phone)}</a><br>`:''}${f.email?`${ICONS.mail}${esc(f.email)}<br>`:''}${f.address?`${ICONS.mapPin}${esc(f.address)}`:''}</p></div>
     <div><b class="text-white text-sm">Quick links</b><p class="mt-2 leading-7 text-gray-400"><a href="#/shop" class="underline">Shop</a> · <a href="#/account/orders" class="underline">My Orders</a><br><a class="underline" target="_blank" rel="noopener" href="https://wa.me/${esc(f.whatsapp)}">${ICONS.whatsapp}WhatsApp support</a></p></div></div>
     <p class="mt-6 text-center text-gray-500 text-[11px]">${esc(f.copyright || `© ${new Date().getFullYear()} ${b.name}. All rights reserved.`)}</p>`;
  }
}
applySettings();

async function loadSiteSettings(){
  if(!sb)return;
  try{
    const {data,error}=await sb.from('store_settings').select('key,value');
    if(error)throw error;
    for(const row of data||[]){
      if(row.key && row.value !== undefined){
        SET[row.key]=row.value;
      }
    }
    WHATSAPP=SET.footer?.whatsapp||WHATSAPP;
    UPI_ID=SET.footer?.upi||UPI_ID;
    UPI_NAME=SET.footer?.upiName||UPI_NAME;
    applySettings();
  }catch{}
}
 
function setNav(){
  const p=profile(), txt=$('#lgn-txt');
  if(txt)txt.textContent=p?p.name.split(' ')[0]:'Login';
  if($('#lgn')) $('#lgn').href=p?'#/account/hub':'#/login';
  if($('#tbp')) $('#tbp').href=p?'#/account/hub':'#/login';
}
async function loadUserData(){
  wish = new Set();
  const p = profile();
  if(!p){await loadCartCloud();return;}
  try{
    if(sb){
      const {data:cData}=await sb.rpc('get_user_cart',{p_phone:p.phone});
      if(cData&&Array.isArray(cData)){cart=cData;store.set('cart',cart);}
      else{await saveCartCloud();}
      const {data:wData}=await sb.rpc('get_wishlist',{p_phone:p.phone});
      (wData||[]).forEach(x=>wish.add(x));
    }
  }catch{}
  saveCartBadge();
  setNav();
}
async function setProfile(name, phone, email='', google_name=''){
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  const existing = store.get('profile') || {};
  const finalEmail = email || existing.email || '';
  const finalGoogleName = google_name || existing.google_name || '';
  const profileData = { name, phone: cleanPhone, email: finalEmail, google_name: finalGoogleName };
  store.set('profile', profileData);
  OC={list:[]};ofilter='all';addrEdit=null;
  try{
    if(sb && cleanPhone){
      const upsertPayload = {
        phone: cleanPhone,
        name: name,
        email: finalEmail || null,
        customer_id: 'TT-CUST-' + cleanPhone.slice(-4),
        last_active: new Date().toISOString()
      };
      if(finalGoogleName){
        upsertPayload.notes = `Google Verified Name: ${finalGoogleName}`;
      }
      await sb.from('customers').upsert(upsertPayload, { onConflict: 'phone' });
    }
  }catch(e){
    console.error('Customer upsert error:', e);
  }
  await loadUserData();
  setNav();
}
async function clearProfile(){
  // 1. Set explicit logged out flag
  localStorage.setItem('tt_logged_out', '1');
  localStorage.removeItem('profile');
  localStorage.removeItem('tt_oauth_pending');
  localStorage.removeItem('tt_oauth_in_flight');
  localStorage.removeItem('tt_confirming_details');
  sessionStorage.removeItem('tt_confirming_details');
  sessionStorage.removeItem('tt_cached_google_user');
  sessionStorage.removeItem('tt_oauth_pending');
  sessionStorage.removeItem('tt_pending_name');
  sessionStorage.removeItem('tt_pending_phone');
  localStorage.removeItem('tt_pending_name');
  localStorage.removeItem('tt_pending_phone');
  window._cachedGoogleUser = null;
  window._confirmLoginState = null;
  window._confirmingDetails = false;
  confirmArmed = false;
  _incomingOAuthCode = null;
  _oauthUserPromise = null;

  // 2. Perform Supabase signOut
  try {
    if(sb){
      await sb.auth.signOut();
    }
  } catch(e){}

  // 3. Purge all cached Supabase tokens from localStorage
  try {
    for(let key of Object.keys(localStorage)){
      if(key.startsWith('sb-') && (key.endsWith('-auth-token') || key.endsWith('-token-code-verifier'))){
        localStorage.removeItem(key);
      }
    }
  } catch(e){}

  cart=[];saveCart();wish=new Set();OC={list:[]};ofilter='all';addrEdit=null;setNav();
}

let _oauthUserPromise = null;
async function resolveOAuthUser(){
  if(!sb) return null;
  // If explicitly logged out and no OAuth is in flight, do not revive old session
  if(localStorage.getItem('tt_logged_out') === '1' && !localStorage.getItem('tt_oauth_in_flight') && !sessionStorage.getItem('tt_oauth_pending') && !_incomingOAuthCode){
    return null;
  }

  if(_oauthUserPromise) return _oauthUserPromise;

  _oauthUserPromise = (async () => {
    try {
      // 1. Check if active session already exists in Supabase
      try {
        const { data: s } = await sb.auth.getSession();
        if(s?.session?.user) return s.session.user;
      } catch(e){}

      // 2. If PKCE code exists, explicitly exchange it
      const code = _incomingOAuthCode || new URLSearchParams(window.location.search || '').get('code');
      if(code){
        try {
          const { data, error } = await sb.auth.exchangeCodeForSession(code);
          if(data?.user) return data.user;
          if(data?.session?.user) return data.session.user;
        } catch(err){
          console.warn('exchangeCodeForSession info:', err);
        }
      }

      // 3. Poll for up to 3.5s for session detection by Supabase client
      for(let i = 0; i < 14; i++){
        try {
          const { data: s } = await sb.auth.getSession();
          if(s?.session?.user) return s.session.user;
          const { data: u } = await sb.auth.getUser();
          if(u?.user) return u.user;
        } catch(e){}

        for(let key of Object.keys(localStorage)){
          if(key.startsWith('sb-') && key.endsWith('-auth-token')){
            try {
              const parsed = JSON.parse(localStorage.getItem(key));
              if(parsed?.user) return parsed.user;
            } catch(e){}
          }
        }
        await new Promise(r => setTimeout(r, 250));
      }

      // 4. Final session checks
      const { data: sData } = await sb.auth.getSession();
      if(sData?.session?.user) return sData.session.user;
      const { data: uData } = await sb.auth.getUser();
      if(uData?.user) return uData.user;
    } catch(e){
      console.warn('resolveOAuthUser error:', e);
    }
    return null;
  })();

  return _oauthUserPromise;
}

async function initAuth(){
  try{
    const p = profile();
    // Safety check: remove any unwanted placeholder or mock login like 9876543210
    if(p && (p.phone === '9876543210' || p.phone === '9999999999' || !p.phone || !p.name)){
      localStorage.removeItem('profile');
    }
    // If user closed the website/tab before completing Name & Number login, purge incomplete OAuth session & open at Home page
    const isFreshOpen = !sessionStorage.getItem('tt_tab_opened');
    sessionStorage.setItem('tt_tab_opened', '1');
    const hasCompletedProfile = !!profile();
    const hasActiveOAuthFlow = _isOAuthIncoming || sessionStorage.getItem('tt_oauth_pending') === '1' || sessionStorage.getItem('tt_confirming_details') === '1';
    if(!hasCompletedProfile && !hasActiveOAuthFlow){
      window._cachedGoogleUser = null;
      window._confirmLoginState = null;
      window._confirmingDetails = false;
      localStorage.removeItem('tt_confirming_details');
      localStorage.removeItem('tt_oauth_pending');
      localStorage.removeItem('tt_oauth_in_flight');
      sessionStorage.removeItem('tt_cached_google_user');
      for(let key of Object.keys(localStorage)){
        if(key.startsWith('sb-') && (key.endsWith('-auth-token') || key.endsWith('-token-code-verifier'))){
          localStorage.removeItem(key);
        }
      }
      if(sb){ try{ await sb.auth.signOut(); }catch(e){} }
      if(isFreshOpen && location.hash && location.hash !== '#/' && location.hash !== '#'){
        try {
          history.replaceState(null, '', window.location.pathname + window.location.search + '#/');
        } catch(e){}
        location.hash = '#/';
      }
    }
  }catch(e){}
  setNav();
  await loadUserData();
}
async function toggleWish(id){
  const p=profile();
  if(!p){toast('Login to save to your wishlist');location.hash='#/login';return}
  try{
    if(sb){
      const {data,error}=await sb.rpc('toggle_wishlist',{p_phone:p.phone,p_product:id});
      if(error)return toast('Could not update wishlist');
      data?wish.add(id):wish.delete(id);
    }
    document.querySelectorAll(`[data-w="${id}"]`).forEach(b=>{b.innerHTML=heart(wish.has(id))});
    if((location.hash||'').startsWith('#/account/wishlist'))route();
  }catch{toast('Could not update wishlist');}
}

/* ===== CART ===== */
function addCart(id,qty=1,max=10){
  const e=cart.find(i=>i.id===id);
  if(e){if(e.qty+qty>max)return toast('Max stock reached');e.qty+=qty}else cart.push({id,qty});
  saveCart();toast('Added to bag ✓');
}
async function cartLines(){
  if(!cart.length)return[];
  try{
    if(sb){
      const {data}=await sb.from('products').select('*').in('id',cart.map(i=>i.id));
      return cart.map(i=>({...i,p:(data||[]).find(p=>p.id===i.id)})).filter(l=>l.p);
    }
  }catch{}
  return [];
}
async function couponDiscount(sub){
  if(!coupon || !sb)return 0;
  try{
    const {data, error}=await sb.rpc('check_coupon',{p_code:coupon,p_subtotal:sub});
    if(!error && Number(data)>0) return Number(data);
  }catch(e){}
  try{
    const {data, error}=await sb.from('coupons').select('*').ilike('code',coupon).eq('active',true).maybeSingle();
    if(!error && data){
      const minTotal = Number(data.min_total || data.minimum_order || 0);
      if(sub >= minTotal){
        const pct = Number(data.percent || data.discount_percent || data.discount || 0);
        if(pct > 0){
          return Math.round((sub * pct) / 100);
        }
      }
    }
  }catch(e){}
  return 0;
}


