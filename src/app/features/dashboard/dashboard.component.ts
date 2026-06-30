import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProgressService } from '../../core/services/progress.service';
import { AuthService } from '../../core/services/auth.service';
import { AnimationService } from '../../core/services/animation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <!-- Welcome Banner -->
      <div
        class="premium-card p-4 mb-4 position-relative overflow-hidden dashboard-widget-animate delay-1"
        style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border: none; box-shadow: 0 10px 30px rgba(108, 99, 255, 0.2);"
      >
        <!-- Decorative Background Blob -->
        <svg
          class="position-absolute"
          style="right: -10%; top: -50%; opacity: 0.15; width: 400px; height: 400px; pointer-events: none;"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            d="M42.7,-73.4C55.9,-67.6,67.6,-57.4,75.3,-44.6C82.9,-31.8,86.5,-15.9,85.1,-0.8C83.7,14.3,77.3,28.6,68.6,40.9C59.9,53.2,48.9,63.6,35.9,70.6C22.9,77.6,7.9,81.1,-7.2,81.4C-22.3,81.7,-37.5,78.8,-50.2,71.2C-62.9,63.6,-73.1,51.3,-80.4,37.3C-87.7,23.3,-92.1,7.6,-90.1,-7.2C-88.1,-22,-79.7,-35.9,-68.8,-47.1C-57.9,-58.3,-44.5,-66.8,-30.5,-71.9C-16.5,-77,-1.9,-78.7,13,-77.7C27.9,-76.7,42.7,-73.4,42.7,-73.4Z"
            transform="translate(100 100)"
          />
        </svg>

        <div class="row align-items-center position-relative" style="z-index: 1;">
          <div class="col-md-8 text-white">
            <h2 class="fw-bold mb-2" style="letter-spacing: -0.5px;">
              {{ getGreeting() }}, {{ userName }}! 👋
            </h2>
            <div class="d-flex align-items-center gap-2 mb-3">
              <svg
                class="streak-flame-svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F59E0B"
                stroke-width="2"
              >
                <path
                  d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
                  fill="#F59E0B"
                />
              </svg>
              <span class="fw-bold" style="color: #FFEDD5; font-size: 0.95rem;">
                {{ streakValue }} Days Learning Streak! Keep it up!
              </span>
            </div>
            <p
              class="mb-0 opacity-75 fs-6"
              *ngIf="continueWatching.length > 0"
              style="max-width: 600px;"
            >
              Welcome back! Your next lesson in
              <strong>{{ continueWatching[0].courseTitle || 'your course' }}</strong> is waiting for
              you. Let's keep learning!
            </p>
            <p class="mb-0 opacity-75 fs-6" *ngIf="continueWatching.length === 0">
              Ready to dive in? Explore our premium courses and start learning today!
            </p>
          </div>
          <div class="col-md-4 text-end d-none d-md-block">
            <a
              routerLink="/explore"
              class="btn btn-light fw-semibold px-4 py-2 shadow-sm rounded-pill hover-lift"
            >
              Explore Courses
            </a>
          </div>
        </div>
      </div>
      <!-- Stat Cards -->
      <div class="row g-2 g-md-3 mb-4 dashboard-widget-animate delay-2" *ngIf="!loading">
        <!-- Enrolled Courses -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div
            class="premium-card p-2.5 p-md-3 h-100 hover-lift stat-card"
            routerLink="/my-courses"
            style="cursor: pointer; position: relative; overflow: hidden;"
          >
            <div class="d-flex align-items-center mb-2 position-relative" style="z-index: 1;">
              <div
                class="rounded-circle d-flex align-items-center justify-content-center me-2 me-md-3 shadow-sm flex-shrink-0"
                style="background: #6C63FF; width: 32px; height: 32px;"
              >
                <i class="bi bi-book" style="color: white; font-size: 0.95rem;"></i>
              </div>
              <div class="min-width-0">
                <div
                  class="text-muted fw-semibold text-uppercase text-truncate"
                  style="font-size: 0.65rem; letter-spacing: 0.5px;"
                >
                  Enrolled
                </div>
                <div
                  class="fw-bold mt-1"
                  style="font-size: 1.4rem; line-height: 1; letter-spacing: -0.5px; color: var(--text-primary);"
                >
                  {{ enrolledCount }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed Courses -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div
            class="premium-card p-2.5 p-md-3 h-100 hover-lift stat-card"
            routerLink="/my-courses"
            style="cursor: pointer; position: relative; overflow: hidden;"
          >
            <div class="d-flex align-items-center mb-2 position-relative" style="z-index: 1;">
              <div
                class="rounded-circle d-flex align-items-center justify-content-center me-2 me-md-3 shadow-sm flex-shrink-0"
                style="background: #10B981; width: 32px; height: 32px;"
              >
                <i class="bi bi-check-circle" style="color: white; font-size: 0.95rem;"></i>
              </div>
              <div class="min-width-0">
                <div
                  class="text-muted fw-semibold text-uppercase text-truncate"
                  style="font-size: 0.65rem; letter-spacing: 0.5px;"
                >
                  Completed
                </div>
                <div
                  class="fw-bold mt-1"
                  style="font-size: 1.4rem; line-height: 1; letter-spacing: -0.5px; color: var(--text-primary);"
                >
                  {{ completedCount }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Certificates Earned -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div
            class="premium-card p-2.5 p-md-3 h-100 hover-lift stat-card"
            routerLink="/certificates"
            style="cursor: pointer; position: relative; overflow: hidden;"
          >
            <div class="d-flex align-items-center mb-2 position-relative" style="z-index: 1;">
              <div
                class="rounded-circle d-flex align-items-center justify-content-center me-2 me-md-3 shadow-sm flex-shrink-0"
                style="background: #8B5CF6; width: 32px; height: 32px;"
              >
                <i class="bi bi-award" style="color: white; font-size: 0.95rem;"></i>
              </div>
              <div class="min-width-0">
                <div
                  class="text-muted fw-semibold text-uppercase text-truncate"
                  style="font-size: 0.65rem; letter-spacing: 0.5px;"
                >
                  Certificates
                </div>
                <div
                  class="fw-bold mt-1"
                  style="font-size: 1.4rem; line-height: 1; letter-spacing: -0.5px; color: var(--text-primary);"
                >
                  {{ certificatesCount }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hours Learned -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div
            class="premium-card p-2.5 p-md-3 h-100 hover-lift stat-card"
            routerLink="/my-courses"
            style="cursor: pointer; position: relative; overflow: hidden;"
          >
            <div class="d-flex align-items-center mb-2 position-relative" style="z-index: 1;">
              <div
                class="rounded-circle d-flex align-items-center justify-content-center me-2 me-md-3 shadow-sm flex-shrink-0"
                style="background: #EF4444; width: 32px; height: 32px;"
              >
                <i class="bi bi-clock" style="color: white; font-size: 0.95rem;"></i>
              </div>
              <div class="min-width-0">
                <div
                  class="text-muted fw-semibold text-uppercase text-truncate"
                  style="font-size: 0.65rem; letter-spacing: 0.5px;"
                >
                  Hours
                </div>
                <div
                  class="fw-bold mt-1"
                  style="font-size: 1.4rem; line-height: 1; letter-spacing: -0.5px; color: var(--text-primary);"
                >
                  {{ hoursCount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat Cards Skeleton -->
      <div class="row g-2 g-md-3 mb-4" *ngIf="loading">
        <div class="col-12 col-sm-6 col-lg-3" *ngFor="let i of [1, 2, 3, 4]">
          <div
            class="premium-card p-2.5 p-md-3 h-100 d-flex align-items-center"
            style="border: none; box-shadow: var(--shadow-sm);"
          >
            <div
              class="skeleton-box rounded-circle me-2 me-md-3 flex-shrink-0"
              style="width: 32px; height: 32px;"
            ></div>
            <div class="flex-grow-1 min-width-0">
              <div class="skeleton-box mb-2" style="height: 10px; width: 60%;"></div>
              <div class="skeleton-box" style="height: 24px; width: 40%; border-radius: 4px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!loading && continueWatching.length === 0 && recentlyCompleted.length === 0"
        class="premium-card p-5 text-center mb-4 d-flex flex-column align-items-center justify-content-center dashboard-widget-animate delay-3"
        style="min-height: 400px; background: var(--card-bg);"
      >
        <svg
          width="240"
          height="180"
          viewBox="0 0 240 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="mb-4"
        >
          <rect
            x="40"
            y="120"
            width="160"
            height="12"
            rx="6"
            fill="var(--primary-color)"
            opacity="0.1"
          />
          <path
            d="M90 120L95 80C96 65 110 55 120 55C130 55 144 65 145 80L150 120H90Z"
            fill="var(--primary-color)"
            opacity="0.8"
          />
          <circle cx="120" cy="35" r="20" fill="#f87171" />
          <path
            d="M70 145V130H170V145C170 155 160 165 150 165H90C80 165 70 155 70 145Z"
            fill="#3b82f6"
            opacity="0.9"
          />
          <rect x="150" y="90" width="40" height="30" rx="4" fill="#fbbf24" opacity="0.8" />
          <path
            d="M155 100H185M155 110H175"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <h3 class="fw-bold mb-2">Your learning journey starts here</h3>
        <p class="text-muted mb-4" style="max-width: 500px;">
          It looks like you haven't started any courses yet. Discover our premium curriculum and
          take the first step towards mastering new skills today.
        </p>
        <a
          routerLink="/explore"
          class="btn btn-primary px-5 py-3 fw-semibold shadow-sm"
          style="border-radius: 30px; font-size: 1.1rem; transition: transform 0.2s;"
        >
          Explore Courses to Get Started
        </a>
      </div>

      <!-- Continue Watching -->
      <div
        class="mb-4 dashboard-widget-animate delay-3"
        *ngIf="!loading && continueWatching.length > 0"
      >
        <h5 class="fw-bold mb-3">Continue Watching</h5>
        <div class="row g-3">
          <div class="col-md-6 col-lg-4" *ngFor="let item of continueWatching">
            <div
              class="premium-card p-3"
              [routerLink]="['/course-player', item.courseId]"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-start gap-3">
                <div
                  class="rounded d-flex align-items-center justify-content-center flex-shrink-0"
                  style="width: 56px; height: 56px; background: linear-gradient(135deg, #f0fdf4, #dcfce7);"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="var(--primary-color)"
                    stroke-width="2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <div class="flex-grow-1 min-width-0">
                  <h6 class="fw-semibold mb-1 text-truncate">
                    {{ item.courseTitle || item.lessonTitle || 'Lesson' }}
                  </h6>
                  <small class="text-muted"
                    >{{ item.lastWatchedPositionSeconds | number: '1.0-0' }}s watched</small
                  >
                  <div class="progress mt-2" style="height: 4px;">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      [style.width.%]="item.progressPercent || 30"
                      style="background: var(--primary-color);"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Watching Skeleton -->
      <div class="mb-4" *ngIf="loading">
        <h5 class="fw-bold mb-3">Continue Watching</h5>
        <div class="row g-3">
          <div class="col-md-6 col-lg-4" *ngFor="let i of [1, 2, 3]">
            <div class="premium-card p-3" style="border: none; box-shadow: var(--shadow-sm);">
              <div class="d-flex align-items-start gap-3">
                <div
                  class="skeleton-box rounded flex-shrink-0"
                  style="width: 56px; height: 56px;"
                ></div>
                <div class="flex-grow-1">
                  <div class="skeleton-box mb-2" style="height: 16px; width: 80%;"></div>
                  <div class="skeleton-box mb-3" style="height: 12px; width: 40%;"></div>
                  <div class="skeleton-box" style="height: 4px; width: 100%;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recently Completed -->
      <div
        class="mb-4 dashboard-widget-animate delay-4"
        *ngIf="!loading && recentlyCompleted.length > 0"
      >
        <h5 class="fw-bold mb-3">Recently Completed</h5>
        <div class="row g-3">
          <div class="col-md-6 col-lg-4" *ngFor="let course of recentlyCompleted">
            <div
              class="premium-card p-3"
              [routerLink]="['/course-player', course.courseId]"
              style="cursor: pointer;"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="fw-semibold mb-1">{{ course.courseTitle }}</h6>
                  <small class="text-muted"
                    >Completed {{ course.completedAt | date: 'mediumDate' }}</small
                  >
                </div>
                <span
                  class="badge rounded-pill"
                  style="background: #dcfce7; color: #166534; font-size: 0.7rem;"
                  >✓ Done</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hover-lift {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .hover-lift:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
      }
      .stat-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.4) 0%,
          rgba(255, 255, 255, 0) 100%
        );
        pointer-events: none;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private dashService = inject(DashboardService);
  private progressService = inject(ProgressService);
  private authService = inject(AuthService);
  private animationService = inject(AnimationService);
  private cdr = inject(ChangeDetectorRef);

  userName = '';
  loading = true;
  continueWatching: any[] = [];
  recentlyCompleted: any[] = [];

  // Animate counts
  enrolledCount = 0;
  completedCount = 0;
  certificatesCount = 0;
  hoursCount = 0;
  streakValue = 0;

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.loadAnalytics();
    this.loadContinueWatching();
    this.loadRecentlyCompleted();
  }

  loadAnalytics() {
    this.dashService.getAnalytics().subscribe({
      next: (res: any) => {
        const data = res.data || res;

        // Count-up stats utilizing requestAnimationFrame from AnimationService
        this.animationService.animateNumber(0, data.totalCoursesEnrolled ?? 0, 1200, (val) => {
          this.enrolledCount = val;
          this.cdr.detectChanges();
        });

        this.animationService.animateNumber(0, data.completedCourses ?? 0, 1200, (val) => {
          this.completedCount = val;
          this.cdr.detectChanges();
        });

        this.animationService.animateNumber(0, data.certificatesEarned ?? 0, 1200, (val) => {
          this.certificatesCount = val;
          this.cdr.detectChanges();
        });

        this.animationService.animateNumber(0, data.totalHours ?? 0, 1200, (val) => {
          this.hoursCount = val;
          this.cdr.detectChanges();
        });

        // Set learning streak count-up (e.g. 5 days or retrieved from data)
        const streakTarget = data.streakDays || 5;
        this.animationService.animateNumber(0, streakTarget, 1500, (val) => {
          this.streakValue = val;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        // Fallback defaults
        this.enrolledCount = 0;
        this.completedCount = 0;
        this.certificatesCount = 0;
        this.hoursCount = 0;
        this.streakValue = 3;
        this.cdr.detectChanges();
      },
    });
  }

  loadContinueWatching() {
    this.progressService.getContinueWatching().subscribe({
      next: (res: any) => {
        this.continueWatching = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadRecentlyCompleted() {
    this.dashService.getRecentlyCompleted().subscribe({
      next: (res: any) => {
        this.recentlyCompleted = res.data || res || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }
}
