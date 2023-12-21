import { useState } from 'react';

export const useLocalStorageWatcher = (key: string, initialValue: string): [string, (value: string) => void] => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            return JSON.parse(window.localStorage.getItem(key) as string) || initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value: string) => {
        try {
            console.log('set value', value);
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
            window.dispatchEvent(new Event('localStorageChange'));
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue || initialValue, setValue];
};
