import apiClient from "../../auth/services/apiClient";
import type { ApiResponse } from "../../course/models/course";
import type {
  Lecture,
  CreateLecturePayload,
  CreateLectureResponse,
  UploadLectureVideoResponse,
  LectureListResponse,
  UpdateLecturePayload,
  UpdateLectureResponse,
  DeleteLectureResponse,
} from "../models/lecture";

export const lectureService = {
  async getLecturesByCourse(courseId: string, lang = "vi"): Promise<ApiResponse<Lecture[]>> {
    const response = await apiClient.get<ApiResponse<Lecture[]>>(`/Lecture/by-course/${courseId}`, {
      headers: {
        "Accept-Language": lang,
      },
    });
    return response.data;
  },

  // NOTE: create-lecture expects JSON (swagger). We create the lecture first,
  // and upload the video separately via add-video if a file was provided.
  async createLecture(payload: CreateLecturePayload, lang = "vi"): Promise<CreateLectureResponse> {
    const body: any = {
      name: payload.name,
      description: payload.description,
    };
    if (payload.courseId) body.courseId = payload.courseId;

    const response = await apiClient.post<CreateLectureResponse>("/Lecture/create-lecture", body, {
      headers: {
        "Accept-Language": lang,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  async uploadLectureVideo(lectureId: string, file: File, lang = "vi"): Promise<UploadLectureVideoResponse> {
    const formData = new FormData();
    formData.append("videoFile", file);
    const response = await apiClient.post<UploadLectureVideoResponse>(
      `/Lecture/add-video/${lectureId}`,
      formData,
      {
        headers: {
          "Accept-Language": lang,
          // Let axios set Content-Type (multipart boundary)
        },
      }
    );
    return response.data;
  },

  // Update lecture (name/description)
  async updateLecture(lectureId: string, payload: UpdateLecturePayload, lang = "vi"): Promise<UpdateLectureResponse> {
    const response = await apiClient.put<UpdateLectureResponse>(`/Lecture/update/${lectureId}`, payload, {
      headers: {
        "Accept-Language": lang,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // Delete lecture
  async deleteLecture(lectureId: string, lang = "vi"): Promise<DeleteLectureResponse> {
    const response = await apiClient.delete<DeleteLectureResponse>(`/Lecture/delete/${lectureId}`, {
      headers: {
        "Accept-Language": lang,
      },
    });
    return response.data;
  },
};
