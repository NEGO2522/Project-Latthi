import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CartProvider } from './contexts/CartContext';
import { toast } from 'react-toastify';
import Home from './components/Home';
import Login from './auth/Login';
import Items from './components/Items';
import Details from './components/Details';
import Cart from './components/Cart';
import ContactUs from './components/ContactUs';
import Orders from './components/Orders';
import Adress from './components/adress';
import OrderPlaced from './components/Order_placed';
import Delivery from './components/delivery';
import Admin from './components/Admin';
import AdminOrders from './components/AdminOrders';

// Placeholder components for other routes
const Shop = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Shop Page (Coming Soon)</div>;
const Categories = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Categories Page (Coming Soon)</div>;
const About = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">About Us (Coming Soon)</div>;
const PageNotFound = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">404 - Page Not Found</div>;

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // Check if user is admin (email ends with @admin.com or matches specific admin email)
      const adminEmail = user?.email?.toLowerCase();
      const isAdminUser = adminEmail?.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com';
      setIsAdmin(isAdminUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Redirect to admin if user is admin
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
    if (!isAdmin) {
      toast.error('Unauthorized access');
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Protected route that redirects to login if not authenticated
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
    return children;
  };

  // Redirect to admin if admin user tries to access login
  const LoginRoute = () => {
    if (loading) return <div>Loading...</div>;
    if (user) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
    return <Login />;
  };

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/" element={<Home user={user} isAdmin={isAdmin} />} />
            <Route 
              path="/shop" 
              element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/items" 
              element={
                <ProtectedRoute>
                  <Items />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route 
              path="/details/:id" 
              element={
                <ProtectedRoute>
                  <Details />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/delivery" 
              element={
                <ProtectedRoute>
                  <Delivery />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/adress" 
              element={
                <ProtectedRoute>
                  <Adress />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              } 
            />
            <Route 
              path="/order-placed" 
              element={
                <ProtectedRoute>
                  <OrderPlaced />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;