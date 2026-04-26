import { supabase } from '../lib/supabase';

class ScoreService {
  /**
   * Speichert einen Score. 
   * Dank der RLS-Regel "Authenticated_Users_Can_Insert" lässt Supabase 
   * diesen Request nur durch, wenn der User aktuell eingeloggt ist.
   */
  async saveScore(username, score, gameName = 'snake') {
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
            score: parseInt(score), 
            game_name: gameName 
          }
        ]);

      if (error) {
        // Wenn hier ein 403 kommt, ist der User nicht korrekt eingeloggt
        throw new Error(`DATABASE_REJECTION: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error("Critical Error saving score:", err.message);
      return null;
    }
  }

  /**
   * Holt das globale Leaderboard.
   * Jeder (auch Gäste im Leaderboard-Tab) darf das lesen.
   */
  async getHighscores(gameName = 'snake', limit = 10) {
    try {
      const { data, error } = await supabase
        .from('highscores')
        .select('*')
        .eq('game_name', gameName)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching global scores:", err.message);
      return [];
    }
  }

  /**
   * Holt nur die Scores des angemeldeten Users.
   */
  async getMyHighscores(username, gameName = 'snake') {
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
      console.error("Error fetching personal scores:", err.message);
      return [];
    }
  }
}

export const scoreService = new ScoreService();