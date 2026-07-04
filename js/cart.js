
const cartList = document.querySelector("[data-cart-list]");    
const emptyState = document.querySelector("[data-cart-empty]");  
const summary = document.querySelector("[data-cart-summary]");   


const SHIPPING_FLAT = 6.7;
const TAX_RATE = 0.02;


function renderCart() {
  const cart = getCart(); 

  if (cart.length === 0) {
   
    cartList.innerHTML = "";
    emptyState.hidden = false; 
    summary.hidden = true;
    return; 
  }

  emptyState.hidden = true;
  summary.hidden = false;

 
  cartList.innerHTML = cart.map(cartRow).join("");

 
  cartList.querySelectorAll("[data-decrease]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const item = cart.find((i) => i.id === Number(btn.dataset.decrease));
      updateQty(item.id, item.qty - 1); 
      renderCart(); 
    })
  );


  cartList.querySelectorAll("[data-increase]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const item = cart.find((i) => i.id === Number(btn.dataset.increase));
      updateQty(item.id, item.qty + 1);
      renderCart();
    })
  );


  cartList.querySelectorAll("[data-qty-input]").forEach((input) =>
    input.addEventListener("change", () => {
      const id = Number(input.dataset.qtyInput);
      
      const value = parseInt(input.value, 10) || 1;
      updateQty(id, value);
      renderCart();
    })
  );


  cartList.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", () => {
      removeFromCart(Number(btn.dataset.remove)); 
      toast("Item removed");
      renderCart();
    })
  );

  renderSummary(); 
}


function cartRow(item) {
  return `
    <div class="cart-row">
      <img src="${item.image}" alt="${escapeHtml(item.title)}" />
      <div>
        <p class="cart-row-title">${escapeHtml(truncate(item.title, 70))}</p>
        <span class="cart-row-cat">${escapeHtml(item.category)}</span>
      </div>
      <div class="qty-control">
        <button type="button" data-decrease="${item.id}" aria-label="Decrease quantity">−</button>
        <input type="number" min="1" max="99" value="${item.qty}" data-qty-input="${item.id}" aria-label="Quantity" />
        <button type="button" data-increase="${item.id}" aria-label="Increase quantity">+</button>
      </div>
      <div style="text-align:right;">
        <p class="mono">$${(item.price * item.qty).toFixed(2)}</p>
        <button type="button" class="remove-link" data-remove="${item.id}">Remove</button>
      </div>
    </div>`;
}


function renderSummary() {
  const subtotal = cartSubtotal(); 
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0; 
  const total = subtotal + tax + shipping;

  
  summary.innerHTML = `
    <h3>Order summary</h3>
    <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>$${shipping.toFixed(2)}</span></div>
    <div class="summary-row"><span>Est. tax (2%</span><span>$${tax.toFixed(2)}</span></div>
    <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    <button class="btn btn-primary btn-block" data-checkout style="margin-top:14px;">Complete order</button>
  `;

  
  document.querySelector("[data-checkout]").addEventListener("click", () => {
    saveCart([]);
    toast("Order placed, hanks! Cart cleared.");
    renderCart(); 
  });
}


function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", renderCart);
