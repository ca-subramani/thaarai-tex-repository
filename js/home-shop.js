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
async function home(){
  const heroData = SET.hero || {};
  const featuredCats = SET.home_categories?.length ? SET.home_categories : [
    { name: 'Sarees', subtitle: 'Exclusive Handloom', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', query: 'Sarees' },
    { name: 'Lungies', subtitle: 'Comfort & Heritage', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', query: 'Lungies' },
    { name: 'Soft Silk', subtitle: 'Royal & Elegant', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80', query: 'Soft Silk' },
    { name: 'Poonam', subtitle: 'Daily & Party Wear', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80', query: 'Poonam' },
    { name: 'Pattu', subtitle: 'Traditional Grandeur', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', query: 'Pattu' },
    { name: 'Cotton', subtitle: 'Breathable Pure Weave', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80', query: 'Cotton' }
  ];

  let featured = cachedFeatured;
  if (!cachedFeatured && sb) {
    try {
      const { data } = await sb.from('products').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
      cachedFeatured = data;
      featured = cachedFeatured;
    } catch {}
  }

  const photo = heroData.image || featured?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
  const fullTitle = heroData.title || 'A legacy woven into every thread';
  const words = fullTitle.trim().split(/\s+/);
  const firstWord = words[0] || 'THAARAI';
  const restTitle = words.slice(1).join(' ');
  const mainBtnLink = heroData.buttonLink || (featured ? `#/p/${encodeURIComponent(featured.id)}` : '#/shop');
  const secBtnLink = heroData.secButtonLink || '#/shop';

  const trustBadges = SET.trust_badges?.length ? SET.trust_badges : [
    {title: 'Free Delivery', desc: 'Direct to doorstep'},
    {title: 'Cash on Delivery', desc: 'Pay when you receive'},
    {title: 'Wholesale Price', desc: 'Direct weaver rates'},
    {title: '100% Handloom', desc: 'Pure authentic quality'}
  ];
  const trustIcons = [ICONS.truck, ICONS.cash, ICONS.tag, ICONS.handloom];

  app.innerHTML=`
  <!-- Black Premium Hero with Seamless Model Cutout -->
  <section class="relative mb-8 overflow-hidden rounded-[1.75rem] bg-[#080909] text-white shadow-[0_24px_60px_rgba(8,9,9,.28)]">
    <div class="absolute inset-0 opacity-25" style="background:radial-gradient(ellipse at 70% 50%,#5b171b 0%,transparent 50%),linear-gradient(130deg,#090a0a 15%,#171818 100%)"></div>
    <div class="absolute -right-8 top-8 select-none text-[clamp(4.5rem,16vw,13rem)] font-black uppercase leading-none tracking-[-.08em] text-white/[.03] pointer-events-none">WEAVE</div>
    <div class="absolute left-0 top-1/3 h-px w-full rotate-[-12deg] bg-[#e32938]/20 pointer-events-none"></div>

    <div class="relative z-10 flex flex-col justify-between p-5 sm:p-8 lg:p-10 min-h-[460px] sm:min-h-[500px]">
      <!-- Header row inside Hero -->
      <div class="flex items-center justify-between border-b border-white/10 pb-3.5">
        <span class="text-[10px] font-black tracking-[.28em] text-white">THAARAI <span class="text-[#e42636]">TEX</span></span>
        <div class="hidden items-center gap-7 text-[9px] font-bold uppercase tracking-[.28em] text-white/65 sm:flex">
          <a href="#/" class="text-white hover:text-white">Home</a>
          <a href="#/shop" class="hover:text-white">Sarees</a>
          <a href="#/account/orders" class="hover:text-white">My orders</a>
        </div>
        <span class="text-[9px] font-bold uppercase tracking-[.22em] text-[#ff3544]">${esc(heroData.badge || 'HANDLOOM · EST. WITH CARE')}</span>
      </div>

      <!-- Main hero content: Clean Grid without text collision -->
      <div class="grid items-center gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr] my-6">
        <!-- Text Column -->
        <div class="relative z-20 max-w-lg">
          <p class="text-[9px] font-extrabold uppercase tracking-[.34em] text-[#ff3645]">${esc(heroData.eyebrow || 'THAARAI TEX · HANDLOOM EDITION')}</p>
          <h1 class="mt-3.5 max-w-xl text-[clamp(2.3rem,5.8vw,5rem)] font-black uppercase leading-[.92] tracking-[-.05em]">
            <span class="text-[#f52638]">${esc(firstWord)}</span>
            ${restTitle ? `<span class="mt-1 block text-white">${esc(restTitle)}</span>` : ''}
          </h1>
          <p class="mt-4 max-w-md text-xs sm:text-sm leading-relaxed text-white/70">${esc(heroData.subtitle || 'Discover handpicked authentic sarees, crafted with the art and patience of master weavers.')}</p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <a href="${esc(mainBtnLink)}" class="rounded-full bg-white px-6 py-3.5 text-xs font-black uppercase tracking-[.14em] text-[#111] transition hover:bg-[#f4c3c6] shadow-md">${esc(heroData.button || 'Explore the collection')}</a>
            <a href="${esc(secBtnLink)}" class="rounded-full border border-white/35 px-6 py-3.5 text-xs font-black uppercase tracking-[.14em] text-white hover:bg-white/10 transition">${esc(heroData.secButton || 'View all sarees')}</a>
          </div>
          ${featured ? `<p class="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-white/50">Featured weave: <span class="text-white">${esc(featured.name)}</span> <span class="ml-2 text-[#ff3544]">${inr(featured.price)}</span></p>` : ''}
        </div>

        <!-- Seamless Model Cutout Column -->
        <div class="relative flex items-center justify-center lg:justify-end">
          <div class="relative w-full max-w-[320px] sm:max-w-[380px] h-[280px] sm:h-[350px] lg:h-[400px] flex items-center justify-center">
            <!-- Warm backlight ambient glow -->
            <div class="absolute inset-4 rounded-full bg-gradient-to-tr from-[#9b101a]/30 via-[#c3a875]/15 to-transparent blur-3xl pointer-events-none"></div>
            <!-- Individual person image with smooth edge fade and zero border box -->
            <img src="${esc(photo)}" alt="Handloom Saree Weave" class="hero-model-cutout relative z-10 max-h-full max-w-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]" loading="eager">
          </div>
        </div>
      </div>

      <!-- Footer row inside Hero -->
      <div class="flex items-center justify-between border-t border-white/10 pt-3 text-[8px] font-bold uppercase tracking-[.24em] text-white/45">
        <span>Woven by hand · Made to be remembered</span>
        <span>01 / THE HANDLOOM EDITION</span>
      </div>
    </div>
  </section>

  <!-- Featured Categories Grid -->
  <section class="mb-12">
    <div class="flex items-end justify-between mb-6 px-1">
      <div>
        <h2 class="font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">Featured Categories</h2>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">Explore our finest handwoven selections</p>
      </div>
      <a href="#/shop" class="hidden sm:flex items-center gap-1 text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors">Shop All <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></a>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
      ${featuredCats.map(c=>`
        <a href="${c.query?.startsWith('#/') ? c.query : `#/shop?q=${encodeURIComponent(c.query||c.name)}`}" class="group relative aspect-[4/5] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-soft block bg-slate-900">
          <img src="${c.image}" alt="${esc(c.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white">
            <h3 class="font-extrabold text-base sm:text-xl tracking-tight mb-0.5 group-hover:text-emerald-400 transition-colors">${esc(c.name)}</h3>
            <p class="text-[10px] sm:text-xs text-gray-300 font-medium">${esc(c.subtitle||'')}</p>
          </div>
        </a>
      `).join('')}
    </div>
    <div class="mt-4 text-center sm:hidden">
      <a href="#/shop" class="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 text-slate-900 rounded-2xl font-bold text-xs border border-gray-200">View All Shop <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></a>
    </div>
  </section>

  <!-- About / Brand Story Section -->
  ${(SET.about?.text)?`
    <section class="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-soft grid sm:grid-cols-2 gap-8 items-center">
      <div class="space-y-3">
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1 rounded-full">${esc(SET.about.badge || 'Authentic Weaves')}</span>
        <h2 class="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">${esc(SET.about.title)}</h2>
        <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">${esc(SET.about.text)}</p>
        <div class="pt-2"><a href="${esc(SET.about.buttonLink || '#/shop')}" class="${btn} inline-block !py-3">${esc(SET.about.button || 'Explore Collections')}</a></div>
      </div>
      <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-inner flex items-center justify-center">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-900/10 to-slate-900/40 z-10"></div>
        <img src="${esc(SET.about.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80')}" alt="Handloom Weaving" class="w-full h-full object-cover">
      </div>
    </section>
  `:''}

  <!-- Trust Badges Section -->
  <section class="mb-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      ${trustBadges.map((t,idx)=>`
        <div class="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-900 shadow-inner">
            ${trustIcons[idx % trustIcons.length]}
          </div>
          <div class="text-left min-w-0">
            <h4 class="font-extrabold text-[11px] sm:text-xs text-gray-900 truncate">${esc(t.title)}</h4>
            <p class="text-[9px] sm:text-[10px] text-gray-500 truncate mt-0.5">${esc(t.desc)}</p>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  `;
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

