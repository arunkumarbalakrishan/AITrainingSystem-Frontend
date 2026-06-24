import { Component, Input, Output, EventEmitter, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-completion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
      <div>
        <h5 class="fw-bold mb-3 d-flex align-items-center gap-2" style="font-size: 1.15rem; letter-spacing: -0.2px;">
          <i class="bi bi-compass text-primary"></i> Completion Progress
        </h5>
        
        <!-- Circular Progress Chart -->
        <div class="position-relative d-flex justify-content-center align-items-center my-4">
          <svg width="150" height="150" viewBox="0 0 150 150" class="progress-ring">
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="60%" stop-color="#60a5fa" />
                <stop offset="100%" [attr.stop-color]="getColor(completionPercentage)" />
              </linearGradient>
            </defs>
            <circle 
              cx="75" cy="75" r="65" 
              stroke="rgba(255, 255, 255, 0.04)" 
              stroke-width="10" 
              fill="transparent" />
            <circle 
              cx="75" cy="75" r="65" 
              stroke="url(#progressGrad)" 
              stroke-width="10" 
              stroke-linecap="round"
              fill="transparent" 
              [attr.stroke-dasharray]="strokeDasharray"
              [attr.stroke-dashoffset]="strokeDashoffset"
              transform="rotate(-90 75 75)"
              class="progress-ring-circle" />
          </svg>
          <div class="position-absolute text-center">
            <h2 class="fw-bold text-white mb-0 mt-1" style="font-size: 2.2rem; letter-spacing: -1px;">
              {{ completionPercentage }}%
            </h2>
            <small [style.color]="getColor(completionPercentage)" class="fw-semibold text-uppercase" style="font-size: 0.65rem; letter-spacing: 1.5px;">
              {{ getStatusLabel(completionPercentage) }}
            </small>
          </div>
        </div>

        <p class="text-secondary small mb-4 text-center px-2">
          Complete your profile milestones to unlock personalized AI content recommendations.
        </p>
      </div>

      <!-- Actionable Checklist -->
      <div class="completion-checklist border-top pt-3 border-light border-opacity-10">
        
        <!-- Pending Items (Suggestions to Complete) -->
        <div *ngIf="pendingItems().length > 0" class="mb-4">
          <h6 class="fw-bold text-white small mb-3 text-uppercase d-flex align-items-center justify-content-between" style="letter-spacing: 1.2px; font-size: 0.72rem;">
            <span>Suggestions to Complete</span>
            <span class="badge bg-dark border border-light border-opacity-10 text-secondary rounded-pill px-2 py-0.5" style="font-size: 0.65rem;">
              {{ pendingItems().length }} remaining
            </span>
          </h6>
          
          <div class="d-flex flex-column gap-2">
            @for (item of pendingItems(); track item.label) {
              <div class="d-flex align-items-center justify-content-between p-2.5 rounded checklist-item pending">
                <div class="d-flex align-items-center gap-2.5">
                  <div class="circle-check pending d-flex align-items-center justify-content-center">
                    <div class="circle-dot"></div>
                  </div>
                  <span class="text-light small text-label">
                    {{ item.label }}
                  </span>
                </div>
                <span class="badge bg-dark-accent border border-light border-opacity-10 text-primary-accent" style="font-size: 0.72rem;">
                  +{{ item.weight }}%
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Completed Items -->
        <div *ngIf="completedItems().length > 0" [class.mt-3]="pendingItems().length > 0">
          <h6 class="fw-bold text-secondary small mb-2.5 text-uppercase" style="letter-spacing: 1.2px; font-size: 0.68rem;">
            Completed Milestones
          </h6>
          
          <div class="d-flex flex-column gap-2">
            @for (item of completedItems(); track item.label) {
              <div class="d-flex align-items-center justify-content-between p-2.5 rounded checklist-item completed opacity-75">
                <div class="d-flex align-items-center gap-2.5">
                  <div class="circle-check completed d-flex align-items-center justify-content-center">
                    <i class="bi bi-check-lg text-primary fw-bold" style="font-size: 0.8rem;"></i>
                  </div>
                  <span class="text-secondary small text-label">
                    {{ item.label }}
                  </span>
                </div>
                <span class="badge bg-success-soft text-success border-0 px-2 py-1" style="font-size: 0.7rem; font-weight: 600;">
                  <i class="bi bi-patch-check-fill me-1"></i>+{{ item.weight }}%
                </span>
              </div>
            }
          </div>
        </div>

        <!-- All completed celebration state -->
        <div *ngIf="pendingItems().length === 0" class="text-center py-4 animate-fade-in">
          <div class="glow-icon-container mb-3">
            <i class="bi bi-patch-check-fill text-primary" style="font-size: 2.2rem; line-height: 1;"></i>
          </div>
          <h6 class="fw-bold text-white mb-1.5" style="letter-spacing: -0.2px;">Profile 100% Complete!</h6>
          <p class="text-secondary small mb-0 px-3">
            Awesome job! You have fully unlocked all personalized AI recommendations and features.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .glass-card:hover {
      border-color: rgba(159, 239, 0, 0.25);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    }
    .progress-ring-circle {
      transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 0 6px rgba(159, 239, 0, 0.2));
    }
    .checklist-item {
      background: rgba(255, 255, 255, 0.015);
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .checklist-item.pending:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.08);
      transform: translateX(4px);
    }
    .checklist-item.completed {
      background: rgba(159, 239, 0, 0.01);
      border-color: rgba(159, 239, 0, 0.03);
    }
    .circle-check {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      transition: all 0.25s ease;
    }
    .checklist-item.pending .circle-check {
      border-color: rgba(255, 255, 255, 0.25);
    }
    .checklist-item.completed .circle-check {
      border-color: #9FEF00 !important;
      background: rgba(159, 239, 0, 0.08);
    }
    .circle-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      transition: all 0.25s ease;
    }
    .checklist-item.pending:hover .circle-dot {
      background: #9FEF00;
      box-shadow: 0 0 8px #9FEF00;
    }
    .text-label {
      font-weight: 500;
      letter-spacing: -0.1px;
    }
    .bg-dark-accent {
      background-color: rgba(255, 255, 255, 0.03);
    }
    .text-primary-accent {
      color: rgba(255, 255, 255, 0.6);
    }
    .bg-success-soft {
      background-color: rgba(0, 210, 106, 0.08);
    }
    .text-success {
      color: #00D26A !important;
    }
    .glow-icon-container {
      display: inline-block;
      padding: 12px;
      border-radius: 50%;
      background: rgba(159, 239, 0, 0.08);
      border: 1px solid rgba(159, 239, 0, 0.15);
      box-shadow: 0 0 20px rgba(159, 239, 0, 0.1);
      animation: pulseGlow 2s infinite ease-in-out;
    }
    @keyframes pulseGlow {
      0% { transform: scale(1); box-shadow: 0 0 20px rgba(159, 239, 0, 0.1); }
      50% { transform: scale(1.05); box-shadow: 0 0 28px rgba(159, 239, 0, 0.2); }
      100% { transform: scale(1); box-shadow: 0 0 20px rgba(159, 239, 0, 0.1); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ProfileCompletionComponent {
  @Input() completionData: any = {};

  // Compute checklist dynamically based on inputs
  checklist = computed(() => {
    return [
      { label: 'Upload Profile Picture', weight: 10, done: !!this.completionData.hasAvatar },
      { label: 'Fill Personal Details', weight: 25, done: !!this.completionData.personalCompleted },
      { label: 'Add Professional details', weight: 15, done: !!this.completionData.professionalCompleted },
      { label: 'Setup Two-Factor (2FA)', weight: 20, done: !!this.completionData.securityCompleted },
      { label: 'AI Study Style & Tutor', weight: 10, done: !!this.completionData.preferencesCompleted },
      { label: 'Earn your first Certificate', weight: 20, done: !!this.completionData.hasCertificates }
    ];
  });

  pendingItems = computed(() => this.checklist().filter(item => !item.done));
  completedItems = computed(() => this.checklist().filter(item => item.done));

  // Calculate percentage dynamically
  get completionPercentage(): number {
    return this.checklist().reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  }

  // Ring calculations
  readonly circumference = 2 * Math.PI * 65; // radius is 65
  
  get strokeDasharray(): string {
    return `${this.circumference} ${this.circumference}`;
  }

  get strokeDashoffset(): number {
    const percent = Math.min(Math.max(this.completionPercentage, 0), 100);
    return this.circumference - (percent / 100) * this.circumference;
  }

  // Get progressive colors for progress ring
  getColor(pct: number): string {
    if (pct < 30) return '#FF4D4F'; // Danger
    if (pct < 65) return '#FFB800'; // Warning
    if (pct < 90) return '#60a5fa'; // Light Blue
    return '#9FEF00'; // Success Accent (Lime)
  }

  getStatusLabel(pct: number): string {
    if (pct < 30) return 'Beginner';
    if (pct < 65) return 'Intermediate';
    if (pct < 90) return 'Advanced';
    return 'Complete';
  }
}
