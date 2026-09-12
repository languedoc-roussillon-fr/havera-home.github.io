
const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('haveraCart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('haveraWishlist') || '[]')
};
const save = () => { localStorage.setItem('haveraCart', JSON.stringify(state.cart)); localStorage.setItem('haveraWishlist', JSON.stringify(state.wishlist)); updateCount(); };
const updateCount = () => { const el=document.getElementById('cartCount'); if(el) el.textContent=state.cart.reduce((a,b)=>a+b.qty,0); };
const addToCart = id => { const item=state.cart.find(x=>x.id===id); item ? item.qty++ : state.cart.push({id,qty:1}); save(); toast('Added to cart'); };
const toggleWish = id => { state.wishlist = state.wishlist.includes(id) ? state.wishlist.filter(x=>x!==id) : [...state.wishlist,id]; save(); toast(state.wishlist.includes(id)?'Saved to wishlist':'Removed from wishlist'); };
const toast = m => { let t=document.querySelector('.toast'); if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)} t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1400); };
const card = p => `<article class="card"><div class="badge">${p.id%4===0?'Bestseller':p.id%4===1?'New':''}</div><button class="wish" onclick="toggleWish(${p.id})">♡</button><a href="product.html?id=${p.id}" class="pic"><img src="${p.image}" alt="${p.name}" loading="lazy"></a><div class="rating">★★★★★ <span class="muted">(${p.reviews})</span></div><h3>${p.name}</h3><div class="price">$${p.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div><button class="add" onclick="addToCart(${p.id})">Add to Cart</button></article>`;
async function loadProducts(){ try{const r=await fetch('products.json');state.products=await r.json();renderShop();renderProduct();renderCart();renderWishlist();}catch(e){console.error(e)}}
function renderShop(){
  const grid=document.getElementById('shopGrid'); if(!grid) return;
  const search=(document.getElementById('shopSearch')?.value||document.getElementById('search')?.value||'').toLowerCase();
  const cat=document.getElementById('catFilter')?.value||new URLSearchParams(location.search).get('cat')||'';
  const sort=document.getElementById('sort')?.value||'featured';
  let arr=state.products.filter(p=>(!search || (p.name+' '+p.category+' '+p.description).toLowerCase().includes(search))&&(!cat||p.category===cat));
  if(sort==='price-low')arr.sort((a,b)=>a.price-b.price); if(sort==='price-high')arr.sort((a,b)=>b.price-a.price); if(sort==='name')arr.sort((a,b)=>a.name.localeCompare(b.name));
  grid.innerHTML=arr.map(card).join('');
}
function setupFilters(){
 const cf=document.getElementById('catFilter'); if(cf){ [...new Set(state.products.map(p=>p.category))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;cf.appendChild(o)}); const q=new URLSearchParams(location.search).get('cat');if(q)cf.value=q; }
 ['shopSearch','catFilter','sort','search'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderShop));
}
function renderProduct(){
 const el=document.getElementById('productDetail'); if(!el)return;
 const id=Number(new URLSearchParams(location.search).get('id')||0); const p=state.products.find(x=>x.id===id)||state.products[0];
 el.innerHTML=`<div style="display:grid;grid-template-columns:1.05fr 1fr;gap:34px;align-items:start"><div class="pic" style="height:520px;background:#fff"><img src="${p.image}" alt="${p.name}"></div><div><div class="eyebrow">${p.category}</div><h1 class="page-title">${p.name}</h1><div class="rating">★★★★★ (${p.reviews})</div><div class="price" style="font-size:26px;margin-top:16px">$${p.price.toFixed(2)}</div><p class="muted" style="font-size:16px;line-height:1.7">${p.description}</p><p>Designed for customers who value practical performance and a refined finished look.</p><button class="btn" onclick="addToCart(${p.id})">Add to Cart</button><a class="btn alt" style="background:var(--dark);border-color:var(--dark)" href="contact.html">Ask Support</a><div style="margin-top:28px;padding:20px;background:#efe8dc;border-radius:8px"><strong>HAVERA Service</strong><p class="muted">Support: 1-800-555-0199 · support@haverahome.com</p></div></div></div>`;
}
function renderCart(){
 const el=document.getElementById('cartPage');if(!el)return;
 if(!state.cart.length){el.innerHTML='<p>Your cart is empty.</p><a class="btn" href="shop.html">Shop Now</a>';return}
 let total=0; el.innerHTML=state.cart.map(i=>{const p=state.products.find(x=>x.id===i.id);if(!p)return'';total+=p.price*i.qty;return `<div style="display:flex;gap:15px;align-items:center;background:#fff;padding:14px;margin:10px 0;border:1px solid var(--line);border-radius:7px"><img src="${p.image}" style="width:85px;height:85px;object-fit:cover;border-radius:5px"><div style="flex:1"><strong>${p.name}</strong><div class="muted">Qty ${i.qty}</div></div><div><b>$${(p.price*i.qty).toFixed(2)}</b> <button onclick="state.cart=state.cart.filter(x=>x.id!==${i.id});save();renderCart()">Remove</button></div></div>`}).join('')+`<h2>Total: $${total.toFixed(2)}</h2><button class="btn" onclick="toast('Checkout demo ready')">Proceed to Checkout</button>`;
}
function renderWishlist(){
 const el=document.getElementById('wishlistPage');if(!el)return;
 const arr=state.products.filter(p=>state.wishlist.includes(p.id)); el.innerHTML=arr.length?`<div class="grid">${arr.map(card).join('')}</div>`:'<p>No saved items yet.</p>';
}
updateCount(); loadProducts().then(setupFilters);
document.getElementById('search')?.addEventListener('keydown',e=>{if(e.key==='Enter')location.href='shop.html?search='+encodeURIComponent(e.target.value)});
