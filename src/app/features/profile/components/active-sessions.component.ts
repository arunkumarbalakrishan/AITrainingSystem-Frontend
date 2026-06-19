import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-active-sessions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-4">
      
      <!-- Card Header -->
      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 border-bottom border-light border-opacity-10 pb-3">
        <div>
          <h5 class="fw-bold mb-1 text-white d-flex align-items-center gap-2">
            <i class="bi bi-laptop text-primary"></i> Active Device Sessions
          </h5>
          <small class="text-secondary">Currently active browser connections to your LMS profile</small>
        </div>
        
        @if (hasOtherSessions()) {
          <button class="btn btn-sm btn-outline-danger border-danger border-opacity-20 d-flex align-items-center gap-1.5" 
                  (click)="terminateAllOthers()">
            <i class="bi bi-shield-x"></i> Terminate All Other Sessions
          </button>
        }
      </div>

      <!-- Sessions List -->
      <div class="d-flex flex-column gap-3.5">
        @for (session of sessions; track session.id) {
          <div class="session-item p-3.5 rounded-4 bg-black bg-opacity-40 border border-light border-opacity-5 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
            
            <div class="d-flex align-items-center gap-3">
              <!-- Device Icon -->
              <div class="session-icon d-flex align-items-center justify-content-center rounded-circle"
                   [class.bg-primary]="session.current"
                   [class.bg-secondary]="!session.current"
                   style="width: 44px; height: 44px; font-size: 1.25rem; flex-shrink: 0; background-color: rgba(255,255,255,0.05); color: #fff;">
                <i [class]="getDeviceIcon(session.device)"></i>
              </div>
              
              <!-- Session Details -->
              <div>
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <span class="text-white small fw-bold">{{ session.device }}</span>
                  @if (session.current) {
                    <span class="badge bg-primary text-black fw-bold" style="font-size: 0.65rem; padding: 0.25em 0.5em;">CURRENT SESSION</span>
                  }
                </div>
                
                <div class="d-flex flex-wrap align-items-center text-secondary small gap-x-3 mt-1 opacity-70">
                  <span>IP: {{ session.ipAddress }}</span>
                  <span>&bull;</span>
                  <span>{{ session.location }}</span>
                  <span>&bull;</span>
                  <span>Logged in: {{ session.loginTime | date:'mediumTime' }}</span>
                </div>
              </div>
            </div>

            <!-- Session Actions -->
            <div class="align-self-stretch align-self-sm-center text-end">
              @if (session.current) {
                <span class="text-primary small fw-semibold"><i class="bi bi-record-circle-fill me-1"></i>Active Now</span>
              } @else {
                <button class="btn btn-sm btn-outline-danger border-opacity-10 text-secondary w-100 w-sm-auto" 
                        (click)="terminateSession(session.id)">
                  Terminate
                </button>
              }
            </div>

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .session-item {
      transition: all 0.25s ease;
    }
    .session-item:hover {
      border-color: rgba(255, 255, 255, 0.1) !important;
      background: rgba(255, 255, 255, 0.01) !important;
    }
    .gap-x-3 span {
      margin-right: 0.25rem;
    }
  `]
})
export class ActiveSessionsComponent {
  @Input() sessions: any[] = [];
  
  @Output() terminate = new EventEmitter<string>();
  @Output() terminateAll = new EventEmitter<void>();

  private toastr = inject(ToastrService);

  getDeviceIcon(device: string): string {
    const d = device?.toLowerCase();
    if (d.includes('iphone') || d.includes('android') || d.includes('phone') || d.includes('mobile')) {
      return 'bi-phone-fill';
    }
    if (d.includes('ipad') || d.includes('tablet')) {
      return 'bi-tablet-fill';
    }
    return 'bi-pc-display';
  }

  hasOtherSessions(): boolean {
    return this.sessions.some(s => !s.current);
  }

  terminateSession(id: string) {
    this.terminate.emit(id);
    this.toastr.success(`Terminated device session successfully.`);
  }

  terminateAllOthers() {
    this.terminateAll.emit();
    this.toastr.success('Terminated all other active sessions.');
  }
}
