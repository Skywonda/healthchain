'use client';

import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select, TextArea } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { toast } from 'react-hot-toast';

interface UploadRecordProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RECORD_TYPES = [
  { value: '', label: 'Select record type' },
  { value: 'MEDICAL_REPORT', label: 'Medical Report' },
  { value: 'LAB_RESULT', label: 'Lab Result' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'IMAGING', label: 'Medical Imaging' },
  { value: 'VACCINE_RECORD', label: 'Vaccine Record' },
  { value: 'ALLERGY_INFO', label: 'Allergy Information' },
];

export function UploadRecord({ isOpen, onClose, onSuccess }: UploadRecordProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordType, setRecordType] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > FILE_SIZE_LIMIT) {
        toast.error('File size too large. Maximum 10MB allowed.');
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Only PDF, images, and Word documents are allowed.');
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !recordType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('recordType', recordType);
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));

      const response = await fetch('/api/records/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      toast.success('Record uploaded successfully!');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload record');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setRecordType('');
    setTags('');
    setIsUploading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Medical Record"
      size="md"
      closeOnOutsideClick={!isUploading}
      className="sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
    >
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            File <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <label className="cursor-pointer">
              <span className="text-sm text-gray-600 font-medium">
                Click to upload or drag and drop
              </span>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG, PNG, DOC, DOCX (Max 10MB)</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            {file && (
              <div className="mt-4 p-3 bg-white rounded-lg border flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate flex-1 mr-2">{file.name}</span>
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              </div>
            )}
          </div>
        </div>

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter record title"
          required
          disabled={isUploading}
        />

        <Select
          label="Record Type"
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          options={RECORD_TYPES}
          required
          disabled={isUploading}
        />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
            disabled={isUploading}
          />
        </div>

        <Input
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Enter tags separated by commas (e.g., routine, annual, urgent)"
          disabled={isUploading}
        />

        <div className="flex space-x-3 pt-4">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !file || !title || !recordType}
            className="flex-1"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Record'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1"
            disabled={isUploading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default UploadRecord;