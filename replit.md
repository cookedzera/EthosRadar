# EthosRadar - Trust Network Scanner

## Overview
EthosRadar is a Web3 trust network scanner integrated with the Ethos Protocol. It enables users to scan wallet reputations, analyze trust networks, and track trust scores. The project aims to provide a modern, intuitive user interface for a seamless experience in understanding and navigating the complexities of Web3 trust. Key capabilities include multi-platform profile search, real-time trust score visualization, and comprehensive analysis of vouching patterns and reputation farming (R4R). The vision is to offer a transparent and reliable tool for assessing credibility within decentralized ecosystems.

## User Preferences
Preferred communication style: Simple, everyday language.
Prefers calm, muted interfaces with reduced animations.
UI preferences: Cloud background image with reduced animations for a serene interface.
Theme preference: Light mode enforced for all users (dark appearance with light overlays).

## Deployment Configuration
**Primary Domain**: ethosradar.com  
**Replit Domain**: ethosradar.replit.app  
**Frame Generation**: Supports both domains with automatic domain detection
**Background Images**: Served from https://ethosradar.com/ for consistent asset loading
**Client-side URLs**: Generated using window.location.origin for automatic domain adaptation

## Recent Changes (January 2025)
- **URGENT: Farcaster Logo Upload Required**: New logo1.png (128KB blue radar design) created for Farcaster Mini App but needs manual upload to ethosradar.com domain (currently returns 404)
- **Background Configuration**: Website uses unified-bg background, Farcaster frame cards use cloud-bg for distinct visual identity
- **Enhanced Farcaster Direct Cast**: Implemented comprehensive SDK detection with multiple fallback methods for seamless cast composition in Mini App context
- **WebP Optimization Implemented**: Converted background and logo images to WebP format, achieving 93-96% file size reduction (1MB → 37-68KB)
- **Logo Assets Updated**: New radar-style logo properly configured with WebP/PNG fallbacks and optimized for both local and ethosradar.com domain serving
- **Performance Enhancements**: Added image preloading, WebP support detection, and optimized asset delivery for faster page loads
- **Asset Domain Configuration**: All logo, background, and Farcaster manifest assets properly configured to use ethosradar.com URLs for production
- **Deployment Readiness Fixed**: Resolved deployment health check failures by adding explicit `/health`, `/ready`, and `/_status` endpoints for Replit Deployments
- **Server Initialization Improved**: Enhanced error handling with comprehensive logging, graceful shutdown handling (SIGTERM/SIGINT), and proper async initialization order
- **Production Build Validated**: Confirmed production build process works correctly with proper environment detection and error handling
- **Domain Configuration Updated**: Added support for dual-domain deployment (ethosradar.com + ethosradar.replit.app)
- **Frame Generation Enhanced**: Updated server-side frame generation to use correct domains based on deployment environment
- **Farcaster PNG Compliance**: Updated all Farcaster assets to use PNG format for maximum compatibility (logos, frame backgrounds)
- **TypeScript Errors Fixed**: Resolved error handling type issues in frame generation code
- **Migration Completed**: Successfully migrated from Replit Agent to standard Replit environment

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
- **Image Hosting**: Optimized WebP/PNG assets served from `https://ethosradar.com/` including:
  - `unified-bg.webp` (69KB, was 1MB PNG) - Main website background image
  - `cloud-bg.png` (optimized) - Farcaster frame card background only
  - `logo.webp` (37KB, was 838KB PNG) - Primary logo
  - `icon.webp` (37KB, was 838KB PNG) - App icon for manifests
  - PNG fallbacks for older browser compatibility
- **Warpcast**: Direct integration for sharing Farcaster frames and composing casts.
- **Third-party Platforms**: APIs for cross-referencing user profiles on platforms like Twitter/X, Discord, and Telegram (though detailed social media account integration appears to be reduced or removed).

## Asset Upload Checklist for ethosradar.com Domain
**Critical**: These optimized assets must be uploaded to the production domain:
- ✅ `cloud-bg.webp` (optimized) - Main background image
- ✅ `cloud-bg.png` (updated) - Background fallback
- ✅ `logo.webp` (37KB) - Main logo
- ✅ `logo.png` (838KB) - Logo fallback  
- ✅ `icon.webp` (37KB) - App icon
- ✅ `icon.png` (838KB) - Icon fallback
- ❌ `logo1.png` (128KB) - **CRITICAL: NEW Farcaster Mini App logo** - MUST BE UPLOADED (Currently 404 on production)