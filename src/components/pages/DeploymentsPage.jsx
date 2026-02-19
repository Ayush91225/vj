import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';
import './DeploymentsPage.css';

const PROJECTS = [
  { id: 'project-alpha', name: 'Project Alpha', label: 'Ayush91225', repo: 'https://github.com/Ayush91225/project-alpha' },
  { id: 'project-beta', name: 'Project Beta', label: 'Ayush91225', repo: 'https://github.com/Ayush91225/project-beta' },
  { id: 'project-gamma', name: 'Project Gamma', label: 'Ayush91225', repo: 'https://github.com/Ayush91225/project-gamma' },
  { id: 'project-delta', name: 'Project Delta', label: 'Ayush91225', repo: 'https://github.com/Ayush91225/project-delta' },
  { id: 'project-epsilon', name: 'Project Epsilon', label: 'Ayush91225', repo: 'https://github.com/Ayush91225/project-epsilon' },
  { id: 'project-zeta', name: 'Project Zeta', label: 'Ayush91225', repo: 'https://github.com/Ayush91225/project-zeta' },
];

const DEPLOYMENTS = {
  'project-alpha': [
    { id: 1, commit: 'a3f2c1d', message: 'Fix: Resolved authentication bug', status: 'ready', time: '2h ago', duration: '4m 32s', branch: 'main' },
    { id: 2, commit: 'b7e9f2a', message: 'Refactor: Improved code structure', status: 'ready', time: '1d ago', duration: '3m 45s', branch: 'main' },
    { id: 3, commit: 'c9d4e1b', message: 'WIP: Testing new feature', status: 'error', time: '2d ago', duration: '2m 10s', branch: 'dev' },
    { id: 4, commit: 'd2a8c5f', message: 'Feature: Added new dashboard', status: 'ready', time: '3d ago', duration: '5m 20s', branch: 'main' },
  ],
  'project-beta': [
    { id: 1, commit: 'e5f3b9c', message: 'Hotfix: Critical security patch', status: 'ready', time: '5h ago', duration: '6m 15s', branch: 'main' },
    { id: 2, commit: 'f1c7d4e', message: 'Update: Dependencies upgraded', status: 'ready', time: '3d ago', duration: '5m 30s', branch: 'main' },
  ],
};

export const DeploymentsPage = ({ searchQuery }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [projectId]);

  const filteredProjects = PROJECTS.filter(project => 
    !projectId && (
      project.name.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      project.label.toLowerCase().includes((searchQuery || '').toLowerCase())
    )
  );

  const displayProjects = projectId ? PROJECTS : filteredProjects;

  const selectedProject = PROJECTS.find(p => p.id === projectId);
  const allDeployments = projectId ? DEPLOYMENTS[projectId] || [] : [];
  
  const filteredDeployments = allDeployments.filter(deployment =>
    deployment.commit.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    deployment.message.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    deployment.branch.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="deployments-page">
      <div className="projects-scroll-container">
        <div className="projects-cards">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="project-card skeleton-card">
                <Skeleton width="120px" height="32px" borderRadius="8px" />
                <Skeleton width="100px" height="16px" borderRadius="6px" />
              </div>
            ))
          ) : (
            displayProjects.map(project => (
              <div 
                key={project.id} 
                className={`project-card ${projectId === project.id ? 'selected' : ''}`}
                onClick={() => navigate(`/deploy/${project.id}`)}
              >
                <div className="project-name">{project.name}</div>
                <div className="project-label">{project.label}</div>
                <a 
                  href={project.repo} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="project-repo-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {project.repo}
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="deployments-tabs">
        <div 
          className="deployments-tab active" 
          onClick={() => projectId && navigate(`/deploy/${projectId}/${allDeployments[0]?.commit || 'production'}`)}
          style={{ cursor: projectId ? 'pointer' : 'default' }}
        >
          Deployment History
        </div>
      </div>

      {!projectId ? (
        <div className="empty-state">
          <img 
            src="https://dashboard.sarvam.ai/assets/empty-table.webp" 
            alt="No project selected" 
            className="empty-image"
          />
          <div className="empty-title">No project selected</div>
          <div className="empty-desc">
            Select a project to view its deployment history and details.
          </div>
        </div>
      ) : filteredDeployments.length === 0 ? (
        <div className="empty-state">
          <img 
            src="https://dashboard.sarvam.ai/assets/empty-table.webp" 
            alt="No deployments" 
            className="empty-image"
          />
          <div className="empty-title">No deployments found</div>
          <div className="empty-desc">
            No deployments match your search criteria.
          </div>
        </div>
      ) : (
        <div className="deployments-list">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="deployment-row" style={{ cursor: 'default' }}>
                <div className="deployment-left" style={{ flex: 1 }}>
                  <div className="deployment-commit" style={{ marginBottom: '8px' }}>
                    <Skeleton width="80px" height="16px" borderRadius="4px" style={{ marginRight: '12px' }} />
                    <Skeleton width="250px" height="16px" borderRadius="4px" />
                  </div>
                  <div className="deployment-info" style={{ display: 'flex', gap: '12px' }}>
                    <Skeleton width="60px" height="14px" borderRadius="4px" />
                    <Skeleton width="50px" height="14px" borderRadius="4px" />
                    <Skeleton width="50px" height="14px" borderRadius="4px" />
                  </div>
                </div>
                <div className="deployment-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Skeleton width="8px" height="8px" borderRadius="50%" />
                  <Skeleton width="50px" height="14px" borderRadius="4px" />
                </div>
              </div>
            ))
          ) : (
            filteredDeployments.map(deployment => (
              <div 
                key={deployment.id} 
                className="deployment-row"
                onClick={() => navigate(`/deploy/${projectId}/${deployment.commit}`)}
              >
                <div className="deployment-left">
                  <div className="deployment-commit">
                    <code className="commit-hash">{deployment.commit}</code>
                    <span className="commit-message">{deployment.message}</span>
                  </div>
                  <div className="deployment-info">
                    <span className="deployment-branch">{deployment.branch}</span>
                    <span className="deployment-time">{deployment.time}</span>
                    <span className="deployment-duration">{deployment.duration}</span>
                  </div>
                </div>
                <div className="deployment-right">
                  <span className={`status-dot ${deployment.status}`}></span>
                  <span className="status-text">{deployment.status === 'ready' ? 'Ready' : 'Error'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
