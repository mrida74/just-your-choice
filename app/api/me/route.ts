import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/mongodb";
import { User } from "../../../lib/models/User";

export async function GET(request: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email }).lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // pick default address if present
  const defaultAddress = (user.profile?.addresses || []).find((a: any) => a.isDefault) || (user.profile?.addresses || [])[0] || null;

  return NextResponse.json({
    email: user.email,
    name: user.name,
    phone: user.phone || user.profile?.phone || null,
    profile: {
      firstName: user.profile?.firstName || null,
      lastName: user.profile?.lastName || null,
      address: defaultAddress
        ? {
            street: defaultAddress.street || "",
            city: defaultAddress.city || "",
            state: defaultAddress.state || "",
            postalCode: defaultAddress.zipCode || defaultAddress.postalCode || "",
            country: defaultAddress.country || "",
          }
        : null,
    },
  });
}
