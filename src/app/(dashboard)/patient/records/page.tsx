'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Upload, 
  Search, 
  Plus,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Navigation } from '@/components/dashboard/shared/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'react-hot-toast';
import UploadRecord from '@/components/dashboard/patient/upload-record';
import { MedicalRecord } from '@/types/medical-records';
import RecordCard from '@/components/dashboard/patient/record-card';
import { RECORD_TYPE_OPTIONS } from '@/lib/constants';
import { WalletConnect } from '@/components/blockchain/wallet-connect';
import { RequireWallet } from '@/components/blockchain/require-wallet';


export default function PatientRecordsPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'upload') {
      setShowUploadModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadRecords = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockRecords: MedicalRecord[] = [
          {
            id: '1',
            title: 'Blood Test Results',
            description: 'Comprehensive metabolic panel and CBC',
            recordType: 'LAB_RESULT',
            fileName: 'blood_test_2024.pdf',
            fileSize: 245760,
            mimeType: 'application/pdf',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            tags: ['routine', 'annual'],
            doctor: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              specialization: 'Internal Medicine'
            }
          },
          {
            id: '2',
            title: 'Chest X-Ray',
            description: 'Pre-surgery chest imaging',
            recordType: 'IMAGING',
            fileName: 'chest_xray.jpg',
            fileSize: 1024000,
            mimeType: 'image/jpeg',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            tags: ['surgery', 'imaging'],
            doctor: {
              firstName: 'Michael',
              lastName: 'Chen',
              specialization: 'Radiology'
            }
          },
          {
            id: '3',
            title: 'Prescription - Lisinopril',
            description: 'Blood pressure medication',
            recordType: 'PRESCRIPTION',
            fileName: 'prescription_lisinopril.pdf',
            fileSize: 89600,
            mimeType: 'application/pdf',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            tags: ['hypertension', 'daily'],
            doctor: {
              firstName: 'Emily',
              lastName: 'Davis',
              specialization: 'Cardiology'
            }
          }
        ];
        
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
      } catch (error) {
        toast.error('Failed to load records');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedType) {
      filtered = filtered.filter(record => record.recordType === selectedType);
    }

    setFilteredRecords(filtered);
  }, [records, searchQuery, selectedType]);

  if (!user || user.role !== 'PATIENT') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="PATIENT" />
      
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-8 px-6 pt-4 pb-8 bg-gradient-to-r from-blue-100 to-green-100 border-b shadow dark:bg-gradient-to-r dark:from-blue-900 dark:to-green-900 gap-4 relative">
            <div className="absolute left-6 top-4">
              <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-200">My Medical Records</h1>
              <p className="text-green-800 dark:text-green-200">
                View and manage your medical documents
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={RECORD_TYPE_OPTIONS}
              label=""
              placeholder="Filter by type"
            />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select className="flex-1 p-2 border border-gray-300 rounded-lg">
                <option value="">All dates</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="year">Last year</option>
              </select>
            </div>
          </div>

          <RequireWallet>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading your records...</p>
              </div>
            ) : filteredRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {records.length === 0 ? 'No records found' : 'No records match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {records.length === 0 
                    ? 'Upload your first medical record to get started'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {records.length === 0 && (
                  <Button onClick={() => setShowUploadModal(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Record
                  </Button>
                )}
              </div>
            )}
          </RequireWallet>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadRecord 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}