import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { ProgressService } from '../../../core/services/progress.service';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TiltDirective],
  template: `
    <div class="animate-fade-in">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 class="fw-bold mb-1">My Courses</h3>
          <p class="text-muted mb-0">Track your enrolled learning paths</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="d-flex gap-2 mb-4 flex-wrap">
        <button
          *ngFor="let tab of tabs"
          (click)="activeTab = tab; filterByTab()"
          class="btn btn-sm px-3 py-2"
          [class.btn-lime-active]="activeTab === tab"
          [class.btn-light]="activeTab !== tab"
          style="border-radius: var(--border-radius-sm); font-size: 0.85rem; font-weight: 500; transition: all 0.2s ease;"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <!-- Course Cards -->
      <div *ngIf="!loading" class="row g-3">
        <div class="col-md-6 col-xl-4" *ngFor="let item of filteredEnrollments">
          <div
            class="premium-card p-3 h-100 d-flex flex-column"
            appTilt
            [maxTilt]="8"
            [scale]="1.03"
          >
            <!-- Course Thumbnail -->
            <div class="position-relative mb-3" style="height: 120px; overflow: hidden; border-radius: var(--border-radius-sm);">
              <div class="w-100 h-100 position-absolute" style="background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(0,0,0,0.8) 100%); z-index: 1;"></div>
              <img
                [src]="getCourseImage(item.courseTitle || item.title)"
                class="w-100 h-100 position-relative"
                [class.object-fit-contain]="isLogo(item.courseTitle || item.title)"
                [class.object-fit-cover]="!isLogo(item.courseTitle || item.title)"
                [class.p-3]="isLogo(item.courseTitle || item.title)"
                [class.bg-white]="isLogo(item.courseTitle || item.title)"
                style="z-index: 0;"
                alt="Course Thumbnail"
              />
            </div>

            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="fw-bold mb-0 flex-grow-1">
                {{ item.courseTitle || item.title || 'Course' }}
              </h6>
              <span
                class="badge rounded-pill ms-2"
                [style.background]="getStatusColor(item.status).bg"
                [style.color]="getStatusColor(item.status).text"
                style="font-size: 0.7rem; white-space: nowrap;"
              >
                {{ item.status || 'In Progress' }}
              </span>
            </div>

            <p
              class="text-muted flex-grow-1"
              style="font-size: 0.82rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
            >
              {{ item.courseDescription || item.description || '' }}
            </p>

            <!-- Progress Bar -->
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <small class="text-muted">Progress</small>
                <small class="fw-semibold" style="color: var(--primary-color);"
                  >{{ item.progressPercent || 0 }}%</small
                >
              </div>
              <div class="progress" style="height: 6px; border-radius: 3px;">
                <div
                  class="progress-bar"
                  role="progressbar"
                  [style.width.%]="item.progressPercent || 0"
                  style="background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); border-radius: 3px;"
                ></div>
              </div>
            </div>

            <a
              [routerLink]="['/course-player', item.courseId || item.id]"
              class="btn btn-sm btn-premium-outline w-100"
            >
              {{ (item.progressPercent || 0) > 0 ? 'Continue Learning' : 'Start Learning' }}
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!loading && filteredEnrollments.length === 0"
        class="premium-card p-5 text-center my-4 d-flex flex-column align-items-center justify-content-center"
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
          <!-- Folder / Documents Illustration -->
          <rect
            x="30"
            y="80"
            width="180"
            height="80"
            rx="8"
            fill="var(--primary-color)"
            opacity="0.1"
          />
          <path d="M40 90H80L90 100H200V150H40V90Z" fill="var(--primary-color)" opacity="0.8" />
          <rect x="60" y="50" width="120" height="90" rx="4" fill="#cbd5e1" opacity="0.5" />
          <path
            d="M75 70H165M75 90H145"
            stroke="var(--primary-color)"
            stroke-width="4"
            stroke-linecap="round"
          />
          <circle cx="160" cy="110" r="25" fill="#f87171" opacity="0.9" />
          <path
            d="M150 110L158 118L170 102"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <h3 class="fw-bold mb-2">No courses found</h3>
        <p class="text-muted mb-4" style="max-width: 450px;">
          {{
            activeTab === 'All'
              ? "You haven't enrolled in any courses yet. Dive into our library and start learning!"
              : 'You have no courses in the "' + activeTab + '" category.'
          }}
        </p>
        <a
          routerLink="/explore"
          class="btn btn-primary px-5 py-3 fw-semibold shadow-sm"
          style="border-radius: 30px; font-size: 1.1rem; transition: transform 0.2s;"
        >
          Explore Courses to Get Started
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .btn-lime-active {
        background-color: #84cc16 !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(132, 204, 22, 0.35) !important;
        border: none !important;
      }
    `,
  ],
})
export class MyCoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private progressService = inject(ProgressService);

  tabs = ['All', 'In Progress', 'Completed', 'Not Started'];
  activeTab = 'All';
  enrollments: any[] = [];
  filteredEnrollments: any[] = [];
  loading = true;

  ngOnInit() {
    this.courseService.getEnrolledCourses().subscribe({
      next: (res: any) => {
        const enrolledRaw = res.data || res || [];

        if (enrolledRaw.length === 0) {
          this.enrollments = [];
          this.filterByTab();
          this.loading = false;
          return;
        }

        let loadedCount = 0;
        this.enrollments = enrolledRaw.map((c: any) => {
          const courseItem = {
            ...c,
            courseId: c.id,
            courseTitle: c.title,
            courseDescription: c.description,
            progressPercent: 0,
            status: 'Not Started',
          };

          this.progressService.getCourseProgress(c.id).subscribe({
            next: (progRes: any) => {
              const progress = progRes.data || progRes;
              courseItem.progressPercent = Math.round(progress.progressPercentage || 0);
              courseItem.status =
                courseItem.progressPercent >= 100
                  ? 'Completed'
                  : progress.hasStarted || courseItem.progressPercent > 0
                    ? 'In Progress'
                    : 'Not Started';

              loadedCount++;
              if (loadedCount === enrolledRaw.length) {
                this.filterByTab();
                this.loading = false;
              }
            },
            error: () => {
              loadedCount++;
              if (loadedCount === enrolledRaw.length) {
                this.filterByTab();
                this.loading = false;
              }
            },
          });

          return courseItem;
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getCourseImage(title: string): string {
    if (!title)
      return 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800';
    const t = title.toLowerCase();
    if (t.includes('java') && !t.includes('javascript'))
      return 'https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg';
    if (t.includes('asp.net') || t.includes('.net') || t.includes('c#'))
      return 'https://upload.wikimedia.org/wikipedia/commons/e/ee/.NET_Core_Logo.svg';
    if (t.includes('python'))
      return 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg';
    if (t.includes('angular'))
      return 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg';
    if (t.includes('react'))
      return 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg';
    if (t.includes('node') || t.includes('express'))
      return 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg';
    if (t.includes('sql') || t.includes('database'))
      return 'https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png';
    if (t.includes('javascript') || t.includes('js'))
      return 'https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg';

    const fallbacks = [
      'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/270694/pexels-photo-270694.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
    return fallbacks[title.length % fallbacks.length];
  }

  isLogo(title: string): boolean {
    if (!title) return false;
    const t = title.toLowerCase();
    return (
      t.includes('java') ||
      t.includes('.net') ||
      t.includes('c#') ||
      t.includes('python') ||
      t.includes('angular') ||
      t.includes('react') ||
      t.includes('node') ||
      t.includes('sql') ||
      t.includes('js') ||
      t.includes('database')
    );
  }

  filterByTab() {
    if (this.activeTab === 'All') {
      this.filteredEnrollments = [...this.enrollments];
    } else {
      this.filteredEnrollments = this.enrollments.filter((e) => e.status === this.activeTab);
    }
  }

  getStatusColor(status: string): { bg: string; text: string } {
    switch (status) {
      case 'Completed':
        return { bg: '#dcfce7', text: '#166534' };
      case 'In Progress':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'Not Started':
        return { bg: '#f1f5f9', text: '#475569' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  }
}
