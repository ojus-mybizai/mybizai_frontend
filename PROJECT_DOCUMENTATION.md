# MyBizAI - Complete Project Documentation

## 📋 Project Overview

**MyBizAI** is a modern AI-powered business management platform built with Next.js 14, TypeScript, and TailwindCSS. The application provides a complete authentication system, business onboarding flow, and dashboard interface designed for business management and AI integration.

### Key Features
- 🔐 Complete authentication system (login/signup)
- 🚀 Business onboarding workflow
- 📊 Interactive dashboard with business insights
- 🎨 Light/Dark theme support
- 📱 Responsive design
- 🛡️ Route protection and middleware
- 💾 Persistent state management with Zustand
- 🎯 FastAPI backend integration ready

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **Backend Integration**: FastAPI (endpoints configured)
- **Build Tool**: Next.js built-in bundler

### Dependencies
```json
{
  "next": "14.0.3",
  "react": "^18",
  "react-dom": "^18",
  "zustand": "^4.4.7",
  "lucide-react": "^0.294.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

---

## 📁 Project Structure

```
mybizai.app/
├── app/                          # Next.js App Router
│   ├── dashboard/
│   │   └── page.tsx             # Dashboard page
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── signup/
│   │   └── page.tsx             # Signup page
│   ├── onboarding/
│   │   └── page.tsx             # Business onboarding
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── page.tsx                 # Home page (redirects)
│   └── globals.css              # Global styles
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx     # Route protection & auth logic
│   │   ├── LoginForm.tsx        # Login form component
│   │   └── SignupForm.tsx       # Signup form component
│   ├── layout/
│   │   ├── BaseLayout.tsx       # Base layout wrapper
│   │   ├── DashboardLayout.tsx  # Dashboard-specific layout
│   │   ├── Header.tsx           # Top navigation header
│   │   ├── Sidebar.tsx          # Side navigation
│   │   ├── ThemeToggle.tsx      # Light/Dark mode toggle
│   │   └── ChatWindow.tsx       # Chat interface (future)
│   ├── onboarding/
│   │   └── OnboardingForm.tsx   # Business details form
│   └── ui/
│       ├── Button.tsx           # Reusable button component
│       ├── Card.tsx             # Card component
│       ├── Input.tsx            # Input field component
│       ├── Select.tsx           # Select dropdown component
│       └── Textarea.tsx         # Textarea component
├── lib/
│   ├── api.ts                   # FastAPI integration & types
│   ├── store.ts                 # Zustand state management
│   └── utils.ts                 # Utility functions
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # TailwindCSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

---

## 🔐 Authentication System

### Authentication Flow

1. **Unauthenticated Users**
   - Redirected to `/login` page
   - Can access `/login` and `/signup` pages only

2. **New User Registration**
   - User fills signup form (`/signup`)
   - Account created via FastAPI `/auth/register` endpoint
   - Automatically logged in and redirected to `/onboarding`
   - `isFirstLogin` flag set to `true`

3. **Existing User Login**
   - User fills login form (`/login`)
   - Authentication via FastAPI `/auth/login` endpoint
   - Redirected based on `isFirstLogin` and onboarding status

4. **Onboarding Process**
   - Required for all new users
   - Collects business information
   - Data saved to backend via `/api/onboarding` endpoint
   - Marks onboarding as complete in local state

5. **Authenticated Users**
   - Cannot access `/login` or `/signup` pages
   - Automatically redirected to `/dashboard`

### Route Protection

**AuthProvider Component** (`components/auth/AuthProvider.tsx`):
- Wraps entire application
- Handles automatic redirects based on auth state
- Manages route protection logic
- Applies theme preferences

**Protected Routes**:
- `/dashboard` - Main dashboard
- `/onboarding` - Business setup
- `/teams` - Team management (placeholder)
- `/agents` - AI agents (placeholder)
- `/campaigns` - Marketing campaigns (placeholder)
- `/analytics` - Business analytics (placeholder)
- `/settings` - User settings (placeholder)

**Public Routes**:
- `/login` - User login
- `/signup` - User registration

### Authentication State Management

**Auth Store** (`lib/store.ts`):
```typescript
interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}
```

**User Interface**:
```typescript
interface User {
  id: string
  email: string
  name?: string
  isFirstLogin?: boolean
}
```

---

## 🚀 API Integration

### FastAPI Backend Endpoints

**Base URL**: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'`

#### Authentication Endpoints

1. **POST `/auth/login`**
   ```typescript
   Request: { email: string, password: string }
   Response: {
     access_token: string
     token_type: string
     user: {
       id: string
       email: string
       name?: string
       is_first_login?: boolean
     }
   }
   ```

2. **POST `/auth/register`**
   ```typescript
   Request: { email: string, password: string, name?: string }
   Response: AuthResponse (same as login)
   ```

3. **POST `/api/onboarding`**
   ```typescript
   Headers: { Authorization: "Bearer <token>" }
   Request: {
     business_name: string
     location: string
     employee_count: string
     business_type: string
     industry: string
     phone_number: string
     additional_info?: string
   }
   Response: { success: boolean, message: string }
   ```

### API Client (`lib/api.ts`)

- Centralized API request handling
- Automatic error handling with `ApiError` class
- JWT token management
- Request/response type safety

---

## 📊 State Management

### Zustand Stores

The application uses Zustand with persistence for state management:

#### 1. Auth Store
- User authentication state
- JWT token storage
- User profile information
- Persisted to `localStorage` as `auth-storage`

#### 2. Business Store
```typescript
interface BusinessData {
  businessName: string
  location: string
  employeeCount: string
  businessType: 'service' | 'product' | 'both' | ''
  industry: string
  phoneNumber: string
  additionalInfo: string
}
```
- Business onboarding data
- Onboarding completion status
- Persisted to `localStorage` as `business-storage`

#### 3. Theme Store
- Light/Dark mode preference
- System theme detection
- Automatic DOM class updates
- Persisted to `localStorage` as `theme-storage`

#### 4. Sidebar Store
- Sidebar collapse state
- UI layout preferences
- Persisted to `localStorage` as `sidebar-storage`

#### 5. Team Store (Future Features)
- Team management data
- Chat messages
- Task management
- Persisted to `localStorage` as `team-storage`

---

## 🎨 UI Components & Design System

### Design Principles
- **Modern Gradient Aesthetics**: Blue to purple gradients throughout
- **Dark Mode Support**: Complete light/dark theme system
- **Responsive Design**: Mobile-first approach
- **Consistent Spacing**: TailwindCSS utility classes
- **Accessible**: Proper contrast ratios and keyboard navigation

### Component Library

#### Core UI Components (`components/ui/`)

1. **Button Component**
   - Multiple variants: primary, secondary, outline
   - Loading states with spinner
   - Size variations: sm, md, lg
   - Disabled states

2. **Input Component**
   - Label support
   - Error state handling
   - Icon integration
   - Password visibility toggle

3. **Card Component**
   - Header and content sections
   - Gradient accent borders
   - Dark mode support

4. **Select Component**
   - Dropdown functionality
   - Option mapping
   - Error handling
   - Icon integration

5. **Textarea Component**
   - Multi-line text input
   - Resizable
   - Label and error support

### Layout Components

1. **BaseLayout**: Core layout structure with header and sidebar
2. **DashboardLayout**: Dashboard-specific wrapper
3. **Header**: Top navigation with user info and theme toggle
4. **Sidebar**: Collapsible navigation menu
5. **ThemeToggle**: Light/dark mode switcher

---

## 📱 Pages & Routes

### 1. Home Page (`app/page.tsx`)
- **Purpose**: Route dispatcher
- **Logic**: Redirects users based on authentication and onboarding status
- **Flow**:
  - Unauthenticated → `/login`
  - Authenticated + First login → `/onboarding`
  - Authenticated + Onboarding complete → `/dashboard`

### 2. Login Page (`app/login/page.tsx`)
- **Component**: `LoginForm`
- **Features**:
  - Email/password authentication
  - Real-time validation
  - Password visibility toggle
  - API error handling
  - Link to signup page

### 3. Signup Page (`app/signup/page.tsx`)
- **Component**: `SignupForm`
- **Features**:
  - User registration form
  - Password strength validation
  - Confirm password matching
  - Optional name field
  - Link to login page

### 4. Onboarding Page (`app/onboarding/page.tsx`)
- **Component**: `OnboardingForm`
- **Features**:
  - Business information collection
  - Multi-field form with validation
  - Industry and business type selection
  - Employee count selection
  - Optional additional information
  - Data persistence to backend and local storage

### 5. Dashboard Page (`app/dashboard/page.tsx`)
- **Layout**: `DashboardLayout`
- **Features**:
  - Welcome section with business name
  - Business statistics cards with gradients
  - Quick action cards (placeholders for future features)
  - Business information display
  - Responsive grid layout

---

## 🛡️ Security & Validation

### Input Validation

**Email Validation** (`lib/utils.ts`):
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

**Password Validation** (`lib/utils.ts`):
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

### Security Features
- JWT token-based authentication
- Automatic token persistence
- Route protection middleware
- Input sanitization
- Error boundary handling
- HTTPS-ready configuration

---

## 🎯 Navigation Flow

### User Journey Map

```
┌─────────────────┐
│   Landing (/)   │
└─────────┬───────┘
          │
    ┌─────▼─────┐
    │ Auth Check │
    └─────┬─────┘
          │
    ┌─────▼─────┐      ┌──────────────┐
    │Not Auth'd │ ──── │ Login/Signup │
    └───────────┘      └──────┬───────┘
                              │
    ┌─────────────┐          │
    │Authenticated│ ◄────────┘
    └─────┬───────┘
          │
    ┌─────▼─────┐      ┌─────────────┐
    │First Login│ ──── │ Onboarding  │
    └───────────┘      └──────┬──────┘
                              │
    ┌─────────────┐          │
    │  Dashboard  │ ◄────────┘
    └─────────────┘
```

### Navigation Menu Structure

**Sidebar Navigation**:
1. **Dashboard** (`/dashboard`) - Main overview
2. **Teams** (`/teams`) - Team management (placeholder)
3. **AI Agents** (`/agents`) - AI tools (placeholder)
4. **Campaigns** (`/campaigns`) - Marketing (placeholder)
5. **Analytics** (`/analytics`) - Business insights (placeholder)
6. **Settings** (`/settings`) - User preferences (placeholder)

---

## 🔧 Configuration Files

### Next.js Configuration (`next.config.js`)
```javascript
const nextConfig = {
  experimental: {
    appDir: true,  // Enable App Router
  },
}
```

### TypeScript Configuration (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured (`@/*` → `./`)
- Next.js plugin integration

### TailwindCSS Configuration (`tailwind.config.js`)
- Dark mode: `class` strategy
- Custom color palette with primary blue shades
- Content paths for all components
- Custom gradient utilities

---

## 🚀 Development Workflow

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # FastAPI backend URL
```

### Development Server
- **URL**: `http://localhost:3000`
- **Hot Reload**: Enabled
- **TypeScript**: Real-time type checking
- **Linting**: ESLint integration

---

## 📈 Future Enhancements

### Planned Features (Based on Navigation Structure)

1. **Teams Management**
   - Team creation and management
   - Member roles and permissions
   - Team-based chat system
   - Task assignment and tracking

2. **AI Agents**
   - Business AI assistants
   - Automated task handling
   - Custom AI agent creation
   - Integration with business data

3. **Campaigns**
   - Marketing campaign management
   - Email marketing tools
   - Social media integration
   - Campaign analytics

4. **Analytics**
   - Business performance metrics
   - Revenue tracking
   - Customer insights
   - Predictive analytics

5. **Settings**
   - User profile management
   - Business settings
   - Integration configurations
   - Notification preferences

### Technical Improvements
- Real-time notifications
- File upload capabilities
- Advanced search functionality
- Mobile app development
- API rate limiting
- Database optimization
- Caching strategies

---

## 🐛 Error Handling

### Client-Side Error Handling
- Form validation with real-time feedback
- API error display with user-friendly messages
- Network error handling
- Loading states for all async operations

### API Error Management
```typescript
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}
```

### Graceful Degradation
- Offline functionality with local storage
- Fallback UI states
- Progressive enhancement
- Error boundaries (can be added)

---

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile First**: Base styles for mobile
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Large Desktop**: `xl:` prefix (1280px+)

### Layout Adaptations
- Collapsible sidebar on mobile
- Responsive grid systems
- Touch-friendly button sizes
- Mobile-optimized forms

---

## 🎨 Theme System

### Dark Mode Implementation
- **Strategy**: Class-based (`dark:` prefix)
- **Toggle**: Header theme switcher
- **Persistence**: Zustand store with localStorage
- **System Detection**: Automatic theme detection

### Color Palette
```css
/* Primary Colors */
--blue-50: #eff6ff
--blue-600: #2563eb
--purple-600: #9333ea

/* Gradients */
from-blue-600 to-purple-600  /* Primary gradient */
from-blue-50 to-purple-50    /* Light background */
```

---

## 📊 Performance Considerations

### Optimization Features
- **Next.js 14**: Latest performance improvements
- **App Router**: Improved routing performance
- **Code Splitting**: Automatic component splitting
- **Image Optimization**: Next.js built-in optimization
- **Bundle Analysis**: Available via Next.js

### State Management Efficiency
- **Zustand**: Lightweight state management
- **Persistence**: Selective state persistence
- **Minimal Re-renders**: Optimized selectors

---

## 🔒 Data Privacy & Storage

### Local Storage Usage
- **Authentication**: JWT tokens and user data
- **Business Data**: Onboarding information
- **Preferences**: Theme and UI settings
- **Team Data**: Future team management data

### Data Security
- **Token Expiration**: JWT token lifecycle management
- **Secure Storage**: localStorage with encryption considerations
- **Data Validation**: Input sanitization and validation
- **HTTPS**: Production deployment ready

---

## 🚀 Deployment Ready

### Production Checklist
- ✅ Environment variables configured
- ✅ Build optimization enabled
- ✅ Error handling implemented
- ✅ Responsive design complete
- ✅ Dark mode support
- ✅ API integration ready
- ✅ State persistence working
- ✅ Route protection active

### Deployment Options
- **Vercel**: Recommended (Next.js creators)
- **Netlify**: Static site deployment
- **AWS**: Full-stack deployment
- **Docker**: Containerized deployment

---

## 📞 Support & Maintenance

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Consistent Naming**: Clear component and function names
- **Documentation**: Comprehensive inline comments

### Maintainability Features
- **Modular Architecture**: Separated concerns
- **Reusable Components**: DRY principle
- **Centralized State**: Single source of truth
- **Configuration Files**: Environment-based settings

---

This documentation provides a complete overview of the MyBizAI project architecture, features, and implementation details. The application is production-ready with a solid foundation for future enhancements and scalability.
