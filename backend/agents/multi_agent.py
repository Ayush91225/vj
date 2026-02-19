"""
Multi-Agent Code Analysis System using LangGraph
Agents: OpenRouter, Claude, Gemini, Sarvam AI, Codeium
CTO Agent: Claude (decides which fix to apply)
"""

import os
import json
from typing import Dict, List, Any, TypedDict
from langgraph.graph import StateGraph, END
import anthropic
import google.generativeai as genai
import openai
from datetime import datetime

# API Keys (set via environment variables)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY')
CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Initialize clients
genai.configure(api_key=GEMINI_API_KEY)
claude_client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
openai.api_key = OPENAI_API_KEY


class AgentState(TypedDict):
    """State shared across all agents"""
    code_files: Dict[str, str]
    issues: List[Dict[str, Any]]
    fixes: Dict[str, List[Dict[str, Any]]]  # agent_name -> list of fixes
    selected_fixes: List[Dict[str, Any]]
    score: Dict[str, int]
    deployment_id: str
    run_id: str
    repo_url: str
    branch_name: str
    start_time: float
    commits_count: int


class OpenRouterAgent:
    """OpenRouter agent for code analysis"""
    
    def analyze(self, state: AgentState) -> AgentState:
        print("[OpenRouter] Analyzing code...")
        fixes = []
        
        for file_path, content in state['code_files'].items():
            try:
                response = openai.ChatCompletion.create(
                    model="anthropic/claude-3.5-sonnet",
                    messages=[{
                        "role": "user",
                        "content": f"Analyze this code for errors (LINTING, SYNTAX, LOGIC):\n\nFile: {file_path}\n\n{content}\n\nReturn JSON: {{\"issues\": [{{\"type\": \"LINTING|SYNTAX|LOGIC\", \"line\": 10, \"message\": \"...\", \"fix\": \"...\"}}]}}"
                    }],
                    api_key=OPENROUTER_API_KEY,
                    base_url="https://openrouter.ai/api/v1"
                )
                
                result = json.loads(response.choices[0].message.content)
                for issue in result.get('issues', []):
                    fixes.append({
                        'agent': 'openrouter',
                        'file': file_path,
                        'type': issue['type'],
                        'line': issue['line'],
                        'message': issue['message'],
                        'fix': issue['fix']
                    })
            except Exception as e:
                print(f"[OpenRouter] Error: {e}")
        
        state['fixes']['openrouter'] = fixes
        return state


class ClaudeAgent:
    """Claude agent for code analysis"""
    
    def analyze(self, state: AgentState) -> AgentState:
        print("[Claude] Analyzing code...")
        fixes = []
        
        for file_path, content in state['code_files'].items():
            try:
                message = claude_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=4096,
                    messages=[{
                        "role": "user",
                        "content": f"Analyze this code for errors (LINTING, SYNTAX, LOGIC):\n\nFile: {file_path}\n\n{content}\n\nReturn JSON: {{\"issues\": [{{\"type\": \"LINTING|SYNTAX|LOGIC\", \"line\": 10, \"message\": \"...\", \"fix\": \"...\"}}]}}"
                    }]
                )
                
                result = json.loads(message.content[0].text)
                for issue in result.get('issues', []):
                    fixes.append({
                        'agent': 'claude',
                        'file': file_path,
                        'type': issue['type'],
                        'line': issue['line'],
                        'message': issue['message'],
                        'fix': issue['fix']
                    })
            except Exception as e:
                print(f"[Claude] Error: {e}")
        
        state['fixes']['claude'] = fixes
        return state


class GeminiAgent:
    """Gemini agent for code analysis"""
    
    def analyze(self, state: AgentState) -> AgentState:
        print("[Gemini] Analyzing code...")
        fixes = []
        model = genai.GenerativeModel('gemini-pro')
        
        for file_path, content in state['code_files'].items():
            try:
                prompt = f"Analyze this code for errors (LINTING, SYNTAX, LOGIC):\n\nFile: {file_path}\n\n{content}\n\nReturn JSON: {{\"issues\": [{{\"type\": \"LINTING|SYNTAX|LOGIC\", \"line\": 10, \"message\": \"...\", \"fix\": \"...\"}}]}}"
                response = model.generate_content(prompt)
                
                result = json.loads(response.text)
                for issue in result.get('issues', []):
                    fixes.append({
                        'agent': 'gemini',
                        'file': file_path,
                        'type': issue['type'],
                        'line': issue['line'],
                        'message': issue['message'],
                        'fix': issue['fix']
                    })
            except Exception as e:
                print(f"[Gemini] Error: {e}")
        
        state['fixes']['gemini'] = fixes
        return state


class SarvamAgent:
    """Sarvam AI agent for code analysis"""
    
    def analyze(self, state: AgentState) -> AgentState:
        print("[Sarvam] Analyzing code...")
        # Placeholder - implement Sarvam AI API when available
        state['fixes']['sarvam'] = []
        return state


class CodeiumAgent:
    """Codeium agent for code analysis"""
    
    def analyze(self, state: AgentState) -> AgentState:
        print("[Codeium] Analyzing code...")
        # Placeholder - implement Codeium API when available
        state['fixes']['codeium'] = []
        return state


class CTOAgent:
    """CTO Agent (Claude) - Decides which fixes to apply and calculates score"""
    
    def decide(self, state: AgentState) -> AgentState:
        print("[CTO] Evaluating all fixes and making decisions...")
        
        # Collect all fixes from all agents
        all_fixes = []
        for agent_name, fixes in state['fixes'].items():
            all_fixes.extend(fixes)
        
        # Use Claude to decide which fixes to apply
        try:
            fixes_summary = json.dumps(all_fixes, indent=2)
            message = claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4096,
                messages=[{
                    "role": "user",
                    "content": f"You are a CTO reviewing code fixes from multiple AI agents. Select the best fixes to apply.\n\nAll proposed fixes:\n{fixes_summary}\n\nReturn JSON: {{\"selected_fixes\": [{{\"file\": \"...\", \"line\": 10, \"type\": \"...\", \"message\": \"...\", \"fix\": \"...\", \"agent\": \"...\"}}]}}"
                }]
            )
            
            result = json.loads(message.content[0].text)
            state['selected_fixes'] = result.get('selected_fixes', [])
            
        except Exception as e:
            print(f"[CTO] Error: {e}")
            state['selected_fixes'] = []
        
        # Calculate score
        state = self.calculate_score(state)
        
        return state
    
    def calculate_score(self, state: AgentState) -> AgentState:
        """Calculate quality score (max 100)"""
        base_score = 100
        
        # Speed bonus (+10 if < 5 minutes)
        elapsed_time = (datetime.now().timestamp() - state['start_time']) / 60
        speed_bonus = 10 if elapsed_time < 5 else 0
        
        # Efficiency penalty (-2 per commit over 20)
        commits_count = state.get('commits_count', 0)
        efficiency_penalty = max(0, (commits_count - 20) * 2)
        
        # Quality bonus (+2 per fix applied)
        quality_bonus = len(state['selected_fixes']) * 2
        
        # Calculate total (max 100)
        total = min(100, base_score + speed_bonus + quality_bonus - efficiency_penalty)
        
        state['score'] = {
            'base': base_score,
            'speed_bonus': speed_bonus,
            'efficiency_penalty': -efficiency_penalty,
            'quality_bonus': quality_bonus,
            'total': total
        }
        
        print(f"[CTO] Score calculated: {total}/100")
        return state


def create_agent_graph():
    """Create LangGraph workflow"""
    workflow = StateGraph(AgentState)
    
    # Add agent nodes
    workflow.add_node("openrouter", lambda s: OpenRouterAgent().analyze(s))
    workflow.add_node("claude", lambda s: ClaudeAgent().analyze(s))
    workflow.add_node("gemini", lambda s: GeminiAgent().analyze(s))
    workflow.add_node("sarvam", lambda s: SarvamAgent().analyze(s))
    workflow.add_node("codeium", lambda s: CodeiumAgent().analyze(s))
    workflow.add_node("cto", lambda s: CTOAgent().decide(s))
    
    # Set entry point
    workflow.set_entry_point("openrouter")
    
    # Add edges (parallel execution)
    workflow.add_edge("openrouter", "claude")
    workflow.add_edge("claude", "gemini")
    workflow.add_edge("gemini", "sarvam")
    workflow.add_edge("sarvam", "codeium")
    workflow.add_edge("codeium", "cto")
    workflow.add_edge("cto", END)
    
    return workflow.compile()


def run_multi_agent_analysis(code_files: Dict[str, str], deployment_id: str, run_id: str, repo_url: str, branch_name: str) -> Dict[str, Any]:
    """Run multi-agent analysis"""
    
    initial_state: AgentState = {
        'code_files': code_files,
        'issues': [],
        'fixes': {},
        'selected_fixes': [],
        'score': {},
        'deployment_id': deployment_id,
        'run_id': run_id,
        'repo_url': repo_url,
        'branch_name': branch_name,
        'start_time': datetime.now().timestamp(),
        'commits_count': 0
    }
    
    graph = create_agent_graph()
    result = graph.invoke(initial_state)
    
    return {
        'selected_fixes': result['selected_fixes'],
        'score': result['score'],
        'all_fixes': result['fixes']
    }
