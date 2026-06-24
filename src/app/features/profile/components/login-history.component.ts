import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card p-4">
      
      <!-- Header & Filtering -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-clock-history text-primary"></i> Login Activity Audit History
        </h5>
        
        <div class="d-flex flex-wrap align-items-center gap-2">
          <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)"
                  class="form-select filter-select py-1 px-3" style="width:160px;">
            <option value="All">All Events</option>
            <option value="Success">Successful logins</option>
            <option value="Failure">Failed logins</option>
          </select>

          <div class="position-relative">
            <span class="position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary" style="font-size:0.85rem;pointer-events:none;">
              <i class="bi bi-search"></i>
            </span>
            <input type="text"
                   [ngModel]="searchQuery()"
                   (ngModelChange)="searchQuery.set($event)"
                   placeholder="Search location / OS..."
                   class="form-control filter-select ps-4 py-1 small" style="width:200px;" />
          </div>
        </div>
      </div>

      <!-- History Table -->
      <div class="table-responsive">
        <table class="table dark-table align-middle mb-0">
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Browser / Device</th>
              <th>IP Address</th>
              <th class="d-none d-sm-table-cell">Location</th>
              <th class="text-end">Status</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredLogs().length > 0) {
              @for (log of filteredLogs(); track log.id) {
                <tr class="log-row">
                  <td><span class="small fw-semibold text-white">{{ log.dateTime }}</span></td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="device-icon d-flex align-items-center justify-content-center rounded">
                        <i [class]="getDeviceIcon(log.deviceType)"></i>
                      </div>
                      <div>
                        <span class="text-white small fw-medium d-block">{{ log.browser }} on {{ log.os }}</span>
                        <small class="text-secondary font-monospace" style="font-size:0.65rem;">UID-{{ log.id }}</small>
                      </div>
                    </div>
                  </td>
                  <td><span class="font-monospace small text-secondary">{{ log.ipAddress }}</span></td>
                  <td class="d-none d-sm-table-cell">
                    <span class="small text-secondary">
                      <i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ log.location }}
                    </span>
                  </td>
                  <td class="text-end">
                    <span class="status-pill fw-semibold small"
                          [class.success]="log.status === 'Success'"
                          [class.failure]="log.status === 'Failure'">
                      <i class="bi me-1"
                         [class.bi-check-circle-fill]="log.status === 'Success'"
                         [class.bi-x-circle-fill]="log.status === 'Failure'"></i>
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="5" class="text-center py-5">
                  <i class="bi bi-inbox text-secondary d-block mb-2" style="font-size:2rem;"></i>
                  <span class="text-secondary small">No matching login events found.</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (filteredLogs().length > 0) {
        <div class="mt-3 pt-2 border-top border-light border-opacity-5">
          <small class="text-secondary">Showing {{ filteredLogs().length }} of {{ logs.length }} events</small>
        </div>
      }

    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .filter-select {
      background: rgba(5, 5, 5, 0.7) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #e0e0e0 !important;
      border-radius: 8px;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }
    .filter-select:focus {
      border-color: #9FEF00 !important;
      box-shadow: none !important;
      outline: none;
    }
    .filter-select option {
      background: #0d1117;
      color: #e0e0e0;
    }
    /* Critical: override Bootstrap's white table background */
    .dark-table {
      --bs-table-bg: transparent !important;
      --bs-table-color: #A0A0A0;
      --bs-table-border-color: rgba(255,255,255,0.05);
      --bs-table-striped-bg: transparent;
      --bs-table-hover-bg: rgba(255,255,255,0.02);
      color: #A0A0A0;
    }
    .dark-table thead tr {
      background: transparent !important;
    }
    .dark-table th {
      border-bottom: 1px solid rgba(255,255,255,0.07) !important;
      color: rgba(255,255,255,0.4);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 700;
      padding: 0.75rem;
      background: transparent !important;
    }
    .dark-table td {
      border-bottom: 1px solid rgba(255,255,255,0.04) !important;
      padding: 0.8rem 0.75rem;
      background: transparent !important;
    }
    .log-row:hover td {
      background: rgba(255,255,255,0.015) !important;
    }
    .device-icon {
      width: 34px;
      height: 34px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      font-size: 1rem;
      flex-shrink: 0;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.74rem;
    }
    .status-pill.success {
      background: rgba(0, 210, 106, 0.1);
      border: 1px solid rgba(0, 210, 106, 0.25);
      color: #00D26A;
    }
    .status-pill.failure {
      background: rgba(255, 77, 79, 0.1);
      border: 1px solid rgba(255, 77, 79, 0.25);
      color: #FF4D4F;
    }
    .ps-4 { padding-left: 2rem !important; }
  `]
})
export class LoginHistoryComponent {
  @Input() logs: any[] = [];

  searchQuery = signal('');
  statusFilter = signal('All');

  filteredLogs = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    return this.logs.filter(log => {
      if (status !== 'All' && log.status !== status) return false;
      if (!q) return true;
      return (
        log.location?.toLowerCase().includes(q) ||
        log.os?.toLowerCase().includes(q) ||
        log.browser?.toLowerCase().includes(q) ||
        log.ipAddress?.toLowerCase().includes(q)
      );
    });
  });

  getDeviceIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'mobile': return 'bi bi-phone-fill text-info';
      case 'tablet': return 'bi bi-tablet-fill text-warning';
      default:       return 'bi bi-pc-display text-primary';
    }
  }
}
