'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Gift, 
  Search, 
  Filter,
  Plus,
  Clock,
  User,
  Gamepad2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { format, isAfter, addDays } from 'date-fns';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';

interface Freespin {
  id: string;
  user_id: string;
  game_id: string;
  freespins_count: number;
  freespins_performed: number;
  bet_level: number;
  active: boolean;
  valid_until: string;
  created_at: string;
}

interface FreespinsTabProps {
  freespins: Freespin[];
  loading: boolean;
  loadFreespins: () => Promise<void>;
}

export function FreespinsTab({ freespins, loading, loadFreespins }: FreespinsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addFormLoading, setAddFormLoading] = useState(false);
  const itemsPerPage = 10;

  // Add freespins form state
  const [addForm, setAddForm] = useState({
    userId: '',
    gameId: '',
    freespinsCount: 10,
    betLevel: 0, // SpinShield bet levels are 0-6
    validDays: 7
  });

  // Search states for add dialog
  const [userSearch, setUserSearch] = useState('');
  const [gameSearch, setGameSearch] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [gameResults, setGameResults] = useState<any[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [gameSearchLoading, setGameSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  // Check if freespin is active
  const isActive = (freespin: Freespin) => {
    const now = new Date();
    const validUntil = new Date(freespin.valid_until);
    return freespin.active && isAfter(validUntil, now);
  };

  // Calculate remaining time
  const getRemainingTime = (validUntil: string) => {
    const now = new Date();
    const expiryDate = new Date(validUntil);
    
    if (isAfter(now, expiryDate)) return 'Expired';
    
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
  };

  // Filter and sort freespins
  const filteredFreespins = useMemo(() => {
    let filtered = freespins.filter(freespin => {
      const matchesSearch = 
        freespin.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freespin.game_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      const active = isActive(freespin);
      const performed = freespin.freespins_performed;
      const total = freespin.freespins_count;
      
      if (statusFilter === 'active') {
        matchesStatus = active && performed === 0;
      } else if (statusFilter === 'started') {
        matchesStatus = active && performed > 0 && performed < total;
      } else if (statusFilter === 'finished') {
        matchesStatus = active && performed >= total;
      } else if (statusFilter === 'expired') {
        matchesStatus = !active;
      }
      
      return matchesSearch && matchesStatus;
    });

    // Sort freespins
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Freespin];
      let bValue: any = b[sortField as keyof Freespin];

      if (sortField === 'created_at' || sortField === 'valid_until') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (['freespins_count', 'freespins_performed', 'bet_level'].includes(sortField)) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [freespins, searchTerm, statusFilter, sortField, sortOrder]);

  // Paginate freespins
  const paginatedFreespins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFreespins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFreespins, currentPage]);

  const totalPages = Math.ceil(filteredFreespins.length / itemsPerPage);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  // Get status badge
  const getStatusBadge = (freespin: Freespin) => {
    const isActiveStatus = isActive(freespin);
    const performed = freespin.freespins_performed;
    const total = freespin.freespins_count;
    
    // Check if finished first (regardless of expiry status)
    if (performed >= total) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Finished
        </Badge>
      );
    }
    
    // Then check if expired (only for unfinished freespins)
    if (!isActiveStatus) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    
    // Check if started (active and partially used)
    if (performed > 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Started
        </Badge>
      );
    }
    
    // Default to active (unused)
    return (
      <Badge className="bg-green-100 text-green-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Get freespin statistics
  const stats = useMemo(() => {
    const activeFreespins = freespins.filter(f => {
      const active = isActive(f);
      const performed = f.freespins_performed;
      const total = f.freespins_count;
      return active && performed === 0;
    }).length;
    
    const startedFreespins = freespins.filter(f => {
      const active = isActive(f);
      const performed = f.freespins_performed;
      const total = f.freespins_count;
      return active && performed > 0 && performed < total;
    }).length;
    
    const finishedFreespins = freespins.filter(f => {
      const active = isActive(f);
      const performed = f.freespins_performed;
      const total = f.freespins_count;
      return active && performed >= total;
    }).length;
    
    const expiredFreespins = freespins.filter(f => !isActive(f)).length;
    const totalSpinsAvailable = freespins.reduce((sum, f) => sum + f.freespins_count, 0);
    const totalSpinsUsed = freespins.reduce((sum, f) => sum + f.freespins_performed, 0);
    
    return {
      total: freespins.length,
      active: activeFreespins,
      started: startedFreespins,
      finished: finishedFreespins,
      expired: expiredFreespins,
      totalSpinsAvailable,
      totalSpinsUsed,
      utilizationRate: totalSpinsAvailable > 0 ? (totalSpinsUsed / totalSpinsAvailable) * 100 : 0
    };
  }, [freespins]);

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setUserResults([]);
      return;
    }

    try {
      setUserSearchLoading(true);
      const response = await clientApi(`/admin/users/search?q=${encodeURIComponent(query)}&limit=10`) as any;
      setUserResults(response.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setUserResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  // Search games
  const searchGames = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setGameResults([]);
      return;
    }

    try {
      setGameSearchLoading(true);
      const response = await clientApi(`/admin/spinshield/games/search?q=${encodeURIComponent(query)}&limit=10`) as any;
      setGameResults(response.games || []);
    } catch (error) {
      console.error('Error searching games:', error);
      setGameResults([]);
    } finally {
      setGameSearchLoading(false);
    }
  };

  // Debounced search effects
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsers(userSearch);
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      searchGames(gameSearch);
    }, 300);
    return () => clearTimeout(timeout);
  }, [gameSearch]);

  // Handle add freespins
  const handleAddFreespins = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedGame) {
      toast.error('Please select both a user and a game');
      return;
    }
    
    try {
      setAddFormLoading(true);
      
      const response = await clientApi('/admin/spinshield/add-freespins', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser.id,
          gameId: selectedGame.game_id,
          freespinsCount: addForm.freespinsCount,
          betLevel: addForm.betLevel,
          validDays: addForm.validDays
        })
      }) as { success?: boolean; error?: string };
      
      if (response.success) {
        toast.success('Free spins added successfully!');
        setShowAddDialog(false);
        setAddForm({
          userId: '',
          gameId: '',
          freespinsCount: 10,
          betLevel: 0,
          validDays: 7
        });
        setSelectedUser(null);
        setSelectedGame(null);
        setUserSearch('');
        setGameSearch('');
        setUserResults([]);
        setGameResults([]);
        await loadFreespins();
      } else {
        toast.error(response.error || 'Failed to add free spins');
      }
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to add free spins');
      }
      console.error('Error adding freespins:', error);
    } finally {
      setAddFormLoading(false);
    }
  };

  // Deactivate freespins
  const deactivateFreespins = async (id: string) => {
    try {
      const response = await clientApi(`/admin/spinshield/freespins/${id}/deactivate`, {
        method: 'POST'
      }) as { success?: boolean; error?: string };
      
      if (response.success) {
        toast.success('Free spins deactivated successfully');
        await loadFreespins();
      } else {
        toast.error(response.error || 'Failed to deactivate free spins');
      }
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to deactivate free spins');
      }
      console.error('Error deactivating freespins:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Free Spins</h2>
          <Badge variant="secondary" className="ml-2">
            {freespins.length.toLocaleString()} total
          </Badge>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Free Spins
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-purple-600" />
                <span>Add Free Spins</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFreespins} className="space-y-6">
              {/* User Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select User</Label>
                {!selectedUser ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by username or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10"
                      />
                      {userSearchLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* User Search Results */}
                    {userResults.length > 0 && (
                      <div className="border rounded-lg bg-card shadow-sm">
                        <div className="max-h-48 overflow-y-auto">
                          {userResults.map((user, index) => (
                            <div
                              key={user.id}
                              className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                                index !== userResults.length - 1 ? 'border-b' : ''
                              }`}
                              onClick={() => {
                                setSelectedUser(user);
                                setUserSearch('');
                                setUserResults([]);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{user.username}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">${user.balance?.toFixed(2) || '0.00'}</div>
                                  <div className="text-xs text-muted-foreground capitalize">{user.role?.toLowerCase() || 'user'}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {userSearch.length >= 2 && userResults.length === 0 && !userSearchLoading && (
                      <div className="text-center py-6 text-muted-foreground">
                        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No users found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-green-900">{selectedUser.username}</div>
                          <div className="text-sm text-green-700">{selectedUser.email}</div>
                          <div className="text-xs text-green-600">Balance: ${selectedUser.balance?.toFixed(2) || '0.00'}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(null);
                          setUserSearch('');
                        }}
                        className="text-green-700 hover:text-green-900 hover:bg-green-100"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Game (Free Spins Supported)</Label>
                {!selectedGame ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Gamepad2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for games that support free spins..."
                        value={gameSearch}
                        onChange={(e) => setGameSearch(e.target.value)}
                        className="pl-10"
                      />
                      {gameSearchLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Game Search Results */}
                    {gameResults.length > 0 && (
                      <div className="border rounded-lg bg-card shadow-sm">
                        <div className="max-h-48 overflow-y-auto">
                          {gameResults.map((game, index) => (
                            <div
                              key={game.id}
                              className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                                index !== gameResults.length - 1 ? 'border-b' : ''
                              }`}
                              onClick={() => {
                                setSelectedGame(game);
                                setGameSearch('');
                                setGameResults([]);
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center overflow-hidden">
                                  {game.image_url ? (
                                    <img 
                                      src={game.image_url} 
                                      alt={game.game_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Gamepad2 className="h-6 w-6 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{game.game_name}</div>
                                  <div className="text-xs text-muted-foreground">{game.provider} • {game.category}</div>
                                  <div className="flex items-center mt-1">
                                    <Gift className="h-3 w-3 text-green-600 mr-1" />
                                    <span className="text-xs text-green-600 font-medium">Free Spins Supported</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {gameSearch.length >= 2 && gameResults.length === 0 && !gameSearchLoading && (
                      <div className="text-center py-6 text-muted-foreground">
                        <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No games found that support free spins</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center overflow-hidden">
                          {selectedGame.image_url ? (
                            <img 
                              src={selectedGame.image_url} 
                              alt={selectedGame.game_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Gamepad2 className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-blue-900">{selectedGame.game_name}</div>
                          <div className="text-sm text-blue-700">{selectedGame.provider} • {selectedGame.category}</div>
                          <div className="flex items-center mt-1">
                            <Gift className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-xs text-green-600 font-medium">Free Spins Supported</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGame(null);
                          setGameSearch('');
                        }}
                        className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Free Spins Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freespinsCount" className="text-sm font-medium">Number of Free Spins</Label>
                  <Select 
                    value={addForm.freespinsCount.toString()} 
                    onValueChange={(value) => setAddForm(prev => ({ ...prev, freespinsCount: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Free Spins</SelectItem>
                      <SelectItem value="10">10 Free Spins</SelectItem>
                      <SelectItem value="15">15 Free Spins</SelectItem>
                      <SelectItem value="20">20 Free Spins</SelectItem>
                      <SelectItem value="25">25 Free Spins</SelectItem>
                      <SelectItem value="50">50 Free Spins</SelectItem>
                      <SelectItem value="100">100 Free Spins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="betLevel" className="text-sm font-medium">Bet Level (SpinShield)</Label>
                  <Select 
                    value={addForm.betLevel.toString()} 
                    onValueChange={(value) => setAddForm(prev => ({ ...prev, betLevel: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bet level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="validDays" className="text-sm font-medium">Valid Duration</Label>
                  <Select 
                    value={addForm.validDays.toString()} 
                    onValueChange={(value) => setAddForm(prev => ({ ...prev, validDays: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary Card */}
              {selectedUser && selectedGame && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <Gift className="h-4 w-4 mr-2" />
                    Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">User:</span>
                      <span className="font-medium text-purple-900">{selectedUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Game:</span>
                      <span className="font-medium text-purple-900">{selectedGame.game_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Free Spins:</span>
                      <span className="font-medium text-purple-900">{addForm.freespinsCount} spins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Bet Level:</span>
                      <span className="font-medium text-purple-900">{addForm.betLevel} (SpinShield)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Valid for:</span>
                      <span className="font-medium text-purple-900">{addForm.validDays} day{addForm.validDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-purple-200">
                      <p className="text-xs text-purple-600">
                        <strong>Note:</strong> Exact bet amount will be determined by the game and shown after the first spin is played.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  disabled={addFormLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addFormLoading || !selectedUser || !selectedGame}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {addFormLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Free Spins...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Add Free Spins
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                <Gift className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{stats.total.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-lg font-bold text-green-600">{stats.active.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Started</p>
                <p className="text-lg font-bold text-yellow-600">{stats.started.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Finished</p>
                <p className="text-lg font-bold text-blue-600">{stats.finished.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-lg font-bold text-red-600">{stats.expired.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Free Spins</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by User ID or Game ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active (Unused)</SelectItem>
                  <SelectItem value="started">Started (In Progress)</SelectItem>
                  <SelectItem value="finished">Finished (Completed)</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select 
                value={`${sortField}-${sortOrder}`} 
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortField(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="valid_until-asc">Expiring Soon</SelectItem>
                  <SelectItem value="freespins_count-desc">Most Spins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Free Spins Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading free spins...</span>
            </div>
          ) : filteredFreespins.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No free spins found</p>
              <p className="text-muted-foreground">Try adjusting your filters or add new free spins</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('user_id')}
                    >
                      <User className="h-4 w-4 inline mr-1" />
                      User ID
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('game_id')}
                    >
                      <Gamepad2 className="h-4 w-4 inline mr-1" />
                      Game ID
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('freespins_count')}
                    >
                      Total Spins
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('freespins_performed')}
                    >
                      Used
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('bet_level')}
                    >
                      Bet Level
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('created_at')}
                    >
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Created
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('valid_until')}
                    >
                      <Clock className="h-4 w-4 inline mr-1" />
                      Expires
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFreespins.map((freespin) => (
                    <TableRow key={freespin.id}>
                      <TableCell className="font-mono text-xs">
                        {freespin.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {freespin.game_id.substring(0, 10)}...
                      </TableCell>
                      <TableCell>{freespin.freespins_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{freespin.freespins_performed}/{freespin.freespins_count}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${Math.min(100, (freespin.freespins_performed / freespin.freespins_count) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>${(freespin.bet_level / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(freespin.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getRemainingTime(freespin.valid_until)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(freespin)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const performed = freespin.freespins_performed;
                          const total = freespin.freespins_count;
                          const active = isActive(freespin);
                          
                          // If finished, no actions available
                          if (performed >= total) {
                            return (
                              <span className="text-sm text-muted-foreground">Completed</span>
                            );
                          }
                          
                          // If active but not finished, show deactivate button
                          if (active) {
                            return (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to deactivate these free spins?')) {
                                    deactivateFreespins(freespin.id);
                                  }
                                }}
                              >
                                Deactivate
                              </Button>
                            );
                          }
                          
                          // If expired and not finished, no actions
                          return (
                            <span className="text-sm text-muted-foreground">Expired</span>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-muted-foreground px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 