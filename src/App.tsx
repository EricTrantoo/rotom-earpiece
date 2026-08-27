import { useState } from 'react';

type Tab = 'damage-calculator' | 'team-builder' | 'battle-tracker';

export function App() {
  const [tab, setTab] = useState<Tab>('damage-calculator');

  return (
    <div>
      <h1>Rotom Earpiece</h1>
      <nav>
        <button onClick={() => setTab('damage-calculator')}>Damage Calculator</button>
        <button onClick={() => setTab('team-builder')}>Team Builder</button>
        <button onClick={() => setTab('battle-tracker')}>Battle Tracker</button>
      </nav>
      {tab === 'damage-calculator' && <p>Damage Calculator coming soon.</p>}
      {tab === 'team-builder' && <p>Team Builder coming soon.</p>}
      {tab === 'battle-tracker' && <p>Battle Tracker coming soon.</p>}
    </div>
  );
}
