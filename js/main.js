/**
 * XTRA WATCH / ENVANTO MARKET - MAIN INTERACTIVE JAVASCRIPT
 * Smooth, Modular, Zero-Dependency & Clean Architecture
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Toast Notification System
  // ==========================================================================
  function showToast(message, type = 'success', iconClass = 'bi-check2-circle') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-custom toast-${type}`;
    toast.innerHTML = `
      <i class="bi ${iconClass}"></i>
      <span class="flex-grow-1">${message}</span>
      <button type="button" class="btn-close btn-close-white ms-2" style="font-size: 0.7rem; opacity: 0.75;" aria-label="Close"></button>
    `;

    container.appendChild(toast);

    toast.querySelector('.btn-close').addEventListener('click', () => {
      toast.remove();
    });

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px) scale(0.9)';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  window.showToast = showToast;

  // ==========================================================================
  // 2. Cart System (Persistent localStorage)
  // ==========================================================================
  const CART_STORAGE_KEY = 'xtra_watch_cart_v2';
  const WISHLIST_STORAGE_KEY = 'xtra_watch_wishlist_v2';
  const FREE_SHIPPING_THRESHOLD = 600;

  let currentCoupon = null;

  // Default demo items if cart is empty on first visit
  const defaultCartItems = [
    {
      id: 'prod-1',
      title: 'Chrome Watch Pro',
      price: 399,
      image: 'watch/watch-1.png',
      finish: 'Obsidian Black',
      qty: 1
    },
    {
      id: 'prod-2',
      title: 'Classic Edition Watch',
      price: 399,
      image: 'watch/watch-2.png',
      finish: 'Cognac Leather',
      qty: 1
    }
  ];

  function getCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
    return defaultCartItems;
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not write cart to localStorage', e);
    }
    updateCartUI();
  }

  function getWishlist() {
    try {
      const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return ['prod-1'];
  }

  function saveWishlist(wishlist) {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {}
    updateWishlistUI();
  }

  function addToCart(product) {
    const cart = getCart();
    const existingIndex = cart.findIndex(
      item => item.id === product.id && item.finish === product.finish
    );

    if (existingIndex > -1) {
      cart[existingIndex].qty += product.qty || 1;
    } else {
      cart.push({
        id: product.id || 'prod-' + Date.now(),
        title: product.title || 'Smartwatch Timepiece',
        price: Number(product.price) || 399,
        image: product.image || 'watch/watch-1.png',
        finish: product.finish || 'Standard Titanium',
        qty: Number(product.qty) || 1
      });
    }

    saveCart(cart);
    showToast(`Added <strong>${product.title}</strong> to your cart!`, 'success', 'bi-bag-check-fill');

    // Automatically open cart offcanvas for smooth UX
    const cartDrawerEl = document.getElementById('cartDrawer');
    if (cartDrawerEl && window.bootstrap && window.bootstrap.Offcanvas) {
      const bsCart = bootstrap.Offcanvas.getOrCreateInstance(cartDrawerEl);
      bsCart.show();
    }
  }

  function removeFromCart(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
      const removed = cart.splice(index, 1)[0];
      saveCart(cart);
      showToast(`Removed <strong>${removed.title}</strong> from cart`, 'info', 'bi-trash3');
    }
  }

  function updateItemQty(index, delta) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
        showToast('Item removed from cart', 'info', 'bi-trash3');
      }
      saveCart(cart);
    }
  }

  function toggleWishlist(productId, productTitle) {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(productId);
    let added = false;

    if (index > -1) {
      wishlist.splice(index, 1);
      showToast(`Removed <strong>${productTitle || 'Item'}</strong> from wishlist`, 'info', 'bi-heart');
    } else {
      wishlist.push(productId);
      added = true;
      showToast(`Saved <strong>${productTitle || 'Item'}</strong> to wishlist!`, 'success', 'bi-heart-fill');
    }

    saveWishlist(wishlist);
    return added;
  }

  // Calculate relative image path depending on whether we are in root or /commponent/
  function fixImagePath(path) {
    const currentLoc = (window.location.pathname + ' ' + window.location.href).toLowerCase();
    const isInComponentDir = currentLoc.includes('commponent');
    if (isInComponentDir) {
      if (path.startsWith('../')) return path;
      return '../' + path;
    } else {
      if (path.startsWith('../')) return path.substring(3);
      return path;
    }
  }

  function updateCartUI() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);

    // Update all badge counters
    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });

    // Render Cart Drawer
    const itemsContainer = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('cartEmptyState');
    const cartFooter = document.getElementById('cartFooterContainer');
    const freeShippingBar = document.getElementById('cartShippingBar');

    if (!itemsContainer) return;

    if (cart.length === 0) {
      itemsContainer.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (cartFooter) cartFooter.style.display = 'none';
      if (freeShippingBar) freeShippingBar.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';
    if (freeShippingBar) freeShippingBar.style.display = 'block';

    let subtotal = 0;
    itemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;

      const card = document.createElement('div');
      card.className = 'cart-item-card';
      card.innerHTML = `
        <img src="${fixImagePath(item.image)}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-meta"><i class="bi bi-palette me-1"></i>${item.finish}</div>
          <div class="d-flex align-items-center justify-content-between">
            <div class="cart-qty-btn-group">
              <button type="button" class="cart-qty-btn qty-minus" data-index="${index}"><i class="bi bi-dash"></i></button>
              <span class="cart-qty-count">${item.qty}</span>
              <button type="button" class="cart-qty-btn qty-plus" data-index="${index}"><i class="bi bi-plus"></i></button>
            </div>
            <div class="fw-bold text-dark fs-6">$${itemTotal}</div>
          </div>
        </div>
        <button type="button" class="cart-item-remove btn-remove-item" data-index="${index}" title="Remove item">
          <i class="bi bi-trash3"></i>
        </button>
      `;
      itemsContainer.appendChild(card);
    });

    // Setup qty & remove listeners
    itemsContainer.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => updateItemQty(Number(btn.dataset.index), -1));
    });
    itemsContainer.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => updateItemQty(Number(btn.dataset.index), 1));
    });
    itemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.index)));
    });

    // Shipping calculation
    const progressEl = document.getElementById('shippingProgressFill');
    const progressText = document.getElementById('shippingProgressText');
    if (progressEl && progressText) {
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        progressEl.style.width = '100%';
        progressText.innerHTML = '<span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i>You unlocked Free Global Express Delivery!</span>';
      } else {
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        progressEl.style.width = `${pct}%`;
        progressText.innerHTML = `Add <strong class="text-dark">$${remaining}</strong> more for <strong>Free Express Shipping</strong>`;
      }
    }

    // Discount Calculation
    let discount = 0;
    if (currentCoupon === 'XTRA20') {
      discount = Math.round(subtotal * 0.2);
    } else if (currentCoupon === 'WELCOME10') {
      discount = 10;
    }

    const grandTotal = Math.max(0, subtotal - discount);

    const subtotalEl = document.getElementById('cartSubtotalAmount');
    const discountEl = document.getElementById('cartDiscountAmount');
    const discountRow = document.getElementById('cartDiscountRow');
    const grandTotalEl = document.getElementById('cartGrandTotalAmount');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
    if (discountRow) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        if (discountEl) discountEl.textContent = `-$${discount}`;
      } else {
        discountRow.style.display = 'none';
      }
    }
    if (grandTotalEl) grandTotalEl.textContent = `$${grandTotal}`;
  }

  function updateWishlistUI() {
    const wishlist = getWishlist();
    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
      el.textContent = wishlist.length;
      el.style.display = wishlist.length > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const id = btn.getAttribute('data-wishlist-id');
      if (wishlist.includes(id)) {
        btn.classList.add('active-wishlist');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-heart');
          icon.classList.add('bi-heart-fill');
        }
      } else {
        btn.classList.remove('active-wishlist');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-heart-fill');
          icon.classList.add('bi-heart');
        }
      }
    });
  }

  // ==========================================================================
  // 3. Quick View Modal Dynamic Binder
  // ==========================================================================
  const productDatabase = {
    'prod-1': {
      id: 'prod-1',
      title: 'Chrome Watch Pro',
      price: 399,
      origPrice: 499,
      badge: 'SALE -20%',
      image: 'watch/watch-1.png',
      rating: 5,
      reviewCount: 94,
      category: 'Smart Tech / Pro',
      description: 'Engineered with an aerospace titanium frame, 1.78" Ultra-HD AMOLED retina touchscreen, real-time biometrics, and multi-sport GPS telemetry.',
      specs: ['1.78" AMOLED Always-On', '7-Day Battery Life', 'Optical Heart & ECG Sensor', '50M Water Resistance (5ATM)']
    },
    'prod-2': {
      id: 'prod-2',
      title: 'Classic Edition Watch',
      price: 399,
      origPrice: 499,
      badge: 'BESTSELLER',
      image: 'watch/watch-2.png',
      rating: 5,
      reviewCount: 120,
      category: 'Heritage Luxury',
      description: 'Handcrafted Italian full-grain leather strap paired with a surgical-grade 316L stainless steel case. Timeless elegance meeting modern smart features.',
      specs: ['Genuine Italian Leather', 'Sapphire Glass Lens', 'Smart Call & App Alerts', 'Wireless Magnetic Fast-Charge']
    },
    'prod-3': {
      id: 'prod-3',
      title: 'Gold Prestige Smartwatch',
      price: 699,
      origPrice: 799,
      badge: '18K GOLD EDITION',
      image: 'watch/gold-watch.png',
      rating: 5,
      reviewCount: 88,
      category: 'Haute Horlogerie',
      description: 'Triple-plated 18K champagne gold finish with genuine scratchproof sapphire crystal glass. Features personalized monogram dials and elite VIP concierge sync.',
      specs: ['18K Champagne Gold Plating', 'Sapphire Crystal Glass', 'Custom Dial Studio', '2-Year VIP Global Concierge']
    },
    'prod-4': {
      id: 'prod-4',
      title: 'Stealth Black Sports',
      price: 599,
      origPrice: 699,
      badge: 'MIL-STD-810H',
      image: 'watch/black-watch.png',
      rating: 5,
      reviewCount: 156,
      category: 'Sports & Diver Chrono',
      description: 'Rugged DLC (Diamond-Like Carbon) matte finish built for marathons, diving, and alpine expeditions. Dual-frequency GPS and 100m dive rating.',
      specs: ['DLC Diamond-Like Carbon', 'Dual-Frequency Multi-GPS', '100M Dive Proof (10ATM)', 'Fluoroelastomer Sports Band']
    }
  };

  function openQuickView(productId) {
    const prod = productDatabase[productId] || productDatabase['prod-1'];
    const modalEl = document.getElementById('quickViewModal');
    if (!modalEl) return;

    modalEl.querySelector('#quickViewImg').src = fixImagePath(prod.image);
    modalEl.querySelector('#quickViewTitle').textContent = prod.title;
    modalEl.querySelector('#quickViewPrice').textContent = `$${prod.price}`;
    modalEl.querySelector('#quickViewCategory').textContent = prod.category;
    modalEl.querySelector('#quickViewDesc').textContent = prod.description;
    
    const specsList = modalEl.querySelector('#quickViewSpecs');
    if (specsList) {
      specsList.innerHTML = prod.specs.map(s => `<li><i class="bi bi-check2 text-primary me-2"></i>${s}</li>`).join('');
    }

    const addBtn = modalEl.querySelector('#quickViewAddBtn');
    if (addBtn) {
      addBtn.onclick = () => {
        const qty = Number(modalEl.querySelector('#quickViewQty')?.value) || 1;
        const finish = modalEl.querySelector('input[name="quickViewFinish"]:checked')?.value || 'Standard Edition';
        addToCart({
          id: prod.id,
          title: prod.title,
          price: prod.price,
          image: prod.image,
          finish: finish,
          qty: qty
        });
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      };
    }

    if (window.bootstrap && window.bootstrap.Modal) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  }

  // ==========================================================================
  // 4. Live Catalog Search and Category Filter
  // ==========================================================================
  function initLiveFilters() {
    const searchInput = document.getElementById('catalogSearch');
    const filterPills = document.querySelectorAll('.filter-pill-btn');
    const productItems = document.querySelectorAll('[data-product-card]');

    let activeFilter = 'all';

    function applyFilter() {
      const query = (searchInput?.value || '').toLowerCase().trim();

      productItems.forEach(card => {
        const title = (card.getAttribute('data-product-title') || '').toLowerCase();
        const category = (card.getAttribute('data-product-category') || '').toLowerCase();

        const matchesQuery = !query || title.includes(query) || category.includes(query);
        const matchesCategory = activeFilter === 'all' || category.includes(activeFilter.toLowerCase());

        if (matchesQuery && matchesCategory) {
          card.style.display = '';
          card.classList.remove('d-none');
        } else {
          card.style.display = 'none';
          card.classList.add('d-none');
        }
      });

      // Update counter if present
      const visibleCount = Array.from(productItems).filter(c => c.style.display !== 'none').length;
      const countEl = document.getElementById('catalogResultsCount');
      if (countEl) {
        countEl.textContent = `Showing ${visibleCount} timepiece${visibleCount === 1 ? '' : 's'}`;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });
  }

  // ==========================================================================
  // 5. Interactive Custom Watch Configurator (custom.html)
  // ==========================================================================
  function initConfigurator() {
    const previewImg = document.getElementById('configWatchPreview');
    const finishOptions = document.querySelectorAll('.config-finish-opt');
    const strapOptions = document.querySelectorAll('.config-strap-opt');
    const dialOptions = document.querySelectorAll('.config-dial-opt');
    const engravingInput = document.getElementById('configEngraving');
    const priceDisplay = document.getElementById('configTotalPrice');
    const orderBtn = document.getElementById('configOrderBtn');

    if (!previewImg || !priceDisplay) return;

    let basePrice = 599;
    let selectedFinish = 'Titanium Silver';
    let selectedStrap = 'Fluoroelastomer Sport';
    let selectedDial = 'Minimalist Onyx';
    let finishPrice = 0;
    let strapPrice = 0;

    const finishImages = {
      'Titanium Silver': 'watch/watch-1.png',
      'Stealth DLC Black': 'watch/black-watch.png',
      '18K Champagne Gold': 'watch/gold-watch.png',
      'Alpine Classic Leather': 'watch/watch-2.png'
    };

    function recalculate() {
      const total = basePrice + finishPrice + strapPrice;
      priceDisplay.textContent = `$${total}`;
    }

    finishOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        finishOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedFinish = opt.getAttribute('data-finish-name');
        finishPrice = Number(opt.getAttribute('data-finish-price')) || 0;

        if (finishImages[selectedFinish]) {
          previewImg.style.transform = 'scale(0.92) rotate(-5deg)';
          setTimeout(() => {
            previewImg.src = fixImagePath(finishImages[selectedFinish]);
            previewImg.style.transform = 'scale(1) rotate(0deg)';
          }, 200);
        }
        recalculate();
      });
    });

    strapOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        strapOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedStrap = opt.getAttribute('data-strap-name');
        strapPrice = Number(opt.getAttribute('data-strap-price')) || 0;
        recalculate();
      });
    });

    dialOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        dialOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedDial = opt.getAttribute('data-dial-name');
        recalculate();
      });
    });

    if (orderBtn) {
      orderBtn.addEventListener('click', () => {
        const engraving = (engravingInput?.value || '').trim();
        const customTitle = `Bespoke XTRA Watch (${selectedFinish})`;
        const customFinish = `${selectedStrap} + ${selectedDial}${engraving ? ' | Laser: "' + engraving + '"' : ''}`;
        const finalPrice = basePrice + finishPrice + strapPrice;

        addToCart({
          id: 'custom-' + Date.now(),
          title: customTitle,
          price: finalPrice,
          image: finishImages[selectedFinish] || 'watch/watch-1.png',
          finish: customFinish,
          qty: 1
        });
        showToast('Your custom bespoke watch was added to the cart!', 'success', 'bi-gem');
      });
    }
  }

  // ==========================================================================
  // 6. Global DOM Listeners & Interactive Bindings
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial UI renders
    updateCartUI();
    updateWishlistUI();
    initLiveFilters();
    initConfigurator();

    // 2. Coupon Application
    const couponBtn = document.getElementById('applyCouponBtn');
    const couponInput = document.getElementById('couponCodeInput');
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        if (code === 'XTRA20') {
          currentCoupon = 'XTRA20';
          showToast('Coupon <strong>XTRA20</strong> applied! 20% discount unlocked.', 'success', 'bi-tag-fill');
          updateCartUI();
        } else if (code === 'WELCOME10') {
          currentCoupon = 'WELCOME10';
          showToast('Coupon <strong>WELCOME10</strong> applied! $10 discount unlocked.', 'success', 'bi-tag-fill');
          updateCartUI();
        } else {
          showToast('Invalid coupon code. Try <strong>XTRA20</strong>', 'rose', 'bi-exclamation-triangle-fill');
        }
      });
    }

    // 3. Fast Add-to-Cart buttons on cards
    document.addEventListener('click', e => {
      const addBtn = e.target.closest('[data-add-cart]');
      if (addBtn) {
        e.preventDefault();
        const id = addBtn.getAttribute('data-product-id');
        const title = addBtn.getAttribute('data-product-title');
        const price = Number(addBtn.getAttribute('data-product-price'));
        const image = addBtn.getAttribute('data-product-image');
        const finish = addBtn.getAttribute('data-product-finish') || 'Titanium Edition';

        addToCart({
          id: id,
          title: title,
          price: price,
          image: image,
          finish: finish,
          qty: 1
        });
      }

      // Quick View Click
      const qvBtn = e.target.closest('[data-quick-view]');
      if (qvBtn) {
        e.preventDefault();
        const pid = qvBtn.getAttribute('data-quick-view');
        openQuickView(pid);
      }

      // Wishlist Click
      const wlBtn = e.target.closest('[data-wishlist-id]');
      if (wlBtn) {
        e.preventDefault();
        const wid = wlBtn.getAttribute('data-wishlist-id');
        const wTitle = wlBtn.getAttribute('data-wishlist-title');
        toggleWishlist(wid, wTitle);
      }

      // Copy Coupon Code Trigger
      const copyCodeBtn = e.target.closest('[data-copy-code]');
      if (copyCodeBtn) {
        e.preventDefault();
        const code = copyCodeBtn.getAttribute('data-copy-code') || 'XTRA20';
        navigator.clipboard?.writeText(code);
        showToast(`Promo code <strong>${code}</strong> copied to clipboard!`, 'success', 'bi-clipboard-check');
      }
    });

    // 4. Color Swatches on Product Cards
    document.querySelectorAll('.color-dot-choice').forEach(dot => {
      dot.addEventListener('click', e => {
        const parent = dot.closest('.color-dots-group');
        if (parent) {
          parent.querySelectorAll('.color-dot-choice').forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          const colorName = dot.getAttribute('data-color-name');
          const card = dot.closest('.product-card');
          if (card && colorName) {
            const addBtn = card.querySelector('[data-add-cart]');
            if (addBtn) addBtn.setAttribute('data-product-finish', colorName);
            const finishLabel = card.querySelector('.product-finish-label');
            if (finishLabel) finishLabel.textContent = colorName;
          }
        }
      });
    });

    // 5. Checkout Modal Trigger
    const checkoutBtn = document.getElementById('proceedCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
          showToast('Your cart is empty! Add a timepiece first.', 'info', 'bi-cart-x');
          return;
        }

        // Close cart drawer
        const cartDrawerEl = document.getElementById('cartDrawer');
        if (cartDrawerEl && window.bootstrap && window.bootstrap.Offcanvas) {
          bootstrap.Offcanvas.getInstance(cartDrawerEl)?.hide();
        }

        // Open checkout modal
        const checkoutModalEl = document.getElementById('checkoutModal');
        if (checkoutModalEl && window.bootstrap && window.bootstrap.Modal) {
          bootstrap.Modal.getOrCreateInstance(checkoutModalEl).show();
        }
      });
    }

    // 6. Complete Order Simulation
    const orderForm = document.getElementById('checkoutOrderForm');
    if (orderForm) {
      orderForm.addEventListener('submit', e => {
        e.preventDefault();
        const checkoutModalEl = document.getElementById('checkoutModal');
        if (checkoutModalEl && window.bootstrap && window.bootstrap.Modal) {
          bootstrap.Modal.getInstance(checkoutModalEl)?.hide();
        }

        // Clear cart
        localStorage.removeItem(CART_STORAGE_KEY);
        updateCartUI();

        showToast('🎉 Order placed successfully! Check your email for tracking info.', 'success', 'bi-check-circle-fill');
      });
    }

    // 7. Newsletter Submissions
    document.querySelectorAll('.newsletter-form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          showToast(`Thank you for subscribing! A 15% VIP welcome code has been sent to <strong>${input.value}</strong>`, 'success', 'bi-envelope-check-fill');
          input.value = '';
        }
      });
    });

    // 8. Contact Form
    const contactForm = document.getElementById('supportContactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', e => {
        e.preventDefault();
        showToast('Message sent! Our horology concierge will reply within 2 business hours.', 'success', 'bi-send-check-fill');
        contactForm.reset();
      });
    }

    // 9. Back to Top Button
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });

      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 10. Sticky Navbar Blur Elevation
    const navbar = document.querySelector('.navbar-luxury');
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }
  });
})();
