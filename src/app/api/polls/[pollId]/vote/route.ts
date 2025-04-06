import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prismaClient } from "@/lib/db";

export async function POST(
  req: Request,
  context: { params: { pollId: string } }
) {
  try {
    // Get pollId from context
    const { pollId: pollIdString } = await context.params;
    const pollId = parseInt(pollIdString);

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

    const { optionId } = await req.json();
    // Remove this line as pollId is already declared above
    // const pollId = parseInt(params.pollId);

    // Continue with the rest of the code using the already declared pollId
    const existingVote = await prismaClient.pollOption.findFirst({
      where: {
        pollId,
        voters: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (existingVote) {
      throw new Error("You have already voted on this poll");
    }

    // Update vote count and add user to voters
    await prismaClient.pollOption.update({
      where: { id: optionId },
      data: {
        votes: { increment: 1 },
        voters: {
          connect: { id: user.id },
        },
      },
    });

    // Fetch updated poll
    const poll = await prismaClient.poll.findUnique({
      where: { id: pollId },
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
