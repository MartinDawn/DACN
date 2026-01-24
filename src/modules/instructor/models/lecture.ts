export interface Lecture {
  id: string;
  name: string;
  description: string;
  courseId: string;
  
  // Updated to reflect "Lecture as Chapter" grouping
  // These arrays contain the content of the lecture
  videos: any[]; // Can be strings or objects depending on API
  documentNames: string[];
  quizNames: string[];
  
  // Legacy or simplified properties
  videoUrl?: string; // Optional, mostly for backward compatibility or single-video view
  createdAt?: string;
  updatedAt?: string;
  order?: number;
  chapterId?: string;
  chapterName?: string;
  chapterOrder?: number;
}

export interface CreateLecturePayload {
  name: string;
  description: string;
  courseId: string;
  // file removed from payload type here as it is handled separately now
}

interface LectureResponseBase {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface CreateLectureResponse extends LectureResponseBase {
  data?: Lecture;
}

export interface UploadLectureVideoResponse extends LectureResponseBase {
  data?: Lecture;
}

export interface LectureListResponse extends LectureResponseBase {
  data?: Lecture[];
}

// Add update / delete types
export interface UpdateLecturePayload {
  name?: string;
  description?: string;
}

export interface UpdateLectureResponse extends LectureResponseBase {
  data?: Lecture;
}

export interface DeleteLectureResponse extends LectureResponseBase {
  data?: { id: string } | null;
}
