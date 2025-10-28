export const simpleHash = (value: string): string => {
  if (!value) return '';
  try {
    return btoa(value.split('').reverse().join(''));
  } catch (e) {
    console.error('Failed to hash value', e);
    return value;
  }
};
