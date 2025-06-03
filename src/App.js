import React, { useState } from 'react';

// Fixed Homework Content - This will be displayed as is.
const FIXED_HOMEWORK = `
1) Please listen to the MP3 recording at least twice
2) Also, answer the recorded questions
3) Finally, retell the story in English
`;

// Helper function for title case in JavaScript
const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

function App() {
  const [storyName, setStoryName] = useState('');
  const [cartoonName, setCartoonName] = useState('');
  const [rawComments, setRawComments] = useState('');
  const [evaluations, setEvaluations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy All');

  // Function to call YOUR Backend for evaluations
  const generateEvaluations = async () => {
    setLoading(true);
    setError('');
    setEvaluations('');
    setCopyButtonText('Copy All'); // Reset copy button text

    if (!rawComments.trim()) {
      setError("Please enter student comments.");
      setLoading(false);
      return;
    }

    try {
      // --- CHANGE: Call your backend API instead of Gemini directly ---
      // This URL will be your backend server's address.
      // During local development, it might be 'http://localhost:5000/api/generate-evaluations'
      // After deployment, it will be your deployed backend URL.
      const backendApiUrl = '/api/generate-evaluations'; // Relative path for deployment flexibility

      const response = await fetch(backendApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawComments }), // Send only raw comments to backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend error: ${response.status} - ${errorData.message || 'Unknown error from backend'}`);
      }

      const result = await response.json();

      if (result.evaluations) { // Expecting 'evaluations' key from backend
        setEvaluations(result.evaluations);
      } else {
        setError("Failed to generate evaluations. Unexpected response structure from backend.");
      }

    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Backend API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to copy the entire output to clipboard
  const handleCopyAll = () => {
    const fullOutput = `Today's class:
  Story: ${storyName}
  Cartoon: ${cartoonName}

Class performance:
${evaluations}

Today's homework:
${FIXED_HOMEWORK}`;

    const textarea = document.createElement('textarea');
    textarea.value = fullOutput;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    setCopyButtonText('Copied!');
    setTimeout(() => {
      setCopyButtonText('Copy All');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8 font-sans antialiased flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-10 w-full max-w-3xl border border-blue-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-blue-800 mb-8 tracking-tight">
          AI Teacher Assistant 🍎
        </h1>

        <div className="space-y-6 mb-8">
          <div>
            <label htmlFor="storyName" className="block text-lg font-semibold text-gray-700 mb-2">
              Story Name:
            </label>
            <input
              type="text"
              id="storyName"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              value={storyName}
              onChange={(e) => setStoryName(toTitleCase(e.target.value))}
              placeholder="e.g., The Little Red Hen"
            />
          </div>

          <div>
            <label htmlFor="cartoonName" className="block text-lg font-semibold text-gray-700 mb-2">
              Cartoon Name:
            </label>
            <input
              type="text"
              id="cartoonName"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              value={cartoonName}
              onChange={(e) => setCartoonName(toTitleCase(e.target.value))}
              placeholder="e.g., Tom and Jerry"
            />
          </div>

          <div>
            <label htmlFor="rawComments" className="block text-lg font-semibold text-gray-700 mb-2">
              Student Comments (Name: raw comment, one per line):
            </label>
            <textarea
              id="rawComments"
              rows="8"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-y"
              value={rawComments}
              onChange={(e) => setRawComments(e.target.value)}
              placeholder={`Example:\nJohn: knew a lot, very active.\nSarah: was quiet, needs to speak more.`}
            ></textarea>
          </div>

          <button
            onClick={generateEvaluations}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Generate Evaluations & Homework'
            )}
          </button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
        </div>

        {evaluations && (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 text-center">
              Today's Class Summary
            </h2>

            <div className="mb-6">
              <p className="text-lg text-gray-700 mb-2"><strong className="text-blue-800">Story:</strong> {storyName}</p>
              <p className="text-lg text-gray-700"><strong className="text-blue-800">Cartoon:</strong> {cartoonName}</p>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-blue-700 mb-4">Class Performance:</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8 shadow-inner text-gray-800 leading-relaxed whitespace-pre-wrap">
              {evaluations}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-blue-700 mb-4">Today's Homework:</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-inner text-gray-800 leading-relaxed whitespace-pre-wrap">
              {FIXED_HOMEWORK}
            </div>

            {/* Copy All Button */}
            <button
              onClick={handleCopyAll}
              className="mt-6 w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              {copyButtonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
