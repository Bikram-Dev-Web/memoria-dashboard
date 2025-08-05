// app/api/catalogs/[catalogId]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";


export const dynamic = 'force-dynamic';
// --- Handler for GET Request ---
export async function GET(
  req: Request,
  { params }: { params: { catalogId: string } }
) {
  try {
    // FIX: Access params *before* calling auth()
    const { catalogId } = params;
    if (!catalogId) {
      return new NextResponse("Catalog ID is required", { status: 400 });
    }

    // Now, call auth() to get the user ID
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const catalog = await db.catalog.findUnique({
      where: {
        id: catalogId,
        clientId: userId,
      },
      include: {
        categories: { orderBy: { name: "asc" } },
      },
    });

    if (!catalog) {
      return new NextResponse("Catalog not found", { status: 404 });
    }

    return NextResponse.json(catalog);
  } catch (error) {
    console.error("[CATALOG_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- Handler for PATCH Request ---
export async function PATCH(
  req: Request,
  { params }: { params: { catalogId: string } }
) {
  try {
    // FIX: Access params *before* calling auth()
    const { catalogId } = params;
    if (!catalogId) {
      return new NextResponse("Catalog ID is required", { status: 400 });
    }

    // Now, call auth()
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // The rest of your PATCH logic is correct
    const body = await req.json();
    const catalogOwner = await db.catalog.findUnique({
      where: { id: catalogId, clientId: userId },
    });

    if (!catalogOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedCatalog = await db.$transaction(async (prisma) => {
      const catalog = await prisma.catalog.update({
        where: { id: catalogId },
        data: { name: body.name, description: body.description },
      });
      if (body.categoryIdsToDelete?.length > 0) {
        await prisma.category.deleteMany({ where: { id: { in: body.categoryIdsToDelete } } });
      }
      if (body.categoriesToUpdate?.length > 0) {
        for (const category of body.categoriesToUpdate) {
          await prisma.category.update({ where: { id: category.id }, data: { name: category.name } });
        }
      }
      if (body.categoriesToCreate?.length > 0) {
        await prisma.category.createMany({
          data: body.categoriesToCreate.map((c: { name: string }) => ({ name: c.name, catalogId })),
        });
      }
      return catalog;
    });

    return NextResponse.json(updatedCatalog);
  } catch (error) {
    console.error("[CATALOG_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


// --- Handler for DELETE Request ---
export async function DELETE(
    req: Request,
    { params }: { params: { catalogId: string } }
) {
    try {
        // FIX: Access params *before* calling auth()
        const { catalogId } = params;
        if (!catalogId) {
          return new NextResponse("Catalog ID is required", { status: 400 });
        }

        // Now, call auth()
        const { userId } = await auth();
        if (!userId) {
          return new NextResponse("Unauthorized", { status: 401 });
        }

        const deletedCatalog = await db.catalog.delete({
            where: {
                id: catalogId,
                clientId: userId,
            },
        });

        return NextResponse.json(deletedCatalog);

    } catch(error) {
        console.log("[CATALOG_DELETE]", error);
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return new NextResponse("Not Found", { status: 404 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}