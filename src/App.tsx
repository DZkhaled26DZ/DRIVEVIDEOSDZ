import React, { useState, useEffect } from 'react';
import { Upload, Link, Menu, Search, Star, Loader2 } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelList } from './components/ChannelList';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { URLInput } from './components/URLInput';
import { parseM3U } from './utils/m3uParser';
import toast, { Toaster } from 'react-hot-toast';

interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  isFavorite: boolean;
}

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [localFile, setLocalFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        if (file.type.includes('video')) {
          const url = URL.createObjectURL(file);
          setLocalFile(url);
          setCurrentChannel(null);
        } else {
          const text = await file.text();
          const parsedChannels = await parseM3U(text);
          setChannels(parsedChannels);
          toast.success('تم تحميل قائمة القنوات بنجاح');
        }
      } catch (error) {
        toast.error('حدث خطأ أثناء تحميل الملف');
      }
      setLoading(false);
    }
  };

  const handleURLSubmit = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const text = await response.text();
      if (url.endsWith('.m3u') || url.endsWith('.m3u8')) {
        const parsedChannels = await parseM3U(text);
        setChannels(parsedChannels);
        toast.success('تم تحميل قائمة القنوات بنجاح');
      } else {
        setLocalFile(url);
        setCurrentChannel(null);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل الرابط');
    }
    setLoading(false);
  };

  const handleChannelSelect = (channel: Channel) => {
    setCurrentChannel(channel);
    setLocalFile(null);
    toast.success(`جاري تشغيل: ${channel.name}`);
  };

  const toggleFavorite = (channelId: string) => {
    setChannels(channels.map(channel =>
      channel.id === channelId
        ? { ...channel, isFavorite: !channel.isFavorite }
        : channel
    ));
  };

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
    return showFavoritesOnly ? channel.isFavorite && matchesSearch : matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      <Toaster position="top-center" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <label className="btn-primary">
                <Upload className="w-5 h-5" />
                <span>تحميل ملف</span>
                <input
                  type="file"
                  className="hidden"
                  accept="video/*,.m3u,.m3u8"
                  onChange={handleFileUpload}
                />
              </label>
              
              <URLInput onSubmit={handleURLSubmit} />
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="btn-secondary"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="bg-gray-800 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`btn-secondary ${showFavoritesOnly ? 'text-yellow-400' : ''}`}
              >
                <Star className="w-5 h-5" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-grow">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (currentChannel || localFile) ? (
                  <VideoPlayer
                    src={currentChannel?.url || localFile || ''}
                    type={currentChannel ? 'stream' : 'video'}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>قم بتحميل ملف أو اختيار قناة للبدء</p>
                  </div>
                )}
              </div>
            </div>

            {showSidebar && (
              <div className="w-96 flex-shrink-0">
                <ChannelList
                  channels={filteredChannels}
                  onChannelSelect={handleChannelSelect}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;