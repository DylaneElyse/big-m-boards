"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import { useValidatedInput } from '@/hooks/useValidatedInput';
import { required, isEmail, minLength } from '@/utils/formValidator';

function LoginForm() {
  const emailInput = useValidatedInput('', [required(), isEmail()]);
  const passwordInput = useValidatedInput('', [required(), minLength(6, 'Password must be at least 6 characters')]);
  
  const [apiError, setApiError] = useState(''); 
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const isEmailValid = emailInput.validate();
    const isPasswordValid = passwordInput.validate();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      const { data, error } = await signIn(emailInput.value, passwordInput.value);

      if (error) {
        setApiError(error.message);
        console.error('Login Error:', error.message);
      } else if (data && data.user) {
        console.log('Login successful:', data.user);
        router.push('/admin/dashboard');
      } else {
        setApiError('An unexpected error occurred. Please check your credentials or try again.');
        console.warn('Unexpected login response:', data);
      }
    } catch (err) {
      setApiError('An unexpected error occurred. Please try again.');
      console.error('General Login Error:', err);
    }
  };

  return (
    <div className="max-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-h-full max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h1>
          {apiError && (
            <p className="mt-2 text-center text-sm text-red-600">
              {apiError}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border bg-white border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={emailInput.value}
                onChange={emailInput.onChange}
                onBlur={emailInput.onBlur}
              />
              {emailInput.isTouched && emailInput.error && (
                <p className="text-xs text-red-600 mt-1 px-3">{emailInput.error}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border bg-white border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={passwordInput.value}
                onChange={passwordInput.onChange}
                onBlur={passwordInput.onBlur}
              />
              {passwordInput.isTouched && passwordInput.error && (
                <p className="text-xs text-red-600 mt-1 px-3">{passwordInput.error}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}


// "use client";

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/utils/supabase/client';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         setError(error.message);
//         console.error('Supabase Login Error:', error.message);
//       } else if (data && data.user) {
//         console.log('Login successful:', data.user);
//         router.push('/dashboard');
//       } else {
//         setError('An unexpected error occurred. Please check your email or try again.');
//         console.warn('Unexpected login response:', data);
//       }
//     } catch (err) {
//       setError('An unexpected error occurred. Please try again.');
//       console.error('General Login Error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-h-full max-w-md w-full space-y-8">
//         <div>
//           <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in to your account
//           </h1>
//           {error && (
//             <p className="mt-2 text-center text-sm text-red-600">
//               {error}
//             </p>
//           )}
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="email" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border bg-white border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border bg-white border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
//                 Forgot your password?
//               </a>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
