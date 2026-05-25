// lib/nlp/stemming.ts
// Pemetaan token cuaca ke konsep yang dinormalisasi — siap dipakai text summarization & sentiment

import type { WeatherToken } from "./tokenizing"

// ─── Tipe output stemming ────────────────────────────────────────────────────

export interface StemmedConcept {
  concept: string           // konsep ternormalisasi (misal: "panas_sedang")
  sentiment: "positif" | "netral" | "waspada" | "berbahaya"
  weight: number            // bobot kontribusi ke skor keseluruhan (0–1)
  humanLabel: string        // label bahasa Indonesia untuk narasi
  advice: string            // saran singkat terkait kondisi ini
}

export interface StemmedWeather {
  concepts: StemmedConcept[]
  overallSentiment: "baik" | "cukup" | "waspada" | "berbahaya"
  overallScore: number      // 0 (berbahaya) – 100 (sempurna)
  location: string
}

// ─── Map: textToken → StemmedConcept ────────────────────────────────────────
// Setiap token dari tokenizing.ts dipetakan ke konsep yang lebih ringkas.

const TOKEN_CONCEPT_MAP: Record<string, Omit<StemmedConcept, "concept">> = {
  // Suhu
  sangat_dingin:  { sentiment: "waspada",   weight: 0.9, humanLabel: "Sangat dingin",  advice: "Kenakan pakaian hangat berlapis, hindari paparan angin." },
  dingin:         { sentiment: "netral",    weight: 0.7, humanLabel: "Dingin",          advice: "Gunakan jaket tipis atau sweater." },
  sejuk:          { sentiment: "positif",   weight: 1.0, humanLabel: "Sejuk",           advice: "Cuaca nyaman untuk aktivitas luar ruangan." },
  hangat:         { sentiment: "positif",   weight: 1.0, humanLabel: "Hangat",          advice: "Cuaca nyaman, tetap jaga hidrasi." },
  panas:          { sentiment: "waspada",   weight: 0.6, humanLabel: "Panas",           advice: "Minum air yang cukup, hindari paparan matahari langsung saat siang." },
  sangat_panas:   { sentiment: "berbahaya", weight: 0.2, humanLabel: "Sangat panas",    advice: "Hindari aktivitas luar ruangan intensif, risiko heat stroke tinggi." },

  // Kelembapan
  sangat_kering:  { sentiment: "waspada",  weight: 0.5, humanLabel: "Udara sangat kering", advice: "Perbanyak minum air, gunakan pelembap kulit." },
  kering:         { sentiment: "waspada",  weight: 0.7, humanLabel: "Udara kering",         advice: "Jaga hidrasi tubuh." },
  normal:         { sentiment: "positif",  weight: 1.0, humanLabel: "Kelembapan normal",    advice: "Kondisi udara nyaman." },
  lembap:         { sentiment: "netral",   weight: 0.8, humanLabel: "Udara lembap",         advice: "Pakaian mungkin terasa sedikit lengket." },
  sangat_lembap:  { sentiment: "waspada",  weight: 0.5, humanLabel: "Udara sangat lembap",  advice: "Waspada jamur dan dehidrasi tersembunyi." },

  // Angin
  tenang:         { sentiment: "positif",  weight: 1.0, humanLabel: "Angin tenang",     advice: "Tidak ada gangguan angin." },
  sepoi_sepoi:    { sentiment: "positif",  weight: 1.0, humanLabel: "Angin sepoi-sepoi", advice: "Angin ringan, terasa segar." },
  angin_ringan:   { sentiment: "positif",  weight: 0.9, humanLabel: "Angin ringan",      advice: "Nyaman untuk aktivitas outdoor." },
  angin_sedang:   { sentiment: "netral",   weight: 0.7, humanLabel: "Angin sedang",      advice: "Perhatikan benda ringan di luar ruangan." },
  angin_kencang:  { sentiment: "waspada",  weight: 0.4, humanLabel: "Angin kencang",     advice: "Hindari aktivitas di tempat terbuka, waspada pohon tumbang." },
  badai:          { sentiment: "berbahaya",weight: 0.1, humanLabel: "Badai",             advice: "Tetap di dalam ruangan, ikuti peringatan cuaca setempat." },

  // Kondisi cuaca (weather primary)
  "kondisi_sunny":           { sentiment: "positif",  weight: 1.0, humanLabel: "Cerah",              advice: "Hari yang cerah, cocok untuk aktivitas outdoor." },
  "kondisi_mostly_sunny":    { sentiment: "positif",  weight: 1.0, humanLabel: "Cerah berawan",       advice: "Sebagian besar cerah, nyaman untuk beraktivitas." },
  "kondisi_partly_cloudy":   { sentiment: "positif",  weight: 0.9, humanLabel: "Berawan sebagian",    advice: "Cuaca bervariasi, bawa jaket ringan." },
  "kondisi_mostly_cloudy":   { sentiment: "netral",   weight: 0.8, humanLabel: "Banyak awan",         advice: "Pencahayaan redup, aktivitas outdoor tetap aman." },
  "kondisi_cloudy":          { sentiment: "netral",   weight: 0.7, humanLabel: "Mendung",             advice: "Bawa payung sebagai antisipasi." },
  "kondisi_overcast":        { sentiment: "netral",   weight: 0.6, humanLabel: "Langit tertutup awan",advice: "Bawa payung, kemungkinan hujan meningkat." },
  "kondisi_rain":            { sentiment: "waspada",  weight: 0.4, humanLabel: "Hujan",               advice: "Bawa payung, waspadai genangan dan jalanan licin." },
  "kondisi_heavy_rain":      { sentiment: "berbahaya",weight: 0.2, humanLabel: "Hujan lebat",         advice: "Hindari bepergian jika tidak mendesak, waspada banjir." },
  "kondisi_thunderstorm":    { sentiment: "berbahaya",weight: 0.1, humanLabel: "Badai petir",         advice: "Tetap di dalam ruangan, hindari pohon tinggi dan bangunan terbuka." },
  "kondisi_snow":            { sentiment: "waspada",  weight: 0.4, humanLabel: "Bersalju",            advice: "Gunakan pakaian hangat, hati-hati jalanan licin." },
  "kondisi_fog":             { sentiment: "waspada",  weight: 0.5, humanLabel: "Berkabut",            advice: "Kurangi kecepatan berkendara, nyalakan lampu kendaraan." },
  "kondisi_haze":            { sentiment: "waspada",  weight: 0.5, humanLabel: "Berkabut tipis",      advice: "Perhatikan kualitas udara, gunakan masker jika perlu." },
  "kondisi_clear":           { sentiment: "positif",  weight: 1.0, humanLabel: "Cerah",              advice: "Kondisi ideal untuk segala aktivitas outdoor." },
  "kondisi_drizzle":         { sentiment: "netral",   weight: 0.6, humanLabel: "Gerimis",             advice: "Bawa payung kecil atau jas hujan tipis." },

  // UV
  uv_rendah:           { sentiment: "positif",  weight: 1.0, humanLabel: "UV rendah",        advice: "Aman tanpa tabir surya untuk paparan singkat." },
  uv_sedang:           { sentiment: "netral",   weight: 0.8, humanLabel: "UV sedang",         advice: "Gunakan tabir surya SPF 30+ jika beraktivitas > 30 menit." },
  uv_tinggi:           { sentiment: "waspada",  weight: 0.5, humanLabel: "UV tinggi",         advice: "Wajib tabir surya SPF 50+, pakai topi dan kacamata hitam." },
  uv_sangat_tinggi:    { sentiment: "waspada",  weight: 0.3, humanLabel: "UV sangat tinggi",  advice: "Hindari paparan langsung antara pukul 10.00–16.00." },
  uv_ekstrem:          { sentiment: "berbahaya",weight: 0.1, humanLabel: "UV ekstrem",        advice: "Paparan matahari berbahaya, tetap di dalam ruangan." },

  // Visibilitas
  jarak_pandang_baik:   { sentiment: "positif", weight: 1.0, humanLabel: "Jarak pandang baik",   advice: "Kondisi berkendara aman." },
  jarak_pandang_sedang: { sentiment: "netral",  weight: 0.6, humanLabel: "Jarak pandang sedang", advice: "Berhati-hati saat berkendara, kurangi kecepatan." },
  jarak_pandang_buruk:  { sentiment: "waspada", weight: 0.3, humanLabel: "Jarak pandang buruk",  advice: "Hindari berkendara, nyalakan lampu kendaraan." },

  // Hujan
  tidak_hujan:          { sentiment: "positif", weight: 1.0, humanLabel: "Tidak hujan",         advice: "Aman beraktivitas di luar ruangan." },
  curah_hujan_nol:      { sentiment: "positif", weight: 1.0, humanLabel: "Tidak ada curah hujan",advice: "Tidak ada hujan terdeteksi." },
}

// ─── Stemmer untuk label suhu (berdasarkan nilai numerik) ────────────────────

function stemTemperatureTokens(tokens: WeatherToken[]): StemmedConcept[] {
  return tokens
    .filter((t) => t.category === "temperature" && t.key === "temp_label")
    .map((t) => {
      const map = TOKEN_CONCEPT_MAP[t.textToken]
      if (!map) return null
      return { concept: t.textToken, ...map }
    })
    .filter(Boolean) as StemmedConcept[]
}

// ─── Stemmer umum: lookup TOKEN_CONCEPT_MAP ──────────────────────────────────

function stemByMap(tokens: WeatherToken[], keyFilter: string): StemmedConcept[] {
  return tokens
    .filter((t) => t.key === keyFilter)
    .map((t) => {
      const map = TOKEN_CONCEPT_MAP[t.textToken]
      if (!map) return null
      return { concept: t.textToken, ...map }
    })
    .filter(Boolean) as StemmedConcept[]
}

// ─── Stemmer kondisi cuaca utama ─────────────────────────────────────────────

function stemWeatherCondition(tokens: WeatherToken[]): StemmedConcept[] {
  return tokens
    .filter((t) => t.key === "weather_primary")
    .map((t) => {
      const map = TOKEN_CONCEPT_MAP[t.textToken]
      // Fallback: kondisi tidak dikenal → netral
      if (!map) {
        return {
          concept: t.textToken,
          sentiment: "netral" as const,
          weight: 0.7,
          humanLabel: t.rawValue as string,
          advice: "Perhatikan perkembangan cuaca setempat.",
        }
      }
      return { concept: t.textToken, ...map }
    })
}

// ─── Stemmer peluang hujan ───────────────────────────────────────────────────

function stemPrecipitation(tokens: WeatherToken[]): StemmedConcept[] {
  const popToken = tokens.find((t) => t.key === "pop_pct")
  if (!popToken) return []

  const pop = Number(popToken.rawValue)
  let concept: string, sentiment: StemmedConcept["sentiment"], advice: string, humanLabel: string

  if (pop === 0) {
    concept = "tidak_hujan"; sentiment = "positif"
    humanLabel = "Tidak ada peluang hujan"; advice = "Tidak perlu membawa payung."
  } else if (pop <= 20) {
    concept = "peluang_hujan_kecil"; sentiment = "netral"
    humanLabel = `Peluang hujan kecil (${pop}%)`; advice = "Opsional membawa payung."
  } else if (pop <= 50) {
    concept = "peluang_hujan_sedang"; sentiment = "netral"
    humanLabel = `Peluang hujan sedang (${pop}%)`; advice = "Disarankan membawa payung."
  } else if (pop <= 80) {
    concept = "kemungkinan_hujan"; sentiment = "waspada"
    humanLabel = `Kemungkinan hujan (${pop}%)`; advice = "Bawa payung, persiapkan jas hujan."
  } else {
    concept = "hampir_pasti_hujan"; sentiment = "waspada"
    humanLabel = `Hampir pasti hujan (${pop}%)`; advice = "Siapkan perlengkapan hujan lengkap."
  }

  return [{ concept, sentiment, weight: 1 - pop / 100, humanLabel, advice }]
}

// ─── Hitung skor & sentimen keseluruhan ─────────────────────────────────────

function calcOverall(concepts: StemmedConcept[]): Pick<StemmedWeather, "overallSentiment" | "overallScore"> {
  if (concepts.length === 0) return { overallSentiment: "baik", overallScore: 100 }

  const avgWeight = concepts.reduce((s, c) => s + c.weight, 0) / concepts.length
  const score = Math.round(avgWeight * 100)

  const hasBerbahaya = concepts.some((c) => c.sentiment === "berbahaya")
  const waspada      = concepts.filter((c) => c.sentiment === "waspada").length
  const total        = concepts.length

  let overallSentiment: StemmedWeather["overallSentiment"]
  if (hasBerbahaya) overallSentiment = "berbahaya"
  else if (waspada / total >= 0.5) overallSentiment = "waspada"
  else if (score >= 75) overallSentiment = "baik"
  else overallSentiment = "cukup"

  return { overallSentiment, overallScore: score }
}

// ─── MAIN STEMMER ────────────────────────────────────────────────────────────

/**
 * Terima array WeatherToken dari tokenizeWeather(), kembalikan StemmedWeather
 * yang berisi konsep ternormalisasi, sentimen, skor, dan saran per kondisi.
 */
export function stemWeather(tokens: WeatherToken[]): StemmedWeather {
  const concepts: StemmedConcept[] = [
    ...stemTemperatureTokens(tokens),
    ...stemByMap(tokens, "humidity_label"),
    ...stemByMap(tokens, "wind_label"),
    ...stemWeatherCondition(tokens),
    ...stemByMap(tokens, "uv_label"),
    ...stemByMap(tokens, "visibility_label"),
    ...stemPrecipitation(tokens),
  ]

  const locationToken = tokens.find((t) => t.category === "location")
  const location = locationToken
    ? (locationToken.rawValue as string).replace(/_/g, ", ")
    : "tidak diketahui"

  return {
    concepts,
    location,
    ...calcOverall(concepts),
  }
}

/**
 * Utiliti: kembalikan hanya daftar saran unik dari semua konsep.
 */
export function getAdviceList(stemmed: StemmedWeather): string[] {
  return [...new Set(stemmed.concepts.map((c) => c.advice))]
}

/**
 * Utiliti: kembalikan konsep yang memiliki sentimen tertentu.
 */
export function getConceptsBySentiment(
  stemmed: StemmedWeather,
  sentiment: StemmedConcept["sentiment"]
): StemmedConcept[] {
  return stemmed.concepts.filter((c) => c.sentiment === sentiment)
}