import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

console.log('Spectra App: Initializing...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL: Could not find root element with id 'root'");
  // Fallback: create root if it's missing for some reason
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.log('Created missing root element');
}

try {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
  console.log('Spectra App: Mounted successfully');
} catch (error) {
  console.error('Spectra App: Failed to mount', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;"><h3>Application Error</h3><p>${error}</p></div>`;
}