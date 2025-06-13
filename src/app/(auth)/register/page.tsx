"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { User, UserCheck, Upload, CheckCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select, TextArea } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { patientRegistrationSchema, doctorRegistrationSchema } from '@/lib/validations';
import type { PatientRegistrationForm, DoctorRegistrationForm } from '@/types/forms';
import { toast } from 'react-hot-toast';
import { UserRole } from '@/types/auth';
import PasswordInput from '@/components/auth/password-input';

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select relationship' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Child', label: 'Child' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Other', label: 'Other' },
];

const SPECIALIZATION_OPTIONS = [
  { value: '', label: 'Select specialization' },
  { value: 'Family Medicine', label: 'Family Medicine' },
  { value: 'Internal Medicine', label: 'Internal Medicine' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'Emergency Medicine', label: 'Emergency Medicine' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Surgery', label: 'Surgery' },
  { value: 'Other', label: 'Other' },
];

const RoleButton = ({ 
  role, 
  icon: Icon, 
  label, 
  description,
  selected, 
  onClick 
}: {
  role: UserRole;
  icon: React.ElementType;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 border-2 rounded-xl transition-all duration-200 ${
      selected
        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-lg scale-[1.02]'
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
    }`}
  >
    {selected && (
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
      </div>
    )}
    <div className={`p-2 sm:p-3 rounded-full ${
      selected ? 'bg-blue-100' : 'bg-gray-100'
    }`}>
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
    <div className="text-center">
      <div className="font-semibold text-sm sm:text-base">{label}</div>
      <div className="text-xs text-gray-500 mt-1 hidden sm:block">{description}</div>
    </div>
  </button>
);

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationFiles, setVerificationFiles] = useState<File[]>([]);
  const router = useRouter();
  const { setLoading } = useAuthStore();

  const schema: any = selectedRole === 'PATIENT' ? patientRegistrationSchema : doctorRegistrationSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: selectedRole,
    }
  });

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    reset({ role });
  };

  const onSubmit = async (data: PatientRegistrationForm | DoctorRegistrationForm) => {
    setLoading(true);

    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (selectedRole === 'DOCTOR' && verificationFiles.length > 0) {
        verificationFiles.forEach((file, index) => {
          formData.append(`verificationDoc${index}`, file);
        });
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      toast.success(
        selectedRole === 'DOCTOR' 
          ? 'Registration successful! Your account is pending verification.'
          : 'Registration successful! You can now log in.'
      );

      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVerificationFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 px-4 sm:py-12">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,1))] -z-10" />
      
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6 pt-8 sm:pb-8 sm:pt-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Create Your Account
          </CardTitle>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Join HealthChain to secure your medical records
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">1</span>
                Choose your account type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RoleButton
                  role="PATIENT"
                  icon={User}
                  label="Patient"
                  description="Access & manage your records"
                  selected={selectedRole === 'PATIENT'}
                  onClick={() => handleRoleChange('PATIENT')}
                />
                <RoleButton
                  role="DOCTOR"
                  icon={UserCheck}
                  label="Healthcare Provider"
                  description="Manage patient records"
                  selected={selectedRole === 'DOCTOR'}
                  onClick={() => handleRoleChange('DOCTOR')}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-6">
                <span className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">2</span>
                Personal Information
              </label>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    {...register('firstName')}
                    label="First Name"
                    placeholder="John"
                    error={errors.firstName}
                    required
                  />
                  <Input
                    {...register('lastName')}
                    label="Last Name"
                    placeholder="Doe"
                    error={errors.lastName}
                    required
                  />
                </div>

                <Input
                  type="email"
                  {...register('email')}
                  label="Email Address"
                  placeholder="john@example.com"
                  error={errors.email}
                  required
                />

                <Input
                  type="tel"
                  {...register('phoneNumber')}
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                  error={errors.phoneNumber}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordInput
                    {...register('password')}
                    label="Password"
                    placeholder="Create a strong password"
                    error={errors.password}
                    required
                    showPassword={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />

                  <PasswordInput
                    {...register('confirmPassword')}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    error={errors.confirmPassword}
                    required
                    showPassword={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
              </div>
            </div>

            {selectedRole === 'PATIENT' ? (
              <>
                <div className="border-t pt-6 space-y-5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-6">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">3</span>
                    Additional Details
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      {...register('dateOfBirth')}
                      label="Date of Birth"
                      error={errors.dateOfBirth}
                      required
                    />
                    <Select
                      {...register('gender')}
                      label="Gender"
                      options={GENDER_OPTIONS}
                      error={errors.gender}
                      required
                    />
                  </div>

                  <TextArea
                    {...register('address')}
                    label="Address"
                    placeholder="Your full address"
                  />

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-5 space-y-4">
                    <h3 className="text-sm sm:text-base font-semibold text-orange-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      Emergency Contact
                    </h3>
                    <Input
                      {...register('emergencyContact.name')}
                      label="Contact Name"
                      placeholder="Emergency contact name"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        type="tel"
                        {...register('emergencyContact.phoneNumber')}
                        label="Phone"
                        placeholder="+1 (555) 123-4567"
                      />
                      <Select
                        {...register('emergencyContact.relationship')}
                        label="Relationship"
                        options={RELATIONSHIP_OPTIONS}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="border-t pt-6 space-y-5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-6">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">3</span>
                    Professional Information
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      {...register('specialization')}
                      label="Specialization"
                      options={SPECIALIZATION_OPTIONS}
                      error={errors.specialization}
                      required
                    />
                    <Input
                      {...register('hospitalName')}
                      label="Hospital/Clinic"
                      placeholder="Your workplace"
                    />
                  </div>

                  <Input
                    {...register('licenseNumber')}
                    label="Medical License Number"
                    placeholder="Enter your license number"
                    error={errors.licenseNumber}
                    required
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Verification Documents</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
                      <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-3" />
                      <label className="cursor-pointer">
                        <span className="text-sm text-gray-600 font-medium">
                          Click to upload medical license, diploma, or certifications
                        </span>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG, or PNG (Max 10MB)</p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {verificationFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {verificationFiles.map((file, index) => (
                            <div key={index} className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 flex items-center justify-between">
                              <span className="truncate flex-1 mr-2">{file.name}</span>
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-6 space-y-4">
              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}