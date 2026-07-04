const API_URL = "https://fakestoreapi.com/products";

const featuredGrid = document.querySelector("[data-featured-grid]");
const statCount = document.querySelector("[data-stat-count]");
const statCategories = document.querySelector("[data-stat-categories]");

async function loadFeatured() {
  featuredGrid.innerHTML = `<p class="state-msg">Pulling today's featured items…</p>`;

  try {
    const response = await fetch(API_URL); 
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const products = await response.json(); 
    const featured = [...products]
      .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
      .slice(0, 4); 
    renderFeatured(featured);

    if (statCount) statCount.textContent = products.length;
    if (statCategories) {
      statCategories.textContent = new Set(products.map((p) => p.category)).size;
    }
  } catch (err) {
    console.error("Failed to load featured products:", err);
    featuredGrid.innerHTML = `<p class="state-msg error">Couldn't reach catalog right now.</p>`;
  }
}

function renderFeatured(products) {
  featuredGrid.innerHTML = products.map(productCard).join("");

  featuredGrid.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.addToCart);
      const product = products.find((p) => p.id === id);
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
      });
      toast(`Added to cart: ${truncate(product.title, 40)}`);
    });
  });
}

function productCard(p) {
  return `
    <article class="ticket">
      <div class="ticket-media">
        <img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" />
      </div>
      <div class="ticket-body">
        <span class="ticket-cat">${escapeHtml(p.category)}</span>
        <h3 class="ticket-title">${escapeHtml(truncate(p.title, 60))}</h3>
        <div class="ticket-foot">
          <span class="ticket-price">$${p.price.toFixed(2)}</span>
          <span class="stock-stamp">★ ${p.rating?.rate ?? "—"}</span>
        </div>
        <button class="btn btn-stamp btn-block btn-small" data-add-to-cart="${p.id}">Add to cart</button>
      </div>
    </article>`;
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", loadFeatured);
