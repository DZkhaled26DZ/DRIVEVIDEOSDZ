import { Parser } from 'm3u8-parser';

interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  isFavorite: boolean;
  epg?: string;
  language?: string;
}

export async function parseM3U(content: string): Promise<Channel[]> {
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const channels: Channel[] = [];
  let currentGroup = '';

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const epgMatch = line.match(/tvg-id="([^"]+)"/);
      const langMatch = line.match(/tvg-language="([^"]+)"/);
      
      if (nameMatch) {
        const name = nameMatch[1].trim();
        const logo = logoMatch ? logoMatch[1] : undefined;
        const group = groupMatch ? groupMatch[1] : currentGroup;
        const epg = epgMatch ? epgMatch[1] : undefined;
        const language = langMatch ? langMatch[1] : undefined;
        
        const nextLine = lines[i + 1];
        if (nextLine && !nextLine.startsWith('#')) {
          channels.push({
            id: `channel-${channels.length + 1}`,
            name,
            url: nextLine.trim(),
            logo,
            group,
            epg,
            language,
            isFavorite: false
          });
        }
      }
    }
  }

  // Sort channels by group and name
  return channels.sort((a, b) => {
    if (a.group === b.group) {
      return a.name.localeCompare(b.name);
    }
    return (a.group || '').localeCompare(b.group || '');
  });
}