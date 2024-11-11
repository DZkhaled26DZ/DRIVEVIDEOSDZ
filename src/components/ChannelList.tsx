import React from 'react';
import { Star } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  isFavorite: boolean;
}

interface ChannelListProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  onChannelSelect,
  onToggleFavorite,
}) => {
  // Group channels by their group property
  const groupedChannels = channels.reduce((acc, channel) => {
    const group = channel.group || 'بدون تصنيف';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  if (channels.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
        لا توجد قنوات متاحة
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {Object.entries(groupedChannels).map(([group, groupChannels]) => (
          <div key={group} className="mb-4">
            <div className="bg-gray-700 px-4 py-2 sticky top-0">
              <h3 className="font-semibold text-gray-200">{group}</h3>
            </div>
            <div className="space-y-1 p-2">
              {groupChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="channel-item flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer group"
                  onClick={() => onChannelSelect(channel)}
                >
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-600 flex items-center justify-center">
                      <span className="text-sm">{channel.name[0]}</span>
                    </div>
                  )}
                  <span className="flex-grow text-sm">{channel.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(channel.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-yellow-400 transition-opacity"
                  >
                    <Star
                      className="w-5 h-5"
                      fill={channel.isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};