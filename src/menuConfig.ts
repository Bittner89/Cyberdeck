export interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

export const SIDEBAR_ITEMS: MenuItem[] = [
  { id: 'menu', label: 'DASHBOARD', icon: '◰' },
  { id: 'snake', label: 'NEURAL_SNAKE', icon: 'S' },
  { id: 'tetris', label: 'BLOCK_ENCRYPT', icon: 'T' }, 
  { id: 'leaderboard', label: 'HIGHSCORES', icon: '🏆' },
  { id: 'settings', label: 'SYSTEM_CFG', icon: 'C' },
];

export interface DashboardOption extends MenuItem {
  desc: string;
}

export const DASHBOARD_OPTIONS: DashboardOption[] = [
  { id: 'snake', label: 'NEURAL_SNAKE', desc: 'Hack into the grid. Collect data fragments.', icon: '▰' },
  { id: 'tetris', label: 'BLOCK_ENCRYPT', desc: 'Defragment neural layers. Secure the sector.', icon: 'max' },
  { id: 'leaderboard', label: 'GLOBAL_ARCHIVE', desc: 'See who currently dominates the net.', icon: '▱' }
];