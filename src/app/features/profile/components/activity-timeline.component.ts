import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-4">
      
      <!-- Card Header -->
      <div class="mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-1 text-white d-flex align-items-center gap-2">
          <i class="bi bi-clock-history text-primary"></i> Activity Timeline
        </h5>
        <small class="text-secondary">Recent actions and study accomplishments on the platform</small>
      </div>

      <!-- Vertical Timeline -->
      <div class="timeline-container position-relative ps-4 py-2">
        <div class="timeline-line position-absolute top-0 start-0 h-100 bg-light bg-opacity-10 ms-2" style="width: 2px;"></div>
        
        @if (events && events.length > 0) {
          @for (event of events; track event.id) {
            <div class="timeline-event position-relative mb-4">
              
              <!-- Timeline node dot -->
              <div class="timeline-dot position-absolute top-0 start-0 translate-middle-x rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                   [style.background-color]="event.color + '15'"
                   [style.border]="'2px solid ' + event.color"
                   [style.color]="event.color"
                   style="width: 24px; height: 24px; left: -16px; font-size: 0.75rem; z-index: 2;">
                <i [class]="'bi ' + event.icon"></i>
              </div>

              <!-- Event Details -->
              <div class="event-card p-3 rounded-4 bg-black bg-opacity-40 border border-light border-opacity-5 ms-3 hover-scale">
                <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-1.5">
                  <span class="text-white small fw-bold">{{ event.title }}</span>
                  <small class="text-secondary opacity-60 font-monospace" style="font-size: 0.7rem;">{{ event.date | date:'MMM d, h:mm a' }}</small>
                </div>
                <p class="text-secondary small mb-0 mt-1 opacity-80">
                  {{ getEventDescription(event.type) }}
                </p>
              </div>

            </div>
          }
        } @else {
          <div class="text-center py-4">
            <span class="text-secondary italic small">No recent activity found.</span>
          </div>
        }
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
    .timeline-container {
      margin-left: 0.5rem;
    }
    .hover-scale {
      transition: all 0.2s ease;
    }
    .hover-scale:hover {
      transform: translateX(3px);
      border-color: rgba(255, 255, 255, 0.1) !important;
      background: rgba(255, 255, 255, 0.01) !important;
    }
  `]
})
export class ActivityTimelineComponent {
  @Input() events: any[] = [];

  getEventDescription(type: string): string {
    switch (type) {
      case 'course': return 'Course module completion updated and added to learning statistics logs.';
      case 'certificate': return 'Blockchain cryptographic certificate minted and added to featured showcase.';
      case 'profile': return 'User details updated. Profile completeness meter recalculated.';
      case 'security': return 'Security log generated. Account authentication settings adjusted.';
      case 'quiz': return 'Evaluation module assessment finalized and added to student records.';
      case 'goals': return 'Target study metrics and monthly learning goals updated.';
      default: return 'User log event occurred.';
    }
  }
}
