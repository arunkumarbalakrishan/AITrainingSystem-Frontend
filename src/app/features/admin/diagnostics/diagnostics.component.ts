import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DiagnosticsService } from '../../../core/services/diagnostics.service';

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <!-- Back -->
      <a
        routerLink="/admin"
        class="btn btn-sm btn-light mb-3 d-inline-flex align-items-center gap-1"
        style="border-radius: var(--border-radius-sm);"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Admin Panel
      </a>

      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 class="fw-bold mb-1">System Diagnostics</h3>
          <p class="text-muted mb-0">Verify operational health of all backend services</p>
        </div>
        <button (click)="runDiagnostics()" class="btn btn-premium px-4" [disabled]="running">
          {{ running ? 'Running checks...' : '▶ Run All Checks' }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="running" class="text-center py-5">
        <div
          class="spinner-border text-primary mb-3"
          role="status"
          style="width: 3rem; height: 3rem;"
        ></div>
        <p class="text-muted">Running end-to-end diagnostics. This may take a moment...</p>
      </div>

      <!-- Results -->
      <div *ngIf="report && !running" class="row g-3">
        <!-- Overall Status -->
        <div class="col-12 mb-2">
          <div
            class="premium-card p-4 d-flex align-items-center gap-3"
            [style.border-left]="'4px solid ' + (report.allPassed ? '#10b981' : '#ef4444')"
          >
            <div
              class="rounded-circle d-flex align-items-center justify-content-center"
              [style.background]="report.allPassed ? '#dcfce7' : '#fee2e2'"
              style="width: 56px; height: 56px; font-size: 1.5rem;"
            >
              {{ report.allPassed ? '✅' : '⚠️' }}
            </div>
            <div>
              <h4 class="fw-bold mb-0">
                {{ report.allPassed ? 'All Systems Operational' : 'Some Checks Failed' }}
              </h4>
              <p class="text-muted mb-0">
                {{
                  report.allPassed
                    ? 'Every component passed successfully.'
                    : 'Review the individual checks below.'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Individual Check Cards -->
        <div class="col-md-6" *ngFor="let check of checks">
          <div
            class="premium-card p-4 h-100"
            [style.border-left]="'4px solid ' + (check.passed ? '#10b981' : '#ef4444')"
          >
            <div class="d-flex align-items-start gap-3">
              <div
                class="rounded d-flex align-items-center justify-content-center flex-shrink-0"
                [style.background]="check.passed ? '#dcfce7' : '#fee2e2'"
                style="width: 44px; height: 44px; font-size: 1.2rem;"
              >
                {{ check.icon }}
              </div>
              <div class="flex-grow-1 min-width-0">
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <h6 class="fw-bold mb-0">{{ check.name }}</h6>
                  <span
                    class="badge rounded-pill px-2 py-1"
                    [style.background]="check.passed ? '#dcfce7' : '#fee2e2'"
                    [style.color]="check.passed ? '#166534' : '#991b1b'"
                    style="font-size: 0.7rem;"
                  >
                    {{ check.passed ? 'PASS' : 'FAIL' }}
                  </span>
                </div>
                <p
                  class="text-muted mb-0"
                  style="font-size: 0.82rem; line-height: 1.5; word-break: break-word;"
                >
                  {{ check.status }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Yet Run -->
      <div *ngIf="!report && !running" class="text-center py-5 text-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#cbd5e1"
          stroke-width="1.5"
          class="mb-3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <h5 class="fw-semibold">Ready to Diagnose</h5>
        <p>Click "Run All Checks" to verify database, storage, AI, payments, and PDF generation.</p>
      </div>
    </div>
  `,
})
export class DiagnosticsComponent {
  private diagService = inject(DiagnosticsService);

  running = false;
  report: any = null;
  checks: { name: string; icon: string; passed: boolean; status: string }[] = [];

  runDiagnostics() {
    this.running = true;
    this.report = null;
    this.checks = [];

    this.diagService.runAll().subscribe({
      next: (res: any) => {
        this.report = res;
        this.checks = [
          { name: 'Database', icon: '🗄️', passed: res.databasePassed, status: res.databaseStatus },
          {
            name: 'File Storage',
            icon: '📁',
            passed: res.storagePassed,
            status: res.storageStatus,
          },
          { name: 'AI / OpenAI', icon: '🤖', passed: res.aiPassed, status: res.aiStatus },
          {
            name: 'Payments / Stripe',
            icon: '💳',
            passed: res.paymentPassed,
            status: res.paymentStatus,
          },
          { name: 'PDF Generation', icon: '📄', passed: res.pdfPassed, status: res.pdfStatus },
        ];
        this.running = false;
      },
      error: (err) => {
        this.report = { allPassed: false };
        this.checks = [
          {
            name: 'Connection Error',
            icon: '❌',
            passed: false,
            status: `Could not reach diagnostics endpoint: ${err.message || err.statusText || 'Unknown error'}`,
          },
        ];
        this.running = false;
      },
    });
  }
}
