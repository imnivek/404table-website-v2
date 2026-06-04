# 404TABLE 官網 V2

> 風格定位：**Rebellious Ink**（現代藝術拼貼 × Brutalist × 文化科技）
> 截長補短自 `參考設計/stitch_404table_website_redesign` 的 5 套 Stitch 雛型，
> 改用 404TABLE 真實品牌內容、真實素材（Logo / 教室環境照 / 講師照）與繁體中文文案。

## 頁面結構

| 檔案 | 頁面 | 重點內容 |
|------|------|----------|
| `index.html` | 首頁 | Hero + 規模 metric strip、三大服務、Thesis、6 堂課預覽、404 Founders、業師牆、合作企業、二次 CTA |
| `courses.html` | 學程總覽 | 6 堂「職業 × AI 應用」完整課程：課綱（可展開）、工具棧、講師、價格；分類篩選、報名 Modal、30 秒測驗 Modal |
| `space.html` | 實體空間 | 六大區域（真實照片）、三種使用方式（駐點 / 會議室 / 借址）、為何選我們、評價、預約 Modal |
| `founders.html` | 創業孵化 | 404 Founders Cohort：3 個月歷程、提供 vs 不提供、業師團、3 步申請、申請表單 |
| `events.html` | 活動消息 | 本月主場、近期工作坊（軟木板）、內容報告、社群 CTA、活動報名 Modal |
| `about.html` | 關於我們 | 使命、三大服務軸線、五大價值、完整 10 位業師團隊、母公司肆方創育、聯絡 / 企業包班表單 |

## 資料夾

```
官網_V2/
├── index.html / courses.html / space.html / founders.html / events.html / about.html
├── css/style.css          共用樣式（硬陰影、拼貼裝飾、Modal、Toast、進場動效…）
├── js/
│   ├── tw-config.js        Tailwind 設計 token（色彩 / 字體 / 字級 / 間距）
│   └── site.js             共用互動（漢堡選單、滾動進度、淡入、Modal、表單假送出、篩選…）
└── assets/
    ├── brand/              logo-black.png / logo-white.png
    ├── teachers/           10 位講師照（bogi, wayne, wendy, kevin, lily, ryan, dennis, willy, bus, juan）
    └── space/              6 張教室環境照（main, main-2, lounge, meeting, interview, pantry）
```

## 設計系統

- **字體**：標題 Bricolage Grotesque、內文 Noto Sans TC、標籤 JetBrains Mono
- **主色**：深墨綠 `#0B332B`、米白紙色 `#F6F3EB`、暖金黃 `#F2C14E`、珊瑚橘 `#FF6B4A`、湖水藍 `#00BFC2`、炭黑 `#111111`
- **質感**：2px 黑邊 + 硬陰影（hard shadow）、紙感方格底紋、撕紙 / 軟木板 / 拼貼裝飾、灰階照片 hover 上色
- **技術**：純靜態 HTML + Tailwind CDN，無建置步驟、無後端；所有表單為前端假送出（Toast 提示）

## 在本機預覽

直接用瀏覽器開啟 `index.html` 即可。
（若 Tailwind CDN 因離線無法載入，請連網後再開。）

建議用簡易伺服器避免路徑問題：
```bash
# 於 官網_V2 資料夾
python -m http.server 8080
# 開啟 http://localhost:8080
```

## 部署

可直接拖到 **Netlify / Vercel / GitHub Pages**（根目錄設為 `官網_V2`）。
後續可把表單接 Google Form / Tally / Typeform / Make，並加上 GA4 / Meta Pixel。

## 待補（後續真實化）

- 聯絡資訊目前為占位（`基隆路一段 404 號 4 樓`、`02-2345-6789`、`service@404table.com`）→ 換成正式資訊
- 合作企業 logo wall 為文字占位 → 換成實際企業 logo
- 講師一句話資歷為示意文字 → 依實際經歷校正
- 課程開課時間 / 名額倒數 → 接實際開課排程
