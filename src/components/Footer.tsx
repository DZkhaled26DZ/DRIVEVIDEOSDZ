import React from 'react';
import { Youtube, Mail, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <a
              href="https://youtube.com/@KhaledDraga"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Youtube className="w-6 h-6" />
            </a>
            <a
              href="mailto:contact@khaleddraga.com"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Mail className="w-6 h-6" />
            </a>
            <a
              href="https://t.me/KhaledDraga"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Send className="w-6 h-6" />
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 خالد دراغة. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
};