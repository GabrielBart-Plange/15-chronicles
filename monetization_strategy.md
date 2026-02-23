# 15 Chronicles - Monetization & Gamification Strategy (Draft)

This document contains the proposed monetization and gamification strategy for 15 Chronicles. It has been moved out of the implementation plan to keep the current focus on core technical stability and quality.

## Advanced Monetization Model
- **"Vellum Premium" Subscription (GHS 5/week)**:
  - Targeted at mass affordability in Ghana.
  - Perks: Ad-free reading, 24h early access to new chapters, exclusive "Premium Member" badge.
- **Micro-transactions (Coins/Essence)**:
  - Purchase "Essence" via MoMo to unlock individual premium chapters.
- **Revenue Sharing (The "Archivist's Cut")**:
  - **Authors**: 70% of subscription/micro-transaction revenue (after gateway fees).
  - **Platform Owner**: 25% for maintenance and platform growth.
  - **Level 9 "Elders"**: 5% pool distributed to top-tier users (gamified passive income).

## Gamification & Level 9 Mechanics
- **Progression System**:
  - Users earn `XP` through: Reading chapters (1 XP/ch), Commenting (2 XP), and Liking (1 XP).
  - **Level 1 → 8**: Standard progression with cosmetic unlocks.
- **Level 9 (The Sovereign)**:
  - **Requirement**: Reach max XP + "Ritual of Ascension" (One-time or recurring contribution).
  - **Benefit**: Passive income from the 5% platform pool, enhanced curation power (votes on homepage features), and the gold "Level 9" ring on profile.

## Adaptive Payment Routing Engine
- **Region 1: Ghana & West Africa**
  - Primary: **Paystack** (Mobile Money & local bank transfers).
- **Region 2: International**
  - Primary: **Stripe** (USD/EUR subscriptions) or **Flutterwave** (Fallback).
- **Logic**: Use IP-based geolocation (Vercel headers) to determine the user's country and show the optimal gateway.
