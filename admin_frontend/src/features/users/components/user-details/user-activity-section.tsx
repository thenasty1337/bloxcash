'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Bell,
  Star,
  Trophy,
  Calendar,
  Hash,
  CheckCircle,
  XCircle,
  Clock,
  Gamepad2,
  User,
  Activity,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Zap
} from 'lucide-react';
import { format, isValid } from 'date-fns';

interface UserActivitySectionProps {
  userDetails: any;
}

export function UserActivitySection({ userDetails }: UserActivitySectionProps) {
  const { chatMessages, notifications, userFavorites, leaderboardEntries, clientSeeds } = userDetails;

  const formatDate = (dateValue: any, formatString: string) => {
    if (!dateValue) return 'Invalid date';
    const date = new Date(dateValue);
    return isValid(date) ? format(date, formatString) : 'Invalid date';
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'win':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'bonus':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const typeConfig = {
      win: { variant: 'default' as const, className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
      deposit: { variant: 'default' as const, className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
      withdrawal: { variant: 'default' as const, className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
      bonus: { variant: 'default' as const, className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
      default: { variant: 'outline' as const, className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' }
    };

    const config = typeConfig[type.toLowerCase() as keyof typeof typeConfig] || typeConfig.default;

    return (
      <Badge variant={config.variant} className={`${config.className} text-xs font-medium`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Activity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatMessages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications?.length || 0}</div>
            <p className="text-xs text-muted-foreground">System alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Games</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userFavorites?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Games saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaderboardEntries?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Recent Chat Messages</CardTitle>
              </div>
              <Badge variant="secondary">
                {chatMessages?.length || 0} messages
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {chatMessages && chatMessages.length > 0 ? (
              <ScrollArea className="h-[400px] px-6 pb-6">
                <div className="space-y-3">
                  {chatMessages.map((message: any, index: number) => (
                    <div key={message.id || index}>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {message.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{message.username || 'Unknown User'}</span>
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              {message.channel || 'general'}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDate(message.createdAt, 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 break-words">{message.content}</p>
                        </div>
                      </div>
                      {index < chatMessages.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No chat messages</h3>
                <p className="text-sm text-muted-foreground text-center">This user hasn&apos;t sent any messages recently.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Recent Notifications</CardTitle>
              </div>
              <Badge variant="secondary">
                {notifications?.length || 0} notifications
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications && notifications.length > 0 ? (
              <ScrollArea className="h-[400px] px-6 pb-6">
                <div className="space-y-3">
                  {notifications.map((notification: any, index: number) => (
                    <div key={notification.id || index}>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getNotificationBadge(notification.type)}
                            <Badge variant={notification.isRead ? "outline" : "default"} className="text-xs">
                              {notification.isRead ? "Read" : "Unread"}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDate(notification.createdAt, 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 break-words">
                            {notification.content ? 
                              (typeof notification.content === 'string' ? notification.content : JSON.stringify(notification.content)) 
                              : 'No content available'
                            }
                          </p>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground text-center">This user has no recent notifications.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Favorite Games */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <CardTitle>Favorite Games</CardTitle>
              </div>
              <Badge variant="secondary">
                {userFavorites?.length || 0} games
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {userFavorites && userFavorites.length > 0 ? (
              <ScrollArea className="h-[350px] px-6 pb-6">
                <div className="space-y-3">
                  {userFavorites.map((favorite: any, index: number) => (
                    <div key={favorite.id || index}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Gamepad2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{favorite.gameName || 'Unknown Game'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Added {formatDate(favorite.createdAt, 'MMM dd, yyyy')}
                            </span>
                            {favorite.provider && (
                              <Badge variant="outline" className="text-xs">
                                {favorite.provider}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Star className="h-4 w-4 fill-current flex-shrink-0" />
                      </div>
                      {index < userFavorites.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No favorite games</h3>
                <p className="text-sm text-muted-foreground text-center">This user hasn&apos;t favorited any games yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard Entries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <CardTitle>Leaderboard</CardTitle>
              </div>
              <Badge variant="secondary">
                {leaderboardEntries?.length || 0} entries
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leaderboardEntries && leaderboardEntries.length > 0 ? (
              <ScrollArea className="h-[350px] px-6 pb-6">
                <div className="space-y-3">
                  {leaderboardEntries.map((entry: any, index: number) => (
                    <div key={entry.id || index}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{entry.leaderboardName || 'Unknown'}</p>
                            <Badge variant="outline" className="text-xs">
                              #{entry.position}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Wagered: ${entry.value?.toFixed(2) || '0.00'}</span>
                            <span>•</span>
                            <span>{formatDate(entry.createdAt, 'MMM dd')}</span>
                          </div>
                        </div>
                      </div>
                      {index < leaderboardEntries.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No leaderboard entries</h3>
                <p className="text-sm text-muted-foreground text-center">This user hasn&apos;t appeared on any leaderboards.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Seeds */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                <CardTitle>Client Seeds</CardTitle>
              </div>
              <Badge variant="secondary">
                {clientSeeds?.length || 0} seeds
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {clientSeeds && clientSeeds.length > 0 ? (
              <ScrollArea className="h-[350px] px-6 pb-6">
                <div className="space-y-3">
                  {clientSeeds.map((seed: any, index: number) => (
                    <div key={seed.id || index}>
                      <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            <span className="text-sm font-medium">Seed #{seed.id}</span>
                          </div>
                          <Badge variant={seed.active ? "default" : "secondary"} className="text-xs">
                            {seed.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="bg-muted/50 rounded p-2 mb-2">
                          <code className="text-xs font-mono break-all text-foreground/70">
                            {seed.seed}
                          </code>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDate(seed.createdAt, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      {index < clientSeeds.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Hash className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No client seeds</h3>
                <p className="text-sm text-muted-foreground text-center">This user has no client seeds generated.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 