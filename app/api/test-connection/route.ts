import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const connection = await connectToDatabase();
    
    return NextResponse.json({
      success: true,
      message: "MongoDB Atlas connection successful!",
      database: process.env.MONGODB_DB || "just-your-choice",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "MongoDB Atlas connection failed!",
        error: message,
      },
      { status: 500 }
    );
  }
}
