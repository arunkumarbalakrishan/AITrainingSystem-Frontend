import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProgressService } from '../../core/services/progress.service';
import { AuthService } from '../../core/services/auth.service';
import { AnimationService } from '../../core/services/animation.service';
import { AIService } from '../../core/services/ai.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in" style="font-family: 'Inter', sans-serif;">
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

      <!-- AI Interview History Section -->
      <div
        class="mb-4 dashboard-widget-animate delay-4 animate-fade-in"
        *ngIf="!loading && mockInterviews.length > 0"
      >
        <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-cpu text-primary"></i> AI Interview Workspace History
        </h5>
        <div class="row g-3">
          <div class="col-md-6 col-lg-4" *ngFor="let interview of mockInterviews">
            <div
              class="premium-card p-3 d-flex flex-column justify-content-between h-100"
              style="cursor: pointer; border: 1px solid var(--border-color); background: var(--card-bg);"
            >
              <div>
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-semibold mb-0 text-truncate" style="max-width: 65%;">
                    {{ interview.courseTopic }}
                  </h6>
                  <span
                    class="badge rounded-pill"
                    [ngClass]="interview.overallScore >= 80 ? 'bg-success' : 'bg-warning text-dark'"
                    style="font-size: 0.75rem;"
                  >
                    Score: {{ interview.overallScore }}/100
                  </span>
                </div>
                <small class="text-muted d-block mb-3">
                  Attempted: {{ interview.createdAt | date: 'mediumDate' }}
                </small>
              </div>
              <button
                class="btn btn-sm btn-outline-primary mt-auto align-self-start fw-semibold"
                (click)="viewScorecard(interview)"
              >
                <i class="bi bi-bar-chart-line-fill me-1"></i> View Scorecard
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Overlay for Scorecard -->
      <div
        class="modal fade show"
        tabindex="-1"
        style="display: block; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px);"
        *ngIf="showScorecardModal && selectedScorecard"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div
            class="modal-content text-white shadow-2xl rounded-4"
            style="background: #1e293b; border: 1px solid #334155;"
          >
            <div class="modal-header border-bottom border-secondary py-3 px-4">
              <h5 class="modal-title fw-bold text-white">
                Performance Evaluation Scorecard
              </h5>
              <button
                type="button"
                class="btn-close btn-close-white"
                (click)="closeScorecard()"
              ></button>
            </div>
            <div class="modal-body p-4">
              <div class="row align-items-center g-4">
                <!-- Radar Chart Vector -->
                <div class="col-md-5 text-center">
                  <div style="max-width: 260px; margin: 0 auto;">
                    <canvas id="modalRadarChartCanvas"></canvas>
                  </div>
                </div>

                <!-- Structured metrics values -->
                <div class="col-md-7">
                  <h6 class="fw-bold mb-3 text-info text-uppercase small" style="letter-spacing: 0.5px;">
                    Detailed Dimension Mapping
                  </h6>
                  <div class="d-flex flex-column gap-3 small">
                    <div>
                      <div class="d-flex justify-content-between mb-1">
                        <span class="text-slate-300">Technical Depth & Accuracy</span>
                        <span class="fw-bold">{{ selectedScorecard.technicalScore }}/100</span>
                      </div>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-primary" role="progressbar" [style.width.%]="selectedScorecard.technicalScore"></div>
                      </div>
                    </div>

                    <div>
                      <div class="d-flex justify-content-between mb-1">
                        <span class="text-slate-300">Communication & Eloquence</span>
                        <span class="fw-bold">{{ selectedScorecard.communicationScore }}/100</span>
                      </div>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-success" role="progressbar" [style.width.%]="selectedScorecard.communicationScore"></div>
                      </div>
                    </div>

                    <div>
                      <div class="d-flex justify-content-between mb-1">
                        <span class="text-slate-300">Confidence Dynamics</span>
                        <span class="fw-bold">{{ selectedScorecard.confidenceScore }}/100</span>
                      </div>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-warning" role="progressbar" [style.width.%]="selectedScorecard.confidenceScore"></div>
                      </div>
                    </div>

                    <div>
                      <div class="d-flex justify-content-between mb-1">
                        <span class="text-slate-300">Grammar & Structure</span>
                        <span class="fw-bold">{{ selectedScorecard.grammarScore }}/100</span>
                      </div>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-info" role="progressbar" [style.width.%]="selectedScorecard.grammarScore"></div>
                      </div>
                    </div>

                    <div>
                      <div class="d-flex justify-content-between mb-1">
                        <span class="text-slate-300">Posture & Body Language</span>
                        <span class="fw-bold">{{ selectedScorecard.bodyLanguageScore }}/100</span>
                      </div>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-danger" role="progressbar" [style.width.%]="selectedScorecard.bodyLanguageScore"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- AI Feedback -->
              <div class="mt-4 p-3 rounded" style="background: #0f172a; border: 1px solid #334155;">
                <h6 class="fw-bold text-warning mb-2">
                  <i class="bi bi-chat-left-text-fill"></i> AI Constructive Feedback
                </h6>
                <p class="small mb-0 text-slate-300" style="white-space: pre-wrap; line-height: 1.6;">
                  {{ selectedScorecard.feedback }}
                </p>
              </div>
            </div>
            <div class="modal-footer border-top border-secondary py-3 px-4">
              <button
                type="button"
                class="btn btn-secondary px-4 fw-semibold"
                (click)="closeScorecard()"
              >
                Close
              </button>
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
  private aiService = inject(AIService);
  private cdr = inject(ChangeDetectorRef);

  userName = '';
  loading = true;
  continueWatching: any[] = [];
  recentlyCompleted: any[] = [];
  mockInterviews: any[] = [];

  // Scorecard modal state
  showScorecardModal = false;
  selectedScorecard: any = null;

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
    this.loadInterviewHistory();
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

        // Set learning streak count-up (e.g. 12 days or retrieved from data)
        const streakTarget = data.streakDays !== undefined ? data.streakDays : 12;
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
        this.streakValue = 12;
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

  loadInterviewHistory() {
    this.aiService.getMockInterviewHistory().subscribe({
      next: (res: any) => {
        this.mockInterviews = res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.mockInterviews = [];
        this.cdr.detectChanges();
      }
    });
  }

  viewScorecard(interview: any) {
    this.aiService.getMockInterviewScorecard(interview.id).subscribe({
      next: (res: any) => {
        this.selectedScorecard = res.data;
        this.showScorecardModal = true;
        this.cdr.detectChanges();
        this.renderModalRadarChart();
      }
    });
  }

  closeScorecard() {
    this.showScorecardModal = false;
    this.selectedScorecard = null;
    this.cdr.detectChanges();
  }

  renderModalRadarChart() {
    setTimeout(() => {
      const canvas = document.getElementById('modalRadarChartCanvas') as HTMLCanvasElement;
      if (canvas && this.selectedScorecard) {
        new Chart(canvas, {
          type: 'radar',
          data: {
            labels: ['Technical', 'Communication', 'Confidence', 'Grammar', 'Body Language'],
            datasets: [
              {
                label: 'Performance Dimensions',
                data: [
                  this.selectedScorecard.technicalScore || 70,
                  this.selectedScorecard.communicationScore || 70,
                  this.selectedScorecard.confidenceScore || 70,
                  this.selectedScorecard.grammarScore || 70,
                  this.selectedScorecard.bodyLanguageScore || 70
                ],
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1',
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6366f1'
              }
            ]
          },
          options: {
            scales: {
              r: {
                angleLines: { color: '#475569' },
                grid: { color: '#475569' },
                pointLabels: { color: '#f8fafc', font: { size: 10 } },
                ticks: { backdropColor: 'transparent', color: '#64748b', stepSize: 20 },
                min: 0,
                max: 100
              }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }, 100);
  }
}
