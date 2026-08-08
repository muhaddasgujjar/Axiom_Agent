from typing import Any, List, Optional, TypedDict, Annotated


class SubQuestion(TypedDict):
    id: str
    question: str
    angle: str


class Source(TypedDict):
    url: str
    title: str
    sub_question_id: str
    relevance_score: float
    snippet: str


class ExtractedContent(TypedDict):
    url: str
    title: str
    full_text: str
    key_claims: List[str]
    data_points: List[str]
    methodology: Optional[str]
    author: Optional[str]
    date: Optional[str]
    summary: Optional[str]
    word_count: int
    fetch_success: bool
    error: Optional[str]


class Claim(TypedDict):
    text: str
    source_urls: List[str]
    confidence: float
    verified: bool
    sub_question_id: str


class ReportSection(TypedDict):
    title: str
    content: str
    claims: List[str]
    sources_used: List[str]


class ResearchState(TypedDict, total=False):
    query: str
    research_id: str
    user_id: str
    sub_questions: List[SubQuestion]
    search_strategy: str
    sources: List[Source]
    extracted: List[ExtractedContent]
    fetch_errors: List[str]
    draft_sections: List[ReportSection]
    draft_summary: str
    verified_sections: List[ReportSection]
    removed_claims: List[Claim]
    verification_score: float
    final_report: str
    final_report_json: str
    citations: List[str]
    status: str
    messages: List[Any]
    error: Optional[str]
    duration_seconds: float
