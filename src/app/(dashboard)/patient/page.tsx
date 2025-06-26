'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Users, 
  Shield, 
  Activity, 
  Upload, 
  Share2, 
  Calendar,
  Heart,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/dashboard/shared/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useRecordsStore } from '@/stores/records-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import QuickActionCard from '@/components/dashboard/quick-action-card';
import StatCard from '@/components/dashboard/stat-card';

interface DashboardStats {
  totalRecords: number;
  activeConsents: number;
  recentAccess: number;
  upcomingAppointments: number;
}

interface RecentActivity {
  id: string;
  type: 'record_upload' | 'consent_granted' | 'data_accessed' | 'appointment';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'info';
}


const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const iconMap = {
    record_upload: FileText,
    consent_granted: Shield,
    data_accessed: Users,
    appointment: Calendar,
  };

  const statusColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const Icon = iconMap[activity.type];

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="p-2 bg-blue-50 rounded-full">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-600">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDateTime(activity.timestamp)}
        </p>
      </div>
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusColors[activity.status]
      )}>
        {activity.status}
      </span>
    </div>
  );
};

export default function PatientDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { records } = useRecordsStore();
  const { notifications, unreadCount } = useNotificationsStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    activeConsents: 0,
    recentAccess: 0,
    upcomingAppointments: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalRecords: 12,
          activeConsents: 3,
          recentAccess: 8,
          upcomingAppointments: 2,
        });

        setRecentActivity([
          {
            id: '1',
            type: 'record_upload',
            title: 'Lab Results Uploaded',
            description: 'Blood work results from Quest Diagnostics',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'success'
          },
          {
            id: '2',
            type: 'consent_granted',
            title: 'Access Granted',
            description: 'Dr. Smith granted access to cardiac records',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'info'
          },
          {
            id: '3',
            type: 'data_accessed',
            title: 'Records Accessed',
            description: 'Dr. Johnson viewed your prescription history',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'info'
          },
          {
            id: '4',
            type: 'appointment',
            title: 'Upcoming Appointment',
            description: 'Cardiology consultation tomorrow at 2:00 PM',
            timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'warning'
          },
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (!user || user.role !== 'PATIENT') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="PATIENT" />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-gray-600">
              Here's an overview of your health records and recent activity.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={FileText}
              title="Total Records"
              value={stats.totalRecords}
              subtitle="Medical documents"
              trend={{ value: "+2", isPositive: true }}
            />
            <StatCard
              icon={Shield}
              title="Active Consents"
              value={stats.activeConsents}
              subtitle="Shared with providers"
            />
            <StatCard
              icon={Activity}
              title="Recent Access"
              value={stats.recentAccess}
              subtitle="This month"
            />
            <StatCard
              icon={Calendar}
              title="Appointments"
              value={stats.upcomingAppointments}
              subtitle="This week"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                icon={Upload}
                title="Upload Records"
                description="Add new medical documents"
                onClick={() => router.push('/patient/records?action=upload')}
                color="blue"
              />
              <QuickActionCard
                icon={Share2}
                title="Share Data"
                description="Grant provider access"
                onClick={() => router.push('/patient/sharing')}
                color="green"
              />
              <QuickActionCard
                icon={Shield}
                title="Manage Consent"
                description="Control data permissions"
                onClick={() => router.push('/patient/consent')}
                color="purple"
              />
              <QuickActionCard
                icon={Activity}
                title="View Activity"
                description="See access history"
                onClick={() => router.push('/patient/audit')}
                color="orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/patient/audit')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading activity...</p>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {recentActivity.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No recent activity
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Health Summary & Notifications */}
            <div className="space-y-6">
              {/* Health Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Health Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Blood Type</span>
                    <span className="font-medium">{user.patient?.bloodType || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Allergies</span>
                    <span className="font-medium">
                      {user.patient?.allergies?.length || 0} recorded
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Conditions</span>
                    <span className="font-medium">
                      {user.patient?.chronicConditions?.length || 0} active
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Medications</span>
                    <span className="font-medium">
                      {user.patient?.medications?.length || 0} current
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => router.push('/patient/profile')}
                  >
                    Update Health Info
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/notifications')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 py-3">
                      <div className={cn(
                        'p-1 rounded-full',
                        notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                      )}>
                        <AlertCircle className={cn(
                          'h-4 w-4',
                          notification.isRead ? 'text-gray-400' : 'text-blue-600'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No notifications
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}