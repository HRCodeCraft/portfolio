3:I[9275,[],""]
5:I[1343,[],""]
6:I[3509,["842","static/chunks/842-8611233b8b168bdf.js","185","static/chunks/app/layout-1e527e6f80435bb1.js"],"default"]
4:["slug","opencv-face-recognition","d"]
0:["96NdAYUzvXBNqDRwSinyz",[[["",{"children":["blog",{"children":[["slug","opencv-face-recognition","d"],{"children":["__PAGE__?{\"slug\":\"opencv-face-recognition\"}",{}]}]}]},"$undefined","$undefined",true],["",{"children":["blog",{"children":[["slug","opencv-face-recognition","d"],{"children":["__PAGE__",{},[["$L1","$L2"],null],null]},["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","blog","children","$4","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined","styles":null}],null]},["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","blog","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined","styles":null}],null]},[["$","html",null,{"lang":"en","className":"scroll-smooth","children":["$","body",null,{"className":"animated-gradient-bg min-h-screen","suppressHydrationWarning":true,"children":[["$","$L6",null,{}],["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[],"styles":null}]]}]}],null],null],[[["$","link","0",{"rel":"stylesheet","href":"/portfolio/_next/static/css/e4fa323e070fe965.css","precedence":"next","crossOrigin":"$undefined"}]],"$L7"]]]]
8:I[231,["231","static/chunks/231-6ba2a30fef1cee39.js","308","static/chunks/app/blog/%5Bslug%5D/page-fa969c147c0a8a31.js"],""]
9:T5d1,import cv2
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
    print(f"Collected {count} samples.")a:T4b2,import numpy as np
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

    return recognizer, label_mapb:T5a1,def run_recognition(recognizer, label_map: dict, confidence_threshold: int = 75):
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
    return recognized_log2:["$","div",null,{"className":"min-h-screen","style":{"background":"radial-gradient(ellipse at 20% 10%, #34d39908 0%, transparent 50%),\n                     radial-gradient(ellipse at 80% 80%, rgba(251,191,36,0.05) 0%, transparent 50%),\n                     #0a0a0f"},"children":[["$","header",null,{"className":"fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5","children":["$","div",null,{"className":"max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between","children":[["$","$L8",null,{"href":"/#blog","className":"flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group","children":[["$","span",null,{"className":"group-hover:-translate-x-1 transition-transform duration-200","children":"←"}],"Back"]}],["$","div",null,{"className":"flex items-center gap-2","children":["$","span",null,{"className":"text-xs font-semibold px-2.5 py-1 rounded-full","style":{"color":"#34d399","background":"#34d39912","border":"1px solid #34d39930"},"children":"Computer Vision"}]}]]}]}],["$","article",null,{"className":"max-w-3xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-20","children":[["$","div",null,{"className":"mb-12","children":[["$","div",null,{"className":"flex flex-wrap items-center gap-3 mb-6 text-xs text-white/35 font-mono","children":[["$","span",null,{"children":"June 2024"}],["$","span",null,{"className":"w-1 h-1 rounded-full bg-white/20"}],["$","span",null,{"children":"9 min read"}],["$","span",null,{"className":"w-1 h-1 rounded-full bg-white/20"}],["$","span",null,{"children":"Harshita Rajput"}]]}],["$","h1",null,{"className":"text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6","children":"Face Recognition with OpenCV and LBPH: A Complete Walkthrough"}],["$","div",null,{"className":"h-[2px] w-24 rounded-full mb-8","style":{"background":"linear-gradient(90deg, #34d399, transparent)"}}],["$","p",null,{"className":"text-lg text-white/60 leading-relaxed border-l-2 pl-5","style":{"borderColor":"#34d39960"},"children":"The Face Detection and Recognition System was my first deep dive into computer vision. I used Python and OpenCV with the LBPH algorithm — a classical approach that's underrated for constrained, real-time scenarios. Here's the complete walkthrough, including the parts that took me days to figure out."}],["$","div",null,{"className":"flex flex-wrap gap-2 mt-8","children":[["$","span","OpenCV",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#34d399","background":"#34d39910","border":"1px solid #34d39925"},"children":"OpenCV"}],["$","span","LBPH",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#34d399","background":"#34d39910","border":"1px solid #34d39925"},"children":"LBPH"}],["$","span","Face Recognition",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#34d399","background":"#34d39910","border":"1px solid #34d39925"},"children":"Face Recognition"}],["$","span","Python",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#34d399","background":"#34d39910","border":"1px solid #34d39925"},"children":"Python"}],["$","span","Computer Vision",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#34d399","background":"#34d39910","border":"1px solid #34d39925"},"children":"Computer Vision"}]]}]]}],["$","div",null,{"className":"h-px w-full mb-12 opacity-20","style":{"background":"linear-gradient(90deg, transparent, #34d399, transparent)"}}],["$","div",null,{"className":"space-y-10","children":[["$","section","LBPH vs Deep Learning: When to Choose What",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"LBPH vs Deep Learning: When to Choose What"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Local Binary Pattern Histogram (LBPH) is a texture-based recognition algorithm that predates deep learning. You might wonder why use it at all in 2024."}}],["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Reasons LBPH still wins in specific scenarios:\n- <strong class=\"text-white/90 font-semibold\">No GPU required</strong> — runs on a Raspberry Pi\n- <strong class=\"text-white/90 font-semibold\">Minimal training data</strong> — works with 20-30 samples per person\n- <strong class=\"text-white/90 font-semibold\">Incremental training</strong> — add new people without retraining from scratch\n- <strong class=\"text-white/90 font-semibold\">Fast inference</strong> — under 5ms per face on CPU"}}],["$","p","2",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Deep learning models (FaceNet, ArcFace) are more accurate with larger datasets but have real deployment overhead. For a campus access system or small-team attendance tracker, LBPH is often the right call."}}]]}]]}]]}],["$","section","Data Collection Pipeline",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Data Collection Pipeline"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Recognition quality is entirely determined by training data quality. I built a systematic collection pipeline before touching the recognition model."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$9"}]}]]}],["$","div","2",{"children":[null,["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Vary head angles and lighting during collection. A model trained only on forward-facing, well-lit faces will fail on profile views or in dim rooms."}}]]}]]}]]}],["$","section","Training the LBPH Model",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Training the LBPH Model"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"LBPH training is fast — it doesn't do gradient descent, it computes histograms of texture patterns. Training 40 samples per person takes under a second."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$a"}]}]]}],["$","div","2",{"children":[null]}]]}]]}],["$","section","Real-Time Recognition with Confidence Scoring",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Real-Time Recognition with Confidence Scoring"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"LBPH's <code class=\"px-1.5 py-0.5 rounded bg-white/8 text-[#ff4d6d] text-[13px] font-mono\">predict()</code> returns a label and a confidence score. Lower confidence = more certain (it's a distance metric). Understanding this threshold is critical."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$b"}]}]]}],["$","div","2",{"children":[null]}]]}]]}],["$","section","Lessons From Building This",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Lessons From Building This"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"<strong class=\"text-white/90 font-semibold\">Confidence threshold calibration</strong> is everything. I spent more time on this than on the model itself. Print confidence scores for known and unknown faces in your environment, and set the threshold at the natural gap between the two distributions."}}],["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"<strong class=\"text-white/90 font-semibold\">Face alignment</strong> matters more than I expected. Adding a step that aligns faces to a standard eye position (using facial landmark detection) improved accuracy by ~15% with no model changes."}}],["$","p","2",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"<strong class=\"text-white/90 font-semibold\">False positives are worse than false negatives</strong> for access control. When in doubt, set a stricter threshold and add a fallback (PIN entry) rather than accepting a weak match."}}],["$","p","3",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"<strong class=\"text-white/90 font-semibold\">The model degrades over time</strong> as lighting and appearance change. Budget for periodic retraining with fresh samples — LBPH makes this cheap."}}]]}]]}]]}]]}],["$","div",null,{"className":"mt-16 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4","children":[["$","div",null,{"children":[["$","p",null,{"className":"text-sm font-semibold text-white/70","children":"Harshita Rajput"}],["$","p",null,{"className":"text-xs text-white/35 mt-0.5","children":"AI Engineer · R&D at CertifyMe"}]]}],["$","$L8",null,{"href":"/#blog","className":"text-sm font-medium transition-colors","style":{"color":"#34d399"},"children":"← More articles"}]]}]]}]]}]
7:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}],["$","title","2",{"children":"Face Recognition with OpenCV and LBPH: A Complete Walkthrough — Harshita Rajput"}],["$","meta","3",{"name":"description","content":"The Face Detection and Recognition System was my first deep dive into computer vision. I used Python and OpenCV with the LBPH algorithm — a classical approach t"}],["$","meta","4",{"name":"author","content":"Harshita Rajput"}],["$","meta","5",{"name":"keywords","content":"AI Engineer,Machine Learning,NLP,Computer Vision,Generative AI,Flask,Python,Full Stack,Harshita Rajput"}],["$","meta","6",{"property":"og:title","content":"Harshita Rajput — AI Engineer"}],["$","meta","7",{"property":"og:description","content":"Building intelligent systems that learn, adapt, and scale."}],["$","meta","8",{"property":"og:type","content":"website"}],["$","meta","9",{"name":"twitter:card","content":"summary"}],["$","meta","10",{"name":"twitter:title","content":"Harshita Rajput — AI Engineer"}],["$","meta","11",{"name":"twitter:description","content":"Building intelligent systems that learn, adapt, and scale."}],["$","link","12",{"rel":"icon","href":"/portfolio/icon.svg?5cfbb99a5743764e","type":"image/svg+xml","sizes":"any"}]]
1:null
