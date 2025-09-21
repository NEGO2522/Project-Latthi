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

  const actionCodeSettings = {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true,
  };

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      const storedPortal = window.localStorage.getItem('portalForSignIn') || 'user';
      setPortal(storedPortal);

      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('portalForSignIn');
            
            const authedEmail = (result?.user?.email || '').toLowerCase();
            if (storedPortal === 'admin' && authedEmail !== ADMIN_EMAIL) {
              toast.error('You are not authorized for the Admin portal.');
              navigate('/');
            } else {
              const returnUrl = storedPortal === 'admin' ? '/admin' : (location.state?.from || '/');
              navigate(returnUrl);
              toast.success('Successfully signed in!');
            }
          })
          .catch((error) => {
            console.error('Sign-in error', error);
            toast.error('Error signing in. Please try again.');
          });
      }
    }
  }, [navigate, location, auth]);

  const handleGoogleSignIn = async () => {
    if (portal === 'admin') {
      toast.error('Admin portal does not support Google sign-in.');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      const returnUrl = location.state?.from || '/';
      navigate(returnUrl);
      toast.success('Signed in with Google!');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (portal === 'admin' && normalizedEmail !== ADMIN_EMAIL) {
      toast.error('Invalid admin email.');
      return;
    }

    setIsLoading(true);
    try {
      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', normalizedEmail);
      window.localStorage.setItem('portalForSignIn', portal);
      toast.success(`A sign-in link has been sent to ${email}.`);
      setEmail('');
    } catch (error) {
      console.error('Email link error:', error);
      toast.error('Failed to send sign-in link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            <Link to="/" className="text-indigo-600 hover:text-indigo-700">LATHI</Link>
          </h1>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Access Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure and easy sign-in for users and admins.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          <div className="mb-6">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setPortal('user')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${portal === 'user' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  User Portal
                </button>
                <button
                  onClick={() => setPortal('admin')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${portal === 'admin' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Admin Portal
                </button>
              </div>
            </div>
            <form className="space-y-6" onSubmit={handleEmailLinkSignIn}>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 px-4 disabled:opacity-60"
                >
                  {isLoading ? 'Sending Link...' : 'Continue with Email'}
                </button>
              </div>
            </form>

            {portal === 'user' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    <FcGoogle className="h-5 w-5 mr-3" />
                    {isLoading ? 'Please wait...' : 'Sign in with Google'}
                  </button>
                </div>
              </>
            )}
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-600">
          <p>
            By signing in, you agree to our {' '}
            <Link to="/terms" className="font-medium text-indigo-600 hover:underline">Terms of Service</Link>
            {' '}&{' '}
            <Link to="/privacy" className="font-medium text-indigo-600 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
