import Hls from 'hls.js';
import dashjs from 'dashjs';
import shaka from 'shaka-player';

export const initializePlayer = async (videoElement: HTMLVideoElement, url: string) => {
  // Clean up any existing players
  if (videoElement.hlsPlayer) {
    videoElement.hlsPlayer.destroy();
  }
  if (videoElement.dashPlayer) {
    videoElement.dashPlayer.destroy();
  }
  if (videoElement.shakaPlayer) {
    videoElement.shakaPlayer.destroy();
  }

  // Try HLS.js first
  if (Hls.isSupported() && (url.includes('.m3u8') || url.includes('application/x-mpegURL'))) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });
    
    hls.loadSource(url);
    hls.attachMedia(videoElement);
    videoElement.hlsPlayer = hls;
    
    return new Promise((resolve, reject) => {
      hls.on(Hls.Events.MANIFEST_PARSED, resolve);
      hls.on(Hls.Events.ERROR, reject);
    });
  }
  
  // Try DASH
  else if (url.includes('.mpd') || url.includes('application/dash+xml')) {
    const dashPlayer = dashjs.MediaPlayer().create();
    dashPlayer.initialize(videoElement, url, true);
    dashPlayer.updateSettings({
      streaming: {
        lowLatencyEnabled: true,
        abr: {
          useDefaultABRRules: true,
          initialBitrate: { audio: -1, video: -1 },
        },
      },
    });
    videoElement.dashPlayer = dashPlayer;
  }
  
  // Try Shaka Player as fallback
  else {
    const shakaPlayer = new shaka.Player(videoElement);
    await shakaPlayer.load(url);
    videoElement.shakaPlayer = shakaPlayer;
  }
};

export const destroyPlayer = (videoElement: HTMLVideoElement) => {
  if (videoElement.hlsPlayer) {
    videoElement.hlsPlayer.destroy();
    delete videoElement.hlsPlayer;
  }
  if (videoElement.dashPlayer) {
    videoElement.dashPlayer.destroy();
    delete videoElement.dashPlayer;
  }
  if (videoElement.shakaPlayer) {
    videoElement.shakaPlayer.destroy();
    delete videoElement.shakaPlayer;
  }
};