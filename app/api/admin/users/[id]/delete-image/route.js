import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    
    // Only allow owners
    if (!session?.user?.isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, image: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Don't allow deleting if user has no image
    if (!user.image) {
      return NextResponse.json(
        { error: 'User has no profile picture.' },
        { status: 400 }
      );
    }

    // Remove the profile picture
    await prisma.user.update({
      where: { id },
      data: { image: null }
    });

    return NextResponse.json({
      success: true,
      message: `Profile picture removed for ${user.name || user.email}`
    });

  } catch (error) {
    console.error('Error deleting user profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile picture.' },
      { status: 500 }
    );
  }
}
