import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('Starting app initialization...');

const container = document.getElementById('root');
console.log('Root container:', container);

if (!container) {
  console.error('Root element not found!');
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

const renderApp = () => {
  console.log('About to render app...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
};

try {
  renderApp();
} catch (error) {
  console.error('Error rendering app:', error);
  // Render a fallback UI
  root.render(
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      <pre style={{ textAlign: 'left', margin: '20px', padding: '10px', background: '#f5f5f5' }}>
        {error instanceof Error ? error.stack : ''}
      </pre>
    </div>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
