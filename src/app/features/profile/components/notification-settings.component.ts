import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-card p-4">
      
      <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-bell-fill text-primary"></i> Notification Preferences
        </h5>
        @if (formGroup.dirty) {
          <span class="badge bg-warning text-black animate-pulse">Unsaved Changes</span>
        }
      </div>

      <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
        <div class="row g-3">
          
          <!-- Email Notifications Toggle -->
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-between p-2.5 rounded toggle-row">
              <div>
                <span class="text-white small fw-bold d-block">Global Email Updates</span>
                <small class="text-secondary opacity-60">Receive summary reports via email address</small>
              </div>
              <div class="form-check form-switch p-0 m-0">
                <input class="form-check-input premium-switch" type="checkbox" formControlName="emailNotifications" />
              </div>
            </div>
          </div>

          <!-- Course Notifications -->
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-between p-2.5 rounded toggle-row">
              <div>
                <span class="text-white small fw-bold d-block">Course Updates</span>
                <small class="text-secondary opacity-60">Get notified when lectures or files are added</small>
              </div>
              <div class="form-check form-switch p-0 m-0">
                <input class="form-check-input premium-switch" type="checkbox" formControlName="courseUpdates" />
              </div>
            </div>
          </div>

          <!-- Certificate Notifications -->
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-between p-2.5 rounded toggle-row">
              <div>
                <span class="text-white small fw-bold d-block">Certificate Generation</span>
                <small class="text-secondary opacity-60">Receive instant alerts when certificates are ready</small>
              </div>
              <div class="form-check form-switch p-0 m-0">
                <input class="form-check-input premium-switch" type="checkbox" formControlName="certificateAlerts" />
              </div>
            </div>
          </div>

          <!-- Assignment Reminders -->
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-between p-2.5 rounded toggle-row">
              <div>
                <span class="text-white small fw-bold d-block">Assignment Deadlines</span>
                <small class="text-secondary opacity-60">Get reminders for quiz and project submissions</small>
              </div>
              <div class="form-check form-switch p-0 m-0">
                <input class="form-check-input premium-switch" type="checkbox" formControlName="assignmentReminders" />
              </div>
            </div>
          </div>

          <!-- System Toggles -->
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-between p-2.5 rounded toggle-row">
              <div>
                <span class="text-white small fw-bold d-block">System Alerts</span>
                <small class="text-secondary opacity-60">Maintenance and system announcements</small>
              </div>
              <div class="form-check form-switch p-0 m-0">
                <input class="form-check-input premium-switch" type="checkbox" formControlName="systemNotifications" />
              </div>
            </div>
          </div>

          <!-- Marketing Toggles -->
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-between p-2.5 rounded toggle-row">
              <div>
                <span class="text-white small fw-bold d-block">Marketing Emails</span>
                <small class="text-secondary opacity-60">Offers, surveys, and promotional discounts</small>
              </div>
              <div class="form-check form-switch p-0 m-0">
                <input class="form-check-input premium-switch" type="checkbox" formControlName="marketingEmails" />
              </div>
            </div>
          </div>

          <!-- Security Alerts -->
          <div class="col-md-12">
            <div class="d-flex align-items-center justify-content-between p-2.5 rounded toggle-row">
              <div>
                <span class="text-white small fw-bold d-block">Critical Security Warnings</span>
                <small class="text-secondary opacity-60">Receive alerts for new logins, 2FA setup, and password changes</small>
              </div>
              <div class="form-check form-switch p-0 m-0">
                <input class="form-check-input premium-switch" type="checkbox" formControlName="securityAlerts" />
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
                  [disabled]="!formGroup.dirty || loading">
            @if (loading) {
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Saving...</span>
            } @else {
              <i class="bi bi-check-circle-fill"></i>
              <span>Save Settings</span>
            }
          </button>
        </div>
      </form>

      <!-- NOTIFICATION PREVIEW LOG -->
      <div class="mt-4 pt-4 border-top border-light border-opacity-10">
        <h6 class="fw-bold text-white small mb-3.5 text-uppercase" style="letter-spacing: 1px;">
          Latest Notifications
        </h6>
        
        <div class="d-flex flex-column gap-2.5">
          @for (noti of previewLogs; track noti.id) {
            <div class="d-flex align-items-start gap-3 p-3 rounded bg-black bg-opacity-40 border border-light border-opacity-5">
              <div class="noti-icon-badge rounded-circle d-flex align-items-center justify-content-center"
                   [class.bg-primary]="noti.category === 'certificate'"
                   [class.bg-info]="noti.category === 'course'"
                   [class.bg-warning]="noti.category === 'assignment'"
                   style="width: 34px; height: 34px; font-size: 0.95rem; flex-shrink: 0; background-color: rgba(255,255,255,0.05); color: #fff;">
                <i [class]="'bi ' + noti.icon"></i>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="text-white small fw-bold text-truncate">{{ noti.title }}</span>
                  <small class="text-secondary opacity-60" style="font-size: 0.7rem;">{{ noti.time }}</small>
                </div>
                <p class="text-secondary small mb-0 mt-0.5 text-truncate">{{ noti.message }}</p>
              </div>
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
export class NotificationSettingsComponent implements OnInit, OnChanges {
  @Input() preferences: any = {};
  @Input() loading = false;
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  formGroup!: FormGroup;

  // Static preview logs
  previewLogs = [
    { id: 1, category: 'certificate', title: 'Certificate Earned', message: 'Your completion credential for Advanced Angular 21 Architecture is verified and ready.', time: '2 hours ago', icon: 'bi-award-fill' },
    { id: 2, category: 'course', title: 'Course Content Updated', message: 'ASP.NET Core Web API has added 3 new hands-on lectures in Chapter 4.', time: '1 day ago', icon: 'bi-journal-arrow-up' },
    { id: 3, category: 'assignment', title: 'Assignment Submission Reminder', message: 'Evaluation Quiz for Python basics is closing soon.', time: '2 days ago', icon: 'bi-clock-history' }
  ];

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
      emailNotifications: [!!this.preferences.emailNotifications],
      courseUpdates: [!!this.preferences.courseUpdates],
      certificateAlerts: [!!this.preferences.certificateAlerts],
      assignmentReminders: [!!this.preferences.assignmentReminders],
      systemNotifications: [!!this.preferences.systemNotifications],
      marketingEmails: [!!this.preferences.marketingEmails],
      securityAlerts: [!!this.preferences.securityAlerts]
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.save.emit(this.formGroup.value);
    }
  }

  onReset() {
    this.formGroup.reset(this.preferences);
  }
}
