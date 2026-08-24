"""
KnowVerse AI Service — FastAPI NLP pipeline
Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
Setup: pip install -r requirements.txt && python -m spacy download en_core_web_sm
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import re
import os
from typing import List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("knowverse-ai")

app = FastAPI(
    title="KnowVerse AI Service",
    description="NLP pipeline for knowledge graph extraction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "knowverse-ai"}

# Load spaCy model on startup
nlp = None

@app.on_event("startup")
async def load_model():
    global nlp
    try:
        nlp = spacy.load("en_core_web_sm")
        logger.info("✅ spaCy model loaded: en_core_web_sm")
    except OSError:
        logger.warning("⚠️  spaCy model not found. Run: python -m spacy download en_core_web_sm")


# ── Pydantic Models ──────────────────────────────────────────

class ExtractionRequest(BaseModel):
    text: str
    model: str = "spacy-en"

class Triple(BaseModel):
    subject: str
    relation: str
    object: str
    confidence: float
    source_text: str

class ExtractionResponse(BaseModel):
    triples: List[Triple]
    entity_count: int
    sentence_count: int
    model_used: str


# ── Text Preprocessing ───────────────────────────────────────

def preprocess(text: str) -> str:
    """Clean and normalize text."""
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep sentence-ending punctuation
    text = re.sub(r'[^\w\s.,!?;:\-\'\"()]', ' ', text)
    return text.strip()


def segment_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    if not nlp:
        # Fallback: split on punctuation
        return [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 10]
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 10]


# ── Named Entity Recognition ────────────────────────────────

def extract_entities(doc) -> List[dict]:
    """Extract named entities from spaCy doc."""
    entities = []
    seen = set()
    for ent in doc.ents:
        key = (ent.text.strip(), ent.label_)
        if key not in seen and len(ent.text.strip()) > 1:
            seen.add(key)
            entities.append({
                "text": ent.text.strip(),
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
            })
    return entities


# ── Relation Extraction ──────────────────────────────────────

def extract_triples_from_doc(doc) -> List[dict]:
    """
    Hybrid relation extraction:
    1. Dependency-parse based (subject-verb-object)
    2. Named-entity pair + verb patterns
    3. Simple pattern matching for common predicates
    """
    triples = []
    seen = set()

    for sent in doc.sents:
        sent_text = sent.text.strip()
        if len(sent_text) < 10:
            continue

        # Method 1: Dependency parse — find root verb + nsubj + dobj/pobj
        root = next((t for t in sent if t.dep_ == "ROOT"), None)
        if root and root.pos_ in ("VERB", "AUX"):
            subjects = [w for w in root.lefts if "subj" in w.dep_]
            objects = [
                w for w in root.rights
                if w.dep_ in ("dobj", "pobj", "attr", "acomp", "oprd")
            ]

            for subj in subjects:
                # Expand subject to full noun phrase
                subj_text = " ".join([t.text for t in subj.subtree
                                      if t.dep_ not in ("punct", "det")]).strip()
                for obj in objects:
                    obj_text = " ".join([t.text for t in obj.subtree
                                         if t.dep_ not in ("punct", "det")]).strip()
                    rel = root.lemma_

                    if (len(subj_text) > 1 and len(obj_text) > 1
                            and len(subj_text) < 100 and len(obj_text) < 100):
                        key = (subj_text.lower(), rel, obj_text.lower())
                        if key not in seen:
                            seen.add(key)
                            triples.append({
                                "subject": subj_text,
                                "relation": rel,
                                "object": obj_text,
                                "confidence": 0.75,
                                "source_text": sent_text,
                            })

        # Method 2: Named entity pair + connecting verb
        entities_in_sent = [(ent.text, ent.label_) for ent in sent.ents]
        if len(entities_in_sent) >= 2:
            ent1, ent2 = entities_in_sent[0], entities_in_sent[1]
            # Find verbs between entities
            verbs = [t for t in sent if t.pos_ == "VERB"]
            for verb in verbs:
                key = (ent1[0].lower(), verb.lemma_, ent2[0].lower())
                if key not in seen and ent1[0] != ent2[0]:
                    seen.add(key)
                    triples.append({
                        "subject": ent1[0],
                        "relation": verb.lemma_,
                        "object": ent2[0],
                        "confidence": 0.65,
                        "source_text": sent_text,
                    })

        # Method 3: Pattern matching for common predicates
        pattern_triples = _pattern_match(sent_text)
        for pt in pattern_triples:
            key = (pt["subject"].lower(), pt["relation"], pt["object"].lower())
            if key not in seen:
                seen.add(key)
                triples.append(pt)

    return triples


PATTERNS = [
    (re.compile(r'^(.+?)\s+(?:is|was)\s+(?:the\s+)?(?:CEO|founder|president|chairman|director|head)\s+of\s+(.+)$', re.I), 'leads'),
    (re.compile(r'^(.+?)\s+founded\s+(.+)$', re.I), 'founded'),
    (re.compile(r'^(.+?)\s+(?:acquired|bought|purchased)\s+(.+)$', re.I), 'acquired'),
    (re.compile(r'^(.+?)\s+(?:is\s+a\s+)?subsidiary\s+of\s+(.+)$', re.I), 'is subsidiary of'),
    (re.compile(r'^(.+?)\s+(?:developed|built|created|invented)\s+(.+)$', re.I), 'developed'),
    (re.compile(r'^(.+?)\s+(?:invested\s+in|funded)\s+(.+)$', re.I), 'invested in'),
    (re.compile(r'^(.+?)\s+(?:works?\s+(?:for|at)|employed\s+by)\s+(.+)$', re.I), 'works at'),
    (re.compile(r'^(.+?)\s+(?:collaborated|partnered)\s+with\s+(.+)$', re.I), 'partnered with'),
    (re.compile(r'^(.+?)\s+(?:located|based|headquartered)\s+in\s+(.+)$', re.I), 'located in'),
]

def _pattern_match(sentence: str) -> List[dict]:
    results = []
    for pattern, relation in PATTERNS:
        match = pattern.match(sentence.strip())
        if match:
            subj = match.group(1).strip()
            obj = match.group(2).strip()
            if 1 < len(subj) < 150 and 1 < len(obj) < 150:
                results.append({
                    "subject": subj,
                    "relation": relation,
                    "object": obj,
                    "confidence": 0.70,
                    "source_text": sentence,
                })
    return results


# ── API Endpoints ────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "spacy_loaded": nlp is not None,
        "model": "en_core_web_sm" if nlp else None,
    }


@app.post("/extract", response_model=ExtractionResponse)
async def extract(request: ExtractionRequest):
    if not request.text or len(request.text.strip()) < 5:
        raise HTTPException(status_code=422, detail="Text is too short")

    text = preprocess(request.text[:50000])  # limit input

    if not nlp:
        # Fallback without spaCy
        sentences = segment_sentences(text)
        triples = []
        for sent in sentences[:100]:
            triples.extend(_pattern_match(sent))
        return ExtractionResponse(
            triples=[Triple(**t) for t in triples[:200]],
            entity_count=0,
            sentence_count=len(sentences),
            model_used="pattern-fallback",
        )

    doc = nlp(text)
    raw_triples = extract_triples_from_doc(doc)
    entities = extract_entities(doc)
    sentences = list(doc.sents)

    # Deduplicate and sort by confidence
    unique_triples = list({
        (t["subject"].lower(), t["relation"], t["object"].lower()): t
        for t in raw_triples
    }.values())
    unique_triples.sort(key=lambda x: x["confidence"], reverse=True)

    logger.info(f"Extracted {len(unique_triples)} triples from {len(sentences)} sentences")

    return ExtractionResponse(
        triples=[Triple(**t) for t in unique_triples[:300]],
        entity_count=len(entities),
        sentence_count=len(sentences),
        model_used="en_core_web_sm",
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
