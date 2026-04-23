class AuthService {
  constructor() {
    this.userKey = 'cyberdeck_current_user';
    this.usersDatabaseKey = 'cyberdeck_registered_users';
  }

  getRegisteredUsers() {
    const users = localStorage.getItem(this.usersDatabaseKey);
    return users ? JSON.parse(users) : [];
  }

  async register(email, username) {
    const users = this.getRegisteredUsers();
    const cleanName = username.trim().toUpperCase();

    // REGEL: "JOKER" ist bereits vergeben oder Name existiert schon
    if (cleanName === "JOKER" || users.some(u => u.username === cleanName)) {
      throw new Error("IDENTITY_CONFLICT: Agent name already claimed in global archives.");
    }

    const newUser = { email: email.toLowerCase(), username: cleanName };
    users.push(newUser);
    localStorage.setItem(this.usersDatabaseKey, JSON.stringify(users));
    
    return this.login(email);
  }

  async login(email) {
    const users = this.getRegisteredUsers();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      throw new Error("UNKNOWN_AGENT: Identity not found. Register first.");
    }

    const userData = {
      name: user.username,
      email: user.email,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem(this.userKey, JSON.stringify(userData));
    return userData;
  }

  getCurrentUser() {
    const saved = localStorage.getItem(this.userKey);
    return saved ? JSON.parse(saved) : null;
  }

  logout() {
    localStorage.removeItem(this.userKey);
  }
}

export const authService = new AuthService();