import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

// Subcomponents
import { ProfileHeaderComponent } from './components/profile-header.component';
import { ProfileCompletionComponent } from './components/profile-completion.component';
import { PersonalInfoFormComponent } from './components/personal-info-form.component';
import { ProfessionalInfoFormComponent } from './components/professional-info-form.component';
import { LearningStatisticsComponent } from './components/learning-statistics.component';
import { CertificateSectionComponent } from './components/certificate-section.component';
import { AchievementSectionComponent } from './components/achievement-section.component';
import { AiPreferencesComponent } from './components/ai-preferences.component';
import { NotificationSettingsComponent } from './components/notification-settings.component';
import { SecurityCenterComponent } from './components/security-center.component';
import { LoginHistoryComponent } from './components/login-history.component';
import { ActiveSessionsComponent } from './components/active-sessions.component';
import { ActivityTimelineComponent } from './components/activity-timeline.component';
import { LearningGoalsComponent } from './components/learning-goals.component';
import { AccountPreferencesComponent } from './components/account-preferences.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileHeaderComponent,
    ProfileCompletionComponent,
    PersonalInfoFormComponent,
    ProfessionalInfoFormComponent,
    LearningStatisticsComponent,
    CertificateSectionComponent,
    AchievementSectionComponent,
    AiPreferencesComponent,
    NotificationSettingsComponent,
    SecurityCenterComponent,
    LoginHistoryComponent,
    ActiveSessionsComponent,
    ActivityTimelineComponent,
    LearningGoalsComponent,
    AccountPreferencesComponent
  ],
  template: `
    <div class="profile-premium-theme container py-4 mt-2 mb-5">
      
      <!-- Profile Header Banner -->
      <div class="position-relative mb-4">
        <app-profile-header 
          [profile]="profileData" 
          [avatarUrl]="avatarUrl()" 
          [coverUrl]="coverUrl()" 
          [pinnedCertificates]="pinnedCertificates()"
          (avatarChanged)="uploadAvatar($event)"
          (avatarRemoved)="removeAvatar()"
          (coverChanged)="uploadCover($event)"
          (coverRemoved)="removeCover()"
          (unpinCertificate)="onPinCertificate($event)">
        </app-profile-header>
      </div>

      <!-- Premium Horizontal Navigation Tabs Bar -->
      <div class="profile-nav-tabs-wrapper mb-4">
        <div class="profile-nav-tabs d-flex align-items-center gap-2 overflow-x-auto pb-1">
          <button class="btn btn-nav-tab d-flex align-items-center gap-2.5 px-4 py-2.5 rounded-3 text-nowrap"
                  [class.active]="activeTab() === 'overview'" 
                  (click)="activeTab.set('overview')">
            <i class="bi bi-grid-1x2-fill"></i>
            <span>Overview</span>
          </button>
          <button class="btn btn-nav-tab d-flex align-items-center gap-2.5 px-4 py-2.5 rounded-3 text-nowrap"
                  [class.active]="activeTab() === 'details'" 
                  (click)="activeTab.set('details')">
            <i class="bi bi-person-bounding-box"></i>
            <span>Profile Details</span>
          </button>
          <button class="btn btn-nav-tab d-flex align-items-center gap-2.5 px-4 py-2.5 rounded-3 text-nowrap"
                  [class.active]="activeTab() === 'credentials'" 
                  (click)="activeTab.set('credentials')">
            <i class="bi bi-award-fill"></i>
            <span>Credentials</span>
          </button>
          <button class="btn btn-nav-tab d-flex align-items-center gap-2.5 px-4 py-2.5 rounded-3 text-nowrap"
                  [class.active]="activeTab() === 'preferences'" 
                  (click)="activeTab.set('preferences')">
            <i class="bi bi-sliders"></i>
            <span>Preferences</span>
          </button>
          <button class="btn btn-nav-tab d-flex align-items-center gap-2.5 px-4 py-2.5 rounded-3 text-nowrap"
                  [class.active]="activeTab() === 'security'" 
                  (click)="activeTab.set('security')">
            <i class="bi bi-shield-lock-fill"></i>
            <span>Security &amp; Audit</span>
          </button>
        </div>
      </div>

      <!-- Tab Content — full width -->
      <div class="row">
        <div class="col-12">

          <!-- TAB 1: OVERVIEW -->
          <div *ngIf="activeTab() === 'overview'" class="tab-pane-content d-flex flex-column gap-4 animate-fade-in">
            <app-learning-statistics [stats]="analyticsData" [role]="userRole"></app-learning-statistics>
            
            <div class="row g-4">
              <!-- Left Column: Completion Progress & Target Goals -->
              <div class="col-lg-5 d-flex flex-column gap-4">
                <app-profile-completion [completionData]="completionStats"></app-profile-completion>
                <app-learning-goals 
                  [goalHours]="weeklyHoursGoal" 
                  [goalCourses]="weeklyCoursesGoal" 
                  [actualHours]="actualHoursStudied"
                  [loading]="savingGoals"
                  (save)="onSaveGoals($event)">
                </app-learning-goals>
              </div>

              <!-- Right Column: Recent Activity Timeline -->
              <div class="col-lg-7">
                <app-activity-timeline [events]="timelineData"></app-activity-timeline>
              </div>
            </div>
          </div>

          <!-- TAB 2: PROFILE DETAILS -->
          <div *ngIf="activeTab() === 'details'" class="tab-pane-content d-flex flex-column gap-4 animate-fade-in">
            <app-personal-info-form 
              [profile]="profileData" 
              [loading]="savingProfile" 
              (save)="onSaveProfile($event)">
            </app-personal-info-form>
            <app-professional-info-form 
              [profile]="profileData" 
              [loading]="savingProfile" 
              (save)="onSaveProfile($event)">
            </app-professional-info-form>
          </div>

          <!-- TAB 3: CREDENTIALS -->
          <div *ngIf="activeTab() === 'credentials'" class="tab-pane-content d-flex flex-column gap-4 animate-fade-in">
            <app-certificate-section 
              [certificates]="certificatesList" 
              (pinToggle)="onPinCertificate($event)">
            </app-certificate-section>
            <app-achievement-section [achievements]="achievementsList"></app-achievement-section>
          </div>

          <!-- TAB 4: PREFERENCES -->
          <div *ngIf="activeTab() === 'preferences'" class="tab-pane-content d-flex flex-column gap-4 animate-fade-in">
            <app-ai-preferences 
              [preferences]="preferencesData" 
              [loading]="savingPrefs" 
              (save)="onSavePreferences($event)">
            </app-ai-preferences>
            <app-account-preferences 
              [preferences]="preferencesData" 
              [loading]="savingPrefs" 
              (save)="onSavePreferences($event)">
            </app-account-preferences>
            <app-notification-settings 
              [preferences]="preferencesData" 
              [loading]="savingPrefs" 
              (save)="onSavePreferences($event)">
            </app-notification-settings>
          </div>

          <!-- TAB 5: SECURITY -->
          <div *ngIf="activeTab() === 'security'" class="tab-pane-content d-flex flex-column gap-4 animate-fade-in">
            <app-security-center 
              [privacy]="privacyData" 
              (securityChanged)="loadSecurityData()">
            </app-security-center>
            <app-active-sessions 
              [sessions]="activeSessions"
              (terminate)="onTerminateSession($event)"
              (terminateAll)="onTerminateAllSessions()">
            </app-active-sessions>
            <app-login-history [logs]="loginHistory"></app-login-history>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: var(--bg-color);
      min-height: 100%;
      transition: background-color 0.3s ease;
    }
    /* Profile Premium Theme variables */
    .profile-premium-theme {
      background-color: var(--bg-color);
      --primary-color: #9FEF00;
      --primary-hover-color: #B8FF36;
      --bg-color: var(--bg-color);
      --card-bg-color: var(--card-bg);
      --border-color: var(--border-color);
      --text-primary: var(--text-primary);
      --text-secondary: var(--text-secondary);
      --color-success: #00D26A;
      --color-warning: #FFB800;
      --color-danger: #FF4D4F;
      transition: background-color 0.3s ease;
    }
    /* Premium horizontal nav tabs bar */
    .profile-nav-tabs-wrapper {
      background: rgba(13, 17, 23, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 8px 12px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .profile-nav-tabs {
      scrollbar-width: none; /* Hide scrollbar for Chrome/Firefox */
    }
    .profile-nav-tabs::-webkit-scrollbar {
      display: none; /* Hide scrollbar for Safari/Chrome */
    }
    
    .btn-nav-tab {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.92rem;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    .btn-nav-tab:hover {
      background: rgba(255, 255, 255, 0.04);
      color: #ffffff;
    }
    .btn-nav-tab.active {
      background: rgba(159, 239, 0, 0.12) !important;
      color: var(--primary-color) !important;
      border-color: rgba(159, 239, 0, 0.3) !important;
      box-shadow: 0 0 12px rgba(159, 239, 0, 0.15);
    }
    .whitespace-nowrap {
      white-space: nowrap;
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
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private toastr = inject(ToastrService);

  // Layout Tab State
  activeTab = signal<string>('overview');

  // Loaded State
  profileData: any = {};
  analyticsData: any = {};
  preferencesData: any = {};
  privacyData: any = {};
  
  certificatesList: any[] = [];
  achievementsList: any[] = [];
  timelineData: any[] = [];
  loginHistory: any[] = [];
  activeSessions: any[] = [];

  // Media signals
  avatarUrl = signal<string | null>(null);
  coverUrl = signal<string | null>(null);

  // Sub goals values
  weeklyHoursGoal = 10;
  weeklyCoursesGoal = 2;
  actualHoursStudied = 6.5;

  // Loader Flags
  savingProfile = false;
  savingGoals = false;
  savingPrefs = false;
  userRole = 'Student';

  // Compute pinned certificates list
  pinnedCertificates = signal<any[]>([]);

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    this.loadAllData();
  }

  loadAllData() {
    // 1. Load Profile
    this.profileService.getProfile().subscribe(res => {
      this.profileData = res;
      this.avatarUrl.set(this.profileService.getLocalAvatar());
      this.coverUrl.set(this.profileService.getLocalCover());
    });

    // 2. Load Analytics
    this.profileService.getAnalytics().subscribe(res => {
      this.analyticsData = res;
      this.actualHoursStudied = res.learningHours || 6.5;
    });

    // 3. Load Goals
    this.profileService.getGoals().subscribe(res => {
      this.weeklyHoursGoal = res.weeklyHoursTarget || 10;
      this.weeklyCoursesGoal = res.weeklyGoalCourses || 2;
    });

    // 4. Load Preferences
    this.profileService.getPreferences().subscribe(res => {
      this.preferencesData = res;
    });

    // 5. Load Privacy
    this.profileService.getPrivacySettings().subscribe(res => {
      this.privacyData = res;
    });

    // 6. Load Certificates & Pin states
    this.loadCertificates();

    // 7. Load Achievements
    this.profileService.getAchievements().subscribe(res => {
      this.achievementsList = res;
    });

    // 8. Load Audit Details
    this.loadSecurityData();
  }

  loadCertificates() {
    this.profileService.getMyCertificates().subscribe(res => {
      this.certificatesList = res;
      this.pinnedCertificates.set(res.filter(c => c.pinned));
    });
  }

  loadSecurityData() {
    this.profileService.getTimelineActivity().subscribe(res => {
      this.timelineData = res;
    });
    this.profileService.getLoginHistory().subscribe(res => {
      this.loginHistory = res;
    });
    this.profileService.getActiveSessions().subscribe(res => {
      this.activeSessions = res;
    });
  }

  // --- SAVE ACTIONS ---
  onSaveProfile(data: any) {
    this.savingProfile = true;
    this.profileService.updateProfile(data).subscribe({
      next: () => {
        this.savingProfile = false;
        this.toastr.success('Profile details saved successfully.');
        this.loadAllData();
      },
      error: (err) => {
        this.savingProfile = false;
        this.toastr.error(err.message || 'Profile update failed.');
      }
    });
  }

  onSaveGoals(data: any) {
    this.savingGoals = true;
    this.profileService.saveGoals(data).subscribe({
      next: () => {
        this.savingGoals = false;
        this.toastr.success('Weekly learning target goals updated.');
        this.loadAllData();
      },
      error: () => {
        this.savingGoals = false;
        this.toastr.error('Goals update failed.');
      }
    });
  }

  onSavePreferences(data: any) {
    this.savingPrefs = true;
    this.profileService.savePreferences(data).subscribe({
      next: () => {
        this.savingPrefs = false;
        this.toastr.success('System preferences and toggles updated.');
        this.loadAllData();
      },
      error: () => {
        this.savingPrefs = false;
        this.toastr.error('Preferences update failed.');
      }
    });
  }

  // --- MEDIA ACTIONS ---
  uploadAvatar(file: File) {
    this.profileService.uploadAvatar(file).subscribe(res => {
      this.avatarUrl.set(res.avatarUrl);
      this.toastr.success('Profile avatar updated successfully!');
      this.loadAllData();
    });
  }

  removeAvatar() {
    this.profileService.removeAvatar().subscribe(() => {
      this.avatarUrl.set(null);
      this.toastr.info('Profile avatar removed.');
      this.loadAllData();
    });
  }

  uploadCover(file: File) {
    this.profileService.uploadCover(file).subscribe(res => {
      this.coverUrl.set(res.coverUrl);
      this.toastr.success('Profile cover banner updated!');
      this.loadAllData();
    });
  }

  removeCover() {
    this.profileService.removeCover().subscribe(() => {
      this.coverUrl.set(null);
      this.toastr.info('Profile cover banner removed.');
      this.loadAllData();
    });
  }

  // --- CERTIFICATE ACTIONS ---
  onPinCertificate(id: string) {
    this.profileService.togglePinCertificate(id).subscribe({
      next: () => {
        this.loadCertificates();
      },
      error: (err) => {
        this.toastr.warning(err.message);
      }
    });
  }

  // --- SESSIONS ---
  onTerminateSession(id: string) {
    this.profileService.terminateSession(id).subscribe(() => {
      this.loadSecurityData();
    });
  }

  onTerminateAllSessions() {
    this.profileService.logoutOtherDevices().subscribe(() => {
      this.loadSecurityData();
    });
  }

  // --- COMPUTED PROPERTIES ---
  get completionStats(): any {
    const hasAvatar = !!this.avatarUrl();
    const hasCover = !!this.coverUrl();
    
    // Check if personal profile completed
    const personalCompleted = !!(
      this.profileData.fullName &&
      this.profileData.username &&
      this.profileData.phoneNumber &&
      this.profileData.dateOfBirth &&
      this.profileData.country
    );

    // Check if professional details completed
    const professionalCompleted = !!(
      this.profileData.designation &&
      this.profileData.skills &&
      this.profileData.skills.length > 0 &&
      this.profileData.biography
    );

    // Check if 2FA is active
    const securityCompleted = this.profileService.is2FAEnabled();

    // Check if AI study style is set
    const preferencesCompleted = !!(
      this.preferencesData.aiTutorName &&
      this.preferencesData.aiLearningStyle
    );

    // Check if user has certificates
    const hasCertificates = this.certificatesList.length > 0;

    return {
      hasAvatar,
      hasCover,
      personalCompleted,
      professionalCompleted,
      securityCompleted,
      preferencesCompleted,
      hasCertificates
    };
  }
}
