const DIGIT_MAP = {
  "0": "o",
  "1": "i",
  "2": "z",
  "3": "e",
  "4": "a",
  "5": "s",
  "6": "g",
  "7": "t",
  "8": "b",
  "9": "g",
};

const BANNED_TERMS = [
  "nigger",
  "nigga",
  "faggot",
  "fagot",
  "kike",
  "spic",
  "chink",
  "gook",
  "wetback",
  "beaner",
  "porchmonkey",
  "porchmonky",
  "coon",
  "tranny",
  "retard",
];

function normalizeForReview(input) {
  if (!input) return "";
  let normalized = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  normalized = normalized
    .split("")
    .map((char) => (DIGIT_MAP[char] ? DIGIT_MAP[char] : char))
    .join("");

  return normalized.replace(/[^a-z]/g, "");
}

export function containsBannedLanguage(input) {
  const normalized = normalizeForReview(input);
  if (!normalized) return false;
  return BANNED_TERMS.some((term) => normalized.includes(term));
}

const ONION_REGEX = /\.onion\b/i;

export function containsOnionAddress(input) {
  return ONION_REGEX.test(input || "");
}

export function breakWebProtocols(input) {
  if (!input) return "";
  return input.replace(/\bhttps?:\/\//gi, (match) => match.replace(":", "[:]"));
}

export function ensureCleanContent(value, { allowLinks = false } = {}) {
  if (containsBannedLanguage(value)) {
    throw new Error("Blocked language detected.");
  }
  if (!allowLinks && containsOnionAddress(value)) {
    throw new Error(".onion links are not allowed.");
  }
  return allowLinks ? value : breakWebProtocols(value);
}

export function assertCleanUsername(value) {
  if (containsBannedLanguage(value)) {
    throw new Error("Username contains blocked language.");
  }
}

export default {
  containsBannedLanguage,
  containsOnionAddress,
  breakWebProtocols,
  ensureCleanContent,
  assertCleanUsername,
};
