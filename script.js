/* =========================================================
   SWEET CRUMBS BAKERY - script.js
========================================================= */
const WHATSAPP_NUMBER = "9486362614";   // YOUR real number: country code + number, no + or spaces
const INSTAGRAM_URL   = "https://www.instagram.com/rokash_77/";  // your real Instagram link
const FACEBOOK_URL    = "https://www.facebook.com/your_page/";       // your real Facebook link
const WEB3FORMS_KEY   = "https://mail.google.com/mail/u/1/#inbox";  // free key from web3forms.com (enquiries get emailed to you). Empty = enquiries go to WhatsApp
const SHOP_NAME       = "Sweet Crumbs Bakery";

/* ---------- PRODUCTS (edit names, prices, images here) ---------- */
const PRODUCTS = [
  { id: "cake",    name: "Birthday Cake",    cat: "CELEBRATION",  price: 650, tag: "POPULAR", desc: "Soft sponge layered with fresh cream for your special moments.", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80", alt: "Chocolate birthday cake" },
  { id: "pastry",  name: "Chocolate Pastry", cat: "PASTRY",       price: 90,  desc: "Rich chocolate layers with smooth, creamy frosting.",           img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80", alt: "Chocolate pastries" },
  { id: "bread",   name: "Fresh Bread",      cat: "BAKERY",       price: 50,  desc: "Soft, warm bread baked fresh every morning.",                   img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80", alt: "Loaves of fresh bread" },
  { id: "cupcake", name: "Cupcake",          cat: "SWEET TREATS", price: 70,  desc: "Soft little cakes topped with creamy frosting.",                img: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=700&q=80", alt: "Frosted cupcakes" },
  { id: "cookies", name: "Homemade Cookies", cat: "COOKIES",      price: 120, desc: "Crispy, buttery cookies with a rich homemade flavour.",         img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=80", alt: "Homemade cookies" },
  { id: "pizza",   name: "Veg Pizza",        cat: "SAVOURY",      price: 220, desc: "Freshly baked pizza loaded with vegetable toppings.",           img: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80", alt: "Vegetable pizza" }
];

document.addEventListener("DOMContentLoaded", function () {
  document.documentElement.classList.add("js");
  const $ = (id) => document.getElementById(id);
  const money = (n) => "₹" + Number(n).toLocaleString("en-IN");

  /* ---------- WhatsApp link: WhatsApp Web on computers, app on phones ---------- */
  function waLink(text) {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const base = mobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
    return base + "?phone=" + WHATSAPP_NUMBER + "&text=" + encodeURIComponent(text);
  }
  function openWhatsApp(text) {
    const win = window.open(waLink(text), "_blank", "noopener");
    if (!win) window.location.href = waLink(text);   // popup blocked -> open in same tab
  }
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.href = waLink(el.dataset.wa);
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  /* ---------- Social links ---------- */
  document.querySelectorAll("[data-social]").forEach(function (el) {
    el.href = el.dataset.social === "instagram" ? INSTAGRAM_URL : FACEBOOK_URL;
  });
  const phoneLink = $("phoneLink");
  if (phoneLink) phoneLink.href = "tel:+" + WHATSAPP_NUMBER;

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("menuBtn"), navLinks = $("navLinks");
  function setMenu(open) {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.toggle("active", open);
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  }
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () { setMenu(!navLinks.classList.contains("active")); });
    navLinks.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth > 850) setMenu(false); });
  }

  /* ---------- Header shadow ---------- */
  const header = $("header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* =========================================================
     PRODUCTS + CART
  ========================================================= */
  const grid = $("productGrid");
  if (grid) {
    grid.innerHTML = PRODUCTS.map(function (p) {
      return '<article class="product-card reveal">' +
        '<div class="product-image"><img src="' + p.img + '" alt="' + p.alt + '" loading="lazy">' +
        (p.tag ? '<span class="product-tag">' + p.tag + '</span>' : '') + '</div>' +
        '<div class="product-info"><p class="product-category">' + p.cat + '</p><h3>' + p.name + '</h3>' +
        '<p class="product-desc">' + p.desc + '</p>' +
        '<div class="product-bottom"><strong>' + money(p.price) + '</strong>' +
        '<button type="button" class="add-btn" data-add="' + p.id + '" aria-label="Add ' + p.name + ' to cart">Add to Cart</button></div></div></article>';
    }).join("");
  }

  let cart = {};
  try { cart = JSON.parse(localStorage.getItem("sc_cart")) || {}; } catch (e) { cart = {}; }
  function saveCart() { try { localStorage.setItem("sc_cart", JSON.stringify(cart)); } catch (e) {} }
  const findProduct = (id) => PRODUCTS.find(function (p) { return p.id === id; });

  const cartEl = $("cart"), overlay = $("overlay"), itemsEl = $("cartItems"),
        checkout = $("checkoutForm"), totalBar = $("cartTotalBar"), orderMsg = $("orderMsg");

  function cartTotals() {
    let count = 0, total = 0;
    Object.keys(cart).forEach(function (id) {
      const p = findProduct(id);
      if (p) { count += cart[id]; total += cart[id] * p.price; }
    });
    return { count: count, total: total };
  }

  function renderCart() {
    const t = cartTotals();
    $("cartCount").textContent = t.count;
    $("cartTotal").textContent = money(t.total);
    const ids = Object.keys(cart).filter(function (id) { return findProduct(id); });
    if (!ids.length) {
      itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Add something delicious!</p>';
      checkout.hidden = true; totalBar.hidden = true;
      return;
    }
    itemsEl.innerHTML = ids.map(function (id) {
      const p = findProduct(id), q = cart[id];
      return '<div class="cart-item"><img src="' + p.img + '" alt="' + p.alt + '">' +
        '<div><h4>' + p.name + '</h4><small>' + money(p.price) + ' each</small>' +
        '<div class="qty"><button type="button" data-act="dec" data-id="' + id + '" aria-label="Decrease quantity">−</button>' +
        '<span aria-live="polite">' + q + '</span>' +
        '<button type="button" data-act="inc" data-id="' + id + '" aria-label="Increase quantity">+</button>' +
        '<button type="button" class="qty-del" data-act="del" data-id="' + id + '">Remove</button></div></div>' +
        '<div class="line-total">' + money(p.price * q) + '</div></div>';
    }).join("");
    checkout.hidden = false; totalBar.hidden = false;
  }

  function openCart() {
    orderMsg.hidden = true;
    renderCart();
    cartEl.classList.add("open"); overlay.classList.add("open");
    cartEl.setAttribute("aria-hidden", "false");
    $("cartClose").focus();
  }
  function closeCart() {
    cartEl.classList.remove("open"); overlay.classList.remove("open");
    cartEl.setAttribute("aria-hidden", "true");
  }
  document.querySelectorAll("[data-open-cart]").forEach(function (b) { b.addEventListener("click", function () { setMenu(false); openCart(); }); });
  $("cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeCart(); setMenu(false); } });

  // Add to cart buttons
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.dataset.add;
    cart[id] = (cart[id] || 0) + 1;
    saveCart(); renderCart();
    btn.textContent = "Added ✓"; btn.classList.add("added");
    setTimeout(function () { btn.textContent = "Add to Cart"; btn.classList.remove("added"); }, 1200);
  });

  // + / - / remove
  itemsEl.addEventListener("click", function (e) {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.dataset.id;
    if (b.dataset.act === "inc") cart[id] = (cart[id] || 0) + 1;
    if (b.dataset.act === "dec") { cart[id] = (cart[id] || 1) - 1; if (cart[id] <= 0) delete cart[id]; }
    if (b.dataset.act === "del") delete cart[id];
    saveCart(); renderCart();
  });

  // Place order -> WhatsApp
  checkout.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = $("cName").value.trim();
    const phone = $("cPhone").value.replace(/[\s-]/g, "");
    const address = $("cAddress").value.trim();
    const note = $("cNote").value.trim();
    const err = $("checkoutError");
    err.textContent = "";
    if (name.length < 2) { err.textContent = "Please enter your name."; $("cName").focus(); return; }
    if (!/^(\+?91)?[6-9]\d{9}$/.test(phone)) { err.textContent = "Enter a valid 10-digit mobile number."; $("cPhone").focus(); return; }
    if (address.length < 10) { err.textContent = "Please enter your full delivery address."; $("cAddress").focus(); return; }

    const t = cartTotals();
    if (!t.count) return;
    const orderId = "SC-" + Date.now().toString().slice(-6);
    const lines = Object.keys(cart).filter(function (id) { return findProduct(id); }).map(function (id, i) {
      const p = findProduct(id);
      return (i + 1) + ". " + p.name + " x " + cart[id] + " = " + money(p.price * cart[id]);
    });
    const text = "*New Order - " + SHOP_NAME + "*\nOrder ID: " + orderId + "\n\n" +
      "*Items*\n" + lines.join("\n") + "\n\n*Total: " + money(t.total) + "*\n\n" +
      "*Customer*\nName: " + name + "\nPhone: " + phone + "\nAddress: " + address +
      (note ? "\nNote: " + note : "");

    openWhatsApp(text);
    cart = {}; saveCart(); renderCart();
    checkout.reset();
    orderMsg.textContent = "Order " + orderId + " is ready in WhatsApp. Press Send there to confirm it with the bakery. If nothing opened, allow pop-ups for this site and try again.";
    orderMsg.hidden = false;
  });

  renderCart();

  /* ---------- Reveal animations + active nav ---------- */
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
    }, { threshold: 0.1 });
    revealItems.forEach(function (el) { ro.observe(el); });

    const links = document.querySelectorAll(".nav-links a[href^='#']");
    const no = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { no.observe(s); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("visible"); });
  }

  /* =========================================================
     ENQUIRY FORM
     - With WEB3FORMS_KEY: emailed to you
     - Without key: sent to your WhatsApp
  ========================================================= */
  const form = $("contactForm"), successBox = $("formSuccess");

  function setError(id, msg) {
    const input = $(id), er = $(id + "Error");
    if (er) er.textContent = msg;
    if (input) { input.classList.toggle("invalid", msg !== ""); input.setAttribute("aria-invalid", msg !== "" ? "true" : "false"); }
    return msg === "";
  }
  function showResult(msg) { successBox.textContent = msg; successBox.hidden = false; }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      successBox.hidden = true;
      const name = $("name").value.trim();
      const phone = $("phone").value.replace(/[\s-]/g, "");
      const email = $("email").value.trim();
      const message = $("message").value.trim();

      const ok = [
        setError("name", name.length < 2 ? "Please enter your name." : ""),
        setError("phone", /^(\+?91)?[6-9]\d{9}$/.test(phone) ? "" : "Enter a valid 10-digit mobile number."),
        setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Enter a valid email address."),
        setError("message", message.length < 10 ? "Please write at least 10 characters." : "")
      ].every(Boolean);
      if (!ok) { const f = form.querySelector(".invalid"); if (f) f.focus(); return; }

      const waText = "*New Enquiry - " + SHOP_NAME + "*\nName: " + name + "\nPhone: " + phone + "\nEmail: " + email + "\nMessage: " + message;
      const btn = $("enquiryBtn");

      if (WEB3FORMS_KEY) {
        btn.disabled = true;
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: "New enquiry from " + name, from_name: SHOP_NAME, name: name, phone: phone, email: email, message: message })
        }).then(function (r) { return r.json(); }).then(function (data) {
          if (data.success) { showResult("Thank you, " + name.split(" ")[0] + "! Your enquiry has been sent. We will contact you soon."); form.reset(); }
          else throw new Error("failed");
        }).catch(function () {
          showResult("Sorry, the enquiry could not be sent. Opening WhatsApp so you can send it there instead.");
          openWhatsApp(waText);
        }).finally(function () { btn.disabled = false; });
      } else {
        openWhatsApp(waText);
        showResult("Your enquiry is ready in WhatsApp. Press Send there to deliver it.");
        form.reset();
      }
    });
    form.querySelectorAll("input,textarea").forEach(function (f) {
      f.addEventListener("input", function () { if (f.classList.contains("invalid")) setError(f.id, ""); });
    });
  }
});