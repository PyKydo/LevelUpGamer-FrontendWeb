export const simpleHash = (value: string): string => {
  if (!value) return '';
  try {
    return btoa(value.split('').reverse().join(''));
  } catch (e) {
    console.error('Fallo el hasheo', e);
    return value;
  }
};
