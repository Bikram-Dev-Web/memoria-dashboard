import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Get product and verify ownership
    const product = await db.product.findUnique({
      where: { id: params.productId },
      include: {
        category: {
          include: {
            catalog: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.category.catalog.client.clerkId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upsert product context
    const productContext = await db.productContext.upsert({
      where: { productId: params.productId },
      update: { content },
      create: {
        content,
        productId: params.productId,
      },
    });

    return NextResponse.json(productContext);
  } catch (error) {
    console.error("Error saving product context:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
