"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="text-center space-y-8 max-w-2xl">
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Startup Network
            </h1>
            <p className="text-xl text-gray-600 mt-6">
              Connect with innovative startups, share your journey, and grow
              together in our thriving community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                href="/login"
                className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-8 py-3 text-lg font-medium text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg shadow-lg hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105"
              >
                Create Account
              </Link>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-indigo-600 text-2xl mb-3">🚀</div>
                <h3 className="text-lg font-semibold text-gray-900">Connect</h3>
                <p className="text-gray-600 mt-2">
                  Network with other innovative startups
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-indigo-600 text-2xl mb-3">💡</div>
                <h3 className="text-lg font-semibold text-gray-900">Share</h3>
                <p className="text-gray-600 mt-2">
                  Share your startup journey and updates
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-indigo-600 text-2xl mb-3">🌟</div>
                <h3 className="text-lg font-semibold text-gray-900">Grow</h3>
                <p className="text-gray-600 mt-2">
                  Learn and grow with the community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
