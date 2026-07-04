const CART_KEY = "depot.cart.v1";


function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read cart from LocalStorage:", err);
    return [];
  }
}


function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart)); 
  updateCartBadge();                                     
}


function addToCart(product) {
  const cart = getCart(); 

 
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.qty += 1; 
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart); 
}


function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return; 

 
  item.qty = Math.max(1, Math.min(99, qty));
  saveCart(cart);
}


function removeFromCart(id) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
}


function cartItemCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}


function updateCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = cartItemCount(); 
}


function toast(message) {
  let el = document.querySelector(".toast");

  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }

  el.textContent = message;          
  el.classList.add("is-visible");    

  
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove("is-visible"), 2200);
}


function initNavToggle() {
  const toggle = document.querySelector("[data-nav-toggle]"); 
  const links = document.querySelector("[data-nav-links]");   
  if (!toggle || !links) return; 
  toggle.addEventListener("click", () => {
   
    const isOpen = links.classList.toggle("is-open");
  
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();     
  updateCartBadge();   
});
