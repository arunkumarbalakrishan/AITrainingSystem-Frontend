import { Component, Input, Output, EventEmitter, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-completion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
      <div>
        <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-compass text-primary"></i> Completion Progress
        </h5>
        
        <!-- Circular Progress Chart -->
        <div class="position-relative d-flex justify-content-center align-items-center my-4">
          <svg width="150" height="150" viewBox="0 0 150 150" class="progress-ring">
            <circle 
              cx="75" cy="75" r="65" 
              stroke="rgba(255, 255, 255, 0.05)" 
              stroke-width="12" 
              fill="transparent" />
            <circle 
              cx="75" cy="75" r="65" 
              [attr.stroke]="getColor(completionPercentage)" 
              stroke-width="12" 
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
            <small class="text-secondary fw-semibold text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;">
              {{ getStatusLabel(completionPercentage) }}
            </small>
          </div>
        </div>

        <p class="text-secondary small mb-4 text-center">
          Complete your profile milestones to unlock personalized AI content recommendations.
        </p>
      </div>

      <!-- Actionable Checklist -->
      <div class="completion-checklist border-top pt-3 border-light border-opacity-10">
        <h6 class="fw-bold text-white small mb-3 text-uppercase" style="letter-spacing: 1px;">
          Suggestions to Complete
        </h6>
        
        <div class="d-flex flex-column gap-2.5">
          @for (item of checklist(); track item.label) {
            <div class="d-flex align-items-center justify-content-between p-2 rounded checklist-item" 
                 [class.completed]="item.done">
              <div class="d-flex align-items-center gap-2.5">
                <div class="circle-check d-flex align-items-center justify-content-center">
                  @if (item.done) {
                    <i class="bi bi-check-lg text-primary fw-bold" style="font-size: 0.9rem;"></i>
                  } @else {
                    <div class="circle-dot"></div>
                  }
                </div>
                <span class="text-light small text-label" [class.text-decoration-line-through]="item.done" [class.opacity-50]="item.done">
                  {{ item.label }}
                </span>
              </div>
              <span class="badge bg-dark border border-light border-opacity-10 text-secondary" style="font-size: 0.75rem;">
                +{{ item.weight }}%
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      transition: all 0.3s ease;
    }
    .glass-card:hover {
      border-color: rgba(159, 239, 0, 0.25);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .progress-ring-circle {
      transition: stroke-dashoffset 0.6s ease;
    }
    .checklist-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: all 0.25s ease;
    }
    .checklist-item.completed {
      background: rgba(159, 239, 0, 0.03);
      border-color: rgba(159, 239, 0, 0.08);
    }
    .circle-check {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      transition: all 0.25s ease;
    }
    .checklist-item.completed .circle-check {
      border-color: var(--primary-color);
      background: rgba(159, 239, 0, 0.1);
    }
    .circle-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
    }
    .text-label {
      font-weight: 500;
      transition: all 0.25s ease;
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
