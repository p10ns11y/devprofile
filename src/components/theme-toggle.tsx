
'use client';

import { useTheme } from './theme-provider';
import { Button } from './ui/button';
import { Sun, Moon, Monitor, Eye } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dim');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dim':
        return <Eye className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const nextTheme = theme === 'light' ? 'dim' : 'light';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-9 h-9 p-0 cursor-pointer"
      title={`Switch to ${nextTheme} theme`}
      aria-label={`Switch to ${nextTheme} theme`}
    >
      {getIcon()}
    </Button>
  );
}