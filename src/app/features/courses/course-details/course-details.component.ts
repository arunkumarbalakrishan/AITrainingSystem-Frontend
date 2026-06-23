import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="animate-fade-in" *ngIf="course">
      <!-- Back button -->
      <a
        routerLink="/explore"
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
        Back to Courses
      </a>

      <div class="row g-4">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Hero -->
          <div class="premium-card p-0 mb-4 overflow-hidden">
            <!-- Course Image / Video placeholder -->
            <div class="position-relative w-100 bg-dark" style="height: 350px; overflow: hidden; border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;">
              <img
                [src]="getCourseImage(course.title)"
                class="w-100 h-100 opacity-75"
                [class.object-fit-contain]="isLogo(course.title)"
                [class.object-fit-cover]="!isLogo(course.title)"
                [class.p-5]="isLogo(course.title)"
                [class.bg-white]="isLogo(course.title)"
                alt="Course Preview"
              />
              <div *ngIf="!isLogo(course.title)" class="position-absolute top-50 start-50 translate-middle text-center" style="z-index: 2;">
                <h2 class="text-white fw-bold px-4" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">{{ course.title }}</h2>
              </div>
            </div>
            <div class="p-4">
              <p class="text-muted" style="line-height: 1.7;">{{ course.description }}</p>

              <div class="d-flex flex-wrap gap-3 mt-3">
                <span class="badge rounded-pill bg-light text-dark px-3 py-2">
                  📚 {{ lessons.length }} Lessons
                </span>
                <span class="badge rounded-pill bg-light text-dark px-3 py-2">
                  {{ course.category || 'General' }}
                </span>
                <span
                  *ngIf="course.isPublished"
                  class="badge rounded-pill px-3 py-2"
                  style="background: #dcfce7; color: #166534;"
                >
                  ✓ Published
                </span>
              </div>
            </div>
          </div>

          <!-- Curriculum / Lessons -->
          <div class="premium-card p-4 mb-4">
            <h5 class="fw-bold mb-3">Curriculum</h5>
            <div *ngIf="lessons.length === 0" class="text-center text-muted py-4">
              No lessons available yet.
            </div>
            <div
              *ngFor="let lesson of lessons; let i = index"
              class="d-flex align-items-center gap-3 p-3 border-bottom"
              style="cursor: default;"
            >
              <div
                class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style="width: 36px; height: 36px; background: #f0fdf4; color: var(--primary-color); font-weight: 600; font-size: 0.85rem;"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-0 fw-semibold">{{ lesson.title }}</h6>
                <small class="text-muted">{{ lesson.durationMinutes || 0 }} min</small>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#94a3b8"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <div class="premium-card p-4 position-sticky" style="top: 20px;">
            <div class="text-center mb-3">
              <h3 class="fw-bold" style="color: var(--primary-color);">
                {{ course.price > 0 ? 'Rs. ' + course.price : 'Free' }}
              </h3>
            </div>

            <button
              (click)="onEnroll()"
              [disabled]="enrolling"
              class="btn btn-premium w-100 py-3 fw-semibold mb-3"
              style="font-size: 1rem;"
            >
              {{
                enrolling ? 'Processing...' : course.price > 0 ? 'Buy & Enroll' : 'Enroll for Free'
              }}
            </button>

            <div class="border-top pt-3 mt-2">
              <div class="d-flex justify-content-between py-2">
                <span class="text-muted" style="font-size: 0.85rem;">Instructor</span>
                <span class="fw-semibold" style="font-size: 0.85rem;">{{
                  course.instructorName || 'N/A'
                }}</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span class="text-muted" style="font-size: 0.85rem;">Lessons</span>
                <span class="fw-semibold" style="font-size: 0.85rem;">{{ lessons.length }}</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span class="text-muted" style="font-size: 0.85rem;">Category</span>
                <span class="fw-semibold" style="font-size: 0.85rem;">{{
                  course.category || 'General'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="!course && loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Loading course details...</p>
    </div>

    <!-- Stripe Checkout Modal Overlay -->
    <div *ngIf="showStripeModal" class="stripe-modal-overlay animate-fade-in">
      <div class="stripe-modal-card" style="animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="stripe-modal-header">
          <div class="stripe-logo">
            <svg
              viewBox="0 0 60 25"
              class="stripe-svg"
              xmlns="http://www.w3.org/2000/svg"
              style="height: 24px;"
            >
              <path
                d="M59.64 14.28c0-4.06-2.1-6.87-6.07-6.87-4.04 0-6.82 2.9-6.82 6.88 0 4.7 3.32 6.84 7.27 6.84 2.2 0 4.02-.42 5.23-1.03v-3.02c-1.25.62-2.88.93-4.4.93-2.18 0-4.06-.8-4.22-3.07h14c0-.12.03-.4.03-.66zm-8.88-2.3c0-1.4.94-2.17 2.2-2.17 1.25 0 2.2.78 2.2 2.18h-4.4zM37.97 7.72c-2.17 0-3.6.93-4.45 2.1l-.16-1.76h-3.8v19.46l4.63-.98v-5.06c.8.93 2.15 1.7 3.86 1.7 3.85 0 6.64-2.8 6.64-7.78-.02-4.9-2.9-7.68-6.72-7.68zm-1.12 9.54c-1.6 0-2.73-1.13-2.73-3.1 0-2 1.1-3.12 2.72-3.12 1.62 0 2.76 1.1 2.76 3.12 0 1.97-1.14 3.1-2.76 3.1zM24.23 4.22V8h3.38v3.66h-3.38v8.32c0 1.28.66 1.86 1.78 1.86.58 0 1.13-.08 1.5-.22v3.66c-.66.27-1.74.4-2.92.4-3.66 0-5-.98-5-4.8v-9.22h-2.13V8h2.13V4.22h4.64zm-12 3.5c-2.07 0-3.3.96-4.06 1.98l-.16-1.64H3.45v13.06h4.63v-7.14c0-2 .93-2.94 2.42-2.94.34 0 .7.05.94.13V4.32a6.3 6.3 0 0 0-1.22-.1zm-8.8 0h4.64V21.1H3.43V7.72zm2.32-5.46a2.67 2.67 0 1 1-.02 5.34 2.67 2.67 0 0 1 .02-5.34z"
                fill="#635bff"
              ></path>
            </svg>
          </div>
          <button (click)="closeStripeModal()" class="stripe-close-btn">&times;</button>
        </div>

        <div class="stripe-modal-body">
          <div class="stripe-order-summary">
            <span class="stripe-summary-label">Pay AITrainingSystem</span>
            <span class="stripe-summary-amount">Rs. {{ course.price }}</span>
            <div class="stripe-course-title">{{ course.title }}</div>
          </div>

          <form (submit)="processStripePayment($event)" class="stripe-payment-form">
            <div class="stripe-form-group">
              <label class="stripe-label">Email</label>
              <input
                type="email"
                [(ngModel)]="userEmail"
                name="email"
                class="stripe-input"
                required
              />
            </div>

            <div class="stripe-card-details-box">
              <label class="stripe-label">Card Information</label>
              <div
                class="stripe-card-input-wrapper"
                style="position: relative; display: flex; align-items: center;"
              >
                <i
                  class="bi bi-credit-card stripe-card-icon"
                  style="position: absolute; left: 14px; top: 10px; font-size: 1.2rem; color: #94a3b8;"
                ></i>
                <input
                  type="text"
                  placeholder="1234 5678 1234 5678"
                  [(ngModel)]="stripeCardNumber"
                  name="cardNumber"
                  (input)="formatCardNumber()"
                  maxlength="19"
                  required
                  class="stripe-input stripe-card-num-input"
                  style="padding-left: 44px;"
                />
              </div>
              <div class="stripe-card-row" style="display: flex; gap: 12px; margin-top: 8px;">
                <input
                  type="text"
                  placeholder="MM / YY"
                  [(ngModel)]="stripeExpiry"
                  name="expiry"
                  (input)="formatExpiry()"
                  maxlength="7"
                  required
                  class="stripe-input stripe-half-input"
                  style="flex: 1;"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  [(ngModel)]="stripeCVC"
                  name="cvc"
                  (input)="formatCVC()"
                  maxlength="4"
                  required
                  class="stripe-input stripe-half-input"
                  style="flex: 1;"
                />
              </div>
            </div>

            <div class="stripe-form-group">
              <label class="stripe-label">Name on Card</label>
              <input
                type="text"
                placeholder="John Doe"
                [(ngModel)]="stripeCardName"
                name="cardName"
                required
                class="stripe-input"
              />
            </div>

            <button type="submit" [disabled]="stripeProcessing" class="stripe-pay-button position-relative overflow-hidden">
              <div *ngIf="stripeProcessing" class="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center" style="background: rgba(99, 91, 255, 0.9);">
                <div class="spinner-border spinner-border-sm text-white" role="status"></div>
              </div>
              {{ stripeProcessing ? 'Processing...' : 'Pay Rs. ' + course.price }}
            </button>
          </form>

          <div class="stripe-secure-footer d-flex align-items-center justify-content-center gap-2">
            <i class="bi bi-shield-fill-check text-success" [class.text-muted]="stripeProcessing"></i> 
            <span [class.text-muted]="!stripeProcessing" [class.fw-semibold]="stripeProcessing" [class.text-success]="stripeProcessing">
              {{ stripeProcessing ? 'Verifying payment securely...' : 'Secure payment processed by Stripe.' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class CourseDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private enrollService = inject(EnrollmentService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  course: any = null;
  lessons: any[] = [];
  loading = true;
  enrolling = false;

  // Stripe Checkout properties
  showStripeModal = false;
  stripeCardNumber = '';
  stripeExpiry = '';
  stripeCVC = '';
  stripeCardName = '';
  stripeProcessing = false;
  userEmail = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.courseService.getCourseById(id).subscribe({
      next: (res: any) => {
        this.course = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    this.courseService.getLessons(id).subscribe({
      next: (res: any) => {
        this.lessons = res.data || res || [];
      },
    });
  }

  onEnroll() {
    if (!this.authService.isAuthenticated()) {
      this.toastr.warning('Please login to enroll');
      this.router.navigate(['/login']);
      return;
    }

    const courseId = this.course.id;

    if (this.course.price > 0) {
      // Open our premium Stripe Checkout Modal
      this.userEmail = this.authService.getUserEmail();
      this.stripeCardNumber = '';
      this.stripeExpiry = '';
      this.stripeCVC = '';
      this.stripeCardName = '';
      this.showStripeModal = true;
    } else {
      this.enrolling = true;
      this.enrollService.enroll(courseId).subscribe({
        next: () => {
          this.enrolling = false;
          this.toastr.success('Enrolled successfully!');
          this.router.navigate(['/my-courses']);
        },
        error: (err) => {
          this.enrolling = false;
          this.toastr.error(err.error?.message || 'Enrollment failed');
        },
      });
    }
  }

  closeStripeModal() {
    this.showStripeModal = false;
  }

  formatCardNumber() {
    let value = this.stripeCardNumber.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += value[i];
    }
    this.stripeCardNumber = formatted;
  }

  formatExpiry() {
    let value = this.stripeExpiry.replace(/\D/g, '');
    if (value.length > 2) {
      this.stripeExpiry = value.substring(0, 2) + ' / ' + value.substring(2, 4);
    } else {
      this.stripeExpiry = value;
    }
  }

  ngOnDestroy(): void {};

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

  formatCVC() {
    this.stripeCVC = this.stripeCVC.replace(/\D/g, '');
  }

  processStripePayment(event: Event) {
    event.preventDefault();
    if (!this.stripeCardNumber || !this.stripeExpiry || !this.stripeCVC || !this.stripeCardName) {
      this.toastr.warning('Please fill in all card details.');
      return;
    }

    this.stripeProcessing = true;
    const courseId = this.course.id;

    // Simulate standard card verification & processing delay
    setTimeout(() => {
      this.enrollService.confirmMockPayment(courseId).subscribe({
        next: () => {
          this.stripeProcessing = false;
          this.showStripeModal = false;
          this.toastr.success('Payment successful! You are now enrolled.');
          this.router.navigate(['/my-courses']);
        },
        error: (err) => {
          console.error("Stripe Mock Payment Error:", err);
          this.stripeProcessing = false;
          
          let errorMsg = 'Payment failed';
          if (err.error && typeof err.error === 'object') {
             errorMsg = err.error.message || err.error.Message || err.error.title || 'Payment failed on server';
          } else if (err.status === 0) {
             errorMsg = 'Cannot connect to server. Did you accept the SSL cert in Swagger?';
          } else if (err.status === 401) {
             errorMsg = 'Your session expired. Please login again.';
          } else if (err.message) {
             errorMsg = err.message;
          }
          
          this.toastr.error(errorMsg);
        },
      });
    }, 1200);
  }
}
