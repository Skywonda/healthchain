'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Download, 
  User,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Navigation } from '@/components/dashboard/shared/navigation';
import { useAuthStore } from '@/stores/auth-store';
import StatCard from '@/components/dashboard/stat-card';
import AccessLogCard from '@/components/dashboard/access-log-card';
import { AccessLog } from '@/types/audit';


interface ActivitySummary {
  totalAccesses: number;
  uniqueAccessors: number;
  recordsAccessed: number;
  downloadsCount: number;
}

const ACCESS_TYPE_OPTIONS = [
  { value: '', label: 'All Access Types' },
  { value: 'READ', label: 'Read Access' },
  { value: 'WRITE', label: 'Write Access' },
  { value: 'EMERGENCY', label: 'Emergency Access' },
];

const TIME_RANGE_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last 3 months' },
];


export default function PatientAuditPage() {
  const { user } = useAuthStore();
  
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
  const [summary, setSummary] = useState<ActivitySummary>({
    totalAccesses: 0,
    uniqueAccessors: 0,
    recordsAccessed: 0,
    downloadsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccessType, setSelectedAccessType] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');


  useEffect(() => {
    const loadAccessLogs = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockLogs: AccessLog[] = [
          {
            id: '1',
            recordId: 'rec1',
            record: {
              title: 'Blood Test Results',
              recordType: 'LAB_RESULT'
            },
            accessor: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              specialization: 'Internal Medicine',
              hospitalName: 'City General Hospital'
            },
            accessType: 'READ',
            purpose: 'Annual checkup review',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessedFields: ['results', 'date', 'lab_values'],
            downloadedFiles: ['blood_test_2024.pdf'],
            accessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            duration: 180,
          },
          {
            id: '2',
            recordId: 'rec2',
            record: {
              title: 'Chest X-Ray',
              recordType: 'IMAGING'
            },
            accessor: {
              firstName: 'Michael',
              lastName: 'Chen',
              specialization: 'Radiology',
              hospitalName: 'Medical Center'
            },
            accessType: 'WRITE',
            purpose: 'Radiology report addition',
            ipAddress: '10.0.0.25',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            accessedFields: ['image', 'report', 'findings'],
            downloadedFiles: [],
            accessedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            duration: 420,
          },
          {
            id: '3',
            recordId: 'rec3',
            record: {
              title: 'Emergency Medical History',
              recordType: 'MEDICAL_REPORT'
            },
            accessor: {
              firstName: 'Emily',
              lastName: 'Davis',
              specialization: 'Emergency Medicine',
              hospitalName: 'Emergency Care Center'
            },
            accessType: 'EMERGENCY',
            purpose: 'Emergency treatment',
            ipAddress: '172.16.0.45',
            userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
            accessedFields: ['allergies', 'medications', 'conditions'],
            downloadedFiles: [],
            accessedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 90,
          }
        ];
        
        setAccessLogs(mockLogs);
        setFilteredLogs(mockLogs);
        
        // Calculate summary
        const uniqueAccessors = new Set(mockLogs.map(log => log.accessor.firstName + log.accessor.lastName)).size;
        const uniqueRecords = new Set(mockLogs.map(log => log.recordId)).size;
        const totalDownloads = mockLogs.reduce((sum, log) => sum + log.downloadedFiles.length, 0);
        
        setSummary({
          totalAccesses: mockLogs.length,
          uniqueAccessors,
          recordsAccessed: uniqueRecords,
          downloadsCount: totalDownloads,
        });
        
      } catch (error) {
        console.error('Failed to load access logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccessLogs();
  }, []);

  useEffect(() => {
    let filtered = accessLogs;

    if (searchQuery) {
      filtered = filtered.filter(log =>
        `${log.accessor.firstName} ${log.accessor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedAccessType) {
      filtered = filtered.filter(log => log.accessType === selectedAccessType);
    }
    if (selectedTimeRange) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedTimeRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setDate(now.getDate() - 30);
          break;
        case 'quarter':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      if (selectedTimeRange !== '') {
        filtered = filtered.filter(log => new Date(log.accessedAt) >= filterDate);
      }
    }

    setFilteredLogs(filtered);
  }, [accessLogs, searchQuery, selectedAccessType, selectedTimeRange]);

  if (!user || user.role !== 'PATIENT') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="PATIENT" />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Access Activity</h1>
            <p className="text-gray-600">
              Monitor who has accessed your medical records
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Activity}
              title="Total Accesses"
              value={summary.totalAccesses}
              subtitle="All time"
            />
            <StatCard
              icon={User}
              title="Healthcare Providers"
              value={summary.uniqueAccessors}
              subtitle="Unique accessors"
            />
            <StatCard
              icon={FileText}
              title="Records Accessed"
              value={summary.recordsAccessed}
              subtitle="Different records"
            />
            <StatCard
              icon={Download}
              title="Downloads"
              value={summary.downloadsCount}
              subtitle="Files downloaded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by doctor or record..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedAccessType}
              onChange={(e) => setSelectedAccessType(e.target.value)}
              options={ACCESS_TYPE_OPTIONS}
            />
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              options={TIME_RANGE_OPTIONS}
            />
            <div className="flex items-center">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading access logs...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-6">
              {filteredLogs.map((log) => (
                <AccessLogCard key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {accessLogs.length === 0 ? 'No access activity' : 'No matching access logs'}
              </h3>
              <p className="text-gray-600">
                {accessLogs.length === 0 
                  ? 'No healthcare providers have accessed your records yet'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}