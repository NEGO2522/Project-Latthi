import { useState, useEffect } from 'react';
import { database, ref, onValue } from '../firebase/firebase';
import { FiMail, FiClock } from 'react-icons/fi';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Subscribers</h1>
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
      </div>
    </div>
  );
};

export default Subscribers;
