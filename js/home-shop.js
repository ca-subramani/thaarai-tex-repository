/* ===== CARDS & VIEWS ===== */
function card(p){
  const o=off(p);
  return `<a href="#/p/${p.id}" class="block group">
   <div class="relative aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-soft">
    <img loading="lazy" src="${img(p)}" alt="${esc(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
    <button data-w="${p.id}" aria-label="Wishlist" class="absolute top-3 right-3 bg-white/90 backdrop-blur w-8 h-8 rounded-full shadow-sm grid place-items-center">${heart(wish.has(p.id))}</button>
    ${p.stock<=0?'<div class="absolute inset-0 bg-white/80 backdrop-blur-sm grid place-items-center text-xs font-bold text-gray-800">Out of stock</div>':''}
   </div>
   <div class="pt-3 px-1.5"><h3 class="font-semibold text-xs sm:text-sm line-clamp-1 text-gray-800">${esc(p.name)}</h3>
    <div class="mt-0.5 flex items-baseline gap-2 flex-wrap"><b class="text-sm sm:text-base text-gray-900">${inr(p.price)}</b>${o?`<s class="text-xs text-gray-400">${inr(p.mrp)}</s>`:''}</div>
    ${p.stock>0&&p.stock<5?`<p class="text-[10px] text-amber-600 font-semibold">Only ${p.stock} left</p>`:''}</div></a>`;
}
const grid=ps=>ps.length?`<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">${ps.map(card).join('')}</div>`:`<p class="text-center text-gray-400 py-16 text-xs">${esc(SET.shop_ui?.emptyText || 'பொருட்கள் எதுவும் இல்லை. No products found.')}</p>`;
const input=(id,label,extra='')=>`<label class="block text-xs font-semibold text-gray-700 mb-1">${label}<input id="${id}" ${extra} class="mt-1 w-full border border-gray-200 bg-white rounded-2xl p-3 text-xs outline-none focus:border-slate-900 transition"></label>`;
const btn='bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-full text-xs sm:text-sm transition disabled:opacity-50 shadow-soft';
const topbar=(title,back)=>`<div class="flex items-center justify-between px-1"><button onclick="${back.startsWith('#')?`location.hash='${back}'`:back}" aria-label="Back" class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-soft border border-gray-100">${ICONS.back}</button><h1 class="text-base font-extrabold text-gray-900">${title}</h1><div class="w-9"></div></div>`;
const loginNeeded=msg=>`<div class="max-w-md mx-auto text-center py-14 bg-white rounded-3xl p-8 border border-gray-100 shadow-soft my-4 space-y-3"><p class="text-xs text-gray-500">${msg}</p><a href="#/login" class="${btn} inline-block !py-2.5">Sign in to your account</a></div>`;

/* ===== HOME & SHOP ===== */
let cachedTrending = null;
async function home(){
  const heroData = SET.hero || {};

  let featured = cachedFeatured;
  let trending = cachedTrending;
  if ((!cachedFeatured || !cachedTrending) && sb) {
    try {
      const { data } = await sb.from('products').select('*').eq('active', true).order('created_at', { ascending: false }).limit(4);
      if (data && data.length) {
        cachedTrending = data;
        cachedFeatured = data[0];
        trending = cachedTrending;
        featured = cachedFeatured;
      }
    } catch {}
  }

  const photo = heroData.image || featured?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
  const promoPhoto = SET.about?.image || trending?.[1]?.images?.[0] || photo;
  const mainBtnLink = heroData.buttonLink || '#/shop';
  const secBtnLink = heroData.secButtonLink || '#/shop?sort=discount';

  const trustBadges = (SET.trust_badges?.length ? SET.trust_badges : [
    {title: 'Free Shipping', desc: 'On orders above ₹999'},
    {title: 'Secure Payments', desc: '100% secure checkout'},
    {title: 'Easy Returns', desc: 'Hassle-free returns'}
  ]).slice(0, 3);
  const trustIcons = [ICONS.truck, ICONS.cash, ICONS.tag];

  const renderTrendingCard = p => {
    const o = off(p);
    return `
      <a href="#/p/${p.id}" class="group bg-white/95 hover:bg-white rounded-2xl p-3 shadow-[0_10px_28px_rgba(30,27,75,0.18)] transition duration-300 flex flex-col justify-between border border-white/60">
        <div class="relative aspect-square rounded-xl overflow-hidden bg-violet-50/70 mb-2.5">
          <img loading="lazy" src="${img(p)}" alt="${esc(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <button data-w="${p.id}" aria-label="Wishlist" class="absolute top-2 right-2 bg-white/90 backdrop-blur w-7 h-7 rounded-full shadow-xs grid place-items-center text-slate-600 hover:text-rose-500 transition">${heart(wish.has(p.id))}</button>
          ${p.stock<=0?'<div class="absolute inset-0 bg-white/80 backdrop-blur-xs grid place-items-center text-[10px] font-bold text-slate-800">Out of stock</div>':''}
        </div>
        <div>
          <h3 class="font-bold text-xs text-slate-900 line-clamp-1">${esc(p.name)}</h3>
          <div class="mt-1.5 flex items-center justify-between gap-1.5 flex-wrap">
            <div class="flex items-baseline gap-1.5">
              <b class="text-xs sm:text-sm font-extrabold text-slate-900">${inr(p.price)}</b>
              ${o?`<s class="text-[10px] text-slate-400">${inr(p.mrp)}</s>`:''}
            </div>
            ${o?`<span class="text-[9px] font-extrabold text-white bg-violet-600 px-2 py-0.5 rounded-full uppercase">${o}% OFF</span>`:''}
          </div>
        </div>
      </a>
    `;
  };

  app.innerHTML=`
  <div class="relative overflow-hidden rounded-[1.75rem] p-5 sm:p-8 lg:p-10 shadow-[0_24px_60px_rgba(76,29,149,0.22)] mb-4" style="background:radial-gradient(circle at 42% 16%, #f5f3ff 0%, #ddd6fe 28%, #7c3aed 64%, #4c1d95 100%);">

    <!-- 1. Hero Section -->
    <section class="relative grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr] pt-2 pb-7">
      <div class="relative z-10 space-y-4">
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.08]">
          ${heroData.title ? esc(heroData.title) : 'Better Sarees.<br>A Brighter You.'}
        </h1>
        <p class="text-xs sm:text-sm text-slate-700 max-w-md leading-relaxed font-medium">
          ${esc(heroData.subtitle || 'Discover handpicked authentic sarees, curated for your everyday elegance & celebrations.')}
        </p>
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <a href="${esc(mainBtnLink)}" class="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 text-xs font-extrabold shadow-lg shadow-violet-600/30 transition active:scale-[0.98]">
            <span>${esc(heroData.button || 'Shop Now')}</span>
            <span aria-hidden="true">→</span>
          </a>
          <a href="${esc(secBtnLink)}" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 hover:text-violet-900 transition">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
            <span>${esc(heroData.secButton || 'Explore Deals')}</span>
          </a>
        </div>
      </div>

      <!-- Featured Visual + Floating Offer Badge -->
      <div class="relative flex items-center justify-center lg:justify-end">
        <div class="relative w-full max-w-[270px] sm:max-w-[320px] aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_45px_rgba(46,16,101,0.3)] border border-white/40 bg-white/20 backdrop-blur-sm">
          <img src="${esc(photo)}" alt="Featured Saree" class="w-full h-full object-cover" loading="eager">
        </div>
        <div class="absolute top-3 right-2 sm:right-0 bg-white/85 backdrop-blur-md border border-white/70 rounded-2xl px-3.5 py-2 shadow-lg flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </span>
          <div class="leading-tight">
            <p class="text-[10px] font-extrabold text-slate-900">${esc(heroData.badge || 'Up to 50% OFF')}</p>
            <p class="text-[9px] font-semibold text-slate-500">Handloom Picks</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Frosted Glass Trust Strip -->
    <section class="mb-8 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 px-4 py-3.5 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        ${trustBadges.map((t,idx)=>`
          <div class="flex items-center gap-3 text-white">
            <div class="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 text-white">
              ${trustIcons[idx % trustIcons.length]}
            </div>
            <div class="min-w-0">
              <h4 class="font-extrabold text-xs text-white truncate">${esc(t.title)}</h4>
              <p class="text-[10px] text-violet-100/85 truncate">${esc(t.desc)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- 3. Trending Picks (4-Column Grid) -->
    <section class="mb-8">
      <div class="flex items-end justify-between mb-4 px-0.5">
        <div>
          <h2 class="font-extrabold text-lg sm:text-xl text-white tracking-tight">Trending Picks</h2>
          <p class="text-[11px] sm:text-xs text-violet-100/85 mt-0.5">Loved by thousands, just for you.</p>
        </div>
        <a href="#/shop" class="inline-flex items-center gap-1 text-xs font-bold text-white/95 hover:text-white transition">
          <span>View All</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>

      ${(trending && trending.length)
        ? `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">${trending.map(renderTrendingCard).join('')}</div>`
        : `<p class="text-center text-violet-100 py-8 text-xs">Loading trending sarees…</p>`
      }
    </section>

    <!-- 4. Special Offers Banner -->
    <section class="rounded-2xl bg-gradient-to-r from-violet-300/35 via-violet-100/80 to-white/95 backdrop-blur-md border border-white/50 p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4 w-full sm:w-auto">
        <img src="${esc(promoPhoto)}" alt="Special Offers" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md border border-white/70 shrink-0">
        <div>
          <h3 class="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">Special Offers<br>Just for You</h3>
          <p class="text-[11px] text-slate-600 mt-1">Get exclusive deals and early festive access.</p>
        </div>
      </div>
      <a href="#/shop" class="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-violet-50 text-slate-900 border border-slate-200/80 px-5 py-2.5 text-xs font-extrabold shadow-sm transition shrink-0">
        <span>Explore Offers</span>
        <span aria-hidden="true">→</span>
      </a>
    </section>

  </div>
  `;
  try {
    const welcomeMsg = sessionStorage.getItem('tt_welcome_toast');
    if(welcomeMsg){
      sessionStorage.removeItem('tt_welcome_toast');
      setTimeout(() => toast(welcomeMsg), 150);
    }
  } catch(e){}
}

let cachedCats = null;
let cachedFeatured = null;

async function shop(params){
  const $$ = s => Array.from(document.querySelectorAll(s));

  const f = {
    q: params.get('q') || '',
    cat: params.get('cat') || '',
    fabric: params.get('fabric') || '',
    rating: params.get('rating') || '',
    min: params.get('min') || '',
    max: params.get('max') || '',
    sort: params.get('sort') || 'new',
    stock: params.get('stock') || '',
    color: params.get('color') || ''
  };

  let cats = cachedCats || [];
  if(!cachedCats && sb){
    try {
      const res = await sb.from('categories').select('*').order('name');
      cachedCats = res.data || [];
      cats = cachedCats;
    } catch(e){}
  }

  let q = sb ? sb.from('products').select('*').eq('active', true) : null;
  let data = [];
  if(q){
    if(f.q) q = q.or(`name.ilike.%${f.q.replace(/[%,()]/g,'')}%,description.ilike.%${f.q.replace(/[%,()]/g,'')}%`);
    
    // OR condition for categories / fabrics combinations when user selects multiple options
    const catList = (f.cat && f.cat !== 'All Categories' && f.cat !== 'all') ? f.cat.split(',').map(s=>s.trim()).filter(Boolean) : [];
    const fabList = (f.fabric && f.fabric !== 'All Fabrics' && f.fabric !== 'all') ? f.fabric.split(',').map(s=>s.trim()).filter(Boolean) : [];

    if(catList.length > 0 || fabList.length > 0){
      const orClauses = [];
      
      // Category conditions (OR)
      catList.forEach(cVal => {
        const cleanVal = cVal.replace(/[-_]/g, ' ').replace(/[%,()]/g, '').trim();
        const matchedCat = cats.find(c => String(c.id) === String(cVal) || (c.name && c.name.toLowerCase() === cleanVal.toLowerCase()) || (c.slug && c.slug.toLowerCase() === cVal.toLowerCase()));
        if(matchedCat && matchedCat.id && !isNaN(Number(matchedCat.id))){
          orClauses.push(`category_id.eq.${matchedCat.id}`);
        } else if(!isNaN(Number(cVal))){
          orClauses.push(`category_id.eq.${cVal}`);
        }
        if(cleanVal){
          orClauses.push(`fabric.ilike.%${cleanVal}%`);
          orClauses.push(`name.ilike.%${cleanVal}%`);
          orClauses.push(`description.ilike.%${cleanVal}%`);
        }
      });

      // Fabric conditions (OR)
      fabList.forEach(fb => {
        const cleanFb = fb.replace(/[%,()]/g, '').trim();
        if(cleanFb){
          orClauses.push(`fabric.ilike.%${cleanFb}%`);
          orClauses.push(`name.ilike.%${cleanFb}%`);
        }
      });

      if(orClauses.length){
        q = q.or(orClauses.join(','));
      }
    }
    if(f.color){
      const colList = f.color.split(',').map(s=>s.trim()).filter(Boolean);
      if(colList.length === 1) q = q.ilike('color', `%${colList[0]}%`);
      else if(colList.length > 1) q = q.or(colList.map(cl => `color.ilike.%${cl.replace(/[%,()]/g,'')}%`).join(','));
    }
    if(f.min) q = q.gte('price', +f.min);
    if(f.max) q = q.lte('price', +f.max);
    if(f.stock) q = q.gt('stock', 0);

    if(f.sort === 'low') q = q.order('price');
    else if(f.sort === 'high') q = q.order('price', {ascending: false});
    else if(f.sort === 'discount') q = q.order('mrp', {ascending: false});
    else q = q.order('created_at', {ascending: false});

    try {
      const res = await q;
      data = res.data || [];
    } catch(err){
      try {
        const fallbackRes = await sb.from('products').select('*').eq('active', true);
        data = fallbackRes.data || [];
      } catch(e2){}
    }
  }

  // Client-side ratings & custom sorting/filtering
  let ratingsMap = {};
  try {
    if(sb && (f.rating || f.sort === 'rating')){
      const { data: revData } = await sb.from('reviews').select('product_id, rating');
      if(revData && revData.length > 0){
        const counts = {}, sums = {};
        revData.forEach(r => {
          counts[r.product_id] = (counts[r.product_id] || 0) + 1;
          sums[r.product_id] = (sums[r.product_id] || 0) + (r.rating || 0);
        });
        Object.keys(counts).forEach(pid => {
          ratingsMap[pid] = sums[pid] / counts[pid];
        });
      }
    }
  } catch(e){}

  if(f.rating){
    const minR = Number(f.rating);
    if(minR > 0){
      data = data.filter(p => {
        const r = ratingsMap[p.id] !== undefined ? ratingsMap[p.id] : (p.rating ? Number(p.rating) : 4.5);
        return r >= minR;
      });
    }
  }

  if(f.sort === 'rating'){
    data.sort((a,b) => {
      const rA = ratingsMap[a.id] !== undefined ? ratingsMap[a.id] : (a.rating ? Number(a.rating) : 4.5);
      const rB = ratingsMap[b.id] !== undefined ? ratingsMap[b.id] : (b.rating ? Number(b.rating) : 4.5);
      return rB - rA;
    });
  } else if(f.sort === 'discount'){
    data.sort((a,b) => {
      const dA = a.mrp && a.price ? (a.mrp - a.price) / a.mrp : 0;
      const dB = b.mrp && b.price ? (b.mrp - b.price) / b.mrp : 0;
      return dB - dA;
    });
  }

  // Standard category options
  const defaultCats = [
    { id: '', name: 'All Categories' },
    { id: 'Cotton', name: 'Cotton' },
    { id: 'Silk', name: 'Silk' },
    { id: 'Poonam', name: 'Poonam' },
    { id: 'Soft Silk', name: 'Soft Silk' },
    { id: 'Pure Silk', name: 'Pure Silk' },
    { id: 'Kanjivaram', name: 'Kanjivaram' },
    { id: 'Handloom', name: 'Handloom' },
    { id: 'Fancy Sarees', name: 'Fancy Sarees' },
    { id: 'Daily Wear', name: 'Daily Wear' }
  ];
  const allCategoryOptions = [{ id: '', name: 'All Categories' }];
  if(cats && cats.length){
    cats.forEach(c => {
      if(!allCategoryOptions.some(x => x.name.toLowerCase() === c.name.toLowerCase())){
        allCategoryOptions.push({ id: c.name, name: c.name, dbId: c.id });
      }
    });
  }
  defaultCats.slice(1).forEach(dc => {
    if(!allCategoryOptions.some(x => x.name.toLowerCase() === dc.name.toLowerCase())){
      allCategoryOptions.push(dc);
    }
  });

  const allFabrics = [
    { val: '', label: 'All Fabrics' },
    { val: 'Cotton', label: 'Cotton' },
    { val: 'Silk', label: 'Silk' },
    { val: 'Poonam', label: 'Poonam' },
    { val: 'Soft Silk', label: 'Soft Silk' },
    { val: 'Pure Silk', label: 'Pure Silk' },
    { val: 'Linen', label: 'Linen' },
    { val: 'Georgette', label: 'Georgette' },
    { val: 'Chiffon', label: 'Chiffon' },
    { val: 'Rayon', label: 'Rayon' },
    { val: 'Banarasi', label: 'Banarasi' },
    { val: 'Organza', label: 'Organza' },
    { val: 'Semi Silk', label: 'Semi Silk' },
    { val: 'Art Silk', label: 'Art Silk' },
    { val: 'Crepe', label: 'Crepe' }
  ];

  const allRatings = [
    { val: '', label: 'All Ratings' },
    { val: '4', label: '4★ & above' },
    { val: '3', label: '3★ & above' },
    { val: '2', label: '2★ & above' }
  ];

  const allPriceTiers = [
    { min: '', max: '', label: 'All Prices' },
    { min: '', max: '1000', label: 'Under ₹1,000' },
    { min: '1000', max: '2500', label: '₹1,000 - ₹2,500' },
    { min: '2500', max: '5000', label: '₹2,500 - ₹5,000' },
    { min: '5000', max: '', label: 'Above ₹5,000' }
  ];

  const allAvailability = [
    { val: '', label: 'All Sarees' },
    { val: '1', label: 'In Stock Only' }
  ];

  const allColours = [
    { val: '', label: 'All Colours', hex: '' },
    { val: 'Red', label: 'Red', hex: '#ef4444' },
    { val: 'Pink', label: 'Pink', hex: '#ec4899' },
    { val: 'Blue', label: 'Blue', hex: '#3b82f6' },
    { val: 'Green', label: 'Green', hex: '#10b981' },
    { val: 'Yellow', label: 'Yellow', hex: '#eab308' },
    { val: 'Maroon', label: 'Maroon', hex: '#881337' },
    { val: 'Purple', label: 'Purple', hex: '#a855f7' },
    { val: 'Black', label: 'Black', hex: '#0f172a' },
    { val: 'Orange', label: 'Orange', hex: '#f97316' },
    { val: 'White', label: 'White', hex: '#f8fafc', border: true },
    { val: 'Peach', label: 'Peach', hex: '#fdba74' },
    { val: 'Navy Blue', label: 'Navy Blue', hex: '#1e3a8a' },
    { val: 'Grey', label: 'Grey', hex: '#64748b' },
    { val: 'Multicolor', label: 'Multicolor', gradient: true }
  ];

  const allSorts = [
    { val: 'new', label: 'Newest Arrivals' },
    { val: 'low', label: 'Price: Low to High' },
    { val: 'high', label: 'Price: High to Low' },
    { val: 'rating', label: 'Top Rated & Reviews' },
    { val: 'discount', label: 'Biggest Discounts' }
  ];

  // Helper labels for active badges (dots only show when an actual filter is selected, never for All)
  const currentCatLabel = (f.cat && f.cat !== 'All Categories' && f.cat !== 'all') ? f.cat : '';
  const currentFabLabel = (f.fabric && f.fabric !== 'All Fabrics' && f.fabric !== 'all') ? f.fabric : '';

  const currentRatingLabel = f.rating ? `${f.rating}★ & above` : '';
  const currentPriceLabel = (f.min || f.max) ? (f.min && f.max ? `₹${f.min}-₹${f.max}` : f.min ? `>₹${f.min}` : `<₹${f.max}`) : '';
  const currentAvailLabel = f.stock ? 'In Stock' : '';
  const currentColorLabel = f.color || '';
  const currentSortObj = allSorts.find(s => s.val === f.sort);
  const currentSortLabel = (currentSortObj && f.sort !== 'new') ? currentSortObj.label : '';

  app.innerHTML = `
  <div class="space-y-4">
    
    <!-- Top Filter & Sort Bar (Clean buttons on both Desktop and Mobile) -->
    <div class="w-full max-w-xl mx-auto grid grid-cols-2 gap-3 px-1">
      <button id="ftg" type="button" class="flex items-center justify-center gap-2.5 bg-white rounded-2xl px-5 py-3.5 text-sm font-bold border-2 border-gray-200 shadow-soft text-slate-900 hover:border-slate-900 transition">
        ${ICONS.filter} <span>Filters</span>
      </button>
      <button id="sort-open" type="button" class="flex items-center justify-center gap-2.5 bg-white rounded-2xl px-5 py-3.5 text-sm font-bold border-2 border-gray-200 shadow-soft text-slate-900 hover:border-slate-900 transition">
        <span class="text-base">↕</span> <span>Sort By</span>
      </button>
    </div>

    <!-- Flipkart/Amazon Style 2-Column Split Filter Page Modal (Left categories tab, Right options panel) -->
    <div id="fl" class="hidden fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0 w-full h-[100dvh] z-[99999] bg-white flex flex-col md:bg-slate-900/50 md:backdrop-blur-sm md:items-center md:justify-center p-0 md:p-6 overscroll-contain" style="top:0;left:0;right:0;bottom:0;margin:0;">
      <div class="w-full h-full md:h-[88vh] md:max-w-4xl bg-white md:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        <!-- Filter Top Bar with Back Button -->
        <div class="sticky top-0 z-20 flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-3.5 bg-white border-b border-gray-100 shrink-0">
          <div class="flex items-center gap-3">
            <button id="filter-close" type="button" aria-label="Close filters" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h2 class="text-base font-extrabold text-slate-900">Filters</h2>
          </div>
          <button id="f-reset" type="button" class="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-full hover:bg-rose-50 transition">Clear All</button>
        </div>

        <!-- Split Filter Body: Left Sidebar (Categories list ~38%) + Right Panel (Options content ~62%) -->
        <div class="flex-1 flex overflow-hidden min-h-0">
          
          <!-- Left Sidebar Menu Tabs -->
          <div class="w-[38%] max-w-[200px] sm:max-w-[240px] bg-slate-50 border-r border-gray-200 overflow-y-auto no-scrollbar py-2 shrink-0 flex flex-col">
            <button type="button" class="f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-bold text-sm transition border-l-4 border-slate-900 bg-white text-slate-950 shadow-sm" data-tab="categories">
              <span class="truncate">Categories</span>
              <span class="f-badge w-2 h-2 rounded-full bg-rose-500 shrink-0 ${currentCatLabel ? '' : 'hidden'}" id="badge-categories"></span>
            </button>

            <button type="button" class="f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-semibold text-sm transition border-l-4 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60" data-tab="fabric">
              <span class="truncate">Fabric</span>
              <span class="f-badge w-2 h-2 rounded-full bg-rose-500 shrink-0 ${currentFabLabel ? '' : 'hidden'}" id="badge-fabric"></span>
            </button>

            <button type="button" class="f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-semibold text-sm transition border-l-4 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60" data-tab="ratings">
              <span class="truncate">Ratings</span>
              <span class="f-badge w-2 h-2 rounded-full bg-rose-500 shrink-0 ${currentRatingLabel ? '' : 'hidden'}" id="badge-ratings"></span>
            </button>

            <button type="button" class="f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-semibold text-sm transition border-l-4 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60" data-tab="price">
              <span class="truncate">Price</span>
              <span class="f-badge w-2 h-2 rounded-full bg-rose-500 shrink-0 ${currentPriceLabel ? '' : 'hidden'}" id="badge-price"></span>
            </button>

            <button type="button" class="f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-semibold text-sm transition border-l-4 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60" data-tab="availability">
              <span class="truncate">Availability</span>
              <span class="f-badge w-2 h-2 rounded-full bg-rose-500 shrink-0 ${currentAvailLabel ? '' : 'hidden'}" id="badge-availability"></span>
            </button>

            <button type="button" class="f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-semibold text-sm transition border-l-4 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60" data-tab="colour">
              <span class="truncate">Colour</span>
              <span class="f-badge w-2 h-2 rounded-full bg-rose-500 shrink-0 ${currentColorLabel ? '' : 'hidden'}" id="badge-colour"></span>
            </button>

            <button type="button" class="f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-semibold text-sm transition border-l-4 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60" data-tab="sort">
              <span class="truncate">Sort</span>
              <span class="f-badge w-2 h-2 rounded-full bg-rose-500 shrink-0 ${currentSortLabel ? '' : 'hidden'}" id="badge-sort"></span>
            </button>
          </div>

          <!-- Right Content Panel (Options expansions) -->
          <div class="flex-1 bg-white overflow-y-auto p-4 sm:p-5">
            
            <!-- Panel: Categories -->
            <div id="tab-panel-categories" class="f-tab-panel space-y-2.5">
              ${allCategoryOptions.map(c => {
                const optVal = c.id ? c.id : (c.name === 'All Categories' ? '' : c.name);
                const isSel = (!f.cat && !optVal) || (f.cat && optVal && f.cat.split(',').map(s=>s.trim().toLowerCase()).includes(optVal.toLowerCase()));
                return `
                <label class="f-opt-row flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${isSel ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-gray-200 bg-white text-slate-800 font-semibold hover:border-gray-300'}" data-type="cat" data-val="${esc(optVal)}" data-label="${esc(c.name)}">
                  <span class="text-sm capitalize">${esc(c.name)}</span>
                  <div class="f-check w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-white bg-white text-slate-900 font-black text-xs' : 'border-gray-300 bg-white'}">${isSel ? '✓' : ''}</div>
                  <input type="checkbox" name="opt-cat" value="${esc(optVal)}" class="sr-only" ${isSel ? 'checked' : ''}>
                </label>`;
              }).join('')}
            </div>

            <!-- Panel: Fabric -->
            <div id="tab-panel-fabric" class="f-tab-panel hidden space-y-2.5">
              ${allFabrics.map(fb => {
                const isSel = (!f.fabric && !fb.val) || (f.fabric && fb.val && f.fabric.split(',').map(s=>s.trim().toLowerCase()).includes(fb.val.toLowerCase()));
                return `
                <label class="f-opt-row flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${isSel ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-gray-200 bg-white text-slate-800 font-semibold hover:border-gray-300'}" data-type="fabric" data-val="${esc(fb.val)}" data-label="${esc(fb.label)}">
                  <span class="text-sm capitalize">${esc(fb.label)}</span>
                  <div class="f-check w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-white bg-white text-slate-900 font-black text-xs' : 'border-gray-300 bg-white'}">${isSel ? '✓' : ''}</div>
                  <input type="checkbox" name="opt-fabric" value="${esc(fb.val)}" class="sr-only" ${isSel ? 'checked' : ''}>
                </label>`;
              }).join('')}
            </div>

            <!-- Panel: Ratings -->
            <div id="tab-panel-ratings" class="f-tab-panel hidden space-y-2.5">
              ${allRatings.map(rt => {
                const isSel = (f.rating === rt.val);
                return `
                <label class="f-opt-row flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${isSel ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-gray-200 bg-white text-slate-800 font-semibold hover:border-gray-300'}" data-type="rating" data-val="${esc(rt.val)}" data-label="${esc(rt.label)}">
                  <span class="text-sm">${esc(rt.label)}</span>
                  <div class="f-check w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-white bg-white text-slate-900 font-black text-xs' : 'border-gray-300 bg-white'}">${isSel ? '✓' : ''}</div>
                  <input type="radio" name="opt-rating" value="${esc(rt.val)}" class="sr-only" ${isSel ? 'checked' : ''}>
                </label>`;
              }).join('')}
            </div>

            <!-- Panel: Price -->
            <div id="tab-panel-price" class="f-tab-panel hidden space-y-3">
              <div class="space-y-2.5">
                ${allPriceTiers.map(pt => {
                  const isPtSel = (f.min === pt.min && f.max === pt.max);
                  return `
                  <button type="button" class="price-tier-btn w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left text-sm font-semibold transition ${isPtSel ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-gray-200 bg-white text-slate-800 hover:border-gray-300'}" data-min="${esc(pt.min)}" data-max="${esc(pt.max)}" data-label="${esc(pt.label)}">
                    <span>${esc(pt.label)}</span>
                    <span class="text-xs font-bold ${isPtSel ? 'text-white' : 'text-gray-400'}">₹</span>
                  </button>`;
                }).join('')}
              </div>
              <div class="pt-3 border-t border-gray-100">
                <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Custom Price Range</span>
                <div class="flex items-center gap-2">
                  <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">₹</span>
                    <input id="f-min" type="number" placeholder="Min" value="${esc(f.min)}" class="w-full pl-7 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-900 transition">
                  </div>
                  <span class="text-gray-300 font-bold">-</span>
                  <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">₹</span>
                    <input id="f-max" type="number" placeholder="Max" value="${esc(f.max)}" class="w-full pl-7 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-900 transition">
                  </div>
                </div>
              </div>
            </div>

            <!-- Panel: Availability -->
            <div id="tab-panel-availability" class="f-tab-panel hidden space-y-2.5">
              ${allAvailability.map(av => {
                const isSel = (f.stock === av.val);
                return `
                <label class="f-opt-row flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${isSel ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-gray-200 bg-white text-slate-800 font-semibold hover:border-gray-300'}" data-type="stock" data-val="${esc(av.val)}" data-label="${esc(av.label)}">
                  <span class="text-sm">${esc(av.label)}</span>
                  <div class="f-check w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-white bg-white text-slate-900 font-black text-xs' : 'border-gray-300 bg-white'}">${isSel ? '✓' : ''}</div>
                  <input type="radio" name="opt-stock" value="${esc(av.val)}" class="sr-only" ${isSel ? 'checked' : ''}>
                </label>`;
              }).join('')}
            </div>

            <!-- Panel: Colour -->
            <div id="tab-panel-colour" class="f-tab-panel hidden space-y-2.5">
              ${allColours.map(cl => {
                const isSel = (!f.color && !cl.val) || (f.color && cl.val && f.color.split(',').map(s=>s.trim().toLowerCase()).includes(cl.val.toLowerCase()));
                return `
                <label class="f-opt-row flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${isSel ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-gray-200 bg-white text-slate-800 font-semibold hover:border-gray-300'}" data-type="color" data-val="${esc(cl.val)}" data-label="${esc(cl.label)}">
                  <div class="flex items-center gap-3">
                    ${cl.val ? (cl.gradient ? `<span class="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 via-yellow-400 to-blue-500 shrink-0 shadow-sm"></span>` : `<span class="w-5 h-5 rounded-full shrink-0 ${cl.border ? 'border border-gray-300' : ''}" style="background-color: ${cl.hex};"></span>`) : `<span class="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 shrink-0"></span>`}
                    <span class="text-sm capitalize">${esc(cl.label)}</span>
                  </div>
                  <div class="f-check w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-white bg-white text-slate-900 font-black text-xs' : 'border-gray-300 bg-white'}">${isSel ? '✓' : ''}</div>
                  <input type="checkbox" name="opt-color" value="${esc(cl.val)}" class="sr-only" ${isSel ? 'checked' : ''}>
                </label>`;
              }).join('')}
            </div>

            <!-- Panel: Sort -->
            <div id="tab-panel-sort" class="f-tab-panel hidden space-y-2.5">
              ${allSorts.map(st => {
                const isSel = (f.sort === st.val);
                return `
                <label class="f-opt-row flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${isSel ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-gray-200 bg-white text-slate-800 font-semibold hover:border-gray-300'}" data-type="sort" data-val="${esc(st.val)}" data-label="${esc(st.label)}">
                  <span class="text-sm font-semibold">${esc(st.label)}</span>
                  <div class="f-check w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-white bg-white text-slate-900 font-black text-xs' : 'border-gray-300 bg-white'}">${isSel ? '✓' : ''}</div>
                  <input type="radio" name="opt-sort" value="${esc(st.val)}" class="sr-only" ${isSel ? 'checked' : ''}>
                </label>`;
              }).join('')}
            </div>

          </div>
        </div>

        <!-- Sticky Bottom Bar -->
        <div class="sticky bottom-0 bg-white px-4 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] border-t border-gray-100 flex items-center gap-3 shrink-0 z-30 shadow-[0_-6px_25px_rgba(0,0,0,0.08)]">
          <button id="f-clear-btn" type="button" class="flex-1 py-3 px-4 rounded-full border-2 border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-center active:scale-95">Reset</button>
          <button id="apply" type="button" class="flex-[2] py-3 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-soft transition text-center active:scale-95">Apply Filters</button>
        </div>
      </div>
    </div>

    <!-- Separate Sort Page Modal (Dedicated Page View on Desktop & Mobile) -->
    <div id="sort-page-modal" class="hidden fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0 w-full h-[100dvh] z-[99999] bg-white flex flex-col md:bg-slate-900/50 md:backdrop-blur-sm md:items-center md:justify-center p-0 md:p-6 overscroll-contain" style="top:0;left:0;right:0;bottom:0;margin:0;">
      <div class="w-full h-full md:h-auto md:max-h-[88vh] md:max-w-lg bg-white md:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        <!-- Header with Circular Back Button -->
        <div class="sticky top-0 z-10 flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-3.5 bg-white border-b border-gray-100">
          <button id="sort-page-back" type="button" aria-label="Back to Shop" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div class="text-center">
            <h2 class="text-base font-extrabold text-slate-900">Sort Sarees</h2>
            <p class="text-[10px] text-gray-400 font-medium">Choose your viewing preference</p>
          </div>
          <button id="sort-page-reset" type="button" class="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1">Reset</button>
        </div>

        <!-- Scrollable Sort Options (Boxed, No Description, Increased Font Size) -->
        <div class="flex-1 overflow-y-auto p-5 space-y-3" id="sort-page-options">
          ${allSorts.map(opt => `
            <label class="sort-page-card flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${f.sort === opt.val ? 'border-slate-900 bg-slate-100 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}" data-sort="${opt.val}">
              <div class="flex items-center gap-2.5">
                <span class="text-sm font-bold text-slate-900">${esc(opt.label)}</span>
                ${opt.val === 'new' ? '<span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Popular</span>' : ''}
              </div>
              <div class="sort-page-radio-outer w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${f.sort === opt.val ? 'border-slate-900 bg-slate-900' : 'border-gray-300 bg-white'}">
                <div class="w-2 h-2 rounded-full bg-white transition-transform ${f.sort === opt.val ? 'scale-100' : 'scale-0'}"></div>
              </div>
              <input type="radio" name="sort-page-choice" value="${opt.val}" class="sr-only" ${f.sort === opt.val ? 'checked' : ''}>
            </label>
          `).join('')}
        </div>

        <!-- Sticky Bottom Apply Button -->
        <div class="sticky bottom-0 bg-white px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] border-t border-gray-100 shrink-0 z-20 shadow-[0_-6px_25px_rgba(0,0,0,0.08)]">
          <button id="sort-page-apply" type="button" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-full text-xs sm:text-sm tracking-wide shadow-soft transition active:scale-95">Apply Sorting</button>
        </div>
      </div>
    </div>

    <!-- Product Listing Grid -->
    <section class="min-w-0 pt-2">
      <div class="flex items-center justify-between mb-4 px-1">
        <p class="text-xs font-semibold text-gray-500">Showing <span class="text-gray-900 font-extrabold">${data.length}</span> sarees${f.q ? ` for "<span class="text-gray-900">${esc(f.q)}</span>"` : ''}</p>
      </div>
      ${grid(data)}
    </section>
  </div>`;

  // Open / Close Split Filter Page Modal with total background scroll lock
  // Open / Close Split Filter Page Modal with total background scroll lock
  const openFilters = () => {
    $('#fl').classList.remove('hidden');
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden', 'touch-none');
    try {
      history.pushState({ thaaraiModal: 'filter' }, '', location.href);
    } catch(e){}
  };
  const closeFilters = (fromPop = false) => {
    if($('#fl').classList.contains('hidden')) return;
    $('#fl').classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden', 'touch-none');
    if(!fromPop && history.state && history.state.thaaraiModal === 'filter'){
      history.back();
    }
  };
  $('#ftg').onclick = openFilters;
  $('#filter-close').onclick = () => closeFilters();

  // Separate Sort Page Modal Open / Close with total background scroll lock
  const openSortPage = () => {
    $('#sort-page-modal').classList.remove('hidden');
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden', 'touch-none');
    try {
      history.pushState({ thaaraiModal: 'sort' }, '', location.href);
    } catch(e){}
  };
  const closeSortPage = (fromPop = false) => {
    if($('#sort-page-modal').classList.contains('hidden')) return;
    $('#sort-page-modal').classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden', 'touch-none');
    if(!fromPop && history.state && history.state.thaaraiModal === 'sort'){
      history.back();
    }
  };
  $('#sort-open').onclick = openSortPage;
  $('#sort-page-back').onclick = () => closeSortPage();

  // Pending filter states
  let pendingCat = f.cat;
  let pendingFabric = f.fabric;
  let pendingRating = f.rating;
  let pendingMin = f.min;
  let pendingMax = f.max;
  let pendingStock = f.stock;
  let pendingColor = f.color;
  let pendingSort = f.sort;

  // Flipkart/Amazon style Left Sidebar Tab Switching
  $$('.f-nav-item').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const tabName = btn.dataset.tab;
      
      // Update sidebar tab item styles
      $$('.f-nav-item').forEach(item => {
        item.className = 'f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-semibold text-sm transition border-l-4 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60';
      });
      btn.className = 'f-nav-item w-full flex items-center justify-between px-3.5 py-4 text-left font-bold text-sm transition border-l-4 border-slate-900 bg-white text-slate-950 shadow-sm';

      // Switch right panel view
      $$('.f-tab-panel').forEach(panel => panel.classList.add('hidden'));
      const activePanel = $(`#tab-panel-${tabName}`);
      if(activePanel) activePanel.classList.remove('hidden');
    };
  });

  // Helper function to update option row UI with crisp box styling
  const updateOptionRowUI = (containerId, selectedVal, isMulti = false) => {
    const panel = $(containerId);
    if(!panel) return;
    const selArray = isMulti ? String(selectedVal || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean) : [(selectedVal || '').toLowerCase()];
    panel.querySelectorAll('.f-opt-row').forEach(row => {
      const rVal = (row.dataset.val || '').toLowerCase();
      const isSelected = isMulti ? (!selArray.length && !rVal) || (rVal && selArray.includes(rVal)) : (rVal === (selectedVal || '').toLowerCase());
      const input = row.querySelector('input');
      const check = row.querySelector('.f-check');
      if(input) input.checked = isSelected;
      if(isSelected){
        row.className = 'f-opt-row flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition border-slate-900 bg-slate-900 text-white font-bold shadow-sm';
        if(check){
          check.className = 'f-check w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-white bg-white text-slate-900 font-black text-xs';
          check.textContent = '✓';
        }
      } else {
        row.className = 'f-opt-row flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition border-gray-200 bg-white text-slate-800 font-semibold hover:border-gray-300';
        if(check){
          check.className = 'f-check w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-gray-300 bg-white';
          check.textContent = '';
        }
      }
    });
  };

  const updateBadge = (badgeId, hasVal) => {
    const el = $(badgeId);
    if(!el) return;
    if(hasVal){
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  };

  const toggleMultiVal = (currentStr, val) => {
    if(!val) return ''; // clicked All -> clear all selections
    let arr = String(currentStr || '').split(',').map(s=>s.trim()).filter(Boolean);
    const idx = arr.findIndex(x => x.toLowerCase() === val.toLowerCase());
    if(idx >= 0){
      arr.splice(idx, 1);
    } else {
      arr.push(val);
    }
    return arr.join(',');
  };

  // Option row click handlers
  $$('#fl .f-opt-row').forEach(row => {
    row.onclick = (e) => {
      e.preventDefault(); // prevent native label double trigger on child input
      const type = row.dataset.type;
      const val = row.dataset.val;
      if(type === 'cat'){
        pendingCat = toggleMultiVal(pendingCat, val);
        updateOptionRowUI('#tab-panel-categories', pendingCat, true);
        updateBadge('#badge-categories', !!pendingCat);
      } else if(type === 'fabric'){
        pendingFabric = toggleMultiVal(pendingFabric, val);
        updateOptionRowUI('#tab-panel-fabric', pendingFabric, true);
        updateBadge('#badge-fabric', !!pendingFabric);
      } else if(type === 'rating'){
        pendingRating = val;
        updateOptionRowUI('#tab-panel-ratings', val);
        updateBadge('#badge-ratings', !!val);
      } else if(type === 'stock'){
        pendingStock = val;
        updateOptionRowUI('#tab-panel-availability', val);
        updateBadge('#badge-availability', !!val);
      } else if(type === 'color'){
        pendingColor = toggleMultiVal(pendingColor, val);
        updateOptionRowUI('#tab-panel-colour', pendingColor, true);
        updateBadge('#badge-colour', !!pendingColor);
      } else if(type === 'sort'){
        pendingSort = val;
        updateOptionRowUI('#tab-panel-sort', val);
        updateBadge('#badge-sort', (val && val !== 'new'));
        syncSortPageModalUI(val);
      }
    };
  });

  // Price presets
  $$('.price-tier-btn').forEach(btn => {
    btn.onclick = () => {
      const minV = btn.dataset.min || '';
      const maxV = btn.dataset.max || '';
      $('#f-min').value = minV;
      $('#f-max').value = maxV;
      pendingMin = minV;
      pendingMax = maxV;
      $$('.price-tier-btn').forEach(b => {
        b.className = 'price-tier-btn w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-gray-200 bg-white text-slate-800 hover:border-gray-300 text-left text-sm font-semibold transition';
        const span = b.querySelector('span:last-child');
        if(span) span.className = 'text-xs text-gray-400 font-bold';
      });
      btn.className = 'price-tier-btn w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-slate-900 bg-slate-900 text-white font-bold shadow-sm text-left text-sm transition';
      const lastSpan = btn.querySelector('span:last-child');
      if(lastSpan) lastSpan.className = 'text-xs text-white font-bold';
      updateBadge('#badge-price', !!(minV || maxV));
    };
  });

  $('#f-min').oninput = (e) => {
    pendingMin = e.target.value.trim();
    updateBadge('#badge-price', !!(pendingMin || pendingMax));
  };
  $('#f-max').oninput = (e) => {
    pendingMax = e.target.value.trim();
    updateBadge('#badge-price', !!(pendingMin || pendingMax));
  };

  // Sync separate sort page modal UI
  const syncSortPageModalUI = (val) => {
    $$('#sort-page-options .sort-page-card').forEach(card => {
      const isSelected = (card.dataset.sort === val);
      const radio = card.querySelector('input');
      const radioOuter = card.querySelector('.sort-page-radio-outer');
      const dot = card.querySelector('.sort-page-radio-outer > div');
      if(radio) radio.checked = isSelected;
      if(isSelected){
        card.className = 'sort-page-card flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition border-slate-900 bg-slate-100 shadow-sm';
        if(radioOuter) radioOuter.className = 'sort-page-radio-outer w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-slate-900 bg-slate-900';
        if(dot) dot.className = 'w-2 h-2 rounded-full bg-white transition-transform scale-100';
      } else {
        card.className = 'sort-page-card flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition border-gray-200 bg-white hover:border-gray-300';
        if(radioOuter) radioOuter.className = 'sort-page-radio-outer w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-gray-300 bg-white';
        if(dot) dot.className = 'w-2 h-2 rounded-full bg-white transition-transform scale-0';
      }
    });
  };

  // Sort Page Option Click
  $$('#sort-page-options .sort-page-card').forEach(card => {
    card.onclick = () => {
      const val = card.dataset.sort;
      pendingSort = val;
      syncSortPageModalUI(val);
      updateOptionRowUI('#tab-panel-sort', val);
      updateBadge('#badge-sort', (val && val !== 'new'));
    };
  });

  // Sort Page Apply & Reset
  $('#sort-page-apply').onclick = () => {
    closeSortPage();
    executeFilter();
  };
  $('#sort-page-reset').onclick = () => {
    pendingSort = 'new';
    syncSortPageModalUI('new');
    updateOptionRowUI('#tab-panel-sort', 'new');
    updateBadge('#badge-sort', false);
  };

  const executeFilter = () => {
    isLinkNavigation = true;
    setTimeout(() => { isLinkNavigation = false; }, 600);
    const p = new URLSearchParams();
    if(f.q) p.set('q', f.q);
    if(pendingCat) p.set('cat', pendingCat);
    if(pendingFabric) p.set('fabric', pendingFabric);
    if(pendingRating) p.set('rating', pendingRating);
    const minv = $('#f-min')?.value.trim() || pendingMin;
    const maxv = $('#f-max')?.value.trim() || pendingMax;
    if(minv) p.set('min', minv);
    if(maxv) p.set('max', maxv);
    if(pendingStock) p.set('stock', pendingStock);
    if(pendingColor) p.set('color', pendingColor);
    if(pendingSort && pendingSort !== 'new') p.set('sort', pendingSort);
    location.hash = '#/shop' + (p.toString() ? '?' + p.toString() : '');
  };

  $('#apply').onclick = () => {
    closeFilters();
    executeFilter();
  };
  $('#f-clear-btn').onclick = () => {
    closeFilters();
    location.hash = '#/shop';
  };
  $('#f-reset').onclick = () => {
    closeFilters();
    location.hash = '#/shop';
  };
}

