// IP reputation and blacklist management
const blacklistedIPs = new Set();
const suspiciousIPs = new Map(); // IP -> { count, lastSeen }
const ipHistory = new Map(); // IP -> array of timestamps

// Known VPN/Proxy/Datacenter IP ranges (simplified - in production use a service)
const suspiciousIPRanges = [
  /^10\./, // Private network
  /^192\.168\./, // Private network  
  /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private network
  /^127\./, // Localhost
];

export function isBlacklistedIP(ip) {
  return blacklistedIPs.has(ip);
}

export function blacklistIP(ip, reason = 'spam') {
  blacklistedIPs.add(ip);
  console.log(`⚠️ IP ${ip} blacklisted: ${reason}`);
  
  // Auto-unblacklist after 24 hours
  setTimeout(() => {
    blacklistedIPs.delete(ip);
    console.log(`✓ IP ${ip} removed from blacklist`);
  }, 86400000); // 24 hours
}

export function isSuspiciousIP(ip) {
  // Check if in private/local range
  for (const range of suspiciousIPRanges) {
    if (range.test(ip)) return true;
  }
  
  return false;
}

export function trackIPActivity(ip, action) {
  if (!ipHistory.has(ip)) {
    ipHistory.set(ip, []);
  }
  
  const history = ipHistory.get(ip);
  history.push({ timestamp: Date.now(), action });
  
  // Keep only last 100 actions
  if (history.length > 100) {
    history.shift();
  }
  
  // Cleanup old data
  setTimeout(() => {
    const recentHistory = history.filter(h => Date.now() - h.timestamp < 3600000);
    if (recentHistory.length === 0) {
      ipHistory.delete(ip);
    } else {
      ipHistory.set(ip, recentHistory);
    }
  }, 3600000); // 1 hour
}

export function isIPAbusive(ip) {
  const history = ipHistory.get(ip);
  if (!history) return false;
  
  const now = Date.now();
  const last5Minutes = history.filter(h => now - h.timestamp < 300000);
  const last1Hour = history.filter(h => now - h.timestamp < 3600000);
  
  // More than 20 actions in 5 minutes = abusive
  if (last5Minutes.length > 20) {
    blacklistIP(ip, 'Too many requests in 5 minutes');
    return true;
  }
  
  // More than 100 actions in 1 hour = abusive
  if (last1Hour.length > 100) {
    blacklistIP(ip, 'Too many requests in 1 hour');
    return true;
  }
  
  // Check for rapid-fire registration attempts
  const registrations = history.filter(h => h.action === 'register' && now - h.timestamp < 300000);
  if (registrations.length > 3) {
    blacklistIP(ip, 'Multiple registration attempts');
    return true;
  }
  
  return false;
}

export function getIPReputation(ip) {
  if (isBlacklistedIP(ip)) return 'blacklisted';
  if (isSuspiciousIP(ip)) return 'suspicious';
  if (isIPAbusive(ip)) return 'abusive';
  
  const history = ipHistory.get(ip);
  if (!history || history.length < 5) return 'new';
  
  return 'trusted';
}

// Clean up old data periodically
setInterval(() => {
  const now = Date.now();
  
  for (const [ip, history] of ipHistory.entries()) {
    const recentHistory = history.filter(h => now - h.timestamp < 3600000);
    if (recentHistory.length === 0) {
      ipHistory.delete(ip);
    } else {
      ipHistory.set(ip, recentHistory);
    }
  }
}, 600000); // Clean up every 10 minutes
