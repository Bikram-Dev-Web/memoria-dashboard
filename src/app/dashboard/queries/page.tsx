import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessageSquare, Package, Calendar } from "lucide-react";
import { db } from "@/lib/db";

export default async function QueriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const client = await db.client.findUnique({
    where: { clerkId: userId },
    include: {
      chatQueries: {
        include: {
          product: {
            include: {
              category: {
                include: {
                  catalog: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!client) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat Queries</h1>
        <p className="text-gray-600 mt-2">
          View customer questions and AI responses for your products.
        </p>
      </div>

      {client.chatQueries.length > 0 ? (
        <div className="space-y-4">
          {client.chatQueries.map((query) => (
            <div
              key={query.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {query.product ? query.product.name : "General Query"}
                    </h3>
                    {query.product && (
                      <p className="text-sm text-gray-600">
                        {query.product.category.catalog.name} •{" "}
                        {query.product.category.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(query.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Customer Question:
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900">{query.question}</p>
                  </div>
                </div>

                {query.answer && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      AI Response:
                    </h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-gray-900">{query.answer}</p>
                    </div>
                  </div>
                )}

                {!query.answer && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      ⏳ AI response pending...
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No chat queries yet
          </h3>
          <p className="mt-2 text-gray-600">
            Customer questions will appear here once they start using your AI
            chat widget.
          </p>
        </div>
      )}
    </div>
  );
}
