// OG Badge System - November 2-26, 2025 Early Adopter Program
// Users who sign up during this period get lifetime premium features

const OG_PROGRAM_START = new Date('2025-11-02T00:00:00Z');
const OG_PROGRAM_END = new Date('2025-11-26T23:59:59Z');

/**
 * Check if current date is within OG badge eligibility period
 */
export function isOGEligibleNow() {
  const now = new Date();
  return now >= OG_PROGRAM_START && now <= OG_PROGRAM_END;
}

/**
 * Get OG badge data for new user creation
 */
export function getOGBadgeData() {
  if (isOGEligibleNow()) {
    return {
      isOG: true,
      ogGrantedAt: new Date(),
    };
  }
  return {
    isOG: false,
    ogGrantedAt: null,
  };
}

/**
 * Check if a user qualifies for OG status based on creation date
 */
export function userQualifiesForOG(createdAt) {
  const created = new Date(createdAt);
  return created >= OG_PROGRAM_START && created <= OG_PROGRAM_END;
}

export default {
  isOGEligibleNow,
  getOGBadgeData,
  userQualifiesForOG,
  OG_PROGRAM_START,
  OG_PROGRAM_END,
};
