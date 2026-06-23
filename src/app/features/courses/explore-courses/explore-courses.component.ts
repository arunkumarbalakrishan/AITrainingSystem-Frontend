import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

@Component({
  selector: 'app-explore-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TiltDirective],
  template: `
    <div class="animate-fade-in">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold mb-1">Explore Courses</h3>
          <p class="text-muted mb-0">Discover AI-powered training programs</p>
        </div>
        <div class="d-flex gap-3 align-items-center flex-wrap">
          <div class="modern-input-wrapper shadow-sm">
            <i class="bi bi-search text-muted ms-2"></i>
            <input
              type="text"
              class="form-control border-0 shadow-none bg-transparent"
              placeholder="Search courses..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterCourses()"
              style="width: 220px; color: var(--text-dark);"
            />
          </div>
          <div class="modern-input-wrapper shadow-sm">
            <i class="bi bi-funnel text-muted ms-2"></i>
            <select
              class="form-select border-0 shadow-none bg-transparent"
              [(ngModel)]="selectedCategory"
              (ngModelChange)="filterCourses()"
              style="width: 160px; cursor: pointer; color: var(--text-dark);"
            >
              <option value="" style="background: var(--card-bg); color: var(--text-dark);">
                All Categories
              </option>
              <option
                *ngFor="let cat of categories"
                [value]="cat"
                style="background: var(--card-bg); color: var(--text-dark);"
              >
                {{ cat }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="row g-4">
        <div class="col-md-6 col-lg-4" *ngFor="let i of [1, 2, 3, 4, 5, 6]">
          <div
            class="premium-card p-0"
            style="min-height: 280px; border: none; box-shadow: var(--shadow-sm);"
          >
            <div
              class="skeleton-box"
              style="height: 140px; border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;"
            ></div>
            <div class="p-3">
              <div
                class="skeleton-box mb-3"
                style="height: 24px; width: 40%; border-radius: 12px;"
              ></div>
              <div class="skeleton-box mb-2" style="height: 16px; width: 85%;"></div>
              <div class="skeleton-box mb-4" style="height: 16px; width: 60%;"></div>

              <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                <div class="skeleton-box" style="height: 14px; width: 30%;"></div>
                <div
                  class="skeleton-box"
                  style="height: 32px; width: 100px; border-radius: 16px;"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Courses Grid -->
      <div *ngIf="!loading" class="row g-4">
        <div class="col-md-6 col-lg-4" *ngFor="let course of filteredCourses; let i = index">
          <div
            class="premium-card p-0 h-100 d-flex flex-column hover-lift"
            appTilt
            [maxTilt]="8"
            [scale]="1.03"
            style="animation-delay: {{
              i * 40
            }}ms; border: 1px solid rgba(0,0,0,0.05); overflow: hidden; position: relative;"
          >
            <!-- Course Thumbnail -->
            <div class="position-relative" style="height: 160px; overflow: hidden; border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;">
              <div class="w-100 h-100 position-absolute" style="background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(0,0,0,0.8) 100%); z-index: 1;"></div>
              <img
                [src]="getCourseImage(course.title)"
                class="w-100 h-100 position-relative"
                [class.object-fit-contain]="isLogo(course.title)"
                [class.object-fit-cover]="!isLogo(course.title)"
                [class.p-4]="isLogo(course.title)"
                [class.bg-white]="isLogo(course.title)"
                style="z-index: 0;"
                alt="Course Thumbnail"
              />
              <!-- Price overlay -->
              <div class="position-absolute" style="bottom: 12px; right: 12px; z-index: 3;">
                <span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: rgba(255,255,255,0.95); color: #0f172a; font-size: 0.85rem; font-weight: 700;">
                  {{ course.price > 0 ? ('Rs. ' + course.price) : 'Free' }}
                </span>
              </div>
            </div>

            <!-- Card body -->
            <div class="p-3 flex-grow-1 d-flex flex-column">
              <div class="mb-2">
                <span
                  class="badge rounded-pill px-2 py-1"
                  style="background: var(--primary-color); opacity: 0.9; color: #fff; font-size: 0.7rem; font-weight: 500;"
                >
                  {{ course.category || 'General' }}
                </span>
              </div>

              <h6 class="fw-bold mb-1">{{ course.title }}</h6>
              <p
                class="text-muted flex-grow-1"
                style="font-size: 0.82rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
              >
                {{ course.description }}
              </p>

              <div class="d-flex justify-content-end align-items-center pt-2 border-top mt-auto">
                <a [routerLink]="['/course', course.id]" class="btn btn-sm btn-premium-outline px-3"
                  >View Details</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredCourses.length === 0" class="text-center py-5 text-muted">
        <h5 class="fw-semibold">No courses found</h5>
        <p>Try adjusting your search or category filter.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .modern-input-wrapper {
        display: flex;
        align-items: center;
        background: var(--card-bg);
        border: 2px solid rgba(0, 0, 0, 0.06);
        border-radius: 20px;
        padding: 2px 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .modern-input-wrapper:focus-within {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(132, 204, 22, 0.15) !important;
      }
      .hover-lift {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .hover-lift:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12) !important;
      }
      .modern-input-wrapper input:focus,
      .modern-input-wrapper select:focus {
        box-shadow: none !important;
      }
    `,
  ],
})
export class ExploreCoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  courses: any[] = [];
  filteredCourses: any[] = [];
  categories: string[] = [];
  searchQuery = '';
  selectedCategory = '';
  loading = true;



  ngOnInit() {
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || res || [];
        this.filteredCourses = [...this.courses];
        this.categories = [
          ...new Set(this.courses.map((c: any) => c.category).filter(Boolean)),
        ] as string[];
        this.loading = false;

        // Check for search query in URL after courses load
        this.route.queryParams.subscribe((params) => {
          if (params['q']) {
            this.searchQuery = params['q'];
            this.filterCourses();
          } else {
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  filterCourses() {
    const query = this.searchQuery.trim();
    if (!query) {
      let result = [...this.courses];
      if (this.selectedCategory) {
        result = result.filter((c) => c.category === this.selectedCategory);
      }
      this.filteredCourses = result;
      this.cdr.detectChanges();
      return;
    }

    this.courseService.searchCourses(query).subscribe({
      next: (res: any) => {
        let results = res.data || res || [];
        if (this.selectedCategory) {
          results = results.filter((c: any) => c.category === this.selectedCategory);
        }
        this.filteredCourses = results;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback to client-side search on error
        let result = [...this.courses];
        const q = query.toLowerCase();
        result = result.filter(
          (c) => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q),
        );
        if (this.selectedCategory) {
          result = result.filter((c) => c.category === this.selectedCategory);
        }
        this.filteredCourses = result;
        this.cdr.detectChanges();
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
}
