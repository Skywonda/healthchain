'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Plus,
  Calendar,
  Tag,
  File,
  Image,
  FileBarChart,
  Pill,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Navigation } from '@/components/dashboard/shared/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { formatDate, formatFileSize, cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import UploadRecord from '@/components/dashboard/patient/upload-record';

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  recordType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  tags: string[];
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

const RECORD_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'MEDICAL_REPORT', label: 'Medical Report' },
  { value: 'LAB_RESULT', label: 'Lab Result' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'IMAGING', label: 'Medical Imaging' },
  { value: 'VACCINE_RECORD', label: 'Vaccine Record' },
  { value: 'ALLERGY_INFO', label: 'Allergy Information' },
];

const getRecordIcon = (recordType: string) => {
  switch (recordType) {
    case 'MEDICAL_REPORT': return FileText;
    case 'LAB_RESULT': return FileBarChart;
    case 'PRESCRIPTION': return Pill;
    case 'IMAGING': return Image;
    case 'VACCINE_RECORD': return Heart;
    case 'ALLERGY_INFO': return Heart;
    default: return File;
  }
};

const getRecordColor = (recordType: string) => {
  switch (recordType) {
    case 'MEDICAL_REPORT': return 'bg-blue-100 text-blue-700';
    case 'LAB_RESULT': return 'bg-green-100 text-green-700';
    case 'PRESCRIPTION': return 'bg-purple-100 text-purple-700';
    case 'IMAGING': return 'bg-orange-100 text-orange-700';
    case 'VACCINE_RECORD': return 'bg-red-100 text-red-700';
    case 'ALLERGY_INFO': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const RecordCard = ({ record }: { record: MedicalRecord }) => {
  const Icon = getRecordIcon(record.recordType);
  const colorClass = getRecordColor(record.recordType);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg', colorClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{record.title}</h3>
              <p className="text-sm text-gray-600">
                {RECORD_TYPES.find(t => t.value === record.recordType)?.label}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {record.description && (
          <p className="text-sm text-gray-600 mb-3">{record.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
          <div>
            <span className="font-medium">File:</span> {record.fileName}
          </div>
          <div>
            <span className="font-medium">Size:</span> {formatFileSize(record.fileSize)}
          </div>
          <div>
            <span className="font-medium">Date:</span> {formatDate(record.createdAt)}
          </div>
          {record.doctor && (
            <div>
              <span className="font-medium">Doctor:</span> Dr. {record.doctor.firstName} {record.doctor.lastName}
            </div>
          )}
        </div>

        {record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function PatientRecordsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Medical Records</h1>
              <p className="text-gray-600">
                View and manage your medical documents
              </p>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Record
            </Button>
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
              options={RECORD_TYPES}
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