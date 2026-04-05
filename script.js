// PRODUCT DATA (can be replaced with backend later)
const products = [
  {
    id: 1,
    name: "Nike Running Shoes",
    price: 2500,
    category: "Footwear",
    rating: 4.8,
    reviews: ["Super comfortable for daily wear.", "Looks great and feels premium."],
    description: "Lightweight running shoes built for everyday comfort and speed.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: 2,
    name: "Premium Cotton T-Shirt",
    price: 800,
    category: "Apparel",
    rating: 4.6,
    reviews: ["Soft fabric and fits well.", "Great everyday basic."] ,
    description: "Soft breathable cotton tee with a relaxed modern fit.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: 3,
    name: "Classic Smart Watch",
    price: 2000,
    category: "Accessories",
    rating: 4.7,
    reviews: ["Battery lasts all day.", "Clean display and stylish look."],
    description: "Minimal smart watch with a clean display and all-day battery life.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: 4,
    name: "Leather Backpack",
    price: 3200,
    category: "Bags",
    rating: 4.5,
    reviews: ["Spacious and sturdy.", "Looks premium with any outfit."],
    description: "Everyday backpack with premium styling and organized storage.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: 5,
    name: "Wireless Earbuds",
    price: 1499,
    category: "Electronics",
    rating: 4.4,
    reviews: ["Good sound for the price.", "Compact case, easy to carry."],
    description: "Compact earbuds with clear audio and a pocket-friendly case.",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1585386959984-a41552231675?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    id: 6,
    name: "Desk Lamp",
    price: 1100,
    category: "Home",
    rating: 4.3,
    reviews: ["Nice warm glow for the desk.", "Simple and elegant design."],
    description: "Warm ambient desk lamp with a premium matte finish.",
    images: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
    ]
  }
];

let cart = [];
let wishlist = [];
let activeSearch = "";
let activeFilter = "all";
let activeSort = "featured";
let currentTheme = localStorage.getItem("ux-theme") || "light";
const productImageIndex = {};
let appliedCoupon = null;
const couponMap = {
  SAVE10: 0.1,
  SHOP15: 0.15
};

function getProductById(id) {
  return products.find(product => product.id === id);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getWishlistCount() {
  return wishlist.length;
}

function isWishlisted(id) {
  return wishlist.includes(id);
}

function getProductImage(product) {
  const currentIndex = productImageIndex[product.id] || 0;
  return product.images[currentIndex % product.images.length];
}

function getProductRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  return `${"★".repeat(fullStars)}${hasHalfStar ? "½" : ""}`;
}

function saveCart() {
  localStorage.setItem("ux-cart", JSON.stringify(cart));
}

function saveWishlist() {
  localStorage.setItem("ux-wishlist", JSON.stringify(wishlist));
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("ux-cart")) || [];
    cart = saved
      .map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
      .filter(item => getProductById(item.id));
  } catch {
    cart = [];
  }
}

function loadWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem("ux-wishlist")) || [];
    wishlist = saved.filter(id => getProductById(id));
  } catch {
    wishlist = [];
  }
}

function applyCatalogFilters() {
  let list = [...products];

  if (activeSearch.trim()) {
    const value = activeSearch.toLowerCase();
    list = list.filter(product =>
      product.name.toLowerCase().includes(value) ||
      product.category.toLowerCase().includes(value) ||
      product.description.toLowerCase().includes(value)
    );
  }

  if (activeFilter === "low") {
    list = list.filter(product => product.price < 1000);
  } else if (activeFilter === "mid") {
    list = list.filter(product => product.price >= 1000 && product.price <= 3000);
  }

  if (activeSort === "priceLow") {
    list.sort((a, b) => a.price - b.price);
  } else if (activeSort === "priceHigh") {
    list.sort((a, b) => b.price - a.price);
  } else if (activeSort === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}

// DISPLAY PRODUCTS
function showProducts(list) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try a different search term or reset the filters.</p>
      </div>
    `;
    return;
  }

  list.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${getProductImage(p)}" alt="${p.name}">
        <span class="badge">${p.category}</span>
        <h3>${p.name}</h3>
        <p class="rating">${getProductRatingStars(p.rating)} <span>${p.rating.toFixed(1)}</span></p>
        <p class="desc">${p.description}</p>
        <p>₹${p.price}</p>
        <div class="card-actions">
          <button onclick="viewProduct(${p.id})">Details</button>
          <button class="wishlist-btn ${isWishlisted(p.id) ? 'active' : ''}" onclick="toggleWishlist(${p.id})">${isWishlisted(p.id) ? '♥' : '♡'}</button>
        </div>
      </div>
    `;
  });
}

// VIEW PRODUCT PAGE
function viewProduct(id) {
  const p = getProductById(id);
  const currentIndex = productImageIndex[id] || 0;

  hideAll();
  document.getElementById("productPage").classList.remove("hidden");

  document.getElementById("productPage").innerHTML = `
    <div class="product-gallery">
      <img src="${p.images[currentIndex % p.images.length]}" alt="${p.name}" id="productImage">
      <div class="gallery-controls">
        <button type="button" onclick="changeProductImage(${p.id}, -1)">Prev</button>
        <span>${currentIndex + 1} / ${p.images.length}</span>
        <button type="button" onclick="changeProductImage(${p.id}, 1)">Next</button>
      </div>
    </div>
    <span class="badge">${p.category}</span>
    <h2>${p.name}</h2>
    <p class="rating">${getProductRatingStars(p.rating)} <span>${p.rating.toFixed(1)} rating</span></p>
    <p class="desc">${p.description}</p>
    <div class="review-box">
      <h3>Recent reviews</h3>
      ${p.reviews.map(review => `<p>• ${review}</p>`).join("")}
    </div>
    <p>₹${p.price}</p>

    <div class="sticky-btn">
      <button onclick="addToCart(${p.id})">Add to Cart</button>
      <button class="wishlist-btn ${isWishlisted(p.id) ? 'active' : ''}" onclick="toggleWishlist(${p.id})">${isWishlisted(p.id) ? 'Remove Wishlist' : 'Add Wishlist'}</button>
      <button onclick="goHome()">Back</button>
    </div>
  `;
}

function changeProductImage(id, delta) {
  const product = getProductById(id);
  const totalImages = product.images.length;
  const currentIndex = productImageIndex[id] || 0;
  const nextIndex = (currentIndex + delta + totalImages) % totalImages;
  productImageIndex[id] = nextIndex;

  const image = document.getElementById("productImage");
  const counter = document.querySelector(".gallery-controls span");
  if (image) {
    image.src = product.images[nextIndex];
  }
  if (counter) {
    counter.innerText = `${nextIndex + 1} / ${totalImages}`;
  }
}

function toggleWishlist(id) {
  if (isWishlisted(id)) {
    wishlist = wishlist.filter(itemId => itemId !== id);
    showToast("Removed from wishlist");
  } else {
    wishlist.push(id);
    showToast("Added to wishlist");
  }

  saveWishlist();
  document.getElementById("wishlistCount").innerText = getWishlistCount();
  showProducts(applyCatalogFilters());

  if (!document.getElementById("productPage").classList.contains("hidden")) {
    const product = getProductById(id);
    if (product) {
      viewProduct(id);
    }
  }
}

function goToWishlist() {
  hideAll();
  document.getElementById("wishlistPage").classList.remove("hidden");

  const container = document.getElementById("wishlistItems");

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Your wishlist is empty</h3>
        <p>Save products you like so you can find them again quickly.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = wishlist
    .map(id => {
      const product = getProductById(id);
      return `
        <div class="wishlist-item">
          <img src="${getProductImage(product)}" alt="${product.name}">
          <div>
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
          </div>
          <div class="wishlist-actions">
            <button type="button" onclick="viewProduct(${product.id})">View</button>
            <button type="button" onclick="addToCart(${product.id})">Add</button>
            <button type="button" onclick="toggleWishlist(${product.id})">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
}

// ADD TO CART
function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  document.getElementById("count").innerText = getCartCount();
  showToast("Added to cart ✔");
}

// REMOVE ITEM
function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  goToCart();
}

function changeQuantity(id, delta) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  }

  saveCart();
  goToCart();
}

function clearCart() {
  cart = [];
  saveCart();
  document.getElementById("count").innerText = 0;
  goToCart();
}

// GO TO CART
function goToCart() {
  hideAll();
  document.getElementById("cartPage").classList.remove("hidden");

  let total = 0;
  let html = "";

  if (cart.length === 0) {
    html = `
      <div class="empty-state">
        <h3>Cart is empty 🛒</h3>
        <p>Browse the catalog and add items to get started.</p>
      </div>
    `;
  } else {
    cart.forEach(item => {
      const product = getProductById(item.id);
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      html += `
        <p>
          <span>
            <strong>${product.name}</strong><br>
            ₹${product.price} × ${item.quantity} = ₹${itemTotal}
          </span>
          <span class="qty-controls">
            <button type="button" onclick="changeQuantity(${product.id}, -1)">-</button>
            <button type="button" onclick="changeQuantity(${product.id}, 1)">+</button>
            <button type="button" onclick="removeItem(${product.id})">Remove</button>
          </span>
        </p>
      `;
    });
  }

  document.getElementById("cartItems").innerHTML = html;
  document.getElementById("total").innerText = total;
  document.getElementById("count").innerText = getCartCount();
}

// CHECKOUT
function goToCheckout() {
  hideAll();
  document.getElementById("checkoutPage").classList.remove("hidden");
  updateCheckoutSummary();
}

function getCartSubtotal() {
  return cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    return sum + product.price * item.quantity;
  }, 0);
}

function getDiscountAmount() {
  if (!appliedCoupon) return 0;
  return getCartSubtotal() * appliedCoupon;
}

function updateCheckoutSummary() {
  const subtotal = getCartSubtotal();
  const discount = getDiscountAmount();
  const total = subtotal - discount;
  const summary = document.getElementById("checkoutSummary");

  if (summary) {
    summary.innerHTML = `
      <p>Subtotal: ₹${subtotal.toFixed(0)}</p>
      <p>Discount: -₹${discount.toFixed(0)}</p>
      <p><strong>Total: ₹${total.toFixed(0)}</strong></p>
    `;
  }

  const couponMessage = document.getElementById("couponMessage");
  if (couponMessage) {
    couponMessage.innerText = appliedCoupon ? `Coupon applied. You saved ₹${discount.toFixed(0)}.` : "";
  }
}

function applyCoupon() {
  const code = document.getElementById("couponCode").value.trim().toUpperCase();
  const message = document.getElementById("couponMessage");

  if (!code) {
    appliedCoupon = null;
    message.innerText = "Enter a coupon code to apply a discount.";
    updateCheckoutSummary();
    return;
  }

  if (!couponMap[code]) {
    appliedCoupon = null;
    message.innerText = "Invalid coupon code.";
    updateCheckoutSummary();
    return;
  }

  appliedCoupon = couponMap[code];
  message.innerText = `Coupon ${code} applied.`;
  updateCheckoutSummary();
}

// PLACE ORDER
function placeOrder(event) {
  if (event) {
    event.preventDefault();
  }

  cart = [];
  saveCart();
  appliedCoupon = null;
  const couponField = document.getElementById("couponCode");
  if (couponField) couponField.value = "";
  const couponMessage = document.getElementById("couponMessage");
  if (couponMessage) couponMessage.innerText = "";
  document.getElementById("count").innerText = 0;

  hideAll();
  document.getElementById("successPage").classList.remove("hidden");
}

// HOME
function goHome() {
  hideAll();
  document.getElementById("home").classList.remove("hidden");
}

function clearFilters() {
  activeSearch = "";
  activeFilter = "all";
  activeSort = "featured";

  document.getElementById("search").value = "";
  document.getElementById("filter").value = "all";
  document.getElementById("sort").value = "featured";

  showProducts(applyCatalogFilters());
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("ux-theme", currentTheme);
  applyTheme();
}

function applyTheme() {
  document.body.classList.toggle("dark", currentTheme === "dark");
  document.getElementById("themeToggle").innerText = currentTheme === "dark" ? "Light Mode" : "Dark Mode";
}

document.getElementById("checkoutForm").addEventListener("submit", placeOrder);

// HIDE ALL SCREENS
function hideAll() {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.add("hidden");
  });
}

// SEARCH FUNCTION (Fix Meesho issue)
document.getElementById("search").addEventListener("input", function () {
  activeSearch = this.value;
  showProducts(applyCatalogFilters());
});

// FILTER FUNCTION
document.getElementById("filter").addEventListener("change", function () {
  activeFilter = this.value;
  showProducts(applyCatalogFilters());
});

document.getElementById("sort").addEventListener("change", function () {
  activeSort = this.value;
  showProducts(applyCatalogFilters());
});

// TOAST MESSAGE (Better UX than alert)
function showToast(msg) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";

  setTimeout(() => {
    t.style.display = "none";
  }, 2000);
}

// INITIAL LOAD
loadCart();
loadWishlist();
applyTheme();
document.getElementById("count").innerText = getCartCount();
document.getElementById("wishlistCount").innerText = getWishlistCount();
showProducts(applyCatalogFilters());