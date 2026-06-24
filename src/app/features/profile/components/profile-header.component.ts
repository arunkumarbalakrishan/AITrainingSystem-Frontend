import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-card mb-4 position-relative">
      
      <!-- Cover Banner Container -->
      <div class="cover-container position-relative" [style.background-image]="coverUrl ? 'url(' + coverUrl + ')' : 'none'">
        @if (!coverUrl) {
          <div class="cover-gradient h-100 w-100"></div>
        }

        <!-- Decorative right-side orb (fills the marked empty area) -->
        <div class="cover-decor-orb position-absolute"></div>
        <div class="cover-decor-grid position-absolute top-0 start-0 w-100 h-100"></div>
        
        <!-- Cover Controls Overlay -->
        <div class="cover-actions position-absolute top-0 end-0 m-3 d-flex gap-2">
          <label class="btn btn-sm btn-glass d-flex align-items-center gap-2 cursor-pointer shadow-sm">
            <i class="bi bi-camera"></i>
            <span class="d-none d-sm-inline">{{ coverUrl ? 'Change Cover' : 'Upload Cover' }}</span>
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
      <div class="header-content px-4 pb-4">
        <!-- Avatar pulls up over the cover -->
        <div class="avatar-container position-relative mt-negative">
          <img [src]="avatarUrl ? avatarUrl : 'https://api.dicebear.com/7.x/initials/svg?seed=' + (profile.fullName || 'User') + '&backgroundColor=a3e635,84cc16,65a30d'" 
               class="avatar-image" 
               alt="Avatar Image" />
          <label class="avatar-upload-overlay position-absolute bottom-0 end-0 m-1 rounded-circle bg-primary text-black d-flex align-items-center justify-content-center shadow cursor-pointer">
            <i class="bi bi-pencil-fill" style="font-size: 0.75rem;"></i>
            <input type="file" (change)="onAvatarUpload($event)" accept="image/*" class="d-none" />
          </label>
          @if (avatarUrl) {
            <button class="btn-avatar-remove position-absolute top-0 start-0 m-1 rounded-circle bg-danger text-white border-0 d-flex align-items-center justify-content-center shadow"
                    (click)="avatarRemoved.emit()"
                    title="Remove Profile Photo"
                    style="width: 26px; height: 26px; font-size: 0.75rem; transition: all 0.2s ease; z-index: 3;">
              <i class="bi bi-x-lg"></i>
            </button>
          }
        </div>

        <!-- Name, username and badges sit cleanly below -->
        <div class="d-flex flex-column flex-md-row align-items-start gap-3 mt-3">
          <div class="flex-grow-1">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h2 class="fw-bold text-white mb-0 name-text">{{ profile.fullName || 'User' }}</h2>
              <i class="bi bi-patch-check-fill text-primary verified-icon" title="Verified Account"></i>
            </div>
            <p class="text-secondary small mb-2">&#64;{{ profile.username || 'learner' }} &bull; {{ profile.designation || 'Learner' }}</p>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge badge-premium"><i class="bi bi-gem me-1"></i>Premium User</span>
              <span class="badge badge-role"
                    [class.badge-trainer]="profile.role === 'Trainer'"
                    [class.badge-admin]="profile.role === 'Admin'">
                <i class="bi bi-person-fill-gear me-1"></i>{{ profile.role || 'Student' }}
              </span>
              <span class="badge badge-joined"><i class="bi bi-calendar3 me-1"></i>Joined {{ profile.createdAt ? (profile.createdAt | date:'MMM yyyy') : 'Jun 2026' }}</span>
            </div>
          </div>

          <!-- Pinned Credentials (Conditionally Hidden) -->
          @if (pinnedCertificates && pinnedCertificates.length > 0) {
            <div class="pinned-section rounded-4 bg-dark bg-opacity-25 border border-light border-opacity-10 p-3">
              <h6 class="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2">
                <i class="bi bi-pin-angle-fill text-primary"></i> Pinned Credentials
              </h6>
              <div class="d-flex flex-wrap gap-2">
                @for (cert of pinnedCertificates; track cert.id) {
                  <div class="badge bg-black bg-opacity-50 border border-light border-opacity-10 py-2 px-3 d-flex align-items-center gap-2">
                    <i class="bi bi-award-fill text-primary"></i>
                    <span class="text-white">{{ cert.courseName }}</span>
                    <button class="btn btn-link p-0 text-secondary hover-text-danger" (click)="unpinCertificate.emit(cert.id)">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    .header-card {
      background: #0d1117;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      overflow: hidden;
    }
    .cover-container {
      height: 200px;
      background-size: cover;
      background-position: center;
      background-color: #161b22;
    }
    .cover-gradient {
      background: linear-gradient(
        135deg,
        rgba(159, 239, 0, 0.18) 0%,
        rgba(96, 165, 250, 0.1) 45%,
        rgba(13, 17, 23, 0.98) 100%
      );
    }
    /* Decorative right-side glowing orb */
    .cover-decor-orb {
      width: 280px;
      height: 280px;
      right: -40px;
      top: -80px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(159,239,0,0.12) 0%, rgba(96,165,250,0.07) 40%, transparent 70%);
      pointer-events: none;
      z-index: 1;
    }
    /* Subtle dot grid pattern over the cover */
    .cover-decor-grid {
      background-image: radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
      z-index: 1;
    }
    .btn-glass {
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-glass:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
    .mt-negative { margin-top: -50px; }
    .avatar-container { width: 120px; height: 120px; z-index: 2; display: block; }
    .name-text { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.3px; }
    .verified-icon { font-size: 1.2rem; }
    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #0D1117;
      box-shadow: 0 0 0 2px rgba(159, 239, 0, 0.35), 0 8px 24px rgba(0,0,0,0.55);
      background-color: #0c0f14;
    }
    .avatar-upload-overlay {
      width: 30px;
      height: 30px;
      border: 2px solid #0D1117;
      transition: all 0.2s ease;
    }
    .avatar-upload-overlay:hover { background: #B8FF36 !important; transform: scale(1.1); }
    .badge-premium {
      background: linear-gradient(90deg, rgba(159,239,0,0.15), rgba(0,210,106,0.12));
      border: 1px solid rgba(159,239,0,0.25);
      color: #9FEF00;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
    }
    .badge-role {
      background: rgba(96,165,250,0.15);
      border: 1px solid rgba(96,165,250,0.25);
      color: #60a5fa;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
    }
    .badge-trainer { background: rgba(0,210,106,0.15); border-color: rgba(0,210,106,0.3); color: #00D26A; }
    .badge-admin   { background: rgba(232,121,249,0.15); border-color: rgba(232,121,249,0.3); color: #e879f9; }
    .badge-joined {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      color: #777;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
    }
    .pinned-section { max-width: 400px; }
    .hover-text-danger:hover { color: #ff4d4f !important; }
    .btn-avatar-remove { opacity: 0.85; transition: all 0.2s ease; }
    .btn-avatar-remove:hover { opacity: 1; transform: scale(1.1); background-color: #ff4d4f !important; }
    @media (max-width: 767.98px) {
      .cover-container { height: 140px; }
      .mt-negative { margin-top: -50px; }
      .avatar-container { width: 100px; height: 100px; }
      .pinned-section { max-width: 100%; }
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
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastr.error('File size exceeds the 5MB limit.');
      return false;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Supported image formats: JPG, PNG, and WEBP only.');
      return false;
    }
    return true;
  }
}
