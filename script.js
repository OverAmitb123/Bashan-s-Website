/**************************
 NAVBAR MOBILE TOGGLE
**************************/
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.getElementById("navMenu");

function closeMobileMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.classList.remove("active");
    navMenu.classList.remove("open");
}

function openMobileMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.classList.add("active");
    navMenu.classList.add("open");
}

if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        expanded ? closeMobileMenu() : openMobileMenu();
    });

    // לסגור אחרי לחיצה על קישור בתפריט (מובייל)
    navMenu.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
            if (window.matchMedia("(max-width: 720px)").matches) closeMobileMenu();
        });
    });

    // לסגור בלחיצה מחוץ לתפריט (מובייל)
    document.addEventListener("click", (e) => {
        if (!window.matchMedia("(max-width: 720px)").matches) return;
        if (!navMenu.classList.contains("open")) return;
        const clickedInside = navMenu.contains(e.target) || navToggle.contains(e.target);
        if (!clickedInside) closeMobileMenu();
    });

    // לסגור עם ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMobileMenu();
    });
}


/**************************
 REVEAL ON SCROLL
**************************/
const revealElements = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("revealed");
    });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));


/**************************
 LIGHTBOX GALLERY
**************************/
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");

const galleryItems = [...document.querySelectorAll(".lightbox-item")];
let currentIndex = 0;

function openLightbox(index) {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    if (!galleryItems.length) return;

    const item = galleryItems[index];
    const img = item.querySelector("img");
    if (!img) return;

    lightboxImg.src = item.dataset.full || img.src;
    lightboxCaption.textContent = img.alt || "";

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    currentIndex = index;
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
}

function showPrev() {
    if (!galleryItems.length) return;
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
}

function showNext() {
    if (!galleryItems.length) return;
    currentIndex = (currentIndex + 1) % galleryItems.length;
    openLightbox(currentIndex);
}

galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));

    // פתיחה גם עם Enter/Space (נגישות)
    item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(index);
        }
    });
});

document.querySelector(".lb-close")?.addEventListener("click", closeLightbox);
document.querySelector(".lb-prev")?.addEventListener("click", showPrev);
document.querySelector(".lb-next")?.addEventListener("click", showNext);

lightbox?.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", e => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
});


/**************************
 WHATSAPP MESSAGE BUILDER
**************************/
const waButtons = [...document.querySelectorAll("#waQuick")]; // יש לך פעמיים אותו id ב-HTML, אז אני תופס את כולם
const copyBtn = document.getElementById("copyMsg");
const copyStatus = document.getElementById("copyStatus");

function getFieldValue(id) {
    const el = document.getElementById(id);
    return el ? (el.value || "").trim() : "";
}

function buildWhatsAppMessage() {
    const name = getFieldValue("fullName");
    const phone = getFieldValue("phone");
    const type = getFieldValue("orderType");
    const details = getFieldValue("details");

    const lines = [
        "שלום, אשמח להזמין 👋",
        name ? `שם: ${name}` : "",
        phone ? `טלפון: ${phone}` : "",
        type ? `מוצר: ${type}` : "",
        details ? `פרטים: ${details}` : ""
    ].filter(Boolean);

    return lines.join("\n");
}

function openWhatsApp() {
    const msg = buildWhatsAppMessage();
    const phoneNumber = "972528522320"; // החלף למספר שלך (כולל קידומת, בלי +)
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

waButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        openWhatsApp();
    });
});

if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(buildWhatsAppMessage());
            if (copyStatus) copyStatus.textContent = "ההודעה הועתקה ✔";
        } catch {
            if (copyStatus) copyStatus.textContent = "לא הצלחתי להעתיק. נסה ידנית.";
        }
    });
}


/**************************
 EMAIL FORM SUBMIT (FORM TO EMAIL)
 חשוב: כדי לשלוח למייל בלי לפתוח אצל הלקוח את המייל,
 חייבים endpoint חיצוני (כמו Formspree / Web3Forms).
 אם ל-form אין action תקין — אראה טוסט עם הסבר.
**************************/

// Toast (אם אין לך אלמנט/עיצוב ב-CSS, אני מייצר לבד כדי שלא תראה "לא קורה כלום")
(function ensureToast() {
    let t = document.getElementById("successToast");
    if (!t) {
        t = document.createElement("div");
        t.id = "successToast";
        document.body.appendChild(t);
    }

    // CSS מינימלי לטוסט (רק כדי שיעבוד בלי שתצטרך לגעת עכשיו ב-CSS)
    if (!document.getElementById("toastStyle")) {
        const style = document.createElement("style");
        style.id = "toastStyle";
        style.textContent = `
#successToast{
  position:fixed; left:18px; bottom:18px;
  max-width:min(520px, calc(100% - 36px));
  padding:12px 14px;
  border-radius:16px;
  background:rgba(18,18,21,.92);
  color:#fff;
  font-family: "Heebo", system-ui, -apple-system, Segoe UI, Roboto, Arial;
  font-weight:800;
  font-size:13px;
  line-height:1.6;
  box-shadow:0 18px 55px rgba(0,0,0,.18);
  opacity:0; transform:translateY(10px);
  pointer-events:none;
  transition:opacity .25s ease, transform .25s ease;
  z-index:99999;
}
#successToast.show{opacity:1; transform:translateY(0);}
        `;
        document.head.appendChild(style);
    }
})();

const emailForm = document.querySelector(".contact-form");
const toast = document.getElementById("successToast");

function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 4200);
}

function buildEmailPayload() {
    const name = getFieldValue("fullName");
    const phone = getFieldValue("phone");
    const type = getFieldValue("orderType");
    const details = getFieldValue("details");

    const subject = "פנייה חדשה מהאתר – Bashan’s";
    const messageLines = [
        "התקבלה פנייה חדשה מהטופס באתר:",
        "",
        name ? `שם: ${name}` : "שם: (לא הוזן)",
        phone ? `טלפון: ${phone}` : "טלפון: (לא הוזן)",
        type ? `מה תרצה להזמין: ${type}` : "מה תרצה להזמין: (לא נבחר)",
        details ? `פרטים: ${details}` : "פרטים: (לא הוזנו)",
    ];

    return {
        name,
        phone,
        type,
        details,
        subject,
        message: messageLines.join("\n")
    };
}

if (emailForm) {
    // אם אין לך כפתור submit אמיתי ב-HTML – הטופס לא יישלח "Enter".
    // אבל אנחנו תופסים submit בכל מקרה (אם יש לך button type=submit / אם תוסיף בהמשך).
    emailForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const action = (emailForm.getAttribute("action") || "").trim();
        const method = (emailForm.getAttribute("method") || "POST").toUpperCase();

        const payload = buildEmailPayload();

        // אם אין endpoint – אי אפשר לשלוח “באמת” למייל בלי לפתוח מייל אצל הלקוח
        if (!action || action === "#") {
            showToast("כדי שהטופס ישלח אליך מייל בלי לפתוח מייל אצל הלקוח, חייבים להגדיר action לטופס (Formspree/Web3Forms).");
            return;
        }

        // FormData “בטוח” גם אם אין name="" בשדות ב-HTML
        const fd = new FormData();
        fd.append("name", payload.name);
        fd.append("phone", payload.phone);
        fd.append("orderType", payload.type);
        fd.append("details", payload.details);

        // נחמד: הרבה שירותים יודעים להשתמש ב-Subject
        fd.append("_subject", payload.subject);
        fd.append("message", payload.message);

        try {
            const res = await fetch(action, {
                method,
                body: fd,
                headers: { "Accept": "application/json" }
            });

            if (res.ok) {
                emailForm.reset();
                showToast("ההודעה נשלחה בהצלחה — נחזור אליך בהקדם 🤍");
            } else {
                // 405 = בדרך כלל ה-endpoint לא מקבל POST / או שה-action לא נכון
                if (res.status === 405) {
                    showToast("שגיאה 405: הכתובת ב-action לא מקבלת שליחה. בדוק שהדבקת endpoint נכון (Formspree/Web3Forms) ושיטת השליחה POST.");
                } else {
                    showToast("אירעה שגיאה בשליחה. נסה שוב או שלח וואטסאפ.");
                }
            }
        } catch {
            showToast("אין חיבור לרשת, נסה שוב.");
        }
    });

    // בונוס: אם יש לך בתוך הטופס לינק/כפתור עם data-submit-form="true" – ילחץ submit
    // (לא חובה, אבל אם תרצה בלי לשבור HTML)
    emailForm.querySelectorAll('[data-submit-form="true"]').forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            emailForm.requestSubmit?.();
        });
    });
}