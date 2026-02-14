import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { IInlineComment } from '../models';

export interface AIReviewResult {
  summary: string;
  riskScore: number;
  riskExplanation: string;
  inlineComments: IInlineComment[];
  suggestedTests: string[];
  filesAnalyzed: string[];
}

export class AIEngine {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!config.gemini.apiKey || config.gemini.apiKey.trim().length === 0) {
      console.error('Gemini API key is missing. Set GEMINI_API_KEY in server/.env');
      console.error('Get your free API key at: https://aistudio.google.com/app/apikey');
      throw new Error('Gemini API key missing');
    }
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  async analyzePullRequest(
    diff: string,
    prMetadata: {
      title: string;
      description?: string;
      filesChanged: number;
      additions: number;
      deletions: number;
    }
  ): Promise<AIReviewResult> {
    try {
      const prompt = this.buildAnalysisPrompt(diff, prMetadata);
      const modelName = config.gemini.model || 'gemini-1.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });
      
      const systemInstruction = `You are an expert code reviewer. Analyze pull requests and provide comprehensive feedback in a structured JSON format. Focus on:
1. Code quality and best practices
2. Security vulnerabilities
3. Performance issues
4. Logic errors
5. Test coverage needs
6. Breaking changes`;
      
      const fullPrompt = `${systemInstruction}\n\n${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown code blocks.`;
      
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const responseContent = response.text();
      
      if (!responseContent) {
        throw new Error('Empty response from AI');
      }

      // Extract JSON from response (Gemini might wrap it in markdown)
      let jsonText = responseContent.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const aiResponse = JSON.parse(jsonText);
      
      return this.normalizeAIResponse(aiResponse, diff);
    } catch (error) {
      const message =
        (typeof error === 'object' && error && (error as any).message) || 'AI error';
      if (message.includes('API_KEY') || message.includes('API key')) {
        console.error('AI analysis error: Invalid Gemini API key');
        console.error('Get your free API key at: https://aistudio.google.com/app/apikey');
        throw new Error('Invalid Gemini API key');
      }
      console.error('AI analysis error:', message);
      throw new Error('Failed to analyze pull request with AI');
    }
  }

  private buildAnalysisPrompt(
    diff: string,
    prMetadata: {
      title: string;
      description?: string;
      filesChanged: number;
      additions: number;
      deletions: number;
    }
  ): string {
    // Truncate diff if too large (OpenAI has token limits)
    const maxDiffLength = 30000;
    const truncatedDiff = diff.length > maxDiffLength 
      ? diff.substring(0, maxDiffLength) + '\n\n... (diff truncated due to length)'
      : diff;

    return `Analyze this pull request and provide a comprehensive review in JSON format.

PR Title: ${prMetadata.title}
PR Description: ${prMetadata.description || 'No description provided'}
Files Changed: ${prMetadata.filesChanged}
Additions: ${prMetadata.additions}
Deletions: ${prMetadata.deletions}

Diff:
\`\`\`
${truncatedDiff}
\`\`\`

Provide your analysis in this exact JSON structure:
{
  "summary": "High-level summary of the changes (2-3 sentences)",
  "riskScore": 5,
  "riskExplanation": "Detailed explanation of the risk score",
  "inlineComments": [
    {
      "file": "path/to/file.js",
      "line": 42,
      "message": "Specific concern or suggestion",
      "severity": "warning"
    }
  ],
  "suggestedTests": [
    "Test description 1",
    "Test description 2"
  ]
}

Risk Score Scale (1-10):
1-3: Low risk - Minor changes, well-tested areas
4-6: Medium risk - Moderate changes, some edge cases
7-10: High risk - Major changes, security concerns, breaking changes

Severity levels: "info", "warning", "critical"`;
  }

  private normalizeAIResponse(aiResponse: any, diff: string): AIReviewResult {
    // Extract files from diff
    const filesAnalyzed = this.extractFilesFromDiff(diff);

    return {
      summary: aiResponse.summary || 'AI analysis completed',
      riskScore: Math.min(10, Math.max(1, aiResponse.riskScore || 5)),
      riskExplanation: aiResponse.riskExplanation || 'Risk assessment based on code changes',
      inlineComments: (aiResponse.inlineComments || []).map((comment: any) => ({
        file: comment.file || '',
        line: comment.line || 0,
        message: comment.message || '',
        severity: ['info', 'warning', 'critical'].includes(comment.severity) 
          ? comment.severity 
          : 'info',
      })),
      suggestedTests: aiResponse.suggestedTests || [],
      filesAnalyzed,
    };
  }

  private extractFilesFromDiff(diff: string): string[] {
    const files: string[] = [];
    const lines = diff.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        const match = line.match(/b\/(.+)$/);
        if (match) {
          files.push(match[1]);
        }
      }
    }
    
    return files;
  }

  async generateTestSuggestions(
    code: string,
    language: string
  ): Promise<string[]> {
    try {
      const modelName = config.gemini.model || 'gemini-1.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `You are a testing expert. Suggest test cases for this ${language} code:\n\n${code}\n\nProvide 3-5 important test cases as a JSON object with a "tests" array of strings.\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown code blocks.`;
      
      const result = await model.generateContent(prompt);
      const responseContent = result.response.text();
      
      // Extract JSON from response
      let jsonText = responseContent.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\\n/, '').replace(/\\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\\n/, '').replace(/\\n```$/, '');
      }

      const response = JSON.parse(jsonText);
      return response.tests || [];
    } catch (error) {
      console.error('Test generation error:', error);
      return [];
    }
  }
}
