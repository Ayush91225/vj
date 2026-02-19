import { backendConfig, GRAPHQL_QUERIES } from '../config/backend';

class BackendApiService {
  constructor() {
    this.baseURL = backendConfig.apiUrl;
  }

  async graphqlRequest(query, variables = {}) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Backend error:', result);
        throw new Error(result.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
      }

      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async initiateGitHubAuth() {
    const data = await this.graphqlRequest(GRAPHQL_QUERIES.GITHUB_AUTH);
    return data.githubAuth;
  }

  async handleGitHubCallback(code, state) {
    const data = await this.graphqlRequest(GRAPHQL_QUERIES.GITHUB_CALLBACK, {
      code,
      state
    });
    return data.githubCallback;
  }

  // Project methods
  async createProject(token, githubRepo, teamName, teamLeader) {
    const data = await this.graphqlRequest(GRAPHQL_QUERIES.CREATE_PROJECT, {
      token,
      githubRepo,
      teamName,
      teamLeader
    });
    return data.createProject;
  }

  async getProjects(token) {
    const data = await this.graphqlRequest(GRAPHQL_QUERIES.GET_PROJECTS, {
      token
    });
    return data.getProjects;
  }

  // Agent methods
  async triggerAgent(token, projectId) {
    const data = await this.graphqlRequest(GRAPHQL_QUERIES.TRIGGER_AGENT, {
      token,
      projectId
    });
    return data.triggerAgent;
  }

  async getDeployment(token, deploymentId) {
    const data = await this.graphqlRequest(GRAPHQL_QUERIES.GET_DEPLOYMENT, {
      token,
      deploymentId
    });
    return data.getDeployment;
  }

  // Utility methods
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this._parseToken(token);
      if (!payload) return false;
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getToken() {
    return localStorage.getItem('vajraopz_token');
  }

  setToken(token) {
    localStorage.setItem('vajraopz_token', token);
  }

  clearToken() {
    localStorage.removeItem('vajraopz_token');
  }

  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this._parseToken(token);
      if (!payload) return null;
      return {
        id: payload.user_id,
        exp: payload.exp
      };
    } catch {
      return null;
    }
  }

  _parseToken(token) {
    try {
      // Handle new format: base64.signature
      const parts = token.split('.');
      if (parts.length === 2) {
        const payload = JSON.parse(atob(parts[0]));
        return payload;
      }
      // Fallback for legacy format
      const payload = JSON.parse(atob(token));
      return payload;
    } catch {
      return null;
    }
  }
}

export const backendApi = new BackendApiService();