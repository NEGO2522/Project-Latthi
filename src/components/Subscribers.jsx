import { useState, useEffect } from 'react';
import { database, ref, onValue } from '../firebase/firebase';
import { Link, useLocation } from 'react-router-dom';
import { FiMail, FiClock, FiBox, FiUsers, FiHome, FiClipboard, FiMenu, FiX } from 'react-icons/fi';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const subscribersRef = ref(database, 'subscribers');
    const unsubscribe = onValue(subscribersRef, (snapshot) => {
      const data = snapshot.val();
      const loadedSubscribers = [];
      for (const key in data) {
        loadedSubscribers.push({
          id: key,
          ...data[key]
        });
      }
      loadedSubscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));
      setSubscribers(loadedSubscribers);
      setLoading(false);
    }, (error) => {
        console.error('Error fetching subscribers:', error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const SideNav = () => (
    <aside className={`bg-white shadow-lg p-4 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:w-64 md:flex-shrink-0 z-40 fixed md:sticky top-0 h-full`}>
        <div className="flex justify-end md:hidden mb-8">
            <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <FiX className="h-6 w-6 text-gray-700" />
            </button>
        </div>
        <nav className="space-y-2">
            <SideNavLink to="/admin" icon={<FiBox className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>Products</SideNavLink>
            <SideNavLink to="/admin/orders" icon={<FiClipboard className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>Orders</SideNavLink>
            <SideNavLink to="/admin/subscribers" icon={<FiUsers className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>Subscribers</SideNavLink>
            <SideNavLink to="/" icon={<FiHome className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>Back to Home</SideNavLink>
        </nav>
    </aside>
  );

  const SideNavLink = ({ to, icon, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200 ${location.pathname === to ? 'bg-indigo-100 text-indigo-700 font-semibold' : ''}`}>
      {icon}
      <span className="ml-3">{children}</span>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
        <div className={`fixed inset-0 bg-blur bg-opacity-50 z-30 md:hidden ${isMenuOpen ? 'block' : 'hidden'}`} onClick={() => setIsMenuOpen(false)}></div>
        <SideNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
            <header className="flex items-center justify-between mb-8 md:hidden">
                <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                    <FiMenu size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Subscribers</h1>
            </header>
            <div className="hidden md:block mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Subscribers</h1>
                <p className="mt-2 text-gray-600">List of users subscribed to the newsletter.</p>
            </div>

            {subscribers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <FiMail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No subscribers yet</h3>
                <p className="mt-1 text-gray-500">When someone subscribes, their email will appear here.</p>
            </div>
            ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                    <li key={subscriber.id}>
                    <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                            {subscriber.email}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Subscribed
                            </p>
                        </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                            <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {new Date(subscriber.subscribedAt).toLocaleString()}
                            </p>
                        </div>
                        </div>
                    </div>
                    </li>
                ))}
                </ul>
            </div>
            )}
        </main>
    </div>
  );
};

export default Subscribers;
