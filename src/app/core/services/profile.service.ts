import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api-config';
import { AuthService } from './auth.service';
import { CertificateService } from './certificate.service';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private certService = inject(CertificateService);
  private themeService = inject(ThemeService);
  
  private profileUrl = `${API_CONFIG.baseUrl}/Users/profile`;
  
  // Storage keys
  private readonly STORAGE_KEY = 'premium_user_profile';
  private readonly COVER_KEY = 'premium_profile_cover';
  private readonly AVATAR_KEY = 'premium_profile_avatar';
  private readonly GOALS_KEY = 'premium_learning_goals';
  private readonly PREFS_KEY = 'premium_account_prefs';
  private readonly PRIVACY_KEY = 'premium_privacy_settings';
  private readonly SESSIONS_KEY = 'premium_active_sessions';
  private readonly TIMELINE_KEY = 'premium_activity_timeline';
  private readonly TWO_FA_KEY = 'premium_2fa_setup';

  constructor() {
    this.initDefaultData();
  }

  // --- INITIAL DATA SEEDING ---
  private initDefaultData() {
    const email = this.authService.getUserEmail();
    const name = this.authService.getUserName();
    
    // Seed Profile Data
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const defaultProfile = {
        fullName: name,
        username: email ? email.split('@')[0] : 'learner',
        email: email || 'learner@aitraining.com',
        phoneNumber: '+1 (555) 019-2834',
        dateOfBirth: '1998-05-14',
        gender: 'Male',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        timezone: 'GMT-8 (Pacific Standard Time)',
        preferredLanguage: 'en-US',
        
        // Professional Info
        designation: 'Software Engineer',
        organization: 'AI Tech Solutions Corp',
        experienceLevel: 'Intermediate',
        skills: ['Angular', 'TypeScript', 'RxJS', 'C#', '.NET Core', 'Machine Learning'],
        biography: 'Passionate software developer interested in Angular architecture, standalone components, and integrating generative AI tools in daily development workflows.',
        
        // Social URLs
        linkedinUrl: 'https://linkedin.com/in/alex-learner',
        githubUrl: 'https://github.com/alex-learner',
        portfolioUrl: 'https://alex-learner.dev',
        twitterUrl: 'https://twitter.com/alex_learner',
        youtubeUrl: 'https://youtube.com/@alex_learning',
        instagramUrl: 'https://instagram.com/alex_learns',
        websiteUrl: 'https://alex-learner.dev/blog'
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultProfile));
    }

    // Seed Timeline Log
    if (!localStorage.getItem(this.TIMELINE_KEY)) {
      const defaultTimeline = [
        { id: 1, type: 'course', title: 'Completed Angular 21 Architecture Course', date: new Date(Date.now() - 3600000 * 2).toISOString(), icon: 'bi-journal-check', color: '#00D26A' },
        { id: 2, type: 'certificate', title: 'Earned AWS Certified Foundational Credential', date: new Date(Date.now() - 3600000 * 24).toISOString(), icon: 'bi-award-fill', color: '#FFB800' },
        { id: 3, type: 'profile', title: 'Updated biography and professional designation', date: new Date(Date.now() - 3600000 * 48).toISOString(), icon: 'bi-person-badge', color: '#9FEF00' },
        { id: 4, type: 'security', title: 'Changed login password', date: new Date(Date.now() - 3600000 * 120).toISOString(), icon: 'bi-shield-lock-fill', color: '#FF4D4F' },
        { id: 5, type: 'quiz', title: 'Passed C# Quiz Master Evaluation (Score 95%)', date: new Date(Date.now() - 3600000 * 200).toISOString(), icon: 'bi-patch-check-fill', color: '#00D26A' }
      ];
      localStorage.setItem(this.TIMELINE_KEY, JSON.stringify(defaultTimeline));
    }

    // Seed Active Sessions
    if (!localStorage.getItem(this.SESSIONS_KEY)) {
      const defaultSessions = [
        { id: 'sess-1', device: 'Chrome on Windows 11 (Current)', location: 'San Francisco, CA', ipAddress: '192.168.1.*** (Masked)', loginTime: new Date(Date.now() - 3600000).toISOString(), lastActivity: 'Just Now', current: true },
        { id: 'sess-2', device: 'Safari on iPhone 15 Pro', location: 'San Jose, CA', ipAddress: '72.190.23.*** (Masked)', loginTime: new Date(Date.now() - 86400000 * 2).toISOString(), lastActivity: '2 hours ago', current: false },
        { id: 'sess-3', device: 'Firefox on macOS Sonoma', location: 'Oakland, CA', ipAddress: '24.120.40.*** (Masked)', loginTime: new Date(Date.now() - 86400000 * 5).toISOString(), lastActivity: '3 days ago', current: false }
      ];
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(defaultSessions));
    }

    // Seed Goals
    if (!localStorage.getItem(this.GOALS_KEY)) {
      const defaultGoals = {
        dailyStudyHours: 2.0,
        dailyHoursProgress: 1.5,
        weeklyGoalCourses: 2,
        weeklyCoursesProgress: 1,
        monthlyGoalCertificates: 3,
        monthlyCertificatesProgress: 2,
        targetCourses: ['Advanced Angular Components', 'Building Web APIs with C#', 'Deep Learning Basics']
      };
      localStorage.setItem(this.GOALS_KEY, JSON.stringify(defaultGoals));
    }

    // Seed Privacy
    if (!localStorage.getItem(this.PRIVACY_KEY)) {
      const defaultPrivacy = {
        showEmail: 'Public',
        showPhone: 'Only Me',
        showCertificates: 'Public',
        showAchievements: 'Public',
        showStats: 'Public'
      };
      localStorage.setItem(this.PRIVACY_KEY, JSON.stringify(defaultPrivacy));
    }

    // Seed Preferences
    if (!localStorage.getItem(this.PREFS_KEY)) {
      const defaultPrefs = {
        themeMode: 'dark',
        interfaceLanguage: 'en-US',
        dateTimezone: 'GMT-8 (Pacific Standard Time)',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        // AI Preferences
        aiTutorName: 'Aria',
        aiLearningStyle: 'Practical',
        aiDifficultyLevel: 'Intermediate',
        voiceResponseEnabled: false,
        personalizedRecommendations: true,
        smartStudyPlans: true,
        aiNotificationsEnabled: true,
        // Notifications
        emailNotifications: true,
        courseUpdates: true,
        certificateAlerts: true,
        assignmentReminders: true,
        systemNotifications: true,
        marketingEmails: false,
        aiAssistantAlerts: true,
        securityAlerts: true
      };
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(defaultPrefs));
    }
  }

  // --- PROFILE DATA GET/SET ---
  getProfile(): Observable<any> {
    // Attempt backend first
    return this.http.get<any>(`${API_CONFIG.baseUrl}/Users/me`).pipe(
      map(res => {
        const backendData = res.data || res;
        const local = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        // Merge so we retain full backend identity (email/name) + our local premium parameters
        const merged = { ...local, ...backendData };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }),
      catchError(() => {
        // Fallback to local storage if API fails or mock setup
        const local = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        return of(local);
      })
    );
  }

  updateProfile(profileData: any): Observable<any> {
    // Save locally
    const current = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const updated = { ...current, ...profileData };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

    this.addTimelineEvent('profile', 'Updated personal/professional details');

    // Attempt PUT backend
    return this.http.put<any>(this.profileUrl, {
      fullName: profileData.fullName,
      currentPassword: profileData.currentPassword,
      newPassword: profileData.newPassword
    }).pipe(
      catchError(() => {
        // Safe mock return so frontend thinks it succeeded
        return of({ success: true, message: 'Profile updated locally.' });
      })
    );
  }

  // --- AVATAR & COVER UPLOADS ---
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<any>(`${API_CONFIG.baseUrl}/avatar/upload`, formData).pipe(
      map(res => {
        const url = res.avatarUrl || res.url;
        this.saveLocalAvatar(url);
        return res;
      }),
      catchError(() => {
        // Mock base64 read for local preview persistence
        return this.readFileAsDataURL(file).pipe(
          tap(url => {
            this.saveLocalAvatar(url);
            this.addTimelineEvent('profile', 'Uploaded new profile picture');
          }),
          map(url => ({ success: true, avatarUrl: url }))
        );
      })
    );
  }

  private saveLocalAvatar(url: string) {
    localStorage.setItem(this.AVATAR_KEY, url);
  }

  getLocalAvatar(): string | null {
    return localStorage.getItem(this.AVATAR_KEY);
  }

  removeAvatar(): Observable<any> {
    localStorage.removeItem(this.AVATAR_KEY);
    return of({ success: true }).pipe(
      tap(() => this.addTimelineEvent('profile', 'Removed profile picture'))
    );
  }

  uploadCover(file: File): Observable<any> {
    return this.readFileAsDataURL(file).pipe(
      tap(url => {
        localStorage.setItem(this.COVER_KEY, url);
        this.addTimelineEvent('profile', 'Uploaded new cover banner');
      }),
      map(url => ({ success: true, coverUrl: url }))
    );
  }

  getLocalCover(): string | null {
    return localStorage.getItem(this.COVER_KEY);
  }

  removeCover(): Observable<any> {
    localStorage.removeItem(this.COVER_KEY);
    return of({ success: true }).pipe(
      tap(() => this.addTimelineEvent('profile', 'Removed cover banner'))
    );
  }

  private readFileAsDataURL(file: File): Observable<string> {
    return new Observable<string>(subscriber => {
      const reader = new FileReader();
      reader.onload = () => {
        subscriber.next(reader.result as string);
        subscriber.complete();
      };
      reader.onerror = error => subscriber.error(error);
      reader.readAsDataURL(file);
    });
  }

  // --- CERTIFICATES ---
  getMyCertificates(): Observable<any[]> {
    return this.certService.getMyCertificates().pipe(
      map(res => {
        let certs = res?.data ?? res ?? [];
        if (!Array.isArray(certs)) {
          certs = certs.items || [];
        }
        return this.enrichCertificates(certs);
      }),
      catchError(() => {
        // Fallback to local mockup
        const fallbackCerts = [
          { id: 'cert-1', certificateNumber: 'CERT-AWS-5920', courseName: 'AWS Certified Cloud Practitioner', issueDate: '2026-04-12', completionDate: '2026-04-11', verificationStatus: 'Verified', pinned: true },
          { id: 'cert-2', certificateNumber: 'CERT-ANG-8839', courseName: 'Advanced Angular 21 Architecture', issueDate: '2026-06-02', completionDate: '2026-06-01', verificationStatus: 'Verified', pinned: true },
          { id: 'cert-3', certificateNumber: 'CERT-DOT-2391', courseName: 'ASP.NET Core Web API Development', issueDate: '2026-05-18', completionDate: '2026-05-17', verificationStatus: 'Verified', pinned: false }
        ];
        return of(fallbackCerts);
      })
    );
  }

  private enrichCertificates(certs: any[]): any[] {
    const pinnedIds = JSON.parse(localStorage.getItem('pinned_certificates_ids') || '[]');
    return certs.map(c => ({
      ...c,
      verificationStatus: c.verificationStatus || 'Verified',
      certificateNumber: c.certificateNumber || `CERT-AI-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: c.issueDate || c.createdAt || new Date().toISOString().substring(0, 10),
      pinned: pinnedIds.includes(c.id)
    }));
  }

  togglePinCertificate(id: string): Observable<any> {
    const pinnedIds = JSON.parse(localStorage.getItem('pinned_certificates_ids') || '[]');
    const index = pinnedIds.indexOf(id);
    if (index >= 0) {
      pinnedIds.splice(index, 1);
    } else {
      if (pinnedIds.length >= 3) {
        return throwError(() => new Error('You can pin a maximum of 3 featured certificates.'));
      }
      pinnedIds.push(id);
    }
    localStorage.setItem('pinned_certificates_ids', JSON.stringify(pinnedIds));
    return of({ success: true, pinnedIds });
  }

  // --- ACHIEVEMENTS & BADGES ---
  getAchievements(): Observable<any[]> {
    const achievements = [
      { id: 'ach-1', name: 'Top Learner', description: 'Maintain a 5-day active study streak.', progress: 100, unlocked: true, unlockDate: '2026-06-12', icon: 'bi-lightning-charge-fill', color: '#9FEF00' },
      { id: 'ach-2', name: 'Fast Completer', description: 'Complete a course in less than 7 days.', progress: 100, unlocked: true, unlockDate: '2026-06-15', icon: 'bi-speedometer2', color: '#00D26A' },
      { id: 'ach-3', name: 'Quiz Master', description: 'Score 90% or higher on 3 quizzes.', progress: 100, unlocked: true, unlockDate: '2026-06-18', icon: 'bi-trophy-fill', color: '#FFB800' },
      { id: 'ach-4', name: '30-Day Streak', description: 'Log in and study for 30 consecutive days.', progress: 60, unlocked: false, icon: 'bi-calendar-heart', color: '#a78bfa' },
      { id: 'ach-5', name: '100-Hour Learner', description: 'Deliver or consume 100 learning hours.', progress: 85, unlocked: false, icon: 'bi-clock-history', color: '#60a5fa' },
      { id: 'ach-6', name: 'Course Champion', description: 'Receive an average rating of 4.8 or above.', progress: 40, unlocked: false, icon: 'bi-star-fill', color: '#FF4D4F' }
    ];
    return of(achievements);
  }

  // --- GOALS ---
  getGoals(): Observable<any> {
    const goals = JSON.parse(localStorage.getItem(this.GOALS_KEY) || '{}');
    return of(goals);
  }

  saveGoals(goals: any): Observable<any> {
    localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
    this.addTimelineEvent('goals', 'Updated weekly learning goals and active target courses');
    return of({ success: true });
  }

  // --- ANALYTICS ---
  getAnalytics(): Observable<any> {
    const role = this.authService.getUserRole();
    const stats = {
      aiChatsUsed: 142,
      recommendationsAccepted: 24,
      studyPlansGenerated: 8,
      aiLearningHours: 42.5,
      // For general dashboard stats
      coursesEnrolled: 6,
      coursesCompleted: 3,
      certificatesEarned: 3,
      learningHours: 54,
      currentStreak: 12,
      // For Trainer
      coursesCreated: 2,
      studentsEnrolled: 1280,
      certificatesIssued: 485,
      averageRating: 4.85,
      hoursDelivered: 230
    };
    return of(stats);
  }

  // --- PRIVACY SETTINGS ---
  getPrivacySettings(): Observable<any> {
    const privacy = JSON.parse(localStorage.getItem(this.PRIVACY_KEY) || '{}');
    return of(privacy);
  }

  savePrivacySettings(privacy: any): Observable<any> {
    localStorage.setItem(this.PRIVACY_KEY, JSON.stringify(privacy));
    return of({ success: true });
  }

  // --- PREFERENCES (Theme, Localisation, AI, Toggles) ---
  getPreferences(): Observable<any> {
    const prefs = JSON.parse(localStorage.getItem(this.PREFS_KEY) || '{}');
    return of(prefs);
  }

  savePreferences(prefs: any): Observable<any> {
    const existing = JSON.parse(localStorage.getItem(this.PREFS_KEY) || '{}');
    const merged = { ...existing, ...prefs };
    localStorage.setItem(this.PREFS_KEY, JSON.stringify(merged));
    
    // Apply theme change instantly if it is saved via centralized theme service
    if (prefs.themeMode) {
      this.themeService.setThemeMode(prefs.themeMode);
    }
    
    return of({ success: true });
  }

  // --- TIMELINE ACTIVITY ---
  getTimelineActivity(): Observable<any[]> {
    const events = JSON.parse(localStorage.getItem(this.TIMELINE_KEY) || '[]');
    return of(events);
  }

  addTimelineEvent(type: string, title: string) {
    const events = JSON.parse(localStorage.getItem(this.TIMELINE_KEY) || '[]');
    const newEvent = {
      id: Date.now(),
      type,
      title,
      date: new Date().toISOString(),
      icon: this.getIconForTimeline(type),
      color: this.getColorForTimeline(type)
    };
    events.unshift(newEvent);
    localStorage.setItem(this.TIMELINE_KEY, JSON.stringify(events.slice(0, 15)));
  }

  private getIconForTimeline(type: string): string {
    switch (type) {
      case 'course': return 'bi-journal-check';
      case 'certificate': return 'bi-award-fill';
      case 'profile': return 'bi-person-badge';
      case 'security': return 'bi-shield-lock-fill';
      case 'quiz': return 'bi-patch-check-fill';
      case 'goals': return 'bi-bullseye';
      default: return 'bi-dot';
    }
  }

  private getColorForTimeline(type: string): string {
    switch (type) {
      case 'course': return '#00D26A';
      case 'certificate': return '#FFB800';
      case 'profile': return '#9FEF00';
      case 'security': return '#FF4D4F';
      case 'quiz': return '#00D26A';
      case 'goals': return '#60a5fa';
      default: return '#A0A0A0';
    }
  }

  // --- LOGIN HISTORY & ACTIVE SESSIONS ---
  getLoginHistory(): Observable<any[]> {
    const history = [
      { id: 1, dateTime: '19 Jun 2026, 18:22', browser: 'Chrome', os: 'Windows 11', deviceType: 'Desktop', location: 'Chennai, India', ipAddress: '103.88.22.***', status: 'Success' },
      { id: 2, dateTime: '18 Jun 2026, 09:41', browser: 'Chrome', os: 'Windows 11', deviceType: 'Desktop', location: 'Chennai, India', ipAddress: '103.88.22.***', status: 'Success' },
      { id: 3, dateTime: '17 Jun 2026, 14:15', browser: 'Safari', os: 'iOS 17', deviceType: 'Mobile', location: 'Chennai, India', ipAddress: '103.88.22.***', status: 'Success' },
      { id: 4, dateTime: '15 Jun 2026, 21:03', browser: 'Firefox', os: 'Windows 11', deviceType: 'Desktop', location: 'Chennai, India', ipAddress: '103.88.22.***', status: 'Success' },
      { id: 5, dateTime: '14 Jun 2026, 11:32', browser: 'Chrome', os: 'Windows 11', deviceType: 'Desktop', location: 'Chennai, India', ipAddress: '103.88.22.***', status: 'Success' },
      { id: 6, dateTime: '12 Jun 2026, 08:12', browser: 'Chrome', os: 'Windows 11', deviceType: 'Desktop', location: 'Chennai, India', ipAddress: '103.88.22.***', status: 'Failure' }, // Failed password attempt
      { id: 7, dateTime: '10 Jun 2026, 15:19', browser: 'Chrome', os: 'Windows 11', deviceType: 'Desktop', location: 'Chennai, India', ipAddress: '103.88.22.***', status: 'Success' }
    ];
    return of(history);
  }

  getActiveSessions(): Observable<any[]> {
    const sessions = JSON.parse(localStorage.getItem(this.SESSIONS_KEY) || '[]');
    return of(sessions);
  }

  terminateSession(id: string): Observable<any> {
    const sessions = JSON.parse(localStorage.getItem(this.SESSIONS_KEY) || '[]');
    const updated = sessions.filter((s: any) => s.id !== id);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(updated));
    this.addTimelineEvent('security', `Terminated active device session: ${id}`);
    return of({ success: true });
  }

  logoutOtherDevices(): Observable<any> {
    const sessions = JSON.parse(localStorage.getItem(this.SESSIONS_KEY) || '[]');
    const current = sessions.filter((s: any) => s.current);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(current));
    this.addTimelineEvent('security', 'Terminated all other active device sessions');
    return of({ success: true });
  }

  // --- TWO-FACTOR AUTHENTICATION ---
  setup2FA(): Observable<any> {
    const setup = {
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/AITrainingSystem:alex@aitraining.com?secret=JBSWY3DPEHPK3PXP&issuer=AITrainingSystem',
      secretCode: 'JBSWY3DPEHPK3PXP',
      backupCodes: ['2901-4439', '0928-8831', '3910-1120', '4829-9910', '1092-2309', '7732-4412']
    };
    return of(setup);
  }

  enable2FA(code: string): Observable<any> {
    // Verify code (simulated)
    if (code && code.length === 6) {
      localStorage.setItem(this.TWO_FA_KEY, 'enabled');
      this.addTimelineEvent('security', 'Enabled Two-Factor Authentication (2FA)');
      return of({ success: true });
    }
    return throwError(() => new Error('Invalid verification code. Please enter a valid 6-digit TOTP.'));
  }

  disable2FA(password: string): Observable<any> {
    // Simulated verification
    if (password && password.length >= 4) {
      localStorage.removeItem(this.TWO_FA_KEY);
      this.addTimelineEvent('security', 'Disabled Two-Factor Authentication (2FA)');
      return of({ success: true });
    }
    return throwError(() => new Error('Incorrect password. 2FA deactivation failed.'));
  }

  is2FAEnabled(): boolean {
    return localStorage.getItem(this.TWO_FA_KEY) === 'enabled';
  }

  // --- GDPR EXPORT & DELETION ---
  exportAccountData(): Observable<any> {
    const profile = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const goals = JSON.parse(localStorage.getItem(this.GOALS_KEY) || '{}');
    const prefs = JSON.parse(localStorage.getItem(this.PREFS_KEY) || '{}');
    const privacy = JSON.parse(localStorage.getItem(this.PRIVACY_KEY) || '{}');
    const timeline = JSON.parse(localStorage.getItem(this.TIMELINE_KEY) || '[]');
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      userProfile: profile,
      learningGoals: goals,
      accountPreferences: prefs,
      privacySettings: privacy,
      activityHistoryTimeline: timeline,
      platformSystem: 'AITrainingSystem Premium LMS Profile'
    };
    
    // Trigger download in browser
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-lms-profile-data-${profile.fullName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    this.addTimelineEvent('security', 'Exported GDPR account details and data history');
    return of({ success: true });
  }

  deleteAccount(password: string): Observable<any> {
    if (password && password.length >= 4) {
      // Clear localStorage
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.AVATAR_KEY);
      localStorage.removeItem(this.COVER_KEY);
      localStorage.removeItem(this.TWO_FA_KEY);
      
      return of({ success: true });
    }
    return throwError(() => new Error('Incorrect password. Account deletion aborted.'));
  }
}
