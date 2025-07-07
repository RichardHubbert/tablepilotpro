import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initEmailService } from './services/emailService'

// Initialize email service
initEmailService();

createRoot(document.getElementById("root")!).render(<App />);
