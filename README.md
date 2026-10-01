# ChowGrid 🍲🇬🇭
> **Good Food. Great Choices.**
> A modern Ghanaian Food Marketplace & Vendor Ecosystem platform.

![ChowGrid Preview](/public/chowgrid-logo.png)

---

## 🌟 Overview

**ChowGrid** is a web-based food ordering, vendor management, and verified delivery ecosystem tailored for the Ghanaian culinary landscape. It connects hungry diners to authentic local food kitchens (Waakye, Jollof, Banku, Fufu, etc.) with customizable ingredients, transparent pricing, and dual-OTP security.

---

## 🚀 Key Features

### 1. 🍽️ Customer Marketplace & "Build-Your-Meal" Customizer
- Dynamic item modifier builder (base portion, multiple proteins, sides, sauces, and extra pack options).
- Real-time cart calculation and price-locking guarantee.
- Saved delivery locations (Home, Work, Office, Ghana Post GPS).
- Mobile Money (MTN MoMo, Telecel Cash) and Card checkout support.

### 2. 🔐 Dual-OTP Delivery Verification Protocol
- **Pickup OTP**: 4-digit security code verified between Vendor Kitchen & Rider.
- **Delivery OTP**: 4-digit customer-held PIN that must be confirmed by the Rider to complete the order and release escrow funds.
- Live 8-step visual order tracking from *Order Placed* to *Fulfilled*.

### 3. 🏪 Food Vendor SaaS Hub
- Kitchen open/close toggles.
- Dynamic prep time estimates.
- Monthly SaaS subscription tracking (₵50–₵100/month) with automated **7-Day Grace Period** lock mechanisms.
- Live incoming order dispatch & Rider pickup verification modal.

### 4. 🛡️ Central Admin Suite
- Vendor KYC verification & store approval workflows.
- Store emergency lock / unlock controls.
- Live system order logs and GMV tracking.

### 5. ⚙️ Preferences & Account Settings
- Personal profile management.
- Saved delivery locations management.
- Payment preferences & notification settings.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS + Lucide Icons + Outfit Typography
- **Animation**: Canvas Confetti + Smooth Transitions
- **State Management**: React Context + LocalStorage Persistence

---

## 💻 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/newman7890/-ChowGrid.git

# Navigate to project
cd -ChowGrid

# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 📄 License
MIT License. Built for Ghana's vibrant food scene. 🇬🇭

