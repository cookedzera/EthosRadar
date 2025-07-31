import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="backdrop-blur-xl bg-white/10 light:bg-black/25 border border-white/20 light:border-white/10 rounded-lg p-3 shadow-lg hover:bg-white/15 light:hover:bg-black/35 transition-all duration-300 group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Moon className="h-5 w-5 text-slate-700 light:text-slate-300 group-hover:text-slate-600 light:group-hover:text-slate-200 transition-colors duration-300" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
      )}
    </button>
  );
}