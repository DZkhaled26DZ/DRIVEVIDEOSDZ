import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import { initializePlayer, destroyPlayer } from '../utils/videoPlayer';
import 'plyr/dist/plyr.css';

interface VideoPlayerProps {
  src: string;
  type: 'stream' | 'video';
  onError?: (error: Error) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, type, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Plyr with advanced controls
    playerRef.current = new Plyr(videoRef.current, {
      controls: [
        'play-large', 'restart', 'rewind', 'play', 'fast-forward', 'progress',
        'current-time', 'duration', 'mute', 'volume', 'captions',
        'settings', 'pip', 'airplay', 'fullscreen'
      ],
      settings: ['captions', 'quality', 'speed', 'loop'],
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true },
      captions: { active: true, language: 'auto', update: true },
      quality: {
        default: 720,
        options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
      },
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
      },
      i18n: {
        restart: 'إعادة التشغيل',
        rewind: 'رجوع 10 ثواني',
        play: 'تشغيل',
        pause: 'إيقاف مؤقت',
        fastForward: 'تقديم 10 ثواني',
        seek: 'بحث',
        played: 'تم التشغيل',
        buffered: 'تم التحميل',
        currentTime: 'الوقت الحالي',
        duration: 'المدة',
        volume: 'مستوى الصوت',
        mute: 'كتم الصوت',
        unmute: 'تشغيل الصوت',
        enableCaptions: 'تفعيل الترجمة',
        disableCaptions: 'إيقاف الترجمة',
        enterFullscreen: 'ملء الشاشة',
        exitFullscreen: 'إنهاء ملء الشاشة',
        frameTitle: 'مشغل لـ {title}',
        captions: 'الترجمة',
        settings: 'الإعدادات',
        speed: 'السرعة',
        normal: 'عادي',
        quality: 'الجودة',
        loop: 'تكرار',
        start: 'البداية',
        end: 'النهاية',
        all: 'الكل',
        reset: 'إعادة ضبط',
        disabled: 'معطل',
        advertisement: 'إعلان'
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (videoRef.current) {
        destroyPlayer(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    const loadVideo = async () => {
      try {
        if (type === 'stream') {
          await initializePlayer(videoRef.current, src);
        } else {
          videoRef.current.src = src;
        }
        
        await videoRef.current.play().catch(() => {
          // Autoplay prevented, show play button
        });
      } catch (error) {
        console.error('Error loading video:', error);
        onError?.(error as Error);
      }
    };

    loadVideo();
  }, [src, type, onError]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        crossOrigin="anonymous"
        poster="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      >
        <source src={src} type={type === 'video' ? 'video/mp4' : 'application/x-mpegURL'} />
        <p className="text-center text-gray-400">
          متصفحك لا يدعم تشغيل الفيديو.
        </p>
      </video>
    </div>
  );
};