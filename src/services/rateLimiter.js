const RATE_KEY = "pokedex_ai_rate";
const MAX_PER_HOUR = 10;
const MAX_PER_DAY = 30;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function getLog() {
  try {
    return JSON.parse(localStorage.getItem(RATE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLog(log) {
  localStorage.setItem(RATE_KEY, JSON.stringify(log));
}

function pruneOld(log) {
  const cutoff = Date.now() - DAY_MS;
  return log.filter((ts) => ts > cutoff);
}

export function checkRateLimit() {
  const log = pruneOld(getLog());
  const now = Date.now();
  const hourAgo = now - HOUR_MS;

  const countLastHour = log.filter((ts) => ts > hourAgo).length;
  const countLastDay = log.length;

  if (countLastHour >= MAX_PER_HOUR) {
    const oldestInHour = log.filter((ts) => ts > hourAgo).sort()[0];
    const waitMin = Math.ceil((oldestInHour + HOUR_MS - now) / 60000);
    return {
      allowed: false,
      message: `You've used ${MAX_PER_HOUR} AI searches this hour. Try again in ~${waitMin} min!`,
      remaining: 0,
    };
  }

  if (countLastDay >= MAX_PER_DAY) {
    return {
      allowed: false,
      message: `You've used ${MAX_PER_DAY} AI searches today. Come back tomorrow!`,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: Math.min(MAX_PER_HOUR - countLastHour, MAX_PER_DAY - countLastDay),
  };
}

export function recordUsage() {
  const log = pruneOld(getLog());
  log.push(Date.now());
  saveLog(log);
}
