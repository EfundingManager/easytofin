import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminLogs() {
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoursAgo, setHoursAgo] = useState(24);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const logsQuery = trpc.logs.getRecentLogs.useQuery(
    {
      limit: 200,
      level: filter === 'all' ? undefined : (filter as any),
      hoursAgo,
    },
    {
      refetchInterval: autoRefresh ? 10000 : false,
    }
  );

  const statsQuery = trpc.logs.getStatistics.useQuery({ hoursAgo });

  const filteredLogs = logsQuery.data?.data?.filter((log) =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.context && log.context.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
      case 'fatal':
        return 'destructive';
      case 'warn':
        return 'secondary';
      case 'info':
        return 'default';
      case 'debug':
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleString();
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Level', 'Message', 'Context', 'URL', 'IP Address'],
      ...filteredLogs.map((log) => [
        formatDate(log.createdAt),
        log.level,
        log.message,
        log.context || '',
        log.url || '',
        log.ipAddress || '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Application Logs</h1>
          <p className="text-muted-foreground">Monitor and debug application events in real-time</p>
        </div>

        {/* Statistics */}
        {statsQuery.data?.data && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsQuery.data.data.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {statsQuery.data.data.byLevel.error + statsQuery.data.data.byLevel.fatal}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {statsQuery.data.data.byLevel.warn}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statsQuery.data.data.byLevel.info}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Debug</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {statsQuery.data.data.byLevel.debug}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Level</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Levels</option>
                  <option value="error">Errors Only</option>
                  <option value="warn">Warnings Only</option>
                  <option value="info">Info Only</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Time Range</label>
                <select
                  value={hoursAgo}
                  onChange={(e) => setHoursAgo(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                >
                  <option value={1}>Last 1 Hour</option>
                  <option value={6}>Last 6 Hours</option>
                  <option value={24}>Last 24 Hours</option>
                  <option value={72}>Last 3 Days</option>
                  <option value={168}>Last 7 Days</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={() => logsQuery.refetch()}
                  disabled={logsQuery.isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {logsQuery.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Auto-refresh every 10 seconds</span>
              </label>
              <Button onClick={exportLogs} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Logs ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {logsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-left py-3 px-4 font-medium">Level</th>
                      <th className="text-left py-3 px-4 font-medium">Message</th>
                      <th className="text-left py-3 px-4 font-medium">Context</th>
                      <th className="text-left py-3 px-4 font-medium">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tbody key={log.id}>
                        <tr
                          className="border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        >
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getLevelColor(log.level) as any}>
                              {log.level.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 max-w-md truncate" title={log.message}>
                            {log.message}
                          </td>
                          <td className="py-3 px-4">
                            {log.context ? (
                              <Badge variant="outline">{log.context}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground flex items-center justify-between">
                            <span>{log.ipAddress || '-'}</span>
                            {expandedLogId === log.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </td>
                        </tr>
                        {expandedLogId === log.id && (
                          <tr className="border-b bg-muted/30">
                            <td colSpan={5} className="py-4 px-4">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Full Message</h4>
                                  <p className="text-sm bg-background p-2 rounded border break-words whitespace-pre-wrap">
                                    {log.message}
                                  </p>
                                </div>
                                {log.metadata && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Metadata</h4>
                                    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto max-h-96">
                                      {(() => {
                                        try {
                                          return JSON.stringify(JSON.parse(log.metadata), null, 2);
                                        } catch (e) {
                                          return log.metadata || '(empty)';
                                        }
                                      })()}
                                    </pre>
                                  </div>
                                )}
                                {log.url && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">URL</h4>
                                    <p className="text-xs text-muted-foreground break-words">{log.url}</p>
                                  </div>
                                )}
                                {log.userAgent && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">User Agent</h4>
                                    <p className="text-xs text-muted-foreground break-words">{log.userAgent}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
