import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Clock, BookOpen } from 'lucide-react';
import type { EnhancedVideoResponse } from '../../admin/models/course';

interface EnhancedVideoPreviewProps {
  videoData: EnhancedVideoResponse;
  onClose: () => void;
}

export const EnhancedVideoPreview: React.FC<EnhancedVideoPreviewProps> = ({
  videoData,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({});
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);

  const { name, videoUrl, duration, analysisResult } = videoData;
  const { summary, segments = [], subtitles = [] } = analysisResult || {};

  // Tự động cập nhật subtitle hiện tại dựa trên thời gian video
  useEffect(() => {
    if (!videoRef.current) return;

    const handleTimeUpdate = () => {
      const time = videoRef.current?.currentTime || 0;
      setCurrentTime(time);

      // Tìm subtitle phù hợp
      const currentSub = subtitles.find(
        (sub) => time >= sub.startTime && time < sub.endTime
      );
      setCurrentSubtitle(currentSub?.text || null);
    };

    const video = videoRef.current;
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [subtitles]);

  // Chuyển đến segment khi click
  const handleSegmentClick = (startTime: string) => {
    if (!videoRef.current) return;
    const timeString = startTime; // Format: "HH:MM:SS" hoặc "MM:SS"
    const parts = timeString.split(':').map(Number);
    let seconds = 0;

    if (parts.length === 3) {
      // HH:MM:SS
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      seconds = parts[0] * 60 + parts[1];
    }

    videoRef.current.currentTime = seconds;
    videoRef.current.play();
  };

  // Format thời gian từ giây thành HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse thời gian từ segment startTime (format "MM:SS" hoặc "HH:MM:SS")
  const parseStartTime = (startTime: string) => {
    const parts = startTime.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const toggleSegment = (index: string) => {
    setExpandedSegments((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-xl bg-gray-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-950 text-white border-b border-gray-800">
          <h3 className="font-medium text-lg truncate pr-4">{name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
            title="Đóng"
          >
            <X className="text-gray-400 hover:text-white w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-4 overflow-y-auto flex-1">
          {/* Video Player và Controls */}
          <div className="flex-1 flex flex-col bg-black p-4">
            {/* Video */}
            <div className="aspect-video bg-black flex items-center justify-center rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full h-full"
                onError={() => {
                  console.error('Video playback error');
                }}
              >
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            </div>

            {/* Subtitle Display */}
            {showSubtitles && currentSubtitle && (
              <div className="bg-gray-800 text-white p-3 rounded-lg text-center text-sm min-h-12 flex items-center justify-center">
                {currentSubtitle}
              </div>
            )}

            {/* Current Time and Duration */}
            <div className="text-gray-400 text-sm mt-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(currentTime)} / {formatTime(duration || 0)}
              </span>
            </div>

            {/* Subtitle Toggle */}
            {subtitles && subtitles.length > 0 && (
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                {showSubtitles ? 'Ẩn phụ đề' : 'Hiện phụ đề'}
              </button>
            )}
          </div>

          {/* Sidebar - Analysis & Segments */}
          <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto flex flex-col">
            {/* Summary Section */}
            {summary && (
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-start gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <h4 className="font-semibold text-white text-sm">Tóm tắt nội dung</h4>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Segments Section */}
            {segments && segments.length > 0 && (
              <div className="p-4 flex-1 overflow-y-auto">
                <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Các phần trong video
                </h4>
                <div className="space-y-2">
                  {segments.map((segment, index) => {
                    const isExpanded = expandedSegments[`segment-${index}`];
                    const startTimeSeconds = parseStartTime(segment.startTime);
                    const progress = (startTimeSeconds / (duration || 1)) * 100;

                    return (
                      <div key={`segment-${index}`} className="rounded-lg bg-gray-800 overflow-hidden">
                        {/* Segment Header */}
                        <button
                          onClick={() => toggleSegment(`segment-${index}`)}
                          className="w-full p-3 flex items-start justify-between gap-2 hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-blue-400 font-mono bg-gray-900 px-2 py-0.5 rounded">
                                {segment.startTime}
                              </span>
                              <span className="text-sm font-medium text-white truncate">
                                {segment.title}
                              </span>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSegmentClick(segment.startTime);
                            }}
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex-shrink-0 whitespace-nowrap"
                          >
                            Phát
                          </button>
                          <div className="text-gray-400 flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {/* Segment Description */}
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-gray-700 text-xs text-gray-300">
                            {segment.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!segments || segments.length === 0) && !summary && (
              <div className="p-4 flex items-center justify-center text-gray-400 text-sm">
                Không có dữ liệu phân tích
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoPreview;
