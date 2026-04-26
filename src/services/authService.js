import { supabase } from '../lib/supabase';

class AuthService {
  // LOGIN
  async login(email, password) {
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
      .single();

    const userData = {
      id: data.user.id,
      name: profile?.username || 'Unknown_Agent',
      email: data.user.email
    };
    
    localStorage.setItem('cyberdeck_user', JSON.stringify(userData));
    return userData;
  }

  async register(email, password, username) {
  // 1. Auth Signup
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  // Wenn der Error 422 hier kommt, liegt es an den Supabase-Email-Settings!
  if (authError) throw new Error(`AUTH_ERROR: ${authError.message}`);

  if (authData.user) {
    // 2. Profil erstellen
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: authData.user.id, 
          username: username.toUpperCase(), 
          email: email 
        }
      ]);

    if (profileError) {
      console.error("Profile Insert Error:", profileError);
      throw new Error(`PROFILE_ERROR: ${profileError.message}`);
    }
  }

  return this.login(email, password);
}

  getCurrentUser() {
    const saved = localStorage.getItem('cyberdeck_user');
    return saved ? JSON.parse(saved) : null;
  }

  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('cyberdeck_user');
  }
}

export const authService = new AuthService();