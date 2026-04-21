"""
ATS Scoring Engine - SOP-Aligned
Scoring Dimensions (sum = 100):
  1. Positioning & Clarity        - 20%
  2. Impact & Achievement Depth   - 25%
  3. Skill Architecture & Depth   - 20%
  4. Experience Quality & Maturity- 15%
  5. Human Language & Authenticity- 10%
  6. ATS & Structure Hygiene      - 10%
"""

import json
import logging
from openai import AsyncOpenAI

from app.core.config import settings
from app.core.vectorstore import retrieve_relevant_chunks
from app.models.schemas import (
    AnalysisResponse,
    ATSScoreBreakdown,
    ImprovementSuggestion,
    KeywordMatch,
    SectionScore,
)

logger = logging.getLogger(__name__)

SCORING_SYSTEM_PROMPT = """You are a senior resume evaluation expert and career strategist. You score resumes using a strict, calibrated SOP.

════════════════════════════════════════════
SCORING DIMENSIONS - TOTAL 100 POINTS
════════════════════════════════════════════

## 1. POSITIONING & CLARITY - 20 points

If Profile Summary is MISSING -> score this dimension low (0-30 range). Summary is critical for positioning.

If summary exists but is generic, has no domain, no role identity -> Heavy penalty here.

REWARD:
  - Clear role label ("Backend Developer", "Data Analyst")
  - Experience length clarity ("3.5 years of experience")
  - Domain/tech positioning
  - Specific skill anchors

STRONG: "Backend Developer with 3.5 years of experience in scalable API architecture using Node.js and PostgreSQL."
WEAK: "Seeking a challenging opportunity to grow professionally."

Score 0-100.

---

## 2. IMPACT & ACHIEVEMENT DEPTH - 25 points

HARD PENALTY: If more than 50% of bullet points begin with:
"Responsible for", "Worked on", "Helped in", "Assisted with" -> major reduction.

REWARD:
  - Quantified results (numbers, %, $, time saved)
  - Outcome language ("reduced latency by 40%")
  - Ownership verbs ("led", "architected", "owned", "launched")
  - Business effect visible

BULLET COUNT RULE (per job/experience entry):
  - Less than 3 bullets per role -> "Too sparse, insufficient detail" -> -8 pts
  - More than 6 bullets per role -> "Too verbose, hurts ATS readability" -> -5 pts
  - Ideal: 3-6 bullets per role
  - Count bullets for EACH role and mention in section_scores feedback

Score 0-100.

---

## 3. SKILL ARCHITECTURE & DEPTH - 20 points

NOT skill count. Skill STRUCTURE.

MANDATORY: Resume MUST have a dedicated "Skills" or "Key Skills" section.
  - Missing Skills section entirely -> -15 pts on this dimension
  - Skills must be grouped: Frontend / Backend / DevOps / Tools / Soft Skills
  - Random ungrouped skill dump -> additional penalty

PENALTY if:
  - 30+ total skills listed
  - No logical grouping
  - Tools listed with no supporting experience

ALSO: Skill-to-experience ratio matters. 1 year experience + 28 tools = low credibility.

REWARD: Grouped skills, technical skills weighted higher, soft skills < 15% of section.

Score 0-100.

---

## 4. EXPERIENCE QUALITY & MATURITY - 15 points

REWARD:
  - Increasing responsibility over time
  - Leadership/ownership indicators
  - Complexity level of work
  - Cross-functional exposure

Entry-level: projects/internships OK. Mid-level: ownership expected.

Score 0-100.

---

## 5. HUMAN LANGUAGE & AUTHENTICITY - 10 points

Detects "ChatGPT resume smell" AND filler/junk text.

FILLER & JUNK TEXT DETECTION (CRITICAL):
  - ChatGPT prompt text visible in resume -> SEVERE penalty -15 pts
  - Lorem ipsum / placeholder text -> SEVERE penalty -15 pts
  - Template instructions left in resume (e.g. "Write your experience here") -> HIGH priority flag
  - Extra irrelevant text, repeated meaningless phrases -> penalty
  - If detected -> report EXACTLY what filler text was found in improvement_suggestions
  - Mark as HIGH priority with exact quote of filler text found

PENALIZE:
  - Repeated sentence structures
  - Generic buzzwords: "dynamic", "passionate", "results-driven", "synergy", "leverage"
  - High abstraction, low specificity
  - AI-generated phrasing patterns

REWARD:
  - Sentence rhythm variation
  - Concrete nouns, specific product/tool names
  - Natural phrasing

Score 0-100.

---

## 6. ATS & STRUCTURE HYGIENE - 10 points

PAGE LENGTH RULES (STRICT):
  - Entry-level (0-2 years): MUST be 1 page -> 2+ pages = -10 pts on this dimension
  - Mid-level (2-5 years): 1-2 pages acceptable
  - Senior (5+ years): Max 2 pages -> 3+ pages = -5 pts on this dimension
  - Estimate page count from content density and word count
  - Flag page length violations in improvement_suggestions

OTHER CHECKS:
  - Standard section headers present (Summary, Experience, Education, Skills)
  - No heavy table/column layouts that break ATS parsing
  - Bullet point consistency throughout
  - Clean and consistent date formatting
  - Contact information complete (name, email, phone, LinkedIn)

Score 0-100.

════════════════════════════════════════════
CALIBRATION (MUST FOLLOW)
════════════════════════════════════════════

Entry-level: average = 58-68, strong = 78-85
Mid-level: average = 60-72, strong = 80-88
Do NOT inflate scores. 90+ is rare and exceptional.

════════════════════════════════════════════
SCORING IMPACT SUMMARY
════════════════════════════════════════════

| Rule                        | Penalty         | Dimension           |
|-----------------------------|-----------------|---------------------|
| No Profile Summary          | 0-30 in Positioning | Positioning & Clarity |
| Missing Key Skills section  | -15 pts         | Skill Architecture  |
| Entry-level > 1 page        | -10 pts         | ATS Hygiene         |
| Senior > 2 pages            | -5 pts          | ATS Hygiene         |
| <3 bullets per role         | -8 pts          | Impact & Achievement|
| >6 bullets per role         | -5 pts          | Impact & Achievement|
| Filler/ChatGPT prompt text  | -15 pts         | Human Authenticity  |
| >50% passive bullet verbs   | major reduction | Impact & Achievement|
| 30+ skills, no grouping     | reduction       | Skill Architecture  |

════════════════════════════════════════════
OUTPUT - ONLY VALID JSON, NO MARKDOWN
════════════════════════════════════════════

{
  "summary_present": <bool>,
  "candidate_level": "<entry-level|mid-level|senior>",
  "breakdown": {
    "positioning_clarity": <float 0-100>,
    "impact_depth": <float 0-100>,
    "skill_architecture": <float 0-100>,
    "experience_maturity": <float 0-100>,
    "human_authenticity": <float 0-100>,
    "ats_hygiene": <float 0-100>
  },
  "section_scores": [
    {
      "section": "<dimension name>",
      "score": <weighted points earned, e.g. 16.5>,
      "max_score": <max weighted points, e.g. 20.0>,
      "feedback": "<specific, honest feedback mentioning bullet counts, page length, skills section>",
      "suggestions": ["<concrete actionable fix>"]
    }
  ],
  "matched_keywords": [
    {
      "keyword": "<keyword from JD>",
      "found_in_resume": <bool>,
      "frequency": <int>,
      "importance": "<high|medium|low>",
      "context": "<where in JD this appears>"
    }
  ],
  "missing_critical_keywords": ["<keyword>"],
  "improvement_suggestions": [
    {
      "priority": "<high|medium|low>",
      "category": "<Positioning|Impact|Skills|Experience|Authenticity|ATS|Keywords>",
      "issue": "<specific problem - mention exact bullet counts, page issues, filler text found>",
      "fix": "<exactly how to fix>",
      "example": "<rewritten example>"
    }
  ],
  "overall_summary": "<3-4 sentence honest expert assessment>",
  "job_title_match": "<job title from JD>",
  "experience_level_match": "<Matches|Overqualified|Underqualified>",
  "top_strengths": ["<specific strength>"],
  "top_weaknesses": ["<specific weakness>"],
  "hard_caps_applied": ["<any hard caps triggered e.g. 'Missing skills section: -15 pts', 'Entry-level resume is 2 pages: -10 pts ATS'>"]
}"""


def calculate_weighted_score(breakdown: dict, summary_present: bool) -> float:
    score = (
        breakdown.get("positioning_clarity", 0) * 0.20
        + breakdown.get("impact_depth", 0) * 0.25
        + breakdown.get("skill_architecture", 0) * 0.20
        + breakdown.get("experience_maturity", 0) * 0.15
        + breakdown.get("human_authenticity", 0) * 0.10
        + breakdown.get("ats_hygiene", 0) * 0.10
    )
    # Remove harsh hard cap - let positioning_clarity score naturally reflect missing summary
    return round(score, 1)


def score_to_grade(score: float) -> tuple[str, str]:
    if score >= 85:
        return "A", "Excellent"
    elif score >= 75:
        return "B", "Strong"
    elif score >= 65:
        return "C", "Average"
    elif score >= 50:
        return "D", "Needs Work"
    else:
        return "F", "Poor"


async def run_ats_analysis(
    session_id: str,
    full_resume_text: str,
    resume_sections: dict,
    job_description: str,
    page_count: int = 1,
) -> AnalysisResponse:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    relevant_chunks = await retrieve_relevant_chunks(
        session_id=session_id,
        query=job_description,
        top_k=settings.TOP_K_CHUNKS,
    )
    rag_context = "\\n\\n---\\n\\n".join(relevant_chunks) if relevant_chunks else full_resume_text[:3000]

    user_prompt = f"""
## JOB DESCRIPTION:
{job_description}

## FULL RESUME TEXT:
{full_resume_text[:5000]}

## MOST RELEVANT RESUME SECTIONS (RAG-retrieved):
{rag_context}

## DETECTED SECTIONS: {json.dumps(list(resume_sections.keys()))}

## ACTUAL PAGE COUNT: {page_count} pages (use this exact count, do not estimate)

CANDIDATE LEVEL DETERMINATION:
Analyze the RESUME (not JD) to determine candidate's actual experience level:
- Entry-level (0-2 years): Resume is 1 page OR mentions 0-2 years experience (recent graduates, internships, first jobs)
- Mid-level (2-5 years): Resume is 2 pages AND mentions 2-5 years experience (most common for professionals)
- Senior (5+ years): Resume is 2 pages AND mentions 5+ years experience (senior/lead roles, leadership)

Look for experience indicators in resume: "2 years", "3+ years", "Since 2021", job titles (Junior, Associate, Senior, Lead), total career duration.

Analyze this resume carefully:
1. Determine candidate level from page count + experience years mentioned in resume
2. Count bullet points per each job/experience role
3. Use the ACTUAL PAGE COUNT provided above (do not estimate from content)
4. Check for dedicated Skills/Key Skills section
5. Scan for any filler text, ChatGPT prompts, or placeholder content
6. Apply all penalties and hard caps as specified in the rubric

Return ONLY valid JSON - no markdown, no explanation outside JSON.
"""

    logger.info(f"GPT-4o analysis for session {session_id}")
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SCORING_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
        max_tokens=4000,
    )

    data = json.loads(response.choices[0].message.content)
    breakdown_raw = data["breakdown"]
    summary_present = data.get("summary_present", True)
    verified_score = calculate_weighted_score(breakdown_raw, summary_present)
    grade, label = score_to_grade(verified_score)

    breakdown = ATSScoreBreakdown(
        keyword_match=breakdown_raw.get("positioning_clarity", 0),
        skills_alignment=breakdown_raw.get("skill_architecture", 0),
        experience_relevance=breakdown_raw.get("experience_maturity", 0),
        formatting_quality=breakdown_raw.get("ats_hygiene", 0),
        education_match=breakdown_raw.get("human_authenticity", 0),
        positioning_clarity=breakdown_raw.get("positioning_clarity", 0),
        impact_depth=breakdown_raw.get("impact_depth", 0),
        skill_architecture=breakdown_raw.get("skill_architecture", 0),
        experience_maturity=breakdown_raw.get("experience_maturity", 0),
        human_authenticity=breakdown_raw.get("human_authenticity", 0),
        ats_hygiene=breakdown_raw.get("ats_hygiene", 0),
    )

    section_scores = [SectionScore(**s) for s in data.get("section_scores", [])]
    matched_keywords = [KeywordMatch(**k) for k in data.get("matched_keywords", [])]
    suggestions = [ImprovementSuggestion(**s) for s in data.get("improvement_suggestions", [])]
    priority_order = {"high": 0, "medium": 1, "low": 2}
    suggestions.sort(key=lambda x: priority_order.get(x.priority, 3))

    return AnalysisResponse(
        session_id=session_id,
        ats_score=verified_score,
        score_grade=grade,
        score_label=label,
        breakdown=breakdown,
        section_scores=section_scores,
        matched_keywords=matched_keywords,
        missing_critical_keywords=data.get("missing_critical_keywords", []),
        improvement_suggestions=suggestions,
        overall_summary=data.get("overall_summary", ""),
        job_title_match=data.get("job_title_match", ""),
        experience_level_match=data.get("experience_level_match", "Unknown"),
        top_strengths=data.get("top_strengths", []),
        top_weaknesses=data.get("top_weaknesses", []),
        hard_caps_applied=data.get("hard_caps_applied", []),
        candidate_level=data.get("candidate_level", "mid-level"),
    )
