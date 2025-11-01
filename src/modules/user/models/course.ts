// export interface MyCourse {
//   id: string;
//   imageUrl: string;
//   name: string;
//   instructorName: string;
//   rating: number;
//   price: number;
// }

export interface RecommendedCourse {
  id: string;
  imageUrl: string;
  name: string;
  instructorName: string;
  rating: number;
  price: number;
}

export interface CourseDetail {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  instructorName: string;
  instructorAvatar?: string;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  totalHours: number;
  categories?: string[];
  originalPrice?: number;
  discountPercent?: number;
  learningObjectives?: string[];
  curriculum?: {
    title: string;
    lessons: string;
    duration: string;
    topics: string[];
  }[];
}

export interface CourseComment {
  commentId: string;
  studentName: string;
  rate: number;
  content: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface MyCourse {
  id: string;
  imageUrl: string;
  name: string;
  instructorName: string;
  // Sửa 'rating' thành 'averageRating' để khớp với API mới
  averageRating: number; 
  totalReviews: number;
  price: number;
  originalPrice?: number | null;
  totalHours: number;
  totalStudents: number;
  isBestseller: boolean;
}
export interface PaginatedCourses {
  items: MyCourse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FilterParams {
  Page?: number;
  PageSize?: number;
  SortBy?: 'rating' | 'newest' | 'priceasc' | 'pricedesc' | 'popularity';
  TagId?: string;
  MinPrice?: number;
  MaxPrice?: number;
}


export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}