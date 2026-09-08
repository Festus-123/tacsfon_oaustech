interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60000);

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 10 * 60 * 1000 // 10 minutes default
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetAt <= now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}
