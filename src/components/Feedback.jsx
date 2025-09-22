import { useState } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getDatabase, ref, push } from 'firebase/database';
import { auth } from '../firebase/firebase';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }

    if (comment.trim() === '') {
      toast.error('Please enter a comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const db = getDatabase();
      const feedbackRef = ref(db, 'feedback');
      await push(feedbackRef, {
        userId: user ? user.uid : 'anonymous',
        email: user ? user.email : 'anonymous',
        rating,
        comment,
        createdAt: new Date().toISOString(),
      });

      toast.success('Thank you for your feedback!');
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Share Your Feedback</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-700 mb-2 text-center">Rate your experience</p>
              <div className="flex justify-center items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="comment" className="block text-lg font-medium text-gray-700 mb-2">Your comments</label>
              <textarea
                id="comment"
                rows="5"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                placeholder="Tell us how we can improve..."
              ></textarea>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                  isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-700'
                }`}
              >
                <FiSend className="mr-2 -ml-1 w-5 h-5" />
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
