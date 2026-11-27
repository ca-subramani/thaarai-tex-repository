/* ===== CART PAGE ===== */
async function cartView(){
  const L=await cartLines(); cart=L.map(l=>({id:l.id,qty:Math.min(l.qty,l.p.stock||1)}));saveCart();
  if(!L.length){app.innerHTML='<div class="text-center py-20 bg-white rounded-3xl p-8 max-w-md mx-auto shadow-soft border"><p class="mb-4 text-xs text-gray-500">உங்கள் பை காலியாக உள்ளது.</p><a href="#/shop" class="'+btn+' inline-block">Continue Shopping</a></div>';return}
  const sub=L.reduce((s,l)=>s+l.p.price*l.qty,0), d=await couponDiscount(sub);
  if(coupon&&!d)toast('Coupon not valid for this cart');
  app.innerHTML=`<h1 class="text-xl font-extrabold mb-4 text-gray-900">Bag <span class="text-gray-400 text-sm font-semibold">(${L.reduce((n,l)=>n+l.qty,0)})</span></h1>
  <div class="grid md:grid-cols-[1fr_340px] gap-6 items-start"><div class="space-y-3">${L.map(l=>`
   <div class="flex gap-3 items-start bg-white p-4 rounded-3xl border border-gray-100 shadow-soft"><a href="#/p/${l.p.id}" class="shrink-0"><img src="${img(l.p)}" alt="" class="w-20 h-24 object-cover rounded-2xl bg-gray-50 border"></a>
    <div class="flex-1 min-w-0"><a href="#/p/${l.p.id}" class="font-bold text-xs text-gray-900 line-clamp-2 block">${esc(l.p.name)}</a>
     <p class="text-xs text-gray-500 mt-1">${inr(l.p.price)}</p>
     <div class="flex items-center gap-3 mt-3"><button data-q="${l.id}" data-d="-1" aria-label="Less" class="w-7 h-7 rounded-full border grid place-items-center text-sm bg-gray-50">−</button><b class="w-5 text-center text-xs">${l.qty}</b><button data-q="${l.id}" data-d="1" aria-label="More" class="w-7 h-7 rounded-full border grid place-items-center text-sm bg-gray-50">+</button></div>
     <button data-rm="${l.id}" class="text-[11px] text-rose-500 font-bold underline mt-3">Remove</button></div>
    <b class="text-sm shrink-0 text-gray-900">${inr(l.p.price*l.qty)}</b></div>`).join('')}</div>
   <aside class="bg-white rounded-3xl p-5 text-xs space-y-3 border border-gray-100 shadow-soft">
    <div class="flex gap-2"><input id="cp" value="${esc(coupon)}" placeholder="Coupon code" class="border border-gray-200 bg-gray-50 rounded-2xl p-2.5 flex-1 uppercase text-xs"><button id="cpb" class="bg-gray-100 px-4 rounded-2xl font-bold">Apply</button></div>
    <div class="flex justify-between text-gray-500"><span>Subtotal</span><span>${inr(sub)}</span></div>
    <div class="flex justify-between text-emerald-700 font-bold"><span>Discount</span><span>−${inr(d)}</span></div>
    <div class="flex justify-between text-gray-500"><span>Delivery</span><span class="text-emerald-700 font-bold">FREE</span></div>
    <div class="flex justify-between font-extrabold text-sm border-t pt-3 text-gray-900"><span>Total</span><span>${inr(sub-d)}</span></div>
    <a href="#/checkout" class="${btn} block text-center !py-3">Checkout</a></aside></div>`;
  app.onclick=e=>{const t=e.target;
    if(t.dataset.q){const i=cart.find(x=>x.id===t.dataset.q);i.qty+=+t.dataset.d;if(i.qty<1)cart=cart.filter(x=>x!==i);saveCart();cartView()}
    if(t.dataset.rm){cart=cart.filter(x=>x.id!==t.dataset.rm);saveCart();cartView()}};
  $('#cpb').onclick=()=>{coupon=$('#cp').value.trim().toUpperCase();cartView()};
}

/* ===== CHECKOUT ===== */
async function checkout(){
  const [path, qs] = (location.hash || '').slice(1).split('?');
  const params = new URLSearchParams(qs || '');
  const isBuyNow = params.get('mode') === 'buy_now';
  const buyNowId = params.get('id');

  let L = [];
  if(isBuyNow){
    if(buyNowItem && (!buyNowId || String(buyNowItem.id) === String(buyNowId))){
      L = [{ id: buyNowItem.id, qty: buyNowItem.qty || 1, p: buyNowItem.p }];
    } else if(buyNowId && sb){
      const { data: prod } = await sb.from('products').select('*').eq('id', buyNowId).maybeSingle();
      if(prod){
        buyNowItem = { id: prod.id, qty: 1, p: prod };
        L = [{ id: prod.id, qty: 1, p: prod }];
      }
    }
    if(!L.length || !L[0].p){
      toast('Product not found for checkout');
      location.hash = '#/shop';
      return;
    }
  } else {
    L = await cartLines();
    if(!L.length){
      location.hash = '#/cart';
      return;
    }
  }

  let sub = L.reduce((s,l) => s + l.p.price * l.qty, 0);
  let d = await couponDiscount(sub);
  let method = 'COD';
  let utrNumber = '';
  let currentStep = 1; // 1: Products, 2: Address, 3: Payment, 4: Confirmation Check
  let tempChosenId = '';

  const pf = profile(), AL = await getAddrs(), def = AL.find(a => a.def) || AL[0] || {};
  let saved = { ...(pf ? { name: pf.name, phone: pf.phone } : {}), ...def };

  let addr = {
    name: saved.name || '',
    phone: saved.phone || '',
    pincode: saved.pincode || '',
    city: saved.city || '',
    state: saved.state || 'Tamil Nadu',
    line: saved.line || ''
  };

  let showingSavedAddressPage = false;

  const recalculateTotals = async () => {
    sub = L.reduce((s,l) => s + l.p.price * l.qty, 0);
    d = await couponDiscount(sub);
  };

  function renderStepperHeader(activeStep){
    const steps = [
      { num: 1, label: 'Products' },
      { num: 2, label: 'Address' },
      { num: 3, label: 'Payment' },
      { num: 4, label: 'Confirm' }
    ];
    return `
      <div class="w-full max-w-2xl mx-auto mb-6 px-4 sm:px-6">
        <div class="relative flex items-center justify-between">
          <!-- Constrained background progress line bounded strictly inside the step numbers -->
          <div class="absolute left-6 right-6 top-4 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full">
            <div class="h-full bg-slate-900 rounded-full transition-all duration-300" style="width: ${((activeStep - 1) / 3) * 100}%"></div>
          </div>
          ${steps.map(st => {
            const isCompleted = activeStep > st.num;
            const isCurrent = activeStep === st.num;
            return `
              <div class="relative z-10 flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                  isCurrent ? 'bg-slate-900 text-white ring-4 ring-slate-100 scale-105' : 
                  (isCompleted ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-gray-300 text-gray-400')
                }">
                  ${isCompleted ? '✓' : st.num}
                </div>
                <span class="text-[10px] sm:text-xs font-bold mt-1.5 ${isCurrent ? 'text-slate-900 font-extrabold' : (isCompleted ? 'text-emerald-700' : 'text-gray-400')}">
                  ${st.label}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Checkout state controller for popstate & back gesture handling
  window._checkoutState = {
    getStep: () => currentStep,
    setStep: s => { currentStep = s; renderStepView(); },
    getSubView: () => showingSavedAddressPage,
    setSubView: v => { showingSavedAddressPage = v; renderStepView(); },
    goBack: () => {
      if(showingSavedAddressPage === 'new'){
        showingSavedAddressPage = 'list';
        renderStepView();
        return true;
      }
      if(showingSavedAddressPage === 'list'){
        showingSavedAddressPage = false;
        renderStepView();
        return true;
      }
      if(currentStep > 1){
        currentStep = currentStep - 1;
        renderStepView();
        return true;
      }
      return false; // at step 1, allow exiting checkout
    }
  };

  function pushCheckoutState(step, sub){
    try {
      history.pushState({ inCheckout: true, step, sub }, '', location.href);
    } catch(e){}
  }

  function renderStepView(){
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // ==========================================
    // STEP 1: PRODUCT DETAILS
    // ==========================================
    if(currentStep === 1){
      app.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-5 animate-fadeIn">
          ${renderStepperHeader(1)}
          <div class="bg-white border border-gray-100 rounded-3xl p-5 sm:p-7 shadow-soft space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <div>
                <h2 class="font-extrabold text-base text-slate-900">Step 1: Product Details</h2>
                <p class="text-xs text-gray-500 mt-0.5">Review items in your order and quantities</p>
              </div>
              <span class="text-[11px] font-black bg-slate-100 text-slate-800 px-3 py-1 rounded-full">${L.length} ${L.length === 1 ? 'Item' : 'Items'}</span>
            </div>

            <div class="space-y-3 pt-1">
              ${L.map(l => `
                <div class="flex items-start sm:items-center gap-3.5 bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-gray-100">
                  <img src="${img(l.p)}" alt="" class="w-16 h-20 object-cover rounded-xl bg-white border border-gray-200 shrink-0 shadow-sm">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h3 class="font-extrabold text-xs sm:text-sm text-slate-900 truncate">${esc(l.p.name)}</h3>
                    </div>
                    <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                      <span>${inr(l.p.price)} each</span>
                      ${l.p.fabric ? `<span>·</span><span class="capitalize">${esc(l.p.fabric)}</span>` : ''}
                      ${l.p.color ? `<span>·</span><span class="capitalize">${esc(l.p.color)}</span>` : ''}
                    </div>

                    <!-- Quantity Modifiers -->
                    <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-200/60">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quantity:</span>
                        <div class="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm p-0.5">
                          <button type="button" data-cq="${esc(l.id)}" data-d="-1" aria-label="Decrease quantity" class="w-6 h-6 rounded-full bg-gray-50 text-gray-700 hover:bg-slate-900 hover:text-white font-bold text-xs flex items-center justify-center transition active:scale-95">−</button>
                          <b class="w-7 text-center text-xs font-black text-slate-900">${l.qty}</b>
                          <button type="button" data-cq="${esc(l.id)}" data-d="1" aria-label="Increase quantity" class="w-6 h-6 rounded-full bg-gray-50 text-gray-700 hover:bg-slate-900 hover:text-white font-bold text-xs flex items-center justify-center transition active:scale-95">+</button>
                        </div>
                      </div>
                      <b class="text-sm font-black text-slate-900">${inr(l.p.price * l.qty)}</b>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Coupon Code Section -->
            <div class="pt-3 border-t">
              <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Apply Discount Coupon</label>
              <div class="flex gap-2">
                <input id="step-cp" value="${esc(coupon)}" placeholder="Enter coupon code (e.g. THAARAI10)" class="border border-gray-200 bg-gray-50 rounded-2xl px-4 py-2.5 flex-1 uppercase text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-900">
                <button type="button" id="step-cpb" class="bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-2xl font-bold text-xs transition shadow-sm">Apply</button>
              </div>
            </div>

            <!-- Pricing Breakdown Card -->
            <div class="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-xs space-y-2">
              <div class="flex justify-between text-gray-600"><span>Items Subtotal</span><span class="font-bold text-slate-900">${inr(sub)}</span></div>
              <div class="flex justify-between text-emerald-700 font-bold"><span>Coupon Discount</span><span>−${inr(d)}</span></div>
              <div class="flex justify-between text-gray-600"><span>Delivery Charges</span><span class="text-emerald-700 font-bold">FREE</span></div>
              <div class="flex justify-between font-black text-base border-t border-gray-200 pt-2 text-slate-900">
                <span>Total Amount</span>
                <span class="text-slate-950">${inr(sub - d)}</span>
              </div>
            </div>

            <div class="pt-3">
              <button id="btn-to-step2" type="button" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-full text-sm shadow-soft transition flex items-center justify-center gap-2">
                <span>Proceed to Delivery Address</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      // Step 1 Events
      $('#step-cpb').onclick = async () => {
        coupon = $('#step-cp').value.trim().toUpperCase();
        await recalculateTotals();
        toast(coupon ? (d ? 'Coupon applied ✓' : 'Coupon not valid or minimum not met') : 'Coupon removed');
        renderStepView();
      };

      $('#btn-to-step2').onclick = () => {
        currentStep = 2;
        pushCheckoutState(2, false);
        renderStepView();
      };

      return;
    }

    // ==========================================
    // STEP 2: ADDRESS DETAILS
    // ==========================================
    if(currentStep === 2){
      // SUB-VIEW A: DEDICATED SAVED ADDRESSES PAGE
      if(showingSavedAddressPage === 'list'){
        if(!tempChosenId) tempChosenId = String(addr.id || (AL.find(a => a.def)?.id || AL[0]?.id || ''));
        app.innerHTML = `
          <div class="max-w-2xl mx-auto space-y-5 animate-fadeIn">
            <div class="flex items-center justify-between px-1">
              <button type="button" id="btn-back-from-saved-list" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-slate-800 font-bold text-xs shadow-soft transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                <span>Back</span>
              </button>
              <span class="text-xs font-bold text-slate-500">Select Delivery Address</span>
            </div>

            <div class="bg-white border border-gray-100 rounded-3xl p-5 sm:p-7 shadow-soft space-y-4">
              <div class="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 class="font-extrabold text-base text-slate-900">Choose Saved Address</h2>
                  <p class="text-xs text-gray-500 mt-0.5">Click an address box and click Confirm</p>
                </div>
                <button type="button" id="btn-open-create-addr" class="text-xs font-bold text-slate-800 hover:text-slate-950 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full border border-gray-200 transition">
                  + Add New Address
                </button>
              </div>

        <!-- List of Saved Address Boxes -->
        <div class="space-y-3 pt-1">
          ${AL.map(a => {
            const isSel = (String(a.id) === String(tempChosenId));
            return `
              <div onclick="window._selectSavedAddr('${esc(a.id)}')" id="card-addr-${esc(a.id)}" class="saved-choice-card block relative border-2 rounded-2xl p-4 cursor-pointer transition select-none ${
                isSel ? 'border-slate-900 bg-gray-50 shadow-sm ring-1 ring-slate-900' : 'border-gray-200 bg-white hover:border-gray-300'
              }">
                <div class="flex items-start gap-3.5">
                  <div class="w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                    isSel ? 'border-slate-900 bg-slate-900' : 'border-gray-400 bg-white'
                  }">
                    ${isSel ? '<div class="w-2 h-2 rounded-full bg-white"></div>' : ''}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-black text-sm text-slate-900">${esc(a.name)}</span>
                      ${a.def ? `<span class="text-[9px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-full">Default</span>` : ''}
                      <span class="text-xs font-bold text-slate-600 ml-auto">📞 ${esc(a.phone)}</span>
                    </div>
                    <p class="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">${esc(a.line)}</p>
                    <p class="text-xs text-slate-900 font-bold mt-1">${esc(a.city)}, ${esc(a.state)} - <span class="font-mono">${esc(a.pincode)}</span></p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="pt-4 border-t flex gap-3">
          <button type="button" onclick="window._closeSavedAddr()" class="flex-1 py-3.5 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-slate-800 font-bold text-xs transition">
            Cancel
          </button>
          <button type="button" onclick="window._confirmSavedAddr()" class="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-4 rounded-full text-xs shadow-soft transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
            <span>Confirm Address</span>
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  window._closeSavedAddr = () => {
    showingSavedAddressPage = false;
    renderStepView();
  };

  window._selectSavedAddr = (id) => {
    tempChosenId = String(id);
    renderStepView();
  };

  window._confirmSavedAddr = () => {
    const match = AL.find(a => String(a.id) === String(tempChosenId)) || AL[0];
    if(match){
      addr = {
        name: match.name || '',
        phone: match.phone || '',
        pincode: match.pincode || '',
        city: match.city || '',
        state: match.state || 'Tamil Nadu',
        line: match.line || '',
        id: match.id
      };
    }
    showingSavedAddressPage = false;
    toast('Address selected & autofilled ✓');
    renderStepView();
  };

  $('#btn-back-from-saved-list').onclick = window._closeSavedAddr;
  $('#btn-open-create-addr').onclick = () => {
    showingSavedAddressPage = 'new';
    renderStepView();
  };

  return;
      }

      // SUB-VIEW B: SEPARATE DEDICATED ADD NEW ADDRESS PAGE
      if(showingSavedAddressPage === 'new'){
        app.innerHTML = `
          <div class="max-w-2xl mx-auto space-y-5 animate-fadeIn">
            <div class="flex items-center justify-between px-1">
              <button type="button" id="btn-back-from-new-page" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-slate-800 font-bold text-xs shadow-soft transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                <span>Back</span>
              </button>
              <span class="text-xs font-bold text-slate-500">New Address Details</span>
            </div>

            <form id="dedicated-new-addr-form" class="bg-white border border-gray-100 rounded-3xl p-5 sm:p-7 shadow-soft space-y-4">
              <div class="border-b pb-3">
                <h2 class="font-extrabold text-base text-slate-900">Add New Address</h2>
                <p class="text-xs text-gray-500 mt-0.5">Enter delivery details and click Save Address</p>
              </div>

              <div class="space-y-3 pt-1">
                ${input('d-name','Full name',`required placeholder="Recipient's Name"`)}
                ${input('d-phone','Mobile Number (10 digits)',`required pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit mobile number"`)}
                ${input('d-pin','Pincode',`required pattern="[1-9][0-9]{5}" maxlength="6" placeholder="6-digit pincode"`)}
                <div class="grid grid-cols-2 gap-3">
                  ${input('d-city','City / District',`required placeholder="City"`)}
                  ${input('d-state','State',`required value="Tamil Nadu"`)}
                </div>
                <label class="block text-xs font-semibold text-gray-700">Door No, Building Name, Street & Area
                  <textarea id="d-line" required rows="2" placeholder="Street, landmark, locality..." class="mt-1 w-full border border-gray-200 rounded-2xl p-3 text-xs outline-none focus:border-slate-900 font-medium"></textarea>
                </label>
              </div>

              <div class="pt-4 border-t flex gap-3">
                <button type="button" id="btn-cancel-create-addr" class="flex-1 py-3.5 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-slate-800 font-bold text-xs transition">
                  Cancel
                </button>
                <button type="submit" class="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-4 rounded-full text-xs shadow-soft transition flex items-center justify-center gap-2">
                  <span>Save Address</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </button>
              </div>
            </form>
          </div>
        `;

        $('#btn-back-from-new-page').onclick = () => {
          history.back();
        };
        $('#btn-cancel-create-addr').onclick = () => {
          history.back();
        };

        $('#dedicated-new-addr-form').onsubmit = async e => {
          e.preventDefault();
          const newEntry = {
            id: Date.now().toString(36),
            name: $('#d-name').value.trim(),
            phone: $('#d-phone').value.trim(),
            pincode: $('#d-pin').value.trim(),
            city: $('#d-city').value.trim(),
            state: $('#d-state').value.trim(),
            line: $('#d-line').value.trim(),
            def: !AL.length
          };
          addr = { ...newEntry };
          try {
            AL.push(newEntry);
            await setAddrs(AL);
          } catch(err){}
          toast('Address saved & selected ✓');
          showingSavedAddressPage = false;
          renderStepView();
        };

        return;
      }

      // MAIN VIEW: STEP 2 DELIVERY ADDRESS
      // 1st line: Choose Saved Address option
      // Below: Enter Address fields (autofilled if address chosen) + Next Payment option
      app.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-5 animate-fadeIn">
          ${renderStepperHeader(2)}
          <form id="step-addr-form" class="bg-white border border-gray-100 rounded-3xl p-5 sm:p-7 shadow-soft space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <div>
                <h2 class="font-extrabold text-base text-slate-900">Step 2: Delivery Address</h2>
                <p class="text-xs text-gray-500 mt-0.5">Confirm or enter your delivery address</p>
              </div>
              <button type="button" id="btn-back-to-step1" class="text-xs font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Back to Products
              </button>
            </div>

            <!-- First Line: Choose Saved Address Option -->
            ${AL.length ? `
              <div class="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span class="text-[11px] font-black uppercase tracking-wider text-gray-500">Choose Saved Address (${AL.length} Available)</span>
                  </div>
                  <p class="text-xs font-bold text-gray-900 truncate mt-1">
                    ${addr.line ? `${esc(addr.name)} – ${esc(addr.line.slice(0, 30))}…` : 'Tap to select an existing saved address'}
                  </p>
                </div>
                <button type="button" id="btn-open-saved-addr-page" class="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 active:scale-95">
                  <span>Choose Address ➔</span>
                </button>
              </div>
            ` : ''}

            <!-- Enter Address Section (Autofilled with chosen address or editable for new users) -->
            <div class="pt-1 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ${addr.line ? 'Delivery Address Details (Autofilled)' : 'Enter Delivery Address'}
                </span>
              </div>

              ${input('a-name','Full name',`required placeholder="Enter full name" value="${esc(addr.name||'')}"`)}
              ${input('a-phone','Mobile Number (10 digits)',`required pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit mobile number" value="${esc(addr.phone||'')}"`)}
              ${input('a-pin','Pincode',`required pattern="[1-9][0-9]{5}" maxlength="6" placeholder="6-digit pincode" value="${esc(addr.pincode||'')}"`)}
              <div class="grid grid-cols-2 gap-3">
                ${input('a-city','City / District',`required placeholder="City" value="${esc(addr.city||'')}"`)}
                ${input('a-state','State',`required value="${esc(addr.state||'Tamil Nadu')}"`)}
              </div>
              <label class="block text-xs font-semibold text-gray-700">Door No, Building Name, Street & Area
                <textarea id="a-line" required rows="2" placeholder="Complete address..." class="mt-1 w-full border border-gray-200 rounded-2xl p-3 text-xs outline-none focus:border-slate-900 font-medium">${esc(addr.line||'')}</textarea>
              </label>
            </div>

            <!-- Next Payment Option Button -->
            <div class="pt-3 flex gap-3">
              <button type="button" id="btn-back-to-step1-bottom" class="flex-1 py-3.5 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-slate-800 font-bold text-xs transition">
                ← Back
              </button>
              <button type="submit" class="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-4 rounded-full text-xs shadow-soft transition flex items-center justify-center gap-2">
                <span>Proceed to Payment</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </form>
        </div>
      `;

      const goBackStep1 = () => {
        history.back();
      };

      $('#btn-back-to-step1').onclick = goBackStep1;
      $('#btn-back-to-step1-bottom').onclick = goBackStep1;

      // Click "Choose Address" to open separate saved addresses page
      const openSavedBtn = $('#btn-open-saved-addr-page');
      if(openSavedBtn){
        openSavedBtn.onclick = () => {
          showingSavedAddressPage = 'list';
          pushCheckoutState(2, 'list');
          renderStepView();
        };
      }

      // Submit Form -> Saves to saved addresses & Proceeds to Step 3 (Payment)
      $('#step-addr-form').onsubmit = async e => {
        e.preventDefault();
        addr = {
          ...addr,
          name: $('#a-name').value.trim(),
          phone: $('#a-phone').value.trim(),
          pincode: $('#a-pin').value.trim(),
          city: $('#a-city').value.trim(),
          state: $('#a-state').value.trim(),
          line: $('#a-line').value.trim()
        };

        // Automatically save to user's saved address list if not already saved
        try {
          const currentList = await getAddrs();
          const existing = currentList.find(x => 
            x.line.trim().toLowerCase() === addr.line.trim().toLowerCase() && 
            x.pincode.trim() === addr.pincode.trim()
          );
          if(!existing){
            const newEntry = {
              ...addr,
              id: Date.now().toString(36),
              def: !currentList.length
            };
            AL.push(newEntry);
            await setAddrs([...currentList, newEntry]);
          }
        } catch(err){}

        currentStep = 3;
        pushCheckoutState(3, false);
        renderStepView();
      };

      return;
    }

    // ==========================================
    // STEP 3: PAYMENT DETAILS (RESPONSIVE ALIGNMENT FIX FOR MOBILE)
    // ==========================================
    if(currentStep === 3){
      const totalPayable = sub - d;
      const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalPayable}&cu=INR&tn=${encodeURIComponent((SET.brand?.name||'Thaarai Tex')+' order')}`;

      app.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-5 animate-fadeIn">
          ${renderStepperHeader(3)}
          <div class="bg-white border border-gray-100 rounded-3xl p-5 sm:p-7 shadow-soft space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <div>
                <h2 class="font-extrabold text-base text-slate-900">Step 3: Payment Details</h2>
                <p class="text-xs text-gray-500 mt-0.5">Select how you want to pay for this order</p>
              </div>
              <button type="button" id="btn-back-to-step2" class="text-xs font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Back to Address
              </button>
            </div>

            <div class="space-y-3 pt-1">
              <!-- Cash on Delivery Option Card -->
              <label class="block border-2 rounded-2xl p-4 cursor-pointer transition ${method === 'COD' ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}">
                <div class="flex items-start gap-3">
                  <input type="radio" name="step-pm" value="COD" ${method === 'COD' ? 'checked' : ''} class="accent-slate-900 w-4 h-4 mt-0.5 shrink-0">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      ${ICONS.cash} <span>Cash on Delivery (COD)</span>
                    </p>
                    <p class="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed">
                      Pay safely in cash when your sarees are delivered to your door.
                    </p>
                  </div>
                </div>
              </label>

              <!-- UPI / Online Payment Option Card -->
              <label class="block border-2 rounded-2xl p-4 cursor-pointer transition ${method === 'UPI' ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}">
                <div class="flex items-start gap-3">
                  <input type="radio" name="step-pm" value="UPI" ${method === 'UPI' ? 'checked' : ''} class="accent-slate-900 w-4 h-4 mt-0.5 shrink-0">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      ${ICONS.upi} <span>Online Payment (UPI / QR / GPay / PhonePe)</span>
                    </p>
                    <p class="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed">
                      Instant scan & pay via any UPI application (GPay, PhonePe, Paytm).
                    </p>
                  </div>
                </div>
              </label>
            </div>

            <!-- UPI details section -->
            <div id="step-upi-container" class="${method === 'UPI' ? '' : 'hidden'} border border-emerald-200 rounded-3xl p-5 bg-emerald-50/70 text-xs space-y-3.5 text-center">
              <div>
                <p class="text-xs text-emerald-900 font-medium">Pay exactly <b class="text-base font-black text-emerald-950">${inr(totalPayable)}</b> to this UPI ID:</p>
                <p class="font-mono bg-white border border-emerald-300 rounded-2xl py-2.5 font-black select-all text-sm text-slate-900 shadow-2xs mt-2">${esc(UPI_ID)}</p>
              </div>

              <div id="step-qr-box" class="flex justify-center py-2 bg-white rounded-2xl border border-emerald-100 p-3 max-w-[200px] mx-auto shadow-sm"></div>

              <div class="flex flex-col sm:flex-row gap-2 justify-center">
                <a id="step-upi-app-link" href="${upiLink}" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-full inline-flex items-center justify-center gap-1.5 shadow-sm text-xs transition">
                  <span>Open UPI App</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>

              <div class="text-left pt-2">
                <label class="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">UPI Transaction ID / UTR Number <span class="text-rose-600">*</span></label>
                <input id="step-utr-input" maxlength="22" placeholder="e.g. 331234567890 (12 digits)" value="${esc(utrNumber)}" class="w-full border border-emerald-300 rounded-2xl p-3 text-xs outline-none focus:border-slate-900 bg-white font-bold text-slate-900">
                <p class="text-[10px] text-emerald-800 mt-1">Please enter the 12-digit UPI reference number after making payment.</p>
              </div>
            </div>

            <!-- Amount summary footer -->
            <div class="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
              <span class="text-xs font-bold text-gray-500">Payable Amount:</span>
              <span class="text-lg font-black text-slate-900">${inr(totalPayable)}</span>
            </div>

            <div class="pt-3 flex gap-3">
              <button type="button" id="btn-back-to-step2-bottom" class="flex-1 py-3.5 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-slate-800 font-bold text-xs transition">
                ← Back
              </button>
              <button type="button" id="btn-to-step4" class="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-4 rounded-full text-xs shadow-soft transition flex items-center justify-center gap-2">
                <span>Proceed to Confirmation Check</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      if(method === 'UPI' && window.QRCode){
        const qrEl = $('#step-qr-box');
        if(qrEl){
          qrEl.innerHTML = '';
          new QRCode(qrEl, { text: upiLink, width: 140, height: 140 });
        }
      }

      document.querySelectorAll('input[name=step-pm]').forEach(r => {
        r.onchange = () => {
          method = r.value;
          renderStepView();
        };
      });

      const goBackStep2 = () => {
        if(method === 'UPI') utrNumber = $('#step-utr-input')?.value.trim() || utrNumber;
        history.back();
      };

      $('#btn-back-to-step2').onclick = goBackStep2;
      $('#btn-back-to-step2-bottom').onclick = goBackStep2;

      $('#btn-to-step4').onclick = () => {
        if(method === 'UPI'){
          const val = $('#step-utr-input')?.value.trim() || '';
          if(!/^[A-Za-z0-9]{8,22}$/.test(val)){
            return toast('Please pay via UPI and enter the valid 8-22 character UTR / transaction number');
          }
          utrNumber = val;
        }
        currentStep = 4;
        pushCheckoutState(4, false);
        renderStepView();
      };

      return;
    }

    // ==========================================
    // STEP 4: CONFIRMATION CHECK (SEPARATE DEDICATED PAGE VIEW WITH BACK BUTTON)
    // ==========================================
    if(currentStep === 4){
      const totalPayable = sub - d;

      app.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
          
          <!-- Back navigation & Stepper Header -->
          <div class="flex items-center justify-between px-1">
            <button type="button" id="btn-back-to-step3" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-slate-800 font-bold text-xs shadow-soft transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
              <span>Back to Payment</span>
            </button>
            <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Step 4 of 4</span>
          </div>

          ${renderStepperHeader(4)}

          <!-- Order Confirmation Review Card -->
          <div class="bg-white border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-soft space-y-6">
            <div class="border-b pb-4">
              <div class="inline-block bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">Final Review</div>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900">Order Confirmation Check</h1>
              <p class="text-xs text-gray-500 mt-1">Please inspect all order details thoroughly before placing your order.</p>
            </div>

            <!-- 1. Ordered Products Breakdown -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider">1. Ordered Items (${L.length})</h3>
                <button type="button" id="review-edit-items" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline">Edit Items</button>
              </div>
              <div class="space-y-2.5 bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-gray-100">
                ${L.map(l => `
                  <div class="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                    <div class="flex items-center gap-3 min-w-0">
                      <img src="${img(l.p)}" alt="" class="w-12 h-14 object-cover rounded-lg bg-gray-50 border border-gray-200 shrink-0">
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <p class="font-bold text-xs text-slate-900 truncate">${esc(l.p.name)}</p>
                        </div>
                        <p class="text-[11px] text-gray-500 mt-0.5 font-medium">${inr(l.p.price)} × <b>${l.qty}</b></p>
                      </div>
                    </div>
                    <span class="font-black text-xs sm:text-sm text-slate-900 shrink-0">${inr(l.p.price * l.qty)}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 2. Delivery Address Verification -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider">2. Delivery Address</h3>
                <button type="button" id="review-edit-address" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline">Change Address</button>
              </div>
              <div class="bg-slate-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-1 leading-relaxed">
                <div class="flex items-center gap-2">
                  <span class="font-black text-sm text-slate-900">${esc(addr.name)}</span>
                  <span class="bg-white border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700">📞 ${esc(addr.phone)}</span>
                </div>
                <p class="text-slate-700 font-medium mt-1">${esc(addr.line)}</p>
                <p class="text-slate-600 font-medium">${esc(addr.city)}, ${esc(addr.state)} - <span class="font-bold text-slate-900 font-mono">${esc(addr.pincode)}</span></p>
              </div>
            </div>

            <!-- 3. Payment Method Verification -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider">3. Payment Details</h3>
                <button type="button" id="review-edit-payment" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline">Change Payment</button>
              </div>
              <div class="bg-slate-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-gray-500">Method</span>
                  <span class="font-black text-slate-900 flex items-center gap-1.5">
                    ${method === 'UPI' ? `${ICONS.upi} Online UPI / QR` : `${ICONS.cash} Cash on Delivery`}
                  </span>
                </div>
                ${method === 'UPI' ? `
                  <div class="flex items-center justify-between border-t border-gray-200 pt-2">
                    <span class="font-bold text-gray-500">UPI Ref / UTR</span>
                    <span class="font-mono font-black text-slate-900 bg-white border border-gray-200 px-2 py-0.5 rounded select-all">${esc(utrNumber)}</span>
                  </div>
                ` : `
                  <div class="flex items-center justify-between border-t border-gray-200 pt-2">
                    <span class="font-bold text-gray-500">Payment Status</span>
                    <span class="text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px]">Pay Cash on Arrival</span>
                  </div>
                `}
              </div>
            </div>

            <!-- 4. Price & Bill Summary -->
            <div class="space-y-3">
              <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider">4. Price Summary</h3>
              <div class="bg-slate-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-2">
                <div class="flex justify-between text-gray-600"><span>Items Total (${L.reduce((s,i)=>s+i.qty,0)} sarees)</span><span class="font-bold text-slate-900">${inr(sub)}</span></div>
                <div class="flex justify-between text-emerald-700 font-bold"><span>Discount ${coupon ? `(${coupon})` : ''}</span><span>−${inr(d)}</span></div>
                <div class="flex justify-between text-gray-600"><span>Shipping / Delivery</span><span class="text-emerald-700 font-bold">FREE DELIVERY</span></div>
                <div class="flex justify-between font-black text-base border-t border-gray-200 pt-2.5 text-slate-900">
                  <span>${method === 'UPI' ? 'Total Amount Paid' : 'Amount to Pay on Delivery'}</span>
                  <span class="text-emerald-700 font-black text-lg">${inr(totalPayable)}</span>
                </div>
              </div>
            </div>

            <!-- Final Confirm Button -->
            <div class="pt-4 border-t space-y-3">
              <button id="btn-final-confirm-order" type="button" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-full text-sm sm:text-base tracking-wide shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
                <span>Confirm & Place Order · ${inr(totalPayable)}</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </button>
              <p class="text-[11px] text-center text-gray-400">By confirming, you agree to place this order with Thaarai Tex.</p>
            </div>

          </div>
        </div>
      `;

      // Back navigation & Edit links
      $('#btn-back-to-step3').onclick = () => { history.back(); };
      $('#review-edit-items').onclick = () => { currentStep = 1; pushCheckoutState(1, false); renderStepView(); };
      $('#review-edit-address').onclick = () => { currentStep = 2; pushCheckoutState(2, false); renderStepView(); };
      $('#review-edit-payment').onclick = () => { currentStep = 3; pushCheckoutState(3, false); renderStepView(); };

      // Final Confirm Click
      $('#btn-final-confirm-order').onclick = async () => {
        const b = $('#btn-final-confirm-order');
        b.disabled = true;
        b.innerHTML = `
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
          <span>Placing Order…</span>
        `;

        try{
          if(!sb) throw new Error('Database connection missing');
          const orderItems = isBuyNow 
            ? [{ id: buyNowItem.id, qty: buyNowItem.qty }] 
            : cart.map(i => ({ id: i.id, qty: i.qty }));

          const { data: orderId, error } = await sb.rpc('place_order_guest', {
            p_items: orderItems,
            p_address: addr,
            p_coupon: coupon || null,
            p_method: method,
            p_ref: utrNumber || null
          });

          if(error){
            toast(error.message);
            b.disabled = false;
            b.textContent = 'Confirm & Place Order · ' + inr(totalPayable);
            return;
          }

          const owner = profile()?.phone || addr.phone;
          await sb.rpc('set_order_account', { p_id: orderId, p_account: owner });
          if(!profile()) await setProfile(addr.name, addr.phone);
          const L2 = await getAddrs();
          if(!L2.some(x => x.line === addr.line && x.pincode === addr.pincode)){
            await setAddrs([...L2, { ...addr, id: Date.now().toString(36), def: !L2.length }]);
          }

          if(isBuyNow){
            buyNowItem = null;
          } else {
            cart = [];
            saveCart();
          }
          OC = { list: [] };

          // Show dedicated full-screen blank page animation for order placed
          window.scrollTo({ top: 0, behavior: 'instant' });
          $('#tabbar')?.classList.add('hidden');

          document.body.innerHTML = `
            <div class="fixed inset-0 z-[999999] bg-white flex flex-col items-center justify-center text-center p-6 select-none animate-fadeIn">
              <div class="py-4">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
              <h1 class="text-3xl font-black text-slate-950 tracking-tight mt-3">Order Placed Successfully!</h1>
              <p class="text-sm font-semibold text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                உங்கள் ஆர்டர் வெற்றிகரமாகப் பதிவானது.<br>
                Order No: <span class="font-mono font-black text-slate-900 text-base">#${esc(String(orderId).slice(0,8).toUpperCase())}</span>
                ${method==='UPI'?'<br><span class="text-emerald-700 font-bold text-xs mt-1 inline-block">We will verify your UPI payment shortly.</span>':''}
              </p>
              <p class="text-[11px] text-slate-400 mt-6 font-medium animate-pulse">Redirecting to your orders...</p>
            </div>
          `;

          // Automatically close after 3 seconds and go to orders tab
          setTimeout(() => {
            location.href = '#/account/orders';
            location.reload();
          }, 3000);
          return;

        } catch(err){
          toast(err.message || 'Error placing order');
          b.disabled = false;
          b.textContent = 'Confirm & Place Order · ' + inr(totalPayable);
        }
      };

      return;
    }
  }

  // Live item quantity adjuster handler in Step 1
  app.onclick = async e => {
    // Quantity modifier buttons in Step 1
    const qbtn = e.target.closest('[data-cq]');
    if(qbtn){
      const id = qbtn.dataset.cq;
      const delta = Number(qbtn.dataset.d);
      if(isBuyNow){
        const max = buyNowItem.p.stock || 10;
        const next = buyNowItem.qty + delta;
        if(next < 1) return toast('Minimum 1 quantity required');
        if(next > max) return toast(`Only ${max} available in stock`);
        buyNowItem.qty = next;
        L[0].qty = next;
        await recalculateTotals();
        renderStepView();
      } else {
        const itm = cart.find(x => x.id === id);
        if(!itm) return;
        const line = L.find(l => l.id === id);
        const max = line?.p?.stock || 10;
        const next = itm.qty + delta;
        if(next < 1){
          const ok = await showModalDialog({
            title: 'Remove Saree?',
            message: 'Are you sure you want to remove this saree from your order?',
            confirmText: 'Remove',
            cancelText: 'Keep in Order',
            danger: true
          });
          if(ok){
            cart = cart.filter(x => x.id !== id);
            saveCart();
            L = await cartLines();
            if(!L.length){ location.hash = '#/cart'; return; }
            await recalculateTotals();
            renderStepView();
          }
          return;
        }
        if(next > max) return toast(`Only ${max} available in stock`);
        itm.qty = next;
        line.qty = next;
        saveCart();
        await recalculateTotals();
        renderStepView();
      }
    }
  };

  renderStepView();
}

let confirmArmed = false;
