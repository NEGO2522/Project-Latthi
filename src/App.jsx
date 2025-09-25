import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import CartProvider from './contexts/CartContext';
import { useCart } from './hooks/useCart';
import { toast } from 'react-toastify';
import Home from './components/Home';
import Login from './auth/Login';
import Items from './components/Items';
import Details from './components/Details';
import Cart from './components/Cart';
import ContactUs from './components/ContactUs';
import Orders from './components/Orders';
import Adress from './components/Adress';
import OrderPlaced from './components/Order_placed';
import Delivery from './components/Delivery';
import Admin from './components/Admin';
import AdminOrders from './components/AdminOrders';
import Subscribers from './components/Subscribers';
import Shipping from './components/Shipping';
import PrivacyPolicy from './components/Privacy_Policy';
import TermsConditions from './components/Terms_Conditions';
import CancellationRefund from './components/Cancellation_Refund';
import TopLine from './components/TopLine';
import Navbar from './components/Navbar';
import Feedback from './components/Feedback';
import AdminFeedback from './components/AdminFeedback';

const Shop = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Shop Page (Coming Soon)</div>;
const Categories = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Categories Page (Coming Soon)</div>;
const About = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">About Us (Coming Soon)</div>;
const PageNotFound = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold">400 - Page Not Found</div>;

const Message = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
      {message}
    </div>
  );
};

const Layout = ({ children, user, isAdmin }) => {
  const { message } = useCart();
  const location = useLocation();
  const showNav = location.pathname !== '/items';

  return (
    <>
      <Message message={message} />
      {showNav && <TopLine />}
      {showNav && <Navbar user={user} isAdmin={isAdmin} />}
      <main className={showNav ? 'pt-5' : ''}>{children}</main>
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const adminEmail = user?.email?.toLowerCase();
      const isAdminUser = adminEmail?.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com';
      setIsAdmin(isAdminUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const AdminRoute = ({ children }) => {
    const location = useLocation();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (!isAdmin) {
      toast.error('Unauthorized access');
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const LoginRoute = () => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (user) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
    return <Login />;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <CartProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout user={user} isAdmin={isAdmin}>
          <div className="min-h-screen flex flex-col">
            <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/" element={<Home user={user} isAdmin={isAdmin} />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/items" element={<Items />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/details/:id" element={<Details />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/adress" element={<Adress />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/new" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
              <Route path="/admin/subscribers" element={<AdminRoute><Subscribers /></AdminRoute>} />
              <Route path="/admin/feedback" element={<AdminRoute><AdminFeedback /></AdminRoute>} />
              <Route path="/order-placed" element={<OrderPlaced />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/privacy_policy" element={<PrivacyPolicy />} />
              <Route path="/terms_conditions" element={<TermsConditions />} />
              <Route path="/cancellation_refund" element={<CancellationRefund />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </div>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
