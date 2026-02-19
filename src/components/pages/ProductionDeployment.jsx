import { useState } from "react";
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

const WebsitePreview = () => (
  <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", boxSizing: "border-box" }}>
    <div style={{ fontSize: "64px", fontWeight: "300", color: "#111", lineHeight: 1, fontFamily: "'Season Mix', sans-serif", marginBottom: "6px" }}>85</div>
    <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "400", marginBottom: "32px", fontFamily: "'Matter', sans-serif" }}>Quality Score</div>
    
    <div style={{ width: "100%", maxWidth: "100%", paddingLeft: "16px", paddingRight: "16px", boxSizing: "border-box" }}>
      {[{ label: "Critical", count: 0 }, { label: "High", count: 2 }, { label: "Medium", count: 5 }, { label: "Low", count: 3 }].map((issue, i) => (
        <div key={i} style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#374151", fontWeight: "400", fontFamily: "'Matter', sans-serif" }}>{issue.label}</span>
            <span style={{ fontSize: "12px", color: "#111", fontWeight: "500", fontFamily: "'Matter', sans-serif" }}>{issue.count}</span>
          </div>
          <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden", width: "100%" }}>
            <div style={{ width: `${issue.count * 10}%`, height: "100%", background: "#111", borderRadius: "3px", transition: "width 0.3s ease" }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function ProductionDeployment() {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [fixedIssues, setFixedIssues] = useState([]);

  return (
    <div className="production-deployment">
      <div className="prod-header">
        <h1 className="prod-title">Production Deployment</h1>
        <div className="prod-actions">
          {["Build Logs", "Runtime Logs"].map(label => (
            <button key={label} className="prod-btn">{label}</button>
          ))}
          <button className="prod-btn">
            <RefreshIcon />
            Instant Rollback
          </button>
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

        <div className="prod-settings" onClick={() => setReadmeOpen(!readmeOpen)}>
          <div style={{ transform: readmeOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><ChevronRightIcon /></div>
          <BookIcon />
          <span className="prod-settings-text">README.md</span>
        </div>

        {readmeOpen && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "20px 32px", background: "#fafafa", fontSize: "13px", lineHeight: "1.6", color: "#374151" }}>
            <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", margin: 0 }}>{`# TechHack 2025 - Innovation & Technology Hackathon

## 🚀 Project Overview
A modern web application built for the TechHack 2025 hackathon.

## 🛠️ Tech Stack
- Frontend: React.js, Vite
- Deployment: Vercel

## 👥 Team
- Team Leader: Swastik Patel
- Developers: 4 team members`}</pre>
          </div>
        )}

        <div className="prod-settings" onClick={() => setErrorsOpen(!errorsOpen)}>
          <div style={{ transform: errorsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><ChevronRightIcon /></div>
          <AlertIcon />
          <span className="prod-settings-text">Code Issues</span>
          <span className="prod-badge">10 issues</span>
          <div style={{ flex: 1 }} />
          <button onClick={(e) => { e.stopPropagation(); setFixedIssues([{ id: 1, file: "src/components/Header.jsx", bugType: "LINTING", line: 23, message: "Unused variable", oldCode: `const userData = getUserData();
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
);` }, { id: 2, file: "src/utils/api.js", bugType: "LOGIC", line: 45, message: "Missing error handling", oldCode: `export async function fetchUserData(userId) {
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
}` }, { id: 3, file: "src/pages/Dashboard.jsx", bugType: "PERFORMANCE", line: 12, message: "Component should be memoized", oldCode: `function UserCard({ user, onUpdate }) {
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
});` }, { id: 4, file: "src/hooks/useAuth.js", bugType: "MEMORY", line: 8, message: "Potential memory leak", oldCode: `export function useAuth() {
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
}` }]); setSettingsOpen(true); }} className="prod-icon-btn" style={{ background: "#374151", color: "white", marginLeft: "8px" }}>Fix All</button>
        </div>

        {errorsOpen && (
          <div style={{ borderTop: "1px solid #f0f0f0", background: "#fefefe" }}>
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
              <div key={i} className="prod-settings" style={{ borderBottom: i < 4 ? "1px solid #f0f0f0" : "none" }}>
                <div style={{ minWidth: "60px", fontWeight: "600", fontSize: "12px" }}>{error.severity}</div>
                <div style={{ minWidth: "200px", fontFamily: "monospace", fontSize: "12px" }}>{error.file}</div>
                <div style={{ minWidth: "40px", fontSize: "12px" }}>L{error.line}</div>
                <div style={{ flex: 1, fontSize: "13px" }}>{error.message}</div>
                <button onClick={(e) => { e.stopPropagation(); setFixedIssues(prev => [...prev, { id: i+1, file: error.file, bugType: i < 2 ? "LINTING" : i < 4 ? "LOGIC" : "STYLE", line: error.line, message: error.message, oldCode: error.oldCode, newCode: error.newCode }]); setSettingsOpen(true); }} className="prod-icon-btn">Fix</button>
              </div>
            ))}
          </div>
        )}

        <div className="prod-settings" onClick={() => setSettingsOpen(!settingsOpen)}>
          <div style={{ transform: settingsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><ChevronRightIcon /></div>
          {fixedIssues.length > 0 ? <CheckIcon /> : <ListIcon />}
          <span className="prod-settings-text">{fixedIssues.length > 0 ? "Fixes Applied" : "Fixes Table"}</span>
          <span className="prod-badge" style={fixedIssues.length > 0 ? { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" } : {}}>{fixedIssues.length > 0 ? `${fixedIssues.length} fixed` : "4 pending"}</span>
        </div>

        {settingsOpen && (
          <div style={{ borderTop: "1px solid #f0f0f0", background: "#fefefe", padding: "16px 32px" }}>
            {fixedIssues.length > 0 ? (
              <>
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
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "200px 100px 60px 1fr 80px", gap: "16px", padding: "12px 0", borderBottom: "2px solid #e5e7eb", fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>
                  <div>File</div><div>Bug Type</div><div>Line</div><div>Message</div><div>Status</div>
                </div>
                {[{ file: "src/components/Header.jsx", bugType: "LINTING", line: 23, message: "Unused variable", status: "Pending", oldCode: `const userData = getUserData();
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
);` }, { file: "src/utils/api.js", bugType: "LOGIC", line: 45, message: "Missing error handling", status: "Pending", oldCode: `export async function fetchUserData(userId) {
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
}` }, { file: "src/pages/Dashboard.jsx", bugType: "PERFORMANCE", line: 12, message: "Component should be memoized", status: "Pending", oldCode: `function UserCard({ user, onUpdate }) {
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
});` }, { file: "src/hooks/useAuth.js", bugType: "MEMORY", line: 8, message: "Potential memory leak", status: "Pending", oldCode: `export function useAuth() {
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
}` }].map((fix, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 100px 60px 1fr 80px", gap: "16px", padding: "14px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none", fontSize: "13px", alignItems: "center" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "12px" }}>{fix.file}</div>
                    <div style={{ background: "#f3f4f6", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", textAlign: "center" }}>{fix.bugType}</div>
                    <div style={{ fontFamily: "monospace" }}>L{fix.line}</div>
                    <div>{fix.message}</div>
                    <button onClick={(e) => { e.stopPropagation(); setFixedIssues(prev => [...prev, { id: i+1, file: fix.file, bugType: fix.bugType, line: fix.line, message: fix.message, oldCode: fix.oldCode, newCode: fix.newCode }]); }} className="prod-icon-btn">Fix</button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
