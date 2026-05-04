import { supabase } from '../lib/supabase';

export interface ScoreEntry {
  id: string | number;
  username: string;
  score: number;
  game_name?: string;
  created_at?: string;
}

class ScoreService {
  /**
   * Speichert einen Score. 
   * Dank der RLS-Regel "Authenticated_Users_Can_Insert" lässt Supabase 
   * diesen Request nur durch, wenn der User aktuell eingeloggt ist.
   */
  async saveScore(username: string, score: number, gameName: string = 'snake') {
    if (!username) {
      console.error("SCORE_REJECTED: No active agent identity found.");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('highscores')
        .insert([
          { 
            username: username.toUpperCase(), 
            score: score, 
            game_name: gameName 
          }
        ]);

      if (error) {
        // Wenn hier ein 403 kommt, ist der User nicht korrekt eingeloggt
        throw new Error(`DATABASE_REJECTION: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error("Critical Error saving score:", (err as Error).message);
      return null;
    }
  }

  /**
   * Holt das globale Leaderboard.
   * Jeder (auch Gäste im Leaderboard-Tab) darf das lesen.
   */
  async getHighscores(gameName: string = 'snake', limit: number = 10): Promise<ScoreEntry[]> {
    try {
      // Holt mehr Daten aus der DB, um sie lokal nach einzigartigen Usern zu filtern
      const { data, error } = await supabase
        .from('highscores')
        .select('*')
        .eq('game_name', gameName)
        .order('score', { ascending: false })
        .limit(1000); // 1000 reicht völlig für unser Leaderboard-Ranking

      if (error) throw error;
      
      const bestScoresMap = new Map();
      (data || []).forEach(entry => {
        if (entry.username) {
          const uname = entry.username.toUpperCase();
          // Trage den Score ein, wenn es noch keinen gibt ODER wenn dieser höher ist
          if (!bestScoresMap.has(uname) || entry.score > bestScoresMap.get(uname).score) {
            bestScoresMap.set(uname, entry);
          }
        }
      });
      
      // In Array umwandeln und absteigend nach Score sortieren
      const uniqueScores = Array.from(bestScoresMap.values()).sort((a, b) => b.score - a.score);
      
      // Entweder Limit anwenden oder die gesamte gefilterte Liste zurückgeben
      return limit > 0 ? uniqueScores.slice(0, limit) : uniqueScores;
    } catch (err) {
      console.error("Error fetching global scores:", (err as Error).message);
      return [];
    }
  }

  /**
   * Holt nur die Scores des angemeldeten Users.
   */
  async getMyHighscores(username: string, gameName: string = 'snake'): Promise<ScoreEntry[]> {
    if (!username) return [];
    try {
      const { data, error } = await supabase
        .from('highscores')
        .select('*')
        .eq('game_name', gameName)
        .eq('username', username.toUpperCase())
        .order('score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching personal scores:", (err as Error).message);
      return [];
    }
  }
}

export const scoreService = new ScoreService();