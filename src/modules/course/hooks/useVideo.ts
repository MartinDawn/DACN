import { useState, useCallback } from 'react';
import { lectureService } from '../services/lecture.service';

interface VideoData {
  videoUrl?: string;
  url?: string;
  name?: string;
  description?: string;
}

export const useVideo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const getVideo = useCallback(async (videoId: string, videoName?: string) => {
    if (!videoId) {
      setError('Video ID không hợp lệ');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      // Nếu có videoName, sử dụng function mới để tìm video cụ thể
      if (videoName) {
        const videoUrl = await lectureService.getSpecificVideoUrl(videoId, videoName);
        if (videoUrl) {
          setVideoData({ videoUrl, name: videoName });
          return videoUrl;
        } else {
          setError('Không tìm thấy video hoặc video không phải xem thử');
          return null;
        }
      }

      // Fallback về cách cũ nếu không có videoName
      const response = await lectureService.getVideoUrl(videoId);

      if (response.success && response.data) {
        // Handle both string and object responses
        let videoUrl: string | undefined;

        if (typeof response.data === 'string') {
          videoUrl = response.data;
        } else if (typeof response.data === 'object') {
          videoUrl = response.data.videoUrl || response.data.url || response.data.link;

          // Check nested data object
          if (!videoUrl && response.data.data) {
            videoUrl = response.data.data.videoUrl || response.data.data.url;
          }
        }

        if (videoUrl) {
          setVideoData({ videoUrl });
          return videoUrl;
        } else {
          setError('Không thể lấy URL video');
          return null;
        }
      } else {
        setError(response.message || 'Không thể tải video');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi kết nối. Không thể tải video.';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearVideo = useCallback(() => {
    setVideoData(null);
    setError(null);
  }, []);

  return {
    getVideo,
    clearVideo,
    isLoading,
    error,
    videoData,
  };
};
