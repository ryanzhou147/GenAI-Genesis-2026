"use client";

import { useRef, useState, useCallback } from "react";

const API_BASE = "http://localhost:8000";

type TimelineEntry = { month: number; label: string; image_b64: string };
type Analysis = {
  severity: "mild" | "moderate" | "severe";
  issues: string[];
  estimated_months: number;
  cavities_detected?: boolean;
  cavity_notes?: string;
  notes?: string;
};
type Result = { analysis: Analysis; timeline: TimelineEntry[] };
type Stage = "idle" | "loading" | "done" | "error";

const LOADING_STEPS = [
  { label: "UPLOADING IMAGE...",                 duration: 800  },
  { label: "SCANNING DENTAL STRUCTURE...",       duration: 2200 },
  { label: "APPLYING BRACES (MONTH 3)...",       duration: 1800 },
  { label: "SIMULATING MOVEMENT (MONTH 9)...",   duration: 1600 },
  { label: "ADVANCING TREATMENT (MONTH 15)...",  duration: 1500 },
  { label: "COMPLETING TREATMENT (MONTH 24)...", duration: 1200 },
  { label: "FINALIZING TIMELINE...",             duration: 900  },
];

const C = {
  bg:      "#EAD3A2",
  bgDark:  "#D4B896",
  bgDeep:  "#C4A070",
  border:  "#3D2B1F",
  text:    "#2C1810",
  muted:   "#7A5C3A",
  gold:    "#C8960C",
  goldBrt: "#F5C842",
  red:     "#7A2020",
  green:   "#2A5A1A",
  page:    "#140904",
};

const FONT = "'Press Start 2P', monospace";

const panel: React.CSSProperties = {
  background: C.bg,
  border: `4px solid ${C.border}`,
  boxShadow: `5px 5px 0 ${C.border}`,
  marginBottom: "16px",
};

const hdr = (bg = C.bgDark): React.CSSProperties => ({
  background: bg,
  borderBottom: `4px solid ${C.border}`,
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
});

const btn = (on = true): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: "10px",
  background: on ? C.bg : C.bgDeep,
  border: `3px solid ${C.border}`,
  boxShadow: on ? `4px 4px 0 ${C.border}` : "none",
  padding: "10px 18px",
  color: on ? C.text : C.muted,
  cursor: on ? "pointer" : "not-allowed",
  opacity: on ? 1 : 0.4,
  lineHeight: 1,
});

function npcText(a: Analysis) {
  const intro =
    a.severity === "severe"   ? "Oh my... this is quite serious." :
    a.severity === "moderate" ? "Hmm, I can see some issues here." :
                                "Not too bad, but we should fix this.";
  const cavity = a.cavities_detected
    ? " I also detect cavity damage — restorative work needed first." : "";
  return `${intro} I'm seeing ${a.issues[0] ?? "misalignment"}.${cavity} I recommend a full ${a.estimated_months}-month treatment plan.`;
}

export default function TreatmentPage() {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [file,         setFile]     = useState<File | null>(null);
  const [preview,      setPreview]  = useState<string | null>(null);
  const [stage,        setStage]    = useState<Stage>("idle");
  const [result,       setResult]   = useState<Result | null>(null);
  const [error,        setError]    = useState<string | null>(null);
  const [dragging,     setDragging] = useState(false);
  const [activeIndex,  setActive]   = useState(0);
  const [loadingStep,  setLStep]    = useState(0);
  const [stepProgress, setSProg]    = useState(0);

  const handleFile = (f: File) => {
    setFile(f); setPreview(URL.createObjectURL(f));
    setResult(null); setError(null); setStage("idle"); setActive(0);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  }, []);

  const runFakeProgress = async () => {
    setLStep(0); setSProg(0);
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLStep(i);
      const ticks = 20, tickMs = LOADING_STEPS[i].duration / ticks;
      for (let t = 0; t <= ticks; t++) {
        setSProg(t / ticks);
        await new Promise((r) => setTimeout(r, tickMs));
      }
    }
  };

  const analyze = async () => {
    if (!file) return;
    setError(null); setResult(null); setStage("loading");
    const form = new FormData();
    form.append("image", file);
    const apiCall = fetch(`${API_BASE}/agents/treatment-predictive/analyze`, { method: "POST", body: form });
    try {
      const [res] = await Promise.all([apiCall, runFakeProgress()]);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(body.detail ?? `HTTP ${res.status}`);
      }
      const data: Result = await res.json();
      setResult(data); setActive(0); setStage("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStage("error");
    }
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    setStage("idle"); setActive(0); setLStep(0); setSProg(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isLoading   = stage === "loading";
  const activeEntry = result?.timeline[activeIndex];
  const totalPct    = Math.round(((loadingStep + stepProgress) / LOADING_STEPS.length) * 100);
  const maxIdx      = (result?.timeline.length ?? 1) - 1;

  return (
    <main style={{ background: C.page, minHeight: "100vh", padding: "20px 16px", fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        * { box-sizing: border-box; }
        .px-btn { transition: transform 60ms, box-shadow 60ms; }
        .px-btn:hover:not(:disabled) { transform: translate(4px,4px); box-shadow: none !important; }
        .px-btn:disabled { opacity:.35; cursor:not-allowed !important; }
        .px-thumb { transition: filter .1s; cursor: pointer; }
        .px-thumb:hover { filter: brightness(1.15) !important; }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes nodePulse { 0%,100%{box-shadow:0 0 0 3px ${C.goldBrt}} 50%{box-shadow:0 0 0 8px ${C.goldBrt}44} }
        @keyframes imgIn     { from{opacity:0} to{opacity:1} }
        .node-active { animation: nodePulse 1.2s ease-in-out infinite; }
        .blink { animation: blink 1s step-end infinite; }
        .img-fade { animation: imgIn .2s ease; }

        /* Pixel slider */
        input[type=range] { -webkit-appearance:none; appearance:none; width:100%; height:12px; background:${C.bgDeep}; border:3px solid ${C.border}; cursor:pointer; outline:none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; background:${C.goldBrt}; border:3px solid ${C.border}; cursor:pointer; margin-top:-7px; box-shadow:2px 2px 0 ${C.border}; }
        input[type=range]::-moz-range-thumb { width:20px; height:20px; background:${C.goldBrt}; border:3px solid ${C.border}; cursor:pointer; box-shadow:2px 2px 0 ${C.border}; }
        input[type=range]::-webkit-slider-runnable-track { height:6px; background:linear-gradient(to right, ${C.gold} var(--pct,0%), ${C.bgDeep} var(--pct,0%)); border:0; }
      `}</style>

      <div style={{ maxWidth: "780px", margin: "0 auto" }}>

        {/* Header */}
        <div style={panel}>
          <div style={hdr()}>
            <span style={{ fontSize: "9px", color: C.muted, letterSpacing: "3px" }}>◆ DENTAL CLINIC ◆</span>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <h1 style={{ fontSize: "16px", color: C.text, marginBottom: "10px", lineHeight: 1.5 }}>ORTHODONTIC TREATMENT PLAN</h1>
            <p style={{ fontSize: "8px", color: C.muted, lineHeight: "2.2" }}>
              UPLOAD A TEETH PHOTO FOR YOUR AI-POWERED 24-MONTH TIMELINE.
            </p>
          </div>
        </div>

        {/* Upload */}
        {!result && !isLoading && (
          <div style={panel}>
            <div style={hdr()}>
              <span style={{ fontSize: "10px", color: C.text }}>[ UPLOAD PHOTO ]</span>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div
                style={{
                  border: `3px dashed ${dragging ? C.gold : C.border}`,
                  background: dragging ? C.gold + "18" : C.bgDark + "55",
                  padding: "24px", textAlign: "center",
                  cursor: file ? "default" : "pointer",
                  marginBottom: "14px",
                }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !file && inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {preview ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "18px", justifyContent: "center" }}>
                    <div style={{ border: `4px solid ${C.border}`, lineHeight: 0 }}>
                      <img src={preview} alt="preview" style={{ width: 80, height: 80, objectFit: "cover", display: "block" }} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: "8px", color: C.text, marginBottom: "10px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file?.name}</p>
                      <button className="px-btn" style={btn()} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>↺ REPLACE</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>🦷</div>
                    <p style={{ fontSize: "9px", color: C.muted, lineHeight: "2.2" }}>DRAG & DROP OR CLICK TO SELECT</p>
                    <p style={{ fontSize: "7px", color: C.muted, marginTop: "8px" }}>JPEG OR PNG · OPEN MOUTH WORKS BEST</p>
                  </>
                )}
              </div>
              <button className="px-btn" onClick={analyze} disabled={!file} style={{
                ...btn(!!file),
                background: file ? C.gold : C.bgDeep,
                fontSize: "11px", padding: "14px 24px",
                color: file ? C.page : C.muted,
              }}>▶ GENERATE TIMELINE</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={panel}>
            <div style={hdr()}>
              <span style={{ fontSize: "10px", color: C.text }}>[ PROCESSING... ]</span>
              <span style={{ marginLeft: "auto", fontSize: "10px", color: C.gold }}>{totalPct}%</span>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ height: "16px", background: C.bgDeep, border: `3px solid ${C.border}`, marginBottom: "16px" }}>
                <div style={{ height: "100%", background: C.gold, width: `${totalPct}%`, transition: "width .2s", boxShadow: `0 0 8px ${C.goldBrt}88` }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {LOADING_STEPS.map((step, i) => {
                  const done = i < loadingStep, active = i === loadingStep;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px",
                      background: active ? C.gold + "25" : done ? C.green + "18" : "transparent",
                      border: `2px solid ${active ? C.gold : done ? C.green : "transparent"}`,
                      opacity: i > loadingStep ? 0.25 : 1,
                    }}>
                      <span style={{ fontSize: "12px", width: 16, flexShrink: 0, color: done ? C.green : active ? C.gold : C.muted }}>
                        {done ? "✓" : active ? "▶" : "·"}
                      </span>
                      <span style={{ fontSize: "8px", color: active ? C.text : done ? C.green : C.muted }}>{step.label}</span>
                      {active && (
                        <div style={{ marginLeft: "auto", width: 60, height: 8, background: C.bgDeep, border: `2px solid ${C.border}`, flexShrink: 0 }}>
                          <div style={{ height: "100%", background: C.gold, width: `${stepProgress * 100}%`, transition: "width .15s" }} />
                        </div>
                      )}
                      {done && <span style={{ marginLeft: "auto", fontSize: "7px", color: C.green }}>DONE</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {stage === "error" && error && (
          <div style={{ ...panel, borderColor: C.red }}>
            <div style={hdr(C.red + "44")}>
              <span style={{ fontSize: "10px", color: C.red }}>[ ✖ ERROR ]</span>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <p style={{ fontSize: "9px", color: C.red, lineHeight: "2.2", marginBottom: "14px" }}>{error}</p>
              <button className="px-btn" style={btn()} onClick={reset}>↩ TRY AGAIN</button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && activeEntry && (
          <>
            {/* Analysis */}
            <div style={panel}>
              <div style={hdr()}>
                <span style={{ fontSize: "10px", color: C.text }}>[ DR. DENTIN — ANALYSIS ]</span>
              </div>
              <div style={{ padding: "14px 18px" }}>

                {/* Speech */}
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "14px", background: C.bgDark, border: `3px solid ${C.border}`, marginBottom: "12px" }}>
                  <div style={{ flexShrink: 0, width: 54, height: 54, border: `3px solid ${C.border}`, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🦷</div>
                  <div>
                    <p style={{ fontSize: "8px", color: C.gold, marginBottom: "8px", letterSpacing: "1px" }}>DR. DENTIN:</p>
                    <p style={{ fontSize: "8px", color: C.text, lineHeight: "2.4" }}>
                      &ldquo;{npcText(result.analysis)}&rdquo;
                      <span className="blink" style={{ marginLeft: 4 }}>▌</span>
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "12px" }}>
                  {[
                    { label: "SEVERITY", value: result.analysis.severity.toUpperCase(), color: result.analysis.severity === "severe" ? C.red : result.analysis.severity === "moderate" ? "#8B6000" : C.green },
                    { label: "DURATION", value: `${result.analysis.estimated_months} MONTHS`, color: C.text },
                    { label: "CAVITIES", value: result.analysis.cavities_detected ? "⚠ DETECTED" : "✓ NONE", color: result.analysis.cavities_detected ? C.red : C.green },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ padding: "12px", border: `2px solid ${C.border}`, background: C.bgDark }}>
                      <p style={{ fontSize: "7px", color: C.muted, marginBottom: "8px", letterSpacing: "1px" }}>{label}</p>
                      <p style={{ fontSize: "10px", color, lineHeight: 1.4 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Issues */}
                {result.analysis.issues.length > 0 && (
                  <div style={{ padding: "12px 14px", border: `2px solid ${C.border}`, background: C.bgDark, marginBottom: "10px" }}>
                    <p style={{ fontSize: "7px", color: C.muted, marginBottom: "10px", letterSpacing: "2px" }}>CLINICAL OBSERVATIONS</p>
                    {result.analysis.issues.map((issue, i) => (
                      <p key={i} style={{ fontSize: "8px", color: C.text, lineHeight: "2.4", marginBottom: "2px" }}>▸ {issue}</p>
                    ))}
                  </div>
                )}

                {/* Cavity warning */}
                {result.analysis.cavities_detected && result.analysis.cavity_notes && (
                  <div style={{ padding: "12px 14px", border: `2px solid ${C.red}`, background: C.red + "18", marginBottom: "10px" }}>
                    <p style={{ fontSize: "7px", color: C.red, lineHeight: "2.4" }}>⚠ {result.analysis.cavity_notes}</p>
                  </div>
                )}

                <button className="px-btn" style={btn()} onClick={reset}>↩ NEW PHOTO</button>
              </div>
            </div>

            {/* Timeline */}
            <div style={panel}>
              <div style={hdr()}>
                <span style={{ fontSize: "10px", color: C.text }}>[ TREATMENT TIMELINE ]</span>
                <span style={{ marginLeft: "auto", fontSize: "8px", color: C.muted }}>STAGE {activeIndex + 1}/{result.timeline.length}</span>
              </div>
              <div style={{ padding: "14px 18px" }}>

                {/* Main image — all stacked, only active visible */}
                <div style={{ position: "relative", border: `4px solid ${C.border}`, marginBottom: "16px", background: C.page, lineHeight: 0, overflow: "hidden" }}>
                  {result.timeline.map((entry, i) => (
                    <img
                      key={i}
                      src={i === 0 && preview ? preview : `data:image/jpeg;base64,${entry.image_b64}`}
                      alt={entry.label}
                      style={{
                        width: "100%",
                        maxHeight: "380px",
                        objectFit: "contain",
                        display: "block",
                        position: i === 0 ? "relative" : "absolute",
                        top: 0, left: 0,
                        opacity: i === activeIndex ? 1 : 0,
                        transition: "opacity .25s ease",
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                  {/* Badge */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,#14090ACC)", padding: "24px 12px 10px", display: "flex", gap: 8 }}>
                    <span style={{ background: C.gold, border: `2px solid ${C.border}`, padding: "5px 10px", fontSize: "9px", color: C.page, fontFamily: FONT }}>
                      MONTH {activeEntry.month}
                    </span>
                    <span style={{ background: C.bg, border: `2px solid ${C.border}`, padding: "5px 10px", fontSize: "9px", color: C.text, fontFamily: FONT }}>
                      {activeEntry.label.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div style={{ marginBottom: "16px" }}>
                  <input
                    type="range"
                    min={0}
                    max={maxIdx}
                    step={1}
                    value={activeIndex}
                    onChange={(e) => setActive(Number(e.target.value))}
                    style={{
                      "--pct": `${(activeIndex / maxIdx) * 100}%`,
                      width: "100%",
                    } as React.CSSProperties}
                  />
                  {/* Month labels under slider */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    {result.timeline.map((entry, i) => (
                      <button key={entry.month} onClick={() => setActive(i)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FONT, padding: "4px 0" }}>
                        <span style={{ fontSize: "7px", color: i === activeIndex ? C.gold : C.muted, display: "block", textAlign: "center" }}>
                          MO.{entry.month}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnail strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "8px", marginBottom: "14px" }}>
                  {result.timeline.map((entry, i) => (
                    <button key={entry.month} className="px-thumb" onClick={() => setActive(i)} style={{
                      padding: 0, lineHeight: 0, position: "relative", background: C.page,
                      border: `3px solid ${i === activeIndex ? C.goldBrt : C.border}`,
                      boxShadow: i === activeIndex ? `3px 3px 0 ${C.goldBrt}` : `2px 2px 0 ${C.border}`,
                      filter: i === activeIndex ? "none" : "brightness(.7)",
                    }}>
                      <img
                        src={i === 0 && preview ? preview : `data:image/jpeg;base64,${entry.image_b64}`}
                        alt={entry.label}
                        style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                      />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(20,9,4,.8)", padding: "4px 5px" }}>
                        <span style={{ fontSize: "6px", color: i === activeIndex ? C.goldBrt : C.bg + "88", fontFamily: FONT }}>MO.{entry.month}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Prev/Next */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button className="px-btn" style={btn(activeIndex > 0)} disabled={activeIndex === 0} onClick={() => setActive((i) => Math.max(0, i - 1))}>◀ PREV</button>
                  <button className="px-btn" style={btn(activeIndex < maxIdx)} disabled={activeIndex === maxIdx} onClick={() => setActive((i) => Math.min(maxIdx, i + 1))}>NEXT ▶</button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}
