const OWNER = "6285178418341";
const OPEN_HOUR = 10;
const CLOSE_HOUR = 23;

function getJakartaTime() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  return {
    hour: Number(parts.find(p => p.type === "hour").value),
    minute: Number(parts.find(p => p.type === "minute").value)
  };
}

function updateStoreStatus() {
  const status = document.getElementById("statusText");
  if (!status) return;

  const { hour, minute } = getJakartaTime();
  const now = hour * 60 + minute;
  const open = now >= OPEN_HOUR * 60 && now < CLOSE_HOUR * 60;

  status.textContent = open ? "[OPEN]" : "[CLOSED]";
  status.style.color = open ? "#35d66f" : "#ff7272";
}

updateStoreStatus();
setInterval(updateStoreStatus, 30000);

document.querySelectorAll(".product").forEach(button => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    const message = `Hai kak saya mau beli ${product}, tolong konfirmasi pembayarannya yaa kak...`;
    window.open(`https://wa.me/${OWNER}?text=${encodeURIComponent(message)}`, "_blank");
  });
});

const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

menuToggle?.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

mobileNav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const claimForm=document.getElementById("claimForm");
claimForm?.addEventListener("submit",(event)=>{event.preventDefault();const name=document.getElementById("claimName").value.trim();const product=document.getElementById("claimProduct").value.trim();const issue=document.getElementById("claimIssue").value.trim();const date=document.getElementById("claimDate").value.trim();if(!name||!product||!issue||!date)return;const message=`Hai kak saya ingin claim garansi, ini format garansi saya :\n\nnama : ${name}\nproduk yang dibeli: ${product}\nkendala : ${issue}\ntanggal order : ${date}\n\nMohon segera proses yaa kak, terima kasih...`;window.open(`https://wa.me/${OWNER}?text=${encodeURIComponent(message)}`,"_blank");});
