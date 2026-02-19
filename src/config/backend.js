// Backend configuration — auto-detects dev vs production
const isDev = typeof import.meta !== 'undefined'
  ? import.meta.env?.DEV
  : typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

const PROD_API_URL = import.meta.env?.VITE_API_BASE_URL || 'https://qz4k4nhlwfo4p3jdkzsxpdfksu0hwqir.lambda-url.ap-south-1.on.aws';

export const backendConfig = {
  apiUrl: isDev
    ? 'http://localhost:3001/graphql'
    : PROD_API_URL,
  githubOAuthUrl: 'https://github.com/login/oauth/authorize',
  environment: isDev ? 'development' : 'production',
  region: 'ap-south-1',
  frontendUrl: isDev ? 'http://localhost:3000' : 'https://vj-eta.vercel.app',
  callbackUrl: isDev ? 'http://localhost:3000/auth/callback' : 'https://vj-eta.vercel.app/auth/callback',
};

// GraphQL queries
export const GRAPHQL_QUERIES = {
  GITHUB_AUTH: `
    query githubAuth {
      githubAuth {
        url
        state
      }
    }
  `,

  GITHUB_CALLBACK: `
    mutation githubCallback($code: String!, $state: String!) {
      githubCallback(code: $code, state: $state) {
        user {
          id
          username
          email
          avatar_url
        }
        token
      }
    }
  `,

  CREATE_PROJECT: `
    mutation createProject($token: String!, $githubRepo: String!, $teamName: String!, $teamLeader: String!) {
      createProject(token: $token, githubRepo: $githubRepo, teamName: $teamName, teamLeader: $teamLeader) {
        id
        status
        branch_name
      }
    }
  `,

  TRIGGER_AGENT: `
    mutation triggerAgent($token: String!, $projectId: String!) {
      triggerAgent(token: $token, projectId: $projectId) {
        deploymentId
        runId
        status
      }
    }
  `,

  GET_PROJECTS: `
    query getProjects($token: String!) {
      getProjects(token: $token) {
        project_id
        github_repo
        team_name
        team_leader
        branch_name
        status
        created_at
      }
    }
  `,

  GET_DEPLOYMENT: `
    query getDeployment($token: String!, $deploymentId: String!) {
      getDeployment(token: $token, deploymentId: $deploymentId) {
        deployment_id
        project_id
        status
        created_at
        agent_runs {
          run_id
          status
          agents
          retry_count
          results
        }
      }
    }
  `,

  GET_COMMITS: `
    query getCommits($githubRepo: String!, $branch: String) {
      getCommits(githubRepo: $githubRepo, branch: $branch) {
        sha
        message
        author
        date
        url
      }
    }
  `
};