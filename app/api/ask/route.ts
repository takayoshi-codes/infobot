import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const fullPrompt = `${prompt}\n\n回答は必ず日本語で簡潔にまとめてください。価格に関する質問は公式価格・市場最安値・中古価格を具体的な金額で答えてください。\n\n最後に【情報源】として実際に参照したウェブサイトの名称とURLを以下の形式で3件以内で記載してください。vertexaisearch等の内部URLは絶対に使わないでください。\n\n【情報源】\n- サイト名|https://実際のURL\n- サイト名|https://実際のURL`

    let lastError: unknown = null
    for (let i = 0; i < 3; i++) {
      try {
        const result = await model.generateContent(fullPrompt)
        const answer = result.response.text()
        return NextResponse.json({ answer })
      } catch (err: unknown) {
        lastError = err
        const msg = err instanceof Error ? err.message : ""
        if (msg.includes("429") || msg.includes("quota")) {
          await new Promise(r => setTimeout(r, 2000 * (i + 1)))
          continue
        }
        throw err
      }
    }
    throw lastError
  } catch (error) {
    console.error("Ask error:", error)
    const msg = error instanceof Error ? error.message : ""
    if (msg.includes("429") || msg.includes("quota")) {
      return NextResponse.json({ answer: "リクエストが集中しています。1分ほど待ってから再度お試しください。" }, { status: 429 })
    }
    return NextResponse.json({ answer: "エラーが発生しました。もう一度お試しください。" }, { status: 500 })
  }
}
