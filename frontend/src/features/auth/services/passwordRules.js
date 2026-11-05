export const passwordMeetsPolicy = password => password.length >= 8
  && /[A-Za-z]/.test(password) && /[0-9]/.test(password)
  && new TextEncoder().encode(password).length <= 72;

export const passwordPolicyMessage = 'Use at least 8 characters, including a letter and a number (maximum 72 bytes).';
