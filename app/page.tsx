"use client"
import { useState, useRef, useEffect } from "react"

interface Question { id: string; label: string; prompt: string }
interface Category { id: string; icon: string; label: string; questions: Question[] }
interface Message { role: "user" | "assistant"; content: string; timestamp: Date }

function renderContent(text: string) {
  const urlRegex = /(https?:\/\/[^\s\)\]]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA", textDecoration: "underline", wordBreak: "break-all" }}>{part}</a>
      : <span key={i}>{part}</span>
  )
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "news", icon: "\uD83D\uDCF0", label: "\u30CB\u30E5\u30FC\u30B9",
    questions: [
      { id: "n1", label: "AI\u30FB\u30C6\u30C3\u30AF\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u65E5\u306EAI\u30FB\u30C6\u30AF\u30CE\u30ED\u30B8\u30FC\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u8981\u7D042\u30013\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002\u898B\u51FA\u3057\u3001\u6982\u8981\u3001\u306A\u305C\u91CD\u8981\u304B\u3092\u30BB\u30C3\u30C8\u3067\u307E\u3068\u3081\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "n2", label: "\u7D4C\u6E08\u30FB\u30D3\u30B8\u30CD\u30B9\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u65E5\u306E\u65E5\u672C\u306E\u7D4C\u6E08\u30FB\u30D3\u30B8\u30CD\u30B9\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u8981\u7D042\u30013\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "n3", label: "\u4E16\u754C\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u65E5\u306E\u4E16\u754C\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u8981\u7D042\u30013\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "market", icon: "\uD83D\uDCB9", label: "\u30DE\u30FC\u30B1\u30C3\u30C8",
    questions: [
      { id: "m1", label: "\u65E5\u7D4C\u5E73\u5747\u306E\u73FE\u5728\u5024", prompt: "\u65E5\u7D4C\u5E73\u5747\u682A\u4FA1\u306E\u73FE\u5728\u5024\u3001\u524D\u65E5\u6BD4\u3001\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m2", label: "\u30C9\u30EB\u5186\u30FB\u70BA\u66FF\u30EC\u30FC\u30C8", prompt: "\u73FE\u5728\u306E\u30C9\u30EB\u5186\u3001\u30E6\u30FC\u30ED\u5186\u3001\u4EBA\u6C11\u5143\u5186\u306E\u70BA\u66FF\u30EC\u30FC\u30C8\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m3", label: "\u4EEE\u60F3\u901A\u8CA8\u306E\u4FA1\u683C", prompt: "BTC\u3001ETH\u3001XRP\u306E\u73FE\u5728\u4FA1\u683C\u3068\u524D\u65E5\u6BD4\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "price", icon: "\uD83D\uDED2", label: "\u4FA1\u683C\u6BD4\u8F03",
    questions: [
      { id: "p1", label: "iPhone\u6700\u65B0\u30E2\u30C7\u30EB\u306E\u4FA1\u683C", prompt: "iPhone\u6700\u65B0\u30E2\u30C7\u30EB\u306E\u65E5\u672C\u3067\u306E\u516C\u5F0F\u4FA1\u683C\u3068\u5E02\u5834\u4FA1\u683C\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p2", label: "AirPods\u306E\u6700\u5B89\u5024", prompt: "AirPods Pro\u306E\u73FE\u5728\u306E\u65E5\u672C\u3067\u306E\u516C\u5F0F\u4FA1\u683C\u3068\u5E02\u5834\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p3", label: "PS5\u306E\u73FE\u5728\u4FA1\u683C", prompt: "PlayStation 5\u306E\u73FE\u5728\u306E\u65E5\u672C\u3067\u306E\u516C\u5F0F\u4FA1\u683C\u3068\u5E02\u5834\u4FA1\u683C\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304C\u3055\u3044\u3002" },
    ],
  },
  {
    id: "weather", icon: "\uD83C\uDF24", label: "\u5929\u6C17",
    questions: [
      { id: "w1", label: "\u6771\u4EAC\u306E\u5929\u6C17", prompt: "\u6771\u4EAC\u306E\u4ECA\u65E5\u306E\u5929\u6C17\u3001\u6C17\u6E29\u3001\u964D\u6C34\u78BA\u7387\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w2", label: "\u5927\u962A\u306E\u5929\u6C17", prompt: "\u5927\u962A\u306E\u4ECA\u65E5\u306E\u5929\u6C17\u3001\u6C17\u6E29\u3001\u964D\u6C34\u78BA\u7387\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w3", label: "\u4E00\u9031\u9593\u306E\u5929\u6C17\u4E88\u5831", prompt: "\u6771\u4EAC\u306E\u4ECA\u5F8C7\u65E5\u9593\u306E\u5929\u6C17\u4E88\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
]

const ICONS = ["\uD83D\uDCF0","\uD83D\uDCB9","\uD83D\uDED2","\uD83C\uDF24","\uD83D\uDD0D","\uD83D\uDCA1","\uD83C\uDFAE","\uD83C\uDF7D\uFE0F","\u2708\uFE0F","\uD83C\uDFE0","\uD83D\uDCCA","\uD83E\uDD16","\uD83C\uDF31","\uD83D\uDCBB","\uD83C\uDFAC","\uD83D\uDCDA","\uD83C\uDFC6","\uD83D\uDCCC","\uD83D\uDD14","\u2753"]

export default function Home() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [showAddQ, setShowAddQ] = useState(false)
  const [newCatIcon, setNewCatIcon] = useState("\uD83D\uDCCC")
  const [newCatLabel, setNewCatLabel] = useState("")
  const [newQLabel, setNewQLabel] = useState("")
  const [newQPrompt, setNewQPrompt] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  const selectedCat = categories.find(c => c.id === selectedCatId)

  const handleQuestion = async (q: Question) => {
    const userMsg: Message = { role: "user", content: q.label, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await fetch("/api/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q.prompt }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.answer, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002", timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const addCategory = () => {
    if (!newCatLabel.trim() || categories.length >= 20) return
    const id = `cat_${Date.now()}`
    setCategories(prev => [...prev, { id, icon: newCatIcon, label: newCatLabel.trim(), questions: [] }])
    setNewCatLabel("")
    setNewCatIcon("\uD83D\uDCCC")
    setShowAddCat(false)
    setSelectedCatId(id)
  }

  const addQuestion = () => {
    if (!newQLabel.trim() || !newQPrompt.trim() || !selectedCatId) return
    const cat = categories.find(c => c.id === selectedCatId)
    if (!cat || cat.questions.length >= 50) return
    const newQ: Question = { id: `q_${Date.now()}`, label: newQLabel.trim(), prompt: newQPrompt.trim() }
    setCategories(prev => prev.map(c => c.id === selectedCatId ? { ...c, questions: [...c.questions, newQ] } : c))
    setNewQLabel("")
    setNewQPrompt("")
    setShowAddQ(false)
  }

  const deleteCat = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    if (selectedCatId === id) setSelectedCatId(null)
  }

  const deleteQ = (catId: string, qId: string) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, questions: c.questions.filter(q => q.id !== qId) } : c))
  }

  const formatTime = (d: Date) => `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`

  const modalStyle: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "center",
  }
  const cardStyle: React.CSSProperties = {
    background: "#1A1D2E", border: "1px solid #2A2D3E", borderRadius: 16,
    padding: 24, width: 360, display: "flex", flexDirection: "column", gap: 12,
  }
  const inputStyle: React.CSSProperties = {
    background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: 8,
    padding: "9px 12px", color: "#E8EAF0", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
  }

  return (
    <main style={{ height: "100vh", background: "#0F1117", color: "#E8EAF0", fontFamily: "sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <header style={{ background: "#1A1D2E", borderBottom: "1px solid #2A2D3E", padding: "13px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7B5FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{"\uD83E\uDD16"}</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>InfoBot</h1>
          <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>{"\u60C5\u5831\u53CE\u96C6AI\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8"}</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ fontSize: 11, color: "#6B7280" }}>Gemini 2.5 Flash</span>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar: カテゴリー */}
        <aside style={{ width: 200, background: "#1A1D2E", borderRight: "1px solid #2A2D3E", padding: "14px 10px", flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
            <p style={{ fontSize: 10, color: "#6B7280", margin: 0, fontWeight: 600, letterSpacing: "0.06em" }}>{"\u30AB\u30C6\u30B4\u30EA\u30FC"} ({categories.length}/20)</p>
            {categories.length < 20 && (
              <button onClick={() => setShowAddCat(true)} style={{ background: "rgba(79,142,247,0.15)", border: "1px solid #4F8EF7", borderRadius: 6, color: "#4F8EF7", fontSize: 11, padding: "2px 8px", cursor: "pointer" }}>+ {"\u8FFD\u52A0"}</button>
            )}
          </div>
          {categories.map(cat => (
            <div key={cat.id} style={{ position: "relative", marginBottom: 2 }}>
              <button onClick={() => setSelectedCatId(cat.id)} style={{
                width: "100%", padding: "9px 32px 9px 12px", borderRadius: 10, border: "none",
                background: selectedCatId === cat.id ? "rgba(79,142,247,0.15)" : "transparent",
                color: selectedCatId === cat.id ? "#4F8EF7" : "#9CA3AF",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 9,
                fontSize: 13, fontWeight: selectedCatId === cat.id ? 600 : 400, textAlign: "left",
                borderLeft: selectedCatId === cat.id ? "3px solid #4F8EF7" : "3px solid transparent",
              }}>
                <span style={{ fontSize: 16 }}>{cat.icon}</span>{cat.label}
              </button>
              <button onClick={() => deleteCat(cat.id)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 13, padding: 2 }}>×</button>
            </div>
          ))}

          <div style={{ marginTop: "auto", borderTop: "1px solid #2A2D3E", paddingTop: 12 }}>
            <p style={{ fontSize: 10, color: "#6B7280", margin: "0 0 6px 4px", fontWeight: 600 }}>{"\u5C65\u6B74"}</p>
            {messages.filter(m => m.role === "user").slice(-4).reverse().map((m, i) => (
              <div key={i} style={{ padding: "4px 8px", fontSize: 11, color: "#4B5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.content}</div>
            ))}
            {messages.length === 0 && <p style={{ fontSize: 11, color: "#374151", padding: "0 4px" }}>{"\u307E\u3060\u8CEA\u554F\u304C\u3042\u308A\u307E\u305B\u3093"}</p>}
          </div>
        </aside>

        {/* 中央: 質問パネル */}
        <div style={{ width: 240, borderRight: "1px solid #2A2D3E", background: "#13151F", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
          {!selectedCatId ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <p style={{ fontSize: 12, color: "#374151", textAlign: "center", lineHeight: 1.8 }}>
                {"\u2190 \u5DE6\u306E\u30AB\u30C6\u30B4\u30EA\u30FC\u3092"}<br />{"\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044"}
              </p>
            </div>
          ) : (
            <>
              <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #2A2D3E", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#C9D1E0" }}>
                    {selectedCat?.icon} {selectedCat?.label}
                  </p>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>{selectedCat?.questions.length}/50</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6B7280" }}>{"\u8CEA\u554F\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044"}</p>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
                {selectedCat?.questions.map(q => (
                  <div key={q.id} style={{ position: "relative", marginBottom: 6 }}>
                    <button onClick={() => handleQuestion(q)} disabled={loading} style={{
                      width: "100%", padding: "10px 32px 10px 12px", borderRadius: 10,
                      border: "1px solid #2A2D3E", background: loading ? "#0F1117" : "#1A1D2E",
                      color: loading ? "#374151" : "#C9D1E0", cursor: loading ? "not-allowed" : "pointer",
                      fontSize: 13, textAlign: "left", lineHeight: 1.4,
                    }}>{q.label}</button>
                    <button onClick={() => deleteQ(selectedCatId!, q.id)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 12, padding: 2 }}>×</button>
                  </div>
                ))}
                {selectedCat && selectedCat.questions.length === 0 && (
                  <p style={{ fontSize: 12, color: "#374151", textAlign: "center", marginTop: 20 }}>{"\u8CEA\u554F\u304C\u3042\u308A\u307E\u305B\u3093"}</p>
                )}
              </div>
              {selectedCat && selectedCat.questions.length < 50 && (
                <div style={{ padding: "10px", borderTop: "1px solid #2A2D3E", flexShrink: 0 }}>
                  <button onClick={() => setShowAddQ(true)} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "1px dashed #2A2D3E", background: "transparent", color: "#6B7280", cursor: "pointer", fontSize: 12 }}>
                    + {"\u8CEA\u554F\u3092\u8FFD\u52A0"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 右: チャット */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12 }}>
                <div style={{ fontSize: 52 }}>{"\uD83E\uDD16"}</div>
                <h2 style={{ margin: 0, fontSize: 18 }}>InfoBot {"\u3078\u3088\u3046\u3053\u305D"}</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 2 }}>
                  {"\u5DE6\u306E\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u9078\u3073\u3001\u771F\u4E2D\u306E\u8CEA\u554F\u30EA\u30B9\u30C8\u304B\u3089\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3060\u3051\u3067OK\u3002"}<br />
                  {"\u30CB\u30E5\u30FC\u30B9\u30FB\u30DE\u30FC\u30B1\u30C3\u30C8\u30FB\u4FA1\u683C\u30FB\u5929\u6C17\u3092AI\u304C\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u3067\u53CE\u96C6\u3057\u307E\u3059\u3002"}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10 }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7B5FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{"\uD83E\uDD16"}</div>
                )}
                <div style={{ maxWidth: "74%" }}>
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "linear-gradient(135deg,#4F8EF7,#7B5FFF)" : "#1A1D2E",
                    border: msg.role === "assistant" ? "1px solid #2A2D3E" : "none",
                    fontSize: 14, lineHeight: 1.75, color: "#E8EAF0", whiteSpace: "pre-wrap",
                  }}>{msg.role === "assistant" ? renderContent(msg.content) : msg.content}</div>
                  <div style={{ fontSize: 11, color: "#374151", marginTop: 4, textAlign: msg.role === "user" ? "right" : "left" }}>{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7B5FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{"\uD83E\uDD16"}</div>
                <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "#1A1D2E", border: "1px solid #2A2D3E" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#4F8EF7", animation: `bounce 1s ${i*0.15}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* モーダル: カテゴリー追加 */}
      {showAddCat && (
        <div style={modalStyle} onClick={() => setShowAddCat(false)}>
          <div style={cardStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{"\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u8FFD\u52A0"}</h3>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6B7280" }}>{"\u30A2\u30A4\u30B3\u30F3\u3092\u9078\u629E"}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewCatIcon(ic)} style={{ width: 34, height: 34, borderRadius: 8, border: newCatIcon === ic ? "2px solid #4F8EF7" : "1px solid #2A2D3E", background: newCatIcon === ic ? "rgba(79,142,247,0.2)" : "#0F1117", cursor: "pointer", fontSize: 17 }}>{ic}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6B7280" }}>{"\u30AB\u30C6\u30B4\u30EA\u30FC\u540D"}</p>
              <input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} placeholder="例：スポーツ" style={inputStyle} maxLength={20} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddCat(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #2A2D3E", background: "transparent", color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>{"\u30AD\u30E3\u30F3\u30BB\u30EB"}</button>
              <button onClick={addCategory} disabled={!newCatLabel.trim()} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: newCatLabel.trim() ? "#4F8EF7" : "#2A2D3E", color: "#fff", cursor: newCatLabel.trim() ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600 }}>{"\u8FFD\u52A0"}</button>
            </div>
          </div>
        </div>
      )}

      {/* モーダル: 質問追加 */}
      {showAddQ && (
        <div style={modalStyle} onClick={() => setShowAddQ(false)}>
          <div style={{ ...cardStyle, width: 420 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{"\u8CEA\u554F\u3092\u8FFD\u52A0"} — {selectedCat?.icon} {selectedCat?.label}</h3>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6B7280" }}>{"\u8CEA\u554F\u306E\u30E9\u30D9\u30EB\uff08\u30DC\u30BF\u30F3\u306B\u8868\u793A\u3055\u308C\u308B\u30C6\u30AD\u30B9\u30C8\uff09"}</p>
              <input value={newQLabel} onChange={e => setNewQLabel(e.target.value)} placeholder="例：今日のサッカーの結果は？" style={inputStyle} maxLength={40} />
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6B7280" }}>{"AI\u306B\u9001\u308B\u30D7\u30ED\u30F3\u30D7\u30C8\uff08\u5177\u4F53\u7684\u306A\u6307\u793A\uff09"}</p>
              <textarea value={newQPrompt} onChange={e => setNewQPrompt(e.target.value)} placeholder="例：本日のサッカー日本代表の試合結果を日本語で教えてください。" style={{ ...inputStyle, height: 80, resize: "vertical", lineHeight: 1.6 }} maxLength={200} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddQ(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #2A2D3E", background: "transparent", color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>{"\u30AD\u30E3\u30F3\u30BB\u30EB"}</button>
              <button onClick={addQuestion} disabled={!newQLabel.trim() || !newQPrompt.trim()} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: newQLabel.trim() && newQPrompt.trim() ? "#4F8EF7" : "#2A2D3E", color: "#fff", cursor: newQLabel.trim() && newQPrompt.trim() ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600 }}>{"\u8FFD\u52A0"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
      `}</style>
    </main>
  )
}
