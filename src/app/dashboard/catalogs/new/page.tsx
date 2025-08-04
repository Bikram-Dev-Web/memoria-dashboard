"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export default function NewCatalogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([{ name: "" }]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryNames = categories
      .map((cat) => cat.name)
      .filter((name) => name.trim());

    try {
      const response = await fetch("/api/catalogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          categories: categoryNames,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create catalog");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Catalog created successfully!",
      });
      router.push(`/dashboard/catalogs/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create catalog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = () => {
    setCategories([...categories, { name: "" }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, name: string) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Catalog</h1>
        <p className="text-gray-600 mt-2">
          Create a new catalog to organize your products with categories.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Catalog Details
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Catalog Name *
              </label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter catalog name"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter catalog description"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Categories</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCategory}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  placeholder={`Category ${index + 1}`}
                  className="flex-1"
                />
                {categories.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCategory(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Catalog"}
          </Button>
        </div>
      </form>
    </div>
  );
}
