'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { ThemePref, applyTheme } from '@/lib/themes';
import { getJSON } from '@/lib/client';

type Ctx = {
  theme: ThemePref;
  view: string;
  setView: (v: string) => void;
  updateTheme: (patch: Partial<ThemePref>) => void;
};
const ThemeContext = createContext<Ctx>({ theme: {}, view: 'cover', setView: () => {}, updateTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemePref>({});
  const [view, setView] = useState('cover');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load saved theme once
  useEffect(() => { getJSON('/api/theme').then((t) => { if (t && typeof t === 'object') setTheme(t); }).catch(() => {}); }, []);

  // re-apply whenever the theme or the active page changes
  useEffect(() => { applyTheme(theme, view); }, [theme, view]);

  const updateTheme = useCallback((patch: Partial<ThemePref>) => {
    setTheme(prev => {
      const next = { ...prev, ...patch, perPage: { ...(prev.perPage || {}), ...(patch.perPage || {}) } };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch('/api/theme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(() => {});
      }, 400);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, view, setView, updateTheme }}>{children}</ThemeContext.Provider>;
}
