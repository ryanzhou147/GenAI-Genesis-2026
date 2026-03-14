"use client";

import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:8000";

const C = {
  bg:      "#C5DCF0",
  bgDark:  "#A2C4E0",
  bgDeep:  "#7AAFD4",
  border:  "#1A3A5E",
  text:    "#0D1E30",
  muted:   "#4A6E94",
  gold:    "#1B6FAD",
  goldBrt: "#4AAEE0",
  red:     "#7A2020",
  green:   "#2A5A1A",
  page:    "#081525",
};

const FONT = "'Press Start 2P', monospace";

const panelStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.bg,
  border: `4px solid ${C.border}`,
  boxShadow: `5px 5px 0 ${C.border}`,
  overflow: "hidden",
  ...extra,
});

const hdrStyle = (bg = C.bgDark): React.CSSProperties => ({
  background: bg,
  borderBottom: `4px solid ${C.border}`,
  padding: "8px 14px",
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
});

const btnStyle = (variant: "primary" | "secondary" | "danger" = "primary"): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: "8px",
  padding: "10px 16px",
  border: `3px solid ${C.border}`,
  boxShadow: `3px 3px 0 ${C.border}`,
  cursor: "pointer",
  lineHeight: 1,
  background: variant === "primary" ? C.gold : variant === "danger" ? C.red + "44" : C.bgDeep,
  color: variant === "primary" ? C.bg : variant === "danger" ? C.red : C.muted,
});

const inputStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "8px",
  width: "100%",
  background: C.bgDark,
  border: `3px solid ${C.border}`,
  padding: "9px 10px",
  color: C.text,
  outline: "none",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type TimelineStage = {
  month: number;
  label: string;
  image_b64?: string;
  image_url?: string;
};

type PatientResult = {
  analysis: {
    severity: string;
    issues: string[];
    cavities_detected: boolean;
    cavity_notes: string;
    estimated_months: number;
    suitable_for_braces: boolean;
    notes: string;
  };
  timeline: TimelineStage[];
  summary: string;
};

type Patient = {
  id: string;
  name: string;
  age: number;
  chief_complaint: string;
  imageUrl: string;
  result: PatientResult | null;
  status: "idle" | "loading" | "done" | "error";
  summaryStatus: "idle" | "loading" | "done" | "error";
  error?: string;
};

// ─── Mock patient seed data ───────────────────────────────────────────────────

const MOCK_PATIENTS: Patient[] = [
  {
    id: "mock-anna",
    name: "Anna Chen",
    age: 24,
    chief_complaint: "crowding and teeth misalignment",
    imageUrl: "/Zoom_out_anna.png",
    status: "done",
    summaryStatus: "idle",
    result: {
      analysis: {
        severity: "moderate",
        issues: ["crowding on lower arch", "visible cavity on upper central incisor", "moderate overbite", "slight spacing irregularity on upper laterals"],
        cavities_detected: true,
        cavity_notes: "Dark lesion visible on upper central incisor — restorative care recommended prior to orthodontic treatment.",
        estimated_months: 24,
        suitable_for_braces: true,
        notes: "Patient presents with moderate crowding and a single visible cavity. Cavity treatment should precede brace placement.",
      },
      timeline: [
        { month: 0,  label: "Current Teeth",     image_url: "/teeth_current.png" },
        { month: 3,  label: "Braces Applied",     image_url: "/demo_month3.png" },
        { month: 9,  label: "Early Movement",     image_url: "/demo_month9.png" },
        { month: 15, label: "Almost There",       image_url: "/demo_month15.png" },
        { month: 24, label: "Treatment Complete", image_url: "/demo_month24.png" },
      ],
      summary: "",
    },
  },
  {
    id: "mock-max",
    name: "Max Rivera",
    age: 31,
    chief_complaint: "severe crowding, tooth pain, and multiple cavities",
    imageUrl: "/Zoom_out_max.png",
    status: "done",
    summaryStatus: "idle",
    result: {
      analysis: {
        severity: "severe",
        issues: ["severe crowding on lower arch", "multiple dark cavities on upper and lower teeth", "significant overbite", "visible tooth decay on lower molars"],
        cavities_detected: true,
        cavity_notes: "Multiple dark lesions on upper central incisors and lower molars. Immediate restorative treatment required before any orthodontic work.",
        estimated_months: 30,
        suitable_for_braces: true,
        notes: "Patient requires urgent cavity treatment across multiple teeth before orthodontic intervention can begin.",
      },
      timeline: [
        { month: 0,  label: "Current Teeth",     image_url: "/teeth_current.png" },
        { month: 3,  label: "Braces Applied",     image_url: "/demo_month3.png" },
        { month: 9,  label: "Early Movement",     image_url: "/demo_month9.png" },
        { month: 15, label: "Almost There",       image_url: "/demo_month15.png" },
        { month: 30, label: "Treatment Complete", image_url: "/demo_month24.png" },
      ],
      summary: "",
    },
  },
  {
    id: "mock-sarah",
    name: "Sarah Malik",
    age: 19,
    chief_complaint: "crowding and visible cavities",
    imageUrl: "/Zoom_out_sarah.png",
    status: "done",
    summaryStatus: "idle",
    result: {
      analysis: {
        severity: "moderate",
        issues: ["crowding on lower arch", "cavity on upper right incisor", "moderate overbite", "lower tooth rotation visible"],
        cavities_detected: true,
        cavity_notes: "Cavity visible on upper right incisor — filling recommended before brace placement.",
        estimated_months: 24,
        suitable_for_braces: true,
        notes: "Patient is a good candidate for orthodontic treatment once cavities are addressed.",
      },
      timeline: [
        { month: 0,  label: "Current Teeth",     image_url: "/teeth_current.png" },
        { month: 3,  label: "Braces Applied",     image_url: "/demo_month3.png" },
        { month: 9,  label: "Early Movement",     image_url: "/demo_month9.png" },
        { month: 15, label: "Almost There",       image_url: "/demo_month15.png" },
        { month: 24, label: "Treatment Complete", image_url: "/demo_month24.png" },
      ],
      summary: "",
    },
  },
];

const LS_KEY = "doctor_patients_v2";

function loadPatients(): Patient[] {
  if (typeof window === "undefined") return MOCK_PATIENTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return MOCK_PATIENTS;
    const stored: Patient[] = JSON.parse(raw);
    // ensure all three mock patients are present
    const mockIds = MOCK_PATIENTS.map(p => p.id);
    const missingMocks = MOCK_PATIENTS.filter(m => !stored.find(s => s.id === m.id));
    return [...missingMocks, ...stored.filter(p => !mockIds.includes(p.id) || stored.findIndex(s => s.id === p.id) >= 0)];
  } catch {
    return MOCK_PATIENTS;
  }
}

function savePatients(patients: Patient[]) {
  if (typeof window === "undefined") return;
  // Don't persist blob URLs from the browser session (they won't survive reload)
  const toSave = patients.map(p => ({
    ...p,
    // Reset live-session blob URLs to empty so they don't break on reload
    imageUrl: p.id.startsWith("mock-") ? p.imageUrl : "",
    result: p.result ? {
      ...p.result,
      summary: p.result.summary, // keep summary
      timeline: p.result.timeline.map(s => ({
        ...s,
        image_b64: p.id.startsWith("mock-") ? undefined : s.image_b64, // drop base64 for user patients to save space
      })),
    } : null,
    summaryStatus: p.summaryStatus === "loading" ? "idle" as const : p.summaryStatus,
    status: p.status === "loading" ? "idle" as const : p.status,
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(toSave));
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DoctorPage() {
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [sliderIdx, setSliderIdx]     = useState(0);

  // Add-patient form
  const [form, setForm]             = useState({ name: "", age: "", complaint: "" });
  const [formFile, setFormFile]     = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState("");
  const [formError, setFormError]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setPatients(loadPatients());
  }, []);

  // Persist to localStorage whenever patients change
  useEffect(() => {
    if (patients.length > 0) savePatients(patients);
  }, [patients]);

  const selected = patients.find(p => p.id === selectedId) ?? null;

  // ── Auto-generate summary when a patient is selected ──────────────────────
  useEffect(() => {
    if (!selected) return;
    if (selected.status !== "done") return;
    if (!selected.result) return;
    if (selected.summaryStatus !== "idle") return;

    // Mark as loading
    setPatients(ps => ps.map(p => p.id === selected.id ? { ...p, summaryStatus: "loading" } : p));

    // Call doctor summary API
    const data = {
      patient_profile: {
        name: selected.name,
        age: selected.age,
        chief_complaint: selected.chief_complaint,
      },
      vision_intake: selected.result.analysis,
      treatment_simulation: {
        timeline: selected.result.timeline.map(s => ({ month: s.month, label: s.label })),
        estimated_months: selected.result.analysis.estimated_months,
      },
    };

    fetch(`${API_BASE}/agents/doctor-summary/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(r => r.ok ? r.json() : r.json().then(b => { throw new Error(b.detail ?? `HTTP ${r.status}`); }))
      .then(res => {
        setPatients(ps => ps.map(p =>
          p.id === selected.id
            ? { ...p, summaryStatus: "done", result: p.result ? { ...p.result, summary: res.summary ?? "" } : p.result }
            : p
        ));
      })
      .catch(() => {
        setPatients(ps => ps.map(p =>
          p.id === selected.id ? { ...p, summaryStatus: "error" } : p
        ));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ── Select patient ─────────────────────────────────────────────────────────
  const selectPatient = (id: string) => {
    setSelectedId(id);
    setSliderIdx(0);
  };

  // ── Add patient form ───────────────────────────────────────────────────────
  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFormFile(f);
    setFormPreview(URL.createObjectURL(f));
  };

  const submitPatient = async () => {
    if (!form.name.trim() || !form.age || !form.complaint.trim() || !formFile) {
      setFormError("All fields + photo required.");
      return;
    }
    const id = Date.now().toString();
    const newPatient: Patient = {
      id,
      name: form.name.trim(),
      age: parseInt(form.age),
      chief_complaint: form.complaint.trim(),
      imageUrl: formPreview,
      result: null,
      status: "loading",
      summaryStatus: "idle",
    };
    setPatients(ps => [...ps, newPatient]);
    selectPatient(id);
    setShowAdd(false);
    setForm({ name: "", age: "", complaint: "" });
    setFormFile(null);
    setFormPreview("");
    setFormError("");

    try {
      const fd = new FormData();
      fd.append("name", newPatient.name);
      fd.append("age", String(newPatient.age));
      fd.append("chief_complaint", newPatient.chief_complaint);
      fd.append("image", formFile);

      const res = await fetch(`${API_BASE}/orchestrator/patient-analyze`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(b.detail ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPatients(ps => ps.map(p =>
        p.id === id ? {
          ...p,
          status: "done",
          summaryStatus: "done",
          result: {
            analysis: data.analysis,
            timeline: data.timeline,
            summary: data.summary ?? "",
          },
        } : p
      ));
    } catch (err) {
      setPatients(ps => ps.map(p =>
        p.id === id
          ? { ...p, status: "error", error: err instanceof Error ? err.message : String(err) }
          : p
      ));
    }
  };

  // ── Summary renderer ───────────────────────────────────────────────────────
  const renderSummary = (text: string) =>
    text.split("\n").map((line, i) => {
      const t = line.trim();
      if (!t) return <div key={i} style={{ height: "10px" }} />;
      if (t === "DOCTOR SUMMARY PAGE") return (
        <p key={i} style={{ fontSize: "11px", color: C.text, marginBottom: "14px", letterSpacing: "2px", borderBottom: `3px solid ${C.border}`, paddingBottom: "8px" }}>{t}</p>
      );
      if (/^[A-Z][A-Za-z /]+$/.test(t) && t.length > 3 && !t.startsWith("-")) return (
        <p key={i} style={{ fontSize: "8px", color: C.gold, marginBottom: "6px", marginTop: "4px", letterSpacing: "2px" }}>{t}</p>
      );
      if (t.startsWith("-")) return (
        <p key={i} style={{ fontSize: "7px", color: C.text, lineHeight: "2.4", marginBottom: "3px", paddingLeft: "10px" }}>{t}</p>
      );
      return <p key={i} style={{ fontSize: "7px", color: C.text, lineHeight: "2.4", marginBottom: "3px" }}>{line}</p>;
    });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <main style={{ background: C.page, minHeight: "100vh", fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        * { box-sizing: border-box; }
        .px-btn { transition: transform 60ms, box-shadow 60ms; }
        .px-btn:hover:not(:disabled) { transform: translate(3px,3px); box-shadow: none !important; }
        .px-btn:disabled { opacity:.35; cursor:not-allowed !important; }
        input:focus, textarea:focus { border-color: ${C.goldBrt} !important; outline: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { display: inline-block; animation: spin .8s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bgDark}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; }
        input[type=range] { -webkit-appearance:none; appearance:none; height:8px; background:${C.bgDeep}; border:3px solid ${C.border}; outline:none; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; background:${C.gold}; border:3px solid ${C.border}; cursor:pointer; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: C.bgDark, borderBottom: `4px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <span style={{ fontSize: 22 }}>🩺</span>
        <span style={{ fontSize: "10px", color: C.text }}>DOCTOR DASHBOARD</span>
        <span style={{ fontSize: "7px", color: C.muted, marginLeft: 8 }}>◆ ORCHESTRATING AGENT ◆</span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <div style={{ width: "240px", flexShrink: 0, background: C.bgDeep, borderRight: `4px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `3px solid ${C.border}`, flexShrink: 0 }}>
            <p style={{ fontSize: "8px", color: C.text, letterSpacing: "2px" }}>PATIENTS</p>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {patients.length === 0 && (
              <p style={{ fontSize: "7px", color: C.muted, textAlign: "center", marginTop: "20px", lineHeight: "2.4" }}>
                NO PATIENTS YET.
              </p>
            )}
            {patients.map(p => (
              <div
                key={p.id}
                onClick={() => selectPatient(p.id)}
                className="px-btn"
                style={{
                  background: selectedId === p.id ? C.bg : C.bgDark,
                  border: `3px solid ${selectedId === p.id ? C.gold : C.border}`,
                  boxShadow: selectedId === p.id ? `3px 3px 0 ${C.gold}` : "none",
                  padding: "10px 12px",
                  marginBottom: "8px",
                  cursor: "pointer",
                }}
              >
                <p style={{ fontSize: "8px", color: C.text, marginBottom: "5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </p>
                <p style={{ fontSize: "6px", color: C.muted, marginBottom: "4px" }}>AGE {p.age}</p>
                {p.status === "loading"    && <p style={{ fontSize: "6px", color: C.goldBrt }}>◆ ANALYZING...</p>}
                {p.status === "done" && p.summaryStatus === "loading" && <p style={{ fontSize: "6px", color: C.goldBrt }}>◆ GENERATING NOTE...</p>}
                {p.status === "done" && p.summaryStatus === "done"    && <p style={{ fontSize: "6px", color: C.green }}>✔ READY</p>}
                {p.status === "done" && p.summaryStatus === "idle"    && <p style={{ fontSize: "6px", color: C.muted }}>— PENDING</p>}
                {p.status === "error"      && <p style={{ fontSize: "6px", color: C.red }}>✖ ERROR</p>}
              </div>
            ))}
          </div>

          <div style={{ padding: "12px", borderTop: `3px solid ${C.border}`, flexShrink: 0 }}>
            <button
              className="px-btn"
              style={{ ...btnStyle("primary"), width: "100%", textAlign: "center" }}
              onClick={() => setShowAdd(true)}
            >
              + ADD PATIENT
            </button>
          </div>
        </div>

        {/* ── Main area ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>

          {!selected && (
            <div style={{ ...panelStyle({ borderStyle: "dashed" }), maxWidth: 600, margin: "60px auto" }}>
              <div style={{ padding: "50px 30px", textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🩺</div>
                <p style={{ fontSize: "9px", color: C.muted, lineHeight: "2.8" }}>
                  SELECT A PATIENT FROM THE LEFT<br />OR ADD A NEW ONE TO BEGIN
                </p>
              </div>
            </div>
          )}

          {selected?.status === "loading" && (
            <div style={{ ...panelStyle(), maxWidth: 700, margin: "0 auto" }}>
              <div style={hdrStyle()}>
                <span className="spin" style={{ fontSize: "14px", color: C.goldBrt }}>⟳</span>
                <span style={{ fontSize: "9px", color: C.text }}>ANALYZING PATIENT...</span>
              </div>
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <p style={{ fontSize: "8px", color: C.muted, lineHeight: "2.8" }}>
                  RUNNING TREATMENT ANALYSIS...<br />
                  GENERATING HABIT COACHING...<br />
                  CHECKING INSURANCE COVERAGE...<br />
                  SYNTHESIZING CLINICAL SUMMARY...
                </p>
              </div>
            </div>
          )}

          {selected?.status === "error" && (
            <div style={{ ...panelStyle({ borderColor: C.red }), maxWidth: 700, margin: "0 auto" }}>
              <div style={{ ...hdrStyle(C.red + "33"), borderBottomColor: C.red }}>
                <span style={{ fontSize: "10px", color: C.red }}>✖ ANALYSIS FAILED</span>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: "8px", color: C.red, lineHeight: "2.4" }}>{selected.error}</p>
              </div>
            </div>
          )}

          {selected?.status === "done" && selected.result && (() => {
            const r = selected.result;
            const timeline = r.timeline;
            const stage = timeline[sliderIdx] ?? timeline[0];

            const imgSrc = stage.image_b64
              ? `data:image/jpeg;base64,${stage.image_b64}`
              : (stage.image_url ?? "");

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Patient header */}
                <div style={panelStyle()}>
                  <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 64, height: 64, border: `4px solid ${C.border}`, flexShrink: 0, overflow: "hidden", background: C.bgDeep }}>
                      <img src={selected.imageUrl} alt={selected.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", color: C.text, marginBottom: "6px" }}>{selected.name}</p>
                      <p style={{ fontSize: "7px", color: C.muted, lineHeight: "2.2" }}>
                        AGE {selected.age} &nbsp;◆&nbsp; {selected.chief_complaint.toUpperCase()}
                      </p>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 22 }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "6px", color: C.muted, marginBottom: "4px" }}>SEVERITY</p>
                        <p style={{ fontSize: "9px", color: r.analysis.severity === "severe" ? C.red : r.analysis.severity === "mild" ? C.green : C.gold }}>
                          {r.analysis.severity.toUpperCase()}
                        </p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "6px", color: C.muted, marginBottom: "4px" }}>DURATION</p>
                        <p style={{ fontSize: "9px", color: C.text }}>{r.analysis.estimated_months} MO</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "6px", color: C.muted, marginBottom: "4px" }}>BRACES</p>
                        <p style={{ fontSize: "9px", color: r.analysis.suitable_for_braces ? C.green : C.red }}>
                          {r.analysis.suitable_for_braces ? "YES" : "NO"}
                        </p>
                      </div>
                      {r.analysis.cavities_detected && (
                        <div style={{ textAlign: "center" }}>
                          <p style={{ fontSize: "6px", color: C.muted, marginBottom: "4px" }}>CAVITIES</p>
                          <p style={{ fontSize: "9px", color: C.red }}>DETECTED</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Two-column: timeline + clinical note */}
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>

                  {/* Timeline */}
                  <div style={{ ...panelStyle(), flex: "0 0 380px", display: "flex", flexDirection: "column" }}>
                    <div style={hdrStyle()}>
                      <span style={{ fontSize: "9px", color: C.text }}>[ TREATMENT TIMELINE ]</span>
                    </div>
                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "8px", color: C.gold }}>{stage.label.toUpperCase()}</p>
                        <p style={{ fontSize: "7px", color: C.muted }}>{stage.month === 0 ? "TODAY" : `MONTH ${stage.month}`}</p>
                      </div>
                      {/* Image viewer */}
                      <div style={{ position: "relative", width: "100%", paddingBottom: "75%", background: C.bgDark, border: `3px solid ${C.border}` }}>
                        {timeline.map((s, i) => {
                          const src = s.image_b64
                            ? `data:image/jpeg;base64,${s.image_b64}`
                            : (s.image_url ?? "");
                          return (
                            <img
                              key={i}
                              src={src}
                              alt={s.label}
                              style={{
                                position: "absolute", inset: 0, width: "100%", height: "100%",
                                objectFit: "cover",
                                opacity: i === sliderIdx ? 1 : 0,
                                transition: "opacity 200ms",
                              }}
                            />
                          );
                        })}
                      </div>
                      {/* Slider */}
                      <input
                        type="range"
                        min={0}
                        max={timeline.length - 1}
                        value={sliderIdx}
                        onChange={e => setSliderIdx(Number(e.target.value))}
                        style={{ width: "100%" }}
                      />
                      {/* Stage dots */}
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {timeline.map((s, i) => (
                          <div key={i} onClick={() => setSliderIdx(i)} style={{ cursor: "pointer", textAlign: "center" }}>
                            <div style={{
                              width: 10, height: 10, margin: "0 auto 4px",
                              background: i === sliderIdx ? C.gold : C.bgDeep,
                              border: `2px solid ${C.border}`,
                            }} />
                            <p style={{ fontSize: "5px", color: i === sliderIdx ? C.text : C.muted, whiteSpace: "nowrap" }}>
                              {s.month === 0 ? "NOW" : `M${s.month}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clinical note */}
                  <div style={{ ...panelStyle(), flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <div style={hdrStyle()}>
                      <span style={{ fontSize: "9px", color: C.text }}>[ CLINICAL NOTE ]</span>
                      {selected.summaryStatus === "loading" && (
                        <span className="spin" style={{ marginLeft: "auto", fontSize: "12px", color: C.goldBrt }}>⟳</span>
                      )}
                    </div>
                    <div style={{ padding: "16px 18px", overflowY: "auto", maxHeight: "520px" }}>
                      {selected.summaryStatus === "loading" && (
                        <p style={{ fontSize: "7px", color: C.muted, lineHeight: "2.6" }}>
                          GENERATING CLINICAL SUMMARY...
                        </p>
                      )}
                      {selected.summaryStatus === "error" && (
                        <p style={{ fontSize: "7px", color: C.red, lineHeight: "2.6" }}>
                          FAILED TO GENERATE SUMMARY.
                        </p>
                      )}
                      {(selected.summaryStatus === "done" || selected.summaryStatus === "idle") && r.summary && renderSummary(r.summary)}
                      {selected.summaryStatus === "idle" && !r.summary && (
                        <p style={{ fontSize: "7px", color: C.muted, lineHeight: "2.6" }}>SELECT PATIENT TO GENERATE NOTE.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Observations strip */}
                {r.analysis.issues.length > 0 && (
                  <div style={panelStyle()}>
                    <div style={hdrStyle()}>
                      <span style={{ fontSize: "9px", color: C.text }}>[ CLINICAL OBSERVATIONS ]</span>
                    </div>
                    <div style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {r.analysis.issues.map((issue, i) => (
                        <span key={i} style={{ fontSize: "7px", background: C.bgDark, border: `2px solid ${C.border}`, padding: "5px 10px", color: C.text }}>
                          {issue}
                        </span>
                      ))}
                      {r.analysis.cavity_notes && (
                        <span style={{ fontSize: "7px", background: C.red + "22", border: `2px solid ${C.red}`, padding: "5px 10px", color: C.red }}>
                          ⚠ {r.analysis.cavity_notes}
                        </span>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Add Patient Modal ─────────────────────────────────────────────────── */}
      {showAdd && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}
        >
          <div style={panelStyle({ width: "min(92vw, 520px)" })}>
            <div style={hdrStyle()}>
              <span style={{ fontSize: "10px", color: C.text }}>[ ADD NEW PATIENT ]</span>
              <button className="px-btn" style={{ ...btnStyle("secondary"), marginLeft: "auto", padding: "6px 10px" }} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <p style={{ fontSize: "7px", color: C.muted, marginBottom: "8px", letterSpacing: "2px" }}>TEETH PHOTO</p>
                <div
                  style={{ border: `3px dashed ${C.border}`, background: C.bgDark, padding: "16px", textAlign: "center", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 80 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formPreview
                    ? <img src={formPreview} alt="preview" style={{ height: 64, border: `2px solid ${C.border}` }} />
                    : <p style={{ fontSize: "8px", color: C.muted, lineHeight: "2.2" }}>CLICK TO UPLOAD<br />TEETH PHOTO</p>
                  }
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={pickFile} />
              </div>
              <div>
                <p style={{ fontSize: "7px", color: C.muted, marginBottom: "6px", letterSpacing: "2px" }}>PATIENT NAME</p>
                <input style={inputStyle} type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div>
                <p style={{ fontSize: "7px", color: C.muted, marginBottom: "6px", letterSpacing: "2px" }}>AGE</p>
                <input style={inputStyle} type="number" min={1} max={120} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="Age" />
              </div>
              <div>
                <p style={{ fontSize: "7px", color: C.muted, marginBottom: "6px", letterSpacing: "2px" }}>CHIEF COMPLAINT</p>
                <input style={inputStyle} type="text" value={form.complaint} onChange={e => setForm(f => ({ ...f, complaint: e.target.value }))} placeholder="e.g. crooked teeth, pain" />
              </div>
              {formError && <p style={{ fontSize: "7px", color: C.red }}>{formError}</p>}
              <button className="px-btn" style={{ ...btnStyle("primary"), width: "100%", textAlign: "center", padding: "14px" }} onClick={submitPatient}>
                ▶ ANALYZE PATIENT
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
