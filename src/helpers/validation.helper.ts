// uso del modulo 11 (algoritmo de validación del digito verificador)
export const validateModule11 = (body: string, checkDigit: string): boolean => {
  let sum = 0;
  let multiple = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiple;
    multiple = multiple < 7 ? multiple + 1 : 2;
  }

  const expectedCheckDigit = 11 - (sum % 11);
  let dvChar;

  if (expectedCheckDigit === 11) {
    dvChar = '0';
  } else if (expectedCheckDigit === 10) {
    dvChar = 'K';
  } else {
    dvChar = expectedCheckDigit.toString();
  }

  return checkDigit.toUpperCase() === dvChar;
};

export const validateRun = (run: string): boolean => {
  if (!run) return false;

  const runClean = run.replace(/[^0-9kK]/g, '').toUpperCase();
  
  const match = runClean.match(/^([0-9]{7,8})([0-9K])$/);
  if (!match) return false;

  const [, body, dv] = match;
  
  return validateModule11(body, dv);
};

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) return false;
  const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
  return allowedDomains.some(domain => email.endsWith(domain));
};

export const validatePassword = (password: string, options: { min: number; max: number }): boolean => {
  if (!password) return false;
  return password.length >= options.min && password.length <= options.max;
};

export const validateAge = (birthdateString: string, minAge: number = 18): boolean => {
  if (!birthdateString) return false;
  const birthdate = new Date(birthdateString);
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age >= minAge;
};

export const validateLength = (value: string, options: { min: number; max: number }): boolean => {
  if (!value) return false;
  return value.length >= options.min && value.length <= options.max;
};