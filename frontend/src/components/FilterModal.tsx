'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { userAPI } from '@/lib/api';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export default function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const { user } = useAuthStore();

  const [filters, setFilters] = useState({
    genderFilter: user?.preferences?.genderFilter || 'all',
    minAge: user?.preferences?.ageRange?.min || 18,
    maxAge: user?.preferences?.ageRange?.max || 99,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleApply = async () => {
    try {
      setIsSaving(true);

      const preferences = {
        genderFilter: filters.genderFilter as 'male' | 'female' | 'all',
        ageRange: {
          min: filters.minAge,
          max: filters.maxAge,
        },
      };

      // Save to backend
      await userAPI.updatePreferences(preferences);

      // Apply filters
      onApply(preferences);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Filtreler</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cinsiyet Filtresi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all', label: 'Hepsi' },
                { value: 'male', label: 'Erkek' },
                { value: 'female', label: 'Kadın' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters({ ...filters, genderFilter: option.value })}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    filters.genderFilter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yaş Aralığı: {filters.minAge} - {filters.maxAge}
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Min Yaş: {filters.minAge}</label>
                <input
                  type="range"
                  min={13}
                  max={99}
                  value={filters.minAge}
                  onChange={(e) => setFilters({ ...filters, minAge: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Max Yaş: {filters.maxAge}</label>
                <input
                  type="range"
                  min={13}
                  max={99}
                  value={filters.maxAge}
                  onChange={(e) => setFilters({ ...filters, maxAge: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleApply}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Kaydediliyor...' : 'Uygula'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
