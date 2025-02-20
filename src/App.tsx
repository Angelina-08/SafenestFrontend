import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { EmailVerification } from './pages/EmailVerification';
import { createGlobalStyle } from 'styled-components';
import {
  gray,
  grayDark,
  blue,
  blueDark,
  red,
  redDark,
} from '@radix-ui/colors';
import { AuthProvider } from './context/AuthContext';

const GlobalStyle = createGlobalStyle`
  :root {
    ${gray}
    ${blue}
    ${red}
  }

  @media (prefers-color-scheme: dark) {
    :root {
      ${grayDark}
      ${blueDark}
      ${redDark}
    }
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--gray-1);
  }
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalStyle />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
