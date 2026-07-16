import { createRoot } from 'react-dom/client';
import Root from './Root.js';
import './App.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Root />);
}
