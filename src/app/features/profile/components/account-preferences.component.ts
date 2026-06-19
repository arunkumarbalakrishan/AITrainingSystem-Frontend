import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-card p-4">
      
      <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-gear-wide-connected text-primary"></i> Account Preferences
        </h5>
        @if (formGroup.dirty) {
          <span class="badge bg-warning text-black animate-pulse">Unsaved Changes</span>
        }
      </div>

      <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
        <div class="row g-3.5">
          
          <!-- Theme Mode -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Theme Mode</label>
            <select formControlName="themeMode" class="form-select premium-input">
              <option value="Dark">Dark Mode (Premium Default)</option>
              <option value="Light">Light Mode</option>
              <option value="System">System Preferences</option>
            </select>
          </div>

          <!-- Language -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">System Language</label>
            <select formControlName="systemLanguage" class="form-select premium-input">
              <option value="en-US">English (United States)</option>
              <option value="en-GB">English (Great Britain)</option>
              <option value="es-ES">Spanish (Español)</option>
              <option value="fr-FR">French (Français)</option>
              <option value="de-DE">German (Deutsch)</option>
              <option value="zh-CN">Chinese (Simplified)</option>
            </select>
          </div>

          <!-- Timezone -->
          <div class="col-md-12">
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

          <!-- Date Format -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Date Format</label>
            <select formControlName="dateFormat" class="form-select premium-input">
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-06-19)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 19/06/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 06/19/2026)</option>
            </select>
          </div>

          <!-- Time Format -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Time Format</label>
            <select formControlName="timeFormat" class="form-select premium-input">
              <option value="12-hour">12-hour (e.g. 03:40 PM)</option>
              <option value="24-hour">24-hour (e.g. 15:40)</option>
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
export class AccountPreferencesComponent implements OnInit, OnChanges {
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
      themeMode: [this.preferences.themeMode || 'Dark'],
      systemLanguage: [this.preferences.systemLanguage || 'en-US'],
      timezone: [this.preferences.timezone || 'GMT-8 (Pacific Standard Time)'],
      dateFormat: [this.preferences.dateFormat || 'YYYY-MM-DD'],
      timeFormat: [this.preferences.timeFormat || '12-hour']
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
