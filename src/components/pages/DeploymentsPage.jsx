import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';
import { useProjectStore, useAuthStore } from '../../store';
import { backendApi } from '../../services/backendApi';
import './DeploymentsPage.css';

export const DeploymentsPage = ({ searchQuery }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, fetchProjects, loading: projectsLoading } = useProjectStore();
  const { token } = useAuthStore();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!projectId || projects.length === 0) {
      setLoading(false);
      return;
    }

    const fetchCommits = async () => {
      setLoading(true);
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        console.log('[DeploymentsPage] Project not found:', projectId);
        setLoading(false);
        return;
      }

      console.log('[DeploymentsPage] Fetching commits for project:', project);
      try {
        const response = await fetch('https://7qwlci3xodqqlvvtupdlhrcume0xntdd.lambda-url.ap-south-1.on.aws/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query GetCommits($githubRepo: String!, $branch: String, $token: String) { getCommits(githubRepo: $githubRepo, branch: $branch, token: $token) { sha message author date url } }`,
            variables: { githubRepo: project.repo, branch: project.metadata.branchName || 'main', token }
          })
        });
        const result = await response.json();
        console.log('[DeploymentsPage] Commits response:', result);
        if (result.data?.getCommits) {
          setCommits(result.data.getCommits);
          console.log('[DeploymentsPage] Set commits:', result.data.getCommits);
        }
      } catch (error) {
        console.error('[DeploymentsPage] Failed to fetch commits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [projectId, projects]);

  const filteredProjects = projects.filter(project => 
    !projectId && (
      project.amount.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      project.label.toLowerCase().includes((searchQuery || '').toLowerCase())
    )
  );

  const displayProjects = projectId ? projects : filteredProjects;

  const selectedProject = projects.find(p => p.id === projectId);
  
  const filteredDeployments = commits.filter(commit =>
    commit.sha.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    commit.message.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    commit.author.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="deployments-page">
      <div className="projects-scroll-container">
        <div className="projects-cards">
          {projectsLoading ? (
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
                <div className="project-name">{project.amount}</div>
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
          onClick={() => projectId && commits[0] && navigate(`/deploy/${projectId}/${commits[0].sha}`)}
          style={{ cursor: projectId ? 'pointer' : 'default' }}
        >
          Deployment History
        </div>
      </div>

      {loading || (projectId && commits.length === 0) ? (
        <div className="deployments-list">
          {[...Array(4)].map((_, i) => (
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
          ))}
        </div>
      ) : filteredDeployments.length === 0 ? (
        <div className="empty-state">
          <img 
            src="https://dashboard.sarvam.ai/assets/empty-table.webp" 
            alt="No deployments" 
            className="empty-image"
          />
          <div className="empty-title">No commits found</div>
          <div className="empty-desc">
            No commits match your search criteria.
          </div>
        </div>
      ) : (
        <div className="deployments-list">
          {filteredDeployments.map(commit => (
            <div 
              key={commit.sha} 
              className="deployment-row"
              onClick={() => navigate(`/deploy/${projectId}/${commit.sha}`)}
            >
              <div className="deployment-left">
                <div className="deployment-commit">
                  <code className="commit-hash">{commit.sha.substring(0, 7)}</code>
                  <span className="commit-message">{commit.message}</span>
                </div>
                <div className="deployment-info">
                  <span className="deployment-branch">{selectedProject?.metadata.branchName || 'main'}</span>
                  <span className="deployment-time">{new Date(commit.date).toLocaleDateString()}</span>
                  <span className="deployment-duration">{commit.author}</span>
                </div>
              </div>
              <div className="deployment-right">
                <span className="status-dot ready"></span>
                <span className="status-text">Ready</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
