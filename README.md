# XTRA Watch — Luxury Horology & Smartwatch E-Commerce

An ultra-modern, clean, and smooth e-commerce storefront for **XTRA Watch** (Envanto Market verified partner), engineered with responsive design, glassmorphic UI, and interactive shopping features.

---

## ✨ Key Features & Redesign Highlights

- **Luxury Horology Aesthetics**:
  - Deep obsidian darks, aerospace titanium grays, emerald accents, and champagne gold finishes.
  - Typography powered by **Plus Jakarta Sans** and **Space Grotesk**.
  - Fluid glassmorphic sticky navigation with backdrop blur (`backdrop-filter: blur(18px)`).
  - Silky hover micro-interactions, subtle float animations, and responsive bento grid layouts.

- **Interactive Shopping Experience (`js/main.js`)**:
  - **Slide-Over Cart Drawer**:
    - Persistent cart state backed by `localStorage`.
    - Live subtotal, taxes, and dynamic free shipping progress tracker.
    - Promo coupon engine (try `XTRA20` for 20% off or `WELCOME10` for $10 off).
    - Simulated express checkout modal with Apple Pay / Credit Card flow.
  - **Quick View Modal**:
    - Instant modal showing high-resolution product photography, detailed technical specs, color finish selectors, and instant Add-to-Cart.
  - **Wishlist Engine**:
    - One-click heart toggle with counter sync and toast feedback.
  - **Interactive Bespoke Studio (`commponent/custom.html`)**:
    - Real-time 3D-light preview switcher for casing metallurgy (Titanium, DLC Black, 18K Gold, Stainless).
    - Strap selector and complimentary laser signature engraving input.
    - Dynamic price recalculation and direct checkout integration.
  - **Live Catalog Search & Category Filters**:
    - Instant, non-reloading search and filter pills on `commponent/watch.html`.
  - **High-Tech Floating Toast Notifications**:
    - Non-intrusive feedback for cart additions, wishlist updates, and coupon copy.
  - **Back to Top Floating Trigger**:
    - Smooth scrolling with scroll-height visibility trigger.

---

## 📁 Project Structure

```
├── index.html                   # Main luxury flagship landing page
├── README.md                    # Project documentation
├── css/
│   ├── custom.css               # Central luxury design system & responsive styling
│   └── css/                     # Bootstrap 5 framework stylesheets
├── js/
│   ├── main.js                  # Global shopping cart, wishlist, modals & interactive logic
│   └── js/                      # Bootstrap 5 JavaScript bundle
├── commponent/
│   ├── watch.html               # Full catalog with live search & filtering
│   ├── bestseller.html          # High-demand bestseller collection
│   ├── classic.html             # Heritage leather & 316L stainless steel timepieces
│   ├── modern.html              # Ultra-thin AMOLED titanium smartwatches
│   ├── sport.html               # 50M 5ATM certified sports chronographs
│   ├── custom.html              # Interactive Bespoke Watch Customizer studio
│   └── contact.html             # VIP horology concierge & support inquiry
├── image/                       # Brand assets & lifestyle media
└── watch/                       # High-resolution transparent watch renders
```

---

## 🚀 How to Run

Open any `.html` file (e.g. `index.html`) in any modern web browser, or serve using any static web server:

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve
```

Navigate to `http://localhost:8080` to experience the ultra-clean, smooth, responsive luxury storefront.
