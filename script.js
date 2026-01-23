// ===== Mobile Nav =====
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#navMenu");

if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
            if (window.innerWidth <= 720) {
                navMenu.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    });
}

// ===== Reveal Animations =====
const revealEls = document.querySelectorAll("[data-reveal]");
const io = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("revealed");
        });
    },
    { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));

// ===== WhatsApp Message Builder =====
const fullName = document.getElementById("fullName");
const phone = document.getElementById("phone");
const orderType = document.getElementById("orderType");
const details = document.getElementById("details");
const msgPreview = document.getElementById("msgPreview");
const buildBtn = document.getElementById("buildMsg");
const waQuick = document.getElementById("waQuick");
const copyBtn = document.getElementById("copyMsg");
const copyStatus = document.getElementById("copyStatus");

const BUSINESS_PHONE = "972528522320"; // להחליף למספר אמיתי (בלי +)
const BRAND = "Bashan’s";

function cleanText(s) { return (s || "").trim(); }

function buildMessage() {
    const name = cleanText(fullName?.value);
    const tel = cleanText(phone?.value);
    const type = cleanText(orderType?.value);
    const info = cleanText(details?.value);

    const lines = [];
    lines.push(`היי ${BRAND} 👋`);
    if (name) lines.push(`אני ${name}`);
    if (tel) lines.push(`טלפון לחזרה: ${tel}`);
    lines.push(`אני מעוניין להזמין: ${type}`);
    if (info) lines.push(`פרטים: ${info}`);
    lines.push(`תודה!`);
    return lines.join("\n");
}

function updatePreview() {
    if (!msgPreview) return;
    const msg = buildMessage();
    msgPreview.textContent = msg && msg.length > 10 ? msg : "מלא את הפרטים כדי לבנות הודעה.";
}

function setWhatsAppLink() {
    if (!waQuick) return;
    const msg = encodeURIComponent(buildMessage());
    waQuick.href = `https://wa.me/${BUSINESS_PHONE}?text=${msg}`;
    waQuick.target = "_blank";
    waQuick.rel = "noopener";
}

function flashStatus(text) {
    if (!copyStatus) return;
    copyStatus.textContent = text;
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(() => { copyStatus.textContent = ""; }, 1600);
}

[fullName, phone, orderType, details].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
        updatePreview();
        setWhatsAppLink();
    });
});

if (buildBtn) {
    buildBtn.addEventListener("click", () => {
        updatePreview();
        setWhatsAppLink();
    });
}

if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        const msg = buildMessage();
        try {
            await navigator.clipboard.writeText(msg);
            flashStatus("ההודעה הועתקה ✅");
        } catch {
            flashStatus("לא הצלחתי להעתיק. תסמן ידנית מהתצוגה מקדימה.");
        }
    });
}

updatePreview();
setWhatsAppLink();

// ===== Lightbox =====
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightboxImg");
const lbCaption = document.getElementById("lightboxCaption");
const lbClose = document.querySelector(".lb-close");
const lbPrev = document.querySelector(".lb-prev");
const lbNext = document.querySelector(".lb-next");
const lbInner = document.querySelector(".lightbox-inner");

const items = Array.from(document.querySelectorAll(".lightbox-item"));
let currentIndex = -1;

function openLightbox(index) {
    currentIndex = index;
    const fig = items[currentIndex];
    const img = fig.querySelector("img");
    const fullSrc = fig.getAttribute("data-full") || img.src;
    const alt = img.getAttribute("alt") || "";

    lbImg.src = fullSrc;
    lbImg.alt = alt;
    lbCaption.textContent = alt;

    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.src = "";
    lbImg.alt = "";
    currentIndex = -1;
}

function prevImage() {
    if (currentIndex < 0) return;
    const next = (currentIndex - 1 + items.length) % items.length;
    openLightbox(next);
}

function nextImage() {
    if (currentIndex < 0) return;
    const next = (currentIndex + 1) % items.length;
    openLightbox(next);
}

items.forEach((fig, i) => {
    fig.addEventListener("click", () => openLightbox(i));
    fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") openLightbox(i);
    });
});

lbClose?.addEventListener("click", closeLightbox);
lbPrev?.addEventListener("click", prevImage);
lbNext?.addEventListener("click", nextImage);

lb?.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
});

lbInner?.addEventListener("click", (e) => e.stopPropagation());

document.addEventListener("keydown", (e) => {
    if (!lb?.classList.contains("open")) return;

    if (e.key === "Escape") closeLightbox();

    if (e.key === "ArrowLeft") nextImage();
    if (e.key === "ArrowRight") prevImage();
});