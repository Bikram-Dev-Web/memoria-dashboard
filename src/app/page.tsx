import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    // Changed gradient to a darker, more modern slate theme
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mb-6">
            E-Commerce Dashboard
          </h1>
          <p className="text-lg text-slate-300 mb-12 max-w-3xl mx-auto">
            Manage your e-commerce products, catalogs, and AI-powered customer
            support all in one place. Create catalogs, add products, and provide
            context for intelligent customer interactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* --- Primary "Get Started" Button --- */}
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-indigo-500 text-white font-semibold hover:bg-indigo-600 text-lg px-8 py-3 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Button>
            </Link>
            {/* --- Secondary "Sign In" Button --- */}
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-slate-400 hover:bg-white/20 text-white text-lg px-8 py-3 transition-colors duration-300"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* --- "Glassmorphism" Feature Cards --- */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-white/20 hover:scale-105">
            <h3 className="text-xl font-semibold mb-4 text-gray-100">
              Product Management
            </h3>
            <p className="text-slate-300">
              Easily add, edit, and organize your products with categories and
              catalogs.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-white/20 hover:scale-105">
            <h3 className="text-xl font-semibold mb-4 text-gray-100">
              AI Context
            </h3>
            <p className="text-slate-300">
              Upload product context via text or PDF to power intelligent
              customer support.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-white/20 hover:scale-105">
            <h3 className="text-xl font-semibold mb-4 text-gray-100">
              Customer Insights
            </h3>
            <p className="text-slate-300">
              Track customer queries and AI responses to improve your product
              offerings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}