import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Edit, Trash2 } from "lucide-react";
import { db } from "@/lib/db";

export default async function CatalogsPage() {
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
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catalogs</h1>
          <p className="text-gray-600 mt-2">
            Manage your product catalogs and categories.
          </p>
        </div>
        <Link href="/dashboard/catalogs/new">
          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Catalog
          </Button>
        </Link>
      </div>

      {client.catalogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {client.catalogs.map((catalog) => (
            <div
              key={catalog.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <FolderOpen className="h-8 w-8 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {catalog.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {catalog.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Categories:</span>
                  <span className="font-medium">
                    {catalog._count.categories}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-medium">
                    {catalog.categories.reduce(
                      (acc: number, category: any) =>
                        acc + category._count.products,
                      0
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <Link
                  href={`/dashboard/catalogs/${catalog.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link href={`/dashboard/catalogs/${catalog.id}/edit`}>
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
          <FolderOpen className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No catalogs yet
          </h3>
          <p className="mt-2 text-gray-600">
            Create your first catalog to start organizing your products.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/catalogs/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Catalog
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
