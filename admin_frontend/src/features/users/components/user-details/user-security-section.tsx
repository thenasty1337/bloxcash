'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  AlertTriangle,
  Lock,
  Ban,
  Eye,
  Calendar,
  MapPin,
  Monitor,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface UserSecuritySectionProps {
  userDetails: any;
}

export function UserSecuritySection({ userDetails }: UserSecuritySectionProps) {
  const { user, securityLogs } = userDetails;

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return <Eye className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <Eye className="h-4 w-4 text-gray-500" />;
      case 'ban':
        return <Ban className="h-4 w-4 text-red-500" />;
      case 'lock':
        return <Lock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      login: { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
      logout: { variant: 'secondary' as const, className: '' },
      ban: { variant: 'destructive' as const, className: '' },
      lock: { variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      default: { variant: 'outline' as const, className: '' }
    };

    const config = actionConfig[action.toLowerCase() as keyof typeof actionConfig] || actionConfig.default;

    return (
      <Badge variant={config.variant} className={config.className}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Account Restrictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Banned</span>
                <Badge variant={user.banned ? "destructive" : "default"}>
                  {user.banned ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Account Lock</span>
                <Badge variant={user.accountLock ? "secondary" : "default"}>
                  {user.accountLock ? "Locked" : "Active"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restrictions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tip Ban</span>
                <Badge variant={user.tipBan ? "destructive" : "default"}>
                  {user.tipBan ? "Banned" : "Allowed"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rain Ban</span>
                <Badge variant={user.rainBan ? "destructive" : "default"}>
                  {user.rainBan ? "Banned" : "Allowed"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Other Restrictions</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Leaderboard Ban</span>
                <Badge variant={user.leaderboardBan ? "destructive" : "default"}>
                  {user.leaderboardBan ? "Banned" : "Allowed"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sponsor Lock</span>
                <Badge variant={user.sponsorLock ? "secondary" : "default"}>
                  {user.sponsorLock ? "Locked" : "Active"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Known IP</p>
                <p className="font-mono text-sm">{user.ip || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Country</p>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-sm">{user.country || 'Unknown'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Status</p>
                <Badge variant={user.verified ? "default" : "secondary"}>
                  {user.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-sm">{format(new Date(user.createdAt), 'PPP')}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-sm">{format(new Date(user.updatedAt), 'PPP')}</span>
                </div>
              </div>
              {user.lastLogout && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Logout</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm">{format(new Date(user.lastLogout), 'PPP')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security Logs
            <Badge variant="secondary" className="ml-auto">
              Last {securityLogs?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityLogs && securityLogs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.event_type)}
                          {getActionBadge(log.event_type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{log.ip_address || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
                          {log.user_agent || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {log.description || 'No details'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No security logs</p>
              <p className="text-sm text-muted-foreground">No security events have been recorded for this user.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 