import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/hind-siliguri/bengali-400.css';
import '@fontsource/hind-siliguri/bengali-600.css';
import '@fontsource-variable/manrope/wght.css';
import './styles.css';
import './experience.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
