import { useState, useCallback } from 'react';
import { lectureService } from '../services/lecture.service';

interface UseLectureReturn {
  videoUrl: string | null;
  isVideoLoading: boolean;
  videoError: string | null;
  getVideoUrl: (videoId: string) => Promise<void>;
  clearVideo: () => void;
}

/** Extract a URL string từ nhiều dạng response API khác nhau */
const extractUrlString = (data: unknown): string | null => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const candidate = obj['url'] ?? obj['videoUrl'] ?? obj['streamUrl'] ?? obj['signedUrl'];
    if (typeof candidate === 'string') return candidate;
  }
  return null;
};

export const useLecture = (): UseLectureReturn => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const getVideoUrl = useCallback(async (videoId: string) => {
    setIsVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    try {
      const response = await lectureService.getVideoUrl(videoId);
      const url = extractUrlString(response.data);
      if (url) {
        setVideoUrl(url);
      } else if (response.success === false) {
        setVideoError(response.message || 'Không thể tải URL video.');
      } else {
        setVideoError('API không trả về URL video hợp lệ.');
      }
    } catch {
      setVideoError('Đã xảy ra lỗi khi tải video. Vui lòng thử lại.');
    } finally {
      setIsVideoLoading(false);
    }
  }, []);

  const clearVideo = useCallback(() => {
    setVideoUrl(null);
    setVideoError(null);
    setIsVideoLoading(false);
  }, []);

  return { videoUrl, isVideoLoading, videoError, getVideoUrl, clearVideo };
};
