const PRODUCTS=[];
let SETTINGS={whatsapp:"6280000000000",storeName:"Dappiwz Store"};
let CATEGORIES=[];
let cart=JSON.parse(localStorage.getItem("dappiwz_cart")||"[]");
let activeFilter="Semua";

async function loadStoreData(){
  try{
    const [products,categories,settings]=await Promise.all([
      fetch("data/products.json").then(r=>r.json()),
      fetch("data/categories.json").then(r=>r.json()),
      fetch("data/settings.json").then(r=>r.json())
    ]);
    PRODUCTS.splice(0,PRODUCTS.length,...products);
    CATEGORIES.splice(0,CATEGORIES.length,...categories);
    SETTINGS=settings;
    document.querySelectorAll("a[href*='wa.me/6280000000000']").forEach(a=>a.href=a.href.replace("6280000000000",SETTINGS.whatsapp));
    renderProducts(); renderCart();
  }catch(e){console.error("Gagal memuat data toko:",e); toast("Data toko gagal dimuat");}
}

const rupiah=n=>"Rp"+Number(n).toLocaleString("id-ID");
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

function renderProducts(){
 const q=$("#searchInput").value.toLowerCase().trim();
 const list=PRODUCTS.filter(p=>(activeFilter==="Semua"||p.cat===activeFilter)&&(!q||`${p.name} ${p.cat} ${p.desc}`.toLowerCase().includes(q)));
 $("#productGrid").innerHTML=list.length?list.map(p=>`
 <article class="product-card">
  <div class="product-image">${p.badge?`<span class="badge">${p.badge}</span>`:""}<span class="product-symbol">${p.symbol}</span></div>
  <div class="product-info"><div class="product-cat">${p.cat}</div><h3>${p.name}</h3><p>${p.desc}</p>
  <div class="product-bottom"><span class="product-price">${rupiah(p.price)}</span><button class="product-buy" onclick="openProduct(${p.id})">DETAIL</button></div></div>
 </article>`).join(""):`<div class="empty">Produk tidak ditemukan.</div>`;
}
function saveCart(){localStorage.setItem("dappiwz_cart",JSON.stringify(cart));renderCart();}
function addCart(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;const found=cart.find(x=>x.id===id);if(found)found.qty++;else cart.push({id,qty:1});saveCart();toast("Produk ditambahkan ke keranjang");}
function removeCart(id){cart=cart.filter(x=>x.id!==id);saveCart();}
function renderCart(){
 $("#cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
 let total=0;
 $("#cartItems").innerHTML=cart.length?cart.map(x=>{const p=PRODUCTS.find(y=>y.id===x.id);total+=p.price*x.qty;return `<div class="cart-row"><div><h4>${p.name}</h4><p>${x.qty} × ${rupiah(p.price)}</p></div><div><strong>${rupiah(p.price*x.qty)}</strong><br><button class="cart-remove" onclick="removeCart(${p.id})">hapus</button></div></div>`}).join(""):`<div class="empty">Keranjang masih kosong.</div>`;
 $("#cartTotal").textContent=rupiah(total);$("#checkoutTotal").textContent=rupiah(total);
}
function openProduct(id){
 const p=PRODUCTS.find(x=>x.id===id);
 $("#modalContent").innerHTML=`<div class="modal-cat">${p.cat} / PRODUCT</div><h2>${p.name}</h2><p>${p.desc}</p><div class="modal-price">${rupiah(p.price)}</div><div class="modal-actions"><button class="btn btn-light" onclick="addCart(${p.id});closeModals()">Tambah ke Keranjang</button><button class="btn btn-outline" onclick="addCart(${p.id});closeModals();openCheckout()">Beli Sekarang</button></div>`;
 $("#productModal").classList.add("show");
}
function openCheckout(){
 if(!cart.length){toast("Keranjang masih kosong");return}
 $("#checkoutTotal").textContent=rupiah(cart.reduce((a,x)=>a+PRODUCTS.find(p=>p.id===x.id).price*x.qty,0));
 $("#checkoutModal").classList.add("show");
}
function closeModals(){$$(".modal").forEach(m=>m.classList.remove("show"))}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}

$("#cartBtn").onclick=()=>{$("#cartDrawer").classList.add("open");$("#overlay").classList.add("show")};
$("#closeCart").onclick=()=>{$("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("show")};
$("#overlay").onclick=()=>{$("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("show")};
$("#checkoutBtn").onclick=openCheckout;
$$("[data-close]").forEach(x=>x.onclick=closeModals);
$$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));
$("#searchBtn").onclick=()=>{document.querySelector(".search-section").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("#searchInput").focus(),500)};
$("#searchInput").addEventListener("input",renderProducts);
$("#searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#products").scrollIntoView({behavior:"smooth"})});
$$(".filter").forEach(b=>b.onclick=()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeFilter=b.dataset.filter;renderProducts()});
$$(".category-card").forEach(b=>b.onclick=()=>{activeFilter=b.dataset.category;$$(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===activeFilter));$("#products").scrollIntoView({behavior:"smooth"});renderProducts()});
$$(".faq-item").forEach(b=>b.onclick=()=>b.classList.toggle("open"));
$("#menuBtn").onclick=()=>$("#mobileMenu").style.display=$("#mobileMenu").style.display==="block"?"none":"block";
$$(".mobile-menu a").forEach(a=>a.onclick=()=>$("#mobileMenu").style.display="none");

$("#checkoutForm").onsubmit=e=>{
 e.preventDefault();
 const fd=new FormData(e.target);
 const order="DWP-"+Date.now().toString().slice(-7);
 const lines=cart.map(x=>{const p=PRODUCTS.find(y=>y.id===x.id);return `${p.name} x${x.qty}`}).join("%0A");
 const total=rupiah(cart.reduce((a,x)=>a+PRODUCTS.find(p=>p.id===x.id).price*x.qty,0));
 const msg=`Halo Dappiwz Store,%0ASaya ingin order *${order}*%0A%0A${lines}%0A%0ATotal: ${total}%0ANama: ${encodeURIComponent(fd.get("name"))}%0AWhatsApp: ${encodeURIComponent(fd.get("phone"))}%0AData: ${encodeURIComponent(fd.get("note"))}%0APayment: ${encodeURIComponent(fd.get("payment"))}`;
 window.open(`https://wa.me/6280000000000?text=${msg}`,"_blank");
 cart=[];saveCart();e.target.reset();closeModals();$("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("show");toast("Pesanan dibuat. WhatsApp dibuka.");
};
$("#year").textContent=new Date().getFullYear();
loadStoreData();
