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
let claimedOffers = new Set();

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

// Add click handlers to all "Add to Cart" buttons
document.addEventListener('DOMContentLoaded', () => {
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name');
      const price = button.getAttribute('data-price');
      
      // Show visual feedback
      button.textContent = 'Added!';
      button.classList.add('bg-green-700');
      setTimeout(() => {
        button.textContent = 'Add to Cart';
        button.classList.remove('bg-green-700');
      }, 1000);
      
      addToCart(name, price);
      // Show cart sidebar when item is added
      cartSidebar.classList.remove('translate-x-full');
    });
  });
});

// Offer claiming functionality
function claimOffer(offerId) {
  if (claimedOffers.has(offerId)) {
    showOfferMessage(offerId, 'You have already claimed this offer!', 'red');
    return;
  }

  const discounts = {
    'weekly-special': '20% off on signature dishes',
    'happy-hour': 'Buy one get one free on drinks',
    'student-discount': '15% off on all items'
  };

  claimedOffers.add(offerId);
  showOfferMessage(offerId, `Success! ${discounts[offerId]} has been applied to your account.`, 'green');
  
  // Update button state
  const button = document.querySelector(`[data-offer="${offerId}"]`);
  if (button) {
    button.textContent = 'Claimed!';
    button.classList.remove('bg-[#39DB4A]', 'hover:bg-green-700');
    button.classList.add('bg-gray-400', 'cursor-not-allowed');
    button.disabled = true;
  }

  // Update cart if there are items that the offer applies to
  if (cart.length > 0) {
    updateCart();
  }
}

function showOfferMessage(offerId, message, color) {
  const button = document.querySelector(`[data-offer="${offerId}"]`);
  if (!button) return;

  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.className = `text-${color}-600 text-xs mt-2 text-center`;
  
  // Insert message after button
  const parent = button.parentElement;
  const existingMessage = parent.querySelector(`[data-message-for="${offerId}"]`);
  if (existingMessage) {
    parent.removeChild(existingMessage);
  }
  messageDiv.setAttribute('data-message-for', offerId);
  parent.appendChild(messageDiv);

  // Remove message after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.remove();
    }
  }, 3000);
}

// Function to add item to cart
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
  showAddToCartMessage(name);
}

// Function to show add to cart message
function showAddToCartMessage(itemName) {
  const message = document.createElement('div');
  message.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 z-50';
  message.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="fas fa-check-circle"></i>
      <span>${itemName} added to cart!</span>
    </div>
  `;
  
  document.body.appendChild(message);
  
  // Trigger animation
  setTimeout(() => {
    message.classList.remove('translate-y-full', 'opacity-0');
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    message.classList.add('translate-y-full', 'opacity-0');
    setTimeout(() => {
      document.body.removeChild(message);
    }, 300);
  }, 2000);
}

// Update cart display
function updateCart() {
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total');

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  // Update cart items display
  cartItems.innerHTML = cart.map(item => {
    const { price, appliedOffers } = calculateItemPrice(item);
    const originalPrice = item.price * item.quantity;
    const hasDiscount = price < originalPrice;

    return `
      <div class="flex flex-col p-2 bg-gray-50 rounded mb-2">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h4 class="text-sm font-semibold">${item.name}</h4>
            <p class="text-xs text-gray-600">
              ${hasDiscount ? 
                `<span class="line-through">$${originalPrice.toFixed(2)}</span> ` +
                `<span class="text-green-600">$${price.toFixed(2)}</span>` :
                `$${price.toFixed(2)}`
              }
            </p>
            ${appliedOffers.length > 0 ? 
              `<p class="text-xs text-green-600">${appliedOffers.join(', ')}</p>` : 
              ''}
          </div>
          <div class="flex items-center gap-2">
            <button class="text-xs px-2 py-1 bg-gray-200 rounded" onclick="updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
            <span class="text-sm">${item.quantity}</span>
            <button class="text-xs px-2 py-1 bg-gray-200 rounded" onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
            <button class="text-red-500 ml-2" onclick="removeFromCart('${item.name}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Calculate and update totals
  const subtotal = cart.reduce((sum, item) => {
    const { price } = calculateItemPrice(item);
    return sum + price;
  }, 0);
  const delivery = cart.length > 0 ? 2.99 : 0;
  const total = subtotal + delivery;

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Calculate item price with discounts
function calculateItemPrice(item) {
  let price = item.price * item.quantity;
  let appliedOffers = [];

  for (const offerId of claimedOffers) {
    const offer = offers[offerId];
    if (offer && offer.applies(item)) {
      if (offer.type === 'percentage') {
        price = price * (1 - offer.value / 100);
        appliedOffers.push(`${offer.value}% off`);
      } else if (offer.type === 'bogo' && item.quantity > 1) {
        price = (Math.ceil(item.quantity / 2)) * item.price;
        appliedOffers.push('Buy 1 Get 1 Free');
      }
    }
  }

  return { price, appliedOffers };
}

// Remove item from cart
function removeFromCart(name) {
  const index = cart.findIndex(item => item.name === name);
  if (index !== -1) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
    updateCart();
  }
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

// Search Functionality
const searchIcon = document.getElementById('search-icon');
const searchOverlay = document.getElementById('search-overlay');
const closeSearch = document.getElementById('close-search');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// Menu items data for search
const menuItems = [
  { name: 'Grilled Salmon', category: 'Main Dishes', price: 24.99, description: 'Fresh salmon with herbs', image: './Assets/dish 1.png' },
  { name: 'Beef Steak', category: 'Main Dishes', price: 29.99, description: 'Premium cut with sauce', image: './Assets/dish 2.png' },
  { name: 'Caesar Salad', category: 'Salads', price: 12.99, description: 'Classic with croutons', image: './Assets/Egg salad.png' },
  { name: 'Greek Salad', category: 'Salads', price: 11.99, description: 'With feta cheese', image: './Assets/Egg salad.png' },
  { name: 'Fresh Juice', category: 'Drinks', price: 5.99, description: 'Various options', image: './Assets/dish 1.png' },
  { name: 'Smoothie', category: 'Drinks', price: 6.99, description: 'Fruit blends', image: './Assets/dish 2.png' },
  { name: 'Chocolate Cake', category: 'Desserts', price: 8.99, description: 'Rich and moist', image: './Assets/dish 1.png' },
  { name: 'Tiramisu', category: 'Desserts', price: 7.99, description: 'Italian classic', image: './Assets/dish 2.png' }
];

// Toggle search overlay
searchIcon.addEventListener('click', () => {
  searchOverlay.classList.remove('hidden');
  searchInput.focus();
  // Add slide down animation class
  searchOverlay.querySelector('.transform').classList.add('-translate-y-full');
  setTimeout(() => {
    searchOverlay.querySelector('.transform').classList.remove('-translate-y-full');
  }, 10);
});

closeSearch.addEventListener('click', () => {
  // Add slide up animation class
  searchOverlay.querySelector('.transform').classList.add('-translate-y-full');
  setTimeout(() => {
    searchOverlay.classList.add('hidden');
    searchOverlay.querySelector('.transform').classList.remove('-translate-y-full');
    searchInput.value = '';
    searchResults.innerHTML = '';
  }, 300);
});

// Search functionality
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    searchResults.innerHTML = '';
    return;
  }

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  );

  displaySearchResults(filteredItems);
});

function displaySearchResults(items) {
  if (items.length === 0) {
    searchResults.innerHTML = `
      <div class="text-center text-gray-500 py-4">
        <i class="fas fa-search text-4xl mb-3"></i>
        <p>No items found matching your search.</p>
      </div>
    `;
    return;
  }

  searchResults.innerHTML = items.map(item => {
    // Check if item is in cart
    const cartItem = cart.find(i => i.name === item.name);
    const quantity = cartItem ? cartItem.quantity : 0;

    return `
      <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
        <div class="flex gap-4">
          <!-- Item Image -->
          <div class="w-24 h-24 flex-shrink-0">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg">
          </div>

          <!-- Item Details -->
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-sm font-semibold">${item.name}</h4>
                <p class="text-xs text-gray-600">${item.description}</p>
                <span class="text-xs text-gray-500">${item.category}</span>
              </div>
              <span class="text-[#39DB4A] text-sm font-bold">$${item.price.toFixed(2)}</span>
            </div>

            <!-- Add to Cart Controls -->
            <div class="mt-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <button 
                  onclick="updateSearchQuantity('${item.name}', ${Math.max(0, quantity - 1)})"
                  class="text-gray-500 hover:text-gray-700 ${quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                  ${quantity === 0 ? 'disabled' : ''}>
                  <i class="fas fa-minus-circle"></i>
                </button>
                <span class="text-sm w-8 text-center">${quantity}</span>
                <button 
                  onclick="updateSearchQuantity('${item.name}', ${quantity + 1})"
                  class="text-[#39DB4A] hover:text-green-700">
                  <i class="fas fa-plus-circle"></i>
                </button>
              </div>
              
              <button 
                onclick="addToCartFromSearch('${item.name}', ${item.price})"
                class="bg-[#39DB4A] text-white px-4 py-2 rounded text-xs hover:bg-green-700 transition flex items-center gap-2">
                <i class="fas fa-cart-plus"></i>
                ${quantity === 0 ? 'Add to Cart' : 'Update Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Function to update quantity from search
function updateSearchQuantity(name, newQuantity) {
  if (newQuantity === 0) {
    removeFromCart(name);
  } else {
    updateQuantity(name, newQuantity);
  }
  // Refresh search results to update UI
  const searchTerm = searchInput.value.toLowerCase().trim();
  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  );
  displaySearchResults(filteredItems);
}

// Function to add item to cart from search with animation
function addToCartFromSearch(name, price) {
  const existingItem = cart.find(item => item.name === name);
  
  if (!existingItem) {
    addToCart(name, price);
    showAddToCartAnimation(name);
  }
}

// Add to cart animation
function showAddToCartAnimation(itemName) {
  // Create success message element
  const message = document.createElement('div');
  message.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 z-50';
  message.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="fas fa-check-circle"></i>
      <span>${itemName} added to cart!</span>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(message);
  
  // Trigger animation
  setTimeout(() => {
    message.classList.remove('translate-y-full', 'opacity-0');
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    message.classList.add('translate-y-full', 'opacity-0');
    setTimeout(() => {
      document.body.removeChild(message);
    }, 300);
  }, 2000);
}

// Close search overlay when clicking outside
searchOverlay.addEventListener('click', (e) => {
  if (e.target === searchOverlay) {
    closeSearch.click();
  }
});

// Close search overlay when pressing Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
    closeSearch.click();
  }
});

// Quantity Controls in Order Section
document.querySelectorAll('.quantity-increase').forEach(button => {
  button.addEventListener('click', () => {
    const itemName = button.getAttribute('data-name');
    const displayElement = button.parentElement.querySelector('.quantity-display');
    const currentQuantity = parseInt(displayElement.textContent);
    const newQuantity = currentQuantity + 1;
    
    displayElement.textContent = newQuantity;
    
    // Update cart if item exists
    const existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
      updateQuantity(itemName, newQuantity);
    }
  });
});

document.querySelectorAll('.quantity-decrease').forEach(button => {
  button.addEventListener('click', () => {
    const itemName = button.getAttribute('data-name');
    const displayElement = button.parentElement.querySelector('.quantity-display');
    const currentQuantity = parseInt(displayElement.textContent);
    
    if (currentQuantity > 0) {
      const newQuantity = currentQuantity - 1;
      displayElement.textContent = newQuantity;
      
      // Update cart if item exists
      const existingItem = cart.find(item => item.name === itemName);
      if (existingItem) {
        if (newQuantity === 0) {
          removeFromCart(itemName);
        } else {
          updateQuantity(itemName, newQuantity);
        }
      }
    }
  });
});

// Update quantity displays when cart changes
function updateQuantityDisplays() {
  document.querySelectorAll('.quantity-display').forEach(display => {
    const itemName = display.parentElement.querySelector('.quantity-decrease').getAttribute('data-name');
    const cartItem = cart.find(item => item.name === itemName);
    display.textContent = cartItem ? cartItem.quantity : '0';
  });
}

// Modify existing updateCart function to also update quantity displays
const originalUpdateCart = updateCart;
updateCart = function() {
  originalUpdateCart();
  updateQuantityDisplays();
};

// Modify addToCart to handle quantity controls
const originalAddToCart = addToCart;
addToCart = function(name, price) {
  originalAddToCart(name, price);
  
  // Show success message
  const message = document.createElement('div');
  message.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 z-50';
  message.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="fas fa-check-circle"></i>
      <span>${name} added to cart!</span>
    </div>
  `;
  
  document.body.appendChild(message);
  setTimeout(() => {
    message.classList.remove('translate-y-full', 'opacity-0');
  }, 100);
  
  setTimeout(() => {
    message.classList.add('translate-y-full', 'opacity-0');
    setTimeout(() => {
      document.body.removeChild(message);
    }, 300);
  }, 2000);
};
  