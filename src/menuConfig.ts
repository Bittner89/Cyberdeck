export interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

export const SIDEBAR_ITEMS: MenuItem[] = [
  { id: 'menu', label: 'DASHBOARD', icon: '◰' },
  { id: 'snake', label: 'NEURAL_SNAKE', icon: 'S' },
  { id: 'tetris', label: 'BLOCK_ENCRYPT', icon: 'T' }, 
  { id: 'spaceinvaders', label: 'ALIEN_THREAT', icon: 'A' },
  { id: 'breakout', label: 'FIREWALL_BREACH', icon: 'B' },
  { id: 'leaderboard', label: 'HIGHSCORES', icon: '🏆' },
  { id: 'settings', label: 'SYSTEM_CFG', icon: 'C' },
];

export interface DashboardOption extends MenuItem {
  desc: string;
}

export const DASHBOARD_OPTIONS: DashboardOption[] = [
  { id: 'snake', label: 'NEURAL_SNAKE', desc: 'Hack into the grid. Collect data fragments.', icon: '▰' },
  { id: 'tetris', label: 'BLOCK_ENCRYPT', desc: 'Defragment neural layers. Secure the sector.', icon: 'max' },
  { id: 'spaceinvaders', label: 'ALIEN_THREAT', desc: 'Defend the system from external anomalies.', icon: '👾' },
  { id: 'breakout', label: 'FIREWALL_BREACH', desc: 'Smash through ICE barriers. Recover locked data.', icon: '🛡️' }
];