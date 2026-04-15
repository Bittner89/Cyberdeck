/**
 * Dieser Service kapselt den Zugriff auf die Highscores.
 * Aktuell nutzt er den LocalStorage, kann aber später 
 * einfach auf eine AWS Lambda / Datenbank umgestellt werden.
 */
const SCORE_KEY = 'cyberdeck_snake_highscore';

export const scoreService = {
  // Holt den Highscore
  async getHighscore() {
    // Später: return fetch('/api/highscore').then(r => r.json());
    const saved = localStorage.getItem(SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  },

  // Speichert einen neuen Score, wenn er höher ist als der alte
  async saveScore(newScore) {
    const currentHighscore = await this.getHighscore();
    if (newScore > currentHighscore) {
      localStorage.setItem(SCORE_KEY, newScore.toString());
      return true; // Neuer Rekord
    }
    return false;
  }
};