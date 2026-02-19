# VajraOpz Multi-Agent Code Analysis System

## Architecture

### 5 AI Agents (LangGraph)
1. **OpenRouter** - Code analysis using Claude via OpenRouter
2. **Claude** - Direct Claude API for code analysis
3. **Gemini** - Google's Gemini Pro for code analysis
4. **Sarvam AI** - Indian AI model for code analysis
5. **Codeium** - Specialized coding AI

### CTO Agent (Claude)
- Reviews all fixes from 5 agents
- Decides which fixes to apply
- Calculates quality score (max 100)

## Scoring System

```
Base Score: 100 points
Speed Bonus: +10 (if deployment < 5 minutes)
Efficiency Penalty: -2 per commit over 20
Quality Bonus: +2 per fix applied
Total: Max 100 points
```

## Workflow

1. **Clone Repo to S3** - Store code for analysis
2. **Multi-Agent Analysis** - 5 agents analyze code in parallel
3. **CTO Decision** - Claude selects best fixes
4. **Create Branch** - Generate branch name: `TEAM_LEADER_AI_Fix`
5. **Apply Fixes** - Commit each fix individually
6. **Push to GitHub** - Push all commits to new branch
7. **Calculate Score** - Final quality score
8. **Save to DynamoDB** - Store all data

## DynamoDB Tables

- `vajraopz-analysis` - Analysis results
- `vajraopz-fixes` - Individual fixes
- `vajraopz-scores` - Quality scores

## API Keys Required

Set these as environment variables:

```bash
GEMINI_API_KEY=<your-key>
OPENROUTER_API_KEY=<your-key>
CLAUDE_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>
```

## Error Detection

Agents detect:
- **LINTING** - Unused imports, variables, formatting
- **SYNTAX** - Missing colons, brackets, quotes
- **LOGIC** - Type errors, null checks, edge cases

## Output Format

Each fix includes:
```json
{
  "file": "src/utils.py",
  "line": 15,
  "type": "LINTING",
  "message": "Unused import 'os'",
  "fix": "# removed unused import",
  "agent": "claude"
}
```

## Deployment

1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables
3. Deploy to AWS Lambda or ECS
4. Configure S3 bucket and DynamoDB tables
