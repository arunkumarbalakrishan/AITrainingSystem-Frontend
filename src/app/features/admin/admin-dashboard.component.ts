import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CourseService } from '../../core/services/course.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { CertificateService } from '../../core/services/certificate.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in" style="font-family: 'Outfit', sans-serif;">
      <!-- Top Title and Action -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--text-dark);">Admin Panel</h3>
          <p class="text-muted mb-0">Manage users, courses, and view real-time system analytics</p>
        </div>
        <a
          routerLink="/admin/diagnostics"
          class="btn btn-premium px-4 py-2 fw-semibold shadow-sm hover-lift"
          style="border-radius: 8px;"
        >
          <i class="bi bi-tools me-2"></i>System Diagnostics
        </a>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="row g-3 mb-4">
        <!-- Total Users -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div
            class="premium-card p-3 d-flex align-items-center gap-3 hover-lift-subtle"
            style="border: 1px solid rgba(0,0,0,0.03);"
          >
            <div
              class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
              style="width: 40px; height: 40px;"
            >
              <i class="bi bi-people fs-5"></i>
            </div>
            <div class="min-width-0">
              <span
                class="text-muted small fw-bold text-uppercase d-block"
                style="font-size: 0.7rem; letter-spacing: 0.5px; line-height: 1.1;"
                >Total Users</span
              >
              <h5 class="fw-bold mb-0 text-dark mt-1" style="line-height: 1.1; font-size: 1.25rem;">{{ totalUsersCount }}</h5>
            </div>
          </div>
        </div>

        <!-- Total Courses -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div
            class="premium-card p-3 d-flex align-items-center gap-3 hover-lift-subtle"
            style="border: 1px solid rgba(0,0,0,0.03);"
          >
            <div
              class="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center flex-shrink-0"
              style="width: 40px; height: 40px;"
            >
              <i class="bi bi-journal-code fs-5"></i>
            </div>
            <div class="min-width-0">
              <span
                class="text-muted small fw-bold text-uppercase d-block"
                style="font-size: 0.7rem; letter-spacing: 0.5px; line-height: 1.1;"
                >Total Courses</span
              >
              <h5 class="fw-bold mb-0 text-dark mt-1" style="line-height: 1.1; font-size: 1.25rem;">{{ totalCoursesCount }}</h5>
            </div>
          </div>
        </div>

        <!-- Total Revenue -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div
            class="premium-card p-3 d-flex align-items-center gap-3 hover-lift-subtle"
            style="border: 1px solid rgba(0,0,0,0.03);"
          >
            <div
              class="rounded-circle bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0"
              style="width: 40px; height: 40px;"
            >
              <i class="bi bi-cash-stack fs-5"></i>
            </div>
            <div class="min-width-0">
              <span
                class="text-muted small fw-bold text-uppercase d-block"
                style="font-size: 0.7rem; letter-spacing: 0.5px; line-height: 1.1;"
                >Total Revenue</span
              >
              <h5 class="fw-bold mb-0 text-dark mt-1" style="line-height: 1.1; font-size: 1.25rem;">Rs. {{ adminReports?.totalRevenue || 0 }}</h5>
            </div>
          </div>
        </div>

        <!-- Completion Rate -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div
            class="premium-card p-3 d-flex align-items-center gap-3 hover-lift-subtle"
            style="border: 1px solid rgba(0,0,0,0.03);"
          >
            <div
              class="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0"
              style="width: 40px; height: 40px;"
            >
              <i class="bi bi-trophy fs-5"></i>
            </div>
            <div class="min-width-0">
              <span
                class="text-muted small fw-bold text-uppercase d-block"
                style="font-size: 0.7rem; letter-spacing: 0.5px; line-height: 1.1;"
                >Certificates</span
              >
              <h5 class="fw-bold mb-0 text-dark mt-1" style="line-height: 1.1; font-size: 1.25rem;">{{ getCertificateCount() }}</h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Visual Analytics Section -->
      <div class="row g-4 mb-4">
        <!-- User Roles Doughnut Chart Diagram -->
        <div class="col-lg-6">
          <div
            class="premium-card p-4 h-100 hover-lift-subtle"
            style="border: 1px solid rgba(0,0,0,0.05);"
          >
            <h5
              class="fw-bold mb-4 d-flex align-items-center gap-2"
              style="font-size: 1.1rem; color: var(--text-dark);"
            >
              <i class="bi bi-pie-chart-fill text-primary p-2 bg-primary bg-opacity-10 rounded"></i>
              User Role Distribution
            </h5>
            <div
              class="row align-items-center bg-light p-3"
              style="border-radius: 16px; min-height: 180px; margin: 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); background-color: var(--background-color) !important; border: 1px solid var(--border-color);"
            >
              <div class="col-sm-6 d-flex justify-content-center py-2">
                <svg width="140" height="140" viewBox="0 0 200 200">
                  <!-- Background Ring -->
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="var(--border-color)"
                    stroke-width="18"
                  />

                  <!-- Segments -->
                  <circle
                    *ngFor="let seg of getRoleDoughnutSegments()"
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    [attr.stroke]="seg.color"
                    stroke-width="18"
                    [attr.stroke-dasharray]="seg.dash"
                    [attr.stroke-dashoffset]="seg.offset"
                    stroke-linecap="round"
                    transform="rotate(-90 100 100)"
                  />

                  <!-- Center Text -->
                  <text
                    x="100"
                    y="95"
                    text-anchor="middle"
                    fill="var(--text-dark)"
                    style="font-size: 1.7rem; font-weight: 800; font-family: sans-serif;"
                  >
                    {{ totalUsersCount }}
                  </text>
                  <text
                    x="100"
                    y="120"
                    text-anchor="middle"
                    fill="var(--text-muted)"
                    style="font-size: 0.8rem; font-weight: 600; font-family: sans-serif;"
                  >
                    Users
                  </text>
                </svg>
              </div>
              <div class="col-sm-6 py-2">
                <div class="d-flex flex-column gap-2">
                  <div
                    *ngFor="let seg of getRoleDoughnutSegments()"
                    class="d-flex align-items-center justify-content-between"
                  >
                    <div class="d-flex align-items-center gap-2">
                      <div
                        [style.background]="seg.color"
                        style="width: 12px; height: 12px; border-radius: 3px;"
                      ></div>
                      <span
                        style="font-size: 0.85rem; font-weight: 500; color: var(--text-dark);"
                        >{{ seg.name }}</span
                      >
                    </div>
                    <span class="fw-bold" style="font-size: 0.85rem; color: var(--text-dark);">{{
                      seg.count
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Course Status Doughnut Chart Diagram -->
        <div class="col-lg-6">
          <div
            class="premium-card p-4 h-100 hover-lift-subtle"
            style="border: 1px solid rgba(0,0,0,0.05);"
          >
            <h5
              class="fw-bold mb-4 d-flex align-items-center gap-2"
              style="font-size: 1.1rem; color: var(--text-dark);"
            >
              <i class="bi bi-graph-up-arrow text-success p-2 bg-success bg-opacity-10 rounded"></i>
              Course Publishing Health
            </h5>
            <div
              class="row align-items-center bg-light p-3"
              style="border-radius: 16px; min-height: 180px; margin: 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);"
            >
              <div class="col-sm-6 d-flex justify-content-center py-2">
                <svg width="140" height="140" viewBox="0 0 200 200">
                  <!-- Background Ring -->
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#e2e8f0" stroke-width="18" />

                  <!-- Published Ring -->
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#10b981"
                    stroke-width="18"
                    [attr.stroke-dasharray]="getStrokeDashArray()"
                    stroke-dashoffset="0"
                    stroke-linecap="round"
                    transform="rotate(-90 100 100)"
                  />

                  <!-- Center Text -->
                  <text
                    x="100"
                    y="95"
                    text-anchor="middle"
                    fill="currentColor"
                    style="font-size: 1.7rem; font-weight: 800; font-family: sans-serif;"
                  >
                    {{ totalCoursesCount }}
                  </text>
                  <text
                    x="100"
                    y="120"
                    text-anchor="middle"
                    fill="#64748b"
                    style="font-size: 0.8rem; font-weight: 600; font-family: sans-serif;"
                  >
                    Courses
                  </text>
                </svg>
              </div>
              <div class="col-sm-6 py-2">
                <div class="d-flex flex-column gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <div
                      style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"
                    ></div>
                    <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-dark);"
                      >Published: <strong>{{ publishedCoursesCount }}</strong></span
                    >
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <div
                      style="width: 12px; height: 12px; background: #e2e8f0; border-radius: 50%;"
                    ></div>
                    <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-dark);"
                      >Drafts: <strong>{{ draftCoursesCount }}</strong></span
                    >
                  </div>
                  <hr class="my-1" />
                  <div class="d-flex align-items-center gap-2">
                    <span style="font-size: 0.8rem; color: #64748b;"
                      >Free Courses: <strong>{{ freeCoursesCount }}</strong></span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Tabs Navigation -->
      <div class="tabs-scroll-container">
        <div class="tabs-nav-wrapper">
          <button
            *ngFor="let tab of tabs"
            (click)="setTab(tab)"
            class="btn px-4 py-2 fw-semibold custom-tab-btn text-nowrap flex-shrink-0"
            [class.active-tab]="activeTab === tab"
            style="border-radius: 24px; transition: all 0.25s; font-size: 0.88rem; border: none;"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Spinner for Reports -->
      <div *ngIf="reportsLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading reports...</span>
        </div>
      </div>

      <!-- Users Management -->
      <div *ngIf="activeTab === 'Users' && !reportsLoading">
        <div class="premium-card p-4">
          <!-- Filter & Search Controls -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <div class="d-flex align-items-center gap-2">
              <span class="text-muted fw-semibold" style="font-size: 0.85rem;"
                >Filter by Role:</span
              >
              <div class="btn-group border rounded-pill p-1 bg-light" role="group">
                <button
                  type="button"
                  *ngFor="let roleOpt of ['All', 'Student', 'Trainer', 'Admin']"
                  (click)="setSelectedRoleFilter(roleOpt)"
                  class="btn btn-sm px-3 rounded-pill fw-semibold custom-role-filter-btn"
                  [class.active-role-filter]="selectedRoleFilter === roleOpt"
                  style="font-size: 0.8rem; border: none; transition: all 0.2s;"
                >
                  {{ roleOpt }}
                </button>
              </div>
            </div>
            <!-- Search bar -->
            <div class="position-relative" style="width: 250px;">
              <i
                class="bi bi-search position-absolute text-muted"
                style="left: 14px; top: 50%; transform: translateY(-50%); font-size: 0.85rem;"
              ></i>
              <input
                type="text"
                (input)="onSearchUser($event)"
                placeholder="Search users..."
                class="form-control form-control-sm ps-5 rounded-pill border"
                style="font-size: 0.85rem; padding-top: 6px; padding-bottom: 6px;"
              />
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="min-width: 650px;">
              <thead>
                <tr>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 180px;">
                    Name
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 220px;">
                    Email
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 130px;">
                    Role
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 100px;">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of getFilteredUsers()" class="table-row-hover">
                  <td style="min-width: 180px;">
                    <div class="d-flex align-items-center gap-3">
                      <div
                        class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex justify-content-center align-items-center fw-bold"
                        style="width: 36px; height: 36px; font-size: 0.85rem;"
                      >
                        {{ user.fullName.charAt(0) }}
                      </div>
                      <span class="fw-semibold text-dark text-nowrap">{{ user.fullName }}</span>
                    </div>
                  </td>
                  <td class="text-muted text-nowrap" style="font-size: 0.88rem; min-width: 220px;">{{ user.email }}</td>
                  <td style="min-width: 130px;">
                    <select
                      [value]="user.role"
                      (change)="onRoleChange(user, $event)"
                      class="role-badge-select"
                      [ngClass]="{
                        'role-select-student': user.role === 'Student',
                        'role-select-trainer': user.role === 'Trainer',
                        'role-select-admin': user.role === 'Admin',
                      }"
                    >
                      <option
                        value="Student"
                        style="background-color: var(--card-bg); color: var(--text-dark);"
                      >
                        Student
                      </option>
                      <option
                        value="Trainer"
                        style="background-color: var(--card-bg); color: var(--text-dark);"
                      >
                        Trainer
                      </option>
                      <option
                        value="Admin"
                        style="background-color: var(--card-bg); color: var(--text-dark);"
                      >
                        Admin
                      </option>
                    </select>
                  </td>
                  <td style="min-width: 100px;">
                    <button
                      (click)="deleteUser(user)"
                      class="btn btn-sm btn-light text-danger px-3 py-1 fw-medium hover-lift border"
                      style="font-size: 0.8rem; border-radius: 8px;"
                    >
                      <i class="bi bi-trash3 me-1"></i> Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="getFilteredUsers().length === 0" class="text-center text-muted py-4">
              No users found
            </div>
          </div>
        </div>
      </div>

      <!-- Courses Management -->
      <div *ngIf="activeTab === 'Courses' && !reportsLoading">
        <div class="premium-card p-4">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="min-width: 650px;">
              <thead>
                <tr>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 280px;">
                    Title
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 100px;">
                    Price
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 120px;">
                    Published
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 100px;">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let course of courses" class="table-row-hover">
                  <td style="min-width: 280px;">
                    <div class="d-flex align-items-center gap-3">
                      <div
                        class="rounded bg-success bg-opacity-10 text-success d-flex justify-content-center align-items-center flex-shrink-0"
                        style="width: 40px; height: 40px;"
                      >
                        <i class="bi bi-journal-code fs-5"></i>
                      </div>
                      <span class="fw-semibold text-dark text-nowrap">{{ course.title }}</span>
                    </div>
                  </td>
                  <td style="color: var(--primary-color); font-weight: 700; font-size: 0.95rem; min-width: 100px;" class="text-nowrap">
                    {{ course.price > 0 ? 'Rs. ' + course.price : 'Free' }}
                  </td>
                  <td style="min-width: 120px;" class="text-nowrap">
                    <span
                      class="badge rounded-pill px-2 py-1"
                      [style.background]="course.isPublished ? '#dcfce7' : '#fef3c7'"
                      [style.color]="course.isPublished ? '#166534' : '#92400e'"
                      style="font-size: 0.75rem;"
                    >
                      {{ course.isPublished ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td style="min-width: 100px;" class="text-nowrap">
                    <button
                      (click)="deleteCourse(course)"
                      class="btn btn-sm btn-light text-danger px-3 py-1 fw-medium hover-lift border"
                      style="font-size: 0.8rem; border-radius: 8px;"
                    >
                      <i class="bi bi-trash3 me-1"></i> Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="courses.length === 0" class="text-center text-muted py-4">
              No courses found
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Reports (Stripe payments & trend) -->
      <div *ngIf="activeTab === 'Revenue Reports' && !reportsLoading">
        <div class="row g-4 mb-4">
          <!-- Monthly Trend Diagram -->
          <div class="col-lg-7">
            <div class="premium-card p-4 h-100">
              <h5
                class="fw-bold mb-4 d-flex align-items-center gap-2"
                style="font-size: 1.1rem; color: var(--text-dark);"
              >
                <i
                  class="bi bi-calendar-event text-primary p-2 bg-primary bg-opacity-10 rounded"
                ></i>
                Monthly Revenue Trend
              </h5>

              <!-- Empty State -->
              <div
                *ngIf="!adminReports?.monthlyRevenue?.length"
                class="text-center py-5 text-muted"
              >
                No monthly breakdown data available.
              </div>

              <!-- SVG Line Graph -->
              <div
                *ngIf="adminReports?.monthlyRevenue?.length"
                class="p-3 rounded-4"
                style="min-height: 240px; background: var(--background-color); border: 1px solid var(--border-color); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);"
              >
                <svg
                  width="100%"
                  height="220"
                  viewBox="0 0 500 220"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <!-- Area Gradient Fill -->
                    <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.25" />
                      <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0.0" />
                    </linearGradient>
                    <!-- Line Gradient -->
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stop-color="var(--primary-color)" />
                      <stop offset="100%" stop-color="var(--secondary-color)" />
                    </linearGradient>
                  </defs>

                  <!-- Horizontal Grid Lines and Y-Axis Labels -->
                  <g *ngFor="let lvl of getGridLevels()">
                    <line
                      x1="60"
                      [attr.y1]="lvl.y"
                      x2="480"
                      [attr.y2]="lvl.y"
                      stroke="var(--border-color)"
                      stroke-dasharray="4 4"
                      stroke-width="1"
                    />
                    <text
                      x="50"
                      [attr.y]="lvl.y + 4"
                      text-anchor="end"
                      fill="#94a3b8"
                      style="font-size: 10px; font-weight: 500; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.2px;"
                    >
                      {{ lvl.value }}
                    </text>
                  </g>

                  <!-- X-Axis Line -->
                  <line
                    x1="60"
                    y1="180"
                    x2="480"
                    y2="180"
                    stroke="var(--border-color)"
                    stroke-width="1.5"
                  />

                  <!-- Area Fill Under Curve -->
                  <path [attr.d]="getMonthlyChartData().areaPath" fill="url(#chartAreaGrad)" />

                  <!-- Curve Line -->
                  <path
                    [attr.d]="getMonthlyChartData().linePath"
                    fill="none"
                    stroke="url(#lineGrad)"
                    stroke-width="4"
                    stroke-linecap="round"
                  />

                  <!-- Data Dots & Hover Labels -->
                  <g *ngFor="let pt of getMonthlyChartData().points; let idx = index">
                    <!-- Outer glow/shadow for dot -->
                    <circle
                      [attr.cx]="pt.x"
                      [attr.cy]="pt.y"
                      r="8"
                      fill="var(--primary-color)"
                      fill-opacity="0.2"
                    />
                    <!-- Solid dot -->
                    <circle
                      [attr.cx]="pt.x"
                      [attr.cy]="pt.y"
                      r="5"
                      fill="var(--primary-color)"
                      stroke="#ffffff"
                      stroke-width="2.5"
                    />

                    <!-- Month label (x-axis) -->
                    <text
                      [attr.x]="pt.x"
                      y="202"
                      text-anchor="middle"
                      fill="#94a3b8"
                      style="font-size: 10px; font-weight: 500; font-family: system-ui, -apple-system, sans-serif;"
                    >
                      {{ pt.month }}
                    </text>

                    <!-- Value label (tooltip) -->
                    <text
                      *ngIf="pt.revenue > 0"
                      [attr.x]="pt.x"
                      [attr.y]="pt.y - 14"
                      text-anchor="middle"
                      fill="#a3e635"
                      style="font-size: 11px; font-weight: 700; font-family: system-ui, -apple-system, sans-serif; letter-spacing: 0.5px;"
                    >
                      Rs.{{ pt.revenue }}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <!-- Monthly Breakdown Data -->
          <div class="col-lg-5">
            <div class="premium-card p-4 h-100">
              <h5 class="fw-bold mb-4 text-dark">Monthly Breakdown</h5>
              <div class="table-responsive">
                <table class="table align-middle">
                  <thead>
                    <tr>
                      <th class="small text-muted">Month</th>
                      <th class="small text-muted text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let mon of adminReports?.monthlyRevenue" class="table-row-hover">
                      <td class="fw-semibold text-dark">{{ mon.month }}</td>
                      <td class="text-end fw-bold text-indigo">Rs. {{ mon.revenue }}</td>
                    </tr>
                    <tr *ngIf="!adminReports?.monthlyRevenue?.length">
                      <td colspan="2" class="text-center text-muted py-3">
                        No revenue transactions recorded.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions Table -->
        <div class="premium-card p-4">
          <h5 class="fw-bold mb-4 text-dark">Recent Stripe Payments</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="min-width: 700px;">
              <thead>
                <tr>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 180px;">
                    Student
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 180px;">
                    Course
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 120px;">
                    Date
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 100px;">
                    Amount
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 120px;">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tx of adminReports?.recentTransactions" class="table-row-hover">
                  <td style="min-width: 180px;">
                    <div class="text-nowrap">
                      <div class="fw-semibold text-dark text-nowrap">{{ tx.studentName }}</div>
                      <small class="text-muted text-nowrap" style="font-size: 0.75rem;">{{
                        tx.studentEmail
                      }}</small>
                    </div>
                  </td>
                  <td class="fw-semibold text-dark text-nowrap" style="min-width: 180px;">{{ tx.courseTitle }}</td>
                  <td class="text-muted text-nowrap" style="font-size: 0.85rem; min-width: 120px;">
                    {{ tx.date | date: 'mediumDate' }}
                  </td>
                  <td class="fw-bold text-dark text-nowrap" style="min-width: 100px;">Rs. {{ tx.amount }}</td>
                  <td style="min-width: 120px;" class="text-nowrap">
                    <span
                      class="badge rounded-pill px-2.5 py-1"
                      [ngClass]="
                        tx.status === 'Completed' || tx.status === 'Succeeded'
                           ? 'bg-success-subtle text-success'
                          : 'bg-warning-subtle text-warning'
                      "
                      style="font-size: 0.75rem;"
                    >
                      {{ tx.status }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="!adminReports?.recentTransactions?.length">
                  <td colspan="5" class="text-center text-muted py-4">No recent payments.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Student Progress Tracking -->
      <div *ngIf="activeTab === 'Student Progress' && !reportsLoading">
        <div class="premium-card p-4">
          <h5 class="fw-bold mb-4 text-dark">Student Learning Progress</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="min-width: 800px;">
              <thead>
                <tr>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 180px;">
                    Student
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 180px;">
                    Enrolled Course
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 130px;">
                    Completed Lessons
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; min-width: 180px;">
                    Progress Bar
                  </th>
                  <th
                    style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-align: center; min-width: 130px;"
                  >
                    Certificate
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of adminReports?.studentProgress" class="table-row-hover">
                  <td style="min-width: 180px;">
                    <div class="text-nowrap">
                      <div class="fw-semibold text-dark text-nowrap">{{ p.studentName }}</div>
                      <small class="text-muted text-nowrap" style="font-size: 0.75rem;">{{
                        p.studentEmail
                      }}</small>
                    </div>
                  </td>
                  <td class="fw-medium text-dark text-nowrap" style="min-width: 180px;">{{ p.courseTitle }}</td>
                  <td class="text-muted" style="font-size: 0.85rem;">
                    {{ p.completedLessonsCount }} / {{ p.totalLessonsCount }}
                  </td>
                  <td style="width: 25%;">
                    <div class="d-flex align-items-center gap-2">
                      <div
                        class="progress flex-grow-1"
                        style="height: 6px; border-radius: 4px; background-color: #e2e8f0;"
                      >
                        <div
                          class="progress-bar"
                          role="progressbar"
                          [style.width]="p.progressPercentage + '%'"
                          style="border-radius: 4px; background: linear-gradient(90deg, #84cc16, #65a30d);"
                        ></div>
                      </div>
                      <span class="small fw-bold text-dark"
                        >{{ p.progressPercentage | number: '1.0-0' }}%</span
                      >
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <span
                      *ngIf="p.hasCertificate"
                      class="badge rounded-pill bg-success-subtle text-success px-2.5 py-1.5"
                      style="font-size: 0.75rem;"
                    >
                      <i class="bi bi-patch-check-fill me-1"></i> Awarded
                    </span>
                    <span
                      *ngIf="!p.hasCertificate"
                      class="badge rounded-pill bg-light text-secondary px-2.5 py-1.5"
                      style="font-size: 0.75rem;"
                    >
                      In Progress
                    </span>
                  </td>
                </tr>
                <tr *ngIf="!adminReports?.studentProgress?.length">
                  <td colspan="5" class="text-center text-muted py-4">
                    No student enrollments found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Top Performing Courses -->
      <div *ngIf="activeTab === 'Top Courses' && !reportsLoading">
        <div class="premium-card p-4">
          <h5 class="fw-bold mb-4 text-dark">Top Courses Rankings</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th
                    style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-align: center; width: 80px;"
                  >
                    Rank
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
                    Course Title
                  </th>
                  <th
                    style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-align: center;"
                  >
                    Enrollments
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
                    Total Revenue
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let course of adminReports?.topCourses; let idx = index"
                  class="table-row-hover"
                >
                  <td style="text-align: center;">
                    <span
                      *ngIf="idx === 0"
                      class="badge bg-warning text-dark rounded-circle p-2"
                      title="Best Seller #1"
                      style="width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center;"
                    >
                      <i class="bi bi-crown-fill" style="font-size: 0.85rem;"></i>
                    </span>
                    <span
                      *ngIf="idx === 1"
                      class="badge bg-secondary text-white rounded-circle p-2"
                      title="#2 Seller"
                      style="width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center;"
                    >
                      2
                    </span>
                    <span *ngIf="idx > 1" class="fw-bold text-muted" style="font-size: 0.9rem;">
                      {{ idx + 1 }}
                    </span>
                  </td>
                  <td>
                    <span class="fw-bold text-dark">{{ course.courseTitle }}</span>
                  </td>
                  <td style="text-align: center;" class="fw-bold text-dark">
                    {{ course.enrollmentCount }}
                  </td>
                  <td class="fw-bold text-indigo">Rs. {{ course.totalRevenueGenerated }}</td>
                  <td>
                    <span
                      class="badge rounded-pill px-2 py-1"
                      [style.background]="course.isPublished ? '#dcfce7' : '#fef3c7'"
                      [style.color]="course.isPublished ? '#166534' : '#92400e'"
                      style="font-size: 0.75rem;"
                    >
                      {{ course.isPublished ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="!adminReports?.topCourses?.length">
                  <td colspan="5" class="text-center text-muted py-4">
                    No course report stats found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Issued Certificates -->
      <div *ngIf="activeTab === 'Certificates' && !reportsLoading">
        <div class="premium-card p-4">
          <h5 class="fw-bold mb-4 text-dark">Issued Certificates</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
                    Certificate Number
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
                    Student Name
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
                    Course Title
                  </th>
                  <th style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
                    Issue Date
                  </th>
                  <th
                    style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-align: center;"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cert of adminReports?.issuedCertificates" class="table-row-hover">
                  <td>
                    <div>
                      <div class="fw-semibold text-dark">{{ cert.certificateNumber }}</div>
                      <small class="text-muted" style="font-size: 0.75rem;">{{
                        cert.certificateId
                      }}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div class="fw-semibold text-dark">{{ cert.studentName }}</div>
                      <small class="text-muted" style="font-size: 0.75rem;">{{
                        cert.studentEmail
                      }}</small>
                    </div>
                  </td>
                  <td class="fw-semibold text-dark">{{ cert.courseTitle }}</td>
                  <td class="text-muted" style="font-size: 0.85rem;">
                    {{ cert.issuedDate | date: 'mediumDate' }}
                  </td>
                  <td style="text-align: center;">
                    <button
                      (click)="downloadCertificate(cert.certificateId)"
                      class="btn btn-sm btn-light text-primary px-3 py-1 fw-medium hover-lift border"
                      style="font-size: 0.8rem; border-radius: 8px;"
                    >
                      <i class="bi bi-download me-1"></i> Download PDF
                    </button>
                  </td>
                </tr>
                <tr *ngIf="!adminReports?.issuedCertificates?.length">
                  <td colspan="5" class="text-center text-muted py-4">No certificates found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .text-indigo {
        color: #65a30d;
      }
      .bg-success-subtle {
        background-color: rgba(16, 185, 129, 0.12);
      }
      .bg-warning-subtle {
        background-color: rgba(245, 158, 11, 0.12);
      }
      .hover-lift {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .hover-lift:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      }
      .hover-lift-subtle {
        transition: all 0.3s ease;
      }
      .hover-lift-subtle:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
      }
      .tabs-scroll-container {
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        width: 100%;
        margin-bottom: 1.5rem;
      }
      .tabs-scroll-container::-webkit-scrollbar {
        display: none;
      }
      .tabs-scroll-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .tabs-nav-wrapper {
        display: inline-flex;
        background: var(--card-bg-hover);
        border: 1px solid var(--border-color);
        padding: 6px;
        border-radius: 32px;
        gap: 8px;
        align-items: center;
      }
      .custom-tab-btn {
        background: transparent;
        color: var(--text-muted);
      }
      .custom-tab-btn:hover {
        color: var(--text-dark);
      }
      .active-tab {
        background: var(--card-bg);
        color: var(--primary-color) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .table-row-hover:hover {
        background-color: rgba(99, 102, 241, 0.02) !important;
      }
      table th {
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.75rem !important;
        padding-bottom: 12px;
      }
      table td {
        padding: 12px 8px;
      }
      .role-badge-select {
        font-size: 0.78rem;
        font-weight: 600;
        border-radius: 20px;
        padding: 4px 24px 4px 12px;
        cursor: pointer;
        border: 1px solid transparent;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 10px 10px;
        transition: all 0.2s ease-in-out;
      }

      .role-select-student {
        background-color: #f1f5f9;
        color: #475569;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23475569' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      }
      [data-theme='dark'] .role-select-student {
        background-color: #1e293b;
        color: #cbd5e1;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23cbd5e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      }

      .role-select-trainer {
        background-color: #dbeafe;
        color: #1e40af;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%231e40af' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      }
      [data-theme='dark'] .role-select-trainer {
        background-color: rgba(30, 64, 175, 0.2);
        color: #60a5fa;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2360a5fa' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      }

      .role-select-admin {
        background-color: #fef3c7;
        color: #92400e;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2392400e' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      }
      [data-theme='dark'] .role-select-admin {
        background-color: rgba(146, 64, 14, 0.2);
        color: #f59e0b;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23f59e0b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      }
      .custom-role-filter-btn {
        background: transparent;
        color: var(--text-muted);
      }
      .custom-role-filter-btn:hover {
        color: var(--text-dark);
      }
      .active-role-filter {
        background: #fff !important;
        color: var(--primary-color) !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
      }
      [data-theme='dark'] .active-role-filter {
        background: #1a1a1a !important;
        color: var(--primary-color) !important;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private courseService = inject(CourseService);
  private dashboardService = inject(DashboardService);
  private certificateService = inject(CertificateService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  tabs = ['Users', 'Courses', 'Revenue Reports', 'Student Progress', 'Top Courses', 'Certificates'];
  activeTab = 'Users';
  users: any[] = [];
  courses: any[] = [];

  adminReports: any = null;
  reportsLoading = false;

  selectedRoleFilter = 'All';
  userSearchQuery = '';

  setSelectedRoleFilter(role: string) {
    this.selectedRoleFilter = role;
    this.cdr.detectChanges();
  }

  onSearchUser(event: Event) {
    const input = event.target as HTMLInputElement;
    this.userSearchQuery = input.value;
    this.cdr.detectChanges();
  }

  getFilteredUsers(): any[] {
    if (!this.users) return [];
    return this.users.filter((user) => {
      const matchesRole =
        this.selectedRoleFilter === 'All' || user.role === this.selectedRoleFilter;
      const matchesSearch =
        !this.userSearchQuery ||
        (user.fullName || '').toLowerCase().includes(this.userSearchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(this.userSearchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadCourses();
    this.loadAdminReports();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  // Helper getters for analytics values
  get totalUsersCount() {
    return Array.isArray(this.users) ? this.users.length : 0;
  }
  get studentCount() {
    return Array.isArray(this.users) ? this.users.filter((u) => u.role === 'Student').length : 0;
  }
  get trainerCount() {
    return Array.isArray(this.users) ? this.users.filter((u) => u.role === 'Trainer').length : 0;
  }
  get adminCount() {
    return Array.isArray(this.users) ? this.users.filter((u) => u.role === 'Admin').length : 0;
  }

  get totalCoursesCount() {
    return Array.isArray(this.courses) ? this.courses.length : 0;
  }
  get publishedCoursesCount() {
    return Array.isArray(this.courses) ? this.courses.filter((c) => c.isPublished).length : 0;
  }
  get draftCoursesCount() {
    return Array.isArray(this.courses) ? this.courses.filter((c) => !c.isPublished).length : 0;
  }
  get freeCoursesCount() {
    return Array.isArray(this.courses)
      ? this.courses.filter((c) => !c.price || c.price <= 0).length
      : 0;
  }

  getBarHeight(value: number): number {
    const maxVal = Math.max(this.studentCount, this.trainerCount, this.adminCount, 1);
    return (value / maxVal) * 90;
  }

  getStrokeDashArray(): string {
    const total = this.courses.length;
    if (total === 0) return '0 440';
    const published = this.publishedCoursesCount;
    const percentage = (published / total) * 440;
    return `${percentage} ${440 - percentage}`;
  }

  getCertificateCount(): number {
    if (!this.adminReports || !this.adminReports.studentProgress) return 0;
    return this.adminReports.studentProgress.filter((p: any) => p.hasCertificate).length;
  }

  getMonthlyRevenueList() {
    const list = this.adminReports?.monthlyRevenue || [];
    const monthsList = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;

      const match = list.find((m: any) => m.month === monthStr);
      monthsList.push({
        month: monthStr,
        revenue: match ? match.revenue : 0,
      });
    }
    return monthsList;
  }

  getMonthName(monthStr: string): string {
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const monthIndex = parseInt(parts[1], 10) - 1;
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthNames[monthIndex] || monthStr;
  }

  getGridLevels() {
    const list = this.getMonthlyRevenueList();
    const maxVal = Math.max(...list.map((m) => m.revenue), 100);
    return [
      { y: 30, value: `Rs.${Math.round(maxVal)}` },
      { y: 67.5, value: `Rs.${Math.round(maxVal * 0.75)}` },
      { y: 105, value: `Rs.${Math.round(maxVal * 0.5)}` },
      { y: 142.5, value: `Rs.${Math.round(maxVal * 0.25)}` },
      { y: 180, value: '0' },
    ];
  }

  getMonthlyChartData() {
    const list = this.getMonthlyRevenueList();
    if (list.length === 0) {
      return { linePath: '', areaPath: '', points: [], maxVal: 100 };
    }

    const maxVal = Math.max(...list.map((m) => m.revenue), 100);

    const points = list.map((m, i) => {
      const x = 60 + i * (420 / 5);
      const y = 180 - (m.revenue / maxVal) * 150;
      return { x, y, month: this.getMonthName(m.month), revenue: m.revenue };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p1.x - (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

    return { linePath, areaPath, points, maxVal };
  }

  getRoleDoughnutSegments() {
    const s = this.studentCount;
    const t = this.trainerCount;
    const a = this.adminCount;
    const total = s + t + a || 1;

    const circumference = 440;

    const sDash = (s / total) * circumference;
    const tDash = (t / total) * circumference;
    const aDash = (a / total) * circumference;

    const sOffset = 0;
    const tOffset = -sDash;
    const aOffset = -(sDash + tDash);

    return [
      {
        name: 'Students',
        count: s,
        color: '#84cc16',
        dash: `${sDash} ${circumference - sDash}`,
        offset: sOffset,
      },
      {
        name: 'Trainers',
        count: t,
        color: '#a78bfa',
        dash: `${tDash} ${circumference - tDash}`,
        offset: tOffset,
      },
      {
        name: 'Admins',
        count: a,
        color: '#fbbf24',
        dash: `${aDash} ${circumference - aDash}`,
        offset: aOffset,
      },
    ];
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const data = res.data?.items || res.data || res;
        this.users = Array.isArray(data) ? data : [];
      },
      error: () => {
        this.users = [];
      },
    });
  }

  downloadCertificate(id: string) {
    this.certificateService.downloadCertificate(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error('Failed to download certificate'),
    });
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.courses = Array.isArray(data) ? data : [];
      },
      error: () => {
        this.courses = [];
      },
    });
  }

  loadAdminReports() {
    this.reportsLoading = true;
    this.dashboardService.getAdminReports().subscribe({
      next: (res: any) => {
        this.adminReports = res.data || res;
        this.reportsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reportsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onRoleChange(user: any, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;

    Swal.fire({
      title: 'Change User Role?',
      text: `Are you sure you want to change ${user.fullName}'s role from ${user.role} to ${newRole}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#65a30d',
      confirmButtonText: 'Change Role',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const updateDto = {
          fullName: user.fullName,
          role: newRole,
          isApprovedTrainer: newRole === 'Trainer' || newRole === 'Admin' ? true : false,
        };

        this.userService.updateUser(user.id, updateDto).subscribe({
          next: () => {
            user.role = newRole;
            this.toastr.success(`Role updated successfully to ${newRole}`);
            this.loadAdminReports(); // reload stats and graphs
            this.cdr.detectChanges();
          },
          error: (err) => {
            // Rollback select dropdown value
            selectElement.value = user.role;
            const msg = err.error?.message || 'Failed to update user role';
            this.toastr.error(msg);
            this.cdr.detectChanges();
          },
        });
      } else {
        // Rollback select dropdown value if cancelled
        selectElement.value = user.role;
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(user: any) {
    Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to delete ${user.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.users = this.users.filter((u) => u.id !== user.id);
            this.toastr.success('User deleted');
            this.loadAdminReports(); // reload stats
          },
          error: () => this.toastr.error('Failed to delete user'),
        });
      }
    });
  }

  deleteCourse(course: any) {
    Swal.fire({
      title: 'Delete Course?',
      text: `Are you sure you want to delete "${course.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        this.courseService.deleteCourse(course.id).subscribe({
          next: () => {
            this.courses = this.courses.filter((c) => c.id !== course.id);
            this.toastr.success('Course deleted');
            this.loadAdminReports(); // reload stats
          },
          error: () => this.toastr.error('Failed to delete course'),
        });
      }
    });
  }
}
