import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService, ActiveToast } from 'ngx-toastr';

@Component({
  selector: 'app-achievement-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-4">
      
      <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-patch-check-fill text-primary"></i> Badges & Achievements
        </h5>
        <span class="text-secondary small fw-medium">
          {{ getUnlockedCount() }} of {{ achievements.length }} Unlocked
        </span>
      </div>

      <!-- Grid Layout -->
      <div class="row g-3">
        @for (badge of achievements; track badge.id) {
          <div class="col-6 col-sm-4 col-md-3 col-lg-2">
            <div class="badge-card p-3 text-center position-relative h-100 d-flex flex-column justify-content-between"
                 [class.locked]="!badge.unlocked" 
                 (click)="selectBadge(badge)"
                 [title]="badge.name + ': ' + badge.description">
              
              <!-- Lock/Unlock Indicator -->
              <div class="badge-status-icon position-absolute top-0 end-0 m-2">
                @if (badge.unlocked) {
                  <i class="bi bi-shield-fill-check text-primary" style="font-size: 0.8rem;"></i>
                } @else {
                  <i class="bi bi-lock-fill text-secondary" style="font-size: 0.8rem;"></i>
                }
              </div>

              <!-- Animated Icon Container -->
              <div class="badge-icon-outer mx-auto my-3 d-flex align-items-center justify-content-center rounded-circle"
                   [style.background]="badge.unlocked ? 'radial-gradient(circle, ' + badge.color + '20 0%, ' + badge.color + '05 70%)' : 'none'"
                   [style.border-color]="badge.unlocked ? badge.color + '40' : 'rgba(255,255,255,0.05)'"
                   [style.color]="badge.unlocked ? badge.color : '#4b5563'">
                <i [class]="'bi ' + badge.icon"></i>
              </div>

              <div>
                <div class="fw-bold small text-truncate" [class.text-white]="badge.unlocked" [class.text-secondary]="!badge.unlocked">
                  {{ badge.name }}
                </div>
                
                @if (badge.unlocked) {
                  <small class="text-primary fw-semibold" style="font-size: 0.65rem;">UNLOCKED</small>
                } @else {
                  <!-- Progress Bar -->
                  <div class="progress bg-black bg-opacity-40 mx-auto mt-2" style="height: 5px; width: 80%; border-radius: 2.5px;">
                    <div class="progress-bar" role="progressbar" 
                         [style.width]="badge.progress + '%'" 
                         [style.background-color]="badge.color"
                         [attr.aria-valuenow]="badge.progress" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                  <small class="text-secondary opacity-50" style="font-size: 0.65rem;">{{ badge.progress }}% Complete</small>
                }
              </div>

            </div>
          </div>
        }
      </div>

    </div>

    <!-- BADGE DETAILS MODAL -->
    @if (activeBadge()) {
      <div class="custom-modal-backdrop d-flex align-items-center justify-content-center" (click)="closeBadge()">
        <div class="custom-modal-content p-4 border border-light border-opacity-10 text-center animate-zoom-in" style="max-width: 380px;" (click)="$event.stopPropagation()">
          
          <div class="badge-glowing-effect mx-auto my-4 d-flex align-items-center justify-content-center rounded-circle"
               [style.background]="activeBadge()?.unlocked ? 'radial-gradient(circle, ' + activeBadge()?.color + '30 0%, ' + activeBadge()?.color + '05 70%)' : 'rgba(255,255,255,0.01)'"
               [style.border]="'2px solid ' + (activeBadge()?.unlocked ? activeBadge()?.color : 'rgba(255,255,255,0.08)')"
               [style.color]="activeBadge()?.unlocked ? activeBadge()?.color : '#4b5563'"
               style="width: 80px; height: 80px; font-size: 2.5rem; transition: all 0.5s ease;">
            <i [class]="'bi ' + activeBadge()?.icon" [class.locked-animation]="!activeBadge()?.unlocked"></i>
          </div>

          <h5 class="fw-bold" [class.text-white]="activeBadge()?.unlocked" [class.text-secondary]="!activeBadge()?.unlocked">
            {{ activeBadge()?.name }}
          </h5>
          
          <p class="text-secondary small mb-3.5 px-3">
            {{ activeBadge()?.description }}
          </p>

          <div class="badge-details-footer p-3 rounded bg-black bg-opacity-40 border border-light border-opacity-5 mb-4">
            @if (activeBadge()?.unlocked) {
              <div class="text-success small fw-semibold">
                <i class="bi bi-calendar-check-fill me-1.5"></i> Unlocked on {{ activeBadge()?.unlockDate }}
              </div>
            } @else {
              <div class="text-secondary small">
                Progress: <span class="text-light fw-bold">{{ activeBadge()?.progress }}%</span>
                <div class="progress bg-black bg-opacity-60 mt-2" style="height: 6px; border-radius: 3px;">
                  <div class="progress-bar" role="progressbar" 
                       [style.width]="activeBadge()?.progress + '%'" 
                       [style.background-color]="activeBadge()?.color"
                       [attr.aria-valuenow]="activeBadge()?.progress" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
            }
          </div>

          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-light border-opacity-20 text-secondary" (click)="closeBadge()">Close Details</button>
            @if (activeBadge()?.unlocked) {
              <button class="btn btn-sm btn-primary" (click)="shareBadge(activeBadge())">
                <i class="bi bi-share me-1"></i> Share Badge
              </button>
            }
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .badge-card {
      background: rgba(5, 5, 5, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .badge-card:hover {
      background: rgba(13, 17, 23, 0.8);
      border-color: rgba(255, 255, 255, 0.12);
      transform: translateY(-3px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }
    .badge-card.locked {
      background: rgba(5, 5, 5, 0.2);
      border-color: rgba(255, 255, 255, 0.03);
      cursor: not-allowed;
    }
    .badge-icon-outer {
      width: 52px;
      height: 52px;
      border: 2.5px solid rgba(255, 255, 255, 0.08);
      font-size: 1.6rem;
      transition: all 0.25s ease;
    }
    .badge-card:hover .badge-icon-outer {
      transform: scale(1.1) rotate(5deg);
    }
    .badge-card.locked:hover .badge-icon-outer {
      transform: none;
    }
    .locked-animation {
      opacity: 0.35;
    }

    /* Modal Backdrop */
    .custom-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1050;
    }
    .custom-modal-content {
      background: #0d1117;
      border-radius: 20px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .animate-zoom-in {
      animation: zoomIn 0.22s ease-out;
    }
    @keyframes zoomIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class AchievementSectionComponent {
  @Input() achievements: any[] = [];
  activeBadge = signal<any | null>(null);

  selectBadge(badge: any) {
    this.activeBadge.set(badge);
  }

  closeBadge() {
    this.activeBadge.set(null);
  }

  getUnlockedCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  shareBadge(badge: any) {
    // Simulated sharing
    navigator.clipboard.writeText(`I unlocked the '${badge.name}' achievement badge on AI LMS Training System!`);
    alert(`Achievement badge link copied to clipboard. Share the good news!`);
    this.closeBadge();
  }
}
