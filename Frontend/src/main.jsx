import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// #region agent log
fetch("http://127.0.0.1:7242/ingest/9681846e-5185-4c8d-b254-1ffe62866ff5", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        location: "src/main.jsx",
        message: "Main entry executed",
        data: { file: "Frontend/src/main.jsx", timestamp: Date.now() },
        timestamp: Date.now(),
    }),
}).catch(() => {});
// #endregion

createRoot(document.getElementById('root')).render(
    <App />
)
