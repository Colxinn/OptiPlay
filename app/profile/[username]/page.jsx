import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfilePublicClient from "./ProfilePublicClient.jsx";

function serializeComment(comment) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: comment.author?.id ?? "anon",
      name: comment.author?.name ?? "Anonymous",
      image: comment.author?.image ?? null,
      isOwner: comment.author?.isOwner ?? false,
    },
  };
}

function serializeAccessLog(log) {
  return {
    id: log.id,
    ipAddress: log.ipAddress,
    city: log.city,
    region: log.region,
    country: log.country,
    lastSeen: log.lastSeen.toISOString(),
  };
}

export default async function PublicProfilePage({ params }) {
  const username = decodeURIComponent(params.username);
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      isOwner: true,
      profileCommentsReceived: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true, isOwner: true } },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const comments = user.profileCommentsReceived.map(serializeComment);

  let accessLogs = [];
  if (session?.user?.isOwner) {
    const logs = await prisma.userAccessLog.findMany({
      where: { userId: user.id },
      orderBy: { lastSeen: "desc" },
      take: 20,
    });
    accessLogs = logs.map(serializeAccessLog);
  }

  return (
    <ProfilePublicClient
      profile={{
        id: user.id,
        name: user.name || "Player",
        bio: user.bio || "",
        image: user.image,
        isOwner: user.isOwner,
      }}
      comments={comments}
      viewer={session?.user ? { id: session.user.id, name: session.user.name ?? "", isOwner: !!session.user.isOwner } : null}
      accessLogs={accessLogs}
    />
  );
}
