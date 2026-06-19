import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-card overflow-hidden mb-4 position-relative">
      
      <!-- Cover Banner Container -->
      <div class="cover-container position-relative" [style.background-image]="coverUrl ? 'url(' + coverUrl + ')' : 'none'">
        @if (!coverUrl) {
          <div class="cover-gradient h-100 w-100"></div>
        }
        
        <!-- Cover Controls Overlay -->
        <div class="cover-actions position-absolute top-0 end-0 m-3 d-flex gap-2">
          <label class="btn btn-sm btn-glass d-flex align-items-center gap-1.5 cursor-pointer">
            <i class="bi bi-camera"></i>
            <span>{{ coverUrl ? 'Change Cover' : 'Upload Cover' }}</span>
            <input type="file" (change)="onCoverUpload($event)" accept="image/*" class="d-none" />
          </label>
          @if (coverUrl) {
            <button class="btn btn-sm btn-glass text-danger border-danger border-opacity-20 d-flex align-items-center justify-content-center" 
                    (click)="coverRemoved.emit()" 
                    title="Remove Cover Photo">
              <i class="bi bi-trash3"></i>
            </button>
          }
        </div>
      </div>

      <!-- User Info & Avatar Header Bar -->
      <div class="header-content p-4 d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-end gap-3.5 mt-negative">
          
          <!-- Avatar Frame -->
          <div class="avatar-container position-relative">
            <img [src]="avatarUrl ? avatarUrl : 'https://api.dicebear.com/7.x/initials/svg?seed=' + (profile.fullName || 'User') + '&backgroundColor=a3e635,84cc16,65a30d'" 
                 class="avatar-image border border-4 border-dark shadow-lg" 
                 alt="Avatar Image" />
            
            <!-- Upload Trigger -->
            <label class="avatar-upload-overlay position-absolute bottom-0 end-0 m-1 rounded-circle bg-primary text-black d-flex align-items-center justify-content-center shadow cursor-pointer transition">
              <i class="bi bi-pencil-fill" style="font-size: 0.8rem;"></i>
              <input type="file" (change)="onAvatarUpload($event)" accept="image/*" class="d-none" />
            </label>
          </div>

          <!-- Name & Role / Badges -->
          <div class="text-center text-md-start mb-1.5">
            <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2">
              <h2 class="fw-bold text-white mb-0 text-shadow">{{ profile.fullName }}</h2>
              <i class="bi bi-patch-check-fill text-primary" style="font-size: 1.25rem;" title="Verified Account"></i>
            </div>
            
            <p class="text-secondary mb-1">
              &#64;{{ profile.username || 'learner' }} &bull; {{ profile.designation || 'Learner' }}
            </p>

            <!-- Visibility Badges -->
            <div class="d-flex flex-wrap gap-1.5 justify-content-center justify-content-md-start mt-2">
              <span class="badge badge-premium">
                <i class="bi bi-gem"></i> Premium User
              </span>
              <span class="badge badge-role" [class.bg-success]="profile.role === 'Trainer'" [class.bg-info]="profile.role === 'Admin'">
                <i class="bi bi-person-fill-gear"></i> {{ profile.role || 'Student' }}
              </span>
              <span class="badge bg-dark text-secondary border border-light border-opacity-10">
                Joined {{ profile.createdAt ? (profile.createdAt | date:'MMM yyyy') : 'Jun 2026' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Featured Pinned Certificates Showcase -->
        <div class="w-100 w-md-auto align-self-stretch align-self-md-end">
          <div class="pinned-section p-3 rounded-4 bg-dark bg-opacity-40 border border-light border-opacity-5">
            <h6 class="text-secondary small fw-bold text-uppercase mb-2.5 d-flex align-items-center gap-1.5">
              <i class="bi bi-pin-angle-fill text-primary"></i> Pinned Credentials
            </h6>
            
            <div class="d-flex flex-column gap-2">
              @if (pinnedCertificates && pinnedCertificates.length > 0) {
                @for (cert of pinnedCertificates; track cert.id) {
                  <div class="d-flex align-items-center justify-content-between p-2 rounded bg-black bg-opacity-40 border border-light border-opacity-5 gap-3 hover-scale shadow-sm">
                    <div class="d-flex align-items-center gap-2 overflow-hidden">
                      <i class="bi bi-award-fill text-primary" style="font-size: 1.1rem; flex-shrink: 0;"></i>
                      <span class="text-white text-truncate small fw-medium" [title]="cert.courseName">
                        {{ cert.courseName }}
                      </span>
                    </div>
                    <button class="btn btn-unpin p-0 border-0 text-secondary hover-text-danger" 
                            (click)="unpinCertificate.emit(cert.id)"
                            title="Unpin from showcase">
                      <i class="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                }
              } @else {
                <div class="text-center py-2 px-4">
                  <small class="text-secondary italic">No certificates pinned to showcase</small>
                </div>
              }
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .header-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
    }
    .cover-container {
      height: 220px;
      background-size: cover;
      background-position: center;
      background-color: #0c0f14;
    }
    .cover-gradient {
      background: linear-gradient(135deg, rgba(159, 239, 0, 0.15) 0%, rgba(5, 5, 5, 0.95) 100%);
    }
    .btn-glass {
      background: rgba(13, 17, 23, 0.6);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-glass:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .mt-negative {
      margin-top: -80px;
    }
    .avatar-container {
      width: 130px;
      height: 130px;
      z-index: 2;
    }
    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      background-color: #0c0f14;
    }
    .avatar-upload-overlay {
      width: 32px;
      height: 32px;
      border: 2px solid #000;
    }
    .avatar-upload-overlay:hover {
      transform: scale(1.1);
      background-color: var(--primary-hover-color, #B8FF36) !important;
    }
    .text-shadow {
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }
    .badge-premium {
      background: linear-gradient(90deg, rgba(159, 239, 0, 0.15), rgba(0, 210, 106, 0.15));
      border: 1px solid rgba(159, 239, 0, 0.25);
      color: #B8FF36;
      font-weight: 600;
    }
    .badge-role {
      background: rgba(96, 165, 250, 0.15);
      border: 1px solid rgba(96, 165, 250, 0.25);
      color: #60a5fa;
      font-weight: 600;
    }
    .pinned-section {
      min-width: 280px;
      max-width: 100%;
    }
    .hover-scale {
      transition: all 0.2s ease;
    }
    .hover-scale:hover {
      transform: translateY(-2px);
      border-color: rgba(159, 239, 0, 0.2) !important;
      background: rgba(255, 255, 255, 0.03) !important;
    }
    .btn-unpin {
      opacity: 0.5;
      transition: all 0.2s ease;
    }
    .btn-unpin:hover {
      opacity: 1;
    }
    .hover-text-danger:hover {
      color: #FF4D4F !important;
    }
    @media (max-width: 767.98px) {
      .cover-container {
        height: 150px;
      }
      .mt-negative {
        margin-top: -65px;
      }
      .avatar-container {
        width: 110px;
        height: 110px;
      }
      .pinned-section {
        min-width: 100%;
      }
    }
  `]
})
export class ProfileHeaderComponent {
  @Input() profile: any = {};
  @Input() avatarUrl: string | null = null;
  @Input() coverUrl: string | null = null;
  @Input() pinnedCertificates: any[] = [];

  @Output() avatarChanged = new EventEmitter<File>();
  @Output() avatarRemoved = new EventEmitter<void>();
  @Output() coverChanged = new EventEmitter<File>();
  @Output() coverRemoved = new EventEmitter<void>();
  @Output() unpinCertificate = new EventEmitter<string>();

  private toastr = inject(ToastrService);

  onAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (this.validateImageFile(file)) {
        this.avatarChanged.emit(file);
      }
    }
  }

  onCoverUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (this.validateImageFile(file)) {
        this.coverChanged.emit(file);
      }
    }
  }

  private validateImageFile(file: File): boolean {
    // 5MB Limit
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastr.error('File size exceeds the 5MB limit.');
      return false;
    }
    // Formats limit: JPG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Supported image formats: JPG, PNG, and WEBP only.');
      return false;
    }
    return true;
  }
}
