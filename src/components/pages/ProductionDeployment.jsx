import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDeploymentStore } from "../../store";
import CodeDiff from "./CodeDiff";
import "./ProductionDeployment.css";

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"></polyline>
    <path d="M3.51 15a9 9 0 1 0 .49-3.51"></path>
  </svg>
);

const GitBranchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15"></line>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <path d="M18 9a9 9 0 0 1-9 9"></path>
  </svg>
);

const CommitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <line x1="3" y1="12" x2="9" y2="12"></line>
    <line x1="15" y1="12" x2="21" y2="12"></line>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const ActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const BookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const WebsitePreview = () => {
  const deploymentTimeMinutes = 2.57; // 2m 34s = 2.57 minutes
  const commits = 18;
  const issuesFixed = 10;
  const issuesFailed = 0;
  
  const baseScore = 100;
  const speedBonus = deploymentTimeMinutes < 5 ? 10 : 0;
  const efficiencyPenalty = commits > 20 ? -2 * (commits - 20) : 0;
  const qualityBonus = issuesFixed * 2;
  const qualityPenalty = issuesFailed * -5;
  const rawTotal = baseScore + speedBonus + efficiencyPenalty + qualityBonus + qualityPenalty;
  const totalScore = Math.min(Math.max(rawTotal, 0), 100);
  
  return (
  <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", boxSizing: "border-box" }}>
    <div style={{ fontSize: "64px", fontWeight: "300", color: "#111", lineHeight: 1, fontFamily: "'Season Mix', sans-serif", marginBottom: "6px" }}>{totalScore}</div>
    <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "400", marginBottom: "32px", fontFamily: "'Matter', sans-serif" }}>Quality Score</div>
    
    <div style={{ width: "100%", maxWidth: "100%", paddingLeft: "16px", paddingRight: "16px", boxSizing: "border-box" }}>
      {[
        { label: "Base Score", count: baseScore, color: "#111" },
        { label: "Speed Bonus", count: speedBonus, color: "#374151", show: speedBonus > 0 },
        { label: "Efficiency Penalty", count: Math.abs(efficiencyPenalty), color: "#6b7280", show: efficiencyPenalty < 0 },
        { label: "Quality Bonus", count: qualityBonus, color: "#4b5563", show: qualityBonus > 0 },
        { label: "Quality Penalty", count: Math.abs(qualityPenalty), color: "#9ca3af", show: qualityPenalty < 0 },
        { label: "Total Score", count: totalScore, color: "#111" }
      ].filter(item => item.show !== false).map((item, i) => (
        <div key={i} style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#374151", fontWeight: "400", fontFamily: "'Matter', sans-serif" }}>{item.label}</span>
            <span style={{ fontSize: "12px", color: item.color, fontWeight: "500", fontFamily: "'Matter', sans-serif" }}>
              {item.label.includes('Bonus') && item.count > 0 ? '+' : item.label.includes('Penalty') && item.count > 0 ? '-' : ''}{item.count}
            </span>
          </div>
          <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden", width: "100%" }}>
            <div style={{ width: `${(Math.abs(item.count) / 100) * 100}%`, height: "100%", background: item.color, borderRadius: "3px", transition: "width 0.3s ease" }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
};

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function ProductionDeployment() {
  const { deploymentId } = useParams();
  const deployId = deploymentId || 'a3f2c1d';
  
  const {
    getDeploymentState,
    incrementAttempts,
    addFixedIssue,
    setFixedButtons: setStoreFixedButtons,
    setFailedButtons: setStoreFailedButtons,
    setTotalAttempts: setStoreTotalAttempts,
    addCicdRun,
    setTotalFailures,
  } = useDeploymentStore();
  
  const deploymentState = getDeploymentState(deployId);
  
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [cicdOpen, setCicdOpen] = useState(false);
  const [fixingIndex, setFixingIndex] = useState(null);
  const [expandedErrors, setExpandedErrors] = useState([]);
  const [limitModal, setLimitModal] = useState(false);
  const readmeRef = useRef(null);
  const errorsRef = useRef(null);
  const cicdRef = useRef(null);

  const MAX_FIX_ATTEMPTS = 5;
  const totalFixAttempts = deploymentState.totalAttempts || 0;
  const fixedIssues = deploymentState.fixedIssues || [];
  const fixedButtons = deploymentState.fixedButtons || [];
  const failedButtons = deploymentState.failedButtons || [];
  const cicdRuns = deploymentState.cicdRuns || [];
  const totalFailures = deploymentState.totalFailures || 10;

  const handleFix = (index, error, e) => {
    e.stopPropagation();
    
    if (totalFixAttempts >= MAX_FIX_ATTEMPTS) {
      setLimitModal(true);
      return;
    }

    if (failedButtons.includes(index)) {
      setStoreFailedButtons(deployId, failedButtons.filter(x => x !== index));
    }
    
    setFixingIndex(index);
    setTimeout(() => {
      const success = Math.random() > 0.3;
      incrementAttempts(deployId);
      
      if (success) {
        addFixedIssue(deployId, {
          id: index + 1,
          file: error.file,
          bugType: index < 2 ? "LINTING" : index < 4 ? "LOGIC" : "STYLE",
          line: error.line,
          message: error.message,
          oldCode: error.oldCode,
          newCode: error.newCode
        });
        setSettingsOpen(true);
        setStoreFixedButtons(deployId, [...fixedButtons, index]);
      } else {
        setStoreFailedButtons(deployId, [...failedButtons, index]);
      }
      setFixingIndex(null);
    }, 3000);
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
    
    if (cicdRuns.length === 0) {
      const initialRuns = [
        { id: 1, status: 'failed', timestamp: '2m 34s ago', iteration: 1, duration: '45s' },
        { id: 2, status: 'failed', timestamp: '2m 10s ago', iteration: 2, duration: '38s' },
        { id: 3, status: 'passed', timestamp: '1m 52s ago', iteration: 3, duration: '42s' },
      ];
      initialRuns.forEach(run => addCicdRun(deployId, run));
      setTotalFailures(deployId, 10);
    }
  }, []);

  if (loading) {
    return (
      <div className="production-deployment">
        <div className="prod-header">
          <div style={{ width: "250px", height: "32px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "6px", animation: "shimmer-bg 1.5s infinite" }} />
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ width: "100px", height: "36px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "999px", animation: "shimmer-bg 1.5s infinite" }} />
            <div style={{ width: "100px", height: "36px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "999px", animation: "shimmer-bg 1.5s infinite 0.2s" }} />
          </div>
        </div>
        <div className="prod-card">
          <div className="prod-main">
            <div className="prod-preview" style={{ background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer-bg 1.5s infinite" }} />
            <div className="prod-info" style={{ gap: "24px", flex: 1 }}>
              {[80, 120, 100, 90, 110, 95].map((width, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ width: `${width}px`, height: "13px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: `shimmer-bg 1.5s infinite ${i * 0.1}s` }} />
                  <div style={{ width: "100%", height: "16px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: `shimmer-bg 1.5s infinite ${i * 0.1 + 0.05}s` }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px 32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "16px", height: "16px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: "shimmer-bg 1.5s infinite" }} />
            <div style={{ width: "16px", height: "16px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: "shimmer-bg 1.5s infinite 0.1s" }} />
            <div style={{ width: "120px", height: "16px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: "shimmer-bg 1.5s infinite 0.2s" }} />
            <div style={{ flex: 1 }} />
            <div style={{ width: "80px", height: "28px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "999px", animation: "shimmer-bg 1.5s infinite 0.3s" }} />
          </div>
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px 32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "16px", height: "16px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: "shimmer-bg 1.5s infinite 0.4s" }} />
            <div style={{ width: "16px", height: "16px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: "shimmer-bg 1.5s infinite 0.5s" }} />
            <div style={{ width: "100px", height: "16px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "4px", animation: "shimmer-bg 1.5s infinite 0.6s" }} />
            <div style={{ width: "60px", height: "20px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "20px", animation: "shimmer-bg 1.5s infinite 0.7s" }} />
            <div style={{ flex: 1 }} />
            <div style={{ width: "70px", height: "28px", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "999px", animation: "shimmer-bg 1.5s infinite 0.8s" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="production-deployment">
      <div className="prod-header">
        <h1 className="prod-title">Production Deployment</h1>
        <div className="prod-actions">
          <button className="prod-btn" onClick={() => { setReadmeOpen(!readmeOpen); setTimeout(() => readmeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}>README.md</button>
          <button className="prod-btn" onClick={() => { setCicdOpen(!cicdOpen); setTimeout(() => cicdRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}>CI/CD Timeline</button>
          <button className="prod-btn" onClick={() => { setErrorsOpen(!errorsOpen); setTimeout(() => errorsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}>Code Issues</button>
        </div>
      </div>

      <div className="prod-card">
        <div className="prod-main">
          <div className="prod-preview">
            <WebsitePreview />
          </div>

          <div className="prod-info">
            <div className="prod-info-section">
              <div className="prod-info-label">Repository</div>
              <div className="prod-info-value">
                github.com/dhaual125/tech-hack
                <span className="prod-link"><ExternalLinkIcon /></span>
              </div>
            </div>

            <div className="prod-info-section">
              <div className="prod-info-label">Branch URL</div>
              <div className="prod-info-value" style={{ fontSize: "13px", color: "#374151", fontFamily: "monospace" }}>
                TEAM_ALPHA_AYUSH_AI_Fix
              </div>
            </div>

            <div className="prod-info-section">
              <div className="prod-info-label">Team</div>
              <div style={{ fontSize: "13px", color: "#374151" }}>
                <div style={{ marginBottom: "4px" }}><span style={{ fontWeight: "500" }}>Team Leader:</span> Swastik Patel</div>
                <div><span style={{ fontWeight: "500" }}>Members:</span> 4 developers</div>
              </div>
            </div>

            <div className="prod-info-section">
              <div className="prod-info-label">Deployment</div>
              <div style={{ fontSize: "13px", color: "#374151" }}>
                <div style={{ marginBottom: "4px" }}><span style={{ fontWeight: "500" }}>Time:</span> 2m 34s</div>
                <div style={{ marginBottom: "4px" }}><span style={{ fontWeight: "500" }}>Failures:</span> {totalFailures}</div>
                <div><span style={{ fontWeight: "500" }}>Fixes Applied:</span> {fixedIssues.length}</div>
              </div>
            </div>

            <div className="prod-info-row prod-info-section">
              <div>
                <div className="prod-info-label">Status</div>
                <div className="prod-info-value">
                  <span className="prod-status-dot" />
                  Passed
                </div>
              </div>
              <div>
                <div className="prod-info-label">Created</div>
                <div className="prod-info-value">
                  9/15/25 by dhaual125
                </div>
              </div>
            </div>

            <div className="prod-info-section">
              <div className="prod-info-label">Branch Details</div>
              <div className="prod-source-item">
                <GitBranchIcon />
                <span style={{ color: "#374151" }}>main</span>
                <span style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>protected</span>
              </div>
              <div className="prod-source-item">
                <CommitIcon />
                <span style={{ color: "#0ea5e9" }}>19ba3c7</span>&nbsp;&nbsp;first commit
              </div>
            </div>
          </div>

          <div className="prod-activity-btn">
            <ActivityIcon />
          </div>
        </div>

        <div ref={readmeRef} className="prod-settings" onClick={() => setReadmeOpen(!readmeOpen)}>
          <div style={{ transform: readmeOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><ChevronRightIcon /></div>
          <BookIcon />
          <span className="prod-settings-text">README.md</span>
        </div>

        {readmeOpen && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "20px 32px", background: "#fafafa", fontSize: "13px", lineHeight: "1.6", color: "#374151" }}>
            <pre style={{ fontFamily: "'Roboto Mono', monospace", whiteSpace: "pre-wrap", margin: 0 }}>{`# TechHack 2025 - Innovation & Technology Hackathon

## Project Overview
A modern web application built for the TechHack 2025 hackathon.

## Tech Stack
- Frontend: React.js, Vite
- Deployment: Vercel

## Team
- Team Leader: Swastik Patel
- Developers: 4 team members`}</pre>
          </div>
        )}

        <div ref={cicdRef} className="prod-settings" onClick={() => setCicdOpen(!cicdOpen)}>
          <div style={{ transform: cicdOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><ChevronRightIcon /></div>
          <ActivityIcon />
          <span className="prod-settings-text">CI/CD Status Timeline</span>
          <span className="prod-badge" style={{ background: cicdRuns.length > 0 && cicdRuns[cicdRuns.length - 1]?.status === 'passed' ? "#dcfce7" : "#fee2e2", color: cicdRuns.length > 0 && cicdRuns[cicdRuns.length - 1]?.status === 'passed' ? "#166534" : "#991b1b", border: cicdRuns.length > 0 && cicdRuns[cicdRuns.length - 1]?.status === 'passed' ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
            {cicdRuns.length > 0 && cicdRuns[cicdRuns.length - 1]?.status === 'passed' ? 'PASSED' : 'FAILED'}
          </span>
          <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "'Matter', sans-serif", marginLeft: "8px" }}>
            {cicdRuns.length}/{MAX_FIX_ATTEMPTS} iterations
          </span>
        </div>

        {cicdOpen && (
          <div style={{ borderTop: "1px solid #f0f0f0", background: "#fefefe" }}>
            {cicdRuns.map((run, i) => (
              <div key={run.id} style={{ padding: "16px 32px", borderBottom: i < cicdRuns.length - 1 ? "1px solid #f0f0f0" : "none", display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={`status-dot ${run.status === 'passed' ? 'ready' : 'error'}`}></span>
                <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500", minWidth: "80px" }}>Iteration {run.iteration}</span>
                <span style={{ fontSize: "12px", color: "#6b7280", flex: 1 }}>{run.status === 'passed' ? 'All tests passed' : `Build failed`}</span>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>{run.duration}</span>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>{run.timestamp}</span>
              </div>
            ))}
          </div>
        )}

        <div ref={errorsRef} className="prod-settings" onClick={() => setErrorsOpen(!errorsOpen)} style={{ position: "relative", overflow: "hidden" }}>
          {fixingIndex === 'all' && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.2), transparent)", animation: "shimmer 1.5s infinite", zIndex: 0 }} />}
          <div style={{ transform: errorsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", position: "relative", zIndex: 1 }}><ChevronRightIcon /></div>
          <AlertIcon />
          <span className="prod-settings-text">Code Issues</span>
          <span className="prod-badge">10 issues</span>
          <div style={{ flex: 1 }} />
          {totalFixAttempts < MAX_FIX_ATTEMPTS && (
            <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "'Matter', sans-serif", marginRight: "8px" }}>
              {totalFixAttempts}/{MAX_FIX_ATTEMPTS} attempts
            </span>
          )}
          <button onClick={(e) => { e.stopPropagation(); setFixingIndex('all'); setTimeout(() => { const allErrors = [{ severity: "High", file: "src/components/Header.jsx", line: 23, message: "Unused variable 'userData'", oldCode: `const userData = getUserData();
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(true);

return (
  <header className="header">
    <h1>Dashboard</h1>
    <button onClick={() => setIsOpen(!isOpen)}>
      Menu
    </button>
  </header>
);`, newCode: `const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(true);

return (
  <header className="header">
    <h1>Dashboard</h1>
    <button onClick={() => setIsOpen(!isOpen)}>
      Menu
    </button>
  </header>
);` }, { severity: "High", file: "src/utils/api.js", line: 45, message: "Missing error handling", oldCode: `export async function fetchUserData(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);
  const data = await response.json();
  return data;
}

export async function updateUser(userId, updates) {
  const response = await fetch(\`/api/users/\${userId}\`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  return response.json();
}`, newCode: `export async function fetchUserData(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  const data = await response.json();
  return data;
}

export async function updateUser(userId, updates) {
  const response = await fetch(\`/api/users/\${userId}\`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  return response.json();
}` }, { severity: "Medium", file: "src/pages/Dashboard.jsx", line: 12, message: "Component should be memoized", oldCode: `function UserCard({ user, onUpdate }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <button onClick={() => onUpdate(user.id)}>
        Update
      </button>
    </div>
  );
}`, newCode: `import { memo, useCallback } from 'react';

const UserCard = memo(function UserCard({ user, onUpdate }) {
  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString();
  }, []);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <button onClick={() => onUpdate(user.id)}>
        Update
      </button>
    </div>
  );
});` }, { severity: "Medium", file: "src/hooks/useAuth.js", line: 8, message: "Potential memory leak", oldCode: `export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = authService.subscribe((newUser) => {
      setUser(newUser);
      setLoading(false);
    });
    
    authService.checkAuth();
  }, []);

  return { user, loading };
}`, newCode: `export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = authService.subscribe((newUser) => {
      setUser(newUser);
      setLoading(false);
    });
    
    authService.checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}` }, { severity: "Low", file: "src/styles/global.css", line: 156, message: "Unused CSS rule", oldCode: `.unused-class {
  color: red;
}`, newCode: `` }]; const fixedIndices = []; const failedIndices = []; allErrors.forEach((error, idx) => { const success = Math.random() > 0.3; if (success) { fixedIndices.push(idx); } else { failedIndices.push(idx); } }); const allIssues = allErrors.map((error, idx) => ({ id: idx+1, file: error.file, bugType: idx < 2 ? "LINTING" : idx < 4 ? "LOGIC" : "STYLE", line: error.line, message: error.message, oldCode: error.oldCode, newCode: error.newCode })); allIssues.filter((_, idx) => fixedIndices.includes(idx)).forEach(issue => addFixedIssue(deployId, issue)); setStoreFixedButtons(deployId, fixedIndices); setStoreFailedButtons(deployId, failedIndices); setStoreTotalAttempts(deployId, 5); setSettingsOpen(true); setFixingIndex(null); }, 3000); }} className="prod-icon-btn" style={{ background: fixedButtons.includes('all') ? "#dcfce7" : fixingIndex === 'all' ? "#9ca3af" : "#374151", color: fixedButtons.includes('all') ? "#166534" : "white", border: fixedButtons.includes('all') ? "1px solid #bbf7d0" : "none", marginLeft: "8px", position: "relative", overflow: "hidden", zIndex: 2, pointerEvents: fixingIndex === 'all' || fixedButtons.includes('all') || totalFixAttempts >= MAX_FIX_ATTEMPTS ? "none" : "auto", opacity: totalFixAttempts >= MAX_FIX_ATTEMPTS ? 0.5 : 1 }}>
            {fixingIndex === 'all' && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", animation: "shimmer 1.5s infinite" }} />}
            {fixedButtons.includes('all') ? '✓ Fixed' : 'Fix All'}
          </button>
        </div>

        {errorsOpen && (
          <div style={{ borderTop: "1px solid #f0f0f0", background: "#fefefe", position: "relative", overflow: "hidden" }}>
            {fixingIndex === 'all' && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.15), transparent)", animation: "shimmer 1.5s infinite", zIndex: 0 }} />}
            {[{ severity: "High", file: "src/components/Header.jsx", line: 23, message: "Unused variable 'userData'", oldCode: `const userData = getUserData();
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(true);

return (
  <header className="header">
    <h1>Dashboard</h1>
    <button onClick={() => setIsOpen(!isOpen)}>
      Menu
    </button>
  </header>
);`, newCode: `const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(true);

return (
  <header className="header">
    <h1>Dashboard</h1>
    <button onClick={() => setIsOpen(!isOpen)}>
      Menu
    </button>
  </header>
);` }, { severity: "High", file: "src/utils/api.js", line: 45, message: "Missing error handling", oldCode: `export async function fetchUserData(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);
  const data = await response.json();
  return data;
}

export async function updateUser(userId, updates) {
  const response = await fetch(\`/api/users/\${userId}\`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  return response.json();
}`, newCode: `export async function fetchUserData(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  const data = await response.json();
  return data;
}

export async function updateUser(userId, updates) {
  const response = await fetch(\`/api/users/\${userId}\`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  return response.json();
}` }, { severity: "Medium", file: "src/pages/Dashboard.jsx", line: 12, message: "Component should be memoized", oldCode: `function UserCard({ user, onUpdate }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <button onClick={() => onUpdate(user.id)}>
        Update
      </button>
    </div>
  );
}`, newCode: `import { memo, useCallback } from 'react';

const UserCard = memo(function UserCard({ user, onUpdate }) {
  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString();
  }, []);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <button onClick={() => onUpdate(user.id)}>
        Update
      </button>
    </div>
  );
});` }, { severity: "Medium", file: "src/hooks/useAuth.js", line: 8, message: "Potential memory leak", oldCode: `export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = authService.subscribe((newUser) => {
      setUser(newUser);
      setLoading(false);
    });
    
    authService.checkAuth();
  }, []);

  return { user, loading };
}`, newCode: `export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = authService.subscribe((newUser) => {
      setUser(newUser);
      setLoading(false);
    });
    
    authService.checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}` }, { severity: "Low", file: "src/styles/global.css", line: 156, message: "Unused CSS rule", oldCode: `.unused-class {
  color: red;
}`, newCode: `` }].map((error, i) => (
              <div key={i} style={{ borderBottom: i < 4 ? "1px solid #f0f0f0" : "none" }}>
                <div className="prod-settings" style={{ position: "relative", overflow: "hidden", cursor: failedButtons.includes(i) ? "pointer" : "default" }} onClick={() => failedButtons.includes(i) && setExpandedErrors(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}>
                  {fixingIndex === i && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.15), transparent)", animation: "shimmer 1.5s infinite", zIndex: 0 }} />}
                  {failedButtons.includes(i) && <div style={{ transform: expandedErrors.includes(i) ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", position: "relative", zIndex: 1, marginRight: "8px" }}><ChevronRightIcon /></div>}
                  <div style={{ minWidth: "60px", fontWeight: "600", fontSize: "12px", position: "relative", zIndex: 1 }}>{error.severity}</div>
                  <div style={{ minWidth: "200px", fontFamily: "monospace", fontSize: "12px", position: "relative", zIndex: 1 }}>{error.file}</div>
                  <div style={{ minWidth: "40px", fontSize: "12px", position: "relative", zIndex: 1 }}>L{error.line}</div>
                  <div style={{ flex: 1, fontSize: "13px", position: "relative", zIndex: 1 }}>{error.message}</div>
                  <button onClick={(e) => handleFix(i, error, e)} className="prod-icon-btn" style={{ position: "relative", overflow: "hidden", background: fixedButtons.includes(i) ? "#dcfce7" : failedButtons.includes(i) ? "#fee2e2" : fixingIndex === i ? "#9ca3af" : "#fff", color: fixedButtons.includes(i) ? "#166534" : failedButtons.includes(i) ? "#991b1b" : "#6b7280", border: fixedButtons.includes(i) ? "1px solid #bbf7d0" : failedButtons.includes(i) ? "1px solid #fecaca" : "1px solid #e5e7eb", pointerEvents: fixingIndex === i || fixedButtons.includes(i) || totalFixAttempts >= MAX_FIX_ATTEMPTS ? "none" : "auto", opacity: totalFixAttempts >= MAX_FIX_ATTEMPTS && !fixedButtons.includes(i) ? 0.5 : 1 }}>
                    {fixingIndex === i && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)", animation: "shimmer 1.5s infinite" }} />}
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {fixedButtons.includes(i) ? '✓ Fixed' : failedButtons.includes(i) ? '× Retry' : 'Fix'}
                    </span>
                  </button>
                </div>
                {failedButtons.includes(i) && expandedErrors.includes(i) && (
                  <div style={{ padding: "12px 32px", background: "#fef2f2", borderTop: "1px solid #fecaca" }}>
                    <div style={{ fontSize: "12px", color: "#991b1b", fontFamily: "'Matter', sans-serif" }}>
                      <strong>Error:</strong> Failed to apply fix. The code structure may have changed or there might be syntax conflicts. Please review manually.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {fixedIssues.length > 0 && (
          <>
            <div className="prod-settings" onClick={() => setSettingsOpen(!settingsOpen)}>
              <div style={{ transform: settingsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><ChevronRightIcon /></div>
              <CheckIcon />
              <span className="prod-settings-text">Fixes Applied</span>
              <span className="prod-badge" style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}>{fixedIssues.length} fixed</span>
            </div>

            {settingsOpen && (
              <div style={{ borderTop: "1px solid #f0f0f0", background: "#fefefe", padding: "16px 32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "200px 120px 80px 300px 80px", gap: "12px", padding: "12px 0", borderBottom: "2px solid #e5e7eb", fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>
                  <div>File</div><div>Bug Type</div><div>Line</div><div>Commit Message</div><div>Status</div>
                </div>
                {fixedIssues.map((fix, i) => (
                  <div key={i}>
                    <div style={{ display: "grid", gridTemplateColumns: "200px 120px 80px 300px 80px", gap: "12px", padding: "16px 0", borderBottom: "1px solid #f1f5f9", fontSize: "13px", alignItems: "center" }}>
                      <div style={{ fontFamily: "monospace", fontSize: "12px" }}>{fix.file}</div>
                      <div style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", textAlign: "center" }}>{fix.bugType}</div>
                      <div style={{ fontFamily: "monospace" }}>L{fix.line}</div>
                      <div style={{ fontSize: "12px" }}>Fix {fix.bugType.toLowerCase()} issue</div>
                      <div style={{ color: "#16a34a", fontWeight: "500" }}>✓ Fixed</div>
                    </div>
                    <div style={{ padding: "20px 0", borderBottom: i < fixedIssues.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                      <CodeDiff oldCode={fix.oldCode} newCode={fix.newCode} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {limitModal && (
        <div className="agent-loading-backdrop" onClick={() => setLimitModal(false)}>
          <div className="agent-loading-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px", padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111", margin: "0 0 12px", fontFamily: "'Season Mix', sans-serif" }}>Fix Limit Reached</h3>
              <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", margin: "0 0 8px", fontFamily: "'Matter', sans-serif" }}>
                You've reached the maximum of <strong>5/5 attempts</strong> for this commit.
              </p>
              <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", margin: "0", fontFamily: "'Matter', sans-serif" }}>
                Please recommit the code from your local machine with manual fixes.
              </p>
            </div>
            <div style={{ padding: "16px 24px", background: "#fafafa", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "center" }}>
              <button onClick={() => setLimitModal(false)} style={{ padding: "10px 24px", background: "#111", border: "none", borderRadius: "6px", color: "#fff", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Matter', sans-serif" }}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
