export interface Lecture {
  id: string;
  name: string;
  description: string;
  courseId: string;
  videoUrl?: string;
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
  file?: File | null; // <-- allow optional file when creating lecture
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
