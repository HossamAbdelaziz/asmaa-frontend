import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';

// ✅ ADD THIS BLOCK RIGHT BEFORE RENDER
console.log("🔥 UserAgent:", navigator.userAgent);

if (window.Capacitor?.isNativePlatform) {
  document.body.classList.add("capacitor-android");
  console.log("✅ Capacitor detected — native app mode");
} else {
  console.log("❌ Capacitor NOT detected — running in browser");
}



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
