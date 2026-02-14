import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RiskScoreBadge } from '../components/RiskScoreBadge';
import { DiffViewer } from '../components/DiffViewer';
import { InlineComment, type InlineCommentData } from '../components/InlineComment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  FileCode,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
  GitBranch,
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AIReview {
  _id: string;
  summary: string;
  riskScore: number;
  riskExplanation: string;
  inlineComments: InlineCommentData[];
  suggestedTests: string[];
  filesAnalyzed: string[];
  createdAt: string;
}

interface PullRequest {
  _id: string;
  number: number;
  title: string;
  description?: string;
  state: string;
  author: { username: string; avatarUrl?: string };
  baseBranch: string;
  headBranch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  commits: number;
  url: string;
}

export const PullRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diff] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  const loadPullRequest = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPullRequest(id!);
      setPullRequest(response.data.pullRequest);
      setAiReview(response.data.aiReview || null);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load pull request');
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    try {
      setAnalyzing(true);
      const response = await apiClient.analyzePullRequest(id!);
      setAiReview(response.data.aiReview);
      setActiveTab('ai-insights');
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to analyze pull request');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (id) loadPullRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pullRequest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Pull Request Not Found</CardTitle>
            <CardDescription>The requested pull request could not be loaded</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 dark:text-green-400';
    if (score <= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl text-gray-500 dark:text-gray-400 font-mono">
                  #{pullRequest.number}
                </span>
                <Badge variant={pullRequest.state === 'open' ? 'success' : 'info'}>
                  {pullRequest.state}
                </Badge>
                {aiReview && <RiskScoreBadge score={aiReview.riskScore} />}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {pullRequest.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={pullRequest.author.avatarUrl} />
                    <AvatarFallback>{pullRequest.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{pullRequest.author.username}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4" />
                  <span className="font-mono text-xs">
                    {pullRequest.baseBranch} ← {pullRequest.headBranch}
                  </span>
                </div>
                <a
                  href={pullRequest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View on GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <Button
              onClick={analyze}
              disabled={analyzing}
              variant="gradient"
              size="lg"
              className="gap-2 shrink-0"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {aiReview ? 'Re-Analyze' : 'Analyze with AI'}
                </>
              )}
            </Button>
          </div>

          {/* Stats Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-blue-600">{pullRequest.filesChanged}</span>
                  <span className="text-gray-500">files changed</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span className="font-medium">+{pullRequest.additions}</span>
                  <span className="text-gray-500">additions</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <span className="font-medium">-{pullRequest.deletions}</span>
                  <span className="text-gray-500">deletions</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{pullRequest.commits}</span>
                  <span className="text-gray-500">commits</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Info className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Insights
              {aiReview && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  New
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="diff" className="gap-2">
              <FileCode className="w-4 h-4" />
              Diff
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {pullRequest.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {pullRequest.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Pull Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className='flex flex-col gap-1 mt-3'>
                    <p className="text-sm text-gray-600 dark:text-white mb-1">Author</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={pullRequest.author.avatarUrl} />
                        <AvatarFallback>{pullRequest.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-white">{pullRequest.author.username}</span>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 mt-3'>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Branches</p>
                    <p className="font-mono text-sm text-white">
                      {pullRequest.baseBranch} ← {pullRequest.headBranch}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!aiReview && (
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
                <CardContent className="p-6 text-center">
                  <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Get AI-Powered Insights</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Analyze this pull request with AI to get security insights, risk assessment, and code suggestions
                  </p>
                  <Button onClick={analyze} disabled={analyzing} variant="gradient">
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            {aiReview ? (
              <>
                {/* Risk Score Card */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Risk Assessment
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Risk Score:</span>
                        <span className={`text-3xl font-bold ${getRiskColor(aiReview.riskScore)}`}>
                          {aiReview.riskScore}/10
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mt-5">{aiReview.riskExplanation}</p>
                  </CardContent>
                </Card>

                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      AI Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mt-5">{aiReview.summary}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Generated on {new Date(aiReview.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                {/* Inline Comments */}
                {aiReview.inlineComments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Code Review Comments ({aiReview.inlineComments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 mt-5">
                      {aiReview.inlineComments.map((comment, i) => (
                        <InlineComment key={i} comment={comment} />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Suggested Tests */}
                {aiReview.suggestedTests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Suggested Tests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mt-5">
                        {aiReview.suggestedTests.map((test, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">{test}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No AI Analysis Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Run an AI analysis to get insights, risk assessment, and code suggestions
                  </p>
                  <Button onClick={analyze} disabled={analyzing} variant="gradient">
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Diff Tab */}
          <TabsContent value="diff">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  Code Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {diff ? (
                  <DiffViewer diff={diff} inlineComments={aiReview?.inlineComments} />
                ) : (
                  <div className="text-center py-12">
                    <FileCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Diff viewer will be available when diff data is stored
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
