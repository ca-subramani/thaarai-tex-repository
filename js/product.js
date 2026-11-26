/* ===== PRODUCT PAGE ===== */
async function product(id){
  let p=null;
  try{ const res=await sb.from('products').select('*').eq('id',id).maybeSingle(); p=res.data; }catch{}
  if(!p){app.innerHTML='<div class="text-center py-20 text-xs text-gray-400 bg-white rounded-3xl border p-8 max-w-md mx-auto shadow-soft">Product not found. <br><a href="#/shop" class="font-bold underline text-slate-900 mt-2 inline-block">Back to Shop</a></div>';return}
  document.title=p.name+' | '+(SET.brand?.name || 'Thaarai Tex');
  let reviews=[], sim=[];
  try{
    const r1=await sb.from('reviews').select('*').eq('product_id',id).order('created_at',{ascending:false});
    reviews=r1.data||[];
    if(p.category_id){
      const r2=await sb.from('products').select('*').eq('active',true).eq('category_id',p.category_id).neq('id',id).limit(4);
      sim=r2.data||[];
    }
  }catch{}
  const avg=reviews.length?reviews.reduce((s,r)=>s+r.rating,0)/reviews.length:0;
  const imgs=p.images?.length?p.images:['https://placehold.co/600x750?text=Thaarai+Tex'];
  const o=off(p), ok=p.stock>0;
  const specs=[['Fabric',p.fabric],['Colour',p.color],['Occasion',p.occasion]].filter(r=>r[1]);

  app.innerHTML=`
  <div class="space-y-8 my-2">
    <div class="flex items-center gap-2 text-xs text-gray-400 font-medium px-1">
      <a href="#/" class="hover:text-slate-900">Home</a><span>/</span><a href="#/shop" class="hover:text-slate-900">Shop</a><span>/</span>
      <span class="text-gray-800 line-clamp-1 font-semibold">${esc(p.name)}</span>
    </div>
    <div class="grid lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
        <div class="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar w-full md:w-20 shrink-0">
          ${imgs.map((u,idx)=>`<div data-idx="${idx}" class="thumb-btn relative w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shrink-0 bg-white shadow-sm ${idx===0?'border-slate-900 shadow-md':'border-gray-200 opacity-70 hover:opacity-100'}"><img src="${esc(u)}" alt="" class="w-full h-full object-cover"></div>`).join('')}
        </div>
        <div class="flex-1 w-full bg-white rounded-3xl border border-gray-100 shadow-soft p-3 relative">
          <div id="zoom-stage" class="lens-zoom-container aspect-[3/4] sm:aspect-[4/5] rounded-2xl bg-gray-50 flex items-center justify-center relative overflow-hidden select-none cursor-pointer">
            <img id="main-product-img" src="${esc(imgs[0])}" alt="${esc(p.name)}" class="w-full h-full object-cover">
            <button id="open-lightbox-btn" title="View fullscreen" class="absolute top-3 right-3 bg-white/90 backdrop-blur w-9 h-9 rounded-full shadow-sm flex items-center justify-center hover:bg-slate-900 hover:text-white transition">
              <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
            ${imgs.length>1?`<button id="img-prev" class="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur w-9 h-9 rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:bg-slate-900 hover:text-white transition text-lg font-bold">‹</button><button id="img-next" class="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur w-9 h-9 rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:bg-slate-900 hover:text-white transition text-lg font-bold">›</button>`:''}
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 space-y-5">
        <div class="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft space-y-5">
          <div>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 bg-slate-100 px-3 py-1 rounded-full">${esc(p.fabric?p.fabric+' Saree':'Saree')}</span>
                <span class="font-mono text-[10px] font-black text-slate-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full select-all">Product ID: ${esc(getProductId(p))}</span>
              </div>
              <button data-w="${p.id}" aria-label="Wishlist" class="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-rose-50 transition border border-gray-100">${heart(wish.has(p.id))}</button>
            </div>
            <h1 class="text-xl sm:text-2xl font-extrabold text-gray-950 mt-3 leading-snug tracking-tight">${esc(p.name)}</h1>
            ${reviews.length?`<div class="flex items-center gap-2 mt-2"><div class="flex items-center bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-lg text-xs font-bold text-amber-800"><span class="mr-1">${ICONS.star}</span> ${avg.toFixed(1)}</div><span class="text-xs text-gray-400 font-medium">· ${reviews.length} review${reviews.length>1?'s':''}</span></div>`:''}
          </div>
          <div class="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100">
            <div class="flex items-baseline gap-3 flex-wrap">
              <span class="text-3xl font-black text-gray-950">${inr(p.price)}</span>
              ${o?`<s class="text-sm font-semibold text-gray-400">${inr(p.mrp)}</s><span class="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">${o}% OFF</span>`:''}
            </div>
            <p class="text-[11px] text-gray-500 mt-1">Free delivery</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${ok?'bg-emerald-500':'bg-rose-500'}"></span>
            <span class="text-xs font-bold ${ok?'text-emerald-700':'text-rose-600'}">${ok?(p.stock<5?`Hurry, only ${p.stock} left`:'In stock'):'Currently out of stock'}</span>
          </div>
          ${specs.length?`<div class="border-t border-b border-gray-100 py-3.5 space-y-2 text-xs">${specs.map(r=>`<div class="grid grid-cols-3 gap-2 py-1"><span class="text-gray-400 font-medium">${r[0]}</span><span class="col-span-2 text-gray-900 font-bold">${esc(r[1])}</span></div>`).join('')}</div>`:''}
          <div class="space-y-2.5 pt-1">
            <button id="btn-buy-now" ${ok?'':'disabled'} class="${btn} w-full text-sm !py-4 uppercase tracking-wider font-extrabold">Buy Now</button>
            <button id="btn-add-bag" ${ok?'':'disabled'} class="w-full bg-white border-2 border-slate-900 text-slate-900 hover:bg-gray-50 font-extrabold py-3.5 px-6 rounded-full text-xs uppercase tracking-wider transition disabled:opacity-40">Add to Shopping Bag</button>
          </div>
          <div class="pt-2">
            <label class="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Estimated delivery date</label>
            <div class="flex gap-2">
              <input id="pin-input" maxlength="6" inputmode="numeric" placeholder="Enter 6-digit pincode" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-slate-900 transition font-medium">
              <button id="pin-check-btn" class="bg-gray-100 hover:bg-slate-900 hover:text-white px-5 rounded-xl font-bold text-xs transition">Check</button>
            </div>
            <p id="pin-feedback" class="text-[11px] mt-1.5 font-semibold"></p>
          </div>
          <div class="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
            <div class="p-2.5 rounded-2xl bg-gray-50 flex flex-col items-center">${ICONS.cash}<span class="text-[10px] font-bold text-gray-700 mt-1">Cash on Delivery</span></div>
            <div class="p-2.5 rounded-2xl bg-gray-50 flex flex-col items-center">${ICONS.truck}<span class="text-[10px] font-bold text-gray-700 mt-1">Free Delivery</span></div>
            <div class="p-2.5 rounded-2xl bg-gray-50 flex flex-col items-center">${ICONS.upi}<span class="text-[10px] font-bold text-gray-700 mt-1">UPI Accepted</span></div>
          </div>
          <div class="pt-2 text-center">
            <a href="https://wa.me/${esc(WHATSAPP)}?text=${encodeURIComponent('Hello, I am interested in this saree: '+p.name+' ('+location.href+')')}" target="_blank" rel="noopener" class="inline-flex items-center text-xs font-bold text-emerald-700 hover:underline">${ICONS.whatsapp} Ask us on WhatsApp</a>
          </div>
        </div>
        ${p.description?`<div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft space-y-3"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Description</h3><p class="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">${esc(p.description)}</p></div>`:''}
      </div>
    </div>

    <div class="fixed sm:hidden inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 p-3 flex gap-2" style="padding-bottom:calc(0.75rem + env(safe-area-inset-bottom))">
      <button id="mob-add-bag" ${ok?'':'disabled'} class="flex-1 bg-white border border-slate-900 text-slate-900 font-bold py-3 rounded-full text-xs disabled:opacity-40">Add to Bag</button>
      <button id="mob-buy-now" ${ok?'':'disabled'} class="flex-1 ${btn} !py-3 text-xs">Buy Now</button>
    </div>

    ${reviews.length?`<section class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-4">
      <div class="flex items-center justify-between"><h2 class="font-extrabold text-base text-gray-900">Customer Reviews</h2><span class="text-xs font-bold text-amber-600">${ICONS.star} ${avg.toFixed(1)} / 5</span></div>
      <div class="divide-y divide-gray-100">${reviews.map(r=>`<div class="py-4 text-xs space-y-1"><div class="flex items-center justify-between"><b class="text-gray-900">${esc(r.author||'Customer')}</b><span class="text-gray-400 text-[10px]">${new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span></div><div>${stars(r.rating)}</div><p class="text-gray-600 leading-relaxed mt-1">${esc(r.body)}</p></div>`).join('')}</div>
    </section>`:''}

    ${sim?.length?`<div class="space-y-4 pt-4"><h2 class="font-extrabold text-base text-gray-900">Similar Sarees</h2>${grid(sim)}</div>`:''}
  </div>

  <div id="hd-lightbox" class="fixed inset-0 bg-black/95 z-[99999] hidden flex flex-col justify-between p-3 sm:p-4 backdrop-blur-md overscroll-contain select-none">
    <!-- Header with Back Button, Title, and Close -->
    <div class="flex justify-between items-center text-white px-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] shrink-0 z-10">
      <div class="flex items-center gap-3">
        <button id="lb-back-btn" aria-label="Back" class="w-10 h-10 rounded-full bg-white/10 active:bg-white/30 hover:bg-white/20 flex items-center justify-center text-white shadow-sm transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div class="truncate max-w-[200px] sm:max-w-md">
          <span class="text-xs sm:text-sm font-bold tracking-wide block truncate">${esc(p.name)}</span>
          <span id="lb-counter" class="text-[10px] text-gray-400 font-semibold block">1 / ${imgs.length}</span>
        </div>
      </div>
      <button id="close-lightbox" aria-label="Close" class="w-10 h-10 rounded-full bg-white/10 active:bg-white/30 hover:bg-white/20 flex items-center justify-center text-white text-2xl font-light transition">&times;</button>
    </div>

    <!-- Main Zoomable Image Stage -->
    <div id="lb-stage" class="flex-1 flex items-center justify-center overflow-hidden p-2 relative my-auto">
      <img id="lightbox-img" src="${esc(imgs[0])}" alt="" class="max-w-full max-h-[72vh] sm:max-h-[75vh] object-contain rounded-xl select-none transition-transform duration-100 ease-out cursor-default">
    </div>

    <!-- Bottom Thumbnail Carousel List & Hint -->
    <div class="shrink-0 space-y-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] z-10">
      <p class="text-center text-gray-400 text-[11px] font-medium tracking-wide">Tap outside image to close</p>
      ${imgs.length > 1 ? `
        <div id="lb-thumbs" class="flex items-center justify-center gap-2.5 overflow-x-auto py-1 px-4 no-scrollbar">
          ${imgs.map((u, idx) => `
            <div data-idx="${idx}" class="lb-thumb-btn relative w-12 h-16 sm:w-14 sm:h-18 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${idx === 0 ? 'border-white scale-105 shadow-md opacity-100' : 'border-white/20 opacity-50 hover:opacity-100'}">
              <img src="${esc(u)}" alt="" class="w-full h-full object-cover pointer-events-none">
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  </div>`;

  const mainImg=$('#main-product-img'), stage=$('#zoom-stage'), thumbs=document.querySelectorAll('.thumb-btn');
  let cur=0,stageScale=1;
  function switchImage(i){
    cur=(i+imgs.length)%imgs.length;
    mainImg.src=imgs[cur];
    resetStageZoom();
    thumbs.forEach((t,k)=>{
      t.classList.toggle('border-slate-900',k===cur);
      t.classList.toggle('shadow-md',k===cur);
      t.classList.toggle('border-gray-200',k!==cur);
      t.classList.toggle('opacity-70',k!==cur);
    });
    updateLightboxUI();
  }
  thumbs.forEach(t=>t.onclick=(e)=>{e.stopPropagation();switchImage(Number(t.dataset.idx))});
  if($('#img-prev'))$('#img-prev').onclick=(e)=>{e.stopPropagation();switchImage(cur-1)};
  if($('#img-next'))$('#img-next').onclick=(e)=>{e.stopPropagation();switchImage(cur+1)};

  let x0=null;
  stage.addEventListener('touchstart',e=>{x0=e.touches.length===1&&stageScale===1?e.touches[0].clientX:null},{passive:true});
  stage.addEventListener('touchend',e=>{
    if(e.touches.length||x0===null){x0=null;return}
    const dx=e.changedTouches[0].clientX-x0;
    if(stageScale===1&&imgs.length>1&&Math.abs(dx)>40)switchImage(cur+(dx<0?1:-1));
    x0=null;
  });

  const attachPinchZoom=(surface,img,onScale=()=>{})=>{
    let startDistance=0,startScale=1,scale=1,offsetX=0,offsetY=0,dragStart=null,baseX=0,baseY=0;
    const distance=touches=>Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);
    const render=()=>{img.style.transform=`translate(${offsetX}px, ${offsetY}px) scale(${scale})`;onScale(scale)};
    surface.addEventListener('touchstart',e=>{
      if(e.touches.length===2){startDistance=distance(e.touches);startScale=scale;dragStart=null}
      else if(e.touches.length===1&&scale>1){dragStart={x:e.touches[0].clientX,y:e.touches[0].clientY};baseX=offsetX;baseY=offsetY}
    },{passive:true});
    surface.addEventListener('touchmove',e=>{
      const rect=surface.getBoundingClientRect();
      if(e.touches.length===2&&startDistance){
        e.preventDefault();
        scale=Math.max(1,Math.min(4,startScale*distance(e.touches)/startDistance));
        const maxX=rect.width*(scale-1)/2,maxY=rect.height*(scale-1)/2;
        offsetX=Math.max(-maxX,Math.min(maxX,offsetX));
        offsetY=Math.max(-maxY,Math.min(maxY,offsetY));
        render();
      }
      else if(e.touches.length===1&&dragStart&&scale>1){
        e.preventDefault();
        const maxX=rect.width*(scale-1)/2,maxY=rect.height*(scale-1)/2;
        offsetX=Math.max(-maxX,Math.min(maxX,baseX+e.touches[0].clientX-dragStart.x));
        offsetY=Math.max(-maxY,Math.min(maxY,baseY+e.touches[0].clientY-dragStart.y));
        render();
      }
    },{passive:false});
    surface.addEventListener('touchend',e=>{if(e.touches.length<2)startDistance=0;if(e.touches.length===1&&scale>1){dragStart={x:e.touches[0].clientX,y:e.touches[0].clientY};baseX=offsetX;baseY=offsetY}else if(!e.touches.length)dragStart=null},{passive:true});
    return()=>{scale=1;startScale=1;startDistance=0;offsetX=0;offsetY=0;dragStart=null;img.style.transform='translate(0px, 0px) scale(1)';img.style.transformOrigin='center center';onScale(1)};
  };

  const resetStageZoom=attachPinchZoom(stage,mainImg,value=>stageScale=value);

  // Fullscreen Lightbox Controls
  const lb=$('#hd-lightbox'), lbImg=$('#lightbox-img'), lbStage=$('#lb-stage');
  let lbScale = 1;
  const resetLightboxZoom=attachPinchZoom(lbStage, lbImg, value => lbScale = value);
  
  function updateLightboxUI(){
    if(!lb || lb.classList.contains('hidden')) return;
    lbImg.src = imgs[cur];
    lbScale = 1;
    resetLightboxZoom();
    const counter = $('#lb-counter');
    if(counter) counter.textContent = `${cur + 1} / ${imgs.length}`;
    document.querySelectorAll('.lb-thumb-btn').forEach((tb, idx) => {
      const active = (idx === cur);
      tb.className = `lb-thumb-btn relative w-12 h-16 sm:w-14 sm:h-18 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${active ? 'border-white scale-105 shadow-md opacity-100' : 'border-white/20 opacity-50 hover:opacity-100'}`;
    });
  }

  const openLb = () => {
    updateLightboxUI();
    lb.classList.remove('hidden');
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden', 'touch-none');
    try {
      history.pushState({ thaaraiLightbox: true, pid: p.id }, '', location.href);
    } catch(e){}
  };

  const closeLb = (fromPopstate = false) => {
    if(lb.classList.contains('hidden')) return;
    lb.classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden', 'touch-none');
    lbScale = 1;
    resetLightboxZoom();
    if(!fromPopstate && history.state && history.state.thaaraiLightbox){
      history.back();
    }
  };

  // Open on clicking main image stage or zoom icon
  stage.onclick = (e) => {
    if(e.target.closest('#img-prev') || e.target.closest('#img-next')) return;
    openLb();
  };
  $('#open-lightbox-btn').onclick = (e) => {
    e.stopPropagation();
    openLb();
  };

  // Close via back button or top close button
  $('#close-lightbox').onclick = (e) => { e.stopPropagation(); closeLb(); };
  const lbBack = $('#lb-back-btn');
  if(lbBack) lbBack.onclick = (e) => { e.stopPropagation(); closeLb(); };

  // Only touching the background closes the full screen view; touching the image itself does NOT close
  lb.onclick = (e) => {
    if(e.target.closest('#lightbox-img') || e.target.closest('#lb-thumbs') || e.target.closest('#close-lightbox') || e.target.closest('#lb-back-btn')) return;
    closeLb();
  };

  // Swipe to move photos ONLY when out of zoom (scale <= 1.05). In zoom, swipe is strictly disabled so user can pan freely
  let lbSwipeX0 = null;
  lbStage.addEventListener('touchstart', e => {
    lbSwipeX0 = (e.touches.length === 1 && lbScale <= 1.05) ? e.touches[0].clientX : null;
  }, { passive: true });
  lbStage.addEventListener('touchend', e => {
    if(e.touches.length || lbSwipeX0 === null) { lbSwipeX0 = null; return; }
    const dx = e.changedTouches[0].clientX - lbSwipeX0;
    if(lbScale <= 1.05 && imgs.length > 1 && Math.abs(dx) > 40) {
      switchImage(cur + (dx < 0 ? 1 : -1));
    }
    lbSwipeX0 = null;
  });

  // Lightbox Bottom Thumbnails click
  document.querySelectorAll('.lb-thumb-btn').forEach(tb => {
    tb.onclick = (e) => {
      e.stopPropagation();
      switchImage(Number(tb.dataset.idx));
    };
  });
  const onAdd=()=>addCart(p.id,1,p.stock);
  const onBuy=()=>{
    // Buy Now is strictly 1 quantity, does NOT touch or increase the shopping bag, and goes directly to checkout
    buyNowItem = { id: p.id, qty: 1, p: p };
    location.hash = '#/checkout?mode=buy_now&id=' + encodeURIComponent(p.id);
  };
  $('#btn-add-bag').onclick=onAdd;$('#btn-buy-now').onclick=onBuy;
  $('#mob-add-bag').onclick=onAdd;$('#mob-buy-now').onclick=onBuy;
  $('#pin-check-btn').onclick=()=>{
    const pin=$('#pin-input').value.trim(), out=$('#pin-feedback');
    if(!/^[1-9]\d{5}$/.test(pin)){out.textContent='Please enter a valid 6-digit pincode';out.className='text-[11px] mt-1.5 font-bold text-rose-600';return}
    const d=new Date(Date.now()+5*864e5);
    out.textContent=`Estimated delivery by ${d.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}`;
    out.className='text-[11px] mt-1.5 font-bold text-emerald-700';
  };
}

