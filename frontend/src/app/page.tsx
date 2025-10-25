'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loadUserFromStorage, guestLogin, isLoading } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, router]);

  const handleQuickStart = async () => {
    try {
      await guestLogin();
      router.push('/chat');
    } catch (error) {
      console.error('Quick start failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Logo/Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Video Chat
              </h1>
              <p className="text-gray-600">
                Rastgele insanlarla tanış, sohbet et
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-lg p-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Video & Metin Chat</h3>
                  <p className="text-sm text-gray-600">Hem görüntülü hem yazılı sohbet</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-pink-100 rounded-lg p-2">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Akıllı Eşleştirme</h3>
                  <p className="text-sm text-gray-600">Tercihlere göre eşleşme</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Güvenli & Anonim</h3>
                  <p className="text-sm text-gray-600">Gizlilik korumalı sohbet</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleQuickStart}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Yükleniyor...' : 'Hızlı Başla (Misafir)'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">veya</span>
                </div>
              </div>

              <Link
                href="/login"
                className="block w-full text-center bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Giriş Yap
              </Link>

              <p className="text-center text-sm text-gray-600">
                Hesabın yok mu?{' '}
                <Link href="/register" className="text-purple-600 font-semibold hover:underline">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white text-sm mt-6">
            Kullanarak{' '}
            <a href="#" className="underline hover:text-gray-200">Kullanım Koşulları</a>
            {' '}ve{' '}
            <a href="#" className="underline hover:text-gray-200">Gizlilik Politikası</a>
            'nı kabul ediyorsunuz
          </p>
        </div>
      </div>
    </div>
  );
}
