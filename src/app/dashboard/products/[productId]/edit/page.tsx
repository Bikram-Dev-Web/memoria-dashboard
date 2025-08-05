// app/dashboard/products/[productId]/edit/page.tsx

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ProductData {
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  categoryId: string;
  catalogId: string; // Add catalogId to help with the back button link
}

export default function EditProductPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch the existing product data when the component loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product data.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load product details. Please try again.",
          variant: "destructive",
        });
        router.back(); // Go back if product can't be loaded
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [params.productId, router, toast]);

  // Handle the form submission to update the product
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${params.productId}`, {
        method: "PATCH", // Use PATCH for partial updates
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product.");
      }

      toast({
        title: "Success!",
        description: "Product has been updated successfully.",
      });
      // Redirect to the product's main page or the catalog
      router.push(`/dashboard/catalogs/${product.catalogId}`);
      router.refresh(); // Refresh server components to show updated data
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle changes in form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!product) return;

    setProduct({
      ...product,
      [name]: name === 'price' ? (value === '' ? null : parseFloat(value)) : value,
    });
  };

  // Show a loading spinner while fetching initial data
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return null; // or show an error message
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/products/${product.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600 mt-1">Update the details for `{product.name}`.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <Input id="name" name="name" value={product.name} onChange={handleInputChange} required />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Textarea id="description" name="description" value={product.description || ""} onChange={handleInputChange} rows={3} />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <Input id="price" name="price" type="number" step="0.01" value={product.price ?? ""} onChange={handleInputChange} />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <Input id="imageUrl" name="imageUrl" type="url" value={product.imageUrl || ""} onChange={handleInputChange} />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}