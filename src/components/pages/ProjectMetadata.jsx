import './ProjectMetadata.css';

export const ProjectMetadata = ({ project }) => {
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
    </div>
  );
};
