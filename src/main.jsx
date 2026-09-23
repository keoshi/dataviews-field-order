import React from 'react';
import { createRoot } from 'react-dom/client';

// Tokens first, then the component stylesheets that consume them.
import '@wordpress/theme/design-tokens.css';
import '@wordpress/components/build-style/style.css';
import '@wordpress/dataviews/build-style/style.css';

import './styles/page.css';
import './styles/properties.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
