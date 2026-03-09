export interface Course {
  id: string; // Maps to CourseId for navigation
  requestId?: string; // Maps to the Request Id
  title: string;
  instructor: string;
  category: string;
  price: number;
  status: 'published' | 'pending' | 'Public' | 'Private';
  submittedDate: string;
  image: string;
  lessons: number;
  totalStudents?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCourses {
  items: Course[];
  pagination: PaginationInfo;
}
