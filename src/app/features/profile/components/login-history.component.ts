import { Component, Input, OnInit, signal, computed } from '@angular/core';
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
        
        <div class="d-flex flex-wrap align-items-center gap-2.5">
          <!-- Status Filter -->
          <select [(ngModel)]="statusFilter" class="form-select filter-select py-1.5 px-3">
            <option value="All">All Events</option>
            <option value="Success">Successful logins</option>
            <option value="Failure">Failed logins</option>
          </select>

          <!-- Search Input -->
          <div class="position-relative" style="width: 200px; max-width: 100%;">
            <span class="position-absolute top-50 start-0 translate-middle-y ms-2.5 text-secondary" style="font-size: 0.85rem;">
              <i class="bi bi-search"></i>
            </span>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   placeholder="Search location/OS..." 
                   class="form-control search-input ps-5 py-1.5 small" />
          </div>
        </div>
      </div>

      <!-- History Table -->
      <div class="table-responsive">
        <table class="table premium-table align-middle">
          <thead>
            <tr>
              <th scope="col">Date & Time</th>
              <th scope="col">Browser / Device</th>
              <th scope="col">IP Address</th>
              <th scope="col" class="d-none d-sm-table-cell">Location</th>
              <th scope="col" class="text-end">Status</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredLogs().length > 0) {
              @for (log of filteredLogs(); track log.id) {
                <tr>
                  <!-- Date -->
                  <td class="small fw-semibold text-white">{{ log.dateTime }}</td>
                  <!-- Device & OS -->
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="device-icon d-flex align-items-center justify-content-center bg-dark border border-light border-opacity-5 rounded" style="width: 32px; height: 32px;">
                        <i [class]="getDeviceIcon(log.deviceType)"></i>
                      </div>
                      <div>
                        <span class="text-light small fw-medium d-block">{{ log.browser }} on {{ log.os }}</span>
                        <small class="text-secondary opacity-60 font-monospace" style="font-size: 0.65rem;">UID-00{{ log.id }}</small>
                      </div>
                    </div>
                  </td>
                  <!-- IP Address -->
                  <td class="font-monospace small text-secondary">{{ log.ipAddress }}</td>
                  <!-- Location -->
                  <td class="d-none d-sm-table-cell">
                    <span class="small text-secondary"><i class="bi bi-geo-alt-fill text-danger text-opacity-80 me-1"></i>{{ log.location }}</span>
                  </td>
                  <!-- Status -->
                  <td class="text-end">
                    <span class="status-badge px-2.5 py-0.5 rounded-pill small fw-bold"
                          [class.bg-success-subtle]="log.status === 'Success'"
                          [class.text-success]="log.status === 'Success'"
                          [class.bg-danger-subtle]="log.status === 'Failure'"
                          [class.text-danger]="log.status === 'Failure'">
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="5" class="text-center py-5">
                  <span class="text-secondary">No matching login events found.</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .filter-select, .search-input {
      background: rgba(5, 5, 5, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff !important;
      border-radius: 8px;
      transition: all 0.25s ease;
    }
    .filter-select:focus, .search-input:focus {
      background: rgba(13, 17, 23, 0.9);
      border-color: var(--primary-color, #9FEF00);
      outline: none;
    }
    .ps-5 {
      padding-left: 2rem !important;
    }
    .premium-table {
      margin-bottom: 0;
      color: #A0A0A0;
    }
    .premium-table th {
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      text-uppercase: true;
      letter-spacing: 0.5px;
      font-weight: 700;
      padding: 0.85rem 0.5rem;
    }
    .premium-table td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding: 0.85rem 0.5rem;
    }
    .status-badge {
      font-size: 0.7rem;
      display: inline-block;
    }
    .bg-success-subtle {
      background-color: rgba(0, 210, 106, 0.1) !important;
    }
    .bg-danger-subtle {
      background-color: rgba(255, 77, 79, 0.1) !important;
    }
  `]
})
export class LoginHistoryComponent {
  @Input() logs: any[] = [];

  searchQuery = '';
  statusFilter = 'All';

  filteredLogs = computed(() => {
    return this.logs.filter(log => {
      // Apply status filter
      if (this.statusFilter !== 'All' && log.status !== this.statusFilter) return false;
      
      // Apply search query
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return true;
      
      return log.location.toLowerCase().includes(q) || 
             log.os.toLowerCase().includes(q) || 
             log.browser.toLowerCase().includes(q);
    });
  });

  getDeviceIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'mobile': return 'bi-phone-fill text-info';
      case 'tablet': return 'bi-tablet-fill text-warning';
      default: return 'bi-pc-display text-primary';
    }
  }
}
