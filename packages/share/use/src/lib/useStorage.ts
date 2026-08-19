import { useState, useEffect, useCallback } from 'react';

type StorageType = 'local' | 'session';

export function useStorage<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = 'local',
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // 1. Obtener la instancia del storage según el tipo
  const getStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return storageType === 'local'
      ? window.localStorage
      : window.sessionStorage;
  }, [storageType]);

  // 2. Leer el valor inicial desde el Storage o usar el valor por defecto
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const storage = getStorage();
      if (!storage) return initialValue;

      const item = storage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(
        `Error reading key "${key}" from ${storageType}Storage:`,
        error,
      );
      return initialValue;
    }
  });

  // 3. Función para actualizar el valor en React y en el Storage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const storage = getStorage();
        setStoredValue((prevValue) => {
          // Soporta actualización por valor o por función callback: setValue(prev => ...)
          const valueToStore =
            value instanceof Function ? value(prevValue) : value;

          if (storage) {
            storage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.error(
          `Error saving key "${key}" to ${storageType}Storage:`,
          error,
        );
      }
    },
    [key, getStorage, storageType],
  );

  // 4. Función para remover el elemento del Storage
  const removeValue = useCallback(() => {
    try {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(
        `Error deleting key "${key}" from ${storageType}Storage:`,
        error,
      );
    }
  }, [key, getStorage, initialValue, storageType]);

  // 5. Escuchar cambios de otras pestañas (Solo aplica para localStorage)
  useEffect(() => {
    if (storageType !== 'local' || typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setStoredValue(
            event.newValue ? JSON.parse(event.newValue) : initialValue,
          );
        } catch {
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, storageType]);

  return [storedValue, setValue, removeValue];
}
