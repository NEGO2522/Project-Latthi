import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, googleProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithPopup } from '../firebase/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portal, setPortal] = useState('user'); // 'user' | 'admin'
  const ADMIN_EMAIL = 'cottonfab0001@gmail.com';
  const navigate = useNavigate();
  const location = useLocation();

  // Action Code Settings for Email Link Authentication
  const actionCodeSettings = {
    url: window.location.origin + '/login', // Assumes login page is at /login
    handleCodeInApp: true,
  };

  // Check if we're handling a sign-in with email link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      const storedPortal = window.localStorage.getItem('portalForSignIn') || 'user';
      setPortal(storedPortal);

      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          window.localStorage.removeItem('portalForSignIn');
          
          if (storedPortal === 'admin') {
            const authedEmail = (result?.user?.email || '').toLowerCase();
            if (authedEmail !== ADMIN_EMAIL) {
              toast.error('You are not authorized to access the Admin portal.');
              navigate('/');
              return;
            }
            navigate('/admin');
          } else {
            const returnUrl = location.state?.from || '/';
            navigate(returnUrl);
          }
          toast.success('Successfully signed in!');
        })
        .catch((error) => {
          console.error('Error signing in with email link', error);
          toast.error('Error signing in. Please try again.');
        });
    }
  }, [navigate, location]);

  const handleGoogleSignIn = async () => {
    if (portal === 'admin') {
      toast.error('Admin portal does not allow Google sign-in.');
      return;
    }
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      const returnUrl = location.state?.from || '/';
      navigate(returnUrl);
      toast.success('Successfully signed in with Google!');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (portal === 'admin' && normalizedEmail !== ADMIN_EMAIL) {
      toast.error('Only the admin email can access the Admin portal.');
      return;
    }

    try {
      setIsLoading(true);
      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', normalizedEmail);
      window.localStorage.setItem('portalForSignIn', portal);
      toast.success(`Sign-in link sent to ${email}. Check your inbox.`);
      setEmail('');
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      toast.error('Failed to send sign-in link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-center" autoClose={5000} />
      <div className="w-full max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            <span className="text-indigo-600">LATHI</span>
          </h1>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose your preferred sign-in method
          </p>
        </div>
      </div>

      <div className="mt-6 w-full max-w-md mx-auto">
        <div className="bg-transparent py-6 px-4 sm:px-8  sm:rounded-lg">
          <div className="space-y-6">
            <div className="mb-2">
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  type="button"
                  onClick={() => setPortal('user')}
                  className={`flex-1 px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-200 ${portal === 'user' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-700'}`}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setPortal('admin')}
                  className={`flex-1 px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-200 ${portal === 'admin' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-700'}`}
                >
                  Admin
                </button>
              </div>
            </div>
            <form className="space-y-4 sm:space-y-6" onSubmit={handleEmailLinkSignIn}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 sm:pl-10 text-sm sm:text-base border-gray-300 rounded-lg p-2.5 sm:p-3 border"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? 'Sending link...' : 'Send me a magic link'}
                </button>
              </div>
            </form>

            {portal === 'user' && (
              <>
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-300" />
                  <span className="mx-3 text-xs sm:text-sm text-gray-500">Or continue with</span>
                  <div className="flex-1 border-t border-gray-300" />
                </div>

                <div>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-transparent hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <FcGoogle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
                    <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
          <p className="text-gray-600">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;