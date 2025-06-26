'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  FileText, 
  Users, 
  Shield, 
  Share2, 
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  TestTube 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { WalletStatus } from '@/components/blockchain/wallet-status';
import { cn, getInitials } from '@/lib/utils';

interface NavigationProps {
  userRole: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export function Navigation({ userRole }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();

  const getNavigationItems = () => {
    const baseItems = [
      { href: `/${userRole.toLowerCase()}`, icon: Home, label: 'Dashboard' },
    ];

    if (userRole === 'PATIENT') {
      return [
        ...baseItems,
        { href: '/patient/records', icon: FileText, label: 'My Records' },
        { href: '/patient/consent', icon: Shield, label: 'Consent Management' },
        { href: '/patient/sharing', icon: Share2, label: 'Data Sharing' },
        { href: '/patient/audit', icon: Activity, label: 'Access Log' },
        // Temporary test page - remove in production
        { href: '/test-wallet', icon: TestTube, label: 'Wallet Test' },
      ];
    }

    if (userRole === 'DOCTOR') {
      return [
        ...baseItems,
        { href: '/doctor/patients', icon: Users, label: 'Patients' },
        { href: '/doctor/requests', icon: Shield, label: 'Access Requests' },
        { href: '/doctor/reports', icon: FileText, label: 'Medical Reports' },
        // Temporary test page - remove in production
        { href: '/test-wallet', icon: TestTube, label: 'Wallet Test' },
      ];
    }

    if (userRole === 'ADMIN') {
      return [
        ...baseItems,
        { href: '/admin/verification', icon: Shield, label: 'Verification' },
        { href: '/admin/system', icon: Settings, label: 'System' },
        { href: '/admin/audit', icon: Activity, label: 'Audit Trail' },
        // Temporary test page - remove in production
        { href: '/test-wallet', icon: TestTube, label: 'Wallet Test' },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">HealthChain</h1>
            <p className="text-sm text-muted-foreground capitalize">{userRole.toLowerCase()}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Notifications */}
            <Link
              href="/notifications"
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors relative',
                pathname === '/notifications'
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 bg-destructive rounded-full" />
              )}
            </Link>
          </nav>

          {/* Wallet status section */}
          <div className="p-4 border-t border-b">
            <div className="text-xs font-medium text-gray-700 mb-2">Blockchain</div>
            <WalletStatus />
          </div>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}