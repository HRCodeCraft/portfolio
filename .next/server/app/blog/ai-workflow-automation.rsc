3:I[9275,[],""]
5:I[1343,[],""]
6:I[3509,["842","static/chunks/842-8611233b8b168bdf.js","185","static/chunks/app/layout-1e527e6f80435bb1.js"],"default"]
4:["slug","ai-workflow-automation","d"]
0:["96NdAYUzvXBNqDRwSinyz",[[["",{"children":["blog",{"children":[["slug","ai-workflow-automation","d"],{"children":["__PAGE__?{\"slug\":\"ai-workflow-automation\"}",{}]}]}]},"$undefined","$undefined",true],["",{"children":["blog",{"children":[["slug","ai-workflow-automation","d"],{"children":["__PAGE__",{},[["$L1","$L2"],null],null]},["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","blog","children","$4","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined","styles":null}],null]},["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","blog","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined","styles":null}],null]},[["$","html",null,{"lang":"en","className":"scroll-smooth","children":["$","body",null,{"className":"animated-gradient-bg min-h-screen","suppressHydrationWarning":true,"children":[["$","$L6",null,{}],["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[],"styles":null}]]}]}],null],null],[[["$","link","0",{"rel":"stylesheet","href":"/portfolio/_next/static/css/e4fa323e070fe965.css","precedence":"next","crossOrigin":"$undefined"}]],"$L7"]]]]
8:I[231,["231","static/chunks/231-6ba2a30fef1cee39.js","308","static/chunks/app/blog/%5Bslug%5D/page-fa969c147c0a8a31.js"],""]
9:T520,import anthropic
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

    return resulta:T4a3,EXTRACTION_PROMPT = """Extract the following fields from the certificate/credential document below.

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

    return datab:T54d,from flask import Flask, jsonify, request
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
    return jsonify(results_store.get(job_id, {"status": "not_found"}))2:["$","div",null,{"className":"min-h-screen","style":{"background":"radial-gradient(ellipse at 20% 10%, #fbbf2408 0%, transparent 50%),\n                     radial-gradient(ellipse at 80% 80%, rgba(251,191,36,0.05) 0%, transparent 50%),\n                     #0a0a0f"},"children":[["$","header",null,{"className":"fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5","children":["$","div",null,{"className":"max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between","children":[["$","$L8",null,{"href":"/#blog","className":"flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group","children":[["$","span",null,{"className":"group-hover:-translate-x-1 transition-transform duration-200","children":"←"}],"Back"]}],["$","div",null,{"className":"flex items-center gap-2","children":["$","span",null,{"className":"text-xs font-semibold px-2.5 py-1 rounded-full","style":{"color":"#fbbf24","background":"#fbbf2412","border":"1px solid #fbbf2430"},"children":"Generative AI"}]}]]}]}],["$","article",null,{"className":"max-w-3xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-20","children":[["$","div",null,{"className":"mb-12","children":[["$","div",null,{"className":"flex flex-wrap items-center gap-3 mb-6 text-xs text-white/35 font-mono","children":[["$","span",null,{"children":"March 2025"}],["$","span",null,{"className":"w-1 h-1 rounded-full bg-white/20"}],["$","span",null,{"children":"8 min read"}],["$","span",null,{"className":"w-1 h-1 rounded-full bg-white/20"}],["$","span",null,{"children":"Harshita Rajput"}]]}],["$","h1",null,{"className":"text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6","children":"AI Workflow Automation: Building Smart Pipelines with LLMs"}],["$","div",null,{"className":"h-[2px] w-24 rounded-full mb-8","style":{"background":"linear-gradient(90deg, #fbbf24, transparent)"}}],["$","p",null,{"className":"text-lg text-white/60 leading-relaxed border-l-2 pl-5","style":{"borderColor":"#fbbf2460"},"children":"At CertifyMe, a big part of my R&D work involves replacing brittle rule-based workflows with intelligent pipelines. LLMs are surprisingly good at document classification, data extraction, and routing decisions — if you structure the problem correctly. Here's how to build AI automation that's actually reliable."}],["$","div",null,{"className":"flex flex-wrap gap-2 mt-8","children":[["$","span","Automation",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#fbbf24","background":"#fbbf2410","border":"1px solid #fbbf2425"},"children":"Automation"}],["$","span","LLMs",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#fbbf24","background":"#fbbf2410","border":"1px solid #fbbf2425"},"children":"LLMs"}],["$","span","Workflow",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#fbbf24","background":"#fbbf2410","border":"1px solid #fbbf2425"},"children":"Workflow"}],["$","span","AI",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#fbbf24","background":"#fbbf2410","border":"1px solid #fbbf2425"},"children":"AI"}],["$","span","Flask",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#fbbf24","background":"#fbbf2410","border":"1px solid #fbbf2425"},"children":"Flask"}],["$","span","Python",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#fbbf24","background":"#fbbf2410","border":"1px solid #fbbf2425"},"children":"Python"}]]}]]}],["$","div",null,{"className":"h-px w-full mb-12 opacity-20","style":{"background":"linear-gradient(90deg, transparent, #fbbf24, transparent)"}}],["$","div",null,{"className":"space-y-10","children":[["$","section","Where LLM Automation Beats Rule-Based Systems",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Where LLM Automation Beats Rule-Based Systems"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Rule-based systems are brittle at the edges. An if-else document classifier works until someone submits a document in an unexpected format, language, or category mix. You then write more rules, and the system grows into an unmaintainable tangle."}}],["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"LLMs excel at:\n- <strong class=\"text-white/90 font-semibold\">Classification with fuzzy boundaries</strong> — \"is this a complaint, a question, or a feature request?\" doesn't have crisp rules\n- <strong class=\"text-white/90 font-semibold\">Structured extraction from unstructured text</strong> — pulling fields from free-form documents\n- <strong class=\"text-white/90 font-semibold\">Natural language routing</strong> — sending tasks to the right handler based on content\n- <strong class=\"text-white/90 font-semibold\">Summarization and enrichment</strong> — adding metadata to documents"}}],["$","p","2",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"They struggle at: exact string matching, numeric computation, anything requiring external lookups (without tools), and tasks needing >99.9% reliability."}}]]}]]}]]}],["$","section","Document Classification Pipeline",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Document Classification Pipeline"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Here's a production-pattern document classifier that routes incoming content to the right processing queue."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$9"}]}]]}],["$","div","2",{"children":[null]}]]}]]}],["$","section","Structured Data Extraction",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Structured Data Extraction"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Extracting structured fields from unstructured documents is where LLMs genuinely save weeks of rule-writing."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$a"}]}]]}],["$","div","2",{"children":[null]}]]}]]}],["$","section","Building a Reliable Automation Queue",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Building a Reliable Automation Queue"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"LLM calls are slow (~1-5s) and occasionally fail. Never block synchronous request handling on them. Use an async queue."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$b"}]}]]}],["$","div","2",{"children":[null]}]]}]]}],["$","section","Monitoring and Drift Detection",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Monitoring and Drift Detection"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"LLM-powered automation drifts as prompts age against new model versions. Build monitoring in from the start."}}],["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Key metrics to track:\n- <strong class=\"text-white/90 font-semibold\">Classification distribution</strong> — if the distribution of categories shifts suddenly, investigate. Either your data changed or the model behavior changed.\n- <strong class=\"text-white/90 font-semibold\">Confidence score trends</strong> — dropping average confidence often precedes accuracy degradation.\n- <strong class=\"text-white/90 font-semibold\">Extraction completeness</strong> — what fraction of required fields are successfully extracted? A drop signals prompt-model mismatch.\n- <strong class=\"text-white/90 font-semibold\">Fallback rate</strong> — how often does low confidence trigger manual review? This should stay low."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"def log_automation_result(job_id: str, result: dict, db):\n    db.execute(\"\"\"\n        INSERT INTO automation_log\n        (job_id, category, confidence, fields_extracted, flagged_for_review, model_used, ts)\n        VALUES (?, ?, ?, ?, ?, ?, NOW())\n    \"\"\", [\n        job_id,\n        result['classification']['category'],\n        result['classification']['confidence'],\n        len([v for v in result['extraction'].values() if v is not None]),\n        result['classification'].get('flagged_for_review', False),\n        \"claude-opus-4-6\"\n    ])"}]}]]}],["$","div","2",{"children":[null,["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Review this table weekly. Build a simple dashboard. Automation that isn't monitored is automation you don't trust."}}]]}]]}]]}]]}],["$","div",null,{"className":"mt-16 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4","children":[["$","div",null,{"children":[["$","p",null,{"className":"text-sm font-semibold text-white/70","children":"Harshita Rajput"}],["$","p",null,{"className":"text-xs text-white/35 mt-0.5","children":"AI Engineer · R&D at CertifyMe"}]]}],["$","$L8",null,{"href":"/#blog","className":"text-sm font-medium transition-colors","style":{"color":"#fbbf24"},"children":"← More articles"}]]}]]}]]}]
7:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}],["$","title","2",{"children":"AI Workflow Automation: Building Smart Pipelines with LLMs — Harshita Rajput"}],["$","meta","3",{"name":"description","content":"At CertifyMe, a big part of my R&D work involves replacing brittle rule-based workflows with intelligent pipelines. LLMs are surprisingly good at document class"}],["$","meta","4",{"name":"author","content":"Harshita Rajput"}],["$","meta","5",{"name":"keywords","content":"AI Engineer,Machine Learning,NLP,Computer Vision,Generative AI,Flask,Python,Full Stack,Harshita Rajput"}],["$","meta","6",{"property":"og:title","content":"Harshita Rajput — AI Engineer"}],["$","meta","7",{"property":"og:description","content":"Building intelligent systems that learn, adapt, and scale."}],["$","meta","8",{"property":"og:type","content":"website"}],["$","meta","9",{"name":"twitter:card","content":"summary"}],["$","meta","10",{"name":"twitter:title","content":"Harshita Rajput — AI Engineer"}],["$","meta","11",{"name":"twitter:description","content":"Building intelligent systems that learn, adapt, and scale."}],["$","link","12",{"rel":"icon","href":"/portfolio/icon.svg?5cfbb99a5743764e","type":"image/svg+xml","sizes":"any"}]]
1:null
