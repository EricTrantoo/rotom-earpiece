import { useState } from 'react';
import { DamageCalculator } from './damage/DamageCalculator';
import { TeamBuilder } from './team/TeamBuilder';
import { BattleTracker } from './battle/BattleTracker';

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
      {tab === 'damage-calculator' && <DamageCalculator />}
      {tab === 'team-builder' && <TeamBuilder />}
      {tab === 'battle-tracker' && <BattleTracker />}
    </div>
  );
}
