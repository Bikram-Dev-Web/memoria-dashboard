// src/app/api/products/[productId]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// --- Handler for GET Request ---
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  // ... (Your GET logic here)
  try {
    const product = await db.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        productContext: true, 
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- Handler for PATCH Request (This is the fix) ---
export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const values = await req.json();

    // Security check to ensure user owns the product
    const productOwner = await db.product.findUnique({
      where: {
        id: params.productId,
        category: {
          catalog: {
            client: {
              clerkId: userId,
            },
          },
        },
      },
    });

    if (!productOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the product in the database
    const product = await db.product.update({
      where: {
        id: params.productId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- Handler for DELETE Request ---
export async function DELETE(
    req: Request,
    { params }: { params: { productId: string } }
) {
  // ... (Your DELETE logic here)
  try {
    const { userId } =  await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deletedProduct = await db.product.delete({
        where: {
            id: params.productId,
            category: { catalog: { client: { clerkId: userId } } }
        },
    });

    return NextResponse.json(deletedProduct);
  } catch(error) {
      console.log("[PRODUCT_DELETE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
  }
}