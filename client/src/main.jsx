import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from '../context/AuthContext.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';
import { SocketProvider } from '../context/SocketContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QuizProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
          <SocketProvider>
            <App />
          </SocketProvider>
        </GoogleOAuthProvider>
      </QuizProvider>
    </AuthProvider>
  </StrictMode>
);

