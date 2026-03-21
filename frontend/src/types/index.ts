export type ImpactLevel = 'high' | 'medium' | 'low';
export type ExperienceLevel = 'entry-level' | 'mid-level' | 'senior';
export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface KeywordMatch {
  keyword: string;
  found_in_resume: boolean;
  frequency: number;
  importance: ImpactLevel;
  context: string | null;
}

export interface SectionScore {
  section: string;
  score: number;
  max_score: number;
  feedback: string;
  suggestions: string[];
}

export interface ATSScoreBreakdown {
  positioning_clarity: number;
  impact_depth: number;
  skill_architecture: number;
  experience_maturity: number;
  human_authenticity: number;
  ats_hygiene: number;
}

export interface ImprovementSuggestion {
  priority: ImpactLevel;
  category: string;
  issue: string;
  fix: string;
  example: string | null;
}

export interface AnalysisResponse {
  session_id: string;
  ats_score: number;
  score_grade: ScoreGrade;
  score_label: string;
  candidate_level: ExperienceLevel;
  breakdown: ATSScoreBreakdown;
  section_scores: SectionScore[];
  matched_keywords: KeywordMatch[];
  missing_critical_keywords: string[];
  improvement_suggestions: ImprovementSuggestion[];
  overall_summary: string;
  job_title_match: string;
  experience_level_match: string;
  top_strengths: string[];
  top_weaknesses: string[];
  hard_caps_applied: string[];
}

export interface UploadResponse {
  session_id: string;
  filename: string;
  sections_detected: string[];
  chunks_indexed: number;
  message: string;
}

export type AppStep = 'upload' | 'analyzing' | 'results';
