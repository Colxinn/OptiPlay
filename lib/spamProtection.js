// Email validation and spam detection
const disposableEmailDomains = new Set([
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
  'mailinator.com', 'trashmail.com', 'getnada.com', 'temp-mail.org',
  'yopmail.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.biz', 'guerrillamail.de',
  'spam4.me', 'tmails.net', 'mohmal.com', 'emailondeck.com'
]);

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Length checks
  if (email.length > 254) return false;
  if (email.length < 5) return false;
  
  return true;
}

export function isDisposableEmail(email) {
  if (!email) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return disposableEmailDomains.has(domain);
}

export function containsSuspiciousPatterns(email) {
  if (!email) return false;
  
  const suspicious = [
    /[0-9]{10,}/, // Too many consecutive numbers
    /(.)\1{5,}/, // Same character repeated 6+ times
    /^[a-z]{30,}@/, // Username too long with just random letters
  ];
  
  return suspicious.some(pattern => pattern.test(email));
}

export function isSpamEmail(email) {
  if (!isValidEmail(email)) return true;
  if (isDisposableEmail(email)) return true;
  if (containsSuspiciousPatterns(email)) return true;
  
  return false;
}

export function sanitizeUsername(username) {
  if (!username || typeof username !== 'string') return '';
  
  // Remove non-alphanumeric except underscore and hyphen
  username = username.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // Limit length
  username = username.substring(0, 20);
  
  // Must be at least 3 characters
  if (username.length < 3) return '';
  
  return username;
}

export function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 20) return false;
  
  // Only alphanumeric, underscore, hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) return false;
  
  // Must start with letter or number
  if (!/^[a-zA-Z0-9]/.test(username)) return false;
  
  // Check for spam patterns
  if (/(.)\1{4,}/.test(username)) return false; // Same char repeated 5+ times
  if (/^[a-z]{15,}$/.test(username)) return false; // Too long random letters
  
  return true;
}
