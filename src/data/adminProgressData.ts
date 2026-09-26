import type { CatalogProgress } from "./catalogData";
import type { CurriculumProgress } from "./curriculumData";

// One student's combined catalog + curriculum progress, as returned by
// GET /admin/students/progress and GET /admin/students/{id}/progress. catalog/curriculum are the
// exact same shapes the self-service GET /catalog/progress and GET /curriculum/progress return -
// nothing trimmed, byDifficulty/byTopic included in full.
export type AdminStudentProgress = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  catalog: CatalogProgress;
  curriculum: CurriculumProgress;
};
