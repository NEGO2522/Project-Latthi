import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup } from '../firebase/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const ADMIN_EMAIL = 'cottonfab0001@gmail.com';
  const navigate = useNavigate();
  const location = useLocation();

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


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 m-4">
        <div className="text-center mb-8">
          <Link to="/">
            <img 
              src={`${window.location.protocol}//${window.location.host}/assets/Logo.png`} 
              alt="LATHI Logo" 
              className="mx-auto h-12 w-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to LATHI
          </p>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-600">Sign in with your Google account to continue</p>
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

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <Link to="/terms_conditions" className="font-medium text-indigo-600 hover:underline">
              Terms of Service
            </Link>
            {' and '}
            <Link to="/privacy_policy" className="font-medium text-indigo-600 hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;