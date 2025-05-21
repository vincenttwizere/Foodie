const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  // Toggle between hamburger and close icon
  if (menuIcon.classList.contains('fa-bars')) {
    menuIcon.classList.remove('fa-bars');
    menuIcon.classList.add('fa-times');
  } else {
    menuIcon.classList.remove('fa-times');
    menuIcon.classList.add('fa-bars');
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      // Close mobile menu if open
      mobileMenu.classList.add('hidden');
      menuIcon.classList.remove('fa-times');
      menuIcon.classList.add('fa-bars');

      // Scroll to target
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Shopping Cart and Offers Functionality
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const addToCartButtons = document.querySelectorAll('.add-to-cart');

let cart = [];
let activeOffers = new Set();

// Available offers
const offers = {
  'weekly-special': {
    name: 'Weekly Special',
    type: 'percentage',
    value: 20,
    applies: (item) => ['Grilled Salmon', 'Beef Steak'].includes(item.name),
    message: '20% off on signature dishes'
  },
  'happy-hour': {
    name: 'Happy Hour',
    type: 'bogo',
    applies: (item) => ['Fresh Juice', 'Smoothie'].includes(item.name),
    message: 'Buy one get one free on drinks'
  },
  'student-discount': {
    name: 'Student Discount',
    type: 'percentage',
    value: 15,
    applies: (item) => true, // Applies to all items
    message: '15% off on all items'
  }
};

// Toggle cart sidebar
cartIcon.addEventListener('click', () => {
  cartSidebar.classList.remove('translate-x-full');
});

closeCart.addEventListener('click', () => {
  cartSidebar.classList.add('translate-x-full');
});

// Add item to cart
function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price: parseFloat(price),
      quantity: 1
    });
  }
  
  updateCart();
}

// Remove item from cart
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  updateCart();
}

// Update quantity
function updateQuantity(name, quantity) {
  const item = cart.find(item => item.name === name);
  if (item) {
    item.quantity = Math.max(0, quantity);
    if (item.quantity === 0) {
      removeFromCart(name);
    } else {
      updateCart();
    }
  }
}

// Calculate item price with discounts
function calculateItemPrice(item) {
  let price = item.price * item.quantity;
  let appliedOffers = [];

  // Apply active offers
  for (const offerId of activeOffers) {
    const offer = offers[offerId];
    if (offer.applies(item)) {
      if (offer.type === 'percentage') {
        price = price * (1 - offer.value / 100);
        appliedOffers.push(offer.message);
      } else if (offer.type === 'bogo' && item.quantity > 1) {
        price = (Math.ceil(item.quantity / 2)) * item.price;
        appliedOffers.push(offer.message);
      }
    }
  }

  return { price, appliedOffers };
}

// Claim offer
function claimOffer(offerId) {
  if (activeOffers.has(offerId)) {
    activeOffers.delete(offerId);
  } else {
    activeOffers.add(offerId);
  }
  updateCart();
  
  // Update offer button state
  const button = document.querySelector(`[data-offer="${offerId}"]`);
  if (button) {
    if (activeOffers.has(offerId)) {
      button.textContent = 'Offer Applied';
      button.classList.remove('bg-[#39DB4A]', 'hover:bg-green-700');
      button.classList.add('bg-gray-500', 'cursor-default');
    } else {
      button.textContent = 'Claim Offer';
      button.classList.add('bg-[#39DB4A]', 'hover:bg-green-700');
      button.classList.remove('bg-gray-500', 'cursor-default');
    }
  }
}

// Update cart display
function updateCart() {
  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  // Update cart items display
  cartItems.innerHTML = cart.map(item => {
    const { price, appliedOffers } = calculateItemPrice(item);
    const originalPrice = item.price * item.quantity;
    const hasDiscount = price < originalPrice;

    return `
      <div class="flex flex-col p-2 bg-gray-50 rounded">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h4 class="text-sm font-semibold">${item.name}</h4>
            <p class="text-xs text-gray-600">
              ${hasDiscount ? 
                `<span class="line-through">$${originalPrice.toFixed(2)}</span> ` +
                `<span class="text-green-600">$${price.toFixed(2)}</span>` :
                `$${price.toFixed(2)}`
              } x ${item.quantity}
            </p>
            ${appliedOffers.length > 0 ? 
              `<p class="text-xs text-green-600">${appliedOffers.join(', ')}</p>` : 
              ''}
          </div>
          <div class="flex items-center gap-2">
            <button class="text-xs px-2 bg-gray-200 rounded" onclick="updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
            <span class="text-sm">${item.quantity}</span>
            <button class="text-xs px-2 bg-gray-200 rounded" onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
            <button class="text-red-500 ml-2" onclick="removeFromCart('${item.name}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Update totals
  const subtotal = cart.reduce((sum, item) => {
    const { price } = calculateItemPrice(item);
    return sum + price;
  }, 0);
  const delivery = cart.length > 0 ? 2.99 : 0;
  const total = subtotal + delivery;

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Add click handlers to all "Add to Cart" buttons
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    const name = button.getAttribute('data-name');
    const price = button.getAttribute('data-price');
    addToCart(name, price);
    
    // Show cart sidebar when item is added
    cartSidebar.classList.remove('translate-x-full');
  });
});
  