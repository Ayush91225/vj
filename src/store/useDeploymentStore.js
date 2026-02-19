import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDeploymentStore = create(
  persist(
    (set, get) => ({
      // State per deployment ID
      deploymentFixes: {}, // { deploymentId: { totalAttempts, fixedIssues, fixedButtons, failedButtons, cicdRuns, totalFailures } }
      
      // Get deployment state
      getDeploymentState: (deploymentId) => {
        const { deploymentFixes } = get();
        return deploymentFixes[deploymentId] || {
          totalAttempts: 0,
          fixedIssues: [],
          fixedButtons: [],
          failedButtons: [],
          cicdRuns: [],
          totalFailures: 10,
        };
      },
      
      // Increment attempts
      incrementAttempts: (deploymentId) => set((state) => ({
        deploymentFixes: {
          ...state.deploymentFixes,
          [deploymentId]: {
            ...state.deploymentFixes[deploymentId],
            totalAttempts: (state.deploymentFixes[deploymentId]?.totalAttempts || 0) + 1,
          },
        },
      })),
      
      // Add fixed issue
      addFixedIssue: (deploymentId, issue) => set((state) => {
        const current = state.deploymentFixes[deploymentId] || { fixedIssues: [] };
        return {
          deploymentFixes: {
            ...state.deploymentFixes,
            [deploymentId]: {
              ...current,
              fixedIssues: [...(current.fixedIssues || []), issue],
            },
          },
        };
      }),
      
      // Update fixed buttons
      setFixedButtons: (deploymentId, buttons) => set((state) => ({
        deploymentFixes: {
          ...state.deploymentFixes,
          [deploymentId]: {
            ...state.deploymentFixes[deploymentId],
            fixedButtons: buttons,
          },
        },
      })),
      
      // Update failed buttons
      setFailedButtons: (deploymentId, buttons) => set((state) => ({
        deploymentFixes: {
          ...state.deploymentFixes,
          [deploymentId]: {
            ...state.deploymentFixes[deploymentId],
            failedButtons: buttons,
          },
        },
      })),
      
      // Set total attempts (for Fix All)
      setTotalAttempts: (deploymentId, attempts) => set((state) => ({
        deploymentFixes: {
          ...state.deploymentFixes,
          [deploymentId]: {
            ...state.deploymentFixes[deploymentId],
            totalAttempts: attempts,
          },
        },
      })),
      
      // Add CI/CD run
      addCicdRun: (deploymentId, run) => set((state) => {
        const current = state.deploymentFixes[deploymentId] || { cicdRuns: [] };
        return {
          deploymentFixes: {
            ...state.deploymentFixes,
            [deploymentId]: {
              ...current,
              cicdRuns: [...(current.cicdRuns || []), run],
            },
          },
        };
      }),
      
      // Set total failures
      setTotalFailures: (deploymentId, count) => set((state) => ({
        deploymentFixes: {
          ...state.deploymentFixes,
          [deploymentId]: {
            ...state.deploymentFixes[deploymentId],
            totalFailures: count,
          },
        },
      })),
      
      // Reset deployment
      resetDeployment: (deploymentId) => set((state) => {
        const { [deploymentId]: _, ...rest } = state.deploymentFixes;
        return { deploymentFixes: rest };
      }),
    }),
    {
      name: 'vajraopz-deployment-storage',
    }
  )
);
