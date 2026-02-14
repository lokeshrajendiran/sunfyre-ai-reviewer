import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { RiskScoreBadge } from '../components/RiskScoreBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GitPullRequest,
  RefreshCw,
  FileCode,
  Plus,
  Minus,
  GitCommit,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PullRequest {
  _id: string;
  number: number;
  title: string;
  state: string;
  author: { username: string; avatarUrl?: string };
  createdAt: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  commits: number;
}

export const RepositoryPullRequestsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPullRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPullRequests(id!);
      setPullRequests(response.data.pullRequests || []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load pull requests');
    } finally {
      setLoading(false);
    }
  };

  const syncPullRequests = async () => {
    try {
      setSyncing(true);
      await apiClient.syncPullRequests(id!);
      await loadPullRequests();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (id) loadPullRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case 'open':
        return <GitPullRequest className="w-5 h-5 text-green-600" />;
      case 'closed':
        return <CheckCircle2 className="w-5 h-5 text-purple-600" />;
      case 'merged':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStateBadge = (state: string) => {
    switch (state.toLowerCase()) {
      case 'open':
        return <Badge variant="success">Open</Badge>;
      case 'closed':
        return <Badge variant="danger">Closed</Badge>;
      case 'merged':
        return <Badge variant="info">Merged</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300">
              Pull Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Review and analyze pull requests with AI assistance
            </p>
          </div>
          <Button
            onClick={syncPullRequests}
            disabled={syncing}
            variant="gradient"
            size="lg"
            className="gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Pull Requests'}
          </Button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pull Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pullRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <GitPullRequest className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No pull requests found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sync pull requests from GitHub to get started
              </p>
              <Button onClick={syncPullRequests} disabled={syncing} variant="gradient">
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {pullRequests.map((pr) => (
              <motion.a
                key={pr._id}
                href={`/pull-request/${pr._id}`}
                className="block"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 },
                }}
              >
                <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getStateIcon(pr.state)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">#{pr.number}</span>
                            {pr.title}
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                          <div className="flex items-center gap-2 shrink-0">
                            {getStateBadge(pr.state)}
                            <RiskScoreBadge
                              score={Math.min(10, Math.max(1, Math.round((pr.additions + pr.deletions) / 100)))}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={pr.author.avatarUrl} />
                              <AvatarFallback>{pr.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{pr.author.username}</span>
                          </div>
                          <span>•</span>
                          <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='flex items-center p-5'>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <FileCode className="w-4 h-4" />
                        <span className="font-medium">{pr.filesChanged}</span>
                        <span className="text-gray-500">files</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <Plus className="w-4 h-4" />
                        <span className="font-medium">{pr.additions}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <Minus className="w-4 h-4" />
                        <span className="font-medium">{pr.deletions}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <GitCommit className="w-4 h-4" />
                        <span className="font-medium">{pr.commits}</span>
                        <span className="text-gray-500">commits</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
