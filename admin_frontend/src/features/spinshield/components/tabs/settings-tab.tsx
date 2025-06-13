'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Settings, Shield, Key, Link, Server } from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';

interface SpinShieldSettings {
  id?: string;
  api_login: string;
  api_password: string;
  endpoint: string;
  callback_url: string;
  salt_key: string;
  active: boolean;
}

interface SettingsTabProps {
  settings: SpinShieldSettings;
  setSettings: React.Dispatch<React.SetStateAction<SpinShieldSettings>>;
  loading: boolean;
  loadSettings: () => Promise<void>;
}

export function SettingsTab({ settings, setSettings, loading, loadSettings }: SettingsTabProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SpinShieldSettings>(settings);

  // Update form data when settings change
  React.useEffect(() => {
    setFormData({ ...settings, api_password: '' }); // Don't populate password
  }, [settings]);

  // Handle input changes
  const handleInputChange = (field: keyof SpinShieldSettings, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Only send password if it's not empty
      const dataToSend: Partial<SpinShieldSettings> = { ...formData };
      if (!dataToSend.api_password) {
        dataToSend.api_password = undefined;
      }
      
      const response = await clientApi('/admin/spinshield/settings', {
        method: 'POST',
        body: JSON.stringify(dataToSend)
      }) as { success?: boolean; error?: string };
      
      if (response.success) {
        toast.success('Settings saved successfully');
        await loadSettings(); // Reload settings
      } else {
        toast.error(response.error || 'Failed to save settings');
      }
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to save settings');
      }
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">SpinShield API Configuration</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>API Credentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api_login">API Login</Label>
                <Input
                  id="api_login"
                  type="text"
                  value={formData.api_login}
                  onChange={(e) => handleInputChange('api_login', e.target.value)}
                  placeholder="Enter API login"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api_password">API Password</Label>
                <Input
                  id="api_password"
                  type="password"
                  value={formData.api_password}
                  onChange={(e) => handleInputChange('api_password', e.target.value)}
                  placeholder={settings.id ? "Leave blank to keep current password" : "Enter API password"}
                  required={!settings.id}
                />
                {settings.id && (
                  <p className="text-sm text-muted-foreground">
                    Leave blank to keep the current password
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salt_key">Salt Key</Label>
                <Input
                  id="salt_key"
                  type="text"
                  value={formData.salt_key}
                  onChange={(e) => handleInputChange('salt_key', e.target.value)}
                  placeholder="Enter salt key for secure communication"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  A unique key used for secure communication with SpinShield
                </p>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-4 w-4" />
                <span>API Endpoints</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  type="url"
                  value={formData.endpoint}
                  onChange={(e) => handleInputChange('endpoint', e.target.value)}
                  placeholder="https://api.spinshield.com"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  The SpinShield API endpoint URL
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="callback_url">Callback URL</Label>
                <Input
                  id="callback_url"
                  type="url"
                  value={formData.callback_url}
                  onChange={(e) => handleInputChange('callback_url', e.target.value)}
                  placeholder="https://yourdomain.com/api/spinshield/callback"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This URL is used by SpinShield to send game events to your platform
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="active" className="text-sm font-medium">
                  Enable SpinShield Integration
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>Integration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Current Status: {' '}
                  <span className={settings.active ? 'text-green-600' : 'text-red-600'}>
                    {settings.active ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {settings.active 
                    ? 'SpinShield integration is enabled and active' 
                    : 'SpinShield integration is disabled'
                  }
                </p>
              </div>
              
              <div className={`w-3 h-3 rounded-full ${settings.active ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData({ ...settings, api_password: '' })}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 