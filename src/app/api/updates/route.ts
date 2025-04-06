import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import jwt from "jsonwebtoken";

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const updates = await prismaClient.update.findMany({
      take: ITEMS_PER_PAGE + 1,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            startupName: true,
          },
        },
      },
    });

    const hasMore = updates.length > ITEMS_PER_PAGE;
    const paginatedUpdates = hasMore ? updates.slice(0, -1) : updates;

    return NextResponse.json({
      updates: paginatedUpdates,
      hasMore,
    });
  } catch (error) {
    console.error("Get updates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: number };

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const update = await prismaClient.update.create({
      data: {
        content,
        userId: decoded.id,
      },
      include: {
        user: {
          select: {
            name: true,
            startupName: true,
          },
        },
      },
    });

    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    console.error("Create update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}