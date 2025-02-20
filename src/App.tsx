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
import { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

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

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <GlobalStyle />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
