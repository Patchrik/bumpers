import { Link, Route, Routes } from 'react-router';
import AboutPage from './pages/About.js';
import HomePage from './pages/Home.js';

export default function App() {
  return (
    <>
      <nav className="flex gap-4 border-b p-4">
        <Link to="/" data-testid="{{reactNavHomeTestId}}">
          Home
        </Link>
        <Link to="/about" data-testid="{{reactNavAboutTestId}}">
          About
        </Link>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </>
  );
}
