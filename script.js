const PRODUCTS=[];
let SETTINGS={
  whatsapp:"6280000000000",
  storeName:"Dappiwz Store",
  testimonial:"#testimoni",
  whatsappGroup:"#"
};
let CATEGORIES=[];
let cart=JSON.parse(localStorage.getItem("dappiwz_cart")||"[]");
let activeFilter="Semua";

const DEFAULT_PRODUCTS=[
  {id:1,name:"Mobile Legends 5 Diamonds",cat:"Gaming",price:1500,desc:"Jumlah lain bisa cek group Dappiwz.",badge:"",symbol:"ML",image:"assets/produk1.png"},
  {id:2,name:"Mobile Legends WDP",cat:"Gaming",price:30000,desc:"Ini harga untuk server Indo.",badge:"",symbol:"WDP",image:"assets/produk2.png"},
  {id:3,name:"Netflix 1P1U 1 Bulan",cat:"Aplikasi Premium",price:29000,desc:"Strong durasi 21–25h.",badge:"",symbol:"NF",image:"assets/produk3.png"}
];
const DEFAULT_CATEGORIES=[
  {id:"Gaming",name:"Gaming",description:"Topup game, WDP, Starlight ML, Robux, dll"},
  {id:"Aplikasi Premium",name:"Aplikasi Premium",description:"YouTube Premium, Netflix, Wink, Alight Motion, Canva, dll"},
  {id:"Sosial Media",name:"Sosial Media",description:"Suntik TikTok, Instagram, channel WhatsApp, dll"},
  {id:"Kebutuhan Hosting",name:"Kebutuhan Hosting",description:"Panel bot, sewa bot WA, script bot, dll"},
  {id:"Paid Edit",name:"Paid Edit",description:"Edit JJ, edit logo store/JB, edit poster OPMEM, dll"},
  {id:"Jasa Digital",name:"Jasa Digital",description:"Jasa HD SW, fix script bot error, install bot WA/Tele, dll"}
];

const rupiah=n=>"Rp"+Number(n).toLocaleString("id-ID");
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

function updateStoreStatus(){
  const now=new Date();
  const parts=new Intl.DateTimeFormat("en-GB",{
    timeZone:"Asia/Jakarta",
    hour:"2-digit",
    minute:"2-digit",
    hourCycle:"h23"
  }).formatToParts(now);
  const hour=Number(parts.find(x=>x.type==="hour")?.value||0);
  const minute=Number(parts.find(x=>x.type==="minute")?.value||0);
  const currentMinutes=hour*60+minute;
  const open=currentMinutes>=600 && currentMinutes<1380; // 10:00–22:59 WIB
  const el=$("#storeStatus");
  if(!el)return;
  el.textContent=open?"[OPEN]":"[CLOSE]";
  el.classList.toggle("closed",!open);
  el.setAttribute("aria-label",open?"Toko sedang buka":"Toko sedang tutup");
}

function applySettings(){
  $$('a[href*="wa.me/"]').forEach(a=>{
    if(SETTINGS.whatsapp) a.href=`https://wa.me/${SETTINGS.whatsapp}`;
  });

  const navTestimoni=$("#navTestimoni");
  const navWhatsappGroup=$("#navWhatsappGroup");
  const testiLink=$("#testiLink");
  if(navTestimoni) navTestimoni.href=SETTINGS.testimonial||"#testimoni";
  if(navWhatsappGroup) navWhatsappGroup.href=SETTINGS.whatsappGroup||"#";
  if(testiLink) testiLink.href=SETTINGS.testimonial||"#testimoni";

  if($("#year")) $("#year").textContent=SETTINGS.year||new Date().getFullYear();
  if(document.title && SETTINGS.storeName){
    document.title=`${SETTINGS.storeName} — Digital Marketplace`;
  }
}

async function loadJson(path){
  const response=await fetch(`${path}?v=20260916`,{cache:"no-store"});
  if(!response.ok) throw new Error(`${path} HTTP ${response.status}`);
  return response.json();
}

async function loadStoreData(){
  try{
    const [products,categories,settings]=await Promise.all([
      loadJson("data/products.json"),
      loadJson("data/categories.json"),
      loadJson("data/settings.json")
    ]);
    PRODUCTS.splice(0,PRODUCTS.length,...(Array.isArray(products)?products:DEFAULT_PRODUCTS));
    CATEGORIES.splice(0,CATEGORIES.length,...(Array.isArray(categories)?categories:DEFAULT_CATEGORIES));
    SETTINGS={...SETTINGS,...(settings&&typeof settings==="object"?settings:{})};
  }catch(error){
    console.warn("Data JSON tidak dapat dimuat, memakai data cadangan:",error);
    PRODUCTS.splice(0,PRODUCTS.length,...DEFAULT_PRODUCTS);
    CATEGORIES.splice(0,CATEGORIES.length,...DEFAULT_CATEGORIES);
  }

  applySettings();
  renderProducts();
  renderCart();
}

function renderProducts(){
  const grid=$("#productGrid");
  if(!grid)return;
  const input=$("#searchInput");
  const q=(input?.value||"").toLowerCase().trim();
  const list=PRODUCTS.filter(p=>
    (activeFilter==="Semua"||p.cat===activeFilter) &&
    (!q||`${p.name} ${p.cat} ${p.desc}`.toLowerCase().includes(q))
  );
  grid.innerHTML=list.length?list.map(p=>`
    <article class="product-card">
      <div class="product-image">
        ${p.badge?`<span class="badge">${p.badge}</span>`:""}
        ${p.image?`<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">`:""}
        <span class="product-symbol" ${p.image?'style="display:none"':''}>${p.symbol||"✦"}</span>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-bottom">
          <span class="product-price">${rupiah(p.price)}</span>
          <button class="product-buy" onclick="openProduct(${p.id})">DETAIL</button>
        </div>
      </div>
    </article>`).join(""):`<div class="empty">Produk tidak ditemukan.</div>`;
}

function saveCart(){localStorage.setItem("dappiwz_cart",JSON.stringify(cart));renderCart();}
function addCart(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  const found=cart.find(x=>x.id===id);
  if(found)found.qty++;
  else cart.push({id,qty:1});
  saveCart();
  toast("Produk ditambahkan ke keranjang");
}
function removeCart(id){cart=cart.filter(x=>x.id!==id);saveCart();}
function renderCart(){
  const count=$("#cartCount"), items=$("#cartItems"), totalEl=$("#cartTotal"), checkoutTotal=$("#checkoutTotal");
  if(!count||!items||!totalEl||!checkoutTotal)return;
  count.textContent=cart.reduce((a,x)=>a+x.qty,0);
  let total=0;
  items.innerHTML=cart.length?cart.map(x=>{
    const p=PRODUCTS.find(y=>y.id===x.id);
    if(!p)return "";
    total+=p.price*x.qty;
    return `<div class="cart-row"><div><h4>${p.name}</h4><p>${x.qty} × ${rupiah(p.price)}</p></div><div><strong>${rupiah(p.price*x.qty)}</strong><br><button class="cart-remove" onclick="removeCart(${p.id})">hapus</button></div></div>`;
  }).join(""):`<div class="empty">Keranjang masih kosong.</div>`;
  totalEl.textContent=rupiah(total);
  checkoutTotal.textContent=rupiah(total);
}
function openProduct(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  $("#modalContent").innerHTML=`<div class="modal-cat">${p.cat} / PRODUCT</div><h2>${p.name}</h2><p>${p.desc}</p><div class="modal-price">${rupiah(p.price)}</div><div class="modal-actions"><button class="btn btn-light" onclick="addCart(${p.id});closeModals()">Tambah ke Keranjang</button><button class="btn btn-outline" onclick="addCart(${p.id});closeModals();openCheckout()">Beli Sekarang</button></div>`;
  $("#productModal").classList.add("show");
}
function openCheckout(){
  if(!cart.length){toast("Keranjang masih kosong");return;}
  $("#checkoutTotal").textContent=rupiah(cart.reduce((a,x)=>a+PRODUCTS.find(p=>p.id===x.id).price*x.qty,0));
  $("#checkoutModal").classList.add("show");
}
function closeModals(){$$(".modal").forEach(m=>m.classList.remove("show"));}
function toast(t){
  const e=$("#toast");
  if(!e)return;
  e.textContent=t;e.classList.add("show");
  setTimeout(()=>e.classList.remove("show"),2200);
}

function initInteractions(){
  $("#cartBtn")?.addEventListener("click",()=>{$("#cartDrawer").classList.add("open");$("#overlay").classList.add("show")});
  $("#closeCart")?.addEventListener("click",()=>{$("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("show")});
  $("#overlay")?.addEventListener("click",()=>{$("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("show")});
  $("#checkoutBtn")?.addEventListener("click",openCheckout);
  $$('[data-close]').forEach(x=>x.addEventListener("click",closeModals));
  $$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));

  $("#searchBtn")?.addEventListener("click",()=>{
    $(".search-section")?.scrollIntoView({behavior:"smooth"});
    setTimeout(()=>$("#searchInput")?.focus(),500);
  });
  $("#searchInput")?.addEventListener("input",renderProducts);
  $("#searchInput")?.addEventListener("keydown",e=>{if(e.key==="Enter")$("#products")?.scrollIntoView({behavior:"smooth"})});

  $$(".filter").forEach(b=>b.addEventListener("click",()=>{
    $$(".filter").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    activeFilter=b.dataset.filter;
    renderProducts();
  }));
  $$(".category-card").forEach(b=>b.addEventListener("click",()=>{
    activeFilter=b.dataset.category;
    $$(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===activeFilter));
    $("#products")?.scrollIntoView({behavior:"smooth"});
    renderProducts();
  }));
  $$(".faq-item").forEach(b=>b.addEventListener("click",()=>b.classList.toggle("open")));

  const menuBtn=$("#menuBtn"), menu=$("#mobileMenu");
  menuBtn?.addEventListener("click",()=>{
    const isOpen=menu?.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded",String(!!isOpen));
  });
  $$("#mobileMenu a").forEach(a=>a.addEventListener("click",()=>{
    menu?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded","false");
  }));

  $("#checkoutForm")?.addEventListener("submit",e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const order="DWP-"+Date.now().toString().slice(-7);
    const lines=cart.map(x=>{const p=PRODUCTS.find(y=>y.id===x.id);return `${p.name} x${x.qty}`}).join("%0A");
    const total=rupiah(cart.reduce((a,x)=>a+PRODUCTS.find(p=>p.id===x.id).price*x.qty,0));
    const msg=`Halo Dappiwz Store,%0ASaya ingin order *${order}*%0A%0A${lines}%0A%0ATotal: ${total}%0ANama: ${encodeURIComponent(fd.get("name"))}%0AWhatsApp: ${encodeURIComponent(fd.get("phone"))}%0AData: ${encodeURIComponent(fd.get("note"))}%0APayment: ${encodeURIComponent(fd.get("payment"))}`;
    window.open(`https://wa.me/${SETTINGS.whatsapp}?text=${msg}`,"_blank");
    cart=[];saveCart();e.target.reset();closeModals();$("#cartDrawer")?.classList.remove("open");$("#overlay")?.classList.remove("show");toast("Pesanan dibuat. WhatsApp dibuka.");
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  initInteractions();
  updateStoreStatus();
  setInterval(updateStoreStatus,15000);
  loadStoreData();
});
