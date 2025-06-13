'use client';

import * as React from 'react';
import {
  IconDashboard,
  IconUsers,
  IconChartBar,
  IconFilter,
  IconWallet,
  IconCloudRain,
  IconBook,
  IconPackage,
  IconSettings,
  IconDeviceGamepad2,
  IconShield
} from '@tabler/icons-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNavItems = {
  core: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard
    }
  ],
  userManagement: [
    {
      title: 'Users',
      url: '/dashboard/users',
      icon: IconUsers
    },
    {
      title: 'Filter',
      url: '/dashboard/filter',
      icon: IconFilter
    }
  ],
  financial: [
    {
      title: 'Cashier',
      url: '/dashboard/cashier',
      icon: IconWallet
    },
    {
      title: 'Affiliates',
      url: '/dashboard/statistics',
      icon: IconChartBar
    },
    {
      title: 'Statsbook',
      url: '/dashboard/statsbook',
      icon: IconBook
    }
  ],
  gaming: [
    {
      title: 'Cases',
      url: '/dashboard/cases',
      icon: IconPackage
    },
    {
      title: 'Slots',
      url: '/dashboard/spinshield',
      icon: IconDeviceGamepad2
    },
    {
      title: 'Rain',
      url: '/dashboard/rain',
      icon: IconCloudRain
    }
  ],
  system: [
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: IconSettings
    }
  ]
};

export default function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Fetch current user on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8080'}/auth/me`, { credentials: 'include' });
        const me = await res.json();
        setUser(me?.user);
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconShield className="!size-5" />
                <span className="text-base font-semibold">Admin Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className='overflow-x-hidden'>
        {/* Core */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.core.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* User Management */}
        <SidebarGroup>
          <SidebarGroupLabel>User Management</SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.userManagement.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Financial */}
        <SidebarGroup>
          <SidebarGroupLabel>Financial</SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.financial.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Gaming */}
        <SidebarGroup>
          <SidebarGroupLabel>Gaming</SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.gaming.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.system.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              className='cursor-default'
            >
              {user && (
                <UserAvatarProfile
                  className='h-8 w-8 rounded-lg'
                  showInfo
                  user={user}
                />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
