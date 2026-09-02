import { Injectable, inject } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../config/api-config';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class WebRtcService {
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  private hubConnection!: signalR.HubConnection;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();

  private localStreamSource = new BehaviorSubject<MediaStream | null>(null);
  localStream$ = this.localStreamSource.asObservable();

  private remoteStreamsSource = new BehaviorSubject<Map<string, MediaStream>>(new Map());
  remoteStreams$ = this.remoteStreamsSource.asObservable();

  private connectionStateChange = new BehaviorSubject<string>('new');
  connectionState$ = this.connectionStateChange.asObservable();

  private qualityStatusChange = new BehaviorSubject<string>('Unknown');
  qualityStatus$ = this.qualityStatusChange.asObservable();

  private chatMessagesSource = new Subject<any>();
  chatMessages$ = this.chatMessagesSource.asObservable();

  private raisedHandsSource = new BehaviorSubject<Set<string>>(new Set());
  raisedHands$ = this.raisedHandsSource.asObservable();

  private classId!: string;
  private localUserName!: string;
  private isScreenSharing = false;
  private savedCameraStream: MediaStream | null = null;
  private qualityInterval: any;

  // ICE Configuration: STUN and Mock TURN Servers
  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // Configured fallback TURN server for NAT traversal
      {
        urls: 'turn:turn.example.com:3478',
        username: 'aitraining-user',
        credential: 'aitraining-secure-password'
      }
    ],
    iceCandidatePoolSize: 10
  };

  constructor() {
    this.setupDeviceChangeListener();
  }

  async startSession(classId: string, userName: string) {
    this.classId = classId;
    this.localUserName = userName;

    const token = this.authService.getToken();
    const hubUrl = `${API_CONFIG.baseUrl.replace('/api', '')}/hubs/liveclass`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    // SignalR Reconnection Event Listeners
    this.hubConnection.onreconnecting((error) => {
      this.toastr.warning('Lost connection to live class hub. Reconnecting...', 'Network Interrupted');
      this.connectionStateChange.next('connecting');
    });

    this.hubConnection.onreconnected(async (connectionId) => {
      this.toastr.success('Reconnected to live class hub.', 'Connected');
      this.connectionStateChange.next('connected');

      // Re-establish room membership and trigger peer connections rebuild
      try {
        // Clear all stale WebRTC peer connections from mapping before re-registering
        this.peerConnections.forEach((pc, id) => {
          pc.close();
        });
        this.peerConnections.clear();
        this.remoteStreamsSource.next(new Map());

        await this.hubConnection.invoke('JoinSession', this.classId, this.localUserName);
      } catch (err: any) {
        this.toastr.error('Failed to restore connection: ' + err.message);
      }
    });

    this.hubConnection.on('RoomSnapshot', (participants: any[]) => {
      console.log('Active Room Snapshots:', participants);
    });

    this.hubConnection.on('DisconnectDuplicate', (message: string) => {
      this.toastr.error(message, 'Duplicate Logins Exited');
      this.endSession();
    });

    this.hubConnection.on('ClassSessionEnded', (message: string) => {
      this.toastr.warning(message, 'Live Session Closed');
      this.endSession();
    });

    this.hubConnection.on('UserJoined', async (connectionId: string, userId: string, name: string) => {
      this.toastr.info(`${name} has joined the session.`, 'User Joined');
      await this.initiatePeerConnection(connectionId, true);
    });

    this.hubConnection.on('ReceiveSignal', async (senderConnectionId: string, signalData: string) => {
      await this.handleIncomingSignal(senderConnectionId, JSON.parse(signalData));
    });

    this.hubConnection.on('ReceiveChatMessage', (userId: string, senderName: string, message: string, timestamp: string) => {
      this.chatMessagesSource.next({ userId, senderName, message, timestamp: new Date(timestamp) });
    });

    this.hubConnection.on('UserRaisedHand', (userId: string) => {
      const current = new Set(this.raisedHandsSource.value);
      current.add(userId);
      this.raisedHandsSource.next(current);
      this.toastr.info('A student has raised their hand.', 'Hand Raised');
    });

    this.hubConnection.on('UserLoweredHand', (userId: string) => {
      const current = new Set(this.raisedHandsSource.value);
      current.delete(userId);
      this.raisedHandsSource.next(current);
    });

    this.hubConnection.on('UserLeft', (connectionId: string, userId: string) => {
      this.closePeerConnection(connectionId);
    });

    try {
      await this.hubConnection.start();
      await this.acquireLocalMedia();
      await this.hubConnection.invoke('JoinSession', this.classId, this.localUserName);
      this.connectionStateChange.next('connected');
      this.startConnectionQualityMonitoring();
    } catch (err: any) {
      this.toastr.error('Failed to establish session: ' + err.message);
      this.connectionStateChange.next('failed');
    }
  }

  async acquireLocalMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.savedCameraStream = stream;
      this.localStreamSource.next(stream);
    } catch (err: any) {
      this.toastr.error('Camera/Microphone access was denied. Please check your permissions settings.', 'Media Denied');
      throw err;
    }
  }

  setupDeviceChangeListener() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = () => {
        this.toastr.info('Audio/Video hardware device configuration changed.', 'Devices Changed');
      };
    }
  }

  async sendChatMessage(message: string) {
    if (this.hubConnection && this.classId) {
      await this.hubConnection.invoke('SendChatMessage', this.classId, message);
    }
  }

  async raiseHand() {
    if (this.hubConnection && this.classId) {
      await this.hubConnection.invoke('RaiseHand', this.classId);
    }
  }

  async lowerHand() {
    if (this.hubConnection && this.classId) {
      await this.hubConnection.invoke('LowerHand', this.classId);
    }
  }

  private async initiatePeerConnection(connectionId: string, isInitiator: boolean): Promise<RTCPeerConnection> {
    if (this.peerConnections.has(connectionId)) {
      return this.peerConnections.get(connectionId)!;
    }

    const pc = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(connectionId, pc);

    // Bind local media tracks
    const localStream = this.localStreamSource.value;
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    // Capture remote stream tracks
    pc.ontrack = (event) => {
      const remoteMap = new Map(this.remoteStreamsSource.value);
      remoteMap.set(connectionId, event.streams[0]);
      this.remoteStreamsSource.next(remoteMap);
    };

    // Forward ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.hubConnection) {
        this.hubConnection.invoke(
          'SendSignal',
          this.classId,
          connectionId,
          JSON.stringify({ type: 'candidate', candidate: event.candidate })
        );
      }
    };

    // Track Connection State Updates & ICE connection restart
    pc.onconnectionstatechange = () => {
      this.connectionStateChange.next(pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.toastr.warning('Peer connection weak. Attempting automatic ICE restart...', 'Connection Error');
        this.triggerIceRestart(connectionId, pc);
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await this.hubConnection.invoke('SendSignal', this.classId, connectionId, JSON.stringify({ type: 'offer', offer }));
    }

    return pc;
  }

  private async handleIncomingSignal(senderId: string, signal: any) {
    let pc = this.peerConnections.get(senderId);

    if (signal.type === 'offer') {
      pc = await this.initiatePeerConnection(senderId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await this.hubConnection.invoke('SendSignal', this.classId, senderId, JSON.stringify({ type: 'answer', answer }));
    } else if (signal.type === 'answer' && pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
    } else if (signal.type === 'candidate' && pc) {
      await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  }

  private async triggerIceRestart(connectionId: string, pc: RTCPeerConnection) {
    try {
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      await this.hubConnection.invoke('SendSignal', this.classId, connectionId, JSON.stringify({ type: 'offer', offer }));
    } catch (err: any) {
      console.error('ICE Restart failed: ', err);
    }
  }

  async toggleScreenShare() {
    if (this.isScreenSharing) {
      await this.stopScreenSharing();
    } else {
      await this.startScreenSharing();
    }
  }

  private async startScreenSharing() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      this.isScreenSharing = true;

      const screenTrack = screenStream.getVideoTracks()[0];
      this.peerConnections.forEach(pc => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      });

      this.localStreamSource.next(screenStream);

      // Handle user manually clicking native browser "Stop sharing" button
      screenTrack.onended = async () => {
        await this.stopScreenSharing();
      };
    } catch (err: any) {
      this.toastr.warning('Screen sharing was cancelled or failed.');
    }
  }

  private async stopScreenSharing() {
    this.isScreenSharing = false;
    // Re-acquire camera
    await this.acquireLocalMedia();

    const cameraStream = this.localStreamSource.value;
    if (cameraStream) {
      const cameraTrack = cameraStream.getVideoTracks()[0];
      this.peerConnections.forEach(pc => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(cameraTrack);
        }
      });
    }
    this.toastr.info('Camera stream restored.', 'Screen Share Ended');
  }

  private startConnectionQualityMonitoring() {
    this.qualityInterval = setInterval(async () => {
      if (this.peerConnections.size === 0) {
        this.qualityStatusChange.next('Excellent (No Peers)');
        return;
      }

      for (const [id, pc] of this.peerConnections.entries()) {
        try {
          const stats = await pc.getStats();
          stats.forEach(report => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              const rtt = report.currentRoundTripTime * 1000; // ms

              if (rtt < 100) {
                this.qualityStatusChange.next('Excellent');
              } else if (rtt >= 100 && rtt < 280) {
                this.qualityStatusChange.next('Good');
              } else {
                this.qualityStatusChange.next('Poor Connection');
              }
            }
          });
        } catch {
          // ignore stat errors
        }
      }
    }, 3000);
  }

  private closePeerConnection(connectionId: string) {
    const pc = this.peerConnections.get(connectionId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(connectionId);

      const remoteMap = new Map(this.remoteStreamsSource.value);
      remoteMap.delete(connectionId);
      this.remoteStreamsSource.next(remoteMap);
    }
  }

  async endSession() {
    clearInterval(this.qualityInterval);

    if (this.hubConnection && this.classId) {
      await this.hubConnection.invoke('LeaveSession', this.classId);
      await this.hubConnection.stop();
    }

    // Stop streams
    const localStream = this.localStreamSource.value;
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }

    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    this.localStreamSource.next(null);
    this.remoteStreamsSource.next(new Map());
    this.connectionStateChange.next('closed');
  }
}
