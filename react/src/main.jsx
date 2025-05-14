// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App'; // ✅ Import your App component

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> {/* ✅ Render the App component that includes LoadingProvider and RouterProvider */}
  </StrictMode>,
);
