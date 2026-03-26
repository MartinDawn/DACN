import { courseService } from '../../course/services/course.service';
import type { FilterParams, PaginatedCourses, ApiResponse } from '../../course/models/course';

/**
 * Course service for homepage module
 * Re-exports the course service from the course module
 */
export const homepageCourseService = {
  /**
   * Get filtered list of courses
   * @param params - Filter parameters (sort, tags, price range, pagination)
   * @returns Paginated courses response
   */
  async getFilteredCourses(params: FilterParams): Promise<ApiResponse<PaginatedCourses>> {
    return courseService.getFilteredCourses(params);
  }
};
