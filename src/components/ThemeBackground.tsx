import React, { useMemo } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import StarBackground from './StarBackground';

const ThemeBackground: React.FC = () => {
  const { theme } = useThemeStore();

  const content = useMemo(() => {
    if (theme === 'light') {
      return <div className="absolute inset-0 bg-slate-50" />;
    }
    return <StarBackground />;
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500 bg-black">
      {content}
    </div>
  );
};

export default ThemeBackground;
