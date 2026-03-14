import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

/* ─── Article data ─────────────────────────────────────────────────────── */
const articles: Record<string, Article> = {
  "nlp-pipelines": {
    slug: "nlp-pipelines",
    title: "Building Production-Ready NLP Pipelines with Flask",
    category: "NLP Engineering",
    date: "January 2025",
    readTime: "8 min read",
    accent: "#ff4d6d",
    tags: ["Flask", "NLP", "Python", "Production", "spaCy", "REST API"],
    intro:
      "Shipping an NLP model that demos well in a Jupyter notebook is the easy part. Making it survive real traffic, malformed inputs, and Monday-morning spikes — that's where real engineering begins. Here's how I think about building NLP pipelines that are actually production-ready.",
    sections: [
      {
        heading: "1. Start with a Clear Data Contract",
        body: `Before writing a single model call, define what your API accepts and returns. NLP endpoints fail in production because engineers skip this step and then argue about encoding issues for days.

\`\`\`python
# schemas.py
from dataclasses import dataclass
from typing import Optional

@dataclass
class AnalysisRequest:
    text: str
    language: str = "en"
    max_tokens: Optional[int] = 512

@dataclass
class AnalysisResponse:
    sentiment: str          # "positive" | "negative" | "neutral"
    confidence: float       # 0.0 – 1.0
    keywords: list[str]
    processing_ms: int
\`\`\`

Your schema is your contract. Validate every incoming request against it before the model ever sees the data.`,
      },
      {
        heading: "2. Build a Preprocessing Pipeline, Not a Chain of Functions",
        body: `One of the most common mistakes I see is preprocessing logic scattered across route handlers. The moment you need to reuse or test any step, you're copy-pasting. Instead, build a composable pipeline:

\`\`\`python
class TextPipeline:
    def __init__(self):
        self.steps = []

    def add(self, fn):
        self.steps.append(fn)
        return self  # enables chaining

    def run(self, text: str) -> str:
        for step in self.steps:
            text = step(text)
        return text

# Usage
pipeline = (
    TextPipeline()
    .add(lambda t: t.lower().strip())
    .add(remove_urls)
    .add(normalize_unicode)
    .add(remove_stopwords)
)
\`\`\`

Each step is independently testable. Adding or removing a preprocessing stage takes one line.`,
      },
      {
        heading: "3. Model Loading: Do It Once, Do It Right",
        body: `Loading a spaCy model or a HuggingFace tokenizer on every request is a silent killer. It looks fine locally and destroys you at scale.

\`\`\`python
# model_registry.py  — load once at startup
import spacy
from functools import lru_cache

@lru_cache(maxsize=1)
def get_nlp_model():
    """Load model once; subsequent calls return cached instance."""
    nlp = spacy.load("en_core_web_sm")
    return nlp

# In your Flask app factory:
with app.app_context():
    get_nlp_model()  # warm the cache before first request
\`\`\`

Flask's application context is your friend here — warm the model during startup so the first real user request doesn't pay the load penalty.`,
      },
      {
        heading: "4. Error Handling is Part of the Feature",
        body: `NLP APIs receive the worst inputs imaginable: emoji-only text, 40,000-word pastes, binary garbage encoded as UTF-8. Build for it.

\`\`\`python
class NLPError(Exception):
    def __init__(self, message: str, code: int = 400):
        self.message = message
        self.code = code

@app.errorhandler(NLPError)
def handle_nlp_error(e):
    return {"error": e.message, "code": e.code}, e.code

def validate_input(text: str) -> str:
    if not text or not text.strip():
        raise NLPError("Input text cannot be empty")
    if len(text) > 10_000:
        raise NLPError("Text exceeds maximum length of 10,000 characters")
    return text.strip()
\`\`\``,
      },
      {
        heading: "5. Measure Everything — Latency Is a Feature",
        body: `Wrap your inference calls with timing middleware from day one. You cannot optimize what you do not measure.

\`\`\`python
import time
from functools import wraps

def timed(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        # attach to result or log
        return result, elapsed_ms
    return wrapper

@timed
def run_inference(text: str) -> dict:
    nlp = get_nlp_model()
    doc = nlp(text)
    return extract_features(doc)
\`\`\`

Log every request with its latency. When a model update ships and p99 latency doubles, you'll be glad you did.`,
      },
      {
        heading: "Closing Thoughts",
        body: `The gap between a demo NLP app and a production NLP service is mostly discipline, not magic. Define contracts, compose pipelines, load models once, handle failures gracefully, and measure everything. The models are the easy part — the engineering is what ships.`,
      },
    ],
  },

  "prompt-engineering": {
    slug: "prompt-engineering",
    title: "Prompt Engineering Patterns That Actually Work",
    category: "Generative AI",
    date: "February 2025",
    readTime: "6 min read",
    accent: "#fbbf24",
    tags: ["LLMs", "Prompt Engineering", "Claude", "GPT", "Chain-of-Thought"],
    intro:
      "After months of building LLM-powered features at CertifyMe, I've noticed that most prompt engineering advice online is surface-level. Here are the patterns that have actually held up in production — where reliability and consistency matter far more than a clever one-shot demo.",
    sections: [
      {
        heading: "Pattern 1 — Role + Context + Constraint",
        body: `The most reliable prompt structure I've found is three parts: a role, specific context, and explicit output constraints. Skipping any one of them leads to inconsistent results.

\`\`\`
You are a technical content editor specializing in software engineering blogs.

Context: The following is a draft blog post introduction written by a junior engineer.
Audience: senior engineers and hiring managers at AI startups.

Task: Rewrite the introduction to be more authoritative and technically precise.
Constraints:
- Maximum 4 sentences
- No generic phrases like "In today's world" or "In recent years"
- End with a specific technical claim, not a question
- Output ONLY the rewritten text, no commentary

Draft: [INSERT_DRAFT]
\`\`\`

The constraint block is the most important part. Without it, LLMs fill silence with filler.`,
      },
      {
        heading: "Pattern 2 — Chain-of-Thought for Complex Classification",
        body: `For tasks where the model needs to reason before it classifies, forcing intermediate reasoning dramatically improves accuracy. The key is structuring the output format explicitly.

\`\`\`
Analyze the following customer support ticket and classify it.

Think through this step by step:
1. What is the user's primary complaint?
2. Is this a billing issue, technical issue, or feature request?
3. What is the urgency level (1-5) based on their language?
4. What department should handle this?

Format your response EXACTLY as:
REASONING: [your step-by-step analysis]
CATEGORY: [billing | technical | feature_request]
URGENCY: [1-5]
ROUTE_TO: [billing | engineering | product]

Ticket: [INSERT_TICKET]
\`\`\`

The explicit format means you can parse it reliably in code without regex gymnastics.`,
      },
      {
        heading: "Pattern 3 — Few-Shot with Negative Examples",
        body: `Standard few-shot prompting shows the model what to do. Adding negative examples (what NOT to do) is underused and surprisingly effective for precision tasks.

\`\`\`
Generate a concise, professional blog post title from the topic.

GOOD examples:
Topic: Flask NLP API → Title: "Building Production NLP APIs with Flask"
Topic: LLM prompting → Title: "Prompt Patterns for Reliable LLM Outputs"

BAD examples (avoid these patterns):
Topic: Flask NLP API → "The Ultimate Guide to Flask NLP in 2024" ❌ (clickbait)
Topic: LLM prompting → "How I Learned to Love Prompt Engineering" ❌ (personal narrative)
Topic: LLM prompting → "Prompt Engineering: A Complete Overview" ❌ (vague)

Now generate a title for:
Topic: [INSERT_TOPIC]
Title:
\`\`\``,
      },
      {
        heading: "Pattern 4 — Output Contracts with JSON Schema",
        body: `When you need structured data from an LLM, don't just ask for JSON — give it a schema with types and descriptions. Models follow schemas far more reliably than prose descriptions.

\`\`\`python
EXTRACTION_PROMPT = """
Extract information from the job description below.
Return valid JSON matching this exact schema:

{
  "role_title": string,           // exact job title as written
  "seniority": "junior" | "mid" | "senior" | "lead",
  "required_skills": string[],    // only explicitly required, max 8
  "preferred_skills": string[],   // nice-to-have, max 5
  "remote": boolean,
  "salary_range": string | null   // null if not mentioned
}

Job description:
{jd_text}
"""
\`\`\`

With Claude, you can combine this with \`response_format\` for guaranteed JSON output.`,
      },
      {
        heading: "The Most Important Prompt Engineering Insight",
        body: `After all these patterns, the single most impactful thing you can do is maintain a prompt versioning system. Every time a prompt changes, log it with the date, reason, and sample outputs.

LLM providers update their models silently. A prompt that worked perfectly in December may behave differently in March. Without version history, you'll spend hours debugging a "regression" that was actually a model update.

Treat prompts like code: version them, test them, and review changes.`,
      },
    ],
  },

  "emotion-recognition": {
    slug: "emotion-recognition",
    title: "Emotion Recognition in Text: Beyond Binary Sentiment",
    category: "AI Research",
    date: "March 2025",
    readTime: "10 min read",
    accent: "#ff6b35",
    tags: ["Sentiment Analysis", "BERT", "Emotion AI", "NLP", "Research"],
    intro:
      "Sentiment analysis — positive, negative, neutral — was state of the art in 2015. For the recommendation system I built for my IJRASET-published research, binary sentiment wasn't enough. I needed to know if a user was joyful, melancholic, energized, or anxious. Here's what I learned building multi-class emotion recognition from scratch.",
    sections: [
      {
        heading: "Why Binary Sentiment Falls Short",
        body: `Consider these two sentences:

- *"This song makes me cry every single time."*
- *"I can't stop crying because of this horrible news."*

A binary classifier labels both as negative. But the first evokes nostalgic sadness — perfect for soft piano ballads. The second evokes grief — perhaps silence is more appropriate. The emotional nuance drives entirely different recommendations.

My DJoz project needed to map emotional states to multimedia content, which meant I needed at least 6 emotion classes: joy, sadness, anger, fear, disgust, surprise — the Ekman model. Possibly more.`,
      },
      {
        heading: "Approach 1: Rule-Based VADER (Baseline)",
        body: `VADER (Valence Aware Dictionary and sEntiment Reasoner) is a lexicon-based tool tuned for social media text. It's fast, requires no training data, and works surprisingly well for simple cases.

\`\`\`python
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def get_vader_emotion(text: str) -> dict:
    scores = analyzer.polarity_scores(text)
    # scores: {'neg': 0.0, 'neu': 0.294, 'pos': 0.706, 'compound': 0.8316}

    compound = scores['compound']
    if compound >= 0.5:
        return {"emotion": "joy", "confidence": compound}
    elif compound <= -0.5:
        return {"emotion": "sadness", "confidence": abs(compound)}
    else:
        return {"emotion": "neutral", "confidence": 1 - abs(compound)}
\`\`\`

**Limitations:** VADER only gives polarity, not granular emotions. It can't distinguish anger from disgust, or excitement from contentment. It's a useful baseline but not production-ready for affective computing.`,
      },
      {
        heading: "Approach 2: Fine-Tuned BERT",
        body: `The significant jump in quality came from fine-tuning a BERT model on the GoEmotions dataset (58,000 Reddit comments labeled across 27 emotion categories, reduced to 6 for our use case).

\`\`\`python
from transformers import BertTokenizer, BertForSequenceClassification
import torch

EMOTION_LABELS = ["joy", "sadness", "anger", "fear", "surprise", "neutral"]

class EmotionClassifier:
    def __init__(self, model_path: str):
        self.tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
        self.model = BertForSequenceClassification.from_pretrained(
            model_path,
            num_labels=len(EMOTION_LABELS)
        )
        self.model.eval()

    def predict(self, text: str) -> dict:
        inputs = self.tokenizer(
            text, return_tensors="pt",
            truncation=True, max_length=128, padding=True
        )
        with torch.no_grad():
            logits = self.model(**inputs).logits

        probs = torch.softmax(logits, dim=-1)[0]
        top_idx = probs.argmax().item()

        return {
            "emotion": EMOTION_LABELS[top_idx],
            "confidence": round(probs[top_idx].item(), 3),
            "all_scores": {
                label: round(probs[i].item(), 3)
                for i, label in enumerate(EMOTION_LABELS)
            }
        }
\`\`\`

Fine-tuned BERT achieved **74% accuracy** on our test set, versus **52%** for the VADER baseline on multi-class emotion.`,
      },
      {
        heading: "Approach 3: Zero-Shot with LLMs",
        body: `For production, I also tested zero-shot classification using Claude. The surprising finding: zero-shot LLM classification was competitive with fine-tuned BERT for low-frequency emotions like "surprise" and "disgust," where training data was scarce.

\`\`\`python
def zero_shot_emotion(text: str, client) -> dict:
    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=100,
        messages=[{
            "role": "user",
            "content": f"""Classify the primary emotion in this text.

Text: "{text}"

Respond with ONLY a JSON object:
{{"emotion": "joy|sadness|anger|fear|surprise|neutral", "confidence": 0.0-1.0, "reasoning": "one sentence"}}"""
        }]
    )
    import json
    return json.loads(response.content[0].text)
\`\`\`

The tradeoff: LLM inference is ~10-50x slower and more expensive than a local BERT model. For real-time applications like DJoz, local BERT wins on latency.`,
      },
      {
        heading: "Combining the Approaches: Ensemble in Production",
        body: `The final system uses a simple ensemble: BERT for primary classification, VADER as a confidence check, and LLM fallback only when BERT confidence is below a threshold.

\`\`\`python
def classify_emotion(text: str) -> dict:
    bert_result = bert_classifier.predict(text)

    if bert_result["confidence"] > 0.75:
        return bert_result  # high confidence: trust BERT

    vader_result = get_vader_emotion(text)

    if bert_result["emotion"] == vader_result["emotion"]:
        return bert_result  # agreement: trust the prediction

    # Disagreement + low confidence: escalate to LLM
    return zero_shot_emotion(text, claude_client)
\`\`\`

This ensemble covered >90% of requests with local inference (fast, cheap) and fell back to LLM for genuinely ambiguous cases (~8% of inputs).`,
      },
      {
        heading: "Key Takeaway",
        body: `Multi-class emotion recognition is not a solved problem — but it's approachable. Start with VADER for speed, upgrade to fine-tuned BERT for accuracy, and use LLMs as a smart fallback. The ensemble approach gave us the best of all three worlds in production.

This research was published in IJRASET as part of the DJoz emotion-based recommendation system. The full paper covers the facial recognition pipeline alongside the text classification work described here.`,
      },
    ],
  },

  "computer-vision-web": {
    slug: "computer-vision-web",
    title: "Computer Vision in Web Apps: A Practical Guide",
    category: "Computer Vision",
    date: "March 2025",
    readTime: "7 min read",
    accent: "#34d399",
    tags: ["OpenCV", "Flask", "Computer Vision", "Python", "Streaming"],
    intro:
      "Most computer vision tutorials end at model inference in a script. Getting that working inside a real web application — with live camera feeds, reasonable latency, and graceful failure handling — is a different problem entirely. Here's how I approached it building the DJoz emotion detection system and the Face Detection project.",
    sections: [
      {
        heading: "The Streaming Problem",
        body: `The core challenge with CV in web apps is that browser JavaScript and Python OpenCV live in completely different worlds. The bridge that works reliably: MJPEG streaming over HTTP.

Instead of WebSockets or WebRTC (which are more complex to set up), Flask can serve a continuous MJPEG stream from OpenCV frames with a generator function.

\`\`\`python
import cv2
from flask import Flask, Response

app = Flask(__name__)
camera = cv2.VideoCapture(0)  # 0 = default webcam

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break

        # Run CV processing on each frame
        frame = process_frame(frame)

        # Encode frame as JPEG
        _, buffer = cv2.imencode('.jpg', frame,
                                  [cv2.IMWRITE_JPEG_QUALITY, 70])
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n'
               + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )
\`\`\`

In your HTML, a single \`<img>\` tag consumes this stream:

\`\`\`html
<img src="/video_feed" width="640" height="480" />
\`\`\`

No JavaScript required. It just works — including on mobile browsers.`,
      },
      {
        heading: "Face Detection with OpenCV Haar Cascades",
        body: `For the Face Detection project, I used Haar Cascades — OpenCV's built-in face detector. It's not the most accurate method, but it runs at real-time speed without a GPU.

\`\`\`python
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

def process_frame(frame: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,   # image pyramid scale
        minNeighbors=5,    # higher = fewer false positives
        minSize=(48, 48)   # minimum face size in pixels
    )

    for (x, y, w, h) in faces:
        # Draw bounding box
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 77, 109), 2)

        # Crop face for recognition
        face_roi = gray[y:y+h, x:x+w]
        face_roi = cv2.resize(face_roi, (100, 100))

        # Run LBPH recognizer
        label, confidence = recognizer.predict(face_roi)
        if confidence < 80:  # lower = more confident in LBPH
            cv2.putText(frame, f"ID: {label}", (x, y-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    return frame
\`\`\``,
      },
      {
        heading: "Emotion Detection from Facial Expressions",
        body: `For DJoz, face detection was only step one. I needed to classify the emotion from the detected face region. The pipeline:

1. Detect face with Haar Cascade
2. Crop and normalize the face ROI
3. Run the emotion classification model
4. Map emotion to music/video recommendations

\`\`\`python
EMOTIONS = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]

def get_emotion_from_frame(frame: np.ndarray) -> str | None:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(48, 48))

    if len(faces) == 0:
        return None

    # Use the largest face detected
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

    face_roi = gray[y:y+h, x:x+w]
    face_roi = cv2.resize(face_roi, (48, 48))
    face_roi = face_roi.astype("float32") / 255.0
    face_roi = np.expand_dims(face_roi, axis=[0, -1])  # add batch + channel

    predictions = emotion_model.predict(face_roi, verbose=0)[0]
    return EMOTIONS[np.argmax(predictions)]
\`\`\``,
      },
      {
        heading: "Performance Optimization",
        body: `Running CV inference on every frame at 30fps will saturate your CPU instantly. Two optimizations that made the most difference:

**1. Skip frames** — process every N-th frame, display all frames:

\`\`\`python
frame_count = 0
PROCESS_EVERY_N = 3  # process 1 in 3 frames
current_emotion = "neutral"

def generate_frames():
    global frame_count, current_emotion

    while True:
        success, frame = camera.read()
        frame_count += 1

        if frame_count % PROCESS_EVERY_N == 0:
            current_emotion = get_emotion_from_frame(frame)

        # Overlay emotion on every frame
        if current_emotion:
            cv2.putText(frame, current_emotion.upper(), (20, 40),
                       cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 77, 109), 2)

        yield encode_frame(frame)
\`\`\`

**2. Resize input frames** before detection — halving the resolution reduces detection time by ~4x with minimal accuracy loss for faces that are reasonably close to the camera.`,
      },
      {
        heading: "Lessons From Shipping This",
        body: `A few hard-won lessons from getting this into a working product:

- **Camera release is critical** — always release \`cv2.VideoCapture\` on app teardown, or you'll leak the camera resource and subsequent requests will fail silently.
- **Test on multiple lighting conditions** early — Haar Cascade accuracy drops significantly in low light. Consider a preprocessing step that adjusts brightness/contrast.
- **JPEG quality 65-75** is the sweet spot for streaming — above that the bandwidth increase isn't worth it, below that faces look too compressed to classify.
- **Mobile cameras** send portrait-orientation frames with EXIF rotation metadata that OpenCV ignores. Handle this with a rotation check if you support mobile webcam input.`,
      },
    ],
  },

  "llm-agents-production": {
    slug: "llm-agents-production",
    title: "Building LLM Agents That Actually Work in Production",
    category: "Generative AI",
    date: "April 2025",
    readTime: "9 min read",
    accent: "#fbbf24",
    tags: ["LLM Agents", "Tool Use", "Claude", "Production", "Reliability"],
    intro:
      "Everyone can build an LLM agent demo that works 80% of the time. Shipping one that works reliably in production — handling edge cases, recovering from failures, staying within latency budgets — is a fundamentally different engineering problem. Here's what I've learned building agentic systems at CertifyMe.",
    sections: [
      {
        heading: "The Demo-to-Production Gap",
        body: `The classic LLM agent demo: give the model a task, it calls a tool, gets a result, responds. Works beautifully in a Jupyter notebook with curated inputs.

In production, the gap manifests as:
- The model calls a tool with malformed arguments
- A tool call times out mid-task
- The model loops indefinitely trying to complete an ambiguous task
- Context window fills up on a long task, truncating critical history
- The model "hallucinates" a tool call to a function that doesn't exist

Each of these is predictable. You need explicit defenses for all of them before you ship.`,
      },
      {
        heading: "The Foundation: Strict Tool Schemas",
        body: `The most impactful change you can make is tightening your tool schemas. Every optional field, every loose type, is an opportunity for the model to guess wrong.

\`\`\`python
# WEAK — too permissive
search_tool = {
    "name": "search_docs",
    "description": "Search documentation",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string"}
        }
    }
}

# STRONG — explicit constraints
search_tool = {
    "name": "search_docs",
    "description": "Search internal documentation by keyword. Returns top 3 matching excerpts.",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query (2-8 words, no special chars)",
                "minLength": 3,
                "maxLength": 100
            },
            "category": {
                "type": "string",
                "enum": ["api", "guides", "changelog", "faq"],
                "description": "Filter results to a specific doc category"
            }
        },
        "required": ["query"]
    }
}
\`\`\`

The description field is not cosmetic — the model reads it when deciding what arguments to pass. Be specific about format, constraints, and what the tool returns.`,
      },
      {
        heading: "Reliable Tool Execution with Retries and Timeouts",
        body: `Wrap every tool execution with:
1. Input validation before the call
2. A timeout that prevents hanging
3. Structured error responses the model can act on (not exceptions that crash your process)

\`\`\`python
import asyncio
from typing import Any

class ToolExecutor:
    def __init__(self, timeout_seconds: int = 10):
        self.timeout = timeout_seconds

    async def execute(self, tool_name: str, tool_input: dict) -> dict:
        try:
            tool_fn = self._get_tool(tool_name)
            if not tool_fn:
                return {"error": f"Unknown tool: {tool_name}", "recoverable": False}

            validated = self._validate_input(tool_name, tool_input)
            if validated.get("error"):
                return {"error": validated["error"], "recoverable": True}

            result = await asyncio.wait_for(
                tool_fn(**validated["data"]),
                timeout=self.timeout
            )
            return {"result": result, "success": True}

        except asyncio.TimeoutError:
            return {
                "error": f"Tool '{tool_name}' timed out after {self.timeout}s",
                "recoverable": True,
                "suggestion": "Try a simpler query or break the task into smaller steps"
            }
        except Exception as e:
            return {"error": str(e), "recoverable": False}
\`\`\`

The \`recoverable\` flag tells your orchestrator whether to retry or abort. Pass the full error back to the model — it can often self-correct.`,
      },
      {
        heading: "Loop Detection and Max-Step Guards",
        body: `Agents loop. Every agentic system needs a hard cap on steps, and ideally a smarter loop detector.

\`\`\`python
class AgentOrchestrator:
    MAX_STEPS = 12
    LOOP_WINDOW = 4  # check last N tool calls for repetition

    def __init__(self):
        self.tool_call_history = []

    def _is_looping(self, new_call: dict) -> bool:
        """Detect if agent is repeating the same tool call."""
        recent = self.tool_call_history[-self.LOOP_WINDOW:]
        return sum(
            1 for c in recent
            if c["name"] == new_call["name"] and c["input"] == new_call["input"]
        ) >= 2

    async def run(self, task: str, client) -> str:
        messages = [{"role": "user", "content": task}]

        for step in range(self.MAX_STEPS):
            response = await client.messages.create(
                model="claude-opus-4-6",
                max_tokens=2048,
                tools=TOOLS,
                messages=messages
            )

            if response.stop_reason == "end_turn":
                return extract_final_answer(response)

            tool_use = extract_tool_use(response)
            if self._is_looping(tool_use):
                messages.append({
                    "role": "user",
                    "content": "You appear to be repeating the same action. Reconsider your approach or conclude with what you know."
                })
                continue

            self.tool_call_history.append(tool_use)
            result = await self.executor.execute(tool_use["name"], tool_use["input"])
            messages = update_messages(messages, response, result)

        return "Task could not be completed within the step limit."
\`\`\``,
      },
      {
        heading: "Context Management for Long Tasks",
        body: `The context window is a finite resource. For multi-step tasks, you'll hit the limit if you keep the full conversation history naively.

Strategies that work in production:
- **Summarize tool results** — don't pass the full 5,000-token API response back. Extract the 3 relevant facts.
- **Rolling summary** — every N turns, have the model summarize progress so far, then truncate the raw history.
- **Structured state** — maintain a separate task state dict and pass it as system context each turn, rather than relying on message history.

\`\`\`python
SYSTEM_PROMPT = """
You are a task completion agent.

Current task state:
{state_json}

Completed steps: {completed_steps}
Remaining goal: {remaining_goal}
"""
\`\`\`

Treat message history as ephemeral. Treat task state as your source of truth.`,
      },
      {
        heading: "The One Metric That Matters",
        body: `For LLM agents in production, the metric that matters is **task completion rate on real inputs** — not benchmark scores, not demo performance.

Build an evaluation harness early:
1. Collect a set of 20-50 representative real tasks
2. Run the agent on them weekly
3. Log every failure with the full message trace
4. Before any model or prompt update, run the full eval set

Most agent failures fall into 3 categories: bad tool schemas, missing error recovery, and ambiguous task definitions. Fix the category, not individual cases.`,
      },
    ],
  },

  "mysql-optimization-flask": {
    slug: "mysql-optimization-flask",
    title: "MySQL Query Optimization for Flask Applications",
    category: "Backend Engineering",
    date: "December 2024",
    readTime: "7 min read",
    accent: "#f59e0b",
    tags: ["MySQL", "Flask", "Performance", "SQL", "Indexing"],
    intro:
      "Flask applications rarely start slow. They get slow gradually — as data grows, as queries multiply, as the N+1 problem metastasizes through the codebase. Here are the optimizations that have made the biggest difference in real projects, from the ERP system to the Viblog platform.",
    sections: [
      {
        heading: "Profile Before You Optimize",
        body: `The most common mistake is optimizing by intuition. Always start with measurement.

Enable MySQL's slow query log and set a threshold that catches your real bottlenecks:

\`\`\`sql
-- Enable slow query logging
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;  -- log queries over 100ms
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- Then analyze with EXPLAIN
EXPLAIN SELECT u.id, u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id;
\`\`\`

Look for \`type: ALL\` in EXPLAIN output — that's a full table scan. Every one is a candidate for an index.`,
      },
      {
        heading: "Indexing Strategy That Actually Works",
        body: `Index columns you filter, sort, or join on — in that priority order. A composite index column order matters: put the highest-selectivity column first.

\`\`\`sql
-- Before: full table scan on 500k-row posts table
SELECT * FROM posts WHERE user_id = 42 AND status = 'published'
ORDER BY created_at DESC LIMIT 20;
-- EXPLAIN shows: type=ALL, rows=498234

-- After: composite index
CREATE INDEX idx_posts_user_status_date
ON posts(user_id, status, created_at DESC);
-- EXPLAIN shows: type=ref, rows=12

-- For full-text search on blog content (Viblog use case):
ALTER TABLE posts ADD FULLTEXT INDEX idx_content(title, body);

SELECT id, title, MATCH(title, body) AGAINST ('machine learning' IN BOOLEAN MODE) as relevance
FROM posts
WHERE MATCH(title, body) AGAINST ('machine learning' IN BOOLEAN MODE)
ORDER BY relevance DESC
LIMIT 10;
\`\`\``,
      },
      {
        heading: "The N+1 Problem in Flask",
        body: `N+1 is the silent database killer in Flask apps. It happens when you load a list of objects, then fetch related data for each one individually.

\`\`\`python
# BAD — N+1: 1 query for users + N queries for their post counts
def get_dashboard_data():
    users = db.execute("SELECT id, name FROM users LIMIT 50").fetchall()
    result = []
    for user in users:
        # This fires a separate query for EACH user
        count = db.execute(
            "SELECT COUNT(*) FROM posts WHERE user_id = ?", [user['id']]
        ).fetchone()[0]
        result.append({**dict(user), 'post_count': count})
    return result  # 51 queries total

# GOOD — 1 query with JOIN
def get_dashboard_data():
    rows = db.execute("""
        SELECT u.id, u.name, COUNT(p.id) as post_count
        FROM users u
        LEFT JOIN posts p ON p.user_id = u.id
        GROUP BY u.id, u.name
        LIMIT 50
    """).fetchall()
    return [dict(row) for row in rows]  # 1 query total
\`\`\`

In the ERP system, fixing N+1 queries on the account listing page reduced load time from 4.2s to 180ms on a 10k-row dataset.`,
      },
      {
        heading: "Connection Pooling with Flask",
        body: `Opening a new database connection for every request is expensive — 20-40ms per connection setup. Use a connection pool.

\`\`\`python
# config.py
import mysql.connector.pooling

db_config = {
    "host": "localhost",
    "user": "app_user",
    "password": "...",
    "database": "app_db",
    "pool_name": "main_pool",
    "pool_size": 10,          # concurrent connections
    "pool_reset_session": True,
    "connection_timeout": 30,
}

connection_pool = mysql.connector.pooling.MySQLConnectionPool(**db_config)

# In your Flask app
def get_db():
    return connection_pool.get_connection()

# Use as context manager
@app.route('/api/data')
def get_data():
    with get_db() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM records LIMIT 100")
        return jsonify(cursor.fetchall())
\`\`\`

Pool size = (number of CPU cores × 2) + effective spindle count is a reasonable starting point. Monitor wait times and adjust.`,
      },
      {
        heading: "Bulk Inserts Instead of Row-by-Row",
        body: `For data import features (like the ERP bulk upload), inserting rows one-by-one is catastrophically slow. Use bulk insert with executemany.

\`\`\`python
# BAD — 10,000 round trips to the database
def import_records_slow(records: list[dict]):
    for record in records:
        db.execute(
            "INSERT INTO accounts (name, code, balance) VALUES (?, ?, ?)",
            [record['name'], record['code'], record['balance']]
        )

# GOOD — 1 round trip, up to 100x faster
def import_records_fast(records: list[dict], batch_size: int = 500):
    rows = [(r['name'], r['code'], r['balance']) for r in records]

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        placeholders = ','.join(['(%s,%s,%s)'] * len(batch))
        flat_values = [v for row in batch for v in row]

        db.execute(
            f"INSERT INTO accounts (name, code, balance) VALUES {placeholders}",
            flat_values
        )

    db.commit()
\`\`\`

On our ERP import feature, this took a 10,000-row import from 45 seconds to under 2 seconds.`,
      },
    ],
  },

  "rag-systems-beginners": {
    slug: "rag-systems-beginners",
    title: "RAG Systems: From Theory to Working Implementation",
    category: "Generative AI",
    date: "April 2025",
    readTime: "11 min read",
    accent: "#ff4d6d",
    tags: ["RAG", "Vector DB", "Embeddings", "LLMs", "Python"],
    intro:
      "Retrieval-Augmented Generation is one of the most practical patterns in modern AI engineering — it makes LLMs useful on your own data without fine-tuning. Here's a clear-eyed guide to building a RAG system that actually works, covering the parts tutorials usually skip.",
    sections: [
      {
        heading: "What RAG Actually Is",
        body: `RAG is a pattern: retrieve relevant context from your data, then pass it to an LLM to generate a grounded answer. It solves the core limitation of vanilla LLMs — they know nothing about your private data, and their knowledge has a cutoff date.

The pipeline has three distinct phases:
1. **Ingestion** — chunk your documents, embed them, store in a vector DB
2. **Retrieval** — embed the user's query, find similar chunks
3. **Generation** — pass retrieved chunks + query to an LLM, get an answer

Each phase has sharp edges. Let's go through them.`,
      },
      {
        heading: "Phase 1: Chunking Strategy",
        body: `How you split documents dramatically affects retrieval quality. The naive approach (split every 512 tokens) often breaks semantic units — a paragraph that explains a concept gets cut in the middle.

\`\`\`python
from typing import Generator

def chunk_document(
    text: str,
    chunk_size: int = 400,
    overlap: int = 80
) -> Generator[str, None, None]:
    """
    Sliding window chunker with overlap to preserve context at boundaries.
    Tries to split on paragraph boundaries first.
    """
    paragraphs = text.split('\n\n')
    current_chunk = []
    current_len = 0

    for para in paragraphs:
        para_len = len(para.split())

        if current_len + para_len > chunk_size and current_chunk:
            yield ' '.join(current_chunk)
            # Keep overlap: last N words of the chunk
            overlap_text = ' '.join(' '.join(current_chunk).split()[-overlap:])
            current_chunk = [overlap_text]
            current_len = overlap

        current_chunk.append(para)
        current_len += para_len

    if current_chunk:
        yield ' '.join(current_chunk)
\`\`\`

For code documentation, use code-aware splitters that respect function and class boundaries. For PDFs, extract tables separately — embedding table content as plain text loses structure.`,
      },
      {
        heading: "Phase 2: Embedding and Storage",
        body: `Embeddings convert text into vectors where semantically similar text is close in vector space. The embedding model choice matters more than people expect.

\`\`\`python
import numpy as np
from sentence_transformers import SentenceTransformer
import json

class VectorStore:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.vectors: list[np.ndarray] = []
        self.metadata: list[dict] = []

    def add_documents(self, chunks: list[str], source: str) -> None:
        embeddings = self.model.encode(
            chunks,
            batch_size=32,
            show_progress_bar=True,
            normalize_embeddings=True  # normalize for cosine similarity
        )
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            self.vectors.append(embedding)
            self.metadata.append({
                "text": chunk,
                "source": source,
                "chunk_index": i
            })

    def search(self, query: str, top_k: int = 4) -> list[dict]:
        query_embedding = self.model.encode(
            [query], normalize_embeddings=True
        )[0]

        # Cosine similarity via dot product (vectors are normalized)
        similarities = np.dot(np.array(self.vectors), query_embedding)
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        return [
            {**self.metadata[i], "score": float(similarities[i])}
            for i in top_indices
            if similarities[i] > 0.35  # minimum similarity threshold
        ]
\`\`\`

For production, use a proper vector database like ChromaDB, Pinecone, or pgvector instead of in-memory arrays. The index and search algorithms matter at scale.`,
      },
      {
        heading: "Phase 3: Generation with Context",
        body: `Once you have retrieved chunks, the prompt structure determines answer quality. Context window positioning matters — LLMs perform better when the most relevant context is at the beginning or end, not buried in the middle.

\`\`\`python
import anthropic

def generate_answer(
    query: str,
    retrieved_chunks: list[dict],
    client: anthropic.Anthropic
) -> str:
    if not retrieved_chunks:
        return "I don't have enough information to answer that question."

    # Format context — most relevant first
    context_parts = []
    for i, chunk in enumerate(retrieved_chunks, 1):
        context_parts.append(
            f"[Source {i}: {chunk['source']}]\\n{chunk['text']}"
        )

    context = "\\n\\n---\\n\\n".join(context_parts)

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system="""You are a helpful assistant that answers questions based ONLY on the provided context.
If the context doesn't contain enough information to answer the question, say so clearly.
Never make up information not present in the context.
Always cite which source(s) your answer is based on.""",
        messages=[{
            "role": "user",
            "content": f"Context:\\n{context}\\n\\nQuestion: {query}"
        }]
    )

    return response.content[0].text
\`\`\``,
      },
      {
        heading: "The Parts Tutorials Skip",
        body: `**Re-ranking** — The top-K vector search results aren't always the most relevant. A cross-encoder re-ranker scores each (query, chunk) pair more accurately. Add one if retrieval precision matters.

**Hybrid search** — Combine vector similarity with keyword search (BM25). Vector search finds semantic matches; keyword search catches exact terms. The combination is almost always better than either alone.

**Chunk metadata filtering** — Before vector search, pre-filter by metadata (document type, date range, category). This is faster and more precise than relying on the model to ignore irrelevant sources.

**Hallucination detection** — After generation, run a quick check: ask the model to cite which specific sentences in the context support each claim. If it can't cite, the answer might be hallucinated.`,
      },
      {
        heading: "Evaluating Your RAG System",
        body: `Build an eval set of 20-50 question/answer pairs from your real documents. For each, measure:

- **Retrieval recall** — is the answer in the top-K chunks at all?
- **Answer faithfulness** — does the generated answer stick to the context?
- **Answer relevance** — does it actually address the question?

\`\`\`python
def evaluate_retrieval(qa_pairs: list[dict], store: VectorStore) -> dict:
    hits = 0
    for qa in qa_pairs:
        chunks = store.search(qa['question'], top_k=4)
        retrieved_texts = ' '.join(c['text'] for c in chunks)
        # Rough check: does the expected answer appear in retrieved context?
        if qa['answer'].lower()[:50] in retrieved_texts.lower():
            hits += 1
    return {"retrieval_recall": hits / len(qa_pairs)}
\`\`\`

Run this evaluation on every chunking or embedding model change. Small changes in chunking strategy can cause large swings in recall.`,
      },
    ],
  },

  "flask-api-design": {
    slug: "flask-api-design",
    title: "Designing Clean REST APIs with Flask: Lessons from the Field",
    category: "Backend Engineering",
    date: "November 2024",
    readTime: "8 min read",
    accent: "#34d399",
    tags: ["Flask", "REST API", "Python", "Architecture", "Blueprints"],
    intro:
      "I've built Flask APIs ranging from a simple blog backend to a full ERP system. The ones that stayed maintainable shared the same structural decisions. The ones that became nightmares skipped the same shortcuts. Here's what I wish I'd known earlier.",
    sections: [
      {
        heading: "Use Blueprints from Day One",
        body: `The single biggest structural mistake in Flask apps is putting all routes in a single \`app.py\`. Blueprints are Flask's module system — use them before you need them, not after.

\`\`\`python
# project structure
app/
├── __init__.py        # app factory
├── blueprints/
│   ├── auth/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── posts/
│   │   ├── __init__.py
│   │   └── routes.py
│   └── admin/
│       ├── __init__.py
│       └── routes.py
└── models.py

# blueprints/posts/routes.py
from flask import Blueprint, jsonify, request

posts_bp = Blueprint('posts', __name__, url_prefix='/api/v1/posts')

@posts_bp.route('/', methods=['GET'])
def list_posts():
    ...

@posts_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    ...

# app/__init__.py — factory pattern
def create_app(config=None):
    app = Flask(__name__)

    from .blueprints.posts.routes import posts_bp
    from .blueprints.auth.routes import auth_bp

    app.register_blueprint(posts_bp)
    app.register_blueprint(auth_bp)

    return app
\`\`\`

The factory pattern also makes testing trivial — create a fresh app instance with test config for each test.`,
      },
      {
        heading: "Consistent Error Responses",
        body: `Nothing frustrates API consumers more than inconsistent error formats. Define one error schema and enforce it globally.

\`\`\`python
# errors.py
from flask import jsonify
from http import HTTPStatus

class APIError(Exception):
    def __init__(self, message: str, status_code: int = 400, error_code: str = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or f"ERR_{status_code}"
        super().__init__(message)

def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(e):
        return jsonify({
            "error": {
                "code": e.error_code,
                "message": e.message,
                "status": e.status_code
            }
        }), e.status_code

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": {"code": "NOT_FOUND", "message": "Resource not found", "status": 404}}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred", "status": 500}}), 500
\`\`\`

Every error response always has the same shape. Frontend developers can write a single error handler.`,
      },
      {
        heading: "Request Validation Before Business Logic",
        body: `Never let malformed data reach your business logic. Validate at the route layer.

\`\`\`python
from functools import wraps
from flask import request, jsonify

def require_json_fields(*required_fields):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            data = request.get_json(silent=True)
            if not data:
                raise APIError("Request body must be valid JSON", 400)

            missing = [f for f in required_fields if f not in data or data[f] is None]
            if missing:
                raise APIError(
                    f"Missing required fields: {', '.join(missing)}",
                    400,
                    "MISSING_FIELDS"
                )
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Usage
@posts_bp.route('/', methods=['POST'])
@require_json_fields('title', 'content', 'author_id')
def create_post():
    data = request.get_json()
    # data is guaranteed to have title, content, author_id
    ...
\`\`\``,
      },
      {
        heading: "Versioning and Pagination",
        body: `Version your API from the start — changing it later requires coordinating with all consumers simultaneously.

\`\`\`python
# Always prefix with /api/v{N}
url_prefix='/api/v1/posts'

# Standard pagination — never return unbounded lists
@posts_bp.route('/', methods=['GET'])
def list_posts():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # cap at 100

    total = db.execute("SELECT COUNT(*) FROM posts WHERE status='published'").fetchone()[0]
    posts = db.execute(
        "SELECT * FROM posts WHERE status='published' ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [per_page, (page - 1) * per_page]
    ).fetchall()

    return jsonify({
        "data": [dict(p) for p in posts],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
            "has_next": page * per_page < total,
            "has_prev": page > 1
        }
    })
\`\`\``,
      },
      {
        heading: "Authentication Middleware",
        body: `Role-based auth as a decorator keeps route handlers clean and authorization logic centralized.

\`\`\`python
import jwt
from functools import wraps
from flask import request, g

def require_auth(roles: list[str] = None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                raise APIError("Authentication required", 401, "UNAUTHENTICATED")

            try:
                payload = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
                g.current_user = payload
            except jwt.ExpiredSignatureError:
                raise APIError("Token expired", 401, "TOKEN_EXPIRED")
            except jwt.InvalidTokenError:
                raise APIError("Invalid token", 401, "INVALID_TOKEN")

            if roles and payload.get('role') not in roles:
                raise APIError("Insufficient permissions", 403, "FORBIDDEN")

            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Usage — clean route handlers, auth handled declaratively
@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@require_auth(roles=['admin', 'editor'])
def delete_post(post_id):
    # g.current_user is available here
    ...
\`\`\``,
      },
    ],
  },

  "opencv-face-recognition": {
    slug: "opencv-face-recognition",
    title: "Face Recognition with OpenCV and LBPH: A Complete Walkthrough",
    category: "Computer Vision",
    date: "June 2024",
    readTime: "9 min read",
    accent: "#34d399",
    tags: ["OpenCV", "LBPH", "Face Recognition", "Python", "Computer Vision"],
    intro:
      "The Face Detection and Recognition System was my first deep dive into computer vision. I used Python and OpenCV with the LBPH algorithm — a classical approach that's underrated for constrained, real-time scenarios. Here's the complete walkthrough, including the parts that took me days to figure out.",
    sections: [
      {
        heading: "LBPH vs Deep Learning: When to Choose What",
        body: `Local Binary Pattern Histogram (LBPH) is a texture-based recognition algorithm that predates deep learning. You might wonder why use it at all in 2024.

Reasons LBPH still wins in specific scenarios:
- **No GPU required** — runs on a Raspberry Pi
- **Minimal training data** — works with 20-30 samples per person
- **Incremental training** — add new people without retraining from scratch
- **Fast inference** — under 5ms per face on CPU

Deep learning models (FaceNet, ArcFace) are more accurate with larger datasets but have real deployment overhead. For a campus access system or small-team attendance tracker, LBPH is often the right call.`,
      },
      {
        heading: "Data Collection Pipeline",
        body: `Recognition quality is entirely determined by training data quality. I built a systematic collection pipeline before touching the recognition model.

\`\`\`python
import cv2
import os

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

def collect_training_samples(person_id: int, person_name: str, samples: int = 40):
    """Collect N face samples from webcam for a given person."""
    save_dir = f"dataset/{person_id}_{person_name}"
    os.makedirs(save_dir, exist_ok=True)

    cap = cv2.VideoCapture(0)
    count = 0

    print(f"Collecting {samples} samples for {person_name}. Look at camera.")

    while count < samples:
        ret, frame = cap.read()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(100, 100))

        for (x, y, w, h) in faces:
            face_roi = gray[y:y+h, x:x+w]
            face_roi = cv2.resize(face_roi, (200, 200))

            # Augmentation: slight brightness variation
            alpha = 0.8 + (count % 5) * 0.08  # 0.8 to 1.12
            face_roi = cv2.convertScaleAbs(face_roi, alpha=alpha, beta=0)

            cv2.imwrite(f"{save_dir}/{count}.jpg", face_roi)
            count += 1

            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, f"{count}/{samples}", (x, y-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        cv2.imshow('Collection', frame)
        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"Collected {count} samples.")
\`\`\`

Vary head angles and lighting during collection. A model trained only on forward-facing, well-lit faces will fail on profile views or in dim rooms.`,
      },
      {
        heading: "Training the LBPH Model",
        body: `LBPH training is fast — it doesn't do gradient descent, it computes histograms of texture patterns. Training 40 samples per person takes under a second.

\`\`\`python
import numpy as np
from pathlib import Path

def train_recognizer(dataset_dir: str) -> tuple:
    """Train LBPH recognizer from labeled face images."""
    recognizer = cv2.face.LBPHFaceRecognizer_create(
        radius=1,       # LBP circle radius
        neighbors=8,    # sampling points
        grid_x=8,       # histogram grid columns
        grid_y=8,       # histogram grid rows
        threshold=85    # confidence threshold (lower = stricter)
    )

    faces = []
    labels = []
    label_map = {}  # id -> name

    for person_dir in Path(dataset_dir).iterdir():
        if not person_dir.is_dir():
            continue

        person_id, person_name = person_dir.name.split('_', 1)
        person_id = int(person_id)
        label_map[person_id] = person_name

        for img_path in person_dir.glob('*.jpg'):
            img = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
            if img is not None:
                faces.append(img)
                labels.append(person_id)

    print(f"Training on {len(faces)} images across {len(label_map)} people...")
    recognizer.train(faces, np.array(labels))
    recognizer.save('model/face_model.yml')

    return recognizer, label_map
\`\`\``,
      },
      {
        heading: "Real-Time Recognition with Confidence Scoring",
        body: `LBPH's \`predict()\` returns a label and a confidence score. Lower confidence = more certain (it's a distance metric). Understanding this threshold is critical.

\`\`\`python
def run_recognition(recognizer, label_map: dict, confidence_threshold: int = 75):
    cap = cv2.VideoCapture(0)
    recognized_log = []  # for attendance tracking

    while True:
        ret, frame = cap.read()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.2, 5, minSize=(80, 80))

        for (x, y, w, h) in faces:
            face_roi = gray[y:y+h, x:x+w]
            face_roi = cv2.resize(face_roi, (200, 200))

            label_id, confidence = recognizer.predict(face_roi)

            if confidence < confidence_threshold:
                name = label_map.get(label_id, "Unknown")
                color = (0, 255, 0)  # green for recognized
                display = f"{name} ({int(confidence)})"

                if name not in [r['name'] for r in recognized_log[-5:]]:
                    recognized_log.append({'name': name, 'confidence': confidence})
            else:
                name = "Unknown"
                color = (0, 0, 255)  # red for unknown
                display = f"Unknown ({int(confidence)})"

            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(frame, display, (x, y-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        cv2.imshow('Recognition', frame)
        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return recognized_log
\`\`\``,
      },
      {
        heading: "Lessons From Building This",
        body: `**Confidence threshold calibration** is everything. I spent more time on this than on the model itself. Print confidence scores for known and unknown faces in your environment, and set the threshold at the natural gap between the two distributions.

**Face alignment** matters more than I expected. Adding a step that aligns faces to a standard eye position (using facial landmark detection) improved accuracy by ~15% with no model changes.

**False positives are worse than false negatives** for access control. When in doubt, set a stricter threshold and add a fallback (PIN entry) rather than accepting a weak match.

**The model degrades over time** as lighting and appearance change. Budget for periodic retraining with fresh samples — LBPH makes this cheap.`,
      },
    ],
  },

  "ai-workflow-automation": {
    slug: "ai-workflow-automation",
    title: "AI Workflow Automation: Building Smart Pipelines with LLMs",
    category: "Generative AI",
    date: "March 2025",
    readTime: "8 min read",
    accent: "#fbbf24",
    tags: ["Automation", "LLMs", "Workflow", "AI", "Flask", "Python"],
    intro:
      "At CertifyMe, a big part of my R&D work involves replacing brittle rule-based workflows with intelligent pipelines. LLMs are surprisingly good at document classification, data extraction, and routing decisions — if you structure the problem correctly. Here's how to build AI automation that's actually reliable.",
    sections: [
      {
        heading: "Where LLM Automation Beats Rule-Based Systems",
        body: `Rule-based systems are brittle at the edges. An if-else document classifier works until someone submits a document in an unexpected format, language, or category mix. You then write more rules, and the system grows into an unmaintainable tangle.

LLMs excel at:
- **Classification with fuzzy boundaries** — "is this a complaint, a question, or a feature request?" doesn't have crisp rules
- **Structured extraction from unstructured text** — pulling fields from free-form documents
- **Natural language routing** — sending tasks to the right handler based on content
- **Summarization and enrichment** — adding metadata to documents

They struggle at: exact string matching, numeric computation, anything requiring external lookups (without tools), and tasks needing >99.9% reliability.`,
      },
      {
        heading: "Document Classification Pipeline",
        body: `Here's a production-pattern document classifier that routes incoming content to the right processing queue.

\`\`\`python
import anthropic
import json
from enum import Enum

class DocumentCategory(str, Enum):
    CREDENTIAL = "credential"
    INVOICE = "invoice"
    SUPPORT_REQUEST = "support_request"
    FEEDBACK = "feedback"
    OTHER = "other"

CLASSIFIER_PROMPT = """Classify the document below into exactly one category.

Categories:
- credential: certificates, diplomas, transcripts, badges, verification requests
- invoice: payment requests, billing documents, purchase orders
- support_request: bug reports, help requests, technical issues
- feedback: reviews, testimonials, improvement suggestions
- other: anything that doesn't fit the above

Respond with ONLY valid JSON:
{{"category": "<category>", "confidence": <0.0-1.0>, "reason": "<one sentence>"}}

Document:
{document_text}"""

def classify_document(text: str, client: anthropic.Anthropic) -> dict:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=150,
        messages=[{"role": "user", "content": CLASSIFIER_PROMPT.format(document_text=text[:2000])}]
    )

    result = json.loads(response.content[0].text)

    # Fall back to "other" if low confidence
    if result.get("confidence", 0) < 0.6:
        result["category"] = DocumentCategory.OTHER
        result["flagged_for_review"] = True

    return result
\`\`\``,
      },
      {
        heading: "Structured Data Extraction",
        body: `Extracting structured fields from unstructured documents is where LLMs genuinely save weeks of rule-writing.

\`\`\`python
EXTRACTION_PROMPT = """Extract the following fields from the certificate/credential document below.

Required fields (return null if not found):
- holder_name: Full name of the certificate holder
- credential_title: Name of the certification or credential
- issuing_org: Organization that issued it
- issue_date: ISO format date (YYYY-MM-DD) or null
- expiry_date: ISO format date or null
- credential_id: Any certificate/badge ID number or null
- skills: List of skills mentioned (max 8 items)

Return ONLY valid JSON. No commentary.

Document:
{document_text}"""

def extract_credential_data(text: str, client: anthropic.Anthropic) -> dict:
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": EXTRACTION_PROMPT.format(document_text=text)}]
    )

    data = json.loads(response.content[0].text)

    # Post-process and validate
    if data.get("issue_date"):
        try:
            from datetime import datetime
            datetime.fromisoformat(data["issue_date"])
        except ValueError:
            data["issue_date"] = None
            data["date_parse_failed"] = True

    return data
\`\`\``,
      },
      {
        heading: "Building a Reliable Automation Queue",
        body: `LLM calls are slow (~1-5s) and occasionally fail. Never block synchronous request handling on them. Use an async queue.

\`\`\`python
from flask import Flask, jsonify, request
import threading
from queue import Queue

app = Flask(__name__)
processing_queue = Queue()
results_store = {}  # in prod: use Redis

def worker():
    """Background thread consuming the processing queue."""
    client = anthropic.Anthropic()
    while True:
        job = processing_queue.get()
        try:
            classification = classify_document(job['text'], client)
            extraction = extract_credential_data(job['text'], client)
            results_store[job['job_id']] = {
                "status": "complete",
                "classification": classification,
                "extraction": extraction,
            }
        except Exception as e:
            results_store[job['job_id']] = {"status": "failed", "error": str(e)}
        finally:
            processing_queue.task_done()

# Start background worker
threading.Thread(target=worker, daemon=True).start()

@app.route('/api/process', methods=['POST'])
def submit_document():
    import uuid
    job_id = str(uuid.uuid4())
    processing_queue.put({"job_id": job_id, "text": request.json['text']})
    results_store[job_id] = {"status": "pending"}
    return jsonify({"job_id": job_id, "status": "queued"})

@app.route('/api/result/<job_id>')
def get_result(job_id):
    return jsonify(results_store.get(job_id, {"status": "not_found"}))
\`\`\``,
      },
      {
        heading: "Monitoring and Drift Detection",
        body: `LLM-powered automation drifts as prompts age against new model versions. Build monitoring in from the start.

Key metrics to track:
- **Classification distribution** — if the distribution of categories shifts suddenly, investigate. Either your data changed or the model behavior changed.
- **Confidence score trends** — dropping average confidence often precedes accuracy degradation.
- **Extraction completeness** — what fraction of required fields are successfully extracted? A drop signals prompt-model mismatch.
- **Fallback rate** — how often does low confidence trigger manual review? This should stay low.

\`\`\`python
def log_automation_result(job_id: str, result: dict, db):
    db.execute("""
        INSERT INTO automation_log
        (job_id, category, confidence, fields_extracted, flagged_for_review, model_used, ts)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    """, [
        job_id,
        result['classification']['category'],
        result['classification']['confidence'],
        len([v for v in result['extraction'].values() if v is not None]),
        result['classification'].get('flagged_for_review', False),
        "claude-opus-4-6"
    ])
\`\`\`

Review this table weekly. Build a simple dashboard. Automation that isn't monitored is automation you don't trust.`,
      },
    ],
  },

  "sentiment-analysis-twitter": {
    slug: "sentiment-analysis-twitter",
    title: "Real-Time Twitter Sentiment Analysis: Architecture and Lessons",
    category: "NLP Engineering",
    date: "November 2024",
    readTime: "8 min read",
    accent: "#ff4d6d",
    tags: ["Sentiment Analysis", "NLP", "Flask", "Machine Learning", "Chart.js"],
    intro:
      "VibeCheck Twitter was my first end-to-end ML system in production — a real-time sentiment analysis platform for tweets. Building it taught me more about ML engineering than any course. Here's the full story: architecture decisions, model choices, what failed, and what worked.",
    sections: [
      {
        heading: "The Architecture",
        body: `The system has four components:
1. **Data layer** — MySQL storing tweets, sentiment labels, and hashtag metadata
2. **ML pipeline** — text preprocessing + trained classifiers
3. **Flask API** — exposes sentiment analysis as REST endpoints
4. **Dashboard** — Chart.js visualizations for trend monitoring

\`\`\`
User Input (hashtag/keyword)
        ↓
  Flask Route Handler
        ↓
  Text Preprocessing Pipeline
  (tokenize → clean → stem → TF-IDF)
        ↓
  ML Classifier (Logistic Regression / Naive Bayes)
        ↓
  Store Result → MySQL
        ↓
  Dashboard Query → Chart.js Visualization
\`\`\`

The pipeline runs synchronously for the demo (latency ~50ms per tweet), with a batch mode for analyzing historical hashtag data.`,
      },
      {
        heading: "Text Preprocessing Pipeline",
        body: `Raw tweet text is noisy — URLs, hashtags, mentions, emojis, abbreviations. The preprocessing pipeline must handle all of this consistently or your model trains on garbage.

\`\`\`python
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer

nltk.download(['stopwords', 'punkt'], quiet=True)

STOP_WORDS = set(stopwords.words('english')) - {'not', 'no', 'never', 'nor'}
# Keep negation words — they're critical for sentiment!

stemmer = PorterStemmer()

def preprocess_tweet(text: str) -> str:
    # Lowercase
    text = text.lower()
    # Remove URLs
    text = re.sub(r'http\\S+|www\\S+', '', text)
    # Remove @mentions
    text = re.sub(r'@\\w+', '', text)
    # Remove hashtag symbol but keep word
    text = re.sub(r'#(\\w+)', r'\\1', text)
    # Remove special chars, keep letters and spaces
    text = re.sub(r'[^a-z\\s]', '', text)
    # Tokenize
    tokens = text.split()
    # Remove stopwords (keeping negations)
    tokens = [t for t in tokens if t not in STOP_WORDS]
    # Stem
    tokens = [stemmer.stem(t) for t in tokens]
    return ' '.join(tokens)

# Build TF-IDF vectorizer from training data
def build_vectorizer(texts: list[str]) -> TfidfVectorizer:
    vectorizer = TfidfVectorizer(
        max_features=10_000,
        ngram_range=(1, 2),  # unigrams and bigrams
        min_df=2,            # ignore terms in only 1 doc
        max_df=0.95          # ignore terms in 95%+ of docs
    )
    vectorizer.fit(texts)
    return vectorizer
\`\`\``,
      },
      {
        heading: "Training the Classifiers",
        body: `I trained and compared two models: Logistic Regression and Naive Bayes. Both are fast to train and interpret; the winner depends on the dataset.

\`\`\`python
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report
import joblib

def train_models(X_train, X_test, y_train, y_test):
    models = {
        "logistic_regression": LogisticRegression(
            C=1.0,
            max_iter=1000,
            class_weight='balanced',  # handle class imbalance
            solver='lbfgs'
        ),
        "naive_bayes": MultinomialNB(alpha=0.1)  # Laplace smoothing
    }

    results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        results[name] = {
            "model": model,
            "report": classification_report(y_test, preds, output_dict=True)
        }
        print(f"\\n{name}:\\n{classification_report(y_test, preds)}")

    # Save the better model
    best = max(results, key=lambda k: results[k]['report']['weighted avg']['f1-score'])
    joblib.dump(results[best]['model'], f'models/sentiment_{best}.pkl')
    return results

# On our dataset:
# Logistic Regression F1: 0.847
# Naive Bayes F1: 0.812
# LR wins — but NB is faster at inference
\`\`\``,
      },
      {
        heading: "The Dashboard: Real-Time Sentiment Trends",
        body: `The visual layer made the project feel like a real product. I used Chart.js for dynamic trend visualization.

\`\`\`python
# Flask route that feeds the dashboard
@app.route('/api/trends/<hashtag>')
def get_trends(hashtag):
    # Aggregate sentiment over the last 24 hours
    data = db.execute("""
        SELECT
            DATE_FORMAT(analyzed_at, '%H:00') as hour,
            sentiment,
            COUNT(*) as count
        FROM tweet_analyses
        WHERE hashtag = ? AND analyzed_at > NOW() - INTERVAL 24 HOUR
        GROUP BY hour, sentiment
        ORDER BY hour
    """, [hashtag]).fetchall()

    # Reshape for Chart.js
    hours = sorted(set(r['hour'] for r in data))
    series = {'positive': [], 'negative': [], 'neutral': []}

    for hour in hours:
        hour_data = {r['sentiment']: r['count'] for r in data if r['hour'] == hour}
        for sentiment in series:
            series[sentiment].append(hour_data.get(sentiment, 0))

    return jsonify({"labels": hours, "datasets": series})
\`\`\`

\`\`\`javascript
// Frontend Chart.js config
const ctx = document.getElementById('trendChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: response.labels,
    datasets: [
      { label: 'Positive', data: response.datasets.positive, borderColor: '#27c93f', tension: 0.4 },
      { label: 'Negative', data: response.datasets.negative, borderColor: '#ff4d6d', tension: 0.4 },
      { label: 'Neutral',  data: response.datasets.neutral,  borderColor: '#94a3b8', tension: 0.4 }
    ]
  },
  options: { responsive: true, interaction: { intersect: false, mode: 'index' } }
});
\`\`\``,
      },
      {
        heading: "What I'd Do Differently",
        body: `**Negation handling was harder than expected.** "Not happy" and "happy" get the same stem. My fix was preserving bigrams — "not_happy" as a single feature — which helped significantly.

**Class imbalance was real.** Positive tweets dominated the training data, so early models just predicted positive for everything. Using \`class_weight='balanced'\` in sklearn and oversampling negative examples fixed this.

**Slang and abbreviations break standard NLP.** "fr", "ngl", "lowkey" don't appear in NLTK stopword lists or standard embeddings. I built a small domain-specific slang expansion dictionary that preprocessing ran first.

**The model needed periodic retraining.** Twitter language drifts — new slang, new events, new context. A model trained in September 2024 was measurably worse by November on current tweets. Automate retraining on fresh data.`,
      },
    ],
  },

  "jekyll-static-sites": {
    slug: "jekyll-static-sites",
    title: "Jekyll for Developers: Building Fast, Maintainable Static Sites",
    category: "Web Development",
    date: "January 2025",
    readTime: "6 min read",
    accent: "#f87171",
    tags: ["Jekyll", "Static Sites", "HTML/CSS", "Bootstrap", "Liquid"],
    intro:
      "During my time at CertifyMe, I built and maintained multiple production Jekyll sites. Jekyll has an undeserved reputation as a toy blogging tool — it's actually a powerful static site generator that can handle complex content structures with maintainable, fast output. Here's what I learned.",
    sections: [
      {
        heading: "Jekyll's Real Power: Data Files and Collections",
        body: `Most tutorials show Jekyll as a blog engine. The more interesting use is structured data sites — documentation, product listings, team pages — where content lives in YAML/JSON files, not just Markdown posts.

\`\`\`yaml
# _data/certifications.yml
- name: "Oracle Generative AI Professional"
  issuer: "Oracle"
  year: 2025
  category: ai
  badge_color: "#ff4d6d"
  description: "LLMs, OCI Generative AI services, enterprise AI implementation"

- name: "Google Generative AI"
  issuer: "Google"
  year: 2024
  category: ai
  badge_color: "#fbbf24"
  description: "Generative AI fundamentals and real-world applications"
\`\`\`

\`\`\`liquid
{# _includes/certification-card.html #}
{% for cert in site.data.certifications %}
  <div class="cert-card" data-category="{{ cert.category }}">
    <span class="badge" style="background: {{ cert.badge_color }}20; color: {{ cert.badge_color }}">
      {{ cert.category | upcase }}
    </span>
    <h3>{{ cert.name }}</h3>
    <p class="issuer">{{ cert.issuer }} · {{ cert.year }}</p>
    <p>{{ cert.description }}</p>
  </div>
{% endfor %}
\`\`\`

Separating content (YAML) from presentation (Liquid templates) means a non-developer can update content by editing a YAML file — no HTML knowledge required.`,
      },
      {
        heading: "Liquid Templating Patterns",
        body: `Liquid is Jekyll's templating language. Knowing these patterns separates clean Jekyll codebases from messy ones.

\`\`\`liquid
{# Capture reusable snippets #}
{% capture github_icon %}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12..."/>
  </svg>
{% endcapture %}

{# Filter and group data #}
{% assign ai_certs = site.data.certifications | where: "category", "ai" %}
{% assign grouped = site.data.projects | group_by: "year" %}

{# Pagination without plugins #}
{% assign sorted_posts = site.posts | sort: 'date' | reverse %}
{% for post in sorted_posts limit: 6 offset: page.offset %}
  {% include post-card.html post=post %}
{% endfor %}

{# Include with parameters #}
{% include button.html text="View Project" href=project.url style="primary" %}
\`\`\`

The \`include\` + parameters pattern is especially useful — it's Jekyll's equivalent of React components.`,
      },
      {
        heading: "Performance Optimization",
        body: `Jekyll's output is static HTML — it should be fast. But you can still shoot yourself in the foot.

\`\`\`yaml
# _config.yml — key performance settings
compress_html:
  clippings: all
  comments: ["<!-- ", " -->"]
  endings: [html, head, body, li, dt, dd, tr, td, th, p, h1, h2]
  blanklines: false

# Sass/SCSS compilation
sass:
  style: compressed  # minified output
  sourcemap: never

# Exclude dev-only files from build
exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
  - README.md
  - .env
\`\`\`

For images, Jekyll doesn't optimize them automatically. Use a \`_plugins/image_optimizer.rb\` or pre-process images before committing. An unoptimized 4MB hero image will wipe out every other performance gain.

Also: use \`{% unless page.noscript %}\` guards to ensure critical content renders without JavaScript — static sites should work without JS by default.`,
      },
      {
        heading: "CI/CD for Jekyll with GitHub Actions",
        body: `Automating deployment means content updates are just a Git push — no dev involvement needed for routine changes.

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy Jekyll Site

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true  # cache gems for faster builds

      - name: Build site
        run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production

      - name: Check build size
        run: |
          SIZE=$(du -sh _site | cut -f1)
          echo "Build size: $SIZE"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: $\{{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
          cname: yourdomain.com
\`\`\`

Add a link checker step (\`htmlproofer\`) to catch broken links before they ship to production. Nothing undermines credibility like a 404 on a static site.`,
      },
      {
        heading: "When to Use Jekyll vs. Next.js",
        body: `Jekyll is the right choice when:
- Content is updated infrequently (docs, marketing pages, portfolios)
- The team includes non-developers who need to edit content
- You want zero infrastructure — just a CDN serving HTML files
- Build times matter less than simplicity

Next.js (or similar) wins when:
- You need dynamic data, user authentication, or real-time features
- The site has complex interactivity
- SEO requirements need ISR or SSR
- The team is JavaScript-heavy and comfortable with Node

For CertifyMe's public-facing static pages, Jekyll was the right call — fast, cheap to host, and easily updated by the content team without engineering involvement.`,
      },
    ],
  },

  "generative-ai-products": {
    slug: "generative-ai-products",
    title: "From Model to Product: Building Real Generative AI Features",
    category: "Generative AI",
    date: "February 2025",
    readTime: "10 min read",
    accent: "#fbbf24",
    tags: ["Generative AI", "Product", "LLMs", "Engineering", "UX"],
    intro:
      "The gap between an impressive AI demo and a shippable product feature is one of the most underestimated gaps in software engineering. After building AI-powered features at CertifyMe — from Generative AI workflows to NLP-assisted content tools — I've found the problems are almost never the model itself.",
    sections: [
      {
        heading: "The Four Gaps Between Demo and Product",
        body: `**Gap 1: Prompt Stability**
Demo prompts are tuned on the demo inputs. Real users send inputs you never imagined. Your prompt needs to be robust to off-topic, adversarial, empty, extremely long, and non-English inputs — not just the happy path.

**Gap 2: Latency Budget**
A 6-second LLM response is fine in a demo where you click "analyze" and wait. In a product where the user expects the feeling of an interactive tool, 6 seconds is a loading spinner that kills engagement. You need a latency budget before you write the first prompt.

**Gap 3: Cost Control**
A feature that costs $0.04/request looks cheap until it's called 50,000 times a month. Model cost isn't a nice-to-have consideration — it needs to be part of the architecture from day one.

**Gap 4: Failure UX**
LLMs fail. They produce off-format output. They time out. They get rate-limited. Your product needs a graceful experience for every failure mode — not just an error console log.`,
      },
      {
        heading: "Prompt Stability Engineering",
        body: `A production prompt is more like a formal specification than a chat message. Here's how I approach it:

\`\`\`python
SYSTEM_PROMPT = """You are a content intelligence assistant for a blogging platform.

Your role: analyze blog post drafts and extract structured metadata.

Input: A blog post draft (text, possibly incomplete)
Output: ONLY a JSON object — no commentary, no explanation, no markdown.

JSON schema:
{
  "title_suggestion": string,        // compelling title, max 70 chars
  "meta_description": string,        // SEO description, 120-160 chars
  "keywords": string[],              // 5-8 SEO keywords, lowercase
  "category": string,                // single primary category
  "reading_level": "beginner" | "intermediate" | "expert",
  "word_count_estimate": number
}

Rules:
- If the draft is too short to analyze (<50 words), return:
  {"error": "insufficient_content", "min_words_required": 50}
- If the draft is not in English, return:
  {"error": "unsupported_language"}
- Never add fields not in the schema
- All string values must be properly escaped JSON strings"""
\`\`\`

Test this prompt against: empty input, 1-word input, non-English, HTML-heavy, profanity, competitor brand names, extremely long text. Fix failures before shipping.`,
      },
      {
        heading: "Latency Architecture",
        body: `For AI features, the latency architecture is as important as the prompt.

**Streaming** — Use streaming responses for anything the user reads. The time-to-first-token (typically 0.5-1.5s) feels like immediate response, even if full generation takes 4 seconds.

\`\`\`python
import anthropic

def stream_analysis(text: str, client: anthropic.Anthropic):
    with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        messages=[{"role": "user", "content": f"Summarize: {text}"}]
    ) as stream:
        for chunk in stream.text_stream:
            yield chunk  # Flask can yield these as SSE chunks
\`\`\`

**Model selection by task** — Use the smallest model that meets quality requirements for each task:
- Haiku for classification, extraction, short-form generation
- Sonnet for reasoning, longer generation, complex analysis
- Opus for tasks where quality is paramount and latency is acceptable

**Caching** — Cache LLM responses for deterministic inputs. If the same blog post is submitted twice, return the cached analysis.

\`\`\`python
import hashlib, json
from functools import lru_cache

def get_cache_key(prompt: str, model: str) -> str:
    return hashlib.sha256(f"{model}:{prompt}".encode()).hexdigest()
\`\`\``,
      },
      {
        heading: "Cost Control in Practice",
        body: `Calculate cost before you ship, not after you get the invoice.

\`\`\`python
# Rough cost estimator (check current pricing — these are illustrative)
COST_PER_M_INPUT_TOKENS = {
    "claude-haiku-4-5-20251001": 0.25,
    "claude-sonnet-4-6": 3.00,
    "claude-opus-4-6": 15.00,
}
COST_PER_M_OUTPUT_TOKENS = {
    "claude-haiku-4-5-20251001": 1.25,
    "claude-sonnet-4-6": 15.00,
    "claude-opus-4-6": 75.00,
}

def estimate_monthly_cost(
    avg_input_tokens: int,
    avg_output_tokens: int,
    requests_per_month: int,
    model: str
) -> float:
    input_cost = (avg_input_tokens / 1_000_000) * COST_PER_M_INPUT_TOKENS[model]
    output_cost = (avg_output_tokens / 1_000_000) * COST_PER_M_OUTPUT_TOKENS[model]
    return (input_cost + output_cost) * requests_per_month

# Example: blog metadata extraction
# avg input: 800 tokens, avg output: 150 tokens, 10k requests/month
cost_haiku = estimate_monthly_cost(800, 150, 10_000, "claude-haiku-4-5-20251001")
cost_sonnet = estimate_monthly_cost(800, 150, 10_000, "claude-sonnet-4-6")
print(f"Haiku: $\{cost_haiku:.2f}/mo, Sonnet: $\{cost_sonnet:.2f}/mo")
# Haiku: $3.08/mo, Sonnet: $36.00/mo
\`\`\`

For most extraction and classification tasks, Haiku is 10x cheaper and nearly as good.`,
      },
      {
        heading: "Failure UX: The Underrated Product Skill",
        body: `The AI feature UX hierarchy (from best to worst user experience):

1. **Graceful degradation** — AI feature fails, non-AI fallback works
2. **Informative retry** — "Our AI is processing too many requests. We'll analyze this in the background and notify you."
3. **Manual escape hatch** — AI fails, user can fill in the field manually
4. **Clear error message** — at minimum, tell the user something went wrong and what they can do
5. **Silent failure** — the absolute worst: the feature appears to work but produces garbage or empty output

For every AI feature, explicitly design states for: loading, success, AI failure (fallback to manual), network timeout, and partial success (some fields extracted, some failed).

The users who hit error states remember them more than users who see success.`,
      },
    ],
  },

  "responsible-ai-engineering": {
    slug: "responsible-ai-engineering",
    title: "Responsible AI in Practice: What Engineers Actually Need to Know",
    category: "AI Research",
    date: "March 2025",
    readTime: "9 min read",
    accent: "#ff6b35",
    tags: ["Responsible AI", "Ethics", "Fairness", "ML", "Bias"],
    intro:
      "Most Responsible AI content is written for policy teams. As an engineer, you need concrete techniques — things you can actually implement. Here's what building real AI systems has taught me about making them fairer, more transparent, and less likely to cause harm.",
    sections: [
      {
        heading: "Bias Is in the Data, Always",
        body: `Every ML model is a statistical compression of its training data. If the data encodes historical biases — and it almost always does — the model will reproduce them. This isn't a model problem; it's a data problem that requires a data solution.

For classification tasks, always examine performance across subgroups, not just overall accuracy:

\`\`\`python
from sklearn.metrics import classification_report
import pandas as pd

def bias_audit(model, X_test: pd.DataFrame, y_test: pd.Series,
               sensitive_column: str) -> dict:
    """
    Evaluate model performance across a sensitive attribute.
    Surfaces disparate impact before you ship.
    """
    y_pred = model.predict(X_test)
    groups = X_test[sensitive_column].unique()
    results = {}

    for group in groups:
        mask = X_test[sensitive_column] == group
        if mask.sum() < 30:  # too few samples to be reliable
            results[group] = {"warning": "insufficient_samples", "n": int(mask.sum())}
            continue

        report = classification_report(
            y_test[mask], y_pred[mask],
            output_dict=True, zero_division=0
        )
        results[group] = {
            "n": int(mask.sum()),
            "precision": round(report['weighted avg']['precision'], 3),
            "recall": round(report['weighted avg']['recall'], 3),
            "f1": round(report['weighted avg']['f1-score'], 3),
        }

    # Flag if performance gap > 10% between best and worst group
    f1_scores = [v['f1'] for v in results.values() if 'f1' in v]
    if f1_scores and (max(f1_scores) - min(f1_scores)) > 0.10:
        results['_audit_flag'] = f"Performance gap of {max(f1_scores)-min(f1_scores):.1%} detected"

    return results
\`\`\`

Run this before every model deployment. A 5-point F1 gap between groups is a problem you should understand before it affects real users.`,
      },
      {
        heading: "Explainability Without a PhD",
        body: `Model explainability doesn't have to mean complex SHAP plots (though those are useful). For many practical applications, simpler techniques are more actionable.

**Feature importance for tree-based models:**
\`\`\`python
import matplotlib.pyplot as plt
import numpy as np

def plot_feature_importance(model, feature_names: list[str], top_n: int = 15):
    importance = model.feature_importances_
    indices = np.argsort(importance)[-top_n:]

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(range(len(indices)),
            importance[indices],
            color=['#ff4d6d' if importance[i] > 0.05 else '#fbbf24' for i in indices])
    ax.set_yticks(range(len(indices)))
    ax.set_yticklabels([feature_names[i] for i in indices])
    ax.set_title(f'Top {top_n} Feature Importances')
    return fig
\`\`\`

**LIME for any model — explain individual predictions:**
\`\`\`python
from lime.lime_text import LimeTextExplainer

explainer = LimeTextExplainer(class_names=['negative', 'neutral', 'positive'])

def explain_prediction(text: str, model_pipeline) -> dict:
    exp = explainer.explain_instance(
        text,
        model_pipeline.predict_proba,
        num_features=8
    )
    return {
        "prediction": model_pipeline.predict([text])[0],
        "top_features": exp.as_list(),
        "html": exp.as_html()
    }
\`\`\`

For LLM-powered features, always provide users with the source content the AI used to generate a response — that's the simplest form of explainability.`,
      },
      {
        heading: "Responsible Prompt Design",
        body: `For systems using LLMs, responsible AI starts at the prompt level. Poorly designed prompts can amplify bias, expose sensitive information, or produce harmful content at scale.

Key principles I apply to every production LLM prompt:

\`\`\`python
SYSTEM_PROMPT = """You are an AI assistant for [product].

Content boundaries — NEVER:
- Generate personally identifiable information about real individuals
- Make definitive claims about medical, legal, or financial matters
- Produce content that discriminates based on race, gender, age, religion, or disability
- Share or request sensitive personal information

When uncertain:
- Say "I'm not certain" rather than speculating
- Recommend consulting a qualified professional for medical/legal/financial advice
- Acknowledge when a question is outside your knowledge

Output quality:
- Base claims on provided context only
- Flag when you cannot answer with the available information"""
\`\`\`

**Rate limiting and input sanitization** are also responsible AI practices — they prevent both abuse and accidental exposure of sensitive data through prompt injection.`,
      },
      {
        heading: "Human-in-the-Loop for High-Stakes Decisions",
        body: `Never let an AI system make high-stakes decisions autonomously without a human review path. This isn't about distrusting AI — it's about appropriate architecture for the risk level.

\`\`\`python
RISK_LEVELS = {
    "low": {"auto_approve": True, "min_confidence": 0.85},
    "medium": {"auto_approve": False, "min_confidence": 0.95, "queue": "standard_review"},
    "high": {"auto_approve": False, "min_confidence": 1.0, "queue": "priority_review"},
}

def process_decision(ai_output: dict, risk_level: str) -> dict:
    config = RISK_LEVELS[risk_level]
    confidence = ai_output.get("confidence", 0)

    if config["auto_approve"] and confidence >= config["min_confidence"]:
        return {"action": "auto_approved", "decision": ai_output["decision"]}

    return {
        "action": "queued_for_review",
        "queue": config.get("queue", "standard_review"),
        "ai_suggestion": ai_output["decision"],
        "confidence": confidence,
        "reviewer_notes": ai_output.get("reasoning", ""),
    }
\`\`\`

The human reviewer sees the AI's suggestion and reasoning — not a blank slate. This makes review faster and more consistent while keeping humans accountable for decisions that affect people.`,
      },
      {
        heading: "The Practical Checklist",
        body: `Before shipping any AI-powered feature:

**Data**
- [ ] Audit training data for known biases in sensitive attributes
- [ ] Verify data was collected with appropriate consent
- [ ] Test model performance across demographic subgroups

**Model**
- [ ] Document model limitations in writing (internal + user-facing)
- [ ] Set confidence thresholds below which the system defers to humans
- [ ] Run adversarial tests: what happens with out-of-distribution inputs?

**Product**
- [ ] User can always override or ignore AI suggestions
- [ ] AI-generated content is labeled as such
- [ ] There's a mechanism to report bad AI outputs
- [ ] High-stakes decisions have a human review path

**Monitoring**
- [ ] Fairness metrics tracked in production, not just during eval
- [ ] Feedback loop: human corrections feed back into model improvement
- [ ] Incident response plan for when the model causes harm

Responsible AI isn't a checkbox — it's an ongoing engineering commitment. The checklist is where it starts, not ends.`,
      },
    ],
  },

  "erp-system-design": {
    slug: "erp-system-design",
    title: "Designing a Modular ERP System: Architecture Decisions and Tradeoffs",
    category: "Backend Engineering",
    date: "September 2024",
    readTime: "7 min read",
    accent: "#f59e0b",
    tags: ["ERP", "Flask", "MySQL", "Architecture", "RBAC"],
    intro:
      "Building an ERP system is one of the most instructive software engineering challenges — it touches database design, security, business logic, and UI simultaneously. Here's the architecture behind the ERP platform I built, the decisions I made, and what I'd change now.",
    sections: [
      {
        heading: "The Core Design Principle: Modules, Not Monolith",
        body: `An ERP system that starts as a monolith rarely decomposes cleanly later. I structured the system as independent modules from the start, each owning its data domain:

\`\`\`
erp_system/
├── app/
│   ├── __init__.py          # app factory
│   ├── modules/
│   │   ├── accounts/        # chart of accounts, GL entries
│   │   ├── inventory/       # items, warehouses, stock movements
│   │   ├── hr/              # employees, departments, payroll
│   │   ├── procurement/     # purchase orders, vendors
│   │   └── reports/         # cross-module reporting
│   ├── auth/                # authentication, RBAC
│   ├── api/                 # REST API layer
│   └── models/              # shared database models
├── migrations/
└── tests/
    ├── unit/
    └── integration/
\`\`\`

Each module has its own Blueprint, its own database tables, and its own service layer. Cross-module operations go through a thin service interface — modules don't import from each other directly.`,
      },
      {
        heading: "Role-Based Access Control",
        body: `ERP systems have complex permission requirements: admins can do everything, managers see their department's data, staff have read-only access to their own records. Flat role checks don't scale — you need granular permissions.

\`\`\`python
# models/rbac.py
from enum import Enum

class Permission(str, Enum):
    # Accounts module
    ACCOUNTS_READ = "accounts:read"
    ACCOUNTS_WRITE = "accounts:write"
    ACCOUNTS_APPROVE = "accounts:approve"

    # HR module
    HR_READ_OWN = "hr:read:own"
    HR_READ_DEPT = "hr:read:department"
    HR_READ_ALL = "hr:read:all"
    HR_WRITE = "hr:write"

ROLE_PERMISSIONS = {
    "staff": [
        Permission.ACCOUNTS_READ,
        Permission.HR_READ_OWN,
    ],
    "manager": [
        Permission.ACCOUNTS_READ,
        Permission.ACCOUNTS_WRITE,
        Permission.HR_READ_DEPT,
        Permission.HR_WRITE,
    ],
    "admin": list(Permission),  # all permissions
}

def has_permission(user_role: str, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(user_role, [])

# Decorator for routes
def require_permission(permission: Permission):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not has_permission(g.current_user['role'], permission):
                raise APIError("Insufficient permissions", 403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
\`\`\``,
      },
      {
        heading: "Audit Trail: Every Change is Logged",
        body: `In enterprise software, "who changed what and when" is not a nice-to-have — it's often a compliance requirement. I implemented a generic audit trail using SQLAlchemy events.

\`\`\`python
# models/audit.py
from datetime import datetime

class AuditLog(db.Model):
    __tablename__ = 'audit_log'

    id = db.Column(db.Integer, primary_key=True)
    table_name = db.Column(db.String(100), nullable=False)
    record_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.Enum('INSERT', 'UPDATE', 'DELETE'), nullable=False)
    changed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    old_values = db.Column(db.JSON)
    new_values = db.Column(db.JSON)

def log_change(table: str, record_id: int, action: str,
               old_vals: dict = None, new_vals: dict = None):
    user_id = g.current_user.get('id') if hasattr(g, 'current_user') else None
    entry = AuditLog(
        table_name=table,
        record_id=record_id,
        action=action,
        changed_by=user_id,
        old_values=old_vals,
        new_values=new_vals,
    )
    db.session.add(entry)
    # Don't commit here — let the calling transaction handle it
\`\`\`

Wrap all modifying operations to automatically call \`log_change\`. The audit log becomes a reliable "undo" source and compliance artifact.`,
      },
      {
        heading: "Bulk Data Processing",
        body: `ERP systems frequently need to import large datasets — account charts, employee records, inventory items. Building this robustly was one of the more challenging parts of the project.

\`\`\`python
import csv
import io
from dataclasses import dataclass
from typing import Generator

@dataclass
class ImportResult:
    total: int
    successful: int
    failed: int
    errors: list[dict]

def import_accounts_csv(file_data: bytes) -> ImportResult:
    text = file_data.decode('utf-8-sig')  # handle BOM from Excel exports
    reader = csv.DictReader(io.StringIO(text))

    result = ImportResult(0, 0, 0, [])
    batch = []

    for row_num, row in enumerate(reader, start=2):  # 1-indexed, row 1 is header
        result.total += 1
        try:
            account = validate_account_row(row, row_num)
            batch.append(account)

            if len(batch) >= 500:  # commit in batches
                db.session.bulk_insert_mappings(Account, batch)
                db.session.commit()
                result.successful += len(batch)
                batch = []

        except ValidationError as e:
            result.failed += 1
            result.errors.append({"row": row_num, "error": str(e), "data": dict(row)})

    if batch:  # flush remaining
        db.session.bulk_insert_mappings(Account, batch)
        db.session.commit()
        result.successful += len(batch)

    return result
\`\`\`

Return the import result with per-row errors. Users need to see exactly which rows failed and why — a generic "import failed" message is useless for a 5,000-row file.`,
      },
      {
        heading: "What I'd Do Differently",
        body: `**Database design is permanent.** I underestimated how painful schema changes are once data exists. The things I'd do more carefully upfront: soft deletes everywhere (never hard-delete records in an ERP), proper foreign keys with ON DELETE behavior documented, and standardized timestamp columns (created_at, updated_at, deleted_at) on every table.

**Reporting is a separate concern.** I built reports as complex SQL queries in Flask routes. For anything non-trivial, this doesn't scale. Reports should query a separate read replica or a materialized view, not the live transactional database.

**Testing business logic independently.** I tested at the HTTP layer, which made tests slow and fragile. Business logic (account validation rules, payroll calculations, permission checks) should be unit-testable in pure Python, without a database or HTTP context.

The ERP system taught me that enterprise software is less about clever algorithms and more about rigorous data modeling, consistent error handling, and boring but reliable operations.`,
      },
    ],
  },
};

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Section {
  heading: string;
  body: string;
}

interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  accent: string;
  tags: string[];
  intro: string;
  sections: Section[];
}

/* ─── Metadata ──────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return { title: "Not Found" };
  return {
    title: `${article.title} — Harshita Rajput`,
    description: article.intro.slice(0, 160),
  };
}

/* ─── Render helpers ────────────────────────────────────────────────────── */
function renderBody(body: string) {
  const parts = body.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
      return (
        <div key={i} className="relative my-6 rounded-2xl overflow-hidden border border-white/8">
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6">
            {["#ff5f56", "#ffbd2e", "#27c93f"].map((c, j) => (
              <span key={j} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]">
            <code>{code.trim()}</code>
          </pre>
        </div>
      );
    }
    return (
      <div key={i}>
        {part.split("\n\n").map((para, j) => {
          if (!para.trim()) return null;
          if (para.startsWith("- ") || para.startsWith("**")) {
            return (
              <p key={j} className="text-white/65 text-[15px] leading-[1.85] mb-4"
                dangerouslySetInnerHTML={{
                  __html: para
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white/90 font-semibold">$1</strong>')
                    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/8 text-[#ff4d6d] text-[13px] font-mono">$1</code>')
                    .replace(/\*(.*?)\*/g, '<em class="text-white/80">$1</em>'),
                }}
              />
            );
          }
          return (
            <p key={j} className="text-white/65 text-[15px] leading-[1.85] mb-4"
              dangerouslySetInnerHTML={{
                __html: para
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white/90 font-semibold">$1</strong>')
                  .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/8 text-[#ff4d6d] text-[13px] font-mono">$1</code>')
                  .replace(/\*(.*?)\*/g, '<em class="text-white/80">$1</em>'),
              }}
            />
          );
        })}
      </div>
    );
  });
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) notFound();

  return (
    <div
      className="min-h-screen"
      style={{
        background: `radial-gradient(ellipse at 20% 10%, ${article.accent}08 0%, transparent 50%),
                     radial-gradient(ellipse at 80% 80%, rgba(251,191,36,0.05) 0%, transparent 50%),
                     #0a0a0f`,
      }}
    >
      {/* Top nav bar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/#blog"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                color: article.accent,
                background: `${article.accent}12`,
                border: `1px solid ${article.accent}30`,
              }}
            >
              {article.category}
            </span>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-20">
        {/* Hero */}
        <div className="mb-12">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-white/35 font-mono">
            <span>{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{article.readTime}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Harshita Rajput</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
            {article.title}
          </h1>

          {/* Accent line */}
          <div
            className="h-[2px] w-24 rounded-full mb-8"
            style={{ background: `linear-gradient(90deg, ${article.accent}, transparent)` }}
          />

          {/* Intro */}
          <p
            className="text-lg text-white/60 leading-relaxed border-l-2 pl-5"
            style={{ borderColor: `${article.accent}60` }}
          >
            {article.intro}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  color: article.accent,
                  background: `${article.accent}10`,
                  border: `1px solid ${article.accent}25`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full mb-12 opacity-20"
          style={{ background: `linear-gradient(90deg, transparent, ${article.accent}, transparent)` }}
        />

        {/* Sections */}
        <div className="space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 leading-snug">
                {section.heading}
              </h2>
              <div>{renderBody(section.body)}</div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-16 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm font-semibold text-white/70">Harshita Rajput</p>
            <p className="text-xs text-white/35 mt-0.5">AI Engineer · R&D at CertifyMe</p>
          </div>
          <Link
            href="/#blog"
            className="text-sm font-medium transition-colors"
            style={{ color: article.accent }}
          >
            ← More articles
          </Link>
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}
