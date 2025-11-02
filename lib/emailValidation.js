// Advanced email validation with extensive checks
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// Comprehensive disposable email domains list
const disposableEmailDomains = new Set([
  // Common disposable services
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
  'mailinator.com', 'trashmail.com', 'getnada.com', 'temp-mail.org',
  'yopmail.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.biz', 'guerrillamail.de',
  'spam4.me', 'tmails.net', 'mohmal.com', 'emailondeck.com',
  
  // Additional disposable services
  'mintemail.com', 'jetable.org', 'throwawaymail.com', 'tempinbox.com',
  'guerrillamailblock.com', 'pokemail.net', 'spamgourmet.com', 'mailnesia.com',
  'mailcatch.com', 'mytemp.email', 'dropmail.me', 'tempmail.net',
  'incognitomail.com', 'anonymousemail.me', 'emailfake.com', 'emailtemporanea.com',
  'bouncr.com', 'binkmail.com', 'bobmail.info', 'anonbox.net',
  'chammy.info', 'deadaddress.com', 'dontreg.com', 'e4ward.com',
  'emeil.in', 'emeil.ir', 'emailmiser.com', 'emailsensei.com',
  'emailwarden.com', 'enterto.com', 'expressemail.info', 'filzmail.com',
  'fivemail.de', 'freundin.ru', 'getairmail.com', 'get-mail.cf',
  'getonemail.com', 'ghosttexter.de', 'girlsundertheinfluence.com', 'gishpuppy.com',
  'great-host.in', 'guerillamail.net', 'guerrillamail.org', 'h8s.org',
  'harakirimail.com', 'hatespam.org', 'hidemail.de', 'inbox.si',
  'ieatspam.eu', 'ieatspam.info', 'iheartspam.org', 'imails.info',
  'inboxalias.com', 'inboxclean.com', 'inboxclean.org', 'incognitomail.org',
  'insorg-mail.info', 'ipoo.org', 'irish2me.com', 'iwi.net',
  'kaspop.com', 'klzlk.com', 'kulturbetrieb.info', 'kurzepost.de',
  'letthemeatspam.com', 'lhsdv.com', 'link2mail.net', 'litedrop.com',
  'lol.ovpn.to', 'lookugly.com', 'lopl.co.cc', 'lortemail.dk',
  'lr78.com', 'maboard.com', 'mail-temporaire.fr', 'mail.by',
  'mail.mezimages.net', 'mail2rss.org', 'mail333.com', 'mail4trash.com',
  'mailbidon.com', 'mailbiz.biz', 'mailblocks.com', 'mailbucket.org',
  'mailcat.biz', 'mailcatch.com', 'mailde.de', 'mailde.info',
  'maildrop.cc', 'maileater.com', 'mailexpire.com', 'mailfa.tk',
  'mailforspam.com', 'mailfree.ga', 'mailfree.gq', 'mailfree.ml',
  'mailfreeonline.com', 'mailguard.me', 'mailhazard.com', 'mailhazard.us',
  'mailhz.me', 'mailimate.com', 'mailin8r.com', 'mailinater.com',
  'mailinator.net', 'mailinator.org', 'mailinator2.com', 'mailincubator.com',
  'mailismagic.com', 'mailme.ir', 'mailme.lv', 'mailme24.com',
  'mailmetrash.com', 'mailmoat.com', 'mailms.com', 'mailnator.com',
  'mailnesia.com', 'mailnull.com', 'mailorg.org', 'mailpick.biz',
  'mailproxsy.com', 'mailquack.com', 'mailrock.biz', 'mailsac.com',
  'mailscrap.com', 'mailseal.de', 'mailshell.com', 'mailsiphon.com',
  'mailslapping.com', 'mailslite.com', 'mailtemp.info', 'mailtome.de',
  'mailtothis.com', 'mailtrash.net', 'mailtv.net', 'mailtv.tv',
  'mailzilla.com', 'mailzilla.org', 'makemetheking.com', 'manybrain.com',
  'mbx.cc', 'mega.zik.dj', 'meinspamschutz.de', 'meltmail.com',
  'messagebeamer.de', 'mezimages.net', 'ministry-of-silly-walks.de', 'mintemail.com',
  'mobileninja.co.uk', 'moburl.com', 'moncourrier.fr.nf', 'monemail.fr.nf',
  'monmail.fr.nf', 'msa.minsmail.com', 'mt2009.com', 'mt2014.com',
  'mycard.net.ua', 'mycleaninbox.net', 'myemailboxy.com', 'mymail-in.net',
  'mymailoasis.com', 'mynetstore.de', 'mypacks.net', 'mypartyclip.de',
  'myphantomemail.com', 'mysamp.de', 'mytempemail.com', 'mytempmail.com',
  'mytrashmail.com', 'nabuma.com', 'neomailbox.com', 'nepwk.com',
  'nervmich.net', 'nervtmich.net', 'netmails.com', 'netmails.net',
  'netzidiot.de', 'neverbox.com', 'nicknassar.com', 'nincsmail.hu',
  'nmail.cf', 'no-spam.ws', 'noblepioneer.com', 'nomail.pw',
  'nomail.xl.cx', 'nomail2me.com', 'nomorespamemails.com', 'nospam.ze.tc',
  'nospam4.us', 'nospamfor.us', 'nospamthanks.info', 'notmailinator.com',
  'nowhere.org', 'nowmymail.com', 'nurfuerspam.de', 'nus.edu.sg',
  'objectmail.com', 'obobbo.com', 'odnorazovoe.ru', 'oneoffemail.com',
  'onewaymail.com', 'online.ms', 'oopi.org', 'opayq.com',
  'ordinaryamerican.net', 'otherinbox.com', 'ovpn.to', 'owlpic.com',
  'pancakemail.com', 'pcusers.otherinbox.com', 'pjjkp.com', 'plexolan.de',
  'poczta.onet.pl', 'politikerclub.de', 'poofy.org', 'pookmail.com',
  'privacy.net', 'privatdemail.net', 'proxymail.eu', 'prtnx.com',
  'putthisinyourspamdatabase.com', 'pwrby.com', 'qq.com', 'quickinbox.com',
  'quickmail.nl', 'qvy.me', 'rcpt.at', 're-gister.com',
  'reallymymail.com', 'realtyalerts.ca', 'recode.me', 'recursor.net',
  'reliable-mail.com', 'rhyta.com', 'rmqkr.net', 'royal.net',
  's0ny.net', 'safe-mail.net', 'safersignup.de', 'safetymail.info',
  'safetypost.de', 'sandelf.de', 'saynotospams.com', 'schafmail.de',
  'schrott-email.de', 'secretemail.de', 'secure-mail.biz', 'secure-mail.cc',
  'selfdestructingmail.com', 'senseless-entertainment.com', 'sharklasers.com', 'shieldemail.com',
  'shiftmail.com', 'shitmail.me', 'shitmail.org', 'shitware.nl',
  'shmeriously.com', 'shortmail.net', 'sibmail.com', 'sinnlos-mail.de',
  'slapsfromlastnight.com', 'slaskpost.se', 'slopsbox.com', 'slowslow.net',
  'smashmail.de', 'smellfear.com', 'smtp99.com', 'snakemail.com',
  'sneakemail.com', 'sneakmail.de', 'snkmail.com', 'sofimail.com',
  'sofort-mail.de', 'sofortmail.de', 'softpls.asia', 'sogetthis.com',
  'soodonims.com', 'spam.la', 'spam.su', 'spam4.me',
  'spamail.de', 'spamarrest.com', 'spambob.com', 'spambob.net',
  'spambob.org', 'spambog.com', 'spambog.de', 'spambog.ru',
  'spambox.info', 'spambox.irishspringrealty.com', 'spambox.us', 'spamcannon.com',
  'spamcannon.net', 'spamcero.com', 'spamcon.org', 'spamcorptastic.com',
  'spamcowboy.com', 'spamcowboy.net', 'spamcowboy.org', 'spamday.com',
  'spamex.com', 'spamfree.eu', 'spamfree24.com', 'spamfree24.de',
  'spamfree24.eu', 'spamfree24.info', 'spamfree24.net', 'spamfree24.org',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org', 'spamherelots.com',
  'spamhereplease.com', 'spamhole.com', 'spamify.com', 'spaminator.de',
  'spamkill.info', 'spaml.com', 'spaml.de', 'spammotel.com',
  'spamobox.com', 'spamoff.de', 'spamslicer.com', 'spamspot.com',
  'spamthis.co.uk', 'spamthisplease.com', 'spamtrail.com', 'spamtroll.net',
  'speed.1s.fr', 'spoofmail.de', 'stuffmail.de', 'super-auswahl.de',
  'supergreatmail.com', 'supermailer.jp', 'superrito.com', 'superstachel.de',
  'suremail.info', 'sweetxxx.de', 'tafmail.com', 'teewars.org',
  'teleworm.com', 'teleworm.us', 'temp-mail.com', 'temp-mail.de',
  'temp-mail.org', 'temp-mail.ru', 'tempail.com', 'tempalias.com',
  'tempe-mail.com', 'tempemail.biz', 'tempemail.co.za', 'tempemail.com',
  'tempemail.net', 'tempinbox.co.uk', 'tempinbox.com', 'tempmail.eu',
  'tempmail.it', 'tempmail2.com', 'tempmaildemo.com', 'tempmailer.com',
  'tempmailer.de', 'tempomail.fr', 'temporarily.de', 'temporarioemail.com.br',
  'temporaryemail.net', 'temporaryemail.us', 'temporaryforwarding.com', 'temporaryinbox.com',
  'temporarymailaddress.com', 'tempthe.net', 'thanksnospam.info', 'thankyou2010.com',
  'thc.st', 'thatim.info', 'thecloudindex.com', 'thisisnotmyrealemail.com',
  'thismail.net', 'throwawayemailaddress.com', 'tilien.com', 'tittbit.in',
  'tizi.com', 'tmailinator.com', 'tmail.ws', 'toiea.com',
  'tokenmail.de', 'toomail.biz', 'topranklist.de', 'tradermail.info',
  'trash-amil.com', 'trash-mail.at', 'trash-mail.com', 'trash-mail.de',
  'trash2009.com', 'trashemail.de', 'trashmail.at', 'trashmail.com',
  'trashmail.de', 'trashmail.me', 'trashmail.net', 'trashmail.org',
  'trashmail.ws', 'trashmailer.com', 'trashymail.com', 'trashymail.net',
  'trialmail.de', 'trickmail.net', 'trillianpro.com', 'tryalert.com',
  'tualias.com', 'turual.com', 'twinmail.de', 'tyldd.com',
  'uggsrock.com', 'umail.net', 'uroid.com', 'us.af',
  'venompen.com', 'veryrealemail.com', 'viditag.com', 'viralplays.com',
  'vpn.st', 'vsimcard.com', 'vubby.com', 'wasteland.rfc822.org',
  'webemail.me', 'webm4il.info', 'weg-werf-email.de', 'wegwerf-emails.de',
  'wegwerfadresse.de', 'wegwerfemail.com', 'wegwerfemail.de', 'wegwerfmail.de',
  'wegwerfmail.info', 'wegwerfmail.net', 'wegwerfmail.org', 'wetrainbayarea.com',
  'wetrainbayarea.org', 'wh4f.org', 'whatiaas.com', 'whatpaas.com',
  'whatsaas.com', 'whopy.com', 'wilemail.com', 'willselfdestruct.com',
  'winemaven.info', 'wronghead.com', 'www.e4ward.com', 'www.mailinator.com',
  'wwwnew.eu', 'xagloo.com', 'xemaps.com', 'xents.com',
  'xmaily.com', 'xoxy.net', 'yapped.net', 'yaqp.com',
  'yep.it', 'yogamaven.com', 'yomail.info', 'yopmail.com',
  'yopmail.fr', 'yopmail.net', 'yourdomain.com', 'yuurok.com',
  'z1p.biz', 'za.com', 'zehnminuten.de', 'zehnminutenmail.de',
  'zetmail.com', 'zippymail.info', 'zoaxe.com', 'zoemail.com',
  'zomg.info', 'zxcv.com', 'zxcvbnm.com', 'zzz.com',
]);

// Suspicious domain patterns
const suspiciousDomainPatterns = [
  /^mail[0-9]+\./, // mail123.com
  /^temp/, // tempxyz.com
  /^trash/, // trashmail.com
  /^spam/, // spambox.com
  /^fake/, // fakeemail.com
  /^disposable/, // disposable.com
  /^throwaway/, // throwaway.com
  /\d{5,}/, // domains with 5+ numbers
  /^[a-z]{20,}\./, // very long random domain names
];

// Check if email domain has valid MX records (actual implementation)
export async function hasValidMXRecords(email) {
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  try {
    const mxRecords = await resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch {
    return false; // Domain doesn't exist or has no MX records
  }
}

export function isDisposableEmail(email) {
  if (!email) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  // Check exact match
  if (disposableEmailDomains.has(domain)) return true;
  
  // Check patterns
  for (const pattern of suspiciousDomainPatterns) {
    if (pattern.test(domain)) return true;
  }
  
  return false;
}

export function containsSuspiciousPatterns(text) {
  if (!text) return false;
  
  const suspicious = [
    /[0-9]{15,}/, // Too many consecutive numbers
    /(.)\1{6,}/, // Same character repeated 7+ times
    /^[a-z]{40,}@/, // Username way too long
    /[^a-zA-Z0-9@._-]/, // Non-standard characters
    /^[0-9]+@/, // Username is only numbers
    /(admin|root|test|user|demo|spam|temp|fake|null|void)[0-9]{5,}/, // Common spam patterns
  ];
  
  return suspicious.some(pattern => pattern.test(text));
}

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) return false;
  
  // Length checks
  if (email.length > 254) return false;
  if (email.length < 5) return false;
  
  const [localPart, domain] = email.split('@');
  
  // Local part checks
  if (localPart.length > 64) return false;
  if (localPart.length < 1) return false;
  
  // Domain checks
  if (domain.length > 253) return false;
  if (domain.length < 3) return false;
  
  // Must have at least one dot in domain
  if (!domain.includes('.')) return false;
  
  // TLD must be at least 2 characters
  const tld = domain.split('.').pop();
  if (tld.length < 2) return false;
  
  return true;
}

export async function isSpamEmail(email) {
  if (!isValidEmail(email)) return true;
  if (isDisposableEmail(email)) return true;
  if (containsSuspiciousPatterns(email)) return true;
  
  // Check MX records (comment out if too slow)
  // const hasValidMX = await hasValidMXRecords(email);
  // if (!hasValidMX) return true;
  
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
  if (/(.)\1{5,}/.test(username)) return false; // Same char repeated 6+ times
  if (/^[a-z]{20,}$/.test(username)) return false; // Too long random letters
  if (/^[0-9]+$/.test(username)) return false; // Only numbers
  if (/^(admin|root|test|user|demo|spam|temp|fake|mod|moderator|owner|null|undefined|void)[0-9]*$/i.test(username)) return false; // Reserved words
  
  return true;
}

// Additional: Check for similar usernames (potential spam variants)
export function isSimilarUsername(username, existingUsernames) {
  const normalized = username.toLowerCase().replace(/[_-]/g, '');
  
  for (const existing of existingUsernames) {
    const existingNormalized = existing.toLowerCase().replace(/[_-]/g, '');
    
    // Exact match after normalization
    if (normalized === existingNormalized) return true;
    
    // Levenshtein distance < 2 (very similar)
    if (levenshteinDistance(normalized, existingNormalized) < 2) return true;
  }
  
  return false;
}

function levenshteinDistance(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  return track[str2.length][str1.length];
}
