'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2,
  Settings,
  Gamepad2,
  Activity,
  Receipt,
  Gift,
  CircleDot
} from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';

// Import tab components
import { SettingsTab } from './tabs/settings-tab';
import { GamesTab } from './tabs/games-tab';
import { SessionsTab } from './tabs/sessions-tab';
import { TransactionsTab } from './tabs/transactions-tab';
import { FreespinsTab } from './tabs/freespins-tab';

interface SpinShieldSettings {
  id?: string;
  api_login: string;
  api_password: string;
  endpoint: string;
  callback_url: string;
  salt_key: string;
  active: boolean;
}

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

interface GameSession {
  id: string;
  session_id: string;
  user_id: string;
  game_id: string;
  currency: string;
  status: 'active' | 'completed' | 'expired';
  started_at: string;
  ended_at?: string;
}

interface Transaction {
  id: string;
  user_id: string;
  game_id?: string;
  round_id?: string;
  call_id?: string;
  action: 'balance' | 'debit' | 'credit';
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

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
  updated_at: string;
}

export function SpinShieldPageContent() {
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<SpinShieldSettings>({
    api_login: '',
    api_password: '',
    endpoint: '',
    callback_url: '',
    salt_key: '',
    active: false
  });

  // Games state
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [totalGames, setTotalGames] = useState(0);
  const [gamesPagination, setGamesPagination] = useState({
    page: 0,
    limit: 48,
    pages: 0,
    total: 0
  });
  const [gamesFilters, setGamesFilters] = useState({
    providers: [] as string[],
    categories: [] as string[]
  });
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    provider: '',
    category: '',
    features: [] as string[]
  });
  const [gamesSort, setGamesSort] = useState({
    field: 'game_name',
    order: 'asc'
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'all', // all, active, inactive
    rtpRange: [0, 100],
    gameType: 'all',
    newGames: false,
    hasJackpot: false,
    mobileSupported: false,
    freeroundsSupported: false,
  });

  // Sessions state
  const [sessions, setSessions] = useState<GameSession[]>([]);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Freespins state
  const [freespins, setFreespins] = useState<Freespin[]>([]);

  // Load settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await clientApi('/admin/spinshield/settings') as any;
      if (response.settings) {
        setSettings({
          ...response.settings,
          api_password: '' // Don't populate password field for security
        });
      }
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to load SpinShield settings');
      }
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load games
  const loadGames = async (resetPage = false) => {
    try {
      setGamesLoading(true);
      
      // If resetPage is true, update pagination state first
      if (resetPage) {
        setGamesPagination(prev => ({ ...prev, page: 0 }));
      }
      
      const page = resetPage ? 0 : gamesPagination.page;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: gamesPagination.limit.toString(),
        sort: gamesSort.field,
        order: gamesSort.order,
        search: activeFilters.search || '',
        provider: activeFilters.provider || '',
        category: activeFilters.category || '',
        features: activeFilters.features.join(',') || '',
        status: advancedFilters.status || 'all',
        gameType: advancedFilters.gameType || 'all',
        newGames: advancedFilters.newGames.toString(),
        hasJackpot: advancedFilters.hasJackpot.toString(),
        mobileSupported: advancedFilters.mobileSupported.toString(),
        freeroundsSupported: advancedFilters.freeroundsSupported.toString(),
        rtpMin: advancedFilters.rtpRange[0].toString(),
        rtpMax: advancedFilters.rtpRange[1].toString()
      });

      console.log('Loading games with params:', Object.fromEntries(params));
      const response = await clientApi(`/admin/spinshield/games?${params}`) as any;
      console.log('Games response:', response);
      
      if (response.games) {
        setGames(response.games);
        setGamesPagination(response.pagination);
        setGamesFilters(response.filters);
        setTotalGames(response.pagination.total);
      }
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to load games');
      }
      console.error('Error loading games:', error);
    } finally {
      setGamesLoading(false);
    }
  };

  // Load sessions
  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await clientApi('/admin/spinshield/sessions') as any;
      setSessions(response.sessions || []);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to load sessions');
      }
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await clientApi('/admin/spinshield/transactions') as any;
      setTransactions(response.transactions || []);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to load transactions');
      }
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load freespins
  const loadFreespins = async () => {
    try {
      setLoading(true);
      const response = await clientApi('/admin/spinshield/freespins') as any;
      setFreespins(response.freespins || []);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to load free spins');
      }
      console.error('Error loading freespins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync games
  const syncGames = async () => {
    try {
      setLoading(true);
      const response = await clientApi('/admin/spinshield/sync-games', {
        method: 'POST'
      }) as any;
      
      if (response.success) {
        toast.success('Games synced successfully');
        loadGames(true);
      } else {
        toast.error(response.error || 'Failed to sync games');
      }
    } catch (error) {
      toast.error('Failed to sync games');
      console.error('Error syncing games:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync popularity
  const syncPopularity = async () => {
    try {
      setLoading(true);
      const response = await clientApi('/admin/spinshield/sync-popularity', {
        method: 'POST'
      }) as any;
      
      if (response.success) {
        toast.success('Popularity data synced successfully');
        loadGames(true);
      } else {
        toast.error(response.error || 'Failed to sync popularity data');
      }
    } catch (error) {
      toast.error('Failed to sync popularity data');
      console.error('Error syncing popularity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Load data for the selected tab
    switch (tab) {
      case 'games':
        if (games.length === 0) loadGames();
        break;
      case 'sessions':
        if (sessions.length === 0) loadSessions();
        break;
      case 'transactions':
        if (transactions.length === 0) loadTransactions();
        break;
      case 'freespins':
        if (freespins.length === 0) loadFreespins();
        break;
    }
  };

  // Initialize data
  useEffect(() => {
    loadSettings();
    loadGames();
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SpinShield Slots</h1>
            <p className="text-muted-foreground">Manage your slot games integration and administration</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${settings.active ? 'bg-green-500' : 'bg-red-500'}`} />
            <Badge variant={settings.active ? 'default' : 'secondary'}>
              {settings.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <Gamepad2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Games</p>
                  <p className="text-lg font-bold">{totalGames.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <p className="text-lg font-bold">
                    {sessions.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                  <Receipt className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{transactions.length.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                  <Gift className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Free Spins</p>
                  <p className="text-lg font-bold">
                    {freespins.filter(f => f.active).length.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CircleDot className="h-5 w-5" />
            <span>SpinShield Administration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="games" className="flex items-center space-x-2">
                <Gamepad2 className="h-4 w-4" />
                <span>Games</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center space-x-2">
                <Receipt className="h-4 w-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="freespins" className="flex items-center space-x-2">
                <Gift className="h-4 w-4" />
                <span>Free Spins</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games" className="mt-6">
              <GamesTab
                games={games}
                gamesLoading={gamesLoading}
                totalGames={totalGames}
                loading={loading}
                syncGames={syncGames}
                syncPopularity={syncPopularity}
                gamesPagination={gamesPagination}
                setGamesPagination={setGamesPagination}
                gamesFilters={gamesFilters}
                gamesSort={gamesSort}
                setGamesSort={setGamesSort}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                advancedFilters={advancedFilters}
                setAdvancedFilters={setAdvancedFilters}
                loadGames={loadGames}
              />
            </TabsContent>

            <TabsContent value="sessions" className="mt-6">
              <SessionsTab sessions={sessions} loading={loading} />
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <TransactionsTab transactions={transactions} loading={loading} />
            </TabsContent>

            <TabsContent value="freespins" className="mt-6">
              <FreespinsTab 
                freespins={freespins} 
                loading={loading} 
                loadFreespins={loadFreespins}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsTab
                settings={settings}
                setSettings={setSettings}
                loading={loading}
                loadSettings={loadSettings}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 