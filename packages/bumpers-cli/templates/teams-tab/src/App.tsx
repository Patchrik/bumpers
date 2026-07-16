import TeamsContextPanel from './Components/TeamsContextPanel/TeamsContextPanel.js';

function App() {
  return (
    <div className="container">
      <h1>{{displayName}}</h1>
      <p>Built with React + Vite + Microsoft Teams</p>
      <TeamsContextPanel />
    </div>
  );
}

export default App;
