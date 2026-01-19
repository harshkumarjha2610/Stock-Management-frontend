'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UserProfilePage() {
  const router = useRouter();

  // Dummy user data
  const user = {
    id: '01a8a5f1-fa20-476b-b8a6-71d73450aeb3',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    nationality: 'usa',
    residency: 'resident',
    dob: '1990-07-25',
    avatar: '/default-avatar.png',
    walletNumber: 'W123456789',
    tinNumber: '123-45-6789',
    sourceOfFund: 'Employment',
    isPoliticallyExposedPerson: false,
    createdAt: '2025-12-15T10:30:00Z'
  };

  const handleEdit = () => {
    router.push('/Editprofile');
  };

  const handleLogout = () => {
    // POST /user/auth/logout
    router.push('/login');
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single container for Header + Content */}
      <div className="bg-white shadow-sm border-b">
        {/* Header */}
        <header className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Image
                src="/Co-build-logo-02-1.png"
                alt="CoBuild Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <div className="text-sm text-gray-600">
              <span className="text-[#ef6b23] font-semibold hover:underline cursor-pointer">
                Get Help
              </span>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
            
            {/* Left Column */}
            <div className="lg:w-1/3 lg:shrink-0 mb-12 lg:mb-0 text-center lg:text-left">
              {/* Profile Image */}
              {/* Profile Image - Using harshimage.jpg */}
<div className="mx-auto w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-[#ef6b23] to-[#d85a1a] p-1 mb-6 lg:mb-8 mx-auto lg:mx-0 overflow-hidden">
  <Image
    src="/harshimage.jpg"
    alt="Profile Picture"
    width={200}
    height={200}
    className="w-full h-full object-cover rounded-full"
  />
</div>

              
              {/* User basic info - SMALLER FONTS */}
              <div className="mb-10 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 mb-2">{user.email}</p>
                <p className="text-base lg:text-lg text-gray-500">{user.phone}</p>
              </div>

              {/* Action Buttons - SMALLER FONTS & VERTICAL */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={handleEdit}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#ef6b23] text-white rounded-xl font-semibold text-base hover:bg-[#d85a1a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-xl font-semibold text-base hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm hover:shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Personal Info */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 text-[#ef6b23] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Info
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium text-gray-900">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium text-gray-900">{user.phone}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Nationality</span>
                      <span className="font-medium text-gray-900">United States</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Residency</span>
                      <span className="font-medium text-gray-900 capitalize">Resident</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Date of Birth</span>
                      <span className="font-medium text-gray-900">{formatDate(user.dob)}</span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 text-[#ef6b23] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Account Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Wallet</span>
                      <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">{user.walletNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">TIN</span>
                      <span className="font-medium text-gray-900">{user.tinNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Source of Funds</span>
                      <span className="font-medium text-gray-900 capitalize">{user.sourceOfFund}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
