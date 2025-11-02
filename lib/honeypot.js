// Honeypot anti-bot protection
// This creates hidden fields that humans won't fill but bots will

export function generateHoneypotField() {
  return {
    name: 'website', // Common field bots try to fill
    label: 'Website', // Looks legitimate to bots
    className: 'hidden absolute -left-[9999px]', // Hidden from humans
    tabIndex: -1,
    autoComplete: 'off',
    ariaHidden: true,
  };
}

export function isHoneypotFilled(data) {
  // If the honeypot field has any value, it's a bot
  return !!(data.website || data.url || data.phone_number || data.company);
}

// Time-based protection: submissions too fast are likely bots
const formStartTimes = new Map();

export function recordFormStart(identifier) {
  formStartTimes.set(identifier, Date.now());
  
  // Cleanup old entries
  setTimeout(() => {
    formStartTimes.delete(identifier);
  }, 600000); // 10 minutes
}

export function isSubmissionTooFast(identifier, minSeconds = 3) {
  const startTime = formStartTimes.get(identifier);
  if (!startTime) return false; // No record, allow it
  
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  return elapsedSeconds < minSeconds;
}

// Browser fingerprinting check
export function validateBrowserHeaders(headers) {
  const userAgent = headers.get('user-agent');
  const acceptLanguage = headers.get('accept-language');
  const accept = headers.get('accept');
  
  // No user agent = likely bot
  if (!userAgent) return false;
  
  // Check for common bot patterns
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /scrape/i,
    /curl/i, /wget/i, /python/i, /java/i,
    /phantom/i, /headless/i
  ];
  
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) return false;
  }
  
  // Real browsers send accept-language
  if (!acceptLanguage) return false;
  
  // Real browsers send accept headers
  if (!accept) return false;
  
  return true;
}

// Challenge-response system
const challenges = new Map();

export function generateChallenge() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;
  const id = Math.random().toString(36).substring(7);
  
  challenges.set(id, {
    answer,
    created: Date.now(),
  });
  
  // Cleanup after 5 minutes
  setTimeout(() => {
    challenges.delete(id);
  }, 300000);
  
  return {
    id,
    question: `What is ${num1} + ${num2}?`,
  };
}

export function validateChallenge(id, answer) {
  const challenge = challenges.get(id);
  if (!challenge) return false;
  
  // Challenge expired (5 minutes)
  if (Date.now() - challenge.created > 300000) {
    challenges.delete(id);
    return false;
  }
  
  const isCorrect = parseInt(answer) === challenge.answer;
  challenges.delete(id); // One-time use
  
  return isCorrect;
}
