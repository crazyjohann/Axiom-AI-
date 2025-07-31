// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; // Import your main App component from app.jsx
import './index.css'; // Assuming you have a global CSS file for Tailwind or other styles

// Get the root element from your public/index.html
const rootElement = document.getElementById('root');

// Create a React root and render your App component
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
