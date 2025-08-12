import React, { useEffect, useMemo, useRef, useState } from "react";

// เกมทายคำศัพท์ภาษาอังกฤษ พร้อมภาพประกอบ + เสียงใบ้ (TH) และออกเสียงคำศัพท์ (EN)
// คุณสมบัติหลัก:
// - สีสันสดใส เหมาะกับเด็กผู้หญิง (พาสเทล ชมพู ม่วง)
// - คำศัพท์ชุด: shapes, circle, triangle, square, rectangle, heart, star, row, column, measure
// - ระบบคะแนน
// - ทบทวนคำที่ตอบผิดอัตโนมัติหลังจบชุดหลัก
// - รองรับเสียงใบ้ (ภาษาไทย) และออกเสียงคำศัพท์ (ภาษาอังกฤษ) ด้วย Web Speech API

// ---------- ยูทิล ----------
const randInt = (n) => Math.floor(Math.random() * n);
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const useSpeech = () => {
  const voicesRef = useRef([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices?.() || [];
      setReady(true);
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text, lang = "th-TH") => {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    // เลือกเสียงใกล้เคียงภาษาที่กำหนด
    const vs = voicesRef.current;
    const pick = vs.find((v) => v.lang?.toLowerCase().startsWith(lang.toLowerCase()))
      || vs.find((v) => v.lang?.toLowerCase().slice(0,2) === lang.slice(0,2).toLowerCase());
    if (pick) utter.voice = pick;
    utter.lang = pick?.lang || lang;
    utter.rate = lang.startsWith("th") ? 0.95 : 0.95;
    utter.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  return { speak, ready };
};

// ---------- ข้อมูลคำศัพท์ + ภาพ SVG ----------
const ShapeSVG = {
  shapes: () => (
    <svg viewBox="0 0 260 180" className="w-56 h-40">
      <rect x="10" y="20" width="70" height="50" rx="10" className="fill-pink-300"/>
      <circle cx="140" cy="45" r="25" className="fill-purple-300"/>
      <polygon points="210,70 240,20 180,20" className="fill-rose-400"/>
      <rect x="25" y="100" width="50" height="50" className="fill-fuchsia-300"/>
      <polygon points="140,130 160,170 120,170" className="fill-indigo-300"/>
      <path d="M210 110 C210 95, 240 95, 240 110 C240 130, 210 140, 210 160 C210 140, 180 130, 180 110 C180 95, 210 95, 210 110 Z" className="fill-pink-400"/>
    </svg>
  ),
  circle: () => (
    <svg viewBox="0 0 200 200" className="w-56 h-56">
      <circle cx="100" cy="100" r="70" className="fill-purple-300" />
    </svg>
  ),
  triangle: () => (
    <svg viewBox="0 0 200 200" className="w-56 h-56">
      <polygon points="100,30 170,170 30,170" className="fill-rose-400" />
    </svg>
  ),
  square: () => (
    <svg viewBox="0 0 200 200" className="w-56 h-56">
      <rect x="50" y="50" width="100" height="100" className="fill-fuchsia-300" />
    </svg>
  ),
  rectangle: () => (
    <svg viewBox="0 0 240 160" className="w-64 h-44">
      <rect x="20" y="40" width="200" height="80" rx="10" className="fill-pink-300" />
    </svg>
  ),
  heart: () => (
    <svg viewBox="0 0 200 200" className="w-56 h-56">
      <path d="M100 170 L40 110 C10 80, 35 35, 75 45 C92 49, 100 65, 100 65 C100 65, 108 49, 125 45 C165 35, 190 80, 160 110 Z" className="fill-pink-400" />
    </svg>
  ),
  star: () => (
    <svg viewBox="0 0 200 200" className="w-56 h-56">
      <polygon points="100,25 120,75 175,75 130,110 145,165 100,135 55,165 70,110 25,75 80,75" className="fill-yellow-300" />
    </svg>
  ),
  row: () => (
    <svg viewBox="0 0 200 200" className="w-56 h-56">
      {Array.from({ length: 3 }).map((_, r) => (
        Array.from({ length: 3 }).map((_, c) => (
          <rect key={`${r}-${c}`} x={20 + c*55} y={20 + r*55} width="50" height="50"
                className={r===1 ? "fill-rose-400" : "fill-purple-200"} rx="8" />
        ))
      ))}
    </svg>
  ),
  column: () => (
    <svg viewBox="0 0 200 200" className="w-56 h-56">
      {Array.from({ length: 3 }).map((_, r) => (
        Array.from({ length: 3 }).map((_, c) => (
          <rect key={`${r}-${c}`} x={20 + c*55} y={20 + r*55} width="50" height="50"
                className={c===1 ? "fill-rose-400" : "fill-purple-200"} rx="8" />
        ))
      ))}
    </svg>
  ),
  measure: () => (
    <svg viewBox="0 0 260 120" className="w-64 h-32">
      <rect x="20" y="40" width="220" height="40" rx="6" className="fill-yellow-200" />
      {Array.from({ length: 22 }).map((_, i) => (
        <line key={i} x1={30 + i*10} y1="40" x2={30 + i*10} y2={i%5===0 ? 20 : 30} stroke="#6b7280" strokeWidth="3" />
      ))}
    </svg>
  ),
};

const WORDS = [
  {
    id: "shapes",
    word: "shapes",
    hintTH: "สิ่งของต่าง ๆ มีรูปทรง เราเรียกรวม ๆ ว่า ‘รูปร่างรูปทรง’",
    hintEN: "various shapes",
    render: ShapeSVG.shapes,
  },
  {
    id: "circle",
    word: "circle",
    hintTH: "กลม ๆ ไม่มีมุม",
    hintEN: "It is round.",
    render: ShapeSVG.circle,
  },
  {
    id: "triangle",
    word: "triangle",
    hintTH: "มี 3 ด้าน 3 มุม",
    hintEN: "It has three sides.",
    render: ShapeSVG.triangle,
  },
  {
    id: "square",
    word: "square",
    hintTH: "สี่เหลี่ยมจัตุรัส ด้านยาวเท่ากันทุกด้าน",
    hintEN: "All four sides are equal.",
    render: ShapeSVG.square,
  },
  {
    id: "rectangle",
    word: "rectangle",
    hintTH: "สี่เหลี่ยมผืนผ้า มีมุมฉาก 4 มุม",
    hintEN: "A four-sided shape with right angles.",
    render: ShapeSVG.rectangle,
  },
  {
    id: "heart",
    word: "heart",
    hintTH: "รูปหัวใจ น่ารัก ๆ",
    hintEN: "A cute heart shape.",
    render: ShapeSVG.heart,
  },
  {
    id: "star",
    word: "star",
    hintTH: "มีแฉก ๆ เปล่งประกาย",
    hintEN: "A bright star.",
    render: ShapeSVG.star,
  },
  {
    id: "row",
    word: "row",
    hintTH: "แถวแนวนอน",
    hintEN: "A horizontal line of things.",
    render: ShapeSVG.row,
  },
  {
    id: "column",
    word: "column",
    hintTH: "แถวแนวตั้ง",
    hintEN: "A vertical line of things.",
    render: ShapeSVG.column,
  },
  {
    id: "measure",
    word: "measure",
    hintTH: "วัดความยาวด้วยไม้บรรทัดหรือตลับเมตร",
    hintEN: "To find the length with a ruler.",
    render: ShapeSVG.measure,
  },
];

function makeOptions(correctId) {
  const others = WORDS.filter(w => w.id !== correctId).map(w => w.word);
  const pool = shuffle(others).slice(0, 3);
  const all = shuffle([WORDS.find(w=>w.id===correctId).word, ...pool]);
  return all;
}

export default function VocabShapesGame() {
  const pastel = {
    card: "bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50",
    header: "from-pink-400 via-fuchsia-400 to-purple-400",
    primary: "bg-pink-500 hover:bg-pink-600",
    choice: "bg-white hover:bg-rose-50 border-2 border-pink-200",
  };

  const { speak } = useSpeech();

  const [order, setOrder] = useState(() => shuffle(WORDS.map((w) => w.id)));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null); // string (option)
  const [isCorrect, setIsCorrect] = useState(null); // true/false/null
  const [reviewSet, setReviewSet] = useState([]); // array of ids
  const [inReview, setInReview] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentId = order[idx];
  const current = useMemo(() => WORDS.find((w) => w.id === currentId), [currentId]);
  const options = useMemo(() => makeOptions(currentId), [currentId]);

  const totalMain = WORDS.length;
  const progress = Math.round(((inReview ? idx : idx) + 1) / (inReview ? reviewSet.length || 1 : totalMain) * 100);

  useEffect(() => {
    // เคลียร์สถานะคำตอบเมื่อเปลี่ยนข้อ
    setSelected(null);
    setIsCorrect(null);
    setShowAnswer(false);
  }, [currentId]);

  const onChoose = (opt) => {
    if (selected) return; // เลือกได้ครั้งเดียวต่อข้อ
    setSelected(opt);
    const ok = opt.toLowerCase() === current.word.toLowerCase();
    setIsCorrect(ok);

    if (ok) {
      setScore((s) => s + (inReview ? 5 : 10));
      // เล่นเอฟเฟกต์เสียงสั้น ๆ (ผ่าน Speech API)
      try { speak("เยี่ยมมาก!", "th-TH"); } catch {}
      setShowAnswer(true);
    } else {
      // เก็บไว้ทบทวน
      setReviewSet((rs) => (rs.includes(current.id) ? rs : [...rs, current.id]));
      try { speak("ยังไม่ใช่นะ ลองดูคำตอบ และทบทวนอีกครั้ง", "th-TH"); } catch {}
      setShowAnswer(true);
    }
  };

  const goNext = () => {
    const lastIndex = (inReview ? (reviewSet.length - 1) : (totalMain - 1));
    if (idx < lastIndex) {
      setIdx((i) => i + 1);
    } else {
      // จบชุดปัจจุบัน
      if (!inReview && reviewSet.length > 0) {
        // เข้าโหมดทบทวนเฉพาะคำที่ผิด
        setInReview(true);
        setOrder(reviewSet);
        setIdx(0);
      } else if (inReview) {
        // จบทบทวน
        setInReview(false);
        setOrder(shuffle(WORDS.map(w=>w.id)));
        setIdx(0);
        setReviewSet([]);
      } else {
        // ไม่ต้องทบทวน เริ่มใหม่แบบสับไพ่
        setOrder(shuffle(WORDS.map(w=>w.id)));
        setIdx(0);
      }
    }
  };

  const resetAll = () => {
    setOrder(shuffle(WORDS.map(w=>w.id)));
    setIdx(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setReviewSet([]);
    setInReview(false);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-100 flex flex-col">
      {/* Header */}
      <header className={`bg-gradient-to-r ${pastel.header} text-white px-6 py-5 shadow-md`}> 
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">
            เกมทายคำศัพท์อังกฤษ • รูปทรง & พื้นฐานคณิต
          </h1>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">
              คะแนน: <span className="font-bold">{score}</span>
            </div>
            {reviewSet.length > 0 && !inReview && (
              <div className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">
                รอทบทวน: <span className="font-bold">{reviewSet.length}</span>
              </div>
            )}
            {inReview && (
              <div className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">
                โหมดทบทวน
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto p-6">
          <div className={`rounded-3xl ${pastel.card} shadow-xl p-6 md:p-8 border border-pink-100 relative overflow-hidden`}> 
            {/* องค์ประกอบตกแต่ง */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-300/30 rounded-full blur-2xl"/>
            <div className="absolute -bottom-14 -left-14 w-48 h-48 bg-fuchsia-300/30 rounded-full blur-2xl"/>

            {/* ความคืบหน้า */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-pink-700/80 font-semibold">
                  {inReview ? "ความคืบหน้า (ทบทวน)" : "ความคืบหน้า"}
                </p>
                <p className="text-sm text-pink-700/80 font-semibold">{progress}%</p>
              </div>
              <div className="h-3 bg-white/70 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-400 to-fuchsia-400" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* เนื้อหาคำถาม */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-full flex items-center justify-center">
                  <div className="bg-white rounded-2xl shadow-inner p-4 md:p-6 border border-rose-100">
                    {current?.render?.()}
                  </div>
                </div>
                <div className="mt-4 flex gap-3 flex-wrap justify-center">
                  <button onClick={() => speak(current.hintTH, "th-TH")} className="px-4 py-2 rounded-full bg-white border border-pink-200 hover:bg-rose-50 text-pink-700 text-sm shadow-sm">
                    ▶️ ฟังคำใบ้ (TH)
                  </button>
                  <button onClick={() => speak(current.word, "en-US")} className="px-4 py-2 rounded-full bg-white border border-pink-200 hover:bg-rose-50 text-pink-700 text-sm shadow-sm">
                    🔊 ฟังเสียงคำศัพท์ (EN)
                  </button>
                </div>
                <p className="mt-2 text-xs text-pink-700/70">* ใช้เสียงอัตโนมัติจากอุปกรณ์ของน้อง ๆ</p>
              </div>

              <div>
                <div className="mb-3 text-pink-900">
                  <h2 className="text-xl md:text-2xl font-extrabold">ทายคำศัพท์จากภาพ</h2>
                  <p className="text-sm mt-1">เลือกคำตอบภาษาอังกฤษที่ถูกต้อง</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {options.map((opt) => {
                    const isSel = selected === opt;
                    const isRight = opt.toLowerCase() === current.word.toLowerCase();
                    const showState = selected !== null;
                    return (
                      <button
                        key={opt}
                        onClick={() => onChoose(opt)}
                        className={`text-left px-4 py-3 rounded-xl ${pastel.choice} transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 
                          ${showState && isSel && (isCorrect ? "ring-2 ring-green-400 scale-[1.01]" : "ring-2 ring-rose-400 shake")} 
                          ${showState && !isSel ? "opacity-90" : ""}`}
                        disabled={selected !== null}
                      >
                        <span className="text-lg font-bold capitalize">{opt}</span>
                        {showState && isSel && (
                          <span className={`ml-2 text-sm font-semibold ${isCorrect ? "text-green-600" : "text-rose-600"}`}>
                            {isCorrect ? "✓ ถูกต้อง" : "✗ ยังไม่ใช่"}
                          </span>
                        )}
                        {showState && !isSel && isRight && (
                          <span className="ml-2 text-sm text-green-700">(คำตอบที่ถูก)</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {showAnswer && (
                  <div className="mt-4 p-4 rounded-xl bg-white/80 border border-pink-200">
                    {isCorrect ? (
                      <p className="text-green-700 font-semibold">เยี่ยมมาก! คำตอบคือ <span className="capitalize">{current.word}</span></p>
                    ) : (
                      <p className="text-rose-700 font-semibold">คำตอบที่ถูกคือ <span className="capitalize">{current.word}</span> — จดจำไว้แล้วไปทบทวนกันนะ</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => speak(current.hintTH, "th-TH")} className="px-3 py-2 rounded-lg bg-white border border-pink-200 hover:bg-rose-50 text-pink-700 text-sm">▶️ ฟังคำใบ้อีกครั้ง</button>
                      <button onClick={() => speak(current.word, "en-US")} className="px-3 py-2 rounded-lg bg-white border border-pink-200 hover:bg-rose-50 text-pink-700 text-sm">🔊 ออกเสียงคำศัพท์</button>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center gap-3">
                  <button onClick={goNext} className={`px-5 py-3 rounded-xl text-white font-bold shadow ${pastel.primary}`}>
                    {idx === (inReview ? (reviewSet.length - 1) : (totalMain - 1)) ? (inReview ? "จบทบทวน / เริ่มใหม่" : (reviewSet.length > 0 ? "ไปโหมดทบทวน" : "เริ่มใหม่")) : "ข้อต่อไป"}
                  </button>
                  <button onClick={resetAll} className="px-4 py-3 rounded-xl bg-white border border-pink-200 hover:bg-rose-50 text-pink-700 font-semibold shadow-sm">เริ่มเกมใหม่ทั้งหมด</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center text-sm text-pink-800 bg-white/70 border-t border-pink-200">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
          <span>© {new Date().getFullYear()} • เกมฝึกคำศัพท์เพื่อเด็กประถม</span>
          <span className="opacity-60">|</span>
          <span className="font-bold">พ่อแกน</span>
        </div>
      </footer>

      {/* เล็กน้อย: CSS เขย่าเมื่อผิด */}
      <style>{`
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        .shake { animation: shakeX 300ms ease-in-out; }
      `}</style>
    </div>
  );
}
