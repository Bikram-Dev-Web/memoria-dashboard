import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  console.log("POST /api/catalogs called");

  try {
    const { userId } = await auth();
    const user = await currentUser();

    console.log("User ID:", userId);
    console.log("User object:", user);

    if (!userId) {
      console.log("No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);
    const { name, description, categories } = body;

    if (!name) {
      console.log("Name is required");
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Get or create client
    let client = await db.client.findUnique({
      where: { clerkId: userId },
    });

    console.log("Client found:", !!client);

    if (!client) {
      console.log("Creating new client for user:", userId);
      // Create client with available user data
      const email = user?.emailAddresses?.[0]?.emailAddress || "";
      const firstName = user?.firstName || "";
      const lastName = user?.lastName || "";
      const name =
        firstName && lastName ? `${firstName} ${lastName}` : email || "User";

      client = await db.client.create({
        data: {
          clerkId: userId,
          email: email,
          name: name,
        },
      });
      console.log("Client created:", client.id);
    }

    console.log("Creating catalog with categories:", categories);

    // Create catalog with categories
    const catalog = await db.catalog.create({
      data: {
        name,
        description,
        clientId: client.id,
        categories: {
          create: categories.map((categoryName: string) => ({
            name: categoryName,
          })),
        },
      },
      include: {
        categories: true,
      },
    });

    console.log("Catalog created successfully:", catalog.id);
    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Error creating catalog:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log("GET /api/catalogs called");

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await db.client.findUnique({
      where: { clerkId: userId },
      include: {
        catalogs: {
          include: {
            categories: {
              include: {
                _count: {
                  select: { products: true },
                },
              },
            },
            _count: {
              select: { categories: true },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client.catalogs);
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
