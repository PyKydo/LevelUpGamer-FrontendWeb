import { reportError } from "./logging.helper";

export const getLocalStorageItem = <T>(
  key: string,
  defaultValue: T | null = null
): T | null => {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
  } catch (error) {
    reportError(`storage:get:${key}`, error);
    return defaultValue;
  }
};

export const setLocalStorageItem = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    reportError(`storage:set:${key}`, error);
  }
};

export const removeLocalStorageItem = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    reportError(`storage:remove:${key}`, error);
  }
};
