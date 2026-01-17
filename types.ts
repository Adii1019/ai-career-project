

export enum AppState {
  USER_TYPE_SELECTION,
  SIGN_IN,
  SIGN_UP,
  PROFILE_BUILDING,
  RESUME_BUILDER,
  GENERATING,
  RESULTS,
}

export enum UserType {
  IN_EDUCATION = 'in_education',
  COMPLETED_EDUCATION = 'completed_education',
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  verified: boolean;
}

export interface EducationEntry {
  id: string;
  level: string;
  field: string;
  specialization: string;
  institution: string;
  grade: string;
  startYear: string;
  endYear: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  age: string;
  location: string;
  education10th: string;
  education10thSchool: string;
  education12th: string;
  education12thSchool: string;
  education12thStream: string;

  educationHistory: EducationEntry[];

  hardSkills: string;
  softSkills: string;
  toolsAndSoftware: string;
  certifications: string;
  languages: string;
  internships: string;
  projects: string;
  favoriteSubjects: string;
  subjectProficiency: { [key: string]: string };
  quizAnswers: { [key: string]: string };
  preferredIndustries: string;
  workPreferences: string;
  higherStudies: string;
  dreamJobRoles: string;
  resume: File | null;
}

export interface LearningStep {
  step: string;
  recommendation: string;
  details: string;
}

export interface Resource {
  title: string;
  url: string;
}

export interface CareerRecommendation {
  careerTitle: string;
  description: string;
  relevanceJustification: string;
  skillGaps: string[];
  learningPath: LearningStep[];
  youtubeTutorials: Resource[];
  freeCourses: Resource[];
  ebooksOrBlogs: Resource[];
}
