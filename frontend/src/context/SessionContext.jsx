import { createContext, useContext, useState } from 'react';
import { login as loginRequest } from '../api/auth';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  // QR codes point to e.g. https://gharbhoj.in/?table=5
  const [table] = useState(() => new URLSearchParams(window.location.search).get('table') || '5');
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => Boolean(localStorage.getItem('gb_token')));
  const [myOrderId, setMyOrderId] = useState(() => localStorage.getItem('gb_order'));

  const login = async (credentials) => {
    const { token } = await loginRequest(credentials);
    localStorage.setItem('gb_token', token);
    setIsAdmin(true);
  };
  const logout = () => { localStorage.removeItem('gb_token'); setIsAdmin(false); };
  const rememberOrder = (id) => {
    if (id) localStorage.setItem('gb_order', id); else localStorage.removeItem('gb_order');
    setMyOrderId(id);
  };

  const value = { table, welcomeOpen, openWelcome: () => setWelcomeOpen(true), closeWelcome: () => setWelcomeOpen(false), isAdmin, login, logout, myOrderId, rememberOrder };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
