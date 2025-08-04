import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderOpen, ArrowLeft, Plus, Package } from "lucide-react";
import { db } from "@/lib/db";

export default async function CatalogDetailPage({
  params,
}: {
  params: { catalogId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const catalog = await db.catalog.findUnique({
    where: { id: params.catalogId },
    include: {
      client: true,
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
          _count: {
            select: { products: true },
          },
        },
      },
    },
  });

  if (!catalog) {
    redirect("/dashboard/catalogs");
  }

  // Check if the catalog belongs to the authenticated client
  if (catalog.client.clerkId !== userId) {
    redirect("/dashboard/catalogs");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/catalogs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalogs
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{catalog.name}</h1>
          <p className="text-gray-600 mt-2">
            {catalog.description || "No description provided"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Categories
              </h2>
              <Link href={`/dashboard/catalogs/${catalog.id}/categories/new`}>
                <Button size="sm" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </Link>
            </div>

            {catalog.categories.length > 0 ? (
              <div className="space-y-4">
                {catalog.categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {category.name}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {category._count.products} products
                      </span>
                    </div>

                    {category.products.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.products.map((product) => (
                          <div
                            key={product.id}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-indigo-600" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {product.price
                                    ? `$${product.price}`
                                    : "No price"}
                                </p>
                              </div>
                              <Link href={`/dashboard/products/${product.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No products in this category yet.
                      </div>
                    )}

                    <div className="mt-3 flex space-x-2">
                      <Link
                        href={`/dashboard/catalogs/${catalog.id}/categories/${category.id}/products/new`}
                      >
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-3 w-3" />
                          Add Product
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No categories yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding categories to your catalog.
                </p>
                <div className="mt-4">
                  <Link
                    href={`/dashboard/catalogs/${catalog.id}/categories/new`}
                  >
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Category
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Catalog Stats
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Categories:</span>
                <span className="font-medium">{catalog.categories.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-medium">
                  {catalog.categories.reduce(
                    (acc, category) => acc + category._count.products,
                    0
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Products with AI Context:</span>
                <span className="font-medium">
                  {catalog.categories.reduce(
                    (acc, category) =>
                      acc +
                      category.products.filter((p) => p.productContext).length,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>

            <div className="space-y-3">
              <Link
                href={`/dashboard/catalogs/${catalog.id}/edit`}
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  Edit Catalog
                </Button>
              </Link>

              <Link
                href={`/dashboard/catalogs/${catalog.id}/categories/new`}
                className="w-full"
              >
                <Button className="w-full flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
