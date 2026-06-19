import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ai-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-card p-4">
      
      <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-robot text-primary"></i> AI Tutor Preferences
        </h5>
        @if (formGroup.dirty) {
          <span class="badge bg-warning text-black animate-pulse">Unsaved Changes</span>
        }
      </div>

      <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
        <div class="row g-3.5">
          
          <!-- AI Tutor Name -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">AI Tutor Name</label>
            <input type="text" formControlName="aiTutorName" class="form-control premium-input" 
                   placeholder="e.g. Aria, Jarvis, Sophia" />
          </div>

          <!-- Learning Style -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Primary Learning Style</label>
            <select formControlName="aiLearningStyle" class="form-select premium-input">
              <option value="Visual">Visual (diagrams, graphs, flowcharts)</option>
              <option value="Practical">Practical (hands-on coding, exercises)</option>
              <option value="Interactive">Interactive (conversations, quizzes)</option>
              <option value="Theoretical">Theoretical (detailed lectures, concepts)</option>
              <option value="Adaptive">Adaptive (AI determines best mode)</option>
            </select>
          </div>

          <!-- Difficulty Level -->
          <div class="col-md-12">
            <label class="form-label text-secondary small fw-bold">AI Response Difficulty</label>
            <select formControlName="aiDifficultyLevel" class="form-select premium-input">
              <option value="Beginner">Beginner (gentle introduction, simple terms)</option>
              <option value="Intermediate">Intermediate (balanced explanations, standard terminologies)</option>
              <option value="Advanced">Advanced (deep dive, low-level technicalities)</option>
              <option value="Adaptive">Adaptive (matches quiz and module evaluation score)</option>
            </select>
          </div>

          <!-- Smart Features Toggles Grid -->
          <div class="col-md-12 mt-3">
            <h6 class="fw-bold text-white small mb-3 text-uppercase" style="letter-spacing: 1px;">
              Smart Features & Toggles
            </h6>
            
            <div class="d-flex flex-column gap-3">
              
              <!-- Voice Responses -->
              <div class="d-flex align-items-center justify-content-between p-2 rounded toggle-row">
                <div class="d-flex align-items-center gap-2.5">
                  <div class="toggle-icon text-primary bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center">
                    <i class="bi bi-volume-up-fill"></i>
                  </div>
                  <div>
                    <span class="text-white small fw-bold d-block">Voice Responses</span>
                    <small class="text-secondary opacity-60">Allows the AI Tutor to speak responses back to you</small>
                  </div>
                </div>
                <div class="form-check form-switch p-0 m-0">
                  <input class="form-check-input premium-switch" type="checkbox" formControlName="voiceResponseEnabled" />
                </div>
              </div>

              <!-- Personalized Recommendations -->
              <div class="d-flex align-items-center justify-content-between p-2 rounded toggle-row">
                <div class="d-flex align-items-center gap-2.5">
                  <div class="toggle-icon text-success bg-success bg-opacity-10 rounded d-flex align-items-center justify-content-center">
                    <i class="bi bi-compass-fill"></i>
                  </div>
                  <div>
                    <span class="text-white small fw-bold d-block">AI Recommendations</span>
                    <small class="text-secondary opacity-60">Receive recommendations for courses and quizzes based on activity</small>
                  </div>
                </div>
                <div class="form-check form-switch p-0 m-0">
                  <input class="form-check-input premium-switch" type="checkbox" formControlName="personalizedRecommendations" />
                </div>
              </div>

              <!-- Smart Study Plans -->
              <div class="d-flex align-items-center justify-content-between p-2 rounded toggle-row">
                <div class="d-flex align-items-center gap-2.5">
                  <div class="toggle-icon text-info bg-info bg-opacity-10 rounded d-flex align-items-center justify-content-center">
                    <i class="bi bi-calendar-range-fill"></i>
                  </div>
                  <div>
                    <span class="text-white small fw-bold d-block">Smart Study Plans</span>
                    <small class="text-secondary opacity-60">Let AI reorganize study hours and timeline milestones dynamically</small>
                  </div>
                </div>
                <div class="form-check form-switch p-0 m-0">
                  <input class="form-check-input premium-switch" type="checkbox" formControlName="smartStudyPlans" />
                </div>
              </div>

              <!-- AI Alerts -->
              <div class="d-flex align-items-center justify-content-between p-2 rounded toggle-row">
                <div class="d-flex align-items-center gap-2.5">
                  <div class="toggle-icon text-warning bg-warning bg-opacity-10 rounded d-flex align-items-center justify-content-center">
                    <i class="bi bi-bell-fill"></i>
                  </div>
                  <div>
                    <span class="text-white small fw-bold d-block">AI Assistant Alerts</span>
                    <small class="text-secondary opacity-60">Receive alerts when tutor has suggestions or reviews for your work</small>
                  </div>
                </div>
                <div class="form-check form-switch p-0 m-0">
                  <input class="form-check-input premium-switch" type="checkbox" formControlName="aiNotificationsEnabled" />
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Form Actions -->
        <div class="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-light border-opacity-10">
          <button type="button" class="btn btn-outline-light border-opacity-20 text-secondary" 
                  [disabled]="!formGroup.dirty || loading" 
                  (click)="onReset()">
            Reset
          </button>
          <button type="submit" class="btn btn-primary d-flex align-items-center gap-1.5" 
                  [disabled]="formGroup.invalid || !formGroup.dirty || loading">
            @if (loading) {
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Saving...</span>
            } @else {
              <i class="bi bi-check-circle-fill"></i>
              <span>Save Preferences</span>
            }
          </button>
        </div>
      </form>

    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .premium-input {
      background: rgba(5, 5, 5, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff !important;
      border-radius: 10px;
      padding: 0.65rem 0.85rem;
      transition: all 0.25s ease;
    }
    .premium-input:focus {
      background: rgba(13, 17, 23, 0.9);
      border-color: var(--primary-color, #9FEF00);
      box-shadow: 0 0 0 3px rgba(159, 239, 0, 0.15);
      outline: none;
    }
    .toggle-row {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.03);
      transition: all 0.2s ease;
    }
    .toggle-row:hover {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.05);
    }
    .toggle-icon {
      width: 38px;
      height: 38px;
      font-size: 1.15rem;
    }
    .premium-switch {
      cursor: pointer;
      width: 2.8rem;
      height: 1.5rem;
    }
    .premium-switch:checked {
      background-color: var(--primary-color, #9FEF00) !important;
      border-color: var(--primary-color, #9FEF00) !important;
    }
    .animate-pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class AiPreferencesComponent implements OnInit, OnChanges {
  @Input() preferences: any = {};
  @Input() loading = false;
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  formGroup!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['preferences'] && this.formGroup) {
      this.formGroup.patchValue(this.preferences);
    }
  }

  private initForm() {
    this.formGroup = this.fb.group({
      aiTutorName: [this.preferences.aiTutorName || 'Aria'],
      aiLearningStyle: [this.preferences.aiLearningStyle || 'Practical'],
      aiDifficultyLevel: [this.preferences.aiDifficultyLevel || 'Intermediate'],
      voiceResponseEnabled: [!!this.preferences.voiceResponseEnabled],
      personalizedRecommendations: [!!this.preferences.personalizedRecommendations],
      smartStudyPlans: [!!this.preferences.smartStudyPlans],
      aiNotificationsEnabled: [!!this.preferences.aiNotificationsEnabled]
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.save.emit(this.formGroup.value);
    } else {
      this.toastr.error('Form contains validation errors.');
    }
  }

  onReset() {
    this.formGroup.reset(this.preferences);
  }
}
