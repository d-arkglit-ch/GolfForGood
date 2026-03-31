# GolfCharity — Play. Give. Win. ⛳️

A modern, subscription-based web application connecting golf enthusiasts with charitable causes. The platform utilizes a "Freemium" business model, allowing free users to interact with the dashboard while gating core gameplay mechanics (score entry & monthly lottery entry) behind a premium subscription. 

## 🚀 The Core Loop (Play-Give-Win)
1. **Play**: Subscribers log their real-world golf scores.
2. **Give**: 10% of the affordable monthly subscription fee (₹5) goes directly to partnered charities.
3. **Win**: Entering at least 2 scores in a month unlocks the **Monthly Charity Draw**. The system generates a 5-number lottery ticket weighted by the player's past performance. If their numbers match the Admin's monthly draw, they win a share of the cash prize pool!

## 🛠 Tech Stack

- **Frontend Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend / Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password with strong regex validation)
- **Payments**: Razorpay Subscriptions API & Webhooks
- **Hosting**: Vercel

## ✨ Key Features

- **Auth & Onboarding**: Secure signup flow with real-time password strength indicators.
- **Freemium Dashboard**: An elegant split-column UI. The "Score Entry" side is locked behind a Razorpay subscription, naturally funneling free users to upgrade.
- **Dynamic Lottery Generation**: Users who meet the 2-score monthly quota can generate a locked 5-number ticket.
- **Admin Draw System**: A dedicated, role-protected `/admin` panel where the platform owner can simulate and lock in the monthly winning numbers.
- **Automated Winner Matching**: The system instantly compares all user tickets against the Admin's draw and calculates prize tiers (Jackpot for 5 matches, Tier 2 for 4 matches, Tier 3 for 3 matches). Matches are highlighted with celebratory animations on the user's dashboard.
- **Webhook Integration**: Supabase Edge Functions / Vercel Serverless Functions listen to Razorpay webhooks to automatically activate user subscriptions in real-time.

## 🗄 Database Architecture (Supabase)

The platform relies on `Row Level Security (RLS)` to ensure data privacy. Key tables include:
- `profiles`: Stores user metadata and `is_admin` roles.
- `subscriptions`: Tracks active Razorpay subscription status.
- `scores`: Logs historical golf scores mapped to users.
- `user_lottery_numbers`: Stores the user's generated 5-number ticket per month.
- `monthly_draws`: Stores the Admin's official winning numbers per month.

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/d-arkglit-ch/GolfForGood.git
   cd GolfForGood/golf-charity
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory (this is explicitly `.gitignore`'d) and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   RAZORPAY_PLAN_ID=your_razorpay_plan_id
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Start the Vite development server:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment
This project is configured for seamless deployment on **Vercel**. 
- Single-page application (SPA) fallback routing is configured via `vercel.json` to prevent 404 errors on page reloads.
- Ensure that *all* production environment variables are added to the Vercel Dashboard project settings.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

---
*Built with ❤️ for the golfing community and charitable causes.*
