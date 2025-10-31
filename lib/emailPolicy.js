const defaultAllowed = (
  process.env.ALLOWED_EMAIL_DOMAINS ||
  [
    "gmail.com",
    "googlemail.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "msn.com",
    "yahoo.com",
    "ymail.com",
    "icloud.com",
    "me.com",
    "proton.me",
    "protonmail.com",
    "aol.com",
    "comcast.net",
    "zoho.com",
  ].join(",")
)
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const disposableDomains = new Set(
  [
    "10minutemail.com",
    "10minutemail.net",
    "10minutemail.org",
    "guerrillamail.com",
    "guerrillamailblock.com",
    "sharklasers.com",
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
    "mailinator.com",
    "mailinator.net",
    "mailinator.org",
    "trashmail.com",
    "temp-mail.org",
    "temp-mail.io",
    "tempmail.dev",
    "dispostable.com",
    "moakt.com",
    "minuteinbox.com",
    "1secmail.com",
  ]
    .concat((process.env.BLOCKED_EMAIL_DOMAINS || "").split(","))
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
);

function getDomain(email) {
  const at = String(email || "").lastIndexOf("@");
  if (at === -1) return "";
  return email.slice(at + 1).toLowerCase();
}

export function isDisposableDomain(domain) {
  return disposableDomains.has(domain);
}

export function isAllowedConsumerDomain(domain) {
  const allowed = new Set(defaultAllowed);
  return allowed.has(domain);
}

export function shouldAllowEmail(email) {
  const domain = getDomain(email);
  if (!domain) return false;

  // Block known disposable domains first
  if (isDisposableDomain(domain)) return false;

  // If custom domains are allowed, skip consumer allowlist check
  const allowCustom = /^true$/i.test(process.env.ALLOW_CUSTOM_EMAIL_DOMAINS || "false");
  if (allowCustom) return true;

  // Only allow popular consumer providers by default
  return isAllowedConsumerDomain(domain);
}

export default { shouldAllowEmail, isDisposableDomain, isAllowedConsumerDomain };
