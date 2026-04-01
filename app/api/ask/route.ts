import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const result = await model.generateContent(
      `${prompt}\n\n回答は必ず日本語で簡潔にまとめてください。\n\n最後に【情報源】として、実際に参照したウェブサイトの名称とURLを以下の形式で3件以内で記載してください。vertexaisearch等の内部URLは除外してください。\n\n【情報源】\n- サイト名|https://実際のURL\n- サイト名|https://実際のURL`
    )
    const answer = result.response.text()
    return NextResponse.json({ answer })
  } catch (error) {
    console.error("Ask error:", error)
    return NextResponse.json({ answer: "エラーが発生しました。もう一度お試しください。" }, { status: 500 })
  }
}
