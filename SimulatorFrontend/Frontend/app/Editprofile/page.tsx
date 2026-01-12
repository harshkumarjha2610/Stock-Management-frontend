'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial form data
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    nationality: 'usa',
    residency: 'resident',
    dob: '1990-07-25',
    walletNumber: 'W123456789',
    tinNumber: '123-45-6789',
    sourceOfFund: 'Employment',
    isPoliticallyExposedPerson: false
  });

  // Profile image state
  const [profileImage, setProfileImage] = useState('/harshimage.jpg');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Update form data with file
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // Clean up previous URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) newErrors.email = 'Valid email is required';
    if (!formData.phone.match(/^\+?[\d\s\-\(\)]{10,}$/)) newErrors.phone = 'Valid phone is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call with FormData
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'avatar' && value instanceof File) {
          submitData.append('avatar', value);
        } else if (key === 'isPoliticallyExposedPerson') {
          submitData.append(key, (value as boolean) ? 'true' : 'false');
        } else {
          submitData.append(key, value as string);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Profile updated with image:', submitData);
      router.push('/profile');
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <header className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={handleBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Image src="/Co-build-logo-02-1.png" alt="CoBuild Logo" width={120} height={32} className="h-8 w-auto" />
            </div>
            <div className="text-sm text-gray-600">
              <span className="text-[#ef6b23] font-semibold hover:underline cursor-pointer">Get Help</span>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Edit Profile</h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">Update your personal and account information</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Info Section with Profile Image */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <svg className="w-7 h-7 text-[#ef6b23] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              
              {/* Profile Image Upload */}
              <div className="text-center mb-8">
                <div 
                  className="mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#ef6b23] to-[#d85a1a] p-1 cursor-pointer hover:shadow-xl transition-all mx-auto overflow-hidden relative group"
                  onClick={handleImageClick}
                >
                  <Image
                    src={imagePreview || profileImage}
                    alt="Profile Picture"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-3">Click image to change profile picture</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.firstName ? 'border-red-300 ring-1 ring-red-200' : ''}`}
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.lastName ? 'border-red-300 ring-1 ring-red-200' : ''}`}
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.email ? 'border-red-300 ring-1 ring-red-200' : ''}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.phone ? 'border-red-300 ring-1 ring-red-200' : ''}`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all ${errors.dob ? 'border-red-300 ring-1 ring-red-200' : ''}`}
                  />
                  {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                </div>
              </div>
            </div>

            {/* Account Info Section - SAME AS BEFORE */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <svg className="w-7 h-7 text-[#ef6b23] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Account Details
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all">
                    <option value="usa">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="in">India</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Residency Status</label>
                  <select name="residency" value={formData.residency} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all">
                    <option value="resident">Resident</option>
                    <option value="non-resident">Non-Resident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Number</label>
                  <input type="text" name="walletNumber" value={formData.walletNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all font-mono" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TIN Number</label>
                  <input type="text" name="tinNumber" value={formData.tinNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source of Funds</label>
                  <select name="sourceOfFund" value={formData.sourceOfFund} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef6b23] focus:border-transparent transition-all">
                    <option value="Employment">Employment</option>
                    <option value="Business">Business</option>
                    <option value="Investment">Investment</option>
                    <option value="Inheritance">Inheritance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPoliticallyExposedPerson"
                    checked={formData.isPoliticallyExposedPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPoliticallyExposedPerson: e.target.checked }))}
                    className="w-4 h-4 text-[#ef6b23] bg-gray-100 border-gray-300 rounded focus:ring-[#ef6b23]"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">Politically Exposed Person (PEP)</label>
                </div>
              </div>
            </div>

            {/* Action Buttons - SAME AS BEFORE */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
              <button type="button" onClick={handleBack} className="flex-1 px-8 py-3 bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-8 py-3 bg-[#ef6b23] text-white rounded-xl font-semibold text-lg hover:bg-[#d85a1a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
