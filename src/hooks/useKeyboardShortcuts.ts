import { useEffect } from 'react';

type ShortcutHandler = () => void;

interface ShortcutMap {
    [key: string]: ShortcutHandler;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const isCtrlCmd = e.ctrlKey || e.metaKey;

            if (isCtrlCmd && shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [shortcuts]);
}