import React from 'react';
import { Play } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Play className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              مشغل الوسائط المتقدم
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
};