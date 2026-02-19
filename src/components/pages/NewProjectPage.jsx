import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, File, CaretRight, CaretDown } from 'phosphor-react';
import { Skeleton } from '../ui/Skeleton';
import { VoiceCard } from './VoiceCard';
import { AgentLoadingScreen } from '../ui/AgentLoadingScreen';
import { VOICE_TABS, GITHUB_REPOS } from '../../constants';
import './NewProjectPage.css';

const MOCK_FILE_STRUCTURE = [
  { name: 'src', type: 'folder', children: [
    { name: 'components', type: 'folder', children: [
      { name: 'Button.jsx', type: 'file' },
      { name: 'Input.jsx', type: 'file' },
    ]},
    { name: 'App.jsx', type: 'file' },
    { name: 'index.js', type: 'file' },
  ]},
  { name: 'public', type: 'folder', children: [
    { name: 'index.html', type: 'file' },
  ]},
  { name: 'package.json', type: 'file' },
  { name: 'README.md', type: 'file' },
];

const FileTreeItem = ({ item, level = 0, onFileClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.type === 'file') {
    return (
      <div className="file-tree-item file-item" style={{ paddingLeft: `${level * 20 + 24}px` }} onClick={() => onFileClick(item.name)}>
        <File size={18} weight="fill" color="#9ca3af" />
        <span className="file-name">{item.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="file-tree-item folder-item" style={{ paddingLeft: `${level * 20 + 24}px` }} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <CaretDown size={16} weight="regular" color="#6b7280" /> : <CaretRight size={16} weight="regular" color="#6b7280" />}
        <Folder size={18} weight="fill" color="#6b7280" />
        <span className="file-name">{item.name}</span>
      </div>
      {isOpen && item.children?.map((child, i) => (
        <FileTreeItem key={i} item={child} level={level + 1} onFileClick={onFileClick} />
      ))}
    </div>
  );
};

export const NewProjectPage = () => {
  const navigate = useNavigate();
  const [voiceTab, setVoiceTab] = useState("Import from GitHub");
  const [loading, setLoading] = useState(true);
  const [githubRepo, setGithubRepo] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [showFileTree, setShowFileTree] = useState(false);
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [errors, setErrors] = useState({ githubRepo: false, teamName: false, teamLeader: false });
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const githubInputRef = useRef(null);

  useEffect(() => {
    const handleOpenMobileRepos = () => setMobileSidebarOpen(true);
    window.addEventListener('openMobileRepos', handleOpenMobileRepos);
    return () => window.removeEventListener('openMobileRepos', handleOpenMobileRepos);
  }, []);

  const isValidGithubUrl = githubRepo.startsWith('https://github.com/');

  const handleRunAgent = () => {
    const newErrors = {
      githubRepo: !githubRepo.trim() || !isValidGithubUrl || !showFileTree,
      teamName: !teamName.trim(),
      teamLeader: !teamLeader.trim(),
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setIsRunningAgent(true);
  };

  const handleAgentComplete = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    navigate(`/deploy/project-alpha/${randomId}`);
  };

  const handleFetch = () => {
    setFetchingFiles(true);
    setTimeout(() => {
      setFetchingFiles(false);
      setShowFileTree(true);
      setErrors(prev => ({ ...prev, githubRepo: false }));
    }, 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="tts-page">
        <div className="tts-left-panel">
          <Skeleton width="100%" height="300px" borderRadius="12px" />
          <Skeleton width="100%" height="50px" borderRadius="8px" />
          <Skeleton width="100%" height="50px" borderRadius="8px" />
          <Skeleton width="100%" height="50px" borderRadius="8px" />
        </div>
        <div className="tts-right-panel">
          <div className="voice-tabs">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} width="120px" height="38px" borderRadius="999px" />
            ))}
          </div>
          <div className="voice-list" style={{ padding: '20px' }}>
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} width="100%" height="80px" borderRadius="12px" style={{ marginBottom: '12px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isRunningAgent && <AgentLoadingScreen onComplete={handleAgentComplete} />}
      
      {mobileSidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sidebar-header">
              <div className="voice-tab-title">Import from GitHub</div>
              <button className="mobile-sidebar-close" onClick={() => setMobileSidebarOpen(false)}>✕</button>
            </div>
            <div className="voice-list">
              {GITHUB_REPOS.map(repo => (
                <VoiceCard
                  key={repo.name}
                  repo={repo}
                  onSelect={() => {
                    setGithubRepo(repo.url);
                    setMobileSidebarOpen(false);
                    githubInputRef.current?.focus();
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="tts-page">
        <div className="tts-left-panel">
          <div className={`textarea-card ${showFileTree || fetchingFiles ? 'file-tree-active' : ''} ${fetchingFiles ? 'skeleton' : ''}`}>
            {!showFileTree && !fetchingFiles ? (
              <>
                <svg width="200" height="200" viewBox="0 0 903 895" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', opacity: 0.1 }}>
                  <path d="M451.01 873.19C469.316 880.341 488.271 884.433 507.216 885.643C470.693 897.058 431.329 897.058 394.807 885.644C413.75 884.433 432.704 880.34 451.01 873.19ZM282.316 856.278C300.932 859.973 320.31 860.885 339.859 858.678C355.676 870.283 372.917 879.101 390.899 885.133C352.64 886.785 314.616 876.68 282.316 856.278ZM619.702 856.279C587.403 876.68 549.38 886.784 511.122 885.132C529.104 879.101 546.344 870.283 562.16 858.678C581.709 860.885 601.087 859.973 619.702 856.279Z" stroke="#F5F5F5" strokeOpacity="0.15" strokeWidth="0.7168" />
                </svg>
                <button className="get-started-btn" onClick={() => {
                  githubInputRef.current?.focus();
                }}>
                  Get Started
                </button>
              </>
            ) : fetchingFiles ? null : (
              <div className="file-tree-container">
                {MOCK_FILE_STRUCTURE.map((item, i) => (
                  <FileTreeItem key={i} item={item} onFileClick={(name) => console.log('Open file:', name)} />
                ))}
              </div>
            )}
          </div>

          <div className="control-group">
            <div className="control-label">GitHub Repo</div>
            <div className="input-with-button">
              <input
                ref={githubInputRef}
                type="text"
                value={githubRepo}
                onChange={e => setGithubRepo(e.target.value)}
                placeholder="https://github.com/username/repository"
                className={`control-input ${errors.githubRepo ? 'error' : ''}`}
              />
              {isValidGithubUrl && (
                <button className="fetch-btn" onClick={handleFetch}>
                  Fetch
                </button>
              )}
            </div>
          </div>

          <div className="control-group">
            <div className="control-label">Team Name</div>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className={`control-input ${errors.teamName ? 'error' : ''}`}
            />
          </div>

          <div className="control-group">
            <div className="control-label">Team Leader Name</div>
            <input
              type="text"
              value={teamLeader}
              onChange={e => setTeamLeader(e.target.value)}
              placeholder="Enter team leader name"
              className={`control-input ${errors.teamLeader ? 'error' : ''}`}
            />
          </div>

          <button className="run-agent-btn" onClick={handleRunAgent}>Run Agent</button>
          <button className="mobile-repos-btn" onClick={() => setMobileSidebarOpen(true)}>Browse GitHub Repos</button>
        </div>

        <div className="tts-right-panel">
          <div className="voice-tabs">
            <div className="voice-tab-title">Import from GitHub: Ayush91225</div>
          </div>

          <div className="voice-list">
            {GITHUB_REPOS.map(repo => (
              <VoiceCard
                key={repo.name}
                repo={repo}
                onSelect={() => {
                  setGithubRepo(repo.url);
                  githubInputRef.current?.focus();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
