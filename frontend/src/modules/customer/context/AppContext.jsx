import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../../../utils/storage';
import { userAPI } from '../../../api/user.api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // ── Auth State ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedCity, setSelectedCity] = useState(storage.getUser()?.city || 'Golaghat');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getToken();
      if (!token) {
        setAuthStatus('unauthenticated');
        return;
      }

      try {
        const { user: profile } = await userAPI.getProfile();
        setUser(profile);
        setAuthStatus('authenticated');
        if (profile.city) setSelectedCity(profile.city);
        storage.setUser(profile);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        storage.clearAuth();
        setAuthStatus('unauthenticated');
      }
    };

    initAuth();
  }, []);

  // ── Data refresh helpers ───────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { user: profile } = await userAPI.getProfile();
      setUser(profile);
      storage.setUser(profile);
      if (profile.city) setSelectedCity(profile.city);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const refreshUnread = useCallback(() => {
    // Note: getUnreadCount depends on merchant/customer logic which might need refinement
    // For now, keeping it simple as we transition to backend
  }, []);

  // ── Auth actions ───────────────────────────────────────────────────────────
  const login = useCallback((userData) => {
    setUser(userData);
    setAuthStatus('authenticated');
    setSelectedCity(userData.city || 'Golaghat');
  }, []);

  const logout = useCallback(() => {
    storage.clearAuth();
    setUser(null);
    setAuthStatus('unauthenticated');
  }, []);

  const value = {
    // Auth
    user,
    authStatus,
    isLoggedIn: authStatus === 'authenticated',
    login,
    logout,
    refreshUser,

    // UI
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,

    // Notifications
    unreadCount,
    refreshUnread,

    // Data helpers
    getOffers: () => { console.warn('getOffers from context is deprecated. Use offerAPI directly.'); return []; },
    getMerchants: () => { console.warn('getMerchants from context is deprecated. Use merchantAPI directly.'); return []; },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export default AppContext;
