import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Plus, Edit, FileText } from "lucide-react";
import { db } from "@/lib/db";

export default async function ProductsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
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
    redirect("/dashboard");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">
            Manage your products and their AI context.
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {allProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.catalogName} • {product.categoryName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {product.price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">
                      ${product.price.toString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chat Queries:</span>
                  <span className="font-medium">
                    {product._count.chatQueries}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AI Context:</span>
                  <span className="font-medium">
                    {product.productContext ? "✓ Set" : "✗ Not set"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link href={`/dashboard/products/${product.id}/context`}>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No products yet
          </h3>
          <p className="mt-2 text-gray-600">
            Add your first product to start managing your inventory.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/products/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Product
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
