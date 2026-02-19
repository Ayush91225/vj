export default function CodeDiff({ oldCode, newCode }) {
  return (
    <div style={{ display: "flex", gap: "16px", fontFamily: "monospace", fontSize: "12px" }}>
      <div style={{ flex: 1, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px" }}>
        <div style={{ color: "#991b1b", fontWeight: "600", marginBottom: "8px", fontSize: "11px" }}>- OLD CODE</div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#7f1d1d", lineHeight: "1.5" }}>{oldCode}</pre>
      </div>
      <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
        <div style={{ color: "#166534", fontWeight: "600", marginBottom: "8px", fontSize: "11px" }}>+ NEW CODE</div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#14532d", lineHeight: "1.5" }}>{newCode}</pre>
      </div>
    </div>
  );
}
