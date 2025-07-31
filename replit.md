# EthosRadar - Trust Network Scanner

## Overview
EthosRadar is a Web3 trust network scanner integrated with the Ethos Protocol. It enables users to scan wallet reputations, analyze trust networks, and track trust scores. The project aims to provide a modern, intuitive user interface for a seamless experience in understanding and navigating the complexities of Web3 trust. Key capabilities include multi-platform profile search, real-time trust score visualization, and comprehensive analysis of vouching patterns and reputation farming (R4R). The vision is to offer a transparent and reliable tool for assessing credibility within decentralized ecosystems.

## User Preferences
Preferred communication style: Simple, everyday language.
Prefers calm, muted interfaces with reduced animations.
UI preferences: Cloud background image with reduced animations for a serene interface.

## System Architecture

### UI/UX Decisions
- **Design Philosophy**: Modern glassmorphism with a clean aesthetic, focusing on readability and visual harmony.
- **Color Scheme**: Primarily uses a refined palette with subtle gradients. Farcaster mode integrates authentic purple/violet brand colors. Light mode uses softer gray tones for text.
- **Backgrounds**: Unified cloud background image for both light and dark themes, with adjustable component opacities to ensure background visibility. Subtle background blur and gentle hover animations are used.
- **Theming**: Comprehensive theme system supporting both light and dark modes with `localStorage` persistence and system preference detection. Theme changes include smooth transitions.
- **Component Styling**: Consistent `backdrop-blur`, `bg-white/x`, `border` and `shadow` properties for a unified glassmorphism appearance across all interactive elements (search, buttons, cards, modals).
- **Typography**: Optimized font sizes and weights for visual hierarchy and readability, with system fonts and clear text contrast. Text includes `drop-shadow` effects for legibility on glassmorphism backgrounds.
- **Interaction Design**: Calm hover effects, smooth transitions, and subtle animations (e.g., scale, pulse, color fill for icons) for a polished user experience. Minimal animations on mobile for performance.
- **Mobile Optimization**: Responsive design with proper touch targets (minimum 44px), optimized spacing, and adaptive layouts for various screen sizes to ensure accessibility and usability.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS for utility-first styling, with CSS variables for dynamic theming.
- **UI Components**: Radix UI primitives and `shadcn/ui` for accessible, customizable components.
- **State Management**: TanStack React Query for efficient server-side data fetching and caching.
- **Routing**: Wouter for lightweight client-side navigation.
- **Build Tool**: Vite for fast development and optimized production builds.
- **Backend Runtime**: Node.js with Express.js for RESTful API endpoints.
- **Server-Side Rendering**: Canvas API for generating Farcaster frame cards with dynamic user data.

### Feature Specifications
- **Trust Profile Search**: Search for users across multiple platforms (Farcaster, Ethereum addresses, etc.) to display their Ethos trust scores and related data.
- **Farcaster Integration**:
    - **Farcaster Mode**: Dedicated search mode to find Farcaster profiles, with specific UI indicators and auto-detection cards.
    - **Mini App Embeds**: Interactive Farcaster Mini App cards that provide profile previews and direct linking to the full EthosRadar experience.
    - **Native Cast Composition**: Direct cast creation within the Farcaster app using the SDK, eliminating external redirects for sharing.
- **Trust Score Analysis**: Display comprehensive trust scores, levels (e.g., Exemplary, Neutral), and detailed metrics like vouches, reviews, XP, and rank.
- **R4R (Reputation for Reputation) Analysis**: Detailed analysis of vouching and review patterns to detect suspicious reciprocal activities, including risk scores and visual indicators.
- **Weekly Momentum/Score History**: Track user score changes and activity over a specified period (e.g., 7-day, 30-day), with directional indicators.
- **Vouch Intel**: Comprehensive view of received and given vouches, with detailed transaction data and participant information.
- **Profile Pages**: Dedicated user profiles with organized tabs for Overview, Vouch Intel, and R4R Data.
- **Dynamic Loading States**: Sophisticated skeleton loading animations with shimmer and pulse effects, matching the glassmorphism theme, to enhance perceived performance.

### System Design Choices
- **Client-Server Architecture**: Clear separation between frontend (React/Vite) and backend (Node.js/Express) for robust, scalable deployment.
- **API-Driven**: All data fetching is through well-defined API endpoints, ensuring data consistency and maintainability.
- **Modularity**: Codebase organized into logical components, hooks, and utilities for reusability and maintainability.
- **Performance Optimization**: Focus on reducing unnecessary animations on mobile, optimizing image loading, and efficient data retrieval to ensure a smooth user experience.
- **Security**: Robust client/server separation and adherence to best practices in API design and data handling.

## External Dependencies

- **Ethos Protocol APIs**: Core integration for user trust scores, profiles, vouch data, reviews, and activity history. This includes both V1 and V2 API endpoints.
- **@farcaster/miniapp-sdk**: For integrating direct Farcaster Mini App functionalities like cast composition and environment detection.
- **Node.js Canvas API**: Used server-side for generating dynamic Farcaster frame cards as images.
- **Image Hosting**: Background image for OG cards now uses `https://i.ibb.co/1YykPd1T/ETHOSBG.jpg`. Other images (e.g., `ethos-logo.png`, `placeholder-avatar.png`) may still be served from `https://ethosradar.com/`.
- **Warpcast**: Direct integration for sharing Farcaster frames and composing casts.
- **Third-party Platforms**: APIs for cross-referencing user profiles on platforms like Twitter/X, Discord, and Telegram (though detailed social media account integration appears to be reduced or removed).