import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Users, FileText } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">HealthChain</h1>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            About HealthChain
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Revolutionizing healthcare data management with blockchain technology
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To empower patients with complete control over their medical data 
                while ensuring the highest levels of security and privacy through 
                blockchain technology.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Security First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Every piece of data is encrypted and stored securely. Our blockchain 
                infrastructure ensures immutable audit trails and tamper-proof records.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>For Everyone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Designed for patients, healthcare providers, and institutions. 
                Seamless integration with existing healthcare systems.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Complete Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Store all types of medical records - from prescriptions to imaging 
                results - in one secure, accessible location.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 mb-6">
            Ready to take control of your health data?
          </p>
          <Link href="/register">
            <Button size="lg">Get Started Today</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}