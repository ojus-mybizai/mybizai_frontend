# MyBizAI - AI-Powered Business Management Platform

A modern Next.js webapp built with TypeScript, TailwindCSS, Zustand state management, and Lucide React icons. This application provides a complete authentication flow with FastAPI backend integration and business onboarding features.

## Features

### 🔐 Authentication
- **Login & Signup** pages with email/password authentication
- **Client-side validation** with real-time error feedback
- **JWT token management** with automatic persistence
- **FastAPI integration** for secure authentication endpoints

### 🚀 Onboarding Flow
- **Business details collection** including:
  - Business/website name
  - Location and contact information
  - Team size and business type
  - Industry selection
  - Additional business information
- **Progressive form validation**
- **Data persistence** in Zustand store and localStorage

### 📊 Dashboard
- **Welcome screen** with personalized business information
- **Business statistics** cards with gradient accents
- **Responsive layout** with sidebar navigation
- **Quick action cards** for future features

### 🎨 Design & Theme
- **Light/Dark mode toggle** with system preference detection
- **Gradient accents** throughout the UI
- **Modern card-based design** with shadows and rounded corners
- **Responsive layout** for all screen sizes
- **Lucide React icons** for consistent iconography

### 🛡️ Route Protection
- **Automatic redirects** based on authentication status
- **Onboarding flow enforcement** for new users
- **Protected routes** for authenticated users only
- **Public route restrictions** for logged-in users

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Zustand** for state management
- **Lucide React** for icons
- **FastAPI** backend integration (endpoints ready)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FastAPI backend server (optional - app works with mock data)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── onboarding/       # Business onboarding
│   ├── layout.tsx        # Root layout with AuthProvider
│   ├── page.tsx          # Home page with redirects
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── onboarding/       # Onboarding form
│   └── ui/               # UI components (Button, Input, Card)
├── lib/                  # Utilities and configuration
│   ├── api.ts           # FastAPI integration
│   ├── store.ts         # Zustand stores
│   └── utils.ts         # Helper functions
└── README.md            # This file
```

## API Integration

The app is designed to work with a FastAPI backend with the following endpoints:

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /api/onboarding` - Save business data

### Expected API Response Format

**Login/Signup Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "is_first_login": true
  }
}
```

## State Management

The app uses Zustand with persistence for:

- **Authentication state** (token, user info)
- **Business data** (onboarding information)
- **Theme preferences** (light/dark mode)

All state is automatically persisted to localStorage.

## Navigation Flow

1. **Unauthenticated users** → Login/Signup pages only
2. **New users after signup** → Onboarding → Dashboard
3. **Returning users** → Dashboard (or Onboarding if incomplete)
4. **Authenticated users** → Cannot access login/signup pages

## Customization

### Adding New Pages
1. Create page in `app/` directory
2. Add route to `protectedRoutes` in `AuthProvider.tsx`
3. Add navigation item to `Sidebar.tsx`

### Styling
- Modify `tailwind.config.js` for theme customization
- Update gradient colors in component files
- Adjust spacing and sizing in `globals.css`

### API Integration
- Update `lib/api.ts` for new endpoints
- Modify request/response interfaces as needed
- Handle authentication headers automatically

## Development Notes

- The app works without a backend (uses local storage)
- API calls gracefully handle failures
- All forms include comprehensive validation
- Theme preference is detected from system settings
- Routes are automatically protected based on auth state

## Future Enhancements

The sidebar includes placeholder navigation for:
- Teams management
- AI Agents
- Campaigns
- Analytics
- Settings

These can be easily implemented following the existing patterns.

## License

This project is built for demonstration purposes and can be customized for your specific business needs.
