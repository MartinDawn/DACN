export interface Course {
  id: string; // Maps to CourseId for navigation
  requestId?: string; // Maps to the Request Id
  title: string;
  instructor: string;
  category: string;
  price: number;
  status: 'published' | 'pending';
  submittedDate: string;
  image: string;
  lessons: number;
}
