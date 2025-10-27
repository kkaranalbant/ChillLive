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
    let mounted = true;
    let signalQueue: any[] = [];
    let peerReady = false;

    // Setup signal listener IMMEDIATELY, before everything else
    const handleSignal = ({ signalData }: { from: string; signalData: any }) => {
      console.log('Received signal:', signalData.type);

      if (peerReady && peer && !peer.destroyed) {
        // Peer is ready, process signal immediately
        try {
          peer.signal(signalData);
        } catch (error) {
          console.error('Error processing signal:', error);
        }
      } else {
        // Peer not ready yet, queue the signal
        console.log('Peer not ready, queueing signal');
        signalQueue.push(signalData);
      }
    };

    // Add listener FIRST, before any async operations
    socketService.onSignal(handleSignal);
    console.log('Signal listener added for room:', matchData.roomId);

    const initializeWebRTC = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Get user media
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

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
              {
                urls: 'turn:a.relay.metered.ca:80',
                username: '6ae6cd4a1e94f7bb4b5bdb93',
                credential: 'TWVDrjOXnqt0exHV',
              },
              {
                urls: 'turn:a.relay.metered.ca:443',
                username: '6ae6cd4a1e94f7bb4b5bdb93',
                credential: 'TWVDrjOXnqt0exHV',
              },
            ],
          },
        });

        if (!mounted) {
          peer.destroy();
          return;
        }

        peer.on('signal', (data) => {
          console.log('Sending signal:', data.type);
          socketService.sendSignal(matchData.roomId, data as any);
        });

        peer.on('stream', (remoteStream) => {
          console.log('Received remote stream');
          if (mounted) {
            setRemoteStream(remoteStream);
            setIsConnecting(false);
          }
        });

        peer.on('error', (err) => {
          console.error('Peer connection error:', err);
          if (mounted) {
            setIsConnecting(false);
          }
        });

        peer.on('close', () => {
          console.log('Peer connection closed');
        });

        peer.on('connect', () => {
          console.log('Peer connected successfully!');
        });

        peerRef.current = peer;
        peerReady = true;

        // Process any queued signals
        if (signalQueue.length > 0) {
          console.log(`Processing ${signalQueue.length} queued signals`);
          signalQueue.forEach((signalData) => {
            try {
              peer!.signal(signalData);
            } catch (error) {
              console.error('Error processing queued signal:', error);
            }
          });
          signalQueue = [];
        }
      } catch (error: any) {
        console.error('Failed to initialize WebRTC:', error);
        if (mounted) {
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
      }
    };

    initializeWebRTC();

    return () => {
      console.log('Cleaning up WebRTC connection');
      mounted = false;

      // Remove signal listener
      socketService.off('signal', handleSignal);
      console.log('Signal listener removed');

      // Destroy peer connection
      if (peer && !peer.destroyed) {
        peer.destroy();
      }

      // Stop media stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Clear signal queue
      signalQueue = [];
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
