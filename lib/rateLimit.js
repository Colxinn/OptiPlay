// Simple in-memory rate limiter
const rateLimitMap = new Map();

export function rateLimit(identifier, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  const record = rateLimitMap.get(key);

  if (now > record.resetTime) {
    // Reset the window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { 
      success: false, 
      remaining: 0,
      resetTime: record.resetTime 
    };
  }

  record.count += 1;
  rateLimitMap.set(key, record);
  return { success: true, remaining: limit - record.count };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function strictRateLimit(identifier, limit = 3, windowMs = 300000) {
  // Stricter limit for signup/auth endpoints
  return rateLimit(identifier, limit, windowMs);
}
