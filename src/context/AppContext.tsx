import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { audioService } from '../services/audioService';
import { SIDEBAR_ITEMS } from '../menuConfig';

interface AppContextType {
  user: string | null;
  currentView: string;
  sidebarIndex: number;
  setSidebarIndex: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  isMuted: boolean;
  login: (userName: string) => void;
  logout: () => void;
  navigate: (view: string) => void;
  changeVolume: (val: number) => void;
  toggleMute: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_VOLUME = 0.12;

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('login');
  const [sidebarIndex, setSidebarIndex] = useState(0);
  const [volume, setVolume] = useState((audioService.volume || DEFAULT_VOLUME) * 100);
  const [isMuted, setIsMuted] = useState(audioService.isMuted);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser.name);
      setCurrentView('menu');
      setSidebarIndex(0);
    }
  }, []);

  const login = useCallback((userName: string) => {
    setUser(userName);
    setCurrentView('menu');
    setSidebarIndex(0);
    audioService.playFX('confirm');
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setCurrentView('login');
  }, []);

  const navigate = useCallback((view: string) => {
    setCurrentView(view);
    const idx = SIDEBAR_ITEMS.findIndex(item => item.id === view);
    if (idx !== -1) setSidebarIndex(idx);
    audioService.playFX('confirm');
  }, []);

  const changeVolume = useCallback((val: number) => {
    setVolume(val);
    audioService.setMasterVolume(val / 100);
  }, []);

  const toggleMute = useCallback(() => {
    const m = !isMuted;
    setIsMuted(m);
    audioService.setMuted(m);
  }, [isMuted]);

  return (
    <AppContext.Provider value={{ user, currentView, sidebarIndex, setSidebarIndex, volume, isMuted, login, logout, navigate, changeVolume, toggleMute }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};