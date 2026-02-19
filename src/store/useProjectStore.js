import { create } from 'zustand';
import { TIMEOUTS, LIMITS } from '../constants/config';
import { backendApi } from '../services/backendApi';

const MOCK_PROJECTS = [
  { 
    id: 1, 
    amount: 'Project Alpha', 
    label: 'Ayush91225', 
    repo: 'https://github.com/Ayush91225/project-alpha', 
    color: '#4f46e5',
    metadata: {
      repoUrl: 'https://github.com/Ayush91225/project-alpha',
      branchUrl: 'https://github.com/Ayush91225/project-alpha/tree/TEAM_ALPHA_AYUSH_AI_Fix',
      teamName: 'Team Alpha',
      teamLeader: 'Ayush Kumar',
      failuresDetected: 12,
      fixesApplied: 10,
      cicdStatus: 'PASSED',
      deploymentTime: '4m 32s',
      baseScore: 100,
      speedBonus: 10,
      efficiencyPenalty: 0,
      totalScore: 110,
      lastCommitMessage: 'Fix: Resolved authentication bug',
      lastCommitId: 'a3f2c1d',
      commits: 18
    }
  },
  { 
    id: 2, 
    amount: 'Project Beta', 
    label: 'Ayush91225', 
    repo: 'https://github.com/Ayush91225/project-beta', 
    color: '#10b981',
    metadata: {
      repoUrl: 'https://github.com/Ayush91225/project-beta',
      branchUrl: 'https://github.com/Ayush91225/project-beta/tree/TEAM_BETA_AYUSH_AI_Fix',
      teamName: 'Team Beta',
      teamLeader: 'Ayush Kumar',
      failuresDetected: 8,
      fixesApplied: 8,
      cicdStatus: 'PASSED',
      deploymentTime: '6m 15s',
      baseScore: 100,
      speedBonus: 0,
      efficiencyPenalty: -4,
      totalScore: 96,
      lastCommitMessage: 'Refactor: Improved code structure',
      lastCommitId: 'b7e9f2a',
      commits: 22
    }
  },
  { 
    id: 3, 
    amount: 'Project Gamma', 
    label: 'Ayush91225', 
    repo: 'https://github.com/Ayush91225/project-gamma', 
    color: '#f59e0b',
    metadata: {
      repoUrl: 'https://github.com/Ayush91225/project-gamma',
      branchUrl: 'https://github.com/Ayush91225/project-gamma/tree/TEAM_GAMMA_AYUSH_AI_Fix',
      teamName: 'Team Gamma',
      teamLeader: 'Ayush Kumar',
      failuresDetected: 15,
      fixesApplied: 12,
      cicdStatus: 'FAILED',
      deploymentTime: '8m 45s',
      baseScore: 100,
      speedBonus: 0,
      efficiencyPenalty: -8,
      totalScore: 92,
      lastCommitMessage: 'WIP: Testing new feature',
      lastCommitId: 'c9d4e1b',
      commits: 24
    }
  },
  { 
    id: 4, 
    amount: 'Project Delta', 
    label: 'Ayush91225', 
    repo: 'https://github.com/Ayush91225/project-delta', 
    color: '#8b5cf6',
    metadata: {
      repoUrl: 'https://github.com/Ayush91225/project-delta',
      branchUrl: 'https://github.com/Ayush91225/project-delta/tree/TEAM_DELTA_AYUSH_AI_Fix',
      teamName: 'Team Delta',
      teamLeader: 'Ayush Kumar',
      failuresDetected: 5,
      fixesApplied: 5,
      cicdStatus: 'PASSED',
      deploymentTime: '3m 20s',
      baseScore: 100,
      speedBonus: 10,
      efficiencyPenalty: 0,
      totalScore: 110,
      lastCommitMessage: 'Feature: Added new dashboard',
      lastCommitId: 'd2a8c5f',
      commits: 15
    }
  },
  { 
    id: 5, 
    amount: 'Project Epsilon', 
    label: 'Ayush91225', 
    repo: 'https://github.com/Ayush91225/project-epsilon', 
    color: '#ef4444',
    metadata: {
      repoUrl: 'https://github.com/Ayush91225/project-epsilon',
      branchUrl: 'https://github.com/Ayush91225/project-epsilon/tree/TEAM_EPSILON_AYUSH_AI_Fix',
      teamName: 'Team Epsilon',
      teamLeader: 'Ayush Kumar',
      failuresDetected: 20,
      fixesApplied: 18,
      cicdStatus: 'FAILED',
      deploymentTime: '12m 30s',
      baseScore: 100,
      speedBonus: 0,
      efficiencyPenalty: -12,
      totalScore: 88,
      lastCommitMessage: 'Hotfix: Critical security patch',
      lastCommitId: 'e5f3b9c',
      commits: 26
    }
  },
  { 
    id: 6, 
    amount: 'Project Zeta', 
    label: 'Ayush91225', 
    repo: 'https://github.com/Ayush91225/project-zeta', 
    color: '#06b6d4',
    metadata: {
      repoUrl: 'https://github.com/Ayush91225/project-zeta',
      branchUrl: 'https://github.com/Ayush91225/project-zeta/tree/TEAM_ZETA_AYUSH_AI_Fix',
      teamName: 'Team Zeta',
      teamLeader: 'Ayush Kumar',
      failuresDetected: 10,
      fixesApplied: 9,
      cicdStatus: 'PASSED',
      deploymentTime: '5m 50s',
      baseScore: 100,
      speedBonus: 0,
      efficiencyPenalty: -2,
      totalScore: 98,
      lastCommitMessage: 'Update: Dependencies upgraded',
      lastCommitId: 'f1c7d4e',
      commits: 21
    }
  },
];

export const useProjectStore = create((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  
  setSelectedProject: (project) => set({ selectedProject: project }),
  
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const token = backendApi.getToken();
      if (!token) {
        set({ projects: [], loading: false });
        return;
      }

      const dbProjects = await backendApi.getProjects(token);
      
      // Transform DynamoDB projects to match UI format
      const transformedProjects = dbProjects.map((p, index) => ({
        id: p.project_id,
        amount: p.team_name || `Project ${index + 1}`,
        label: p.team_leader || 'Unknown',
        repo: p.github_repo,
        color: ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][index % 6],
        metadata: {
          repoUrl: p.github_repo,
          branchUrl: `${p.github_repo}/tree/${p.branch_name}`,
          teamName: p.team_name,
          teamLeader: p.team_leader,
          status: p.status,
          createdAt: p.created_at,
          branchName: p.branch_name,
          failuresDetected: 0,
          fixesApplied: 0,
          cicdStatus: p.status === 'completed' ? 'PASSED' : 'PENDING',
          deploymentTime: '0m 0s',
          baseScore: 100,
          speedBonus: 0,
          efficiencyPenalty: 0,
          totalScore: 100,
          lastCommitMessage: 'Initial commit',
          lastCommitId: 'pending',
          commits: 0
        }
      }));

      set({ projects: transformedProjects, loading: false });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      set({ error: error.message, loading: false, projects: [] });
    }
  },
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Date.now() }]
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id),
    selectedProject: state.selectedProject?.id === id ? null : state.selectedProject
  })),
  
  getFilteredProjects: (searchQuery) => {
    const { projects } = get();
    if (!searchQuery || searchQuery.length > LIMITS.MAX_SEARCH_LENGTH) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(p => 
      p.amount.toLowerCase().includes(query) ||
      p.label.toLowerCase().includes(query)
    );
  },
}));
