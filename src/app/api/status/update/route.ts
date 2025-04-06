import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function PUT(request: NextRequest) {
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

    const { status } = await request.json();
    if (!status || !["In Office", "Out of Office"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedStatus = await prismaClient.status.update({
      where: {
        userId: decoded.id,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ status: updatedStatus });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}