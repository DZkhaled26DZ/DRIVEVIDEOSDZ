import React, { useState } from 'react';
import { Link } from 'lucide-react';

interface URLInputProps {
  onSubmit: (url: string) => void;
}

export const URLInput: React.FC<URLInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative">
      {isExpanded ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="أدخل رابط الفيديو أو قائمة القنوات..."
            className="bg-gray-800 rounded-lg px-4 py-2 w-96 focus:ring-2 focus:ring-blue-500 outline-none"
            autoFocus
          />
          <button type="submit" className="btn-primary">
            تشغيل
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="btn-secondary"
          >
            إلغاء
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="btn-secondary"
        >
          <Link className="w-5 h-5" />
          <span>إضافة رابط</span>
        </button>
      )}
    </div>
  );
};