import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './ProjectMetadata.css';

export const ProjectMetadata = ({ project }) => {
  const { metadata } = project;
  
  // Cap total score at 100
  const displayScore = Math.min(metadata.totalScore, 100);

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
            <div className="score-chart-wrapper">
              <CircularProgressbar
                value={displayScore}
                text={`${displayScore}`}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: displayScore >= 100 ? '#10b981' : '#4f46e5',
                  textColor: '#111',
                  trailColor: '#f0f0f0',
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            <div className="score-max">out of 100</div>
          </div>

          <div className="score-breakdown">
            <div className="breakdown-row">
              <span className="breakdown-label">Base Score</span>
              <span className="breakdown-value">{metadata.baseScore}</span>
            </div>
            <div className="breakdown-row positive">
              <span className="breakdown-label">Speed Bonus</span>
              <span className="breakdown-value">+{metadata.speedBonus}</span>
            </div>
            <div className="breakdown-row negative">
              <span className="breakdown-label">Efficiency Penalty</span>
              <span className="breakdown-value">{metadata.efficiencyPenalty}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
