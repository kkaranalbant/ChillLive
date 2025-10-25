import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { socketService } from '@/lib/socket';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const { matchData } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!matchData) return;

    let peer: SimplePeer.Instance | null = null;
    let stream: MediaStream | null = null;

    const initializeWebRTC = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Get user media
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setLocalStream(stream);

        // Create peer connection
        // The user with smaller ID will be the initiator
        const myUserId = user?._id || '';
        const initiator = myUserId < matchData.partnerId;

        console.log('WebRTC Setup:', { myUserId, partnerId: matchData.partnerId, initiator });

        peer = new SimplePeer({
          initiator,
          trickle: true,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              {
                urls: 'turn:a.relay.metered.ca:80',
                username: '6ae6cd4a1e94f7bb4b5bdb93',
                credential: 'TWVDrjOXnqt0exHV',
              },
              {
                urls: 'turn:a.relay.metered.ca:80?transport=tcp',
                username: '6ae6cd4a1e94f7bb4b5bdb93',
                credential: 'TWVDrjOXnqt0exHV',
              },
              {
                urls: 'turn:a.relay.metered.ca:443',
                username: '6ae6cd4a1e94f7bb4b5bdb93',
                credential: 'TWVDrjOXnqt0exHV',
              },
              {
                urls: 'turn:a.relay.metered.ca:443?transport=tcp',
                username: '6ae6cd4a1e94f7bb4b5bdb93',
                credential: 'TWVDrjOXnqt0exHV',
              },
            ],
          },
        });

        peer.on('signal', (data) => {
          console.log('Sending signal:', data.type);
          socketService.sendSignal(matchData.roomId, data as any);
        });

        peer.on('stream', (remoteStream) => {
          console.log('Received remote stream');
          setRemoteStream(remoteStream);
          setIsConnecting(false);
        });

        peer.on('error', (err) => {
          console.error('Peer connection error:', err);
          setIsConnecting(false);
        });

        peer.on('close', () => {
          console.log('Peer connection closed');
        });

        peerRef.current = peer;

        // Setup signal listener
        const handleSignal = ({ signalData }: { from: string; signalData: any }) => {
          console.log('Received signal:', signalData.type);
          try {
            if (peer && !peer.destroyed) {
              peer.signal(signalData);
            }
          } catch (error) {
            console.error('Error processing signal:', error);
          }
        };

        socketService.onSignal(handleSignal);

        // Cleanup function
        return () => {
          console.log('Cleaning up WebRTC connection');

          // Remove signal listener
          socketService.off('signal', handleSignal);

          // Destroy peer connection
          if (peer) {
            peer.destroy();
          }

          // Stop media stream
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
        };
      } catch (error: any) {
        console.error('Failed to initialize WebRTC:', error);
        setIsConnecting(false);

        // Set user-friendly error messages
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setError('Kamera veya mikrofon bulunamadı. Lütfen cihazlarınızı kontrol edin.');
        } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError('Kamera/mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setError('Kamera/mikrofon başka bir uygulama tarafından kullanılıyor olabilir.');
        } else {
          setError('Kamera/mikrofona erişim hatası: ' + error.message);
        }
      }
    };

    const cleanupPromise = initializeWebRTC();

    return () => {
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
      cleanup();
    };
  }, [matchData, user?._id]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const cleanup = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Stop remote stream
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setIsConnecting(false);
  };

  return {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    isConnecting,
    error,
    toggleVideo,
    toggleAudio,
    cleanup,
  };
};
