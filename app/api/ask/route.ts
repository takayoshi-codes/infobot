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
      `${prompt}\n\n\u56DE\u7B54\u306F\u5FC5\u305A\u65E5\u672C\u8A9E\u3067\u3001\u7C21\u6F54\u306B\u307E\u3068\u3081\u3066\u304F\u3060\u3055\u3044\u3002\u6700\u5F8C\u306B\u300C\u60C5\u5831\u6E90\u300D\u3068\u3057\u3066\u53C2\u8003\u306B\u3057\u305F\u30B5\u30A4\u30C8\u306EURL\u3092\u5FC5\u305A\u30EA\u30B9\u30C8\u3057\u3066\u304F\u3060\u3055\u3044\u3002URL\u306F\u5FC5\u305Ahttps://\u304B\u3089\u59CB\u307E\u308B\u5B8C\u5168\u306A\u5F62\u5F0F\u3067\u8A18\u8F09\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
    )
    const answer = result.response.text()
    return NextResponse.json({ answer })
  } catch (error) {
    console.error("Ask error:", error)
    return NextResponse.json({ answer: "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" }, { status: 500 })
  }
}
