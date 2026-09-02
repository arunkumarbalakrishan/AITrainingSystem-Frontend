import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LiveClassService } from '../../core/services/live-class.service';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, interval } from 'rxjs';
import { WebRtcService } from '../../core/services/webrtc.service';

@Component({
  selector: 'app-live-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4" style="font-family: 'Outfit', sans-serif;">
      <!-- Banner/Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div
            class="live-classes-banner p-3 p-sm-4 p-md-5 rounded-4 position-relative overflow-hidden"
            style="box-shadow: var(--shadow-md);"
          >
            <div class="position-absolute" style="top: -20px; right: -20px; opacity: 0.15;">
              <svg width="250" height="250" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span
              class="badge mb-3 fw-bold text-uppercase px-3 py-2 live-banner-badge"
              style="font-size: 0.75rem; letter-spacing: 0.5px;"
              >Live Classroom</span
            >
            <h2 class="fw-bold mb-2">Interactive Scheduled Lectures</h2>
            <p class="mb-0 live-banner-desc max-w-xl">
              Learn directly from industry experts, ask questions, and engage in real-time
              discussions with fellow students via In-App WebRTC or Zoom.
            </p>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Upcoming Sessions List -->
        <div [class]="isTrainer || isAdmin ? 'col-lg-8' : 'col-12'">
          <div
            class="card border-0 shadow-sm p-4 mb-4"
            style="background: var(--card-bg); border-radius: 16px;"
          >
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 class="fw-bold mb-1" style="color: var(--text-dark);">
                  Upcoming Live Sessions
                </h5>
                <p class="text-muted small mb-0">
                  Join sessions to interact live with instructors and peers.
                </p>
              </div>
              <button
                (click)="loadLiveClasses()"
                class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm"
                style="width: 40px; height: 40px;"
              >
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>

            <!-- Loading Spinner -->
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && liveClasses.length === 0" class="text-center py-5">
              <div
                class="rounded-circle bg-light d-inline-flex p-4 mb-3"
                style="color: var(--primary-color);"
              >
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h6 class="fw-bold mb-1" style="color: var(--text-dark);">
                No Live Sessions Scheduled
              </h6>
              <p class="text-muted small max-w-sm mx-auto mb-0">
                Check back later or ask your trainer to schedule a live lecture.
              </p>
            </div>

            <!-- Live Class Cards Grid -->
            <div *ngIf="!loading && liveClasses.length > 0" class="row g-4">
              <div *ngFor="let item of liveClasses" class="col-md-6 col-12">
                <div
                  class="card h-100 border-0 p-4 transition-all hover-translate"
                  [style.border-top]="
                    item.isActive
                      ? '4px solid #10b981'
                      : item.isSoon
                        ? '4px solid #f59e0b'
                        : '4px solid var(--primary-color)'
                  "
                  style="background: var(--background-color); border-radius: 14px; box-shadow: var(--shadow-sm); transition: transform 0.2s;"
                >
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center gap-1.5">
                      <span
                        class="badge text-uppercase px-2.5 py-1.5 fw-semibold"
                        [ngClass]="
                          item.isActive
                            ? 'bg-success-subtle text-success'
                            : item.isSoon
                              ? 'bg-warning-subtle text-warning'
                              : 'bg-primary-subtle text-primary'
                        "
                        style="font-size: 0.7rem;"
                      >
                        {{
                          item.isActive ? 'Active Now' : item.isSoon ? 'Starting Soon' : 'Upcoming'
                        }}
                      </span>
                      <span
                        class="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1"
                        style="font-size: 0.68rem;"
                      >
                        <i class="bi bi-broadcast me-1"></i>{{ item.provider || 'Jitsi' }}
                      </span>
                    </div>
                    <span class="text-muted small fw-semibold">{{ item.countdown }}</span>
                  </div>

                  <h5 class="fw-bold mb-2 text-dark">{{ item.title }}</h5>
                  <p
                    class="text-muted small mb-3 flex-grow-1"
                    style="line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;"
                  >
                    {{ item.description }}
                  </p>

                  <div class="border-top pt-3 border-secondary-subtle">
                    <div class="d-flex align-items-center gap-2 mb-2 small text-muted">
                      <i class="bi bi-clock"></i>
                      <span
                        >{{ item.startTimeLocal | date: 'medium' }} ({{
                          item.durationInMinutes
                        }}
                        mins)</span
                      >
                    </div>
                    <div class="d-flex align-items-center gap-2 mb-2 small text-muted">
                      <i class="bi bi-person-circle"></i>
                      <span>Trainer: {{ item.trainerName }}</span>
                    </div>
                    <div
                      *ngIf="item.courseTitle"
                      class="d-flex align-items-center gap-2 mb-3 small text-muted"
                    >
                      <i class="bi bi-book"></i>
                      <span>Course: {{ item.courseTitle }}</span>
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-2">
                    <button
                      (click)="joinMeeting(item)"
                      class="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                      [ngClass]="
                        item.isActive || item.isSoon
                          ? 'btn-success glow-btn'
                          : 'btn-outline-primary'
                      "
                      style="border-radius: 8px; font-size: 0.85rem; padding: 10px;"
                    >
                      <i class="bi bi-camera-video"></i>
                      <span>{{
                        item.isActive || item.isSoon
                          ? (item.provider === 'Jitsi' ? 'Join In-App Video Room' : 'Join Zoom Meeting')
                          : 'Meeting Details'
                      }}</span>
                    </button>
                    <button
                      *ngIf="item.meetingLink"
                      (click)="openExternalLink(item)"
                      class="btn btn-light px-3"
                      title="Open External Tab"
                      style="border-radius: 8px;"
                    >
                      <i class="bi bi-box-arrow-up-right"></i>
                    </button>
                    <button
                      *ngIf="isTrainer || isAdmin"
                      (click)="deleteLiveClass(item.id)"
                      class="btn btn-outline-danger px-3"
                      style="border-radius: 8px;"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule Form (Trainer/Admin only) -->
        <div *ngIf="isTrainer || isAdmin" class="col-lg-4">
          <div
            class="card border-0 shadow-sm p-4 mb-4"
            style="background: var(--card-bg); border-radius: 16px;"
          >
            <h5 class="fw-bold mb-1" style="color: var(--text-dark);">Schedule Live Session</h5>
            <p class="text-muted small mb-4">Create a new live lecture for students.</p>

            <form (ngSubmit)="scheduleLiveClass()" #scheduleForm="ngForm">
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Lecture Title</label>
                <input
                  type="text"
                  class="form-control"
                  name="title"
                  [(ngModel)]="newClass.title"
                  required
                  placeholder="e.g. AWS & Microservices Live Q&A"
                  style="border-radius: 8px;"
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Description</label>
                <textarea
                  class="form-control"
                  name="description"
                  [(ngModel)]="newClass.description"
                  required
                  rows="3"
                  placeholder="Brief outline of topics..."
                  style="border-radius: 8px;"
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Streaming Provider</label>
                <select
                  class="form-select"
                  name="provider"
                  [(ngModel)]="newClass.provider"
                  style="border-radius: 8px;"
                >
                  <option value="Jitsi">Jitsi WebRTC (In-App Video Room)</option>
                  <option value="Zoom">Zoom OAuth API (Server Meeting)</option>
                  <option value="Custom">Custom Link Entry</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Start Date & Time</label>
                <input
                  type="datetime-local"
                  class="form-control"
                  name="startTime"
                  [(ngModel)]="newClass.startTime"
                  required
                  style="border-radius: 8px;"
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Duration (Minutes)</label>
                <input
                  type="number"
                  class="form-control"
                  name="durationInMinutes"
                  [(ngModel)]="newClass.durationInMinutes"
                  required
                  min="5"
                  placeholder="60"
                  style="border-radius: 8px;"
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted"
                  >Associate with Course (Optional)</label
                >
                <select
                  class="form-select"
                  name="courseId"
                  [(ngModel)]="newClass.courseId"
                  style="border-radius: 8px;"
                >
                  <option [value]="null">No Course Association</option>
                  <option *ngFor="let course of courses" [value]="course.id">
                    {{ course.title }}
                  </option>
                </select>
              </div>

              <div *ngIf="newClass.provider === 'Custom'" class="mb-4">
                <label class="form-label small fw-bold text-muted">Custom Meeting URL</label>
                <input
                  type="url"
                  class="form-control"
                  name="meetingLink"
                  [(ngModel)]="newClass.meetingLink"
                  placeholder="https://zoom.us/j/..."
                  style="border-radius: 8px;"
                />
              </div>

              <button
                type="submit"
                [disabled]="!scheduleForm.form.valid || scheduling"
                class="btn btn-premium w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style="border-radius: 8px;"
              >
                <i *ngIf="scheduling" class="spinner-border spinner-border-sm"></i>
                <i *ngIf="!scheduling" class="bi bi-plus-circle"></i>
                <span>Schedule Session</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- In-App Premium WebRTC Video Room Modal -->
      <div
        *ngIf="showInAppRoomModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 1050;"
      >
        <div class="modal-dialog modal-xl modal-dialog-centered" style="max-width: 95vw;">
          <div class="modal-content border-0 shadow-lg bg-dark text-white rounded-4 overflow-hidden" style="border: 1px solid #333 !important;">
            <div class="modal-header border-secondary p-3 d-flex justify-content-between align-items-center bg-black bg-opacity-40">
              <div class="d-flex align-items-center gap-3">
                <span class="badge bg-danger rounded-pill px-3 py-1.5 animate-pulse">
                  <i class="bi bi-record-circle me-1"></i> LIVE CLASSROOM
                </span>
                <h5 class="modal-title fw-bold mb-0 text-white">
                  {{ selectedMeetingRoom?.title }}
                </h5>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  (click)="openExternalLink(selectedMeetingRoom)"
                  class="btn btn-sm btn-outline-light rounded-pill px-3"
                >
                  <i class="bi bi-box-arrow-up-right me-1"></i> Open External
                </button>
                <button
                  (click)="closeInAppRoomModal()"
                  class="btn btn-sm btn-danger rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style="width: 32px; height: 32px;"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <!-- In-App WebRTC Core Stream Area -->
            <div class="modal-body p-0 d-flex flex-column flex-lg-row bg-dark" style="height: 78vh; overflow: hidden;">
              
              <!-- Video Feeds Section -->
              <div class="flex-grow-1 p-3 d-flex flex-column" style="background: #111; overflow-y: auto; height: 100%;">
                
                <!-- Status/Details Header -->
                <div class="d-flex justify-content-between align-items-center mb-3 px-2 text-white-50 small">
                  <div class="d-flex gap-2">
                    <span class="badge border border-secondary text-light">
                      State: {{ rtcState }}
                    </span>
                    <span class="badge border border-secondary" [ngClass]="qualityStatus === 'Excellent' ? 'text-success' : qualityStatus === 'Good' ? 'text-warning' : 'text-danger'">
                      Quality: {{ qualityStatus }}
                    </span>
                  </div>
                  <div class="small">
                    <span *ngIf="isMuted" class="text-danger me-2"><i class="bi bi-mic-mute-fill"></i> Muted</span>
                    <span *ngIf="!hasCamera" class="text-danger"><i class="bi bi-camera-video-off-fill"></i> Camera Off</span>
                  </div>
                </div>

                <!-- Video Stream Grid -->
                <div class="video-grid-container flex-grow-1 d-flex align-items-center justify-content-center" style="min-height: 50vh;">
                  <div class="video-grid w-100 h-100 d-grid gap-3" [style.grid-template-columns]="getGridColumns()">
                    
                    <!-- Local stream video box -->
                    <div class="video-card position-relative border border-secondary rounded-3 overflow-hidden bg-black" style="aspect-ratio: 16/9;">
                      <video [srcObject]="localStream" autoplay playsinline [muted]="true" class="w-100 h-100 object-fit-cover"></video>
                      <div class="position-absolute bottom-0 start-0 p-2 bg-dark bg-opacity-75 text-white small rounded-end-3">
                        You ({{ localUserName }})
                      </div>
                    </div>

                    <!-- Remote streams video boxes -->
                    <div *ngFor="let entry of remoteStreams | keyvalue" class="video-card position-relative border border-secondary rounded-3 overflow-hidden bg-black" style="aspect-ratio: 16/9;">
                      <video [srcObject]="entry.value" autoplay playsinline class="w-100 h-100 object-fit-cover"></video>
                      <div class="position-absolute bottom-0 start-0 p-2 bg-dark bg-opacity-75 text-white small rounded-end-3">
                        Participant ({{ entry.key.substring(0, 5) }})
                        <span *ngIf="isUserHandRaised(entry.key)" class="badge bg-warning ms-2">✋ Hand Raised</span>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Bottom Control Actions Bar -->
                <div class="d-flex justify-content-center gap-3 p-3 mt-3 bg-secondary bg-opacity-10 rounded-3">
                  <button (click)="toggleAudio()" class="btn px-4" [ngClass]="isMuted ? 'btn-danger' : 'btn-outline-light'" style="border-radius: 8px;">
                    <i class="bi" [ngClass]="isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'"></i>
                    <span class="ms-2 d-none d-sm-inline">{{ isMuted ? 'Unmute' : 'Mute' }}</span>
                  </button>
                  
                  <button (click)="toggleVideo()" class="btn px-4" [ngClass]="!hasCamera ? 'btn-danger' : 'btn-outline-light'" style="border-radius: 8px;">
                    <i class="bi" [ngClass]="!hasCamera ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'"></i>
                    <span class="ms-2 d-none d-sm-inline">{{ !hasCamera ? 'Turn Camera On' : 'Turn Off' }}</span>
                  </button>
                  
                  <button (click)="toggleSharing()" class="btn px-4" [ngClass]="isShareActive ? 'btn-success' : 'btn-outline-light'" style="border-radius: 8px;">
                    <i class="bi bi-display"></i>
                    <span class="ms-2 d-none d-sm-inline">{{ isShareActive ? 'Stop Share' : 'Share Screen' }}</span>
                  </button>

                  <button (click)="toggleHand()" class="btn px-4" [ngClass]="handRaised ? 'btn-warning' : 'btn-outline-light'" style="border-radius: 8px;">
                    <span>✋</span>
                    <span class="ms-2 d-none d-sm-inline">{{ handRaised ? 'Lower Hand' : 'Raise Hand' }}</span>
                  </button>
                </div>

              </div>

              <!-- Sidebar Room interaction / Realtime Chat -->
              <div class="webrtc-sidebar d-flex flex-column border-start border-secondary p-3 bg-opacity-40" style="width: 340px; background: #181818; height: 100%;">
                
                <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center">
                  <span>In-Class Chat</span>
                  <span class="badge bg-primary">{{ remoteStreams.size + 1 }} Online</span>
                </h6>

                <!-- Chat Box log -->
                <div class="flex-grow-1 overflow-y-auto mb-3 p-3 bg-black bg-opacity-50 rounded-3" style="height: 250px;" #chatContainer>
                  <div *ngFor="let msg of chatMessages" class="mb-3 small">
                    <div class="text-white-50 fw-bold d-flex justify-content-between">
                      <span>{{ msg.senderName }}</span>
                      <span class="text-muted" style="font-size: 0.65rem;">{{ msg.timestamp | date:'shortTime' }}</span>
                    </div>
                    <div class="text-white p-2.5 rounded-2 mt-1" style="background: rgba(255,255,255,0.06); word-break: break-all; line-height: 1.4;">
                      {{ msg.message }}
                    </div>
                  </div>
                  <div *ngIf="chatMessages.length === 0" class="text-center text-white-50 mt-5 small">
                    No messages yet. Say hello to the class!
                  </div>
                </div>

                <!-- Input messaging field -->
                <div class="input-group mb-4">
                  <input type="text" [(ngModel)]="messageToSend" (keyup.enter)="sendChat()" placeholder="Send message..." class="form-control bg-dark border-secondary text-white small" style="border-radius: 8px 0 0 8px; box-shadow: none;" />
                  <button (click)="sendChat()" class="btn btn-primary px-3" style="border-radius: 0 8px 8px 0;"><i class="bi bi-send"></i></button>
                </div>

                <!-- Active hand raise requests container -->
                <h6 class="fw-bold mb-2 small text-uppercase text-white-50">Hand Raised Requests</h6>
                <div class="bg-black bg-opacity-25 rounded-3 p-3 overflow-y-auto flex-grow-0" style="max-height: 140px;">
                  <div *ngFor="let hand of raisedHandsList" class="small text-warning d-flex align-items-center gap-2 mb-2">
                    <span>✋</span>
                    <span class="text-white fw-semibold">{{ hand }}</span>
                  </div>
                  <div *ngIf="raisedHandsList.length === 0" class="text-muted small italic">
                    No hands raised currently.
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .text-indigo {
        color: var(--primary-color);
      }
      .bg-success-subtle {
        background-color: rgba(16, 185, 129, 0.15);
      }
      .bg-warning-subtle {
        background-color: rgba(245, 158, 11, 0.15);
      }
      .bg-primary-subtle {
        background-color: rgba(132, 204, 22, 0.15);
      }
      .glow-btn {
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        animation: pulse-glow 2s infinite;
      }
      @keyframes pulse-glow {
        0% {
          box-shadow: 0 0 5px rgba(16, 185, 129, 0.4);
        }
        50% {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.7);
        }
        100% {
          box-shadow: 0 0 5px rgba(16, 185, 129, 0.4);
        }
      }
      .hover-translate:hover {
        transform: translateY(-4px);
      }
      .animate-pulse {
        animation: opacity-pulse 1.5s infinite ease-in-out;
      }
      @keyframes opacity-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
  ],
})
export class LiveClassesComponent implements OnInit, OnDestroy {
  private liveClassService = inject(LiveClassService);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private sanitizer = inject(DomSanitizer);
  private webRtcService = inject(WebRtcService);

  liveClasses: any[] = [];
  courses: any[] = [];
  loading = false;
  scheduling = false;

  isTrainer = false;
  isAdmin = false;

  selectedMeetingRoom: any = null;
  safeMeetingUrl: SafeResourceUrl | null = null;
  showInAppRoomModal = false;

  // WebRTC configurations
  localStream: MediaStream | null = null;
  remoteStreams: Map<string, MediaStream> = new Map();
  rtcState = 'new';
  qualityStatus = 'Unknown';
  localUserName = 'Participant';

  // Real-time Chat
  chatMessages: any[] = [];
  messageToSend = '';

  // Class Interactions controls states
  isMuted = false;
  hasCamera = true;
  isShareActive = false;
  handRaised = false;
  raisedHandsList: string[] = [];

  newClass = {
    title: '',
    description: '',
    startTime: '',
    durationInMinutes: 60,
    courseId: null as string | null,
    provider: 'Jitsi',
    meetingLink: '',
  };

  private timerSub!: Subscription;
  private rtcSubs: Subscription[] = [];

  ngOnInit() {
    const userRole = this.authService.getUserRole();
    this.isTrainer = userRole === 'Trainer';
    this.isAdmin = userRole === 'Admin';

    const email = this.authService.getUserEmail();
    this.localUserName = email ? email.split('@')[0] : 'Participant';

    this.loadLiveClasses();
    if (this.isTrainer || this.isAdmin) {
      this.loadCourses();
    }

    // Start real-time countdown timer tick
    this.timerSub = interval(1000).subscribe(() => {
      this.updateCountdowns();
    });
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
    this.disconnectRtcSubscriptions();
  }

  loadLiveClasses() {
    this.loading = true;
    this.liveClassService.getUpcomingLiveClasses().subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        this.liveClasses = list.map((item: any) => {
          return {
            ...item,
            startTimeLocal: new Date(item.startTime),
            countdown: 'Calculating...',
            isActive: false,
            isSoon: false,
          };
        });
        this.updateCountdowns();
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load upcoming live classes.');
        this.loading = false;
      },
    });
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || res || [];
      },
    });
  }

  scheduleLiveClass() {
    if (
      !this.newClass.title.trim() ||
      !this.newClass.description.trim() ||
      !this.newClass.startTime
    ) {
      this.toastr.warning('Please fill in all required fields.');
      return;
    }

    const start = new Date(this.newClass.startTime);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (start.getTime() < tenMinutesAgo.getTime()) {
      this.toastr.warning('Start time must be in the future or present.');
      return;
    }

    this.scheduling = true;
    const payload = {
      title: this.newClass.title,
      description: this.newClass.description,
      startTime: start.toISOString(),
      durationInMinutes: this.newClass.durationInMinutes,
      courseId: this.newClass.courseId || null,
      provider: this.newClass.provider,
      meetingLink: this.newClass.meetingLink || null,
    };

    this.liveClassService.createLiveClass(payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Live class scheduled successfully!');
        this.loadLiveClasses();
        // Reset form
        this.newClass = {
          title: '',
          description: '',
          startTime: '',
          durationInMinutes: 60,
          courseId: null,
          provider: 'Jitsi',
          meetingLink: '',
        };
        this.scheduling = false;
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to schedule live class.');
        this.scheduling = false;
      },
    });
  }

  deleteLiveClass(id: string) {
    if (confirm('Are you sure you want to cancel and delete this live class session?')) {
      this.liveClassService.deleteLiveClass(id).subscribe({
        next: () => {
          this.toastr.success('Live class cancelled successfully.');
          this.loadLiveClasses();
        },
        error: () => {
          this.toastr.error('Failed to delete live class.');
        },
      });
    }
  }

  joinMeeting(item: any) {
    if (true) { // Allow early check-in and local testing of WebRTC sessions
      if (item.provider === 'Jitsi' || (item.meetingLink && item.meetingLink.includes('meet.jit.si'))) {
        this.selectedMeetingRoom = item;
        this.showInAppRoomModal = true;
        this.chatMessages = [];
        this.raisedHandsList = [];

        // Connect and open WebRTC video conference tracks
        this.webRtcService.startSession(item.id, this.localUserName).then(() => {
          this.disconnectRtcSubscriptions();

          this.rtcSubs.push(
            this.webRtcService.localStream$.subscribe(stream => this.localStream = stream),
            this.webRtcService.remoteStreams$.subscribe(streams => this.remoteStreams = streams),
            this.webRtcService.connectionState$.subscribe(state => this.rtcState = state),
            this.webRtcService.qualityStatus$.subscribe(quality => this.qualityStatus = quality),
            this.webRtcService.chatMessages$.subscribe(msg => {
              this.chatMessages.push(msg);
            }),
            this.webRtcService.raisedHands$.subscribe(set => {
              this.raisedHandsList = Array.from(set);
            })
          );
        }).catch(err => {
          this.toastr.error('In-App meeting launch failed.');
        });

      } else if (item.meetingLink) {
        window.open(item.meetingLink, '_blank');
      } else {
        this.toastr.error('Meeting link is not available yet.');
      }
    } else {
      this.toastr.info('The meeting link will activate 15 minutes before session start time.', 'Not Active Yet');
    }
  }

  openExternalLink(item: any) {
    if (item && item.meetingLink) {
      window.open(item.meetingLink, '_blank');
    }
  }

  closeInAppRoomModal() {
    this.showInAppRoomModal = false;
    this.selectedMeetingRoom = null;

    this.webRtcService.endSession().then(() => {
      this.disconnectRtcSubscriptions();
      this.localStream = null;
      this.remoteStreams.clear();
      this.chatMessages = [];
      this.raisedHandsList = [];
      this.isMuted = false;
      this.hasCamera = true;
      this.isShareActive = false;
      this.handRaised = false;
    });
  }

  private disconnectRtcSubscriptions() {
    this.rtcSubs.forEach(sub => sub.unsubscribe());
    this.rtcSubs = [];
  }

  // Action toggles

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMuted = !audioTrack.enabled;
      }
    }
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.hasCamera = videoTrack.enabled;
      }
    }
  }

  toggleSharing() {
    this.webRtcService.toggleScreenShare().then(() => {
      this.isShareActive = !this.isShareActive;
    });
  }

  toggleHand() {
    this.handRaised = !this.handRaised;
    if (this.handRaised) {
      this.webRtcService.raiseHand();
    } else {
      this.webRtcService.lowerHand();
    }
  }

  sendChat() {
    if (this.messageToSend.trim()) {
      this.webRtcService.sendChatMessage(this.messageToSend.trim());
      this.messageToSend = '';
    }
  }

  isUserHandRaised(userId: string): boolean {
    return this.raisedHandsList.includes(userId);
  }

  getGridColumns(): string {
    const totalStreams = this.remoteStreams.size + 1;
    if (totalStreams <= 1) return '1fr';
    if (totalStreams === 2) return '1fr 1fr';
    if (totalStreams <= 4) return '1fr 1fr';
    return '1fr 1fr 1fr';
  }

  updateCountdowns() {
    const now = new Date().getTime();
    this.liveClasses.forEach((c) => {
      const startTime = new Date(c.startTimeLocal).getTime();
      const endTime = startTime + c.durationInMinutes * 60 * 1000;

      if (now > endTime) {
        c.countdown = 'Ended';
        c.isActive = false;
        c.isSoon = false;
      } else if (now >= startTime && now <= endTime) {
        c.countdown = 'In Progress';
        c.isActive = true;
        c.isSoon = true;
      } else {
        const diff = startTime - now;
        c.isActive = false;
        c.isSoon = diff < 15 * 60 * 1000; // Less than 15 minutes away

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours >= 24) {
          c.countdown = `In ${Math.floor(hours / 24)}d ${hours % 24}h`;
        } else {
          c.countdown = `In ${hours}h ${minutes}m ${seconds}s`;
        }
      }
    });
  }
}
