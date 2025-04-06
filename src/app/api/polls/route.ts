import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prismaClient } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as {
      id: number;
      email: string;
      name: string;
    };

    // Get user from database
    const user = await prismaClient.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { question, options } = await req.json();

    const poll = await prismaClient.poll.create({
      data: {
        question,
        userId: user.id,
        options: {
          create: options.map((text: string) => ({
            text,
            votes: 0,
          })),
        },
      },
      include: {
        options: true,
        user: {
          select: {
            name: true,
            startupName: true,
          },
        },
      },
    });

    return NextResponse.json({ poll });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as {
      id: number;
      email: string;
      name: string;
    };

    // Get page from URL params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    // Fetch polls with pagination
    const [polls, total] = await Promise.all([
      prismaClient.poll.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          options: true,
          user: {
            select: {
              name: true,
              startupName: true,
            },
          },
        },
      }),
      prismaClient.poll.count(),
    ]);

    return NextResponse.json({
      polls,
      hasMore: skip + limit < total,
    });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
