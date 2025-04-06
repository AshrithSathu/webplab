import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, startupName, startupUrl } = body;

    // Validate input
    if (!name || !email || !password || !startupName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user with plain password (temporary)
    const newUser = await prismaClient.user.create({
      data: {
        name,
        email,
        password,
        startupName,
        startupUrl: startupUrl || null,
      },
    });

    // Create default status for the user
    await prismaClient.status.create({
      data: {
        status: "Out of Office",
        userId: newUser.id,
      },
    });

    // Return user data (excluding password)
    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          startupName: newUser.startupName,
          startupUrl: newUser.startupUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
