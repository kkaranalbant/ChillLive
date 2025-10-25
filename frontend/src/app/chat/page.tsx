'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { socketService } from '@/lib/socket';
import VideoChat from '@/components/VideoChat';
import TextChat from '@/components/TextChat';
import FilterModal from '@/components/FilterModal';
import ReportModal from '@/components/ReportModal';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const {
    isSearching,
    isMatched,
    matchData,
    queueSize,
    setSearching,
    setMatched,
    setMatchData,
    setQueueSize,
    clearMessages,
    reset,
  } = useChatStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Setup socket listeners
    socketService.onMatchFound((data) => {
      console.log('Match found:', data);
      setMatched(true);
      setMatchData(data);
      setSearching(false);
    });

    socketService.onWaitingForMatch((data) => {
      console.log('Waiting for match, queue size:', data.queueSize);
      setQueueSize(data.queueSize);
    });

    socketService.onPartnerSkipped(() => {
      console.log('Partner skipped');
      handleEndChat();
    });

    socketService.onPartnerDisconnected(() => {
      console.log('Partner disconnected');
      handleEndChat();
    });

    socketService.onChatEnded(() => {
      console.log('Chat ended');
      handleEndChat();
    });

    return () => {
      socketService.clearListeners();
    };
  }, [isAuthenticated, router]);

  const requestMediaPermissions = async () => {
    try {
      setIsRequestingPermission(true);
      setPermissionError(null);

      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Permission granted, stop the stream (we'll start it again in WebRTC)
      stream.getTracks().forEach(track => track.stop());

      setHasMediaPermission(true);
      setIsRequestingPermission(false);
      return true;
    } catch (error: any) {
      setIsRequestingPermission(false);

      // Set user-friendly error messages
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionError('Kamera veya mikrofon bulunamadı. Lütfen cihazlarınızı kontrol edin.');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionError('Kamera/mikrofon izni reddedildi. Video chat için izin vermeniz gerekiyor.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setPermissionError('Kamera/mikrofon başka bir uygulama tarafından kullanılıyor olabilir.');
      } else {
        setPermissionError('Kamera/mikrofona erişim hatası: ' + error.message);
      }

      return false;
    }
  };

  const handleFindMatch = async (filters?: any) => {
    // First, request media permissions if not already granted
    if (!hasMediaPermission) {
      const granted = await requestMediaPermissions();
      if (!granted) {
        return; // Don't start matching if permission denied
      }
    }

    setSearching(true);
    clearMessages();
    socketService.findMatch(filters);
  };

  const handleSkip = () => {
    if (matchData) {
      socketService.skipPartner();
      handleEndChat();
      // Automatically find next match
      setTimeout(() => {
        handleFindMatch();
      }, 500);
    }
  };

  const handleEndChat = () => {
    if (matchData) {
      socketService.endChat();
    }
    reset();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Video Chat</h1>
          <span className="text-sm text-gray-600">
            Hoş geldin, {user?.username}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Filtreler"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Çıkış
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 relative">
          {!isSearching && !isMatched ? (
            // Start Screen
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
              <div className="text-center text-white max-w-md px-4">
                <div className="bg-white bg-opacity-20 rounded-full p-12 mb-6 inline-block backdrop-blur-sm">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">Rastgele Biriyle Tanış</h2>
                <p className="text-lg mb-8 opacity-90">
                  Yeni insanlarla tanışmak için butona tıkla
                </p>

                {/* Permission Error */}
                {permissionError && (
                  <div className="mb-6 bg-red-500 bg-opacity-90 text-white px-4 py-3 rounded-lg shadow-lg">
                    <div className="flex items-start gap-2 text-left">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-sm">Kamera/Mikrofon Hatası</p>
                        <p className="text-xs mt-1 opacity-90">{permissionError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleFindMatch()}
                  disabled={isRequestingPermission}
                  className="bg-white text-purple-600 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isRequestingPermission ? 'İzin bekleniyor...' : 'Eşleşmeye Başla'}
                </button>

                {!hasMediaPermission && (
                  <p className="mt-4 text-sm opacity-75">
                    📹 Butona tıkladığınızda kamera ve mikrofon izni istenecek
                  </p>
                )}
              </div>
            </div>
          ) : isSearching && !isMatched ? (
            // Searching Screen
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold mb-2">Eşleşme aranıyor...</h2>
                <p className="text-lg opacity-90">
                  Sırada {queueSize} kişi var
                </p>
                <button
                  onClick={() => setSearching(false)}
                  className="mt-8 px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            // Video Chat
            <VideoChat />
          )}
        </div>

        {/* Chat Section */}
        {isMatched && (
          <div className="w-96 border-l border-gray-200 flex flex-col">
            <TextChat />
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {isMatched && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex justify-center gap-3">
          <button
            onClick={handleSkip}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Sonraki
          </button>

          <button
            onClick={() => setShowReport(true)}
            className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Şikayet Et
          </button>

          <button
            onClick={handleEndChat}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Sohbeti Bitir
          </button>
        </div>
      )}

      {/* Modals */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(filters) => {
          if (isSearching) {
            handleFindMatch(filters);
          }
        }}
      />

      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
}
