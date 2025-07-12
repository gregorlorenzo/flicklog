'use client';
import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ThemeToggleSwitch() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-9 w-9 rounded-md bg-muted" />;
    }

    const isDark = theme === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                'h-9 w-9 rounded-md transition-colors duration-200 ease-in-out',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-transform duration-200 ease-in-out" />
            ) : (
                <Moon className="h-4 w-4 transition-transform duration-200 ease-in-out" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}