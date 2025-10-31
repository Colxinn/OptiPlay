import prisma from "@/lib/prisma";

export async function refreshMuteStatus(userId) {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isMuted: true,
      muteExpiresAt: true,
      mutedAt: true,
      mutedReason: true,
      mutedByEmail: true,
    },
  });
  if (!user) return null;

  if (user.isMuted && user.muteExpiresAt && user.muteExpiresAt <= new Date()) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          isMuted: false,
          mutedAt: null,
          mutedReason: null,
          mutedByEmail: null,
          muteExpiresAt: null,
        },
      }),
      prisma.userMuteAudit.create({
        data: {
          userId: user.id,
          action: "auto_unmute",
          reason: "Mute expired automatically.",
        },
      }),
    ]);
    return {
      ...user,
      isMuted: false,
      muteExpiresAt: null,
      mutedAt: null,
      mutedReason: null,
      mutedByEmail: null,
    };
  }
  return user;
}

export function relativeTimeFromNow(date) {
  if (!date) return null;
  const target = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units = [
    { limit: 60 * 1000, divisor: 1000, unit: "second" },
    { limit: 60 * 60 * 1000, divisor: 60 * 1000, unit: "minute" },
    { limit: 24 * 60 * 60 * 1000, divisor: 60 * 60 * 1000, unit: "hour" },
    { limit: 30 * 24 * 60 * 60 * 1000, divisor: 24 * 60 * 60 * 1000, unit: "day" },
    { limit: 365 * 24 * 60 * 60 * 1000, divisor: 30 * 24 * 60 * 60 * 1000, unit: "month" },
    { limit: Infinity, divisor: 365 * 24 * 60 * 60 * 1000, unit: "year" },
  ];
  for (const { limit, divisor, unit } of units) {
    if (abs < limit) {
      const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return formatter.format(Math.round(diff / divisor), unit);
    }
  }
  return null;
}
