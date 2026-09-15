import { useState } from "react";
import { Film, Copy, Check, Loader2, ChevronDown } from "lucide-react";

// --- Demo data: this is what your "ide konten → prompt video" LLM call
// should return. Swap this out for the real API response. ---
const DEMO_SHOTS = [
  {
    subjek: "wanita usia 20-an, rambut dikuncir, kaos olahraga warna krem",
    aksi: "menuangkan air ke gelas kaca di dapur, gerakan tenang dan sengaja",
    setting: "dapur minimalis dengan jendela besar, pagi hari",
    gerakan_kamera: "static dengan sedikit push-in perlahan",
    gaya_visual: "sinematik minimalis, vertikal TikTok-style",
    pencahayaan: "natural light pagi, soft, dari jendela sebelah kiri frame",
    durasi_pacing: "4 detik, calm dan deliberate",
    catatan_tambahan: "palet warna warm neutral, fokus pada tekstur kaca dan kayu",
  },
  {
    subjek: "wanita yang sama, duduk di meja dapur",
    aksi: "membuka jurnal dan mulai menulis, gerakan pelan",
    setting: "meja dapur dekat jendela, pagi hari",
    gerakan_kamera: "tracking shot pelan dari samping",
    gaya_visual: "sinematik minimalis, vertikal TikTok-style",
    pencahayaan: "natural light pagi, konsisten dengan shot sebelumnya",
    durasi_pacing: "3 detik, calm",
    catatan_tambahan: "jaga kontinuitas warna dan mood dengan shot 1",
  },
];

const FIELD_LABELS = {
  subjek: "Subjek",
  aksi: "Aksi",
  setting: "Setting",
  gerakan_kamera: "Gerakan Kamera",
  gaya_visual: "Gaya Visual",
  pencahayaan: "Pencahayaan",
  durasi_pacing: "Durasi & Pacing",
  catatan_tambahan: "Catatan Tambahan",
};

function buildFinalPrompt(shot) {
  return [
    shot.subjek,
    shot.aksi + ".",
    shot.setting + ".",
    "Kamera " + shot.gerakan_kamera + ".",
    "Gaya " + shot.gaya_visual + ".",
    "Pencahayaan " + shot.pencahayaan + ".",
    "Durasi " + shot.durasi_pacing + ".",
    shot.catatan_tambahan + ".",
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function ShotCard({ index, shot, onChange, expanded, onToggle }) {
  const [copied, setCopied] = useState(false);
  const finalPrompt = buildFinalPrompt(shot);

  const handleCopy = () => {
    navigator.clipboard?.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        background: "#1F2023",
        border: "1px solid #2E2F33",
        borderRadius: 4,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "#C9A227",
              letterSpacing: 1,
            }}
          >
            SHOT {String(index + 1).padStart(2, "0")}
          </span>
          <span
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: 17,
              color: "#EDEDED",
            }}
          >
            {shot.subjek.split(",")[0]}
          </span>
        </div>
        <ChevronDown
          size={16}
          color="#8B8D93"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {expanded && (
        <div style={{ padding: "0 18px 18px 18px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              rowGap: 10,
              columnGap: 14,
              marginBottom: 16,
            }}
          >
            {Object.keys(FIELD_LABELS).map((key) => (
              <FieldRow
                key={key}
                label={FIELD_LABELS[key]}
                value={shot[key]}
                onChange={(v) => onChange({ ...shot, [key]: v })}
              />
            ))}
          </div>

          <div
            style={{
              background: "#16171A",
              border: "1px solid #2E2F33",
              borderRadius: 3,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: "#8B8D93",
                  letterSpacing: 1,
                }}
              >
                PROMPT AKHIR
              </span>
              <button
                onClick={handleCopy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "transparent",
                  border: "none",
                  color: copied ? "#7FB37A" : "#8B8D93",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: "pointer",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Disalin" : "Salin"}
              </button>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "#C7C8CC",
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            >
              {finalPrompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, value, onChange }) {
  return (
    <>
      <label
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "#8B8D93",
          paddingTop: 8,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={value.length > 60 ? 2 : 1}
        style={{
          width: "100%",
          background: "#16171A",
          border: "1px solid #2E2F33",
          borderRadius: 3,
          padding: "7px 10px",
          color: "#EDEDED",
          fontSize: 13.5,
          fontFamily: "inherit",
          resize: "vertical",
          lineHeight: 1.45,
        }}
        onFocus={(e) => (e.target.style.borderColor = "#C9A227")}
        onBlur={(e) => (e.target.style.borderColor = "#2E2F33")}
      />
    </>
  );
}

export default function VideoPromptReview() {
  const [shots, setShots] = useState(DEMO_SHOTS);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | generating | done

  const handleShotChange = (index, updated) => {
    const next = [...shots];
    next[index] = updated;
    setShots(next);
  };

  const handleGenerate = () => {
    setStatus("generating");
    setTimeout(() => setStatus("done"), 1800); // placeholder for real API call
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#16171A",
        padding: "32px 20px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <Film size={18} color="#C9A227" />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#8B8D93",
              letterSpacing: 1.5,
            }}
          >
            REVIEW SEBELUM GENERATE
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 26,
            color: "#EDEDED",
            margin: "0 0 6px 0",
            fontWeight: 500,
          }}
        >
          Rutinitas pagi produktif
        </h1>
        <p
          style={{
            color: "#8B8D93",
            fontSize: 13.5,
            margin: "0 0 24px 0",
            lineHeight: 1.6,
          }}
        >
          {shots.length} shot disiapkan dari idemu. Buka tiap shot untuk edit
          detailnya sebelum dikirim ke model video.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shots.map((shot, i) => (
            <ShotCard
              key={i}
              index={i}
              shot={shot}
              expanded={expandedIndex === i}
              onToggle={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
              onChange={(updated) => handleShotChange(i, updated)}
            />
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={status === "generating"}
          style={{
            width: "100%",
            marginTop: 22,
            padding: "13px 0",
            background: status === "done" ? "#3A4A3D" : "#C9A227",
            color: status === "done" ? "#9ECB99" : "#16171A",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
            cursor: status === "generating" ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "inherit",
          }}
        >
          {status === "generating" && (
            <Loader2 size={15} className="animate-spin" />
          )}
          {status === "idle" && `Generate ${shots.length} Video`}
          {status === "generating" && "Mengirim ke model video..."}
          {status === "done" && "Terkirim — cek status di bawah"}
        </button>
      </div>
    </div>
  );
}
