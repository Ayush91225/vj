import { useEffect, memo, useCallback } from 'react';
import { Skeleton } from '../ui/Skeleton';
import { ProjectMetadata } from './ProjectMetadata';
import { useProjectStore } from '../../store';
import './ProjectsPage.css';

export const ProjectsPage = memo(function ProjectsPage({ searchQuery }) {
  const { 
    loading, 
    selectedProject, 
    setSelectedProject, 
    fetchProjects, 
    getFilteredProjects 
  } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredCards = getFilteredProjects(searchQuery);

  const handleCardClick = useCallback((card) => {
    setSelectedProject(card);
  }, [setSelectedProject]);

  const handleLinkClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="billing-page">
      <div className="credits-scroll-container">
        <div className="credits-cards">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="credits-card skeleton-card" aria-busy="true">
                <Skeleton width="120px" height="48px" borderRadius="8px" />
                <Skeleton width="100px" height="20px" borderRadius="6px" />
                <Skeleton width="100%" height="6px" borderRadius="999px" />
                <Skeleton width="140px" height="16px" borderRadius="6px" />
              </div>
            ))
          ) : (
            filteredCards.map(card => (
              <button
                key={card.id}
                className="credits-card"
                onClick={() => handleCardClick(card)}
                aria-label={`Select ${card.amount} project`}
              >
                <div className="credits-amount">{card.amount}</div>
                <div className="credits-label">{card.label}</div>
                <a 
                  href={card.repo} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="repo-link"
                  onClick={handleLinkClick}
                  aria-label={`View ${card.amount} repository on GitHub`}
                >
                  {card.repo}
                </a>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="billing-tabs">
        <div className="billing-tab active" role="tab" aria-selected="true">Project Info</div>
      </div>

      {!selectedProject ? (
        <div className="empty-state" role="status">
          <img 
            src="https://dashboard.sarvam.ai/assets/empty-table.webp" 
            alt="No project selected" 
            className="empty-image"
          />
          <div className="empty-title">No project selected</div>
          <div className="empty-desc">
            Your project details will appear here once you select or create a project.
          </div>
        </div>
      ) : (
        <ProjectMetadata project={selectedProject} loading={loading} />
      )}
    </div>
  );
});
