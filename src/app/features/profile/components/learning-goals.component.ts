import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-learning-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
      <div>
        <h5 class="fw-bold mb-3.5 text-white d-flex align-items-center gap-2 border-bottom border-light border-opacity-10 pb-3">
          <i class="bi bi-bullseye text-primary"></i> Study Target & Goals
        </h5>

        <!-- Weekly Study Hours Goal -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-secondary small fw-bold">Weekly Study Target</span>
            <span class="text-white fw-bold small">{{ targetHours }} hours/week</span>
          </div>

          <div class="position-relative">
            <input type="range" 
                   [(ngModel)]="targetHours" 
                   min="2" max="40" step="2"
                   (input)="onInputChange()"
                   class="form-range premium-range" />
          </div>

          <!-- Progress towards Weekly Goal -->
          <div class="mt-3 p-3 rounded-4 bg-black bg-opacity-40 border border-light border-opacity-5">
            <div class="d-flex justify-content-between align-items-center mb-1.5">
              <span class="text-secondary small">Progress (This Week):</span>
              <span class="text-primary small fw-bold">{{ actualHours }} / {{ targetHours }} hrs</span>
            </div>
            <div class="progress bg-black bg-opacity-60" style="height: 8px; border-radius: 4px;">
              <div class="progress-bar bg-primary" role="progressbar" 
                   [style.width]="getProgressPercentage() + '%'" 
                   [attr.aria-valuenow]="getProgressPercentage()" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <small class="text-secondary opacity-60 mt-1 d-block" style="font-size: 0.7rem;">
              {{ getWeeklyGoalAdvice() }}
            </small>
          </div>
        </div>

        <!-- Monthly Courses Goal -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-secondary small fw-bold">Monthly Completed Course Target</span>
            <span class="text-white fw-bold small">{{ targetCourses }} courses/month</span>
          </div>

          <div class="position-relative">
            <input type="range" 
                   [(ngModel)]="targetCourses" 
                   min="1" max="10" step="1"
                   (input)="onInputChange()"
                   class="form-range premium-range" />
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="d-flex justify-content-end mt-2 pt-3 border-top border-light border-opacity-10">
        <button class="btn btn-primary d-flex align-items-center gap-1.5" 
                [disabled]="!dirty() || loading" 
                (click)="onSave()">
          @if (loading) {
            <span class="spinner-border spinner-border-sm" role="status"></span>
          } @else {
            <i class="bi bi-check-circle-fill"></i>
            <span>Update Goals</span>
          }
        </button>
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
    .premium-range {
      background: rgba(255, 255, 255, 0.1);
      height: 6px;
      border-radius: 3px;
      outline: none;
      transition: all 0.2s ease;
    }
    .premium-range::-webkit-slider-thumb {
      background-color: var(--primary-color, #9FEF00) !important;
      border: 2px solid #000;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .premium-range::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
  `]
})
export class LearningGoalsComponent implements OnInit, OnChanges {
  @Input() goalHours = 10;
  @Input() goalCourses = 2;
  @Input() actualHours = 6.5; // Studied hours this week
  @Input() loading = false;

  @Output() save = new EventEmitter<any>();

  private toastr = inject(ToastrService);

  targetHours = 10;
  targetCourses = 2;
  dirty = signal(false);

  ngOnInit() {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['goalHours'] || changes['goalCourses']) {
      this.resetForm();
    }
  }

  resetForm() {
    this.targetHours = this.goalHours;
    this.targetCourses = this.goalCourses;
    this.dirty.set(false);
  }

  onInputChange() {
    this.dirty.set(
      this.targetHours !== this.goalHours || 
      this.targetCourses !== this.goalCourses
    );
  }

  getProgressPercentage(): number {
    if (this.targetHours <= 0) return 0;
    return Math.min(Math.round((this.actualHours / this.targetHours) * 100), 100);
  }

  getWeeklyGoalAdvice(): string {
    const pct = this.getProgressPercentage();
    if (pct >= 100) return '🎉 Goal achieved! Keep on learning to unlock extra achievements!';
    if (pct >= 60) return '🔥 You are close! Only a few more hours of learning to complete weekly target.';
    return '⚡ Set aside daily sessions to reach your learning targets.';
  }

  onSave() {
    this.save.emit({
      weeklyStudyHoursTarget: this.targetHours,
      monthlyCompletedCoursesTarget: this.targetCourses
    });
    this.dirty.set(false);
  }
}
