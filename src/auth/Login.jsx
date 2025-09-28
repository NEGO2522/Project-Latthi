import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, googleProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithPopup } from '../firebase/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            
            const authedEmail = (result?.user?.email || '').toLowerCase();
            if (authedEmail === ADMIN_EMAIL) {
              navigate('/admin');
            } else {
              const returnUrl = location.state?.from || '/';
              navigate(returnUrl);
            }
            toast.success('Successfully signed in!');
          })
          .catch((error) => {
            console.error('Sign-in error', error);
            toast.error('Error signing in. Please try again.');
          });
      }
    }
  }, [navigate, location]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const authedEmail = (result?.user?.email || '').toLowerCase();
      if (authedEmail === ADMIN_EMAIL) {
        navigate('/admin');
      } else {
        const returnUrl = location.state?.from || '/';
        navigate(returnUrl);
      }
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

    setIsLoading(true);
    try {
      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', normalizedEmail);
      toast.success(
        <div className='flex items-center'>
          <FaPaperPlane className='mr-2' />
          <span>A sign-in link has been sent to {email}.</span>
        </div>
      );
      setEmail('');
    } catch (error) {
      console.error('Email link error:', error);
      toast.error('Failed to send sign-in link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 m-4">
        <div className="text-center mb-8">
        <Link to="/">
          <img src="/assets/Logo.png" alt="LATHI Logo" className="mx-auto h-12 w-auto"/>
        </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to LATHI
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleEmailLinkSignIn}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <div className="relative rounded-md shadow-sm">
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
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              {isLoading ? 'Sending Link...' : 'Continue with Email'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              <FcGoogle className="h-5 w-5 mr-3" />
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <Link to="/terms_conditions" className="font-medium text-indigo-600 hover:underline">Terms of Service</Link>
            {' and '}
            <Link to="/privacy_policy" className="font-medium text-indigo-600 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
