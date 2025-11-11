import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/global.css';
import './styles/variables.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

