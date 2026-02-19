import { useState } from 'react';
import { Skeleton } from '../ui/Skeleton';
import './ProjectMetadata.css';

export const ProjectMetadata = ({ project, loading }) => {
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [saving, setSaving] = useState(false);
  
  if (loading) {
    return (
      <div className="project-metadata">
        <div className="meta-header">
          <div className="meta-title-section">
            <Skeleton width="180px" height="28px" borderRadius="6px" />
            <Skeleton width="100px" height="18px" borderRadius="6px" style={{ marginTop: '8px' }} />
          </div>
          <Skeleton width="80px" height="24px" borderRadius="12px" />
        </div>

        <div className="meta-grid">
          <div className="meta-col-main">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="info-section">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="info-row">
                    <Skeleton width="120px" height="14px" borderRadius="4px" />
                    <Skeleton width="200px" height="16px" borderRadius="4px" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="meta-col-side">
            <Skeleton width="100%" height="40px" borderRadius="6px" style={{ marginBottom: '16px' }} />
            <div className="score-section">
              <Skeleton width="80px" height="14px" borderRadius="4px" style={{ marginBottom: '12px' }} />
              <Skeleton width="60px" height="48px" borderRadius="6px" style={{ marginBottom: '8px' }} />
              <Skeleton width="70px" height="12px" borderRadius="4px" />
            </div>
            <div className="score-breakdown" style={{ marginTop: '20px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <Skeleton width="60px" height="14px" borderRadius="4px" />
                    <Skeleton width="20px" height="14px" borderRadius="4px" />
                  </div>
                  <Skeleton width="100%" height="6px" borderRadius="3px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { metadata } = project;
  
  const displayScore = Math.min(metadata.totalScore, 100);
  const issues = [
    { label: "Critical", count: 0 },
    { label: "High", count: 2 },
    { label: "Medium", count: 5 },
    { label: "Low", count: 3 }
  ];

  return (
    <div className="project-metadata">
      <div className="meta-header">
        <div className="meta-title-section">
          <h2 className="meta-title">{project.amount}</h2>
          <span className="meta-username">@{project.label}</span>
        </div>
        <span className={`ci-badge ${metadata.cicdStatus.toLowerCase()}`}>
          {metadata.cicdStatus}
        </span>
      </div>

      <div className="meta-grid">
        <div className="meta-col-main">
          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Repository URL</span>
              <a href={metadata.repoUrl} target="_blank" rel="noopener noreferrer" className="info-link">
                {metadata.repoUrl}
              </a>
            </div>
            <div className="info-row">
              <span className="info-label">Branch URL</span>
              <a href={metadata.branchUrl} target="_blank" rel="noopener noreferrer" className="info-link">
                {metadata.branchUrl.split('/').pop()}
              </a>
            </div>
          </div>

          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Team Name</span>
              <span className="info-value">{metadata.teamName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Team Leader</span>
              <span className="info-value">{metadata.teamLeader}</span>
            </div>
          </div>

          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Total Failures Detected</span>
              <span className="info-value error">{metadata.failuresDetected}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Fixes Applied</span>
              <span className="info-value success">{metadata.fixesApplied}</span>
            </div>
          </div>

          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Deployment Time</span>
              <span className="info-value">{metadata.deploymentTime}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Commits</span>
              <span className="info-value">{metadata.commits}</span>
            </div>
          </div>

          <div className="commit-section">
            <div className="commit-row">
              <span className="info-label">Last Commit</span>
              <code className="commit-hash">{metadata.lastCommitId}</code>
            </div>
            <p className="commit-msg">{metadata.lastCommitMessage}</p>
          </div>
        </div>

        <div className="meta-col-side">
          <button onClick={() => setEnvModalOpen(true)} style={{ width: "100%", padding: "10px 16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M12 12h.01"></path><path d="M17 12h.01"></path><path d="M7 12h.01"></path></svg>
            Environment Variables
          </button>
          <div className="score-section">
            <div className="score-label">Total Score</div>
            <div className="score-number">{displayScore}</div>
            <div className="score-max">out of 100</div>
          </div>

          <div className="score-breakdown">
            {issues.map((issue, i) => (
              <div key={i} className="breakdown-row" style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span className="breakdown-label">{issue.label}</span>
                  <span className="breakdown-value">{issue.count}</span>
                </div>
                <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden", width: "100%" }}>
                  <div style={{ width: `${issue.count * 10}%`, height: "100%", background: "#111", borderRadius: "3px", transition: "width 0.3s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {envModalOpen && (
        <div className="agent-loading-backdrop" onClick={() => !saving && setEnvModalOpen(false)}>
          <div className="agent-loading-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111", margin: 0, fontFamily: "'Matter', sans-serif" }}>Environment Variables</h3>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {envVars.map((env, i) => (
                <div key={i} style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Matter', sans-serif" }}>Key</label>
                    <input value={env.key} onChange={(e) => setEnvVars(envVars.map((v, idx) => idx === i ? { ...v, key: e.target.value } : v))} placeholder="API_KEY" style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", outline: "none", transition: "border 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#111"} onBlur={(e) => e.target.style.borderColor = "#e5e7eb"} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Matter', sans-serif" }}>Value</label>
                    <input value={env.value} onChange={(e) => setEnvVars(envVars.map((v, idx) => idx === i ? { ...v, value: e.target.value } : v))} placeholder="" style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace", outline: "none", transition: "border 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#111"} onBlur={(e) => e.target.style.borderColor = "#e5e7eb"} />
                  </div>
                  {envVars.length > 1 && <button onClick={() => setEnvVars(envVars.filter((_, idx) => idx !== i))} style={{ alignSelf: "flex-end", padding: "9px 11px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", color: "#9ca3af", cursor: "pointer", fontSize: "16px", transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.background = "#fafafa"; e.target.style.color = "#111"; }} onMouseLeave={(e) => { e.target.style.background = "#fff"; e.target.style.color = "#9ca3af"; }}>×</button>}
                </div>
              ))}
              <button onClick={() => setEnvVars([...envVars, { key: '', value: '' }])} style={{ padding: "9px 12px", background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", color: "#6b7280", cursor: "pointer", fontFamily: "'Matter', sans-serif", fontWeight: "500", transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.background = "#f3f4f6"; e.target.style.borderColor = "#d1d5db"; }} onMouseLeave={(e) => { e.target.style.background = "#fafafa"; e.target.style.borderColor = "#e5e7eb"; }}>+ Add Variable</button>
            </div>
            <div style={{ padding: "16px 24px", background: "#fafafa", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setEnvModalOpen(false)} disabled={saving} style={{ padding: "9px 16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", color: "#6b7280", fontSize: "13px", fontWeight: "500", cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Matter', sans-serif", opacity: saving ? 0.5 : 1, transition: "all 0.2s" }}>Cancel</button>
              <button onClick={() => { setSaving(true); setTimeout(() => { setSaving(false); setEnvModalOpen(false); }, 1500); }} disabled={saving} style={{ padding: "9px 20px", background: saving ? "#374151" : "#111", border: "none", borderRadius: "6px", color: "#fff", fontSize: "13px", fontWeight: "500", cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Matter', sans-serif", display: "flex", alignItems: "center", gap: "8px", minWidth: "80px", justifyContent: "center", transition: "background 0.2s" }}>
                {saving ? (
                  <>
                    <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                    Saving
                  </>
                ) : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
