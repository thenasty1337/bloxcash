'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Gamepad2, 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingUp,
  Settings,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Smartphone,
  Star,
  Zap,
  Gift,
  Trophy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  EyeOff,
  Edit,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Grid3X3,
  List,
  SlidersHorizontal,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface Game {
  id: string;
  game_id: string;
  game_name: string;
  provider: string;
  provider_name?: string;
  type: string;
  category: string;
  subcategory?: string;
  rtp: number;
  is_new: boolean;
  is_mobile: boolean;
  freerounds_supported: boolean;
  featurebuy_supported: boolean;
  has_jackpot: boolean;
  play_for_fun_supported: boolean;
  image_url?: string;
  image_square?: string;
  image_portrait?: string;
  image_long?: string;
  source?: string;
  system?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface GamesTabProps {
  games: Game[];
  gamesLoading: boolean;
  totalGames: number;
  loading: boolean;
  syncGames: () => Promise<void>;
  syncPopularity: () => Promise<void>;
  gamesPagination: {
    page: number;
    limit: number;
    pages: number;
    total: number;
  };
  setGamesPagination: React.Dispatch<React.SetStateAction<any>>;
  gamesFilters: {
    providers: string[];
    categories: string[];
  };
  gamesSort: {
    field: string;
    order: string;
  };
  setGamesSort: React.Dispatch<React.SetStateAction<any>>;
  activeFilters: {
    search: string;
    provider: string;
    category: string;
    features: string[];
  };
  setActiveFilters: React.Dispatch<React.SetStateAction<any>>;
  advancedFilters: {
    status: string;
    rtpRange: number[];
    gameType: string;
    newGames: boolean;
    hasJackpot: boolean;
    mobileSupported: boolean;
    freeroundsSupported: boolean;
  };
  setAdvancedFilters: React.Dispatch<React.SetStateAction<any>>;
  loadGames: (resetPage?: boolean) => Promise<void>;
}

export function GamesTab({ 
  games, 
  gamesLoading, 
  totalGames, 
  loading, 
  syncGames, 
  syncPopularity,
  gamesPagination,
  setGamesPagination,
  gamesFilters,
  gamesSort,
  setGamesSort,
  activeFilters,
  setActiveFilters,
  advancedFilters,
  setAdvancedFilters,
  loadGames
}: GamesTabProps) {
  const [searchTerm, setSearchTerm] = useState(activeFilters.search);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Game>>({});

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm !== activeFilters.search) {
        console.log('Search term changed:', searchTerm);
        setActiveFilters((prev: any) => ({ ...prev, search: searchTerm }));
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, activeFilters.search]);

  // Effect to trigger loadGames when filters change
  useEffect(() => {
    console.log('Filters changed, loading games...');
    loadGames(true);
  }, [activeFilters.search, activeFilters.provider, activeFilters.category, activeFilters.features]);

  // Effect to trigger loadGames when advanced filters change
  useEffect(() => {
    console.log('Advanced filters changed, loading games...');
    loadGames(true);
  }, [advancedFilters.status, advancedFilters.newGames, advancedFilters.hasJackpot, advancedFilters.mobileSupported, advancedFilters.freeroundsSupported, advancedFilters.gameType, advancedFilters.rtpRange]);

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    const filterValue = value === 'all' ? '' : value;
    setActiveFilters((prev: any) => ({
      ...prev,
      [type]: filterValue
    }));
  };

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (type: string, value: any) => {
    setAdvancedFilters((prev: any) => ({
      ...prev,
      [type]: value
    }));
  };

  // Handle feature filter toggle
  const handleFeatureToggle = (feature: string) => {
    setActiveFilters((prev: any) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f: string) => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setGamesSort((prev: any) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Effect to trigger loadGames when sort changes
  useEffect(() => {
    console.log('Sort changed, loading games...');
    loadGames();
  }, [gamesSort.field, gamesSort.order]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log('Changing page to:', newPage, 'Current page:', gamesPagination.page);
    setGamesPagination((prev: any) => ({ ...prev, page: newPage }));
  };

  // Effect to trigger loadGames when pagination changes
  useEffect(() => {
    loadGames();
  }, [gamesPagination.page, gamesPagination.limit]);

  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    setGamesPagination((prev: any) => ({ 
      ...prev, 
      limit: parseInt(newSize),
      page: 0 
    }));
  };

  // Handle game selection
  const handleGameSelect = (gameId: string, selected: boolean) => {
    if (selected) {
      setSelectedGames(prev => [...prev, gameId]);
    } else {
      setSelectedGames(prev => prev.filter(id => id !== gameId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedGames(games.map(game => game.id));
    } else {
      setSelectedGames([]);
    }
  };

  // Handle game actions
  const handleToggleGameStatus = async (game: Game) => {
    try {
      // This would be an API call to toggle game status
      toast.success(`Game ${game.active ? 'deactivated' : 'activated'} successfully`);
      loadGames();
    } catch (error) {
      toast.error('Failed to update game status');
    }
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setEditFormData({
      game_name: game.game_name,
      provider: game.provider,
      category: game.category,
      subcategory: game.subcategory || '',
      rtp: game.rtp,
      type: game.type,
      is_new: game.is_new,
      is_mobile: game.is_mobile,
      freerounds_supported: game.freerounds_supported,
      featurebuy_supported: game.featurebuy_supported,
      has_jackpot: game.has_jackpot,
      play_for_fun_supported: game.play_for_fun_supported,
      image_url: game.image_url || '',
      image_square: game.image_square || '',
      image_portrait: game.image_portrait || '',
      image_long: game.image_long || '',
      active: game.active,
    });
  };

  const handleSaveGame = async () => {
    if (!editingGame) return;
    
    try {
      // This would be an API call to update the game
      console.log('Saving game:', editFormData);
      toast.success('Game updated successfully');
      setEditingGame(null);
      setEditFormData({});
      loadGames();
    } catch (error) {
      toast.error('Failed to update game');
    }
  };

  const handleCopyGameId = (gameId: string) => {
    navigator.clipboard.writeText(gameId);
    toast.success('Game ID copied to clipboard');
  };

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedGames.length === 0) {
      toast.error('No games selected');
      return;
    }

    try {
      // This would be API calls for bulk actions
      switch (action) {
        case 'activate':
          toast.success(`${selectedGames.length} games activated`);
          break;
        case 'deactivate':
          toast.success(`${selectedGames.length} games deactivated`);
          break;
        case 'export':
          toast.success('Games exported successfully');
          break;
      }
      setSelectedGames([]);
      loadGames();
    } catch (error) {
      toast.error(`Failed to ${action} games`);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilters({
      search: '',
      provider: '',
      category: '',
      features: []
    });
    setAdvancedFilters({
      status: 'all',
      rtpRange: [0, 100],
      gameType: 'all',
      newGames: false,
      hasJackpot: false,
      mobileSupported: false,
      freeroundsSupported: false,
    });
  };

  // Get current select values
  const getSelectValue = (filterValue: string) => {
    return filterValue === '' ? 'all' : filterValue;
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (gamesSort.field !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />;
    }
    return gamesSort.order === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeFilters.search) count++;
    if (activeFilters.provider) count++;
    if (activeFilters.category) count++;
    if (activeFilters.features.length > 0) count += activeFilters.features.length;
    if (advancedFilters.status !== 'all') count++;
    if (advancedFilters.gameType !== 'all') count++;
    if (advancedFilters.newGames) count++;
    if (advancedFilters.hasJackpot) count++;
    if (advancedFilters.mobileSupported) count++;
    if (advancedFilters.freeroundsSupported) count++;
    return count;
  }, [activeFilters, advancedFilters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gamepad2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Game Library</h2>
          <Badge variant="secondary" className="ml-2">
            {totalGames.toLocaleString()} games
          </Badge>
          {selectedGames.length > 0 && (
            <Badge variant="default" className="ml-2">
              {selectedGames.length} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Bulk actions */}
          {selectedGames.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions <MoreHorizontal className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Deactivate Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            onClick={syncPopularity}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="mr-2 h-4 w-4" />
            )}
            Sync Popularity
          </Button>
          <Button
            onClick={syncGames}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Games
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters & Search</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount} active
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by game name, provider, category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </Button>
            </div>

            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={getSelectValue(activeFilters.provider)}
                  onValueChange={(value) => handleFilterChange('provider', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {gamesFilters.providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={getSelectValue(activeFilters.category)}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {gamesFilters.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={advancedFilters.status}
                  onValueChange={(value) => handleAdvancedFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={gamesSort.field}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game_name">Game Name</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="rtp">RTP</SelectItem>
                    <SelectItem value="created_at">Date Added</SelectItem>
                    <SelectItem value="updated_at">Last Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Advanced Filters</h4>
              
              {/* RTP Range */}
              <div className="space-y-2">
                <Label>RTP Range: {advancedFilters.rtpRange[0]}% - {advancedFilters.rtpRange[1]}%</Label>
                <Slider
                  value={advancedFilters.rtpRange}
                  onValueChange={(value) => handleAdvancedFilterChange('rtpRange', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Feature toggles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newGames"
                    checked={advancedFilters.newGames}
                    onCheckedChange={(checked) => handleAdvancedFilterChange('newGames', checked)}
                  />
                  <Label htmlFor="newGames" className="flex items-center space-x-1 text-sm">
                    <Star className="h-3 w-3" />
                    <span>New Games</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobileSupported"
                    checked={advancedFilters.mobileSupported}
                    onCheckedChange={(checked) => handleAdvancedFilterChange('mobileSupported', checked)}
                  />
                  <Label htmlFor="mobileSupported" className="flex items-center space-x-1 text-sm">
                    <Smartphone className="h-3 w-3" />
                    <span>Mobile Support</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasJackpot"
                    checked={advancedFilters.hasJackpot}
                    onCheckedChange={(checked) => handleAdvancedFilterChange('hasJackpot', checked)}
                  />
                  <Label htmlFor="hasJackpot" className="flex items-center space-x-1 text-sm">
                    <Trophy className="h-3 w-3" />
                    <span>Has Jackpot</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeroundsSupported"
                    checked={advancedFilters.freeroundsSupported}
                    onCheckedChange={(checked) => handleAdvancedFilterChange('freeroundsSupported', checked)}
                  />
                  <Label htmlFor="freeroundsSupported" className="flex items-center space-x-1 text-sm">
                    <Gift className="h-3 w-3" />
                    <span>Free Rounds</span>
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Games Display */}
      <Card>
        <CardContent className="p-6">
          {gamesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading games...</span>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No games found</p>
              <p className="text-muted-foreground">Try adjusting your filters or sync games from SpinShield</p>
            </div>
          ) : (
            <>
              {/* Games header with select all */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedGames.length === games.length && games.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label className="text-sm text-muted-foreground">
                    Select all ({games.length} games)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-muted-foreground">Show:</Label>
                  <Select value={gamesPagination.limit.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                      <SelectItem value="96">96</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                  {games.map((game) => (
                    <div key={game.id} className="group relative">
                      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105">
                        <div className="aspect-square relative bg-gradient-to-br from-blue-50 to-purple-50">
                          {/* Selection checkbox */}
                          <div className="absolute top-1 left-1 z-10">
                            <Checkbox
                              checked={selectedGames.includes(game.id)}
                              onCheckedChange={(checked) => handleGameSelect(game.id, checked as boolean)}
                              className="bg-white/80 backdrop-blur-sm h-3 w-3"
                            />
                          </div>

                          {/* Status indicator */}
                          <div className="absolute top-1 right-1 z-10">
                            <div className={`w-2 h-2 rounded-full ${game.active ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>

                          {game.image_square || game.image_url ? (
                            <img
                              src={game.image_square || game.image_url || ''}
                              alt={game.game_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Action buttons overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Game Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditGame(game)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleGameStatus(game)}>
                                  {game.active ? (
                                    <>
                                      <EyeOff className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleCopyGameId(game.game_id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Game ID
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Preview Game
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <CardContent className="p-2">
                          <div className="space-y-1">
                            <div>
                              <h3 className="font-medium text-xs leading-tight line-clamp-2 mb-0.5" title={game.game_name}>
                                {game.game_name}
                              </h3>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {game.provider}
                              </p>
                            </div>
                            
                            {/* Compact badges */}
                            <div className="flex flex-wrap gap-0.5">
                              {game.is_new === true && (
                                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3">
                                  NEW
                                </Badge>
                              )}
                              {game.is_mobile === true && (
                                <Badge variant="outline" className="text-[8px] px-1 py-0 h-3">
                                  MOB
                                </Badge>
                              )}
                              {game.has_jackpot === true && (
                                <Badge variant="default" className="text-[8px] px-1 py-0 h-3">
                                  JP
                                </Badge>
                              )}
                              {game.freerounds_supported === true && (
                                <Badge variant="outline" className="text-[8px] px-1 py-0 h-3">
                                  FR
                                </Badge>
                              )}
                            </div>
                            
                            {game.rtp && game.rtp > 0 && (
                              <p className="text-[9px] text-muted-foreground">
                                RTP: {game.rtp}%
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                // List view
                <div className="space-y-2">
                  {games.map((game) => (
                    <Card key={game.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedGames.includes(game.id)}
                          onCheckedChange={(checked) => handleGameSelect(game.id, checked as boolean)}
                        />
                        
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0">
                          {game.image_square || game.image_url ? (
                            <img
                              src={game.image_square || game.image_url || ''}
                              alt={game.game_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-sm truncate">{game.game_name}</h3>
                            <div className={`w-2 h-2 rounded-full ${game.active ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {game.provider} • {game.category}{game.rtp && game.rtp > 0 ? ` • RTP: ${game.rtp}%` : ''}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {game.is_new === true && <Badge variant="secondary" className="text-xs">New</Badge>}
                            {game.is_mobile === true && <Badge variant="outline" className="text-xs">Mobile</Badge>}
                            {game.has_jackpot === true && <Badge variant="default" className="text-xs">Jackpot</Badge>}
                            {game.freerounds_supported === true && <Badge variant="outline" className="text-xs">Bonus</Badge>}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditGame(game)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleGameStatus(game)}>
                                {game.active ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyGameId(game.game_id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy ID
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {gamesPagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {gamesPagination.page * gamesPagination.limit + 1} to {Math.min((gamesPagination.page + 1) * gamesPagination.limit, gamesPagination.total)} of {gamesPagination.total} games
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(0)}
                      disabled={gamesPagination.page === 0}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(gamesPagination.page - 1)}
                      disabled={gamesPagination.page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm text-muted-foreground px-4">
                      Page {gamesPagination.page + 1} of {gamesPagination.pages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(gamesPagination.page + 1)}
                      disabled={gamesPagination.page >= gamesPagination.pages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(gamesPagination.pages - 1)}
                      disabled={gamesPagination.page >= gamesPagination.pages - 1}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive Edit Game Dialog */}
      <Dialog open={!!editingGame} onOpenChange={() => setEditingGame(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Game: {editingGame?.game_name}</span>
            </DialogTitle>
            <DialogDescription>
              Edit all game details, settings, and metadata
            </DialogDescription>
          </DialogHeader>
          {editingGame && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="game_name">Game Name *</Label>
                    <Input
                      id="game_name"
                      value={editFormData.game_name || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, game_name: e.target.value }))}
                      placeholder="Enter game name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider *</Label>
                      <Select
                        value={editFormData.provider || ''}
                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, provider: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {gamesFilters.providers.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Game Type</Label>
                      <Select
                        value={editFormData.type || ''}
                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="slot">Slot</SelectItem>
                          <SelectItem value="table">Table Game</SelectItem>
                          <SelectItem value="live">Live Casino</SelectItem>
                          <SelectItem value="instant">Instant Win</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={editFormData.category || ''}
                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {gamesFilters.categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Input
                        id="subcategory"
                        value={editFormData.subcategory || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                        placeholder="Enter subcategory"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rtp">RTP (Return to Player) %</Label>
                    <Input
                      id="rtp"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={editFormData.rtp || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, rtp: parseFloat(e.target.value) || 0 }))}
                      placeholder="96.50"
                    />
                  </div>
                </div>

                {/* Game Features */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Game Features</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_new"
                        checked={editFormData.is_new || false}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_new: checked }))}
                      />
                      <Label htmlFor="is_new" className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>New Game</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_mobile"
                        checked={editFormData.is_mobile || false}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_mobile: checked }))}
                      />
                      <Label htmlFor="is_mobile" className="flex items-center space-x-1">
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile Support</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="has_jackpot"
                        checked={editFormData.has_jackpot || false}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, has_jackpot: checked }))}
                      />
                      <Label htmlFor="has_jackpot" className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4" />
                        <span>Has Jackpot</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="freerounds_supported"
                        checked={editFormData.freerounds_supported || false}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, freerounds_supported: checked }))}
                      />
                      <Label htmlFor="freerounds_supported" className="flex items-center space-x-1">
                        <Gift className="h-4 w-4" />
                        <span>Free Rounds</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featurebuy_supported"
                        checked={editFormData.featurebuy_supported || false}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, featurebuy_supported: checked }))}
                      />
                      <Label htmlFor="featurebuy_supported" className="flex items-center space-x-1">
                        <Zap className="h-4 w-4" />
                        <span>Feature Buy</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="play_for_fun_supported"
                        checked={editFormData.play_for_fun_supported || false}
                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, play_for_fun_supported: checked }))}
                      />
                      <Label htmlFor="play_for_fun_supported" className="flex items-center space-x-1">
                        <Gamepad2 className="h-4 w-4" />
                        <span>Demo Mode</span>
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Status</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={editFormData.active || false}
                      onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, active: checked }))}
                    />
                    <Label htmlFor="active" className="flex items-center space-x-1">
                      {editFormData.active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{editFormData.active ? 'Active' : 'Inactive'}</span>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Game Images</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Default Image URL</Label>
                    <Input
                      id="image_url"
                      value={editFormData.image_url || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/game-image.jpg"
                    />
                    {editFormData.image_url && (
                      <div className="mt-2">
                        <img
                          src={editFormData.image_url}
                          alt="Default preview"
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_square">Square Image URL</Label>
                    <Input
                      id="image_square"
                      value={editFormData.image_square || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, image_square: e.target.value }))}
                      placeholder="https://example.com/game-square.jpg"
                    />
                    {editFormData.image_square && (
                      <div className="mt-2">
                        <img
                          src={editFormData.image_square}
                          alt="Square preview"
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_portrait">Portrait Image URL</Label>
                    <Input
                      id="image_portrait"
                      value={editFormData.image_portrait || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, image_portrait: e.target.value }))}
                      placeholder="https://example.com/game-portrait.jpg"
                    />
                    {editFormData.image_portrait && (
                      <div className="mt-2">
                        <img
                          src={editFormData.image_portrait}
                          alt="Portrait preview"
                          className="w-24 h-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_long">Landscape Image URL</Label>
                    <Input
                      id="image_long"
                      value={editFormData.image_long || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, image_long: e.target.value }))}
                      placeholder="https://example.com/game-landscape.jpg"
                    />
                    {editFormData.image_long && (
                      <div className="mt-2">
                        <img
                          src={editFormData.image_long}
                          alt="Landscape preview"
                          className="w-48 h-24 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Game Info Display */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Game Information</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div><strong>Game ID:</strong> {editingGame.game_id}</div>
                    <div><strong>Source:</strong> {editingGame.source || 'N/A'}</div>
                    <div><strong>System:</strong> {editingGame.system || 'N/A'}</div>
                    <div><strong>Created:</strong> {new Date(editingGame.created_at).toLocaleDateString()}</div>
                    <div><strong>Updated:</strong> {new Date(editingGame.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => setEditingGame(null)}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => handleCopyGameId(editingGame?.game_id || '')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Game ID
              </Button>
              <Button onClick={handleSaveGame}>
                <Settings className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 