const API_URL = "https://fakestoreapi.com/products";


let allProducts = [];


const grid = document.querySelector("[data-product-grid]");     
const searchInput = document.querySelector("[data-search]");    
const sortSelect = document.querySelector("[data-sort]");      
const chipRow = document.querySelector("[data-category-chips]");
const resultCount = document.querySelector("[data-result-count]"); 


let activeCategory = "all";


async function loadProducts() {
  grid.innerHTML = `<p class="state-msg">Loading the catalog…</p>`;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    allProducts = await response.json();

    buildCategoryChips(); 
    renderGrid();         
  } catch (err) {
    console.error("Failed to load products:", err);
    grid.innerHTML = `<p class="state-msg error">Couldn't reach the catalog server. Check your connection and refresh.</p>`;
  }
}


function buildCategoryChips() {
 
  const categories = ["all", ...new Set(allProducts.map((p) => p.category))];


  chipRow.innerHTML = categories
    .map(
      (cat) => `
      <button class="chip ${cat === "all" ? "is-active" : ""}" data-category="${cat}">
        ${cat}
      </button>`
    )
    .join("");

  chipRow.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.category; 

     
      chipRow
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.toggle("is-active", c === chip));

      renderGrid(); 
    });
  });
}


function getVisibleProducts() {

  const query = searchInput.value.trim().toLowerCase();


  let list = allProducts.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesQuery = p.title.toLowerCase().includes(query);
    return matchesCategory && matchesQuery; 
  });

  
  switch (sortSelect.value) {
    case "price-asc":
      
      list = list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list = list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
     
      list = list.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
      break;
    default:
      break; 
  }

  return list;
}


function renderGrid() {
  const visible = getVisibleProducts();


  resultCount.textContent = `${visible.length} item${visible.length === 1 ? "" : "s"}`;

  if (visible.length === 0) {
    grid.innerHTML = `<p class="state-msg">No items match that search. Try another term or category.</p>`;
    return; 
  }


  grid.innerHTML = visible.map(productCard).join("");

  
  grid.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
     
      const id = Number(btn.dataset.addToCart);
      const product = allProducts.find((p) => p.id === id);

      
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
  
  const stockUnits = (p.id * 7) % 15;
  const isLow = stockUnits <= 3;


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
          <span class="stock-stamp ${isLow ? "low" : ""}">${isLow ? `Low · ${stockUnits} left` : "In stock"}</span>
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


searchInput.addEventListener("input", renderGrid);
sortSelect.addEventListener("change", renderGrid);

document.addEventListener("DOMContentLoaded", loadProducts);
