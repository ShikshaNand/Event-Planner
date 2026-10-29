// test-gemini.js
import fs from "node:fs";
import path from "node:path";

// Auto-load .env if it exists without needing external packages
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini2() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_") || GEMINI_API_KEY.includes("यहाँ_अपनी")) {
    console.error("⚠️  GEMINI_API_KEY is not set.");
    console.error("👉 Please add your key to a .env file: GEMINI_API_KEY=AIzaSy...");
    console.error("👉 Or run: $env:GEMINI_API_KEY='your_key'; node test-gemini.js");
    return;
  }

  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY.trim())}`;

  console.log(`🚀 Testing ${model} API...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Create a brief 3-point event plan for a college technical fest with schedule and checklist."
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`\n✅ --- ${model} Response ---\n`);
    console.log(reply);
  } catch (error) {
    console.error("❌ Network / Fetch Error:", error);
  }
}

testGemini2();
