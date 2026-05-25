// app/api/analytics/nlp/route.ts
// Next.js App Router — POST /api/analytics/nlp
// Pipeline: xWeather API → Tokenizing → Stemming → NLP (Summarization + Sentiment)

import { NextRequest, NextResponse } from "next/server"
// import { tokenizeWeather, type WeatherRaw } from "@/lib/nlp/tokenizing"
import { tokenizeWeather, type WeatherRaw } from "@/lib/nlp/tokenizing"
import { stemWeather, getAdviceList, getConceptsBySentiment, type StemmedWeather } from "@/lib/nlp/stemming"

// ─── Konfigurasi xWeather ────────────────────────────────────────────────────

const XWEATHER_BASE = "https://data.api.xweather.com"
const CLIENT_ID     = process.env.XWEATHER_CLIENT_ID ?? process.env.NEXT_PUBLIC_XWEATHER_CLIENT_ID     ?? ""
const CLIENT_SECRET = process.env.XWEATHER_CLIENT_SECRET ?? process.env.NEXT_PUBLIC_XWEATHER_CLIENT_SECRET ?? ""

// ─── Tipe request body ───────────────────────────────────────────────────────

interface NlpRequestBody {
  location: string
  action?: string
}

// ─── Tipe response API ini ───────────────────────────────────────────────────

interface NlpResponse {
  success: boolean
  location: string
  pipeline: {
    step1_raw: WeatherRaw
    step2_tokens: string[]
    step3_stemmed: {
      concepts: StemmedWeather["concepts"]
      overallSentiment: StemmedWeather["overallSentiment"]
      overallScore: number
    }
    step4_nlp: NlpOutput
  }
  error?: string
}

interface NlpOutput {
  summary: string
  sentiment: {
    label: StemmedWeather["overallSentiment"]
    score: number
    tone: string
    breakdown: {
      positif: number
      netral: number
      waspada: number
      berbahaya: number
    }
  }
  advice: string[]
  highlights: {
    warnings: string[]
    positives: string[]
  }
}

// ─── Step 1: Fetch data dari xWeather API ───────────────────────────────────
// FIXED: conditions/summary memakai format berbeda dari forecasts API.
// - Lokasi sebagai path segment, bukan query param ?p=
// - Response ada di ob (observation), bukan periods[]
// - Fallback ke forecasts/closest jika conditions/summary gagal

async function fetchWeatherData(location: string): Promise<WeatherRaw> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("XWEATHER_CLIENT_ID dan XWEATHER_CLIENT_SECRET belum diset di environment variables.")
  }

  const auth = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`

  // ── Percobaan 1: conditions/summary/{location} ──────────────────────────
  // Format lokasi: "-6.2,106.8" atau "jakarta,id"
  try {
    const encodedLoc = encodeURIComponent(location)
    const fields = [
      "tempC","tempF","feelslikeC","feelslikeF",
      "humidity","weatherPrimary",
      "windSpeedKPH","windSpeedMPH","windDir","windDirDEG","windGustKPH",
      "uvi","visibilityKM","pop","precipMM","sky","place",
    ].join(",")

    const url = `${XWEATHER_BASE}/conditions/summary/${encodedLoc}?${auth}&fields=${fields}`
    console.log("[NLP API] Fetching conditions/summary:", url.replace(CLIENT_SECRET, "***"))

    const res  = await fetch(url, { next: { revalidate: 300 } })
    const json = await res.json()

    console.log("[NLP API] conditions/summary response:", JSON.stringify(json).substring(0, 300))

    if (json.success) {
      // conditions/summary response shape: response[0].ob (current observation)
      const ob    = json.response?.[0]?.ob
      const place = json.response?.[0]?.place

      if (ob && ob.tempC !== undefined) {
        console.log("[NLP API] Got data from conditions/summary ob")
        return { ...ob, place }
      }

      // Beberapa endpoint mengembalikan periods[] bukan ob
      const period = json.response?.[0]?.periods?.[0]
      if (period && period.tempC !== undefined) {
        console.log("[NLP API] Got data from conditions/summary periods[0]")
        return { ...period, place }
      }
    }

    console.log("[NLP API] conditions/summary tidak ada data, fallback ke observations")
  } catch (e) {
    console.log("[NLP API] conditions/summary error, fallback:", e)
  }

  // ── Percobaan 2: observations/closest (kondisi terkini dari stasiun terdekat) ──
  try {
    const encodedLoc = encodeURIComponent(location)
    const fields = [
      "tempC","tempF","feelslikeC","feelslikeF",
      "humidity","weatherPrimary",
      "windSpeedKPH","windSpeedMPH","windDir","windDirDEG","windGustKPH",
      "uvi","visibilityKM","precipMM","sky","place",
    ].join(",")

    const url = `${XWEATHER_BASE}/observations/closest?p=${encodedLoc}&limit=1&${auth}&fields=${fields}`
    console.log("[NLP API] Fetching observations/closest:", url.replace(CLIENT_SECRET, "***"))

    const res  = await fetch(url, { next: { revalidate: 300 } })
    const json = await res.json()

    console.log("[NLP API] observations/closest response:", JSON.stringify(json).substring(0, 300))

    if (json.success) {
      const ob    = json.response?.[0]?.ob
      const place = json.response?.[0]?.place

      if (ob && ob.tempC !== undefined) {
        console.log("[NLP API] Got data from observations/closest")
        return { ...ob, place }
      }
    }

    console.log("[NLP API] observations/closest tidak ada data, fallback ke forecasts")
  } catch (e) {
    console.log("[NLP API] observations/closest error, fallback:", e)
  }

  // ── Percobaan 3: forecasts/{location} — ambil period hari ini ───────────
  // Ini endpoint yang sama dengan fetchDaily di page.tsx, pasti jalan
  try {
    const encodedLoc = encodeURIComponent(location)
    const url = `${XWEATHER_BASE}/forecasts/${encodedLoc}?filter=day&limit=1&fields=periods.dateTimeISO,periods.maxTempC,periods.minTempC,periods.tempC,periods.feelslikeC,periods.humidity,periods.weatherPrimary,periods.windSpeedKPH,periods.windSpeedMPH,periods.windDir,periods.windDirDEG,periods.windGustKPH,periods.uvi,periods.visibilityKM,periods.pop,periods.precipMM,periods.sky&${auth}`
    console.log("[NLP API] Fetching forecasts fallback:", url.replace(CLIENT_SECRET, "***"))

    const res  = await fetch(url, { next: { revalidate: 300 } })
    const json = await res.json()

    console.log("[NLP API] forecasts response:", JSON.stringify(json).substring(0, 300))

    if (json.success) {
      const period = json.response?.[0]?.periods?.[0]
      const place  = json.response?.[0]?.place

      if (period) {
        // forecasts pakai maxTempC/minTempC — normalise ke tempC untuk NLP
        const normalized: WeatherRaw = {
          tempC:         period.maxTempC   ?? period.minTempC ?? 0,
          tempF:         period.maxTempF   ?? 0,
          feelslikeC:    period.feelslikeC ?? period.maxTempC ?? 0,
          feelslikeF:    period.feelslikeF ?? 0,
          humidity:      period.humidity   ?? 0,
          weatherPrimary: period.weatherPrimary ?? "",
          windSpeedKPH:  period.windSpeedMaxKPH ?? period.windSpeedKPH ?? 0,
          windSpeedMPH:  period.windSpeedMaxMPH ?? period.windSpeedMPH ?? 0,
          windDir:       period.windDir    ?? "N",
          windDirDEG:    period.windDirDEG ?? 0,
          windGustKPH:   period.windGustKPH ?? 0,
          uvi:           period.uvi        ?? undefined,
          visibilityKM:  period.visibilityKM ?? undefined,
          pop:           period.pop        ?? undefined,
          precipMM:      period.precipMM   ?? undefined,
          sky:           period.sky        ?? undefined,
          place,
        }
        console.log("[NLP API] Got data from forecasts fallback")
        return normalized
      }
    }
  } catch (e) {
    console.log("[NLP API] forecasts fallback error:", e)
  }

  throw new Error("Tidak dapat mengambil data cuaca dari semua endpoint xWeather. Cek CLIENT_ID/SECRET dan lokasi.")
}

// ─── Step 4a: Text Summarization ─────────────────────────────────────────────

function buildSummary(stemmed: StemmedWeather, raw: WeatherRaw): string {
  const loc = stemmed.location
    .split(", ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ")

  const tempConcept = stemmed.concepts.find((c) =>
    ["sangat_dingin","dingin","sejuk","hangat","panas","sangat_panas"].includes(c.concept))
  const humConcept  = stemmed.concepts.find((c) =>
    c.concept.includes("kering") || c.concept.includes("lembap") || c.concept === "normal")
  const windConcept = stemmed.concepts.find((c) =>
    ["tenang","sepoi_sepoi","angin_ringan","angin_sedang","angin_kencang","badai"].includes(c.concept))
  const wxConcept   = stemmed.concepts.find((c) => c.concept.startsWith("kondisi_"))
  const rainConcept = stemmed.concepts.find((c) =>
    c.concept.includes("hujan") || c.concept === "tidak_hujan")
  const uvConcept   = stemmed.concepts.find((c) => c.concept.startsWith("uv_"))
  const visConcept  = stemmed.concepts.find((c) => c.concept.startsWith("jarak_pandang"))

  const opening = wxConcept
    ? `Kondisi cuaca di **${loc}** saat ini ${wxConcept.humanLabel.toLowerCase()} dengan suhu **${raw.tempC.toFixed(1)}°C**`
    : `Kondisi cuaca di **${loc}** saat ini bersuhu **${raw.tempC.toFixed(1)}°C**`

  const humSentence  = humConcept
    ? ` Kelembapan udara ${humConcept.humanLabel.toLowerCase()} (${raw.humidity}%),`
    : ""
  const windSentence = windConcept
    ? ` dengan angin ${windConcept.humanLabel.toLowerCase()} berhembus dari arah **${raw.windDir}** berkecepatan ${raw.windSpeedKPH.toFixed(1)} km/jam.`
    : "."
  const rainSentence = rainConcept && rainConcept.concept !== "tidak_hujan"
    ? ` ${rainConcept.humanLabel}.`
    : " Tidak ada hujan terdeteksi."
  const uvSentence   = uvConcept
    ? ` Indeks UV ${uvConcept.humanLabel.toLowerCase()}${raw.uvi !== undefined ? ` (${raw.uvi})` : ""}.`
    : ""
  const visSentence  = visConcept
    ? ` ${visConcept.humanLabel}${raw.visibilityKM !== undefined ? ` (${raw.visibilityKM} km)` : ""}.`
    : ""

  const closingMap: Record<StemmedWeather["overallSentiment"], string> = {
    baik:      " Secara keseluruhan, kondisi hari ini **aman dan nyaman** untuk beraktivitas di luar ruangan.",
    cukup:     " Kondisi cukup baik, namun tetap perhatikan perubahan cuaca.",
    waspada:   " **Harap waspada** — ada beberapa kondisi yang memerlukan perhatian ekstra.",
    berbahaya: " ⚠️ **Kondisi berbahaya.** Disarankan untuk membatasi aktivitas di luar ruangan.",
  }

  // suppress unused warning
  void tempConcept

  return [opening, humSentence, windSentence, rainSentence, uvSentence, visSentence, closingMap[stemmed.overallSentiment]]
    .join("")
    .replace(/\s{2,}/g, " ")
    .trim()
}

// ─── Step 4b: Sentiment / Tone Analysis ─────────────────────────────────────

function analyzeSentiment(stemmed: StemmedWeather): NlpOutput["sentiment"] {
  const total = stemmed.concepts.length || 1

  const breakdown = {
    positif:   stemmed.concepts.filter((c) => c.sentiment === "positif").length,
    netral:    stemmed.concepts.filter((c) => c.sentiment === "netral").length,
    waspada:   stemmed.concepts.filter((c) => c.sentiment === "waspada").length,
    berbahaya: stemmed.concepts.filter((c) => c.sentiment === "berbahaya").length,
  }

  const toneMap: Record<StemmedWeather["overallSentiment"], string> = {
    baik:      "Positif — cuaca mendukung aktivitas normal",
    cukup:     "Netral — kondisi dapat diterima dengan sedikit catatan",
    waspada:   "Waspada — beberapa parameter cuaca memerlukan perhatian",
    berbahaya: "Negatif — kondisi ekstrem, aktivitas outdoor tidak disarankan",
  }

  return {
    label:     stemmed.overallSentiment,
    score:     stemmed.overallScore,
    tone:      toneMap[stemmed.overallSentiment],
    breakdown: {
      positif:   Math.round((breakdown.positif   / total) * 100),
      netral:    Math.round((breakdown.netral    / total) * 100),
      waspada:   Math.round((breakdown.waspada   / total) * 100),
      berbahaya: Math.round((breakdown.berbahaya / total) * 100),
    },
  }
}

// ─── Step 4c: Highlights ─────────────────────────────────────────────────────

function buildHighlights(stemmed: StemmedWeather): NlpOutput["highlights"] {
  const warnings  = getConceptsBySentiment(stemmed, "waspada")
    .concat(getConceptsBySentiment(stemmed, "berbahaya"))
    .map((c) => c.humanLabel)
  const positives = getConceptsBySentiment(stemmed, "positif")
    .map((c) => c.humanLabel)
  return { warnings, positives }
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<NlpResponse>> {
  try {
    const body: NlpRequestBody = await req.json()

    if (!body.location) {
      return NextResponse.json(
        { success: false, location: "", pipeline: {} as NlpResponse["pipeline"], error: "Parameter 'location' wajib diisi." },
        { status: 400 }
      )
    }

    // Step 1
    const raw = await fetchWeatherData(body.location)

    // Step 2
    const tokens     = tokenizeWeather(raw)
    const textTokens = tokens.map((t) => t.textToken)

    // Step 3
    const stemmed = stemWeather(tokens)

    // Step 4
    const summary    = buildSummary(stemmed, raw)
    const sentiment  = analyzeSentiment(stemmed)
    const advice     = getAdviceList(stemmed)
    const highlights = buildHighlights(stemmed)

    return NextResponse.json({
      success:  true,
      location: stemmed.location,
      pipeline: {
        step1_raw:     raw,
        step2_tokens:  textTokens,
        step3_stemmed: {
          concepts:         stemmed.concepts,
          overallSentiment: stemmed.overallSentiment,
          overallScore:     stemmed.overallScore,
        },
        step4_nlp: { summary, sentiment, advice, highlights },
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak dikenal."
    console.error("[NLP API]", message)
    return NextResponse.json(
      { success: false, location: "", pipeline: {} as NlpResponse["pipeline"], error: message },
      { status: 500 }
    )
  }
}

// ─── GET: health check ───────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    endpoint: "POST /api/analytics/nlp",
    requiredBody: { location: "string (koordinat 'lat,lng' atau nama kota)" },
    envRequired:  ["XWEATHER_CLIENT_ID / NEXT_PUBLIC_XWEATHER_CLIENT_ID", "XWEATHER_CLIENT_SECRET / NEXT_PUBLIC_XWEATHER_CLIENT_SECRET"],
  })
}