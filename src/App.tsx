import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo Section */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <a
            href="https://vitejs.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <img
              src={viteLogo}
              className="h-24 w-24 drop-shadow-lg"
              alt="Vite logo"
            />
          </a>
          <a
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <img
              src={reactLogo}
              className="h-24 w-24 animate-spin-slow drop-shadow-lg"
              alt="React logo"
            />
          </a>
        </div>

        {/* Title Section */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Vite + React + <span className="text-blue-600">TypeScript</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Welcome to your new React application built with Vite and Tailwind CSS
        </p>

        {/* Counter Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Count is {count}
          </button>
          <p className="text-gray-600 mt-4 text-sm">
            Click the button to test state management
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-800 rounded-full p-1 mt-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-700 text-sm">
              Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">src/App.tsx</code> and save to test HMR
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-green-100 text-green-800 rounded-full p-1 mt-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-700 text-sm">
              Click on the Vite and React logos to learn more
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Built with ❤️ using Vite, React, TypeScript & Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App