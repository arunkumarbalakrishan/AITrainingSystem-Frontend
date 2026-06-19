import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-personal-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-card p-4">
      <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-person-fill text-primary"></i> Personal Information
        </h5>
        @if (formGroup.dirty) {
          <span class="badge bg-warning text-black animate-pulse">Unsaved Changes</span>
        }
      </div>

      <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
        <div class="row g-3.5">
          
          <!-- Full Name -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Full Name</label>
            <input type="text" formControlName="fullName" class="form-control premium-input" 
                   [class.is-invalid]="isFieldInvalid('fullName')" placeholder="Enter your full name" />
            <div class="invalid-feedback">Full name is required (min 2 characters).</div>
          </div>

          <!-- Username -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Username</label>
            <input type="text" formControlName="username" class="form-control premium-input" 
                   [class.is-invalid]="isFieldInvalid('username')" placeholder="Enter username" />
            <div class="invalid-feedback">Username is required (min 3 characters).</div>
          </div>

          <!-- Email Address (Readonly) -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold d-flex justify-content-between">
              <span>Email Address</span>
              <span class="text-secondary opacity-50 italic" style="font-size: 0.75rem;">Read Only</span>
            </label>
            <input type="email" formControlName="email" class="form-control premium-input bg-dark bg-opacity-50 text-secondary" readonly />
          </div>

          <!-- Phone Number -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Phone Number</label>
            <input type="tel" formControlName="phoneNumber" class="form-control premium-input" 
                   [class.is-invalid]="isFieldInvalid('phoneNumber')" placeholder="+1 (555) 000-0000" />
            <div class="invalid-feedback">Please enter a valid phone number.</div>
          </div>

          <!-- Date of Birth -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Date of Birth</label>
            <input type="date" formControlName="dateOfBirth" class="form-control premium-input" 
                   [class.is-invalid]="isFieldInvalid('dateOfBirth')" />
          </div>

          <!-- Gender -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Gender</label>
            <select formControlName="gender" class="form-select premium-input">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <!-- Country -->
          <div class="col-md-4">
            <label class="form-label text-secondary small fw-bold">Country</label>
            <input type="text" formControlName="country" class="form-control premium-input" 
                   [class.is-invalid]="isFieldInvalid('country')" placeholder="United States" />
          </div>

          <!-- State -->
          <div class="col-md-4">
            <label class="form-label text-secondary small fw-bold">State / Region</label>
            <input type="text" formControlName="state" class="form-control premium-input" placeholder="California" />
          </div>

          <!-- City -->
          <div class="col-md-4">
            <label class="form-label text-secondary small fw-bold">City</label>
            <input type="text" formControlName="city" class="form-control premium-input" placeholder="San Francisco" />
          </div>

          <!-- Timezone -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Timezone</label>
            <select formControlName="timezone" class="form-select premium-input">
              <option value="GMT-8 (Pacific Standard Time)">GMT-8 (Pacific Standard Time)</option>
              <option value="GMT-5 (Eastern Standard Time)">GMT-5 (Eastern Standard Time)</option>
              <option value="GMT+0 (Greenwich Mean Time)">GMT+0 (Greenwich Mean Time)</option>
              <option value="GMT+1 (Central European Time)">GMT+1 (Central European Time)</option>
              <option value="GMT+5:30 (Indian Standard Time)">GMT+5:30 (Indian Standard Time)</option>
              <option value="GMT+9 (Japan Standard Time)">GMT+9 (Japan Standard Time)</option>
            </select>
          </div>

          <!-- Preferred Language -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Preferred Language</label>
            <select formControlName="preferredLanguage" class="form-select premium-input">
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="zh-CN">Chinese (Simplified)</option>
            </select>
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
              <span>Save Changes</span>
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
    .premium-input::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }
    .premium-input[readonly] {
      cursor: not-allowed;
    }
    .animate-pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .italic {
      font-style: italic;
    }
  `]
})
export class PersonalInfoFormComponent implements OnInit, OnChanges {
  @Input() profile: any = {};
  @Input() loading = false;
  
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  formGroup!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && this.formGroup) {
      this.formGroup.patchValue(this.profile);
    }
  }

  private initForm() {
    this.formGroup = this.fb.group({
      fullName: [this.profile.fullName || '', [Validators.required, Validators.minLength(2)]],
      username: [this.profile.username || '', [Validators.required, Validators.minLength(3)]],
      email: [this.profile.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.profile.phoneNumber || '', [Validators.required]],
      dateOfBirth: [this.profile.dateOfBirth || ''],
      gender: [this.profile.gender || 'Male'],
      country: [this.profile.country || '', [Validators.required]],
      state: [this.profile.state || ''],
      city: [this.profile.city || ''],
      timezone: [this.profile.timezone || 'GMT-8 (Pacific Standard Time)'],
      preferredLanguage: [this.profile.preferredLanguage || 'en-US']
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formGroup.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.save.emit(this.formGroup.value);
    } else {
      this.toastr.error('Please fix the errors in the form.');
    }
  }

  onReset() {
    this.formGroup.reset(this.profile);
  }
}
