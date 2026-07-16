import { Link, Route, Switch } from 'wouter';
import AboutPage from './pages/About.js';
import HomePage from './pages/Home.js';

export default function App() {
  return (
    <>
      <nav className="flex gap-4 border-b p-4">
        <Link href="/" data-testid="{{reactNavHomeTestId}}">
          Home
        </Link>
        <Link href="/about" data-testid="{{reactNavAboutTestId}}">
          About
        </Link>
      </nav>
      <main className="p-4">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
        </Switch>
      </main>
    </>
  );
}
