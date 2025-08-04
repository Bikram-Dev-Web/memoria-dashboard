import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, imageUrl, categoryId } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    // Get category and verify ownership
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        catalog: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category.catalog.client.clerkId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create product
    const product = await db.product.create({
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        imageUrl,
        categoryId,
        catalogId: category.catalogId,
      },
      include: {
        category: {
          include: {
            catalog: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
                products: {
                  include: {
                    productContext: true,
                    _count: {
                      select: { chatQueries: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Flatten all products from all catalogs
    const allProducts = client.catalogs.flatMap((catalog) =>
      catalog.categories.flatMap((category) =>
        category.products.map((product) => ({
          ...product,
          catalogName: catalog.name,
          categoryName: category.name,
        }))
      )
    );

    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
