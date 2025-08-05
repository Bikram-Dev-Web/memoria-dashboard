"use client";

import { use } from "react"; // 1. Import the 'use' hook
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define the shape of a category, including its ID for updates
interface Category {
  id: string;
  name: string;
}

interface CatalogData {
  name: string;
  description: string | null;
  categories: Category[];
}

// 2. Update the type for params to be a Promise
export default function EditCatalogPage({ params }: { params: Promise<{ catalogId: string }> }) {
  // 3. Unwrap the Promise to get the catalogId
  const { catalogId } = use(params);

  const router = useRouter();
  const { toast } = useToast();
  
  // State for the form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Partial<Category>[]>([{ name: "" }]);
  
  // State to track original categories for calculating changes
  const [initialCategories, setInitialCategories] = useState<Category[]>([]);

  // State for UI feedback
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing catalog data on page load
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        // 4. Use the unwrapped catalogId variable
        const response = await fetch(`/api/catalogs/${catalogId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch catalog data.");
        }
        const data: CatalogData = await response.json();
        
        // Populate the state with fetched data
        setName(data.name);
        setDescription(data.description || "");
        setCategories(data.categories);
        setInitialCategories(data.categories); 

      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load catalog details.",
          variant: "destructive",
        });
        router.push("/dashboard/catalogs");
      } finally {
        setIsFetching(false);
      }
    };
    fetchCatalog();
    // 5. Use the unwrapped catalogId in the dependency array
  }, [catalogId, router, toast]);

  // Handle the form submission to update the catalog
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const categoriesToCreate = categories.filter(c => !c.id && c.name?.trim()).map(c => ({ name: c.name! }));
    const categoriesToUpdate = categories.filter(c => {
        const original = initialCategories.find(ic => ic.id === c.id);
        return c.id && original && original.name !== c.name && c.name?.trim();
    }).map(c => ({ id: c.id!, name: c.name! }));
    const categoryIdsToDelete = initialCategories
        .filter(ic => !categories.some(c => c.id === ic.id))
        .map(ic => ic.id);

    try {
      // 6. Use the unwrapped catalogId variable here as well
      const response = await fetch(`/api/catalogs/${catalogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          categoriesToCreate,
          categoriesToUpdate,
          categoryIdsToDelete,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update catalog");
      }

      toast({
        title: "Success",
        description: "Catalog updated successfully!",
      });
      router.push(`/dashboard/catalogs`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update catalog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions to manage the dynamic category list
  const addCategory = () => {
    setCategories([...categories, { name: "" }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, newName: string) => {
    const newCategories = [...categories];
    newCategories[index].name = newName;
    setCategories(newCategories);
  };

  // Show a loading spinner while fetching initial data
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/catalogs">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Catalog</h1>
            <p className="text-gray-600 mt-2">Update the details for `{name}`.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Catalog Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Catalog Name *</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea id="description" value={description || ''} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Categories</h2>
            <Button type="button" variant="outline" size="sm" onClick={addCategory}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </div>
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={category.id || `new-${index}`} className="flex items-center space-x-2">
                <Input value={category.name || ''} onChange={(e) => updateCategoryName(index, e.target.value)} placeholder={`Category ${index + 1}`} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCategory(index)}>
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}