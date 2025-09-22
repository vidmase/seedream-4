
import React from 'react';

interface UrlInputListProps {
  urls: string[];
  setUrls: (urls: string[]) => void;
}

const UrlInputList: React.FC<UrlInputListProps> = ({ urls, setUrls }) => {
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlInput = () => {
    if (urls.length < 10) {
      setUrls([...urls, '']);
    }
  };

  const removeUrlInput = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">Image URLs (up to 10)</label>
      {urls.map((url, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="flex-grow">
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
            />
          </div>
          {urls.length > 1 && (
             <button
                type="button"
                onClick={() => removeUrlInput(index)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                aria-label="Remove URL"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
              </button>
          )}
        </div>
      ))}
      {urls.length < 10 && (
        <button
          type="button"
          onClick={addUrlInput}
          className="w-full mt-2 text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add another URL
        </button>
      )}
    </div>
  );
};

export default UrlInputList;
