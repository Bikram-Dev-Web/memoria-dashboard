"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string | null;
  productContext?: {
    content: string;
  } | null;
}

export default function ProductContextPage({
  params,
}: {
  params: { productId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setContent(data.productContext?.content || "");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product details.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please provide some context for the product.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/products/${params.productId}/context`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product context saved successfully!",
        });
        router.push(`/dashboard/products/${params.productId}`);
      } else {
        throw new Error("Failed to save context");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product context. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Product not found.</p>
          <Link href="/dashboard/products">
            <Button variant="outline" className="mt-4">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/products/${product.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI Context for {product.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Add context that will help AI answer customer questions about this
            product.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Product Context
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Context Content
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter detailed information about this product that will help AI answer customer questions. Include features, specifications, benefits, usage instructions, etc."
                  className="min-h-[300px]"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Context"}
                </Button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tips</h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-indigo-600 mt-0.5" />
                <p>
                  Include detailed product specifications, features, and
                  benefits.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-indigo-600 mt-0.5" />
                <p>
                  Add usage instructions, care guidelines, and troubleshooting
                  tips.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-indigo-600 mt-0.5" />
                <p>Include common customer questions and their answers.</p>
              </div>

              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-indigo-600 mt-0.5" />
                <p>
                  Mention warranty information, return policies, and shipping
                  details.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Product Info
            </h3>

            <div className="space-y-3">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
