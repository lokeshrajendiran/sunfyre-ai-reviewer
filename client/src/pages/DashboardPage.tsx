import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Github, 
  RefreshCw, 
  Star, 
  GitFork, 
  Clock,
  Search,
  Filter,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Repository {
  _id: string;
  name: string;
  fullName: string;
  stars: number;
  forks: number;
  lastSyncedAt?: string;
  isActive: boolean;
}

export const DashboardPage: React.FC = () => {
  const { loading: authLoading, user } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRepos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRepositories();
      const repositories = response.data.repositories || [];
      setRepos(repositories);
      setFilteredRepos(repositories);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const syncRepos = async () => {
    try {
      setSyncing(true);
      await apiClient.syncRepositories();
      await loadRepos();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadRepos();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredRepos(
        repos.filter((r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredRepos(repos);
    }
  }, [searchQuery, repos]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to view your dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const activeRepos = repos.filter((r) => r.isActive).length;
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.username}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Monitor and review your GitHub repositories with AI-powered insights
              </p>
            </div>
            <Button
              onClick={syncRepos}
              disabled={syncing}
              variant="gradient"
              size="lg"
              className="gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Repositories'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600">
                <CardHeader className="border-none">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Total Repositories</CardTitle>
                    <Github className="w-8 h-8 opacity-80" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{repos.length}</div>
                  <p className="text-blue-100 text-sm mt-2">
                    {activeRepos} active
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-purple-600 text-white border-purple-700 dark:bg-purple-500 dark:border-purple-600">
                <CardHeader className="border-none">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Total Stars</CardTitle>
                    <Star className="w-8 h-8 opacity-80" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalStars}</div>
                  <p className="text-purple-100 text-sm mt-2">
                    Across all repositories
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-pink-600 text-white border-pink-700 dark:bg-pink-500 dark:border-pink-600">
                <CardHeader className="border-none">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Total Forks</CardTitle>
                    <GitFork className="w-8 h-8 opacity-80" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalForks}</div>
                  <p className="text-pink-100 text-sm mt-2">
                    Community engagement
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-white placeholder:text-gray-300"
                  />
                </div>
                <Button variant="outline" className="gap-2 text-white">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Repositories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No repositories found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery ? 'Try a different search query' : 'Sync your GitHub repositories to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={syncRepos} disabled={syncing} variant="gradient">
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {filteredRepos.map((repo) => (
                <motion.a
                  key={repo._id}
                  href={`/repository/${repo._id}`}
                  className="block"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            {repo.name}
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                          <CardDescription className="mt-2">{repo.fullName}</CardDescription>
                        </div>
                        <Badge variant={repo.isActive ? 'success' : 'outline'}>
                          {repo.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-4 h-4" />
                          <span>{repo.forks}</span>
                        </div>
                      </div>
                      {repo.lastSyncedAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                          <Clock className="w-3 h-3" />
                          Last synced: {new Date(repo.lastSyncedAt).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
