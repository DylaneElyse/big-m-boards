# Authentication Setup Documentation

## Overview

This application uses a custom authentication context built on top of Supabase Auth to manage user authentication state throughout the admin section.

## Components

### 1. AuthContext (`contexts/AuthContext.js`)

The main authentication context that provides:
- User state management
- Authentication methods (signIn, signOut)
- Loading states
- Session persistence

### 2. ProtectedRoute (`components/ProtectedRoute.js`)

A wrapper component that protects admin routes by:
- Checking authentication status
- Redirecting unauthenticated users to login
- Showing loading states during auth checks

### 3. useAuth Hook (`hooks/useAuth.js`)

Custom hooks for accessing authentication state:
- `useAuth()` - Main auth hook
- `useRequireAuth()` - Throws error if not authenticated
- `useAuthUser()` - Returns user and authentication status

## Usage

### Protecting Admin Routes

The admin layout automatically wraps all admin pages with authentication:

```jsx
// app/admin/layout.js
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        {/* Admin content */}
      </ProtectedRoute>
    </AuthProvider>
  );
}
```

### Using Auth in Components

```jsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Logout</button>
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Login Flow

The login page uses the auth context:

```jsx
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { signIn, loading } = useAuth();

  const handleSubmit = async (email, password) => {
    const { data, error } = await signIn(email, password);
    if (error) {
      // Handle error
    } else {
      // Redirect to admin dashboard
    }
  };
}
```

## Authentication Flow

1. **Initial Load**: AuthContext checks for existing session
2. **Login**: User submits credentials via login form
3. **Session Management**: Supabase handles session persistence
4. **Route Protection**: ProtectedRoute checks auth status
5. **Logout**: Clears session and redirects to login

## Key Features

- **Automatic Redirects**: Unauthenticated users are redirected to login
- **Session Persistence**: Users stay logged in across browser sessions
- **Loading States**: Proper loading indicators during auth operations
- **Error Handling**: Comprehensive error handling for auth operations
- **Type Safety**: Context provides proper TypeScript support

## Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Considerations

- All admin routes are protected by default
- Session tokens are handled securely by Supabase
- Middleware ensures proper cookie handling
- Auth state is synchronized across tabs
