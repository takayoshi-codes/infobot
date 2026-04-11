"use client"
import { useState, useRef, useEffect, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question { id: string; label: string; prompt: string }
interface Category  { id: string; icon: string; label: string; questions: Question[] }
interface Message   { role: "user" | "assistant"; content: string; timestamp: Date }

// ─── Default categories ────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "news", icon: "📰", label: "ニュース",
    questions: [
      { id: "n1", label: "今日の主要ニュース",       prompt: "今日の日本の主要ニュースを3〜5件、簡潔に教えてください。" },
      { id: "n2", label: "海外ニュースまとめ",       prompt: "今日の海外の重要ニュースをまとめてください。" },
      { id: "n3", label: "テクノロジーニュース",     prompt: "今日のテクノロジー関連の最新ニュースを教えてください。" },
    ],
  },
  {
    id: "market", icon: "📈", label: "マーケット",
    questions: [
      { id: "m1", label: "日経平均・主要指数",       prompt: "日経平均や主要株価指数の最新動向を教えてください。" },
      { id: "m2", label: "為替レート",               prompt: "最新の為替レート（ドル円・ユーロ円など）を教えてください。" },
      { id: "m3", label: "仮想通貨相場",             prompt: "ビットコインやイーサリアムなど主要仮想通貨の最新価格を教えてください。" },
    ],
  },
  {
    id: "price", icon: "🛒", label: "価格比較",
    questions: [
      { id: "p1", label: "家電の最安値",             prompt: "人気家電の最新価格動向を教えてください。" },
      { id: "p2", label: "食料品・物価",             prompt: "最近の食料品や日用品の物価動向を教えてください。" },
    ],
  },
  {
    id: "weather", icon: "🌤", label: "天気",
    questions: [
      { id: "w1", label: "今日の全国天気",           prompt: "今日の全国主要都市の天気予報を教えてください。" },
      { id: "w2", label: "週間天気予報",             prompt: "今週の天気の見通しを教えてください。" },
    ],
  },
  {
    id: "sports", icon: "⚽", label: "スポーツ",
    questions: [
      { id: "s1", label: "昨日の試合結果",           prompt: "昨日行われた主要スポーツの試合結果を教えてください。" },
      { id: "s2", label: "プロ野球速報",             prompt: "最新のプロ野球の順位表と近況を教えてください。" },
      { id: "s3", label: "サッカー最新情報",         prompt: "国内外のサッカーの最新ニュースを教えてください。" },
    ],
  },
  {
    id: "entertainment", icon: "🎬", label: "エンタメ",
    questions: [
      { id: "e1", label: "映画・ドラマ最新情報",     prompt: "現在話題の映画やドラマについて教えてください。" },
      { id: "e2", label: "音楽チャート",             prompt: "最新の音楽チャートやリリース情報を教えてください。" },
    ],
  },
  {
    id: "gourmet", icon: "🍜", label: "グルメ",
    questions: [
      { id: "g1", label: "今週のトレンドグルメ",     prompt: "今SNSや口コミで話題のグルメ・飲食店を教えてください。" },
      { id: "g2", label: "新メニュー・新商品",       prompt: "最近発売された注目の食品・飲料の新商品を教えてください。" },
    ],
  },
  {
    id: "travel", icon: "✈️", label: "旅行",
    questions: [
      { id: "t1", label: "国内旅行おすすめ",         prompt: "この時期のおすすめ国内旅行先を教えてください。" },
      { id: "t2", label: "海外旅行情報",             prompt: "今注目の海外旅行先と渡航情報を教えてください。" },
    ],
  },
  {
    id: "jobs", icon: "💼", label: "就職・転職",
    questions: [
      { id: "j1", label: "求人トレンド",             prompt: "最近の求人・採用トレンドを教えてください。" },
      { id: "j2", label: "注目の企業・業界",         prompt: "今注目されている企業や業界について教えてください。" },
    ],
  },
  {
    id: "health", icon: "🏥", label: "健康",
    questions: [
      { id: "h1", label: "健康ニュース",             prompt: "最新の健康・医療に関するニュースを教えてください。" },
      { id: "h2", label: "感染症・流行情報",         prompt: "現在流行している感染症や注意すべき健康情報を教えてください。" },
    ],
  },
  {
    id: "science", icon: "🔬", label: "科学・テック",
    questions: [
      { id: "sc1", label: "最新科学ニュース",        prompt: "最新の科学・研究の発見について教えてください。" },
      { id: "sc2", label: "AI最新動向",              prompt: "最新のAI・人工知能に関するニュースと動向を教えてください。" },
    ],
  },
  {
    id: "study", icon: "📚", label: "学び",
    questions: [
      { id: "st1", label: "今週学べるトレンドワード", prompt: "今週覚えておきたいトレンドキーワードや知識を教えてください。" },
      { id: "st2", label: "おすすめ書籍・動画",      prompt: "最近話題の書籍や学習コンテンツを教えてください。" },
    ],
  },
  {
    id: "pets", icon: "🐾", label: "ペット",
    questions: [
      { id: "pt1", label: "ペット関連ニュース",      prompt: "最新のペット・動物に関するニュースや話題を教えてください。" },
    ],
  },
]

const ICON_OPTIONS = ["🎯","🌟","🎪","🔥","💡","🎨","🏆","🌈","🎵","🚀","🌸","🦋","🎭","🍀","🏄","🌍","💎","🎲","🦊","🎸"]

// ─── URL renderer ──────────────────────────────────────────────────────────────
function renderContent(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={styles.link}>{part}</a>
      : part
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Page() {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CATEGORIES
    try {
      const saved = localStorage.getItem("infobot-categories")
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
    } catch { return DEFAULT_CATEGORIES }
  })
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("🎯")
  const [newQLabel, setNewQLabel] = useState("")
  const [newQPrompt, setNewQPrompt] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) ?? null

  useEffect(() => {
    localStorage.setItem("infobot-categories", JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async (prompt: string, label: string) => {
    const userMsg: Message = { role: "user", content: label, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      const aiMsg: Message = { role: "assistant", content: data.answer ?? "回答を取得できませんでした。", timestamp: new Date() }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "エラーが発生しました。しばらくしてから再試行してください。", timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }, [])

  const addCategory = () => {
    if (!newCatLabel.trim() || categories.length >= 20) return
    const newCat: Category = { id: `custom-${Date.now()}`, icon: newCatIcon, label: newCatLabel.trim(), questions: [] }
    setCategories(prev => [...prev, newCat])
    setNewCatLabel(""); setNewCatIcon("🎯"); setShowAddCategory(false)
  }

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    if (selectedCategoryId === id) setSelectedCategoryId(null)
  }

  const addQuestion = () => {
    if (!newQLabel.trim() || !newQPrompt.trim() || !selectedCategory) return
    if (selectedCategory.questions.length >= 50) return
    const newQ: Question = { id: `q-${Date.now()}`, label: newQLabel.trim(), prompt: newQPrompt.trim() }
    setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, questions: [...c.questions, newQ] } : c))
    setNewQLabel(""); setNewQPrompt(""); setShowAddQuestion(false)
  }

  const deleteQuestion = (qId: string) => {
    if (!selectedCategory) return
    setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, questions: c.questions.filter(q => q.id !== qId) } : c))
  }

  const formatTime = (d: Date) => d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })

  return (
    <div style={styles.page}>
      {/* Keyframe styles */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2D3748; border-radius: 4px; }
        .cat-item:hover { background: rgba(99,102,241,0.08) !important; }
        .q-btn:hover { background: rgba(99,102,241,0.12) !important; border-color: rgba(99,102,241,0.4) !important; }
        .modal-input:focus { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; outline: none; }
        .icon-opt:hover { background: rgba(99,102,241,0.2) !important; border-color: #6366F1 !important; }
        .icon-opt.selected { background: rgba(99,102,241,0.25) !important; border-color: #6366F1 !important; }
        .del-btn:hover { color: #FC8181 !important; }
        .send-btn:hover:not(:disabled) { background: #5253CC !important; }
        .add-btn:hover { background: rgba(99,102,241,0.15) !important; border-color: #6366F1 !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>🤖</div>
            <div>
              <div style={styles.logoTitle}>InfoBot</div>
              <div style={styles.logoSub}>情報収集 AI アシスタント</div>
            </div>
          </div>
          <div style={styles.headerBadge}>
            <span style={styles.liveIndicator} />
            リアルタイム取得
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={styles.body}>

        {/* ── Sidebar ── */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarLabel}>カテゴリ</span>
            <span style={styles.catCount}>{categories.length}/20</span>
          </div>
          <div style={styles.catList}>
            {categories.map(cat => (
              <div
                key={cat.id}
                className="cat-item"
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  ...styles.catItem,
                  ...(selectedCategoryId === cat.id ? styles.catItemActive : {}),
                }}
              >
                <span style={styles.catIcon}>{cat.icon}</span>
                <span style={styles.catLabel}>{cat.label}</span>
                <button
                  className="del-btn"
                  onClick={e => { e.stopPropagation(); deleteCategory(cat.id) }}
                  style={styles.iconBtn}
                  title="削除"
                >×</button>
              </div>
            ))}
          </div>
          {categories.length < 20 && (
            <button className="add-btn" onClick={() => setShowAddCategory(true)} style={styles.addCatBtn}>
              + カテゴリを追加
            </button>
          )}
        </aside>

        {/* ── Question panel ── */}
        <div style={styles.qPanel}>
          {selectedCategory ? (
            <>
              <div style={styles.qPanelHeader}>
                <div style={styles.qPanelTitle}>
                  <span style={styles.qPanelIcon}>{selectedCategory.icon}</span>
                  {selectedCategory.label}
                </div>
                <span style={styles.qPanelCount}>{selectedCategory.questions.length} 件</span>
              </div>
              <div style={styles.qList}>
                {selectedCategory.questions.map(q => (
                  <div key={q.id} style={styles.qItem}>
                    <button
                      className="q-btn"
                      onClick={() => sendMessage(q.prompt, q.label)}
                      disabled={loading}
                      style={styles.qBtn}
                    >
                      <span style={styles.qArrow}>›</span>
                      {q.label}
                    </button>
                    <button
                      className="del-btn"
                      onClick={() => deleteQuestion(q.id)}
                      style={styles.iconBtn}
                      title="削除"
                    >×</button>
                  </div>
                ))}
              </div>
              {selectedCategory.questions.length < 50 && (
                <button className="add-btn" onClick={() => setShowAddQuestion(true)} style={styles.addQBtn}>
                  + 質問を追加
                </button>
              )}
            </>
          ) : (
            <div style={styles.qPanelEmpty}>
              <div style={styles.qPanelEmptyIcon}>←</div>
              <div style={styles.qPanelEmptyText}>カテゴリを選択すると<br />質問一覧が表示されます</div>
            </div>
          )}
        </div>

        {/* ── Chat area ── */}
        <div style={styles.chatArea}>
          <div style={styles.chatMessages}>
            {messages.length === 0 ? (
              <div style={styles.chatEmpty}>
                <div style={styles.chatEmptyIcon}>💬</div>
                <div style={styles.chatEmptyTitle}>InfoBot へようこそ</div>
                <div style={styles.chatEmptyText}>左のパネルから質問を選んでください</div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.msgWrap,
                    animation: "fadeUp 0.25s ease forwards",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.role === "assistant" && <div style={styles.aiAvatar}>🤖</div>}
                  <div style={msg.role === "user" ? styles.userBubble : styles.aiBubble}>
                    <div style={styles.bubbleContent}>{renderContent(msg.content)}</div>
                    <div style={styles.bubbleTime}>{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ ...styles.msgWrap, justifyContent: "flex-start" }}>
                <div style={styles.aiAvatar}>🤖</div>
                <div style={styles.aiBubble}>
                  <div style={styles.dots}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.16}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* ── Modal: Add Category ── */}
      {showAddCategory && (
        <div style={styles.overlay} onClick={() => setShowAddCategory(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>カテゴリを追加</div>
              <button onClick={() => setShowAddCategory(false)} style={styles.modalClose}>×</button>
            </div>
            <label style={styles.fieldLabel}>カテゴリ名</label>
            <input
              className="modal-input"
              placeholder="例：投資・資産運用"
              value={newCatLabel}
              onChange={e => setNewCatLabel(e.target.value)}
              style={styles.input}
              maxLength={20}
            />
            <label style={styles.fieldLabel}>アイコン</label>
            <div style={styles.iconGrid}>
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  className={`icon-opt${newCatIcon === icon ? " selected" : ""}`}
                  onClick={() => setNewCatIcon(icon)}
                  style={{ ...styles.iconOpt, ...(newCatIcon === icon ? styles.iconOptSelected : {}) }}
                >{icon}</button>
              ))}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowAddCategory(false)} style={styles.cancelBtn}>キャンセル</button>
              <button onClick={addCategory} style={styles.primaryBtn} disabled={!newCatLabel.trim()}>追加する</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Question ── */}
      {showAddQuestion && selectedCategory && (
        <div style={styles.overlay} onClick={() => setShowAddQuestion(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>質問を追加</div>
              <button onClick={() => setShowAddQuestion(false)} style={styles.modalClose}>×</button>
            </div>
            <label style={styles.fieldLabel}>質問ラベル（短い表示名）</label>
            <input
              className="modal-input"
              placeholder="例：今週の決算発表"
              value={newQLabel}
              onChange={e => setNewQLabel(e.target.value)}
              style={styles.input}
              maxLength={40}
            />
            <label style={styles.fieldLabel}>AIへのプロンプト</label>
            <textarea
              className="modal-input"
              placeholder="例：今週発表予定の主要企業の決算をまとめてください。"
              value={newQPrompt}
              onChange={e => setNewQPrompt(e.target.value)}
              style={{ ...styles.input, height: 100, resize: "vertical" }}
              maxLength={300}
            />
            <div style={styles.modalFooter}>
              <button onClick={() => setShowAddQuestion(false)} style={styles.cancelBtn}>キャンセル</button>
              <button onClick={addQuestion} style={styles.primaryBtn} disabled={!newQLabel.trim() || !newQPrompt.trim()}>追加する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#080C14",
    color: "#E2E8F0",
    fontFamily: "'Geist', 'Hiragino Sans', 'Yu Gothic', sans-serif",
    overflow: "hidden",
  },

  // Header
  header: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(12px)",
    backgroundColor: "rgba(8,12,20,0.85)",
    flexShrink: 0,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: "100%",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: {
    width: 38, height: 38,
    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20,
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  logoTitle: { fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", color: "#F1F5F9" },
  logoSub:   { fontSize: 11, color: "#64748B", marginTop: 1 },
  headerBadge: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "5px 12px",
    borderRadius: 20,
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.2)",
    color: "#34D399",
    fontSize: 12, fontWeight: 500,
  },
  liveIndicator: {
    width: 6, height: 6,
    borderRadius: "50%",
    backgroundColor: "#34D399",
    boxShadow: "0 0 6px #34D399",
    display: "inline-block",
  },

  // Body layout
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },

  // Sidebar
  sidebar: {
    width: 210,
    flexShrink: 0,
    borderRight: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "#0D1117",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "16px 16px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarLabel: { fontSize: 11, fontWeight: 600, color: "#4B5563", letterSpacing: "0.06em", textTransform: "uppercase" },
  catCount:     { fontSize: 11, color: "#374151", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "1px 7px" },
  catList: { flex: 1, overflowY: "auto", padding: "0 8px" },
  catItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background 0.15s",
    marginBottom: 2,
  },
  catItemActive: {
    background: "rgba(99,102,241,0.12)",
    borderLeft: "2px solid #6366F1",
    paddingLeft: 8,
  },
  catIcon:  { fontSize: 16, flexShrink: 0 },
  catLabel: { flex: 1, fontSize: 13, color: "#CBD5E1", fontWeight: 500 },
  iconBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#374151", fontSize: 14, lineHeight: 1,
    padding: "0 2px", transition: "color 0.15s", flexShrink: 0,
  },
  addCatBtn: {
    margin: "8px 12px 12px",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px dashed rgba(99,102,241,0.3)",
    background: "transparent",
    color: "#6366F1",
    fontSize: 12, fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
  },

  // Question panel
  qPanel: {
    width: 260,
    flexShrink: 0,
    borderRight: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "#0B0F18",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  qPanelHeader: {
    padding: "16px 16px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qPanelTitle: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 14, fontWeight: 600, color: "#F1F5F9",
  },
  qPanelIcon: { fontSize: 18 },
  qPanelCount: {
    fontSize: 11, color: "#4B5563",
    background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "1px 7px",
  },
  qList: { flex: 1, overflowY: "auto", padding: "8px" },
  qItem: {
    display: "flex", alignItems: "center", gap: 4,
    marginBottom: 4,
  },
  qBtn: {
    flex: 1,
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    color: "#94A3B8",
    fontSize: 13,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
  },
  qArrow: { color: "#6366F1", fontSize: 16, fontWeight: 700, flexShrink: 0 },
  addQBtn: {
    margin: "8px 12px 12px",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px dashed rgba(99,102,241,0.3)",
    background: "transparent",
    color: "#6366F1",
    fontSize: 12, fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
  },
  qPanelEmpty: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 12,
    color: "#2D3748",
  },
  qPanelEmptyIcon: { fontSize: 28 },
  qPanelEmptyText: {
    fontSize: 13, color: "#374151",
    textAlign: "center", lineHeight: 1.6,
  },

  // Chat
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#080C14",
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  chatEmpty: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 12,
    marginTop: 80,
    color: "#2D3748",
  },
  chatEmptyIcon:  { fontSize: 40 },
  chatEmptyTitle: { fontSize: 17, fontWeight: 600, color: "#374151" },
  chatEmptyText:  { fontSize: 13, color: "#2D3748" },

  msgWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
  },
  aiAvatar: {
    width: 32, height: 32,
    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, flexShrink: 0,
    boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
  },
  userBubble: {
    maxWidth: "72%",
    padding: "10px 16px",
    borderRadius: "16px 16px 4px 16px",
    background: "linear-gradient(135deg, #6366F1, #7C3AED)",
    color: "#fff",
    fontSize: 14,
    lineHeight: 1.6,
    boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
  },
  aiBubble: {
    maxWidth: "76%",
    padding: "12px 16px",
    borderRadius: "4px 16px 16px 16px",
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 1.7,
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
  },
  bubbleContent: { whiteSpace: "pre-wrap", wordBreak: "break-word" },
  bubbleTime: {
    fontSize: 10, color: "rgba(255,255,255,0.3)",
    marginTop: 5, textAlign: "right",
  },
  link: { color: "#818CF8", textDecoration: "underline" },

  // Loading dots
  dots: { display: "flex", gap: 5, padding: "4px 2px", alignItems: "center" },
  dot: {
    width: 7, height: 7,
    borderRadius: "50%",
    backgroundColor: "#6366F1",
    display: "inline-block",
    animation: "bounce 1.2s infinite",
  },

  // Modal
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    width: 420,
    backgroundColor: "#111827",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    padding: 24,
    boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
    display: "flex", flexDirection: "column", gap: 14,
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "#F1F5F9" },
  modalClose: {
    background: "none", border: "none",
    color: "#4B5563", cursor: "pointer",
    fontSize: 20, lineHeight: 1,
  },
  fieldLabel: { fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: -8 },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#E2E8F0",
    fontSize: 14,
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  iconGrid: {
    display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6,
  },
  iconOpt: {
    padding: "6px",
    borderRadius: 6,
    border: "1px solid transparent",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
    fontSize: 16,
    transition: "all 0.15s",
  },
  iconOptSelected: {
    background: "rgba(99,102,241,0.25)",
    borderColor: "#6366F1",
  },
  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4,
  },
  cancelBtn: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "#64748B",
    fontSize: 13, fontWeight: 500,
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #6366F1, #7C3AED)",
    color: "#fff",
    fontSize: 13, fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
    opacity: 1,
    transition: "opacity 0.15s",
  },
}
