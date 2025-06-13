'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2,
  Settings,
  Gamepad2,
  CreditCard,
  Banknote,
  MessageSquare,
  Users,
  Trophy,
  Gift,
  CloudRain,
  DollarSign,
  Heart,
  ClipboardList,
  Bitcoin,
  Dice1,
  Coins,
  Crown,
  Swords,
  CircleDot,
  Zap,
  Cherry,
  Mountain
} from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';

interface SettingsData {
  // Games
  crash: boolean;
  roulette: boolean;
  cases: boolean;
  battles: boolean;
  coinflip: boolean;
  jackpot: boolean;
  slots: boolean;
  mines: boolean;
  
  // Deposits
  robuxDeposits: boolean;
  limitedDeposits: boolean;
  cryptoDeposits: boolean;
  fiatDeposits: boolean;
  cardDeposits: boolean;
  
  // Withdrawals
  robuxWithdrawals: boolean;
  limitedWithdrawals: boolean;
  cryptoWithdrawals: boolean;
  
  // Site Features
  chat: boolean;
  affiliates: boolean;
  leaderboard: boolean;
  promoCodes: boolean;
  rain: boolean;
  rakeback: boolean;
  tips: boolean;
  surveys: boolean;
}

interface FeatureToggle {
  id: keyof SettingsData;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export function SettingsPageContent() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string[]>([]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await clientApi<SettingsData>('/admin/features');
      setSettings(response);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to fetch settings');
      }
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeProperty = async (id: keyof SettingsData, value: boolean) => {
    if (!settings) return;

    // Optimistic update
    setSettings(prev => prev ? { ...prev, [id]: value } : null);
    setSaving(prev => [...prev, id]);

    try {
      await clientApi(`/admin/features/${id}`, {
        method: 'POST',
        body: JSON.stringify({ enable: value }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast.success(`Successfully ${value ? 'enabled' : 'disabled'} ${id}`);
    } catch (error) {
      // Revert on error
      setSettings(prev => prev ? { ...prev, [id]: !value } : null);
      toast.error(`Failed to update ${id}`);
    } finally {
      setSaving(prev => prev.filter(item => item !== id));
    }
  };

  const gameFeatures: FeatureToggle[] = [
    { id: 'crash', label: 'Crash', description: 'Multiplier crash game', icon: <Dice1 className="h-4 w-4" /> },
    { id: 'roulette', label: 'Roulette', description: 'Classic casino roulette', icon: <CircleDot className="h-4 w-4" /> },
    { id: 'cases', label: 'Cases', description: 'Loot box opening', icon: <Gift className="h-4 w-4" /> },
    { id: 'battles', label: 'Battles', description: 'Case battles between users', icon: <Swords className="h-4 w-4" /> },
    { id: 'coinflip', label: 'Coinflip', description: 'Heads or tails betting', icon: <Coins className="h-4 w-4" /> },
    { id: 'jackpot', label: 'Jackpot', description: 'Progressive jackpot game', icon: <Crown className="h-4 w-4" /> },
    { id: 'slots', label: 'Slots', description: 'Slot machine games', icon: <Cherry className="h-4 w-4" /> },
    { id: 'mines', label: 'Mines', description: 'Minesweeper-style game', icon: <Mountain className="h-4 w-4" /> },
  ];

  const depositFeatures: FeatureToggle[] = [
    { id: 'robuxDeposits', label: 'Robux', description: 'Roblox currency deposits', icon: <Gamepad2 className="h-4 w-4" /> },
    { id: 'limitedDeposits', label: 'Limiteds', description: 'Limited item deposits', icon: <Crown className="h-4 w-4" /> },
    { id: 'cryptoDeposits', label: 'Crypto', description: 'Cryptocurrency deposits', icon: <Bitcoin className="h-4 w-4" /> },
    { id: 'fiatDeposits', label: 'Fiat', description: 'Traditional currency deposits', icon: <Banknote className="h-4 w-4" /> },
    { id: 'cardDeposits', label: 'Credit Card', description: 'Credit/debit card deposits', icon: <CreditCard className="h-4 w-4" /> },
  ];

  const withdrawalFeatures: FeatureToggle[] = [
    { id: 'robuxWithdrawals', label: 'Robux', description: 'Roblox currency withdrawals', icon: <Gamepad2 className="h-4 w-4" /> },
    { id: 'limitedWithdrawals', label: 'Limiteds', description: 'Limited item withdrawals', icon: <Crown className="h-4 w-4" /> },
    { id: 'cryptoWithdrawals', label: 'Crypto', description: 'Cryptocurrency withdrawals', icon: <Bitcoin className="h-4 w-4" /> },
  ];

  const siteFeatures: FeatureToggle[] = [
    { id: 'chat', label: 'Chat', description: 'Global chat system', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'affiliates', label: 'Affiliates', description: 'Referral program', icon: <Users className="h-4 w-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', description: 'User rankings', icon: <Trophy className="h-4 w-4" /> },
    { id: 'promoCodes', label: 'Promo Codes', description: 'Promotional code system', icon: <Gift className="h-4 w-4" /> },
    { id: 'rain', label: 'Rain', description: 'Rain giveaway system', icon: <CloudRain className="h-4 w-4" /> },
    { id: 'rakeback', label: 'Rakeback', description: 'House edge return program', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'tips', label: 'Tips', description: 'User-to-user tipping', icon: <Heart className="h-4 w-4" /> },
    { id: 'surveys', label: 'Surveys', description: 'Survey reward system', icon: <ClipboardList className="h-4 w-4" /> },
  ];

  const renderFeatureSection = (title: string, features: FeatureToggle[], icon: React.ReactNode) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
          <Badge variant="outline" className="ml-auto">
            {features.filter(f => settings?.[f.id]).length}/{features.length} enabled
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                  {feature.icon}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={feature.id} className="text-sm font-medium cursor-pointer">
                    {feature.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
                             <div className="flex items-center space-x-2">
                 {saving.includes(feature.id) && (
                   <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                 )}
                 <Switch
                   id={feature.id}
                   checked={settings?.[feature.id] || false}
                   onCheckedChange={(checked) => changeProperty(feature.id, checked)}
                   disabled={saving.includes(feature.id) || !settings}
                 />
               </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
            <p className="text-muted-foreground">Configure site features and functionality</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Games Active</p>
                  <p className="text-lg font-bold">
                    {gameFeatures.filter(f => settings?.[f.id]).length}/{gameFeatures.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deposits Active</p>
                  <p className="text-lg font-bold">
                    {depositFeatures.filter(f => settings?.[f.id]).length}/{depositFeatures.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                  <Banknote className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Withdrawals Active</p>
                  <p className="text-lg font-bold">
                    {withdrawalFeatures.filter(f => settings?.[f.id]).length}/{withdrawalFeatures.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Site Features</p>
                  <p className="text-lg font-bold">
                    {siteFeatures.filter(f => settings?.[f.id]).length}/{siteFeatures.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {renderFeatureSection(
          'Games',
          gameFeatures,
          <Gamepad2 className="h-5 w-5" />
        )}

        {renderFeatureSection(
          'Deposits',
          depositFeatures,
          <CreditCard className="h-5 w-5" />
        )}

        {renderFeatureSection(
          'Withdrawals',
          withdrawalFeatures,
          <Banknote className="h-5 w-5" />
        )}

        {renderFeatureSection(
          'Site Features',
          siteFeatures,
          <Settings className="h-5 w-5" />
        )}
      </div>
    </div>
  );
} 