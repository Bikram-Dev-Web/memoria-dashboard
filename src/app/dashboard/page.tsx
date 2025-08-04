import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  FolderOpen,
  MessageSquare,
  Plus,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get client data
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
      _count: {
        select: {
          catalogs: true,
          chatQueries: true,
        },
      },
    },
  });

  // Create client if doesn't exist
  if (!client) {
    const { user } = await auth();
    if (user) {
      await db.client.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || "",
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.emailAddresses[0]?.emailAddress || "User",
        },
      });
    }
  }

  const stats = [
    {
      name: "Total Catalogs",
      value: client?._count.catalogs || 0,
      icon: FolderOpen,
      href: "/dashboard/catalogs",
    },
    {
      name: "Total Products",
      value:
        client?.catalogs.reduce(
          (acc, catalog) =>
            acc +
            catalog.categories.reduce(
              (catAcc, category) => catAcc + category._count.products,
              0
            ),
          0
        ) || 0,
      icon: Package,
      href: "/dashboard/products",
    },
    {
      name: "Chat Queries",
      value: client?._count.chatQueries || 0,
      icon: MessageSquare,
      href: "/dashboard/queries",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's an overview of your e-commerce business.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/catalogs/new">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Catalog
            </Button>
          </Link>
          <Link href="/dashboard/products/new">
            <Button variant="outline" className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={stat.href}>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Catalogs</h3>
        </div>
        <div className="p-6">
          {client?.catalogs && client.catalogs.length > 0 ? (
            <div className="space-y-4">
              {client.catalogs.slice(0, 5).map((catalog) => (
                <div
                  key={catalog.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {catalog.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {catalog._count.categories} categories
                    </p>
                  </div>
                  <Link href={`/dashboard/catalogs/${catalog.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No catalogs yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first catalog.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/catalogs/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Catalog
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
