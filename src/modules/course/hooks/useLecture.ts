import { useState, useCallback } from 'react';
import { lectureService } from '../services/lecture.service';
import type { EnhancedVideoResponse } from '../../admin/models/course';

interface UseLectureReturn {
  videoUrl: string | null;
  isVideoLoading: boolean;
  videoError: string | null;
  getVideoUrl: (videoId: string) => Promise<void>;
  clearVideo: () => void;

  // Enhanced video data with subtitles/transcripts
  videoData: EnhancedVideoResponse | null;
  videoSubtitles: Array<{ startTime: number; endTime: number; text: string }> | null;
  isVideoDataLoading: boolean;
  videoDataError: string | null;
  getEnhancedVideoData: (videoId: string) => Promise<void>;
  clearVideoData: () => void;

  documentUrl: string | null;
  isDocumentLoading: boolean;
  documentError: string | null;
  getDocumentUrl: (documentId: string) => Promise<void>;
  clearDocument: () => void;
}

/** Extract a URL string từ nhiều dạng response API khác nhau */
const extractUrlString = (data: unknown): string | null => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const candidate =
      obj['url'] ??
      obj['fileUrl'] ??
      obj['documentUrl'] ??
      obj['downloadUrl'] ??
      obj['signedUrl'] ??
      obj['videoUrl'] ??
      obj['streamUrl'];
    if (typeof candidate === 'string') return candidate;
  }
  return null;
};

export const useLecture = (): UseLectureReturn => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Enhanced video data with subtitles
  const [videoData, setVideoData] = useState<EnhancedVideoResponse | null>(null);
  const [videoSubtitles, setVideoSubtitles] = useState<Array<{ startTime: number; endTime: number; text: string }> | null>(null);
  const [isVideoDataLoading, setIsVideoDataLoading] = useState(false);
  const [videoDataError, setVideoDataError] = useState<string | null>(null);

  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

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

  const getEnhancedVideoData = useCallback(async (videoId: string) => {
    setIsVideoDataLoading(true);
    setVideoDataError(null);
    setVideoData(null);
    setVideoSubtitles(null);
    try {
      const enhancedData = await lectureService.getEnhancedVideoData(videoId);
      if (enhancedData) {
        setVideoData(enhancedData);
        // Extract subtitles from analysis result
        if (enhancedData.analysisResult?.subtitles) {
          setVideoSubtitles(enhancedData.analysisResult.subtitles);
        }
      } else {
        setVideoDataError('Không thể tải dữ liệu video.');
      }
    } catch (error) {
      setVideoDataError('Đã xảy ra lỗi khi tải thông tin video.');
    } finally {
      setIsVideoDataLoading(false);
    }
  }, []);

  const clearVideoData = useCallback(() => {
    setVideoData(null);
    setVideoSubtitles(null);
    setVideoDataError(null);
    setIsVideoDataLoading(false);
  }, []);

  const getDocumentUrl = useCallback(async (documentId: string) => {
    setIsDocumentLoading(true);
    setDocumentError(null);
    setDocumentUrl(null);
    try {
      const response = await lectureService.getDocumentUrl(documentId);
      const url = extractUrlString(response.data);
      if (url) {
        setDocumentUrl(url);
      } else if (response.success === false) {
        setDocumentError(response.message || 'Không thể tải tài liệu.');
      } else {
        setDocumentError('API không trả về URL tài liệu hợp lệ.');
      }
    } catch {
      setDocumentError('Đã xảy ra lỗi khi tải tài liệu. Vui lòng thử lại.');
    } finally {
      setIsDocumentLoading(false);
    }
  }, []);

  const clearDocument = useCallback(() => {
    setDocumentUrl(null);
    setDocumentError(null);
    setIsDocumentLoading(false);
  }, []);

  return {
    videoUrl,
    isVideoLoading,
    videoError,
    getVideoUrl,
    clearVideo,
    videoData,
    videoSubtitles,
    isVideoDataLoading,
    videoDataError,
    getEnhancedVideoData,
    clearVideoData,
    documentUrl,
    isDocumentLoading,
    documentError,
    getDocumentUrl,
    clearDocument,
  };
};
