"use client";
import { useEffect, useState } from "react";

export default function FinancialAgentPage() {
  const [result, setResult] = useState<string | null>(null);
  const [scraped, setScraped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/agents/financial/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What Sun Life dental plan best covers my treatment?" }),
    })
      .then((r) => r.json())
      .then((data) => {
        setResult(data.recommendation ?? JSON.stringify(data, null, 2));
        setScraped(!!data.scraped);
        if (data.error) setError(data.error);
      })
      .catch(() => setResult("Unable to reach the financial agent. Make sure the backend is running."));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #0f2044 50%, #0a1628 100%)",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#e8f0fe",
      padding: "40px 24px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <img
            src="/sunlife-logo.png"
            alt="Sun Life"
            style={{ width: 56, height: "auto", filter: "drop-shadow(0 2px 8px rgba(255,200,60,0.4))" }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>
              Sun Life Financial Advisor
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
              Powered by Gemini · {scraped ? "Live data from sunlife.ca" : "Using plan reference data"}
            </p>
          </div>
        </div>

        {/* Content card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "32px 36px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          minHeight: 200,
        }}>
          {result === null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.5)" }}>
              <div style={{
                width: 18, height: 18, border: "2px solid rgba(96,165,250,0.6)",
                borderTopColor: "#60a5fa", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              Analyzing your Sun Life plan with Gemini…
            </div>
          ) : (
            <pre style={{
              margin: 0, whiteSpace: "pre-wrap", fontSize: 14,
              lineHeight: 1.8, color: "rgba(255,255,255,0.88)",
              fontFamily: "inherit",
            }}>
              {result}
            </pre>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,100,100,0.7)" }}>
            Debug: {error}
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
          Sun Life Personal Health Insurance · sunlife.ca · Not financial advice
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
