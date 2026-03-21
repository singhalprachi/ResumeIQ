from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class ImpactLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class KeywordMatch(BaseModel):
    keyword: str
    found_in_resume: bool
    frequency: int = 0
    importance: ImpactLevel
    context: Optional[str] = None


class SectionScore(BaseModel):
    section: str
    score: float
    max_score: float
    feedback: str
    suggestions: List[str] = []


class ATSScoreBreakdown(BaseModel):
    # SOP 6-dimension scores (0-100 each, raw)
    positioning_clarity: float = Field(default=0, ge=0, le=100)
    impact_depth: float = Field(default=0, ge=0, le=100)
    skill_architecture: float = Field(default=0, ge=0, le=100)
    experience_maturity: float = Field(default=0, ge=0, le=100)
    human_authenticity: float = Field(default=0, ge=0, le=100)
    ats_hygiene: float = Field(default=0, ge=0, le=100)

    # Legacy fields kept for backward compatibility
    keyword_match: float = Field(default=0, ge=0, le=100)
    skills_alignment: float = Field(default=0, ge=0, le=100)
    experience_relevance: float = Field(default=0, ge=0, le=100)
    formatting_quality: float = Field(default=0, ge=0, le=100)
    education_match: float = Field(default=0, ge=0, le=100)


class ImprovementSuggestion(BaseModel):
    priority: ImpactLevel
    category: str
    issue: str
    fix: str
    example: Optional[str] = None


class AnalysisResponse(BaseModel):
    session_id: str
    ats_score: float = Field(ge=0, le=100)
    score_grade: str
    score_label: str
    candidate_level: str = "mid-level"
    breakdown: ATSScoreBreakdown
    section_scores: List[SectionScore]
    matched_keywords: List[KeywordMatch]
    missing_critical_keywords: List[str]
    improvement_suggestions: List[ImprovementSuggestion]
    overall_summary: str
    job_title_match: str
    experience_level_match: str
    top_strengths: List[str]
    top_weaknesses: List[str]
    hard_caps_applied: List[str] = []


class AnalysisRequest(BaseModel):
    session_id: str
    job_description: str
