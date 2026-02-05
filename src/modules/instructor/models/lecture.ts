export interface Lecture {
  id: string;
  name: string;
  description: string;
  courseId: string;
  
  displayOrder?: number;

  // Updated to reflect "Lecture as Chapter" grouping
  // These arrays contain the content of the lecture
  videos: any[]; // Can be strings or objects depending on API
  documents?: any[]; // Array of document objects
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
  displayOrder?: number;
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
  displayOrder?: number;
}

export interface UpdateLectureResponse extends LectureResponseBase {
  data?: Lecture;
}

export interface DeleteLectureResponse extends LectureResponseBase {
  data?: { id: string } | null;
}

export interface UpdateVideoPayload {
  title?: string;
  videoFile?: File; 
}

export interface UpdateOrderPayload {
  id: string;
  displayOrder: number;
}

export interface QuizQuestionPayload {
  question: string;
  key: string; // "A", "B", "C", "D"
  description?: string;
  // Specific answer fields implied by UI
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface CreateQuizPayload {
  lectureId: string;
  name: string;
  description?: string; // Mapped to API if possible, or part of logic
  testTime?: number;    // Default 0
  attemptCount?: number; // Default 0
  questions: QuizQuestionPayload[];
}
