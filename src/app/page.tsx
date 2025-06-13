import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Users, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">HealthChain</h1>
            </div>
            <div className="space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Secure Health Records
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Take control of your medical data with blockchain-powered security, 
            seamless sharing, and complete privacy control.
          </p>
          <div className="mt-8 space-x-4">
            <Link href="/register">
              <Button size="lg">Start Your Journey</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Lock className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your medical records are encrypted and stored securely. 
                Only you control who can access your data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Complete Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Store all your medical documents, lab results, prescriptions, 
                and imaging in one secure place.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Share your records with healthcare providers instantly 
                while maintaining full control over permissions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}