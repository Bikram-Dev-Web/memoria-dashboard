import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Edit, FileText } from "lucide-react";
import { db } from "@/lib/db";

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

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
      productContext: true,
      _count: {
        select: { chatQueries: true },
      },
    },
  });

  if (!product) {
    redirect("/dashboard/products");
  }

  // Check if the product belongs to the authenticated client
  if (product.category.catalog.client.clerkId !== userId) {
    redirect("/dashboard/products");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 mt-2">
            {product.category.catalog.name} • {product.category.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Product Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-gray-900">{product.name}</p>
            </div>

            {product.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="mt-1 text-gray-900">{product.description}</p>
              </div>
            )}

            {product.price && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <p className="mt-1 text-gray-900">
                  ${product.price.toString()}
                </p>
              </div>
            )}

            {product.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <p className="mt-1 text-gray-900 break-all">
                  {product.imageUrl}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chat Queries
              </label>
              <p className="mt-1 text-gray-900">{product._count.chatQueries}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                AI Context
              </label>
              <p className="mt-1 text-gray-900">
                {product.productContext ? "✓ Set" : "✗ Not set"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>

          <div className="space-y-3">
            <Link
              href={`/dashboard/products/${product.id}/context`}
              className="w-full"
            >
              <Button className="w-full flex items-center justify-center">
                <FileText className="mr-2 h-4 w-4" />
                {product.productContext ? "Edit AI Context" : "Add AI Context"}
              </Button>
            </Link>

            <Link
              href={`/dashboard/products/${product.id}/edit`}
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
            </Link>
          </div>

          {product.productContext && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                AI Context Preview
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-900">
                  {product.productContext.content.length > 200
                    ? `${product.productContext.content.substring(0, 200)}...`
                    : product.productContext.content}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
