"use client"
import { useState, useRef, useEffect } from "react"

interface Question { id: string; label: string; prompt: string }
interface Category { id: string; icon: string; label: string; questions: Question[] }
interface Message { role: "user" | "assistant"; content: string; timestamp: Date }

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "news", icon: "\uD83D\uDCF0", label: "\u30CB\u30E5\u30FC\u30B9",
    questions: [
      { id: "n1", label: "AI\u30FB\u30C6\u30C3\u30AF\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u65E5\u306EAI\u30FB\u30C6\u30AF\u30CE\u30ED\u30B8\u30FC\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u8981\u7D043\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002\u898B\u51FA\u3057\u30FB\u6982\u8981\u30FB\u306A\u305C\u91CD\u8981\u304B\u3092\u30BB\u30C3\u30C8\u3067\u307E\u3068\u3081\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "n2", label: "\u7D4C\u6E08\u30FB\u30D3\u30B8\u30CD\u30B9\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u65E5\u306E\u65E5\u672C\u306E\u7D4C\u6E08\u30FB\u30D3\u30B8\u30CD\u30B9\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u8981\u7D043\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "n3", label: "\u4E16\u754C\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u65E5\u306E\u4E16\u754C\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u8981\u7D043\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "n4", label: "\u65E5\u672C\u306E\u653F\u6CBB\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u65E5\u306E\u65E5\u672C\u306E\u653F\u6CBB\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u8981\u7D043\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "n5", label: "\u73FE\u5728\u306E\u30C8\u30EC\u30F3\u30C9\u8A71\u984C", prompt: "\u4ECA\u65E5\u65E5\u672C\u3067\u6700\u3082\u8A71\u984C\u306B\u306A\u3063\u3066\u3044\u308B\u30CB\u30E5\u30FC\u30B9\u30E9\u30F3\u30AD\u30F3\u30B0\u4E0A\u4F4D\u30923\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "n6", label: "\u73FE\u5728\u306E\u56FD\u969B\u60C5\u52E2", prompt: "\u4ECA\u65E5\u306E\u4E16\u754C\u60C5\u52E2\u3067\u6700\u3082\u6CE8\u76EE\u3059\u3079\u304D\u30C6\u30FC\u30DE\u3092\u65E5\u672C\u8A9E\u3067\u8981\u7D042\u301C3\u4EF6\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "n7", label: "現在の環境・気候ニュース", prompt: "今日の環境問題・気候変動に関する最新ニュースを日本語で教えてください。" },
      { id: "n8", label: "\u4ECA\u65E5\u306E\u30B5\u30A4\u30A8\u30F3\u30B9\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u65E5\u767A\u8868\u3055\u308C\u305F\u79D1\u5B66\u30FB\u5B66\u8853\u7814\u7A76\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "market", icon: "\uD83D\uDCB9", label: "\u30DE\u30FC\u30B1\u30C3\u30C8",
    questions: [
      { id: "m1", label: "\u65E5\u7D4C\u5E73\u5747\u306E\u73FE\u5728\u5024", prompt: "\u65E5\u7D4C\u5E73\u5747\u682A\u4FA1\u306E\u73FE\u5728\u5024\u3001\u524D\u65E5\u6BD4\u3001\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m2", label: "\u30C9\u30EB\u5186\u70BA\u66FF\u30EC\u30FC\u30C8", prompt: "\u73FE\u5728\u306E\u30C9\u30EB\u5186\u3001\u30E6\u30FC\u30ED\u5186\u3001\u4EBA\u6C11\u5143\u5186\u306E\u70BA\u66FF\u30EC\u30FC\u30C8\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m3", label: "\u4EEE\u60F3\u901A\u8CA8\u306E\u4FA1\u683C", prompt: "BTC\u3001ETH\u3001XRP\u306E\u73FE\u5728\u4FA1\u683C\u3068\u524D\u65E5\u6BD4\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m4", label: "\u7C73\u56FD\u682A\u5F0F\u5E02\u5834\u306E\u72B6\u6CC1", prompt: "\u30CA\u30B9\u30C0\u30C3\u30AF\u3001NYダウ\u3001S&P500\u306E\u73FE\u5728\u5024\u3068\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m5", label: "\u91D1\u30FB\u539F\u6CB9\u306E\u4FA1\u683C", prompt: "\u91D1\u5148\u7269\u30FB\u539F\u6CB9\u306E\u73FE\u5728\u4FA1\u683C\u3068\u76F4\u8FD1\u306E\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m6", label: "\u4ECA\u9031\u306E\u7D4C\u6E08\u6307\u6A19", prompt: "\u4ECA\u9031\u767A\u8868\u4E88\u5B9A\u307E\u305F\u306F\u767A\u8868\u6E08\u307F\u306E\u4E3B\u8981\u7D4C\u6E08\u6307\u6A19\uff08GDP\u30FB\u96C7\u7528\u7D71\u8A08\u30FB\u7269\u4FA1\u6307\u6570\u7B49\uff09\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m7", label: "\u6CE8\u76EE\u306E\u65E5\u672C\u682A", prompt: "\u4ECA\u65E5\u6CE8\u76EE\u5EA6\u306E\u9AD8\u3044\u65E5\u672C\u682A\u3068\u305D\u306E\u7406\u7531\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "m8", label: "\u65E5\u672C\u306E\u91D1\u5229\u52D5\u5411", prompt: "\u65E5\u672C\u9280\u884C\u306E\u6700\u65B0\u306E\u91D1\u5229\u653F\u7B56\u3068\u9577\u671F\u91D1\u5229\u306E\u52D5\u5411\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "price", icon: "\uD83D\uDED2", label: "\u4FA1\u683C\u6BD4\u8F03",
    questions: [
      { id: "p1", label: "iPhone\u6700\u65B0\u30E2\u30C7\u30EB\u306E\u4FA1\u683C", prompt: "iPhone\u6700\u65B0\u30E2\u30C7\u30EB\u306E\u65E5\u672C\u3067\u306E\u516C\u5F0F\u4FA1\u683C\u3068\u5E02\u5834\u6700\u5B89\u5024\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p2", label: "AirPods\u306E\u6700\u5B89\u5024", prompt: "AirPods Pro\u306E\u73FE\u5728\u306E\u65E5\u672C\u3067\u306E\u516C\u5F0F\u4FA1\u683C\u3068\u5E02\u5834\u6700\u5B89\u5024\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p3", label: "PS5\u306E\u73FE\u5728\u4FA1\u683C", prompt: "PlayStation 5\u306E\u73FE\u5728\u306E\u65E5\u672C\u3067\u306E\u516C\u5F0F\u4FA1\u683C\u3068\u5E02\u5834\u6700\u5B89\u5024\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p4", label: "MacBook\u306E\u6700\u5B89\u5024", prompt: "MacBook Air\u3068MacBook Pro\u306E\u73FE\u5728\u306E\u65E5\u672C\u516C\u5F0F\u4FA1\u683C\u3068\u5E02\u5834\u6700\u5B89\u5024\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p5", label: "Switch 2\u306E\u4FA1\u683C", prompt: "Nintendo Switch 2\u306E\u73FE\u5728\u306E\u65E5\u672C\u516C\u5F0F\u4FA1\u683C\u3068\u5E02\u5834\u4FA1\u683C\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p6", label: "\u30AC\u30BD\u30EA\u30F3\u4FA1\u683C\u306E\u73FE\u5728", prompt: "\u73FE\u5728\u306E\u65E5\u672C\u5168\u56FD\u306E\u30AC\u30BD\u30EA\u30F3\u30EC\u30AE\u30E5\u30E9\u30FC\u306E\u5E73\u5747\u4FA1\u683C\u3068\u6700\u5B89\u5024\u306E\u5730\u57DF\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p7", label: "\u96FB\u6C17\u4EE3\u306E\u6BD4\u8F03", prompt: "\u65E5\u672C\u306E\u4E3B\u8981\u96FB\u529B\u4F1A\u793E\u306E\u73FE\u5728\u306E\u96FB\u6C17\u4EE3\u5358\u4FA1\u3092\u6BD4\u8F03\u3057\u3066\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "p8", label: "\u65B0\u5E79\u7DDA\u6700\u5B89\u5024", prompt: "\u4E3B\u8981\u90FD\u5E02\u9593\u306E\u65B0\u5E79\u7DDA\u306E\u73FE\u5728\u306E\u6700\u5B89\u5024\u30FB\u5272\u5F15\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "weather", icon: "\uD83C\uDF24", label: "\u5929\u6C17",
    questions: [
      { id: "w1", label: "\u6771\u4EAC\u306E\u5929\u6C17", prompt: "\u6771\u4EAC\u306E\u4ECA\u65E5\u306E\u5929\u6C17\u3001\u6C17\u6E29\u3001\u964D\u6C34\u78BA\u7387\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w2", label: "\u5927\u962A\u306E\u5929\u6C17", prompt: "\u5927\u962A\u306E\u4ECA\u65E5\u306E\u5929\u6C17\u3001\u6C17\u6E29\u3001\u964D\u6C34\u78BA\u7387\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w3", label: "\u6771\u4EAC\u306E\u4E00\u9031\u9593\u5929\u6C17\u4E88\u5831", prompt: "\u6771\u4EAC\u306E\u4ECA\u5F8C7\u65E5\u9593\u306E\u5929\u6C17\u4E88\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w4", label: "\u540D\u53E4\u5C4B\u306E\u5929\u6C17", prompt: "\u540D\u53E4\u5C4B\u306E\u4ECA\u65E5\u306E\u5929\u6C17\u3001\u6C17\u6E29\u3001\u964D\u6C34\u78BA\u7387\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w5", label: "\u672D\u5E4C\u306E\u5929\u6C17", prompt: "\u672D\u5E4C\u306E\u4ECA\u65E5\u306E\u5929\u6C17\u3001\u6C17\u6E29\u3001\u964D\u6C34\u78BA\u7387\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w6", label: "\u53F0\u98A8\u30FB\u5927\u96E8\u60C5\u5831", prompt: "\u73FE\u5728\u65E5\u672C\u306B\u63A5\u8FD1\u307E\u305F\u306F\u5F71\u97FF\u3092\u4E0E\u3048\u3066\u3044\u308B\u53F0\u98A8\u30FB\u5927\u96E8\u306E\u6700\u65B0\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w7", label: "花粉症・アレルギー情報", prompt: "\u4ECA\u65E5\u306E\u65E5\u672C\u5404\u5730\u306E\u82B1\u7C89\u6563\u5E03\u30EC\u30D9\u30EB\u3068\u82B1\u7C89\u7B49\u306E\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "w8", label: "\u5C71\u306E\u5929\u6C17\u30FB\u767B\u5C71\u60C5\u5831", prompt: "\u4ECA\u9031\u672B\u306E\u5BCC\u58EB\u5C71\u30FB\u5317\u30A2\u30EB\u30D7\u30B9\u306A\u3069\u4E3B\u8981\u767B\u5C71\u30B9\u30DD\u30C3\u30C8\u306E\u5929\u6C17\u4E88\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "sports", icon: "\uD83C\uDFC5", label: "\u30B9\u30DD\u30FC\u30C4",
    questions: [
      { id: "s1", label: "\u91CE\u7403NPB\u6628\u65E5\u306E\u8A66\u5408\u7D50\u679C", prompt: "\u6628\u65E5\u306E\u30D7\u30ED\u91CE\u7403NPB\u306E\u8A66\u5408\u7D50\u679C\u3068\u6CE8\u76EE\u30D7\u30EC\u30FC\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "s2", label: "J\u30EA\u30FC\u30B0\u306E\u6700\u65B0\u7D50\u679C", prompt: "\u76F4\u8FD1\u306EJ\u30EA\u30FC\u30B0\u306E\u8A66\u5408\u7D50\u679C\u3068\u9806\u4F4D\u8868\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "s3", label: "\u30B5\u30C3\u30AB\u30FC\u65E5\u672C\u4EE3\u8868\u306E\u6700\u65B0\u60C5\u5831", prompt: "\u30B5\u30C3\u30AB\u30FC\u65E5\u672C\u4EE3\u8868\u306E\u76F4\u8FD1\u306E\u8A66\u5408\u7D50\u679C\u3001\u6B21\u306E\u8A66\u5408\u3001\u9078\u624B\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "s4", label: "大リーグの日本人選手活躍", prompt: "\u5927\u30EA\u30FC\u30B0\u3067\u6D3B\u8E4D\u4E2D\u306E\u65E5\u672C\u4EBA\u9078\u624B\u306E\u6700\u65B0\u6210\u7E3E\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "s5", label: "\u30B4\u30EB\u30D5\u6700\u65B0\u30C8\u30FC\u30CA\u30E1\u30F3\u30C8\u7D50\u679C", prompt: "\u6700\u65B0\u306E\u30B4\u30EB\u30D5\u4E16\u754C\u30E9\u30F3\u30AD\u30F3\u30B0\u3068\u76F4\u8FD1\u306E\u30C8\u30FC\u30CA\u30E1\u30F3\u30C8\u7D50\u679C\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "s6", label: "F1\u6700\u65B0\u30EC\u30FC\u30B9\u7D50\u679C", prompt: "\u6700\u65B0\u306EF1\u30EC\u30FC\u30B9\u7D50\u679C\u3068\u30C9\u30E9\u30A4\u30D0\u30FC\u30BA\u30C1\u30E3\u30F3\u30D4\u30AA\u30F3\u30B7\u30C3\u30D7\u9806\u4F4D\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "s7", label: "\u30AA\u30EA\u30F3\u30D4\u30C3\u30AF\u30FB\u56FD\u969B\u5927\u4F1A\u60C5\u5831", prompt: "\u76F4\u8FD1\u306E\u30AA\u30EA\u30F3\u30D4\u30C3\u30AF\u30FB\u56FD\u969B\u5927\u4F1A\u306E\u65E5\u672C\u4EBA\u9078\u624B\u306E\u7D50\u679C\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "s8", label: "\u76F8\u64B2\u6700\u65B0\u30CB\u30E5\u30FC\u30B9", prompt: "\u5927\u76F8\u64B2\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3001\u4ECA\u5834\u6240\u306E\u7D50\u679C\u3001\u6CE8\u76EE\u529B\u58EB\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "entertainment", icon: "\uD83C\uDFAC", label: "\u30A8\u30F3\u30BF\u30E1",
    questions: [
      { id: "e1", label: "\u4ECA\u9031\u306E\u6620\u753B\u30DC\u30C3\u30AF\u30B9\u30AA\u30D5\u30A3\u30B9\u30FB\u30E9\u30F3\u30AD\u30F3\u30B0", prompt: "\u4ECA\u9031\u306E\u65E5\u672C\u306E\u6620\u753B\u30DC\u30C3\u30AF\u30B9\u30AA\u30D5\u30A3\u30B9\u30FB\u30E9\u30F3\u30AD\u30F3\u30B0TOP5\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "e2", label: "\u4ECA\u9031\u4EBA\u6C17\u306ENetflix\u4F5C\u54C1", prompt: "\u73FE\u5728\u65E5\u672C\u306ENetflix\u3067\u4EBA\u6C17\u4E0A\u4F4D\u306E\u4F5C\u54C1TOP5\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "e3", label: "\u6700\u65B0\u306E\u97F3\u697D\u30C1\u30E3\u30FC\u30C8", prompt: "\u73FE\u5728\u306E\u65E5\u672C\u306E\u97F3\u697D\u30C1\u30E3\u30FC\u30C8TOP10\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "e4", label: "今週の注目ゲーム新作", prompt: "\u76F4\u8FD1\u767A\u58F2\u307E\u305F\u306F\u4ECA\u9031\u767A\u58F2\u306E\u6CE8\u76EE\u30B2\u30FC\u30E0\u30BD\u30D5\u30C8\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "e5", label: "今季の期待アニメ作品", prompt: "\u4ECA\u30AF\u30FC\u30EB\u653E\u9001\u4E2D\u306E\u30A2\u30CB\u30E1\u3067\u6700\u3082\u8A71\u984C\u306E\u4F5C\u54C1TOP5\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "e6", label: "今週の話題ドラマ視聴率", prompt: "\u4ECA\u9031\u306E\u65E5\u672C\u306E\u30C6\u30EC\u30D3\u30C9\u30E9\u30DE\u8996\u8074\u7387\u30E9\u30F3\u30AD\u30F3\u30B0\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "e7", label: "YouTube\u6CE8\u76EE\u30C1\u30E3\u30F3\u30CD\u30EB\u30FB\u52D5\u753B", prompt: "\u73FE\u5728\u65E5\u672C\u3067\u30C8\u30EC\u30F3\u30C9\u4E2D\u306EYouTube\u52D5\u753B\u30FB\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "e8", label: "\u6700\u65B0\u306E\u30A8\u30F3\u30BF\u30E1\u30CB\u30E5\u30FC\u30B9", prompt: "\u82B8\u80FD\u4EBA\u30FB\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3084\u8A71\u984C\u306E\u30A8\u30F3\u30BF\u30E1\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "gourmet", icon: "\uD83C\uDF7D\uFE0F", label: "\u30B0\u30EB\u30E1",
    questions: [
      { id: "g1", label: "\u6771\u4EAC\u306E\u4ECA\u6708\u65B0\u30AA\u30FC\u30D7\u30F3\u30EC\u30B9\u30C8\u30E9\u30F3", prompt: "\u6771\u4EAC\u3067\u4ECA\u6708\u65B0\u305F\u306B\u30AA\u30FC\u30D7\u30F3\u3057\u305F\u6CE8\u76EE\u30EC\u30B9\u30C8\u30E9\u30F3\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "g2", label: "\u4ECA\u5E74\u306E\u30DF\u30B7\u30E5\u30E9\u30F3\u65B0\u661F\u7372\u5F97\u5E97", prompt: "\u4ECA\u5E74\u306E\u30DF\u30B7\u30E5\u30E9\u30F3\u30AC\u30A4\u30C9\u3067\u65B0\u305F\u306B\u661F\u3092\u7372\u5F97\u3057\u305F\u65E5\u672C\u306E\u30EC\u30B9\u30C8\u30E9\u30F3\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "g3", label: "\u4ECA\u5E74\u6D41\u884C\u308A\u306E\u30B0\u30EB\u30E1", prompt: "\u4ECA\u5E74\u65E5\u672C\u3067\u6CE8\u76EE\u3055\u308C\u3066\u3044\u308B\u30B0\u30EB\u30E1\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "g4", label: "\u4ECA\u304C\u65EC\u306E\u6771\u4EAC\u30B0\u30EB\u30E1\u30B9\u30DD\u30C3\u30C8", prompt: "\u4ECA\u304C\u65EC\u306E\u6771\u4EAC\u306E\u30B0\u30EB\u30E1\u30B9\u30DD\u30C3\u30C8\u3084\u8A71\u984C\u306E\u304A\u5E97\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "g5", label: "\u4ECA\u5E74\u306E\u98DF\u30D9\u30ED\u30B0\u30C8\u30EC\u30F3\u30C9", prompt: "\u4ECA\u5E74SNS\u3067\u8A71\u984C\u306E\u98DF\u30D9\u30ED\u30B0\u30E1\u30CB\u30E5\u30FC\u3084\u30B0\u30EB\u30E1\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "g6", label: "\u5B63\u7BC0\u306E\u304A\u3059\u3059\u3081\u98DF\u6750", prompt: "\u4ECA\u306E\u5B63\u7BC0\u306B\u6700\u9069\u306A\u97EC\u97F3\u6599\u7406\u98DF\u6750\u3068\u304A\u3059\u3059\u3081\u30EC\u30B7\u30D4\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "g7", label: "\u5168\u56FD\u306E\u30B0\u30EB\u30E1\u60C5\u5831", prompt: "\u65E5\u672C\u5404\u5730\u306E\u540D\u7269\u6599\u7406\u30FB\u30D0\u30A4\u30AD\u30F3\u30B0\u30B9\u30DD\u30C3\u30C8\u3092\u5730\u57DF\u5225\u306B\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "g8", label: "\u30B3\u30F3\u30D3\u30CB\u65B0\u5546\u54C1\u60C5\u5831", prompt: "\u4ECA\u9031\u767A\u58F2\u306E\u30B3\u30F3\u30D3\u30CB\u6CE8\u76EE\u65B0\u5546\u54C1\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "travel", icon: "\u2708\uFE0F", label: "\u65C5\u884C",
    questions: [
      { id: "t1", label: "\u4ECA\u304C\u65EC\u306E\u56FD\u5185\u65C5\u884C\u5148", prompt: "\u4ECA\u304C\u65EC\u306E\u65E5\u672C\u56FD\u5185\u65C5\u884C\u30B9\u30DD\u30C3\u30C8\u3092\u5B63\u7BC0\u3082\u8E0F\u307E\u3048\u3066\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "t2", label: "\u6D77\u5916\u4EBA\u6C17\u65C5\u884C\u5148\u30E9\u30F3\u30AD\u30F3\u30B0", prompt: "\u65E5\u672C\u4EBA\u306B\u4EBA\u6C17\u306E\u6D77\u5916\u65C5\u884C\u5148TOP10\u3092\u73FE\u5728\u306E\u30C8\u30EC\u30F3\u30C9\u3082\u542B\u3081\u3066\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "t3", label: "\u6700\u5B89\u5024\u822A\u7A7A\u30C1\u30B1\u30C3\u30C8\u60C5\u5831", prompt: "\u73FE\u5728\u8CFC\u5165\u3067\u304D\u308B\u65E5\u672C\u767A\u306E\u6D77\u5916\u822A\u7A7A\u30C1\u30B1\u30C3\u30C8\u306E\u6700\u5B89\u5024\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304C\u3055\u3044\u3002" },
      { id: "t4", label: "東京の実際に人気の観光スポット", prompt: "\u6771\u4EAC\u3067\u4ECA\u6700\u3082\u5BE6\u6CC1\u306B\u4EBA\u6C17\u306E\u89B3\u5149\u30B9\u30DD\u30C3\u30C8\u3068\u6240\u8981\u6642\u9593\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "t5", label: "\u30D3\u30B6\u4E0D\u8981\u306E\u65C5\u884C\u5148", prompt: "\u65E5\u672C\u4EBA\u304C\u30D3\u30B6\u306A\u3057\u3067\u884C\u3051\u308B\u4EBA\u6C17\u306E\u6D77\u5916\u65C5\u884C\u5148\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "t6", label: "\u4ECA\u5E74\u306E\u30DB\u30C6\u30EB\u30FB\u5BB3\u60C5\u5831", prompt: "\u4ECA\u5E74\u30AA\u30FC\u30D7\u30F3\u3057\u305F\u6CE8\u76EE\u306E\u30DB\u30C6\u30EB\u30FB\u30EA\u30BE\u30FC\u30C8\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "t7", label: "日本のお祭り・イベント情報", prompt: "\u4ECA\u6708\u958B\u50AC\u306E\u65E5\u672C\u5168\u56FD\u306E\u6CE8\u76EE\u30A4\u30D9\u30F3\u30C8\u30FB\u795D\u308A\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "t8", label: "\u6D77\u5916\u65C5\u884C\u306E\u6CE8\u610F\u60C5\u5831", prompt: "\u73FE\u5728\u65E5\u672C\u306E\u5916\u52D9\u7701\u304C\u767A\u8868\u3057\u3066\u3044\u308B\u6D77\u5916\u5371\u967A\u60C5\u5831\u30EC\u30D9\u30EB3\u4EE5\u4E0A\u306E\u5730\u57DF\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "job", icon: "\uD83D\uDCBC", label: "\u5C31\u8077\u30FB\u8EE2\u8077",
    questions: [
      { id: "j1", label: "今の求人倍率は？", prompt: "\u73FE\u5728\u306E\u65E5\u672C\u306E\u5C31\u8077\u5E02\u5834\u306E\u72B6\u6CC1\u3068\u6C42\u4EBA\u5012\u5411\u5EA6\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "j2", label: "IT\u30A8\u30F3\u30B8\u30CB\u30A2\u306E\u5E73\u5747\u5E74\u5165", prompt: "\u73FE\u5728\u306E\u65E5\u672C\u306EIT\u30A8\u30F3\u30B8\u30CB\u30A2\u306E\u5E73\u5747\u5E74\u5165\u3068\u30B9\u30AD\u30EB\u5225\u306E\u5E74\u5165\u76F8\u5834\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "j3", label: "\u4ECA\u4EBA\u6C17\u306E\u8EE2\u8077\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8", prompt: "\u73FE\u5728\u65E5\u672C\u3067\u8A55\u5224\u306E\u826F\u3044\u8EE2\u8077\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u30FB\u30B5\u30A4\u30C8\u306E\u6BD4\u8F03\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "j4", label: "今求人が多い職種", prompt: "\u73FE\u5728\u65E5\u672C\u3067\u7279\u306B\u6C42\u4EBA\u304C\u591A\u3044\u804C\u7A2E\u30FB\u696D\u7A2E\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "j5", label: "AI時代に求められるスキル", prompt: "AI\u6642\u4EE3\u306B\u6C42\u3081\u3089\u308C\u308B\u30B9\u30AD\u30EB\u30BB\u30C3\u30C8\u3068\u8CC7\u683C\u30FB\u8CC7\u6709\u306E\u30B3\u30B9\u30D1\u5BFE\u5730\u4F4D\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "j6", label: "フリーランスの平均年収", prompt: "\u65E5\u672C\u306E\u30D5\u30EA\u30FC\u30E9\u30F3\u30B9\u30A8\u30F3\u30B8\u30CB\u30A2\u30FB\u30C7\u30B6\u30A4\u30CA\u30FC\u306E\u5E73\u5747\u5E74\u5165\u3068\u5358\u4FA1\u76F8\u5834\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "j7", label: "\u6700\u65B0\u306E\u5B98\u5E81\u30FB\u4F01\u696D\u306E\u6C42\u4EBA\u60C5\u5831", prompt: "\u4ECA\u9031\u516C\u8868\u3055\u308C\u305F\u6CE8\u76EE\u5EA6\u306E\u9AD8\u3044\u6C42\u4EBA\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "j8", label: "\u526F\u696D\u30FB\u8907\u696D\u306E\u59CB\u3081\u65B9", prompt: "\u4ECA\u4EBA\u6C17\u306E\u526F\u696D\u30FB\u8907\u696D\u306E\u4ED5\u4E8B\u3068\u59CB\u3081\u65B9\u306E\u30DD\u30A4\u30F3\u30C8\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "health", icon: "\uD83C\uDFE5", label: "\u5065\u5EB7",
    questions: [
      { id: "h1", label: "\u4ECA\u5E74\u306E\u611F\u67D3\u75C7\u60C5\u5831", prompt: "\u4ECA\u5E74\u65E5\u672C\u3067\u6CE8\u610F\u3059\u3079\u304D\u611F\u67D3\u75C7\u306E\u6700\u65B0\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "h2", label: "\u82B1\u7C89\u75C7\u306E\u6700\u65B0\u6CBB\u7642\u6CD5", prompt: "\u82B1\u7C89\u75C7\u306E\u6700\u65B0\u306E\u6CBB\u7642\u6CD5\u30FB\u878D\u98FE\u90AC\u5BFE\u7B56\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "h3", label: "\u4ECA\u5E74\u306E\u30A4\u30F3\u30D5\u30EB\u30A8\u30F3\u30B6\u60C5\u5831", prompt: "\u4ECA\u5E74\u306E\u65E5\u672C\u306E\u30A4\u30F3\u30D5\u30EB\u30A8\u30F3\u30B6\u306E\u6D41\u884C\u72B6\u6CC1\u3068\u30EF\u30AF\u30C1\u30F3\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "h4", label: "\u6700\u65B0\u306E\u5065\u5EB7\u8A71\u984C\u30C8\u30EC\u30F3\u30C9", prompt: "\u4ECA\u5E74\u65E5\u672C\u3067\u6CE8\u76EE\u3055\u308C\u3066\u3044\u308B\u5065\u5EB7\u30FB\u30C0\u30A4\u30A8\u30C3\u30C8\u306E\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "h5", label: "\u6700\u65B0\u306E\u533B\u7642\u30CB\u30E5\u30FC\u30B9", prompt: "\u6700\u65B0\u306E\u533B\u5B66\u7814\u7A76\u30FB\u65B0\u85AC\u627F\u8A8D\u30FB\u533B\u7642\u6280\u8853\u306E\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "h6", label: "\u30E1\u30F3\u30BF\u30EB\u30D8\u30EB\u30B9\u306E\u6700\u65B0\u60C5\u5831", prompt: "\u30E1\u30F3\u30BF\u30EB\u30D8\u30EB\u30B9\u30FB\u30B3\u30B3\u30ED\u306E\u5065\u5EB7\u306B\u95A2\u3059\u308B\u6700\u65B0\u306E\u7814\u7A76\u30FB\u5BFE\u7B56\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "h7", label: "適度な運動・ウォーキングの効果", prompt: "現在の研究で推奨される適度な運動・ウォーキングの時間と効果を日本語で教えてください。" },
      { id: "h8", label: "今季注目のサプリ", prompt: "\u73FE\u5728\u65E5\u672C\u3067\u6CE8\u76EE\u3055\u308C\u3066\u3044\u308B\u30B5\u30D7\u30EA\u30E1\u30F3\u30C8\u306E\u6700\u65B0\u60C5\u5831\u3068\u5B89\u5168\u6027\u306B\u3064\u3044\u3066\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "science", icon: "\uD83D\uDD2C", label: "\u79D1\u5B66\u30FBTECH",
    questions: [
      { id: "sc1", label: "\u6700\u65B0\u306EAI\u30E2\u30C7\u30EB\u30CB\u30E5\u30FC\u30B9", prompt: "\u6700\u65B0\u306EAI\u30E2\u30C7\u30EB\u30EA\u30EA\u30FC\u30B9\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "sc2", label: "\u5B87\u5B99\u30FB\u5B87\u5B99\u958B\u767A\u30CB\u30E5\u30FC\u30B9", prompt: "\u6700\u65B0\u306E\u5B87\u5B99\u958B\u767A\u30FB\u5B87\u5B99\u63A2\u67FB\u306E\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "sc3", label: "\u518D\u751F\u53EF\u80FD\u30A8\u30CD\u30EB\u30AE\u30FC\u306E\u6700\u65B0\u60C5\u5831", prompt: "\u592A\u967D\u5149\u30FB\u98A8\u529B\u306A\u3069\u518D\u751F\u53EF\u80FD\u30A8\u30CD\u30EB\u30AE\u30FC\u306E\u6700\u65B0\u6280\u8853\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "sc4", label: "\u91CF\u5B50\u30B3\u30F3\u30D4\u30E5\u30FC\u30BF\u306E\u6700\u65B0\u52D5\u5411", prompt: "\u91CF\u5B50\u30B3\u30F3\u30D4\u30E5\u30FC\u30BF\u306E\u6700\u65B0\u306E\u7814\u7A76\u6210\u679C\u3084\u5546\u7528\u5316\u306E\u52D5\u5411\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "sc5", label: "\u6700\u65B0\u306E\u30B5\u30A4\u30D0\u30FC\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u30CB\u30E5\u30FC\u30B9", prompt: "\u6700\u65B0\u306E\u5927\u578B\u30B5\u30A4\u30D0\u30FC\u653B\u6483\u30FB\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "sc6", label: "\u81EA\u52D5\u8ECA\u30FB EV\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9", prompt: "\u81EA\u52D5\u8ECA\u30FB\u96FB\u6C17\u81EA\u52D5\u8ECA(EV)\u306E\u6700\u65B0\u30CB\u30E5\u30FC\u30B9\u3068\u6280\u8853\u52D5\u5411\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "sc7", label: "\u30D0\u30A4\u30AA\u30FB\u533B\u7642\u6280\u8853\u306E\u6700\u65B0\u60C5\u5831", prompt: "\u30D0\u30A4\u30AA\u30C6\u30AF\u30CE\u30ED\u30B8\u30FC\u30FB\u9060\u96494K\u30FB\u518D\u751F\u533B\u7642\u306E\u6700\u65B0\u306E\u7814\u7A76\u6210\u679C\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "sc8", label: "\u30B9\u30DE\u30DB\u65B0\u88FD\u54C1\u30CB\u30E5\u30FC\u30B9", prompt: "\u6700\u65B0\u306E\u30B9\u30DE\u30FC\u30C8\u30D5\u30A9\u30F3\u767A\u8868\u30FB\u30EA\u30EA\u30FC\u30B9\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "study", icon: "\uD83D\uDCDA", label: "\u5B66\u7FD2",
    questions: [
      { id: "st1", label: "\u4ECA\u4EBA\u6C17\u306E\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0\u8A00\u8A9E", prompt: "\u73FE\u5728\u6700\u3082\u9700\u8981\u6027\u306E\u9AD8\u3044\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0\u8A00\u8A9E\u3068\u305D\u306E\u5B66\u7FD2\u30EA\u30BD\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "st2", label: "TOEIC\u5BFE\u7B56\u30FB\u82F1\u8A9E\u5B66\u7FD2\u6CD5", prompt: "\u73FE\u5728\u6700\u3082\u52B9\u679C\u7684\u3068\u3055\u308C\u308BTOEIC\u5BFE\u7B56\u6CD5\u3068\u304A\u3059\u3059\u3081\u30EA\u30BD\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "st3", label: "AI\u30C4\u30FC\u30EB\u306E\u5B66\u7FD2\u6D3B\u7528\u6CD5", prompt: "ChatGPT\u30FBAI\u3092\u5B66\u7FD2\u306B\u6D3B\u7528\u3059\u308B\u5B9F\u8DF5\u7684\u306A\u65B9\u6CD5\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "st4", label: "\u4ECA\u5E74\u306E\u6CE8\u76EE\u8CC7\u683C\u30FB\u691C\u5B9A", prompt: "\u73FE\u5728IT\u696D\u754C\u3067\u7279\u306B\u6CE8\u76EE\u3055\u308C\u3066\u3044\u308B\u8CC7\u683C\u30FB\u691C\u5B9A\u3068\u305D\u306E\u6709\u7528\u6027\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "st5", label: "\u30AA\u30F3\u30E9\u30A4\u30F3\u5B66\u7FD2\u30B5\u30FC\u30D3\u30B9\u6BD4\u8F03", prompt: "\u73FE\u5728\u4EBA\u6C17\u306E\u30AA\u30F3\u30E9\u30A4\u30F3\u5B66\u7FD2\u30B5\u30FC\u30D3\u30B9\uff08Udemy\u30FBPROGRIT\u7B49\uff09\u306E\u7279\u5FB4\u3068\u6599\u91D1\u3092\u65E5\u672C\u8A9E\u3067\u6BD4\u8F03\u3057\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "st6", label: "大学受験・入試情報", prompt: "\u73FE\u5728\u306E\u5927\u5B66\u53D7\u9A13\u5236\u5EA6\u306E\u6700\u65B0\u52D5\u5411\u3068\u5171\u901A\u30C6\u30B9\u30C8\u60C5\u5831\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "st7", label: "\u4ECA\u5E74\u306E\u6559\u80B2\u30CB\u30E5\u30FC\u30B9", prompt: "\u4ECA\u5E74\u65E5\u672C\u306E\u6559\u80B2\u5236\u5EA6\u30FB\u5B66\u6821\u306B\u95A2\u3059\u308B\u6CE8\u76EE\u30CB\u30E5\u30FC\u30B9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "st8", label: "\u8AAD\u66F8\u30FB\u30D3\u30B8\u30CD\u30B9\u66F8\u306E\u30C8\u30EC\u30F3\u30C9", prompt: "\u4ECA\u5E74\u65E5\u672C\u3067\u7279\u306B\u58F2\u308C\u3066\u3044\u308B\u30D3\u30B8\u30CD\u30B9\u66F8\u30FB\u81EA\u5DF1\u554F\u67E5\u306E\u30C8\u30EC\u30F3\u30C9\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
  {
    id: "pet", icon: "\uD83D\uDC3E", label: "\u30DA\u30C3\u30C8",
    questions: [
      { id: "pe1", label: "\u4ECA\u4EBA\u6C17\u306E\u30DA\u30C3\u30C8\u30E9\u30F3\u30AD\u30F3\u30B0", prompt: "\u73FE\u5728\u65E5\u672C\u3067\u6700\u3082\u4EBA\u6C17\u306E\u30DA\u30C3\u30C8\u30E9\u30F3\u30AD\u30F3\u30B0\u3068\u305D\u306E\u7406\u7531\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "pe2", label: "\u30A4\u30CC\u306E\u98DF\u4E8B\u30FB\u5065\u5EB7\u60C5\u5831", prompt: "\u73FE\u5728\u63A8\u5968\u3055\u308C\u3066\u3044\u308B\u30A4\u30CC\u306E\u5065\u5EB7\u7684\u306A\u98DF\u4E8B\u3068\u6CE8\u610F\u3059\u3079\u304D\u98DF\u308C\u7269\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "pe3", label: "\u30CD\u30B3\u306E\u5065\u5EB7\u7BA1\u7406\u306E\u30DD\u30A4\u30F3\u30C8", prompt: "\u30CD\u30B3\u306E\u5065\u5EB7\u7BA1\u7406\u3067\u7279\u306B\u6CE8\u610F\u3059\u3079\u304D\u30DD\u30A4\u30F3\u30C8\u3092\u6700\u65B0\u306E\u7814\u7A76\u3082\u542B\u3081\u3066\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "pe4", label: "\u30DA\u30C3\u30C8\u4FDD\u967A\u306E\u9078\u3073\u65B9", prompt: "\u65E5\u672C\u306E\u4E3B\u8981\u30DA\u30C3\u30C8\u4FDD\u967A\u306E\u6BD4\u8F03\u3068\u9078\u3073\u65B9\u306E\u30DD\u30A4\u30F3\u30C8\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "pe5", label: "ペットの粗相・問題行動の対策", prompt: "犬・猫の粗相やいたずら・問題行動に定評のある対処法を日本語で教えてください。" },
      { id: "pe6", label: "\u305A\u3063\u3068\u4E00\u7DD2\u306B\u3044\u308B\u30DA\u30C3\u30C8\u306E\u9577\u5BFF\u306E\u79D8\u8A23", prompt: "\u6B74\u4EE3\u306E\u9577\u5BFF\u30DA\u30C3\u30C8\u30AB\u30C6\u30B4\u30EA\u3068\u5065\u5EB7\u9577\u5BFF\u306B\u5171\u901A\u3059\u308B\u8981\u56E0\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "pe7", label: "ペット可の賃貸・マンション情報", prompt: "\u73FE\u5728\u65E5\u672C\u306E\u30DA\u30C3\u30C8\u53EF\u306E\u8CDB\u8C37\u30FB\u30DE\u30F3\u30B7\u30E7\u30F3\u306E\u5E73\u5747\u5BB6\u8CDB\u3068\u4EBA\u6C17\u30A8\u30EA\u30A2\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
      { id: "pe8", label: "\u30DA\u30C3\u30C8\u306E\u6700\u65B0\u30C8\u30EC\u30F3\u30C9\u30FB\u30B0\u30C3\u30BA", prompt: "\u4ECA\u5E74\u65E5\u672C\u3067\u8A71\u984C\u306E\u30DA\u30C3\u30C8\u95A2\u9023\u306E\u30C8\u30EC\u30F3\u30C9\u30FB\u65B0\u5546\u54C1\u3092\u65E5\u672C\u8A9E\u3067\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002" },
    ],
  },
]

function renderContent(text: string) {
  const lines = text.split("\n")
  return lines.map((line, li) => {
    const sourceMatch = line.match(/^[-*]\s*(.+?)\|(https?:\/\/[^\s]+)$/)
    if (sourceMatch) {
      const [, name, url] = sourceMatch
      return (
        <span key={li}>
          {"- "}
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA", textDecoration: "underline" }}>{name.trim()}</a>
          {"\n"}
        </span>
      )
    }
    const urlRegex = /(https?:\/\/[^\s\)\]]+)/g
    const parts = line.split(urlRegex)
    const hasUrl = parts.some(p => /(https?:\/\/[^\s\)\]]+)/.test(p))
    return (
      <span key={li}>
        {hasUrl
          ? parts.map((part, i) =>
              /(https?:\/\/[^\s\)\]]+)/.test(part)
                ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA", textDecoration: "underline", wordBreak: "break-all" }}>{part}</a>
                : <span key={i}>{part}</span>
            )
          : line
        }
        {"\n"}
      </span>
    )
  })
}

const ICONS = ["\uD83D\uDCF0","\uD83D\uDCB9","\uD83D\uDED2","\uD83C\uDF24","\uD83C\uDFC5","\uD83C\uDFAC","\uD83C\uDF7D\uFE0F","\u2708\uFE0F","\uD83D\uDCBC","\uD83C\uDFE5","\uD83D\uDD2C","\uD83D\uDCDA","\uD83D\uDC3E","\uD83C\uDF31","\uD83D\uDCBB","\uD83C\uDFAE","\uD83C\uDFC6","\uD83D\uDCCC","\uD83D\uDD14","\u2753"]

export default function Home() {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CATEGORIES
    try {
      const saved = localStorage.getItem("infobot_categories")
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
    } catch { return DEFAULT_CATEGORIES }
  })
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

  useEffect(() => {
    try { localStorage.setItem("infobot_categories", JSON.stringify(categories)) } catch {}
  }, [categories])

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
    } finally { setLoading(false) }
  }

  const addCategory = () => {
    if (!newCatLabel.trim() || categories.length >= 20) return
    const id = `cat_${Date.now()}`
    setCategories(prev => [...prev, { id, icon: newCatIcon, label: newCatLabel.trim(), questions: [] }])
    setNewCatLabel(""); setNewCatIcon("\uD83D\uDCCC"); setShowAddCat(false); setSelectedCatId(id)
  }

  const addQuestion = () => {
    if (!newQLabel.trim() || !newQPrompt.trim() || !selectedCatId) return
    const cat = categories.find(c => c.id === selectedCatId)
    if (!cat || cat.questions.length >= 50) return
    setCategories(prev => prev.map(c => c.id === selectedCatId ? { ...c, questions: [...c.questions, { id: `q_${Date.now()}`, label: newQLabel.trim(), prompt: newQPrompt.trim() }] } : c))
    setNewQLabel(""); setNewQPrompt(""); setShowAddQ(false)
  }

  const deleteCat = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    if (selectedCatId === id) setSelectedCatId(null)
  }

  const deleteQ = (catId: string, qId: string) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, questions: c.questions.filter(q => q.id !== qId) } : c))
  }

  const formatTime = (d: Date) => `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`

  const modalStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }
  const cardStyle: React.CSSProperties = { background: "#1A1D2E", border: "1px solid #2A2D3E", borderRadius: 16, padding: 24, width: 360, display: "flex", flexDirection: "column", gap: 12 }
  const inputStyle: React.CSSProperties = { background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: 8, padding: "9px 12px", color: "#E8EAF0", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }

  return (
    <main style={{ height: "100vh", background: "#0F1117", color: "#E8EAF0", fontFamily: "sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
        <aside style={{ width: 200, background: "#1A1D2E", borderRight: "1px solid #2A2D3E", padding: "14px 10px", flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
            <p style={{ fontSize: 10, color: "#6B7280", margin: 0, fontWeight: 600, letterSpacing: "0.06em" }}>{"\u30AB\u30C6\u30B4\u30EA\u30FC"} ({categories.length}/20)</p>
            {categories.length < 20 && (
              <button onClick={() => setShowAddCat(true)} style={{ background: "rgba(79,142,247,0.15)", border: "1px solid #4F8EF7", borderRadius: 6, color: "#4F8EF7", fontSize: 11, padding: "2px 8px", cursor: "pointer" }}>+ {"\u8FFD\u52A0"}</button>
            )}
          </div>
          {categories.map(cat => (
            <div key={cat.id} style={{ position: "relative", marginBottom: 2 }}>
              <button onClick={() => setSelectedCatId(cat.id)} style={{ width: "100%", padding: "9px 32px 9px 12px", borderRadius: 10, border: "none", background: selectedCatId === cat.id ? "rgba(79,142,247,0.15)" : "transparent", color: selectedCatId === cat.id ? "#4F8EF7" : "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: selectedCatId === cat.id ? 600 : 400, textAlign: "left", borderLeft: selectedCatId === cat.id ? "3px solid #4F8EF7" : "3px solid transparent" }}>
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

        <div style={{ width: 240, borderRight: "1px solid #2A2D3E", background: "#13151F", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
          {!selectedCatId ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <p style={{ fontSize: 12, color: "#374151", textAlign: "center", lineHeight: 1.8 }}>{"\u2190 \u5DE6\u306E\u30AB\u30C6\u30B4\u30EA\u30FC\u3092"}<br />{"\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044"}</p>
            </div>
          ) : (
            <>
              <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #2A2D3E", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#C9D1E0" }}>{selectedCat?.icon} {selectedCat?.label}</p>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>{selectedCat?.questions.length}/50</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6B7280" }}>{"\u8CEA\u554F\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044"}</p>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                {selectedCat?.questions.map(q => (
                  <div key={q.id} style={{ position: "relative", marginBottom: 6 }}>
                    <button onClick={() => handleQuestion(q)} disabled={loading} style={{ width: "100%", padding: "10px 32px 10px 12px", borderRadius: 10, border: "1px solid #2A2D3E", background: loading ? "#0F1117" : "#1A1D2E", color: loading ? "#374151" : "#C9D1E0", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, textAlign: "left", lineHeight: 1.4 }}>{q.label}</button>
                    <button onClick={() => deleteQ(selectedCatId!, q.id)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 12, padding: 2 }}>×</button>
                  </div>
                ))}
                {selectedCat && selectedCat.questions.length === 0 && (
                  <p style={{ fontSize: 12, color: "#374151", textAlign: "center", marginTop: 20 }}>{"\u8CEA\u554F\u304C\u3042\u308A\u307E\u305B\u3093"}</p>
                )}
              </div>
              {selectedCat && selectedCat.questions.length < 50 && (
                <div style={{ padding: "10px", borderTop: "1px solid #2A2D3E", flexShrink: 0 }}>
                  <button onClick={() => setShowAddQ(true)} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "1px dashed #2A2D3E", background: "transparent", color: "#6B7280", cursor: "pointer", fontSize: 12 }}>+ {"\u8CEA\u554F\u3092\u8FFD\u52A0"}</button>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12 }}>
                <div style={{ fontSize: 52 }}>{"\uD83E\uDD16"}</div>
                <h2 style={{ margin: 0, fontSize: 18 }}>InfoBot {"\u3078\u3088\u3046\u3053\u305D"}</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 2 }}>
                  {"\u5DE6\u306E\u30AB\u30C6\u30B4\u30EA\u30FC\u304B\u3089\u9078\u3073\u3001\u771F\u4E2D\u306E\u8CEA\u554F\u30EA\u30B9\u30C8\u304B\u3089\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3060\u3051\u3067OK\u3002"}<br />
                  {"\u30CB\u30E5\u30FC\u30B9\u30FB\u30DE\u30FC\u30B1\u30C3\u30C8\u30FB\u30B9\u30DD\u30FC\u30C4\u30FB\u30A8\u30F3\u30BF\u30E1\u306A\u3069\u3092AI\u304C\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u3067\u53CE\u96C6\u3057\u307E\u3059\u3002"}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10 }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7B5FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{"\uD83E\uDD16"}</div>
                )}
                <div style={{ maxWidth: "74%" }}>
                  <div style={{ padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "linear-gradient(135deg,#4F8EF7,#7B5FFF)" : "#1A1D2E", border: msg.role === "assistant" ? "1px solid #2A2D3E" : "none", fontSize: 14, lineHeight: 1.75, color: "#E8EAF0", whiteSpace: "pre-wrap" }}>
                    {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                  </div>
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

      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </main>
  )
}
