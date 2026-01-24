import type { RequestInstructorPayload, RequestInstructorResponse } from "../models/instructor";
import { instructorService } from "../services/instructor.service";

export const useRequestInstructor = () => {
  const send = (payload: RequestInstructorPayload, lang?: string): Promise<RequestInstructorResponse> => {
    return instructorService.requestInstructor(payload, lang);
  };

  return { send };
};
