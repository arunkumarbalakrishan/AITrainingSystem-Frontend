import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-security-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <!-- PASSWORD SECTION -->
    <div class="glass-card p-4 mb-4">
      <h5 class="fw-bold mb-4 text-white d-flex align-items-center gap-2 border-bottom border-light border-opacity-10 pb-3">
        <i class="bi bi-shield-lock-fill text-primary"></i> Login & Password
      </h5>

      <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()">
        <div class="row g-3.5">
          
          <!-- Current Password -->
          <div class="col-md-12">
            <label class="form-label text-secondary small fw-bold">Current Password</label>
            <div class="input-group">
              <input [type]="showCurrentPassword() ? 'text' : 'password'" 
                     formControlName="currentPassword" 
                     class="form-control premium-input border-end-0" 
                     placeholder="Enter your current password" />
              <button class="btn btn-password-toggle bg-dark border-light border-opacity-10 border-start-0 text-secondary" 
                      type="button" 
                      (click)="showCurrentPassword.set(!showCurrentPassword())">
                <i class="bi" [class.bi-eye-fill]="showCurrentPassword()" [class.bi-eye-slash-fill]="!showCurrentPassword()"></i>
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">New Password</label>
            <div class="input-group">
              <input [type]="showNewPassword() ? 'text' : 'password'" 
                     formControlName="newPassword" 
                     class="form-control premium-input border-end-0" 
                     (input)="checkPasswordStrength()"
                     placeholder="Create new password" />
              <button class="btn btn-password-toggle bg-dark border-light border-opacity-10 border-start-0 text-secondary" 
                      type="button" 
                      (click)="showNewPassword.set(!showNewPassword())">
                <i class="bi" [class.bi-eye-fill]="showNewPassword()" [class.bi-eye-slash-fill]="!showNewPassword()"></i>
              </button>
            </div>
            
            <!-- Strength Meter -->
            <div class="mt-2.5">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-secondary opacity-60">Password Strength:</small>
                <small class="fw-semibold text-uppercase" [style.color]="strengthColor()">{{ strengthLabel() }}</small>
              </div>
              <div class="progress bg-black bg-opacity-40" style="height: 6px; border-radius: 3px;">
                <div class="progress-bar" role="progressbar" 
                     [style.width]="strengthPercentage() + '%'" 
                     [style.background-color]="strengthColor()"></div>
              </div>
            </div>
          </div>

          <!-- Confirm New Password -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Confirm New Password</label>
            <div class="input-group">
              <input [type]="showConfirmPassword() ? 'text' : 'password'" 
                     formControlName="confirmPassword" 
                     class="form-control premium-input border-end-0" 
                     placeholder="Confirm your new password" />
              <button class="btn btn-password-toggle bg-dark border-light border-opacity-10 border-start-0 text-secondary" 
                      type="button" 
                      (click)="showConfirmPassword.set(!showConfirmPassword())">
                <i class="bi" [class.bi-eye-fill]="showConfirmPassword()" [class.bi-eye-slash-fill]="!showConfirmPassword()"></i>
              </button>
            </div>
          </div>

          <!-- Rules Checklist -->
          <div class="col-12 mt-2 p-3.5 rounded-3 bg-black bg-opacity-40 border border-light border-opacity-5">
            <span class="text-secondary small fw-bold d-block mb-2">Password Requirements:</span>
            <div class="row g-2">
              <div class="col-sm-6 d-flex align-items-center gap-2 small text-secondary">
                <i class="bi" [class.bi-check-circle-fill]="hasLength()" [class.text-primary]="hasLength()" [class.bi-circle]="!hasLength()"></i>
                <span>Minimum 8 characters</span>
              </div>
              <div class="col-sm-6 d-flex align-items-center gap-2 small text-secondary">
                <i class="bi" [class.bi-check-circle-fill]="hasUpper()" [class.text-primary]="hasUpper()" [class.bi-circle]="!hasUpper()"></i>
                <span>At least one uppercase letter</span>
              </div>
              <div class="col-sm-6 d-flex align-items-center gap-2 small text-secondary">
                <i class="bi" [class.bi-check-circle-fill]="hasLower()" [class.text-primary]="hasLower()" [class.bi-circle]="!hasLower()"></i>
                <span>At least one lowercase letter</span>
              </div>
              <div class="col-sm-6 d-flex align-items-center gap-2 small text-secondary">
                <i class="bi" [class.bi-check-circle-fill]="hasNumber()" [class.text-primary]="hasNumber()" [class.bi-circle]="!hasNumber()"></i>
                <span>At least one number</span>
              </div>
              <div class="col-sm-6 d-flex align-items-center gap-2 small text-secondary">
                <i class="bi" [class.bi-check-circle-fill]="hasSpecial()" [class.text-primary]="hasSpecial()" [class.bi-circle]="!hasSpecial()"></i>
                <span>At least one special character</span>
              </div>
              <div class="col-sm-6 d-flex align-items-center gap-2 small text-secondary">
                <i class="bi" [class.bi-check-circle-fill]="passwordsMatch()" [class.text-primary]="passwordsMatch()" [class.bi-circle]="!passwordsMatch()"></i>
                <span>Passwords match</span>
              </div>
            </div>
          </div>

        </div>

        <div class="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-light border-opacity-10">
          <button type="submit" class="btn btn-primary d-flex align-items-center gap-1.5" 
                  [disabled]="passwordForm.invalid || !passwordForm.dirty || loadingPassword() || strengthPercentage() < 80">
            @if (loadingPassword()) {
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Updating...</span>
            } @else {
              <i class="bi bi-shield-lock-fill"></i>
              <span>Update Password</span>
            }
          </button>
        </div>
      </form>
    </div>

    <!-- MULTI-FACTOR AUTHENTICATION -->
    <div class="glass-card p-4 mb-4">
      <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-shield-check text-primary"></i> Two-Factor Authentication (2FA)
        </h5>
        
        <span class="badge" [class.bg-success]="mfaEnabled()" [class.bg-secondary]="!mfaEnabled()">
          {{ mfaEnabled() ? 'Active / Enabled' : 'Inactive / Disabled' }}
        </span>
      </div>

      <div class="row align-items-center">
        <div class="col-md-8 mb-3 mb-md-0">
          <p class="text-white small fw-bold mb-1">Secure your account with TOTP</p>
          <p class="text-secondary small mb-0">
            Two-factor authentication adds an extra layer of protection. When logging in, you will be required to input a security code generated from an authenticator application (like Google Authenticator or Authy).
          </p>
        </div>
        <div class="col-md-4 text-md-end">
          @if (mfaEnabled()) {
            <button class="btn btn-sm btn-outline-danger border-danger border-opacity-20 d-inline-flex align-items-center gap-1.5" (click)="openDisable2FAModal()">
              <i class="bi bi-shield-x"></i> Disable 2FA
            </button>
          } @else {
            <button class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5" (click)="start2FASetup()">
              <i class="bi bi-shield-plus"></i> Enable 2FA Setup
            </button>
          }
        </div>
      </div>

      <!-- 2FA Setup Panels -->
      @if (showing2FASetup()) {
        <div class="mfa-setup-box mt-4 p-4 rounded-4 bg-black bg-opacity-40 border border-light border-opacity-5 animate-zoom-in">
          <h6 class="text-white fw-bold small text-uppercase mb-3" style="letter-spacing: 0.5px;">Setup Steps</h6>
          
          <div class="row g-4 align-items-center">
            <!-- QR Code -->
            <div class="col-md-4 text-center">
              <div class="p-2 rounded bg-white d-inline-block shadow-sm">
                <img [src]="qrCodeUrl()" alt="TOTP QR Code" style="width: 140px; height: 140px;" />
              </div>
              <small class="text-secondary d-block mt-2 font-monospace" style="font-size: 0.65rem;">Secret: {{ secretKey() }}</small>
            </div>
            
            <!-- Instructions and Verify -->
            <div class="col-md-8">
              <ol class="small text-secondary ps-3.5 mb-3.5">
                <li>Scan this QR code using Google Authenticator, Authy, or Microsoft Authenticator.</li>
                <li>Write down the backup recovery codes listed below in a safe place.</li>
                <li>Input the 6-digit verification code below to verify your authenticator app integration.</li>
              </ol>

              <!-- Backup codes -->
              <div class="p-3.5 rounded bg-dark bg-opacity-80 border border-light border-opacity-5 mb-3.5">
                <small class="text-secondary fw-bold small d-block mb-2 text-uppercase" style="letter-spacing: 0.5px; font-size: 0.65rem;">
                  Backup Recovery Codes (Keep safe)
                </small>
                <div class="row g-1">
                  @for (code of backupCodes(); track code) {
                    <div class="col-6 col-sm-4 font-monospace text-light small">{{ code }}</div>
                  }
                </div>
              </div>

              <!-- Form verification -->
              <div class="d-flex align-items-end gap-3.5">
                <div class="flex-grow-1">
                  <label class="form-label text-secondary small fw-bold">6-Digit Authenticator Code</label>
                  <input type="text" 
                         [(ngModel)]="verificationCode" 
                         maxlength="6"
                         placeholder="000000" 
                         class="form-control premium-input text-center font-monospace fw-bold" 
                         style="letter-spacing: 4px; font-size: 1.1rem; max-width: 200px;" />
                </div>
                <button class="btn btn-primary" [disabled]="verificationCode.length !== 6 || loadingMfa()" (click)="confirm2FA()">
                  @if (loadingMfa()) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                  } @else {
                    Verify & Activate
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- PROFILE PRIVACY SETTINGS -->
    <div class="glass-card p-4 mb-4">
      <h5 class="fw-bold mb-4 text-white d-flex align-items-center gap-2 border-bottom border-light border-opacity-10 pb-3">
        <i class="bi bi-eye-slash-fill text-primary"></i> Profile Privacy & Visibility
      </h5>

      <form [formGroup]="privacyForm" (ngSubmit)="onPrivacySubmit()">
        <div class="d-flex flex-column gap-3">
          
          <!-- Email Visibility -->
          <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center p-2 rounded toggle-row gap-2">
            <div>
              <span class="text-white small fw-bold d-block">Show Email Address</span>
              <small class="text-secondary opacity-60">Control who can see your contact email on public profiles</small>
            </div>
            <select formControlName="showEmail" class="form-select premium-input pt-1 pb-1 px-3 w-sm-auto" style="width: 150px;">
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Only Me">Only Me</option>
            </select>
          </div>

          <!-- Phone Number Visibility -->
          <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center p-2 rounded toggle-row gap-2">
            <div>
              <span class="text-white small fw-bold d-block">Show Phone Number</span>
              <small class="text-secondary opacity-60">Control visibility of your phone details</small>
            </div>
            <select formControlName="showPhone" class="form-select premium-input pt-1 pb-1 px-3 w-sm-auto" style="width: 150px;">
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Only Me">Only Me</option>
            </select>
          </div>

          <!-- Certificates visibility -->
          <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center p-2 rounded toggle-row gap-2">
            <div>
              <span class="text-white small fw-bold d-block">Show Earned Certificates</span>
              <small class="text-secondary opacity-60">Publish your credentials and certificates to exploration logs</small>
            </div>
            <select formControlName="showCertificates" class="form-select premium-input pt-1 pb-1 px-3 w-sm-auto" style="width: 150px;">
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Only Me">Only Me</option>
            </select>
          </div>

          <!-- Achievements Visibility -->
          <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center p-2 rounded toggle-row gap-2">
            <div>
              <span class="text-white small fw-bold d-block">Show Achievement Badges</span>
              <small class="text-secondary opacity-60">Allow peers to view unlocked milestone badges</small>
            </div>
            <select formControlName="showAchievements" class="form-select premium-input pt-1 pb-1 px-3 w-sm-auto" style="width: 150px;">
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Only Me">Only Me</option>
            </select>
          </div>

          <!-- Stats Visibility -->
          <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center p-2 rounded toggle-row gap-2">
            <div>
              <span class="text-white small fw-bold d-block">Show Study Analytics & Stats</span>
              <small class="text-secondary opacity-60">Publish learning hours, completion rate, and active streaks</small>
            </div>
            <select formControlName="showStats" class="form-select premium-input pt-1 pb-1 px-3 w-sm-auto" style="width: 150px;">
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Only Me">Only Me</option>
            </select>
          </div>

        </div>

        <div class="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-light border-opacity-10">
          <button type="submit" class="btn btn-primary d-flex align-items-center gap-1.5" 
                  [disabled]="!privacyForm.dirty || loadingPrivacy()">
            @if (loadingPrivacy()) {
              <span class="spinner-border spinner-border-sm" role="status"></span>
            } @else {
              <i class="bi bi-check-circle-fill"></i>
              <span>Save Privacy Settings</span>
            }
          </button>
        </div>
      </form>
    </div>

    <!-- GDPR DATA EXPORT & ACCOUNT ADMINISTRATION -->
    <div class="glass-card p-4">
      <h5 class="fw-bold mb-4 text-white d-flex align-items-center gap-2 border-bottom border-light border-opacity-10 pb-3">
        <i class="bi bi-shield-fill-exclamation text-danger"></i> Danger Zone & Administration
      </h5>

      <div class="d-flex flex-column gap-3.5">
        
        <!-- GDPR Export -->
        <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center p-3 rounded-4 bg-black bg-opacity-40 border border-light border-opacity-5 gap-3">
          <div>
            <span class="text-white small fw-bold d-block">Export Account Profile Data</span>
            <small class="text-secondary opacity-60">
              Download a complete machine-readable archive (JSON) of your learning history, profile details, and preferences.
            </small>
          </div>
          <button class="btn btn-sm btn-outline-light border-opacity-20 text-white d-flex align-items-center gap-1.5" 
                  [disabled]="exporting()" (click)="exportGDPRData()">
            @if (exporting()) {
              <span class="spinner-border spinner-border-sm" role="status"></span>
            } @else {
              <i class="bi bi-filetype-json"></i>
              <span>Export Account Data</span>
            }
          </button>
        </div>

        <!-- Deactivate/Delete Account -->
        <div class="danger-zone-card d-flex flex-column flex-md-row justify-content-md-between align-items-md-center p-3 rounded-4 gap-3">
          <div>
            <span class="text-danger small fw-bold d-block mb-1">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>Delete Account permanently
            </span>
            <small class="text-secondary" style="opacity: 0.7;">
              Once you delete your account, your certificates, scores, and courses are removed forever. This action is irreversible.
            </small>
          </div>
          <button class="btn btn-sm btn-danger d-flex align-items-center gap-2 flex-shrink-0" (click)="openDeleteModal()">
            <i class="bi bi-trash3-fill"></i>
            <span>Delete Account</span>
          </button>
        </div>

      </div>
    </div>

    <!-- DISABLE 2FA CONFIRMATION MODAL -->
    @if (showingDisable2FAModal()) {
      <div class="custom-modal-backdrop d-flex align-items-center justify-content-center" (click)="closeDisable2FAModal()">
        <div class="custom-modal-content p-4 border border-light border-opacity-10 animate-zoom-in" style="max-width: 400px;" (click)="$event.stopPropagation()">
          <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-light border-opacity-10 pb-2">
            <h6 class="fw-bold text-white mb-0">Disable 2FA Protection</h6>
            <button class="btn-close btn-close-white" (click)="closeDisable2FAModal()"></button>
          </div>
          <p class="text-secondary small mb-3">
            Please enter your current account password to disable Two-Factor Authentication security.
          </p>
          <div class="mb-3">
            <input type="password" [(ngModel)]="confirmPasswordForMfa" placeholder="Confirm account password" class="form-control premium-input" />
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-light border-opacity-20 text-secondary" (click)="closeDisable2FAModal()">Cancel</button>
            <button class="btn btn-sm btn-danger" [disabled]="!confirmPasswordForMfa || loadingMfa()" (click)="confirmDisable2FA()">Disable</button>
          </div>
        </div>
      </div>
    }

    <!-- PERMANENT ACCOUNT DELETION CONFIRMATION MODAL -->
    @if (showingDeleteModal()) {
      <div class="custom-modal-backdrop d-flex align-items-center justify-content-center" (click)="closeDeleteModal()">
        <div class="custom-modal-content p-4 border border-light border-opacity-10 animate-zoom-in" style="max-width: 420px;" (click)="$event.stopPropagation()">
          <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-light border-opacity-10 pb-2">
            <h6 class="fw-bold text-danger mb-0">Irreversible Account Deletion</h6>
            <button class="btn-close btn-close-white" (click)="closeDeleteModal()"></button>
          </div>
          <p class="text-secondary small mb-3">
            <strong>WARNING:</strong> This action will delete your student/trainer logs and remove your access. Enter your password below to confirm deletion.
          </p>
          <div class="mb-3">
            <input type="password" [(ngModel)]="deleteConfirmPassword" placeholder="Confirm account password" class="form-control premium-input" />
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-light border-opacity-20 text-secondary" (click)="closeDeleteModal()">Cancel</button>
            <button class="btn btn-sm btn-danger" [disabled]="!deleteConfirmPassword || loadingDelete()" (click)="confirmDeleteAccount()">Delete Permanently</button>
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
    .btn-password-toggle {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0 10px 10px 0;
      transition: all 0.2s ease;
    }
    .btn-password-toggle:hover {
      background: rgba(255, 255, 255, 0.05) !important;
    }
    .input-group .premium-input {
      border-radius: 10px 0 0 10px;
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
    .mfa-setup-box {
      background: rgba(5, 5, 5, 0.5) !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .animate-pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .custom-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 1060;
    }
    .custom-modal-content {
      background: #0d1117;
      border-radius: 20px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .danger-zone-card {
      background: rgba(255, 77, 79, 0.06);
      border: 1px solid rgba(255, 77, 79, 0.2);
      user-select: none;
      transition: all 0.2s ease;
    }
    .danger-zone-card:hover {
      background: rgba(255, 77, 79, 0.09);
      border-color: rgba(255, 77, 79, 0.3);
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
export class SecurityCenterComponent implements OnInit, OnChanges {
  @Input() privacy: any = {};
  @Output() securityChanged = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private profileService = inject(ProfileService);

  // Password forms
  passwordForm!: FormGroup;
  loadingPassword = signal(false);
  
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // Strength signals
  hasLength = signal(false);
  hasUpper = signal(false);
  hasLower = signal(false);
  hasNumber = signal(false);
  hasSpecial = signal(false);
  passwordsMatch = signal(false);

  strengthPercentage = computed(() => {
    let score = 0;
    if (this.hasLength()) score += 20;
    if (this.hasUpper()) score += 20;
    if (this.hasLower()) score += 20;
    if (this.hasNumber()) score += 20;
    if (this.hasSpecial()) score += 10;
    if (this.passwordsMatch()) score += 10;
    return score;
  });

  strengthLabel = computed(() => {
    const pct = this.strengthPercentage();
    if (pct < 40) return 'Weak';
    if (pct < 80) return 'Medium';
    return 'Strong';
  });

  strengthColor = computed(() => {
    const pct = this.strengthPercentage();
    if (pct < 40) return '#FF4D4F';
    if (pct < 80) return '#FFB800';
    return '#9FEF00';
  });

  // 2FA Setup State
  mfaEnabled = signal(false);
  showing2FASetup = signal(false);
  loadingMfa = signal(false);
  qrCodeUrl = signal('');
  secretKey = signal('');
  backupCodes = signal<string[]>([]);
  verificationCode = '';

  showingDisable2FAModal = signal(false);
  confirmPasswordForMfa = '';

  // Privacy forms
  privacyForm!: FormGroup;
  loadingPrivacy = signal(false);

  // Account Operations
  exporting = signal(false);
  showingDeleteModal = signal(false);
  loadingDelete = signal(false);
  deleteConfirmPassword = '';

  ngOnInit() {
    this.initForms();
    this.mfaEnabled.set(this.profileService.is2FAEnabled());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['privacy'] && this.privacyForm) {
      this.privacyForm.patchValue(this.privacy);
    }
  }

  private initForms() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.privacyForm = this.fb.group({
      showEmail: [this.privacy.showEmail || 'Public'],
      showPhone: [this.privacy.showPhone || 'Only Me'],
      showCertificates: [this.privacy.showCertificates || 'Public'],
      showAchievements: [this.privacy.showAchievements || 'Public'],
      showStats: [this.privacy.showStats || 'Public']
    });

    // Listen to password match validation changes
    this.passwordForm.valueChanges.subscribe(() => {
      const match = this.passwordForm.get('newPassword')?.value === this.passwordForm.get('confirmPassword')?.value;
      const isNewFilled = !!this.passwordForm.get('newPassword')?.value;
      this.passwordsMatch.set(isNewFilled && match);
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  checkPasswordStrength() {
    const val = this.passwordForm.get('newPassword')?.value || '';
    this.hasLength.set(val.length >= 8);
    this.hasUpper.set(/[A-Z]/.test(val));
    this.hasLower.set(/[a-z]/.test(val));
    this.hasNumber.set(/[0-9]/.test(val));
    this.hasSpecial.set(/[!@#$%^&*(),.?":{}|<>]/.test(val));
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) return;
    this.loadingPassword.set(true);
    
    const { currentPassword, newPassword } = this.passwordForm.value;
    
    // Simulate API delay
    setTimeout(() => {
      this.profileService.updateProfile({
        currentPassword,
        newPassword
      }).subscribe({
        next: () => {
          this.loadingPassword.set(false);
          this.toastr.success('Password updated successfully.');
          this.passwordForm.reset();
          this.resetStrengthFlags();
          this.securityChanged.emit();
        },
        error: (err: any) => {
          this.loadingPassword.set(false);
          this.toastr.error(err.message || 'Password update failed.');
        }
      });
    }, 1500);
  }

  private resetStrengthFlags() {
    this.hasLength.set(false);
    this.hasUpper.set(false);
    this.hasLower.set(false);
    this.hasNumber.set(false);
    this.hasSpecial.set(false);
    this.passwordsMatch.set(false);
  }

  // --- TWO FACTOR METHODS ---
  start2FASetup() {
    this.loadingMfa.set(true);
    this.profileService.setup2FA().subscribe(res => {
      this.qrCodeUrl.set(res.qrCodeUrl);
      this.secretKey.set(res.secretCode);
      this.backupCodes.set(res.backupCodes);
      this.showing2FASetup.set(true);
      this.loadingMfa.set(false);
    });
  }

  confirm2FA() {
    this.loadingMfa.set(true);
    this.profileService.enable2FA(this.verificationCode).subscribe({
      next: () => {
        this.loadingMfa.set(false);
        this.mfaEnabled.set(true);
        this.showing2FASetup.set(false);
        this.verificationCode = '';
        this.toastr.success('Two-Factor Authentication is activated!');
        this.securityChanged.emit();
      },
      error: (err: any) => {
        this.loadingMfa.set(false);
        this.toastr.error(err.message);
      }
    });
  }

  openDisable2FAModal() {
    this.confirmPasswordForMfa = '';
    this.showingDisable2FAModal.set(true);
  }

  closeDisable2FAModal() {
    this.showingDisable2FAModal.set(false);
  }

  confirmDisable2FA() {
    this.loadingMfa.set(true);
    this.profileService.disable2FA(this.confirmPasswordForMfa).subscribe({
      next: () => {
        this.loadingMfa.set(false);
        this.mfaEnabled.set(false);
        this.showingDisable2FAModal.set(false);
        this.toastr.info('Two-Factor Authentication has been disabled.');
        this.securityChanged.emit();
      },
      error: (err: any) => {
        this.loadingMfa.set(false);
        this.toastr.error(err.message);
      }
    });
  }

  // --- PRIVACY METHODS ---
  onPrivacySubmit() {
    this.loadingPrivacy.set(true);
    this.profileService.savePrivacySettings(this.privacyForm.value).subscribe(() => {
      this.loadingPrivacy.set(false);
      this.privacyForm.markAsPristine();
      this.toastr.success('Privacy settings saved successfully.');
    });
  }

  // --- GDPR DATA EXPORT ---
  exportGDPRData() {
    this.exporting.set(true);
    this.toastr.info('Packaging your data export archive...');
    
    setTimeout(() => {
      this.profileService.exportAccountData().subscribe(() => {
        this.exporting.set(false);
        this.toastr.success('Your GDPR profile archive has downloaded.');
      });
    }, 2000);
  }

  // --- ACCOUNT DELETION ---
  openDeleteModal() {
    this.deleteConfirmPassword = '';
    this.showingDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showingDeleteModal.set(false);
  }

  confirmDeleteAccount() {
    this.loadingDelete.set(true);
    this.profileService.deleteAccount(this.deleteConfirmPassword).subscribe({
      next: () => {
        this.loadingDelete.set(false);
        this.showingDeleteModal.set(false);
        this.toastr.warning('Your account has been deleted. Redirecting...');
        
        // Clear login status & redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      },
      error: (err: any) => {
        this.loadingDelete.set(false);
        this.toastr.error(err.message);
      }
    });
  }
}
