# EthosRadar - Trust Network Scanner

## Overview
EthosRadar is a Web3 trust network scanner integrated with the Ethos Protocol, enabling users to scan wallet reputations, analyze trust networks, and track trust scores. The project aims to provide a modern, intuitive user interface for understanding and navigating Web3 trust, offering a transparent and reliable tool for assessing credibility within decentralized ecosystems. Key capabilities include multi-platform profile search, real-time trust score visualization, and comprehensive analysis of vouching patterns.

## User Preferences
Preferred communication style: Simple, everyday language.
Prefers calm, muted interfaces with reduced animations.
UI preferences: Cloud background image with reduced animations for a serene interface.
Theme preference: Light mode enforced for all users (dark appearance with light overlays).

## System Architecture

### UI/UX Decisions
- **Design Philosophy**: Modern glassmorphism with a clean aesthetic, focusing on readability and visual harmony.
- **Color Scheme**: Refined palette with subtle gradients; Farcaster mode uses authentic purple/violet; Light mode uses softer gray tones for text.
- **Backgrounds**: Unified cloud background image for both light and dark themes, with adjustable component opacities, subtle background blur, and gentle hover animations.
- **Theming**: Comprehensive theme system supporting both light and dark modes with `localStorage` persistence and system preference detection, including smooth transitions.
- **Component Styling**: Consistent `backdrop-blur`, `bg-white/x`, `border`, and `shadow` properties for a unified glassmorphism appearance.
- **Typography**: Optimized font sizes and weights with system fonts, clear text contrast, and `drop-shadow` effects.
- **Interaction Design**: Calm hover effects, smooth transitions, and subtle animations (e.g., scale, pulse, color fill for icons) for a polished user experience. Minimal animations on mobile.
- **Mobile Optimization**: Responsive design with proper touch targets, optimized spacing, and adaptive layouts.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS, with CSS variables for dynamic theming.
- **UI Components**: Radix UI primitives and `shadcn/ui`.
- **State Management**: TanStack React Query.
- **Routing**: Wouter.
- **Build Tool**: Vite.
- **Backend Runtime**: Node.js with Express.js.
- **Server-Side Rendering**: Canvas API for generating Farcaster frame cards.

### Feature Specifications
- **Trust Profile Search**: Search for users across multiple platforms (Farcaster, Ethereum addresses) to display Ethos trust scores.
- **Farcaster Integration**: Dedicated search mode for Farcaster profiles, interactive Mini App cards, and native cast composition.
- **Trust Score Analysis**: Display comprehensive trust scores, levels, and detailed metrics.
- **R4R (Reputation for Reputation) Analysis**: Detailed analysis of vouching patterns to detect suspicious reciprocal activities.
- **Weekly Momentum/Score History**: Track user score changes and activity over time.
- **Vouch Intel**: Comprehensive view of received and given vouches.
- **Profile Pages**: Dedicated user profiles with organized tabs for Overview, Vouch Intel, and R4R Data.
- **Dynamic Loading States**: Skeleton loading animations with shimmer and pulse effects.

### System Design Choices
- **Client-Server Architecture**: Clear separation between frontend and backend for robust, scalable deployment.
- **API-Driven**: All data fetching through well-defined API endpoints.
- **Modularity**: Codebase organized into logical components, hooks, and utilities.
- **Performance Optimization**: Focus on reducing unnecessary animations, optimizing image loading, and efficient data retrieval.
- **Security**: Robust client/server separation and adherence to best practices.

## External Dependencies

- **Ethos Protocol APIs**: Core integration for user trust scores, profiles, vouch data, reviews, and activity history (V1 and V2 APIs).
- **@farcaster/miniapp-sdk**: For integrating direct Farcaster Mini App functionalities.
- **Node.js Canvas API**: Used server-side for generating dynamic Farcaster frame cards.
- **Image Hosting**: Optimized WebP/PNG assets served from `https://ethosradar.com/` including `unified-bg.webp`, `cloud-bg.png`, `logo.webp`, `icon.webp`, and their PNG fallbacks.
- **Warpcast**: Direct integration for sharing Farcaster frames and composing casts.