import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { backendApi } from '../../services/backendApi';
import { useAuthStore } from '../../store';
import './AuthPage.css';

export const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, validateAuth } = useAuthStore();

  useEffect(() => {
    // If already authenticated, redirect to app
    if (backendApi.isAuthenticated() && validateAuth()) {
      navigate('/project', { replace: true });
      return;
    }

    // Handle GitHub OAuth callback
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setError('GitHub authentication failed');
      return;
    }

    if (code && state) {
      // Check if we already processed this code
      const processedCode = sessionStorage.getItem('processed_oauth_code');
      if (processedCode === code) {
        setError('This login link has already been used. Please try again.');
        // Clear the URL
        window.history.replaceState({}, '', '/auth');
        return;
      }
      
      handleGitHubCallback(code, state);
    }
  }, [searchParams, navigate, validateAuth]);

  const handleGitHubCallback = async (code, state) => {
    setLoading(true);
    setError('');

    try {
      // Mark this code as processed
      sessionStorage.setItem('processed_oauth_code', code);
      
      const result = await backendApi.handleGitHubCallback(code, state);
      
      // Store token and user data
      login(result.user, result.token);
      
      // Redirect to main app
      navigate('/project', { replace: true });
    } catch (err) {
      console.error('Auth callback error:', err);
      setError('Authentication failed: ' + err.message);
      // Clear any invalid state
      backendApi.clearToken();
      sessionStorage.removeItem('processed_oauth_code');
      // Clear URL params
      window.history.replaceState({}, '', '/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const authData = await backendApi.initiateGitHubAuth();
      
      // Store state for CSRF protection
      sessionStorage.setItem('github_oauth_state', authData.state);
      
      // Redirect to GitHub OAuth
      window.location.href = authData.url;
    } catch (err) {
      console.error('GitHub auth initiation error:', err);
      setError('Failed to initiate GitHub authentication: ' + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-content">
          <h1 className="auth-title">VajraOpz</h1>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #f3f3f3', 
              borderTop: '3px solid #111', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p>Authenticating with GitHub...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-content">
        <h1 className="auth-title">VajraOpz</h1>
        
        <div className="auth-toggle">
          <button 
            className={mode === 'login' ? 'active' : ''} 
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={mode === 'signup' ? 'active' : ''} 
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <p className="auth-description">
          AI-powered deployment platform that automatically detects and fixes code issues.
          <br />
          Deploy with confidence using intelligent quality scoring and automated fixes.
        </p>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button className="github-btn" onClick={handleGitHubLogin} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  );
};
