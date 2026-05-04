import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { audioService } from '../services/audioService';
import { SIDEBAR_ITEMS } from '../menuConfig';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [sidebarIndex, setSidebarIndex] = useState(0);
  const [volume, setVolume] = useState((audioService.volume || 0.12) * 100);
  const [isMuted, setIsMuted] = useState(audioService.isMuted);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser.name);
      setCurrentView('menu');
      setSidebarIndex(0);
    }
  }, []);

  const login = useCallback((userName) => {
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

  const navigate = useCallback((view) => {
    setCurrentView(view);
    const idx = SIDEBAR_ITEMS.findIndex(item => item.id === view);
    if (idx !== -1) setSidebarIndex(idx);
    audioService.playFX('confirm');
  }, []);

  const changeVolume = useCallback((val) => {
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

export const useAppContext = () => useContext(AppContext);