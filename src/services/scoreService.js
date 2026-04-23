const LOCAL_STORAGE_KEY = 'cyberdeck_snake_highscores';

class ScoreService {
  /**
   * GLOBAL: Holt alle Einträge (von jedem)
   */
  async getHighscores() {
    try {
      const scores = localStorage.getItem(LOCAL_STORAGE_KEY);
      return scores ? JSON.parse(scores).sort((a, b) => b.score - a.score) : [];
    } catch (error) {
      console.error("Fehler beim Laden der Scores:", error);
      return [];
    }
  }

  /**
   * PERSONAL: Filtert die globalen Scores nach dem Usernamen
   */
  async getMyHighscores(username) {
    if (!username) return [];
    const allScores = await this.getHighscores();
    // Filtert alle Einträge, die dem aktuell eingeloggten Namen entsprechen
    return allScores.filter(s => s.username.toLowerCase() === username.toLowerCase());
  }

  /**
   * Speichert einen neuen Score
   */
  async saveScore(username, score) {
    const newEntry = {
      id: Date.now().toString(),
      username: username || 'GHOST',
      score: score,
      date: new Date().toISOString()
    };

    try {
      const currentScores = await this.getHighscores();
      currentScores.push(newEntry);
      
      // Wir speichern die Top 100, damit man in der persönlichen Liste auch ältere Scores sieht
      const sortedScores = currentScores.sort((a, b) => b.score - a.score).slice(0, 100);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sortedScores));
      return sortedScores;
    } catch (error) {
      console.error("Fehler beim Speichern des Scores:", error);
      return [];
    }
  }
}

export const scoreService = new ScoreService();