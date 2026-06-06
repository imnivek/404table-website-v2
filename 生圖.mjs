/**
 * 使用說明
 * 1. 先在 PowerShell 設定 API key：
 *    $env:OPENAI_API_KEY="sk-..."
 * 2. 生成全部視覺圖：
 *    node .\生圖.mjs
 * 3. 只生成某個編號前綴的圖，例如職場線：
 *    node .\生圖.mjs W-
 * 4. 本腳本會讀取同資料夾的「視覺設計_文生圖指令包.md」，解析第 3-7 節的編號 prompt，
 *    並依第 8 節小抄輸出到 assets/kv、assets/work、assets/kids、assets/icons。
 *
 * 需求：Node 24 內建 fetch，不需要也不要安裝任何 npm 套件。
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = "https://api.openai.com/v1/images/generations";
const MODEL = "gpt-image-1";
const SOURCE_FILE = path.join(__dirname, "視覺設計_文生圖指令包.md");
const SLEEP_MS = 1500;

const STYLE_PREFIX = `整體風格：Rebellious Ink × 文化科技（叛逆墨水 × 現代藝術拼貼），像有態度的獨立雜誌或美術館海報，粗獷但高級，手作感但不廉價。
配色只使用：米色紙底 #F6F3EB、暖米 #EFE3D1、深森林綠 #0B332B、琥珀金 #F2C14E、珊瑚橘 #FF6B4A、科技青 #00BFC2、墨黑 #111111。
視覺語言：粗黑外框 2-4px、硬邊右下偏移陰影、紙張顆粒、半色調/Risograph 印刷感、手繪馬克筆底線、塗鴉箭頭與圓圈、輕微拼貼傾斜、大量留白、大膽構圖。
人物攝影：紀實自然光、略去飽和、真實人物與真實場景，不要棚拍模特兒感。
一律不要文字、不要 logo、不要浮水印。`;

const OUTPUT_SPECS = {
  "KV-BRAND": { folder: "assets/kv", filename: "kv-brand.jpg", ratio: "16:9" },
  "W-HERO": { folder: "assets/work", filename: "work-hero.jpg", ratio: "16:9" },
  "W-01": { folder: "assets/work", filename: "work-01-marketing.jpg", ratio: "4:5" },
  "W-02": { folder: "assets/work", filename: "work-02-sales.jpg", ratio: "4:5" },
  "W-03": { folder: "assets/work", filename: "work-03-hr.jpg", ratio: "4:5" },
  "W-04": { folder: "assets/work", filename: "work-04-teaching-design.jpg", ratio: "4:5" },
  "W-05": { folder: "assets/work", filename: "work-05-design-workflow.jpg", ratio: "4:5" },
  "W-06": { folder: "assets/work", filename: "work-06-solo-business.jpg", ratio: "4:5" },
  "W-VOICES": { folder: "assets/work", filename: "voices.jpg", ratio: "16:9" },
  "K-HERO": { folder: "assets/kids", filename: "kids-hero.jpg", ratio: "16:9" },
  "K-01": { folder: "assets/kids", filename: "kids-01-elementary.jpg", ratio: "4:5" },
  "K-02": { folder: "assets/kids", filename: "kids-02-junior-high.jpg", ratio: "4:5" },
  "K-03": { folder: "assets/kids", filename: "kids-03-senior-high.jpg", ratio: "4:5" },
  "K-PARENT": { folder: "assets/kids", filename: "kids-parent.jpg", ratio: "4:3" },
  "ICON-SET": { folder: "assets/icons", filename: "icon-set.png", ratio: "1:1" },
  "BANNER-TEMPLATE": { folder: "assets/kv", filename: "banner-template.jpg", ratio: "16:5" },
};

const JOB_DEFINITIONS = [
  { id: "KV-BRAND", section: 3, kind: "fenced" },
  { id: "W-HERO", section: 4, kind: "fenced" },
  { id: "W-01", section: 4, kind: "inline", commonTail: "work" },
  { id: "W-02", section: 4, kind: "inline", commonTail: "work" },
  { id: "W-03", section: 4, kind: "inline", commonTail: "work" },
  { id: "W-04", section: 4, kind: "inline", commonTail: "work" },
  { id: "W-05", section: 4, kind: "inline", commonTail: "work" },
  { id: "W-06", section: 4, kind: "inline", commonTail: "work" },
  { id: "W-VOICES", section: 4, kind: "fenced" },
  { id: "K-HERO", section: 5, kind: "fenced" },
  { id: "K-01", section: 5, kind: "inline", commonTail: "kids" },
  { id: "K-02", section: 5, kind: "inline", commonTail: "kids" },
  { id: "K-03", section: 5, kind: "inline", commonTail: "kids" },
  { id: "K-PARENT", section: 5, kind: "fenced" },
  { id: "ICON-SET", section: 6, kind: "fenced" },
  { id: "BANNER-TEMPLATE", section: 7, kind: "fenced" },
];

const SIZE_BY_RATIO = {
  "16:9": "1536x1024",
  "4:5": "1024x1536",
  "直幅": "1024x1536",
  "4:3": "1536x1024",
  "1:1": "1024x1024",
  // gpt-image-1 不支援原生 16:5，先用 1536x1024 生成，之後需手動裁切成橫幅。
  "16:5": "1536x1024",
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSection(markdown, sectionNumber) {
  const headerPattern = new RegExp(`^##\\s+${sectionNumber}\\.\\s+.*$`, "m");
  const headerMatch = markdown.match(headerPattern);

  if (!headerMatch || headerMatch.index === undefined) {
    throw new Error(`找不到第 ${sectionNumber} 節。`);
  }

  const sectionStart = headerMatch.index + headerMatch[0].length;
  const remaining = markdown.slice(sectionStart);
  const nextSectionIndex = remaining.search(/^##\s+\d+\.\s+/m);

  return nextSectionIndex === -1 ? remaining : remaining.slice(0, nextSectionIndex);
}

function extractStyleTail(markdown) {
  const section = getSection(markdown, 1);
  const match = section.match(/\*\*【風格尾巴】\*\*[\s\S]*?`([^`]+)`/u);

  if (!match) {
    throw new Error("找不到第 1 節的風格尾巴。");
  }

  return cleanPrompt(match[1]);
}

function extractCommonTail(section) {
  const match = section.match(/共同尾巴(?:（[^）]*）)?[:：]\s*`([^`]+)`/u);

  if (!match) {
    throw new Error("找不到共同尾巴。");
  }

  return cleanPrompt(match[1]);
}

function extractFencedPrompt(section, id) {
  const marker = `\`${id}\``;
  const markerIndex = section.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`找不到 ${id}。`);
  }

  const afterMarker = section.slice(markerIndex + marker.length);
  const fenceStart = afterMarker.indexOf("```");

  if (fenceStart === -1) {
    throw new Error(`找不到 ${id} 的 fenced prompt。`);
  }

  const contentStart = fenceStart + 3;
  const fenceEnd = afterMarker.indexOf("```", contentStart);

  if (fenceEnd === -1) {
    throw new Error(`找不到 ${id} prompt 的結尾。`);
  }

  return cleanPrompt(afterMarker.slice(contentStart, fenceEnd));
}

function extractInlinePrompt(section, id) {
  const pattern = new RegExp(`^-\\s+\\*\\*\`${escapeRegExp(id)}(?:\\s+[^\`]*)?\`\\*\\*\\s*[:：]\\s*(.+)$`, "mu");
  const match = section.match(pattern);

  if (!match) {
    throw new Error(`找不到 ${id} 的清單 prompt。`);
  }

  return cleanPrompt(match[1]);
}

function cleanPrompt(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/^\s*\n/, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function resolvePromptTail(prompt, styleTail) {
  const usesStyleTail = prompt.includes("【風格尾巴】");
  const cleanText = prompt.replace(/[—-]?【風格尾巴】/gu, "").trim();

  return {
    prompt: cleanText,
    tail: usesStyleTail ? styleTail : "",
  };
}

function sizeForRatio(ratio) {
  const size = SIZE_BY_RATIO[ratio];

  if (!size) {
    throw new Error(`未定義比例 ${ratio} 對應的 gpt-image-1 尺寸。`);
  }

  return size;
}

function outputFormatFor(filename) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") {
    return "jpeg";
  }

  if (ext === ".png") {
    return "png";
  }

  return undefined;
}

function buildJobs(markdown) {
  const sections = {
    3: getSection(markdown, 3),
    4: getSection(markdown, 4),
    5: getSection(markdown, 5),
    6: getSection(markdown, 6),
    7: getSection(markdown, 7),
  };
  const styleTail = extractStyleTail(markdown);
  const commonTails = {
    work: extractCommonTail(sections[4]),
    kids: extractCommonTail(sections[5]),
  };

  return JOB_DEFINITIONS.map((definition) => {
    const spec = OUTPUT_SPECS[definition.id];

    if (!spec) {
      throw new Error(`缺少 ${definition.id} 的輸出規格。`);
    }

    const rawPrompt =
      definition.kind === "fenced"
        ? extractFencedPrompt(sections[definition.section], definition.id)
        : extractInlinePrompt(sections[definition.section], definition.id);
    const resolved = resolvePromptTail(rawPrompt, styleTail);
    const tailParts = [resolved.tail, definition.commonTail ? commonTails[definition.commonTail] : ""].filter(Boolean);
    const prompt = [STYLE_PREFIX, resolved.prompt, ...tailParts].filter(Boolean).join("\n\n");

    return {
      id: definition.id,
      ...spec,
      size: sizeForRatio(spec.ratio),
      outputFormat: outputFormatFor(spec.filename),
      outputPath: path.join(__dirname, spec.folder, spec.filename),
      prompt,
    };
  });
}

function displayPath(filePath) {
  return path.relative(__dirname, filePath).split(path.sep).join("/");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureOutputFolders() {
  const folders = new Set(Object.values(OUTPUT_SPECS).map((spec) => spec.folder));

  await Promise.all(
    [...folders].map((folder) => fs.mkdir(path.join(__dirname, folder), { recursive: true })),
  );
}

function filterJobs(jobs, filters) {
  if (filters.length === 0) {
    return jobs;
  }

  const normalizedFilters = filters.map((filter) => filter.toUpperCase());

  return jobs.filter((job) =>
    normalizedFilters.some((filter) => job.id.toUpperCase().startsWith(filter)),
  );
}

function requireApiKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (apiKey) {
    return apiKey;
  }

  console.error("找不到 OPENAI_API_KEY，無法呼叫 OpenAI 圖像 API。");
  console.error("請先到 https://platform.openai.com 申請 API key。");
  console.error('PowerShell 設定方式：$env:OPENAI_API_KEY="sk-..."');
  process.exit(1);
}

async function generateImage(job, apiKey) {
  const body = {
    model: MODEL,
    prompt: job.prompt,
    size: job.size,
    n: 1,
    quality: "high",
  };

  if (job.outputFormat) {
    body.output_format = job.outputFormat;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let payload;

  try {
    payload = JSON.parse(responseText);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error?.message || responseText || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const base64Image = payload?.data?.[0]?.b64_json;

  if (!base64Image) {
    throw new Error("API 回傳中沒有 data[0].b64_json。");
  }

  await fs.writeFile(job.outputPath, Buffer.from(base64Image, "base64"));
}

async function main() {
  const apiKey = requireApiKey();
  const markdown = await fs.readFile(SOURCE_FILE, "utf8");
  const jobs = buildJobs(markdown);
  const filters = process.argv.slice(2).map((value) => value.trim()).filter(Boolean);
  const selectedJobs = filterJobs(jobs, filters);

  if (selectedJobs.length === 0) {
    console.log(`沒有符合條件的 job：${filters.join(", ")}`);
    return;
  }

  await ensureOutputFolders();

  console.log(`準備生成 ${selectedJobs.length} 張圖。`);

  for (let index = 0; index < selectedJobs.length; index += 1) {
    const job = selectedJobs[index];
    const current = index + 1;
    const total = selectedJobs.length;
    const targetPath = displayPath(job.outputPath);

    console.log(`[${current}/${total}] ${job.id} -> ${targetPath}`);

    try {
      await generateImage(job, apiKey);
      console.log(`已存檔：${targetPath}`);
    } catch (error) {
      console.error(`生成失敗：${job.id}`);
      console.error(error instanceof Error ? error.message : String(error));
    }

    if (index < selectedJobs.length - 1) {
      await sleep(SLEEP_MS);
    }
  }
}

main().catch((error) => {
  console.error("腳本執行失敗。");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
