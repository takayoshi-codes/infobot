import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: [{ googleSearch: {} } as any],
})

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const result = await model.generateContent(
      `${prompt}\n\n回答は必ず日本語で、簡潔にまとめてください。\n\n最後に以下の形式で情報源を記載してください：\n\n【情報源】\n- サイト名|https://url\n- サイト名|https://url\n\nURLは必ずhttps://から始まる完全な形式で記載してください。`
    )
    const answer = result.response.text()
    return NextResponse.json({ answer })
  } catch (error) {
    console.error("Ask error:", error)
    return NextResponse.json({ answer: "エラーが発生しました。もう一度お試しください。" }, { status: 500 })
  }
}
