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

      <!-- Navigation Grid layout -->
      <div class="row g-4 mt-1">
        
        <!-- Sidebar Navigation -->
        <div class="col-lg-3">
          <div class="glass-sidebar p-3 d-flex flex-row flex-lg-column gap-2 overflow-x-auto overflow-y-hidden overflow-lg-y-auto w-100">
            <button class="btn btn-sidebar-tab d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-start whitespace-nowrap"
                    [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Overview</span>
            </button>
            
            <button class="btn btn-sidebar-tab d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-start whitespace-nowrap"
                    [class.active]="activeTab() === 'details'" (click)="activeTab.set('details')">
              <i class="bi bi-person-bounding-box"></i>
              <span>Profile Details</span>
            </button>

            <button class="btn btn-sidebar-tab d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-start whitespace-nowrap"
                    [class.active]="activeTab() === 'credentials'" (click)="activeTab.set('credentials')">
              <i class="bi bi-award-fill"></i>
              <span>Credentials</span>
            </button>

            <button class="btn btn-sidebar-tab d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-start whitespace-nowrap"
                    [class.active]="activeTab() === 'preferences'" (click)="activeTab.set('preferences')">
              <i class="bi bi-sliders"></i>
              <span>Preferences</span>
            </button>

            <button class="btn btn-sidebar-tab d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-start whitespace-nowrap"
                    [class.active]="activeTab() === 'security'" (click)="activeTab.set('security')">
              <i class="bi bi-shield-lock-fill"></i>
              <span>Security & Audit</span>
            </button>
          </div>
        </div>

        <!-- Active Tab Pane -->
        <div class="col-lg-9">
          
          <!-- TAB 1: OVERVIEW -->
          <div *ngIf="activeTab() === 'overview'" class="tab-pane-content d-flex flex-column gap-4 animate-fade-in">
            <div class="row g-4">
              <div class="col-md-7 d-flex flex-column gap-4">
                <app-learning-statistics [stats]="analyticsData" [role]="userRole"></app-learning-statistics>
                <app-activity-timeline [events]="timelineData"></app-activity-timeline>
              </div>
              <div class="col-md-5 d-flex flex-column gap-4">
                <app-profile-completion [completionData]="completionStats"></app-profile-completion>
                <app-learning-goals 
                  [goalHours]="weeklyHoursGoal" 
                  [goalCourses]="weeklyCoursesGoal" 
                  [actualHours]="actualHoursStudied"
                  [loading]="savingGoals"
                  (save)="onSaveGoals($event)">
                </app-learning-goals>
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
    /* Profile Premium Dark Themes */
    .profile-premium-theme {
      --primary-color: #9FEF00;
      --primary-hover-color: #B8FF36;
      --bg-color: #050505;
      --card-bg-color: #0D1117;
      --border-color: rgba(255, 255, 255, 0.08);
      --text-primary: #FFFFFF;
      --text-secondary: #A0A0A0;
      --color-success: #00D26A;
      --color-warning: #FFB800;
      --color-danger: #FF4D4F;
    }
    .glass-sidebar {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .btn-sidebar-tab {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-weight: 500;
      transition: all 0.25s ease;
    }
    .btn-sidebar-tab:hover {
      background: rgba(255, 255, 255, 0.03);
      color: #ffffff;
    }
    .btn-sidebar-tab.active {
      background: rgba(159, 239, 0, 0.1) !important;
      color: var(--primary-color) !important;
      border: 1px solid rgba(159, 239, 0, 0.2);
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
    
    @media (max-width: 991.98px) {
      .glass-sidebar {
        flex-direction: row;
        overflow-x: auto;
      }
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
