import { supabase } from '../lib/supabase';

export interface UserData {
  id: string;
  name: string;
  email?: string;
}

class AuthService {
  // LOGIN
  async login(email: string, password: string): Promise<UserData> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    // Profil laden, um den Agent-Namen zu bekommen
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', data.user.id)
      .maybeSingle();

    const userData = {
      id: data.user.id,
      name: profile?.username || 'Unknown_Agent',
      email: data.user.email
    };
    
    localStorage.setItem('cyberdeck_user', JSON.stringify(userData));
    return userData;
  }

  // REGISTER
  async register(email: string, password: string, username: string): Promise<UserData> {
  // 1. Auth Signup
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username // <-- Hier wird der Wunschname an den Datenbank-Trigger übergeben!
      }
    }
  });

  // Wenn der Error 422 hier kommt, liegt es an den Supabase-Email-Settings!
  if (authError) throw new Error(`AUTH_ERROR: ${authError.message}`);

  return this.login(email, password);
}

  // GET CURRENT USER
  getCurrentUser(): UserData | null {
    const saved = localStorage.getItem('cyberdeck_user');
    return saved ? JSON.parse(saved) : null;
  }

  // LOGOUT
  async logout() {
    // Fehler bei signOut (wie 403 nach Account-Löschung) fangen und ignorieren wir absichtlich
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Logout_Notice: Session already terminated.");
    }
    
    localStorage.removeItem('cyberdeck_user');
  }

  // DELETE ACCOUNT
  async deleteAccount(): Promise<void> {
    // 1. Ruft die sichere Postgres-Funktion auf, die wir in Supabase per SQL erstellt haben
    const { error } = await supabase.rpc('delete_user');
    if (error) throw new Error(error.message);

    // 2. Lokalen Storage leeren und Session beenden
    await this.logout();
  }
}

export const authService = new AuthService();