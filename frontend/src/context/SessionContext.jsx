import { createContext, useContext, useState } from 'react';
import { login as loginRequest } from '../api/auth';
import { clearCache } from '../hooks/cache';
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  // QR codes point to e.g. https://gharbhoj.in/?table=5
  const [table] = useState(() => new URLSearchParams(window.location.search).get('table') || '5');
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => Boolean(localStorage.getItem('gb_token')));

  // Each browser tab maintains its own customer's order.
const [myOrderId, setMyOrderId] = useState(
  () => sessionStorage.getItem('gb_order')
);

const rememberOrder = (id) => {
  if (id) {
    sessionStorage.setItem('gb_order', id);
  } else {
    sessionStorage.removeItem('gb_order');
  }

  // Remove the old shared order reference.
  localStorage.removeItem('gb_order');

  setMyOrderId(id);
};

  const login = async (credentials) => {
    const { token } = await loginRequest(credentials);
    localStorage.setItem('gb_token', token);
    setIsAdmin(true);
  };
 const logout = () => { localStorage.removeItem('gb_token'); clearCache(); setIsAdmin(false); };
  const value = { table, welcomeOpen, openWelcome: () => setWelcomeOpen(true), closeWelcome: () => setWelcomeOpen(false), isAdmin, login, logout, myOrderId, rememberOrder };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
