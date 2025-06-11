import React, { useState, useEffect } from 'react';
import { Star, X, Sun, Moon, Upload, User, Image } from 'lucide-react';

interface FeedbackFormProps {
  onClose?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose }) => {
  const [name, setName] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>('');

  const ratingLabels = ['Terrible', 'Poor', 'Average', 'Good', 'Amazing'];

  // Initialize theme based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const validateFile = (file: File): string => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a JPG or PNG image file only.';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB.';
    }

    return '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        setProfilePicture(null);
        e.target.value = '';
      } else {
        setProfilePicture(file);
      }
    } else {
      setProfilePicture(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('rating', rating.toString());
      formData.append('comment', comment.trim());
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await fetch('https://n8n-agentur.ki-business-agenten.de/webhook-test/ac01d1d7-10cd-4250-8643-ed885a9363f9', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          if (onClose) {
            onClose();
          } else {
            // Reset form after success message
            setIsSubmitted(false);
            setName('');
            setRating(0);
            setComment('');
            setProfilePicture(null);
            setFileError('');
            // Reset file input
            const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const removeFile = () => {
    setProfilePicture(null);
    setFileError('');
    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 text-center transition-colors duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank you!</h2>
            <p className="text-gray-600 dark:text-gray-300">Your feedback has been submitted successfully.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative transition-colors duration-300">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Close Button (if onClose is provided) */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Share your feedback
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Rate your experience
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-3">
              <label 
                htmlFor="name" 
                className="block text-lg font-medium text-gray-900 dark:text-white"
              >
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-lg p-2"
                    aria-label={`Rate ${star} stars - ${ratingLabels[star - 1]}`}
                  >
                    <Star
                      size={32}
                      className={`transition-colors duration-200 ${
                        star <= rating
                          ? 'text-purple-500 fill-purple-500'
                          : 'text-gray-300 dark:text-gray-600 hover:text-purple-400 dark:hover:text-purple-400'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Rating Labels */}
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 px-2">
                {ratingLabels.map((label, index) => (
                  <span
                    key={label}
                    className={`transition-colors duration-200 ${
                      rating === index + 1 ? 'text-purple-600 dark:text-purple-400 font-medium' : ''
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Comment Field */}
            <div className="space-y-3">
              <label 
                htmlFor="comment" 
                className="block text-lg font-medium text-gray-900 dark:text-white"
              >
                Comment <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your message"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none"
              />
            </div>

            {/* Profile Picture Upload */}
            <div className="space-y-3">
              <label 
                htmlFor="profilePicture" 
                className="block text-lg font-medium text-gray-900 dark:text-white"
              >
                Upload a profile picture <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
              </label>
              
              {!profilePicture ? (
                <label
                  htmlFor="profilePicture"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">JPG or PNG (Max 5MB)</p>
                  </div>
                  <input
                    id="profilePicture"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Image className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">
                        {profilePicture.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(profilePicture.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    aria-label="Remove file"
                  >
                    <X size={16} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}

              {fileError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{fileError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                rating === 0 || isSubmitting
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;