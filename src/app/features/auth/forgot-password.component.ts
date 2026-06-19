import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div
      class="container-fluid min-vh-100 d-flex align-items-center justify-content-start p-3 p-md-5 ps-lg-5"
      (mousemove)="onMouseMove($event)"
      style="position: relative; overflow: hidden; background: #0f172a; height: 100vh;"
    >
      <!-- Animated Background Wrapper (Robot and Eye) -->
      <div class="robot-bg-wrapper">
        <div
          class="robot-bg-interactive"
          [style.transform]="'translate(' + translateX + 'px, ' + translateY + 'px)'"
          style="transition: transform 0.3s cubic-bezier(0.15, 0.85, 0.35, 1); width: 100%; height: 100%; position: relative;"
        >
          <img src="/robot.png" alt="Robot BG" class="robot-bg-img" />
          <div class="robot-eye-glow d-none d-lg-block"></div>
          <div class="robot-cheek-glow d-none d-lg-block"></div>
          <div class="robot-neck-glow d-none d-lg-block"></div>
          <div class="robot-hand-glow d-none d-lg-block"></div>
          <div class="robot-finger-glow d-none d-lg-block"></div>
        </div>
      </div>

      <!-- Dark subtle overlay above the background image, but below the login card -->
      <div
        style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(15, 23, 42, 0.25); z-index: 2;"
      ></div>

      <style>
        :host {
          display: block;
          height: 100vh;
          overflow: hidden;
        }
        @keyframes robot-walk {
          0% {
            transform: scale(1.03) translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: scale(1.03) translate(-8px, -15px) rotate(-0.5deg);
          }
          50% {
            transform: scale(1.03) translate(0px, 0px) rotate(0deg);
          }
          75% {
            transform: scale(1.03) translate(8px, -15px) rotate(0.5deg);
          }
          100% {
            transform: scale(1.03) translate(0px, 0px) rotate(0deg);
          }
        }
        .robot-bg-wrapper {
          position: absolute;
          top: -45px;
          left: -45px;
          width: calc(100% + 90px);
          height: calc(100% + 90px);
          z-index: 1;
          overflow: hidden;
          animation: robot-walk 3.5s ease-in-out infinite;
        }
        .robot-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        @keyframes eye-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.45;
            box-shadow:
              0 0 8px #00d2ff,
              0 0 15px #00d2ff;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
            box-shadow:
              0 0 15px #00d2ff,
              0 0 30px #00d2ff,
              0 0 50px #00d2ff;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.45;
            box-shadow:
              0 0 8px #00d2ff,
              0 0 15px #00d2ff;
          }
        }
        .robot-eye-glow {
          position: absolute;
          top: 27.2%;
          left: 64.9%;
          width: 12px;
          height: 12px;
          background: #00d2ff;
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
          animation: eye-pulse 2s infinite ease-in-out;
        }
        .robot-cheek-glow {
          position: absolute;
          top: 36.5%;
          left: 74.2%;
          width: 8px;
          height: 8px;
          background: #00d2ff;
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
          animation: eye-pulse 2.5s infinite ease-in-out;
        }
        @keyframes neck-pulse {
          0% {
            opacity: 0.3;
            filter: drop-shadow(0 0 4px #00d2ff);
          }
          50% {
            opacity: 0.8;
            filter: drop-shadow(0 0 15px #00d2ff) drop-shadow(0 0 25px #00d2ff);
          }
          100% {
            opacity: 0.3;
            filter: drop-shadow(0 0 4px #00d2ff);
          }
        }
        .robot-neck-glow {
          position: absolute;
          top: 52%;
          left: 68.8%;
          width: 25px;
          height: 120px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 210, 255, 0.45) 0%,
            rgba(0, 210, 255, 0) 70%
          );
          z-index: 2;
          pointer-events: none;
          animation: neck-pulse 3s infinite ease-in-out;
          transform: rotate(-15deg);
        }
        @keyframes hand-jitter {
          0%,
          100% {
            transform: translate(0, 0);
            opacity: 0.5;
            box-shadow: 0 0 5px #00d2ff;
          }
          10% {
            transform: translate(-0.8px, 0.8px);
            opacity: 0.8;
            box-shadow: 0 0 10px #00d2ff;
          }
          20% {
            transform: translate(0.8px, -0.8px);
            opacity: 0.6;
          }
          30% {
            transform: translate(-1.2px, 0px);
            opacity: 0.9;
            box-shadow: 0 0 14px #00d2ff;
          }
          40% {
            transform: translate(0.8px, 0.8px);
            opacity: 0.5;
          }
          50% {
            transform: translate(-0.8px, -0.8px);
            opacity: 0.8;
            box-shadow: 0 0 10px #00d2ff;
          }
          60% {
            transform: translate(1.2px, -0.8px);
            opacity: 0.7;
          }
          70% {
            transform: translate(-1.2px, 0.8px);
            opacity: 0.9;
            box-shadow: 0 0 12px #00d2ff;
          }
          80% {
            transform: translate(0.8px, 0.8px);
            opacity: 0.6;
          }
          90% {
            transform: translate(-0.8px, -0.8px);
            opacity: 0.8;
          }
        }
        .robot-hand-glow {
          position: absolute;
          top: 59.5%;
          left: 58.7%;
          width: 8px;
          height: 8px;
          background: #00d2ff;
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
          animation: hand-jitter 0.22s infinite linear;
        }
        .robot-finger-glow {
          position: absolute;
          top: 51.5%;
          left: 61.5%;
          width: 6px;
          height: 6px;
          background: #00d2ff;
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
          animation: hand-jitter 0.28s infinite linear;
        }
        .glass-card {
          width: 100%;
          max-width: 400px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .login-label {
          color: #334155;
          font-weight: 500;
          font-size: 0.82rem;
          margin-bottom: 4px;
        }
        .login-input {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-size: 0.88rem !important;
          transition: all 0.2s ease !important;
        }
        .login-input:focus {
          border-color: #84cc16 !important;
          box-shadow: 0 0 0 2px rgba(132, 204, 22, 0.25) !important;
          outline: none !important;
        }
        .login-input::placeholder {
          color: #94a3b8 !important;
        }
        .lime-link {
          color: #65a30d;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }
        .lime-link:hover {
          color: #4d7c0f;
          text-decoration: underline;
        }
        .lime-link:focus,
        .lime-link:active {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .btn-lime {
          background-color: #84cc16 !important;
          color: #0f172a !important;
          font-weight: 600 !important;
          padding: 10px 14px !important;
          border-radius: 8px !important;
          border: none !important;
          transition: all 0.2s ease !important;
          width: 100%;
        }
        .btn-lime:hover:not(:disabled) {
          background-color: #65a30d !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(132, 204, 22, 0.25) !important;
        }
        .btn-lime:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      </style>

      <div class="glass-card p-4 animate-fade-in">
        <!-- Logo -->
        <div
          class="d-flex align-items-center justify-content-center mb-3"
          style="font-size: 1.5rem; font-weight: 800;"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="me-2"
            style="color: #65a30d;"
          >
            <!-- Open Rounded Box Container -->
            <path
              d="M 14 5 H 18 C 19.66 5 21 6.34 21 8 V 16 C 21 17.66 19.66 19 18 19 H 10 C 8.34 19 7 17.66 7 16 V 15"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />

            <!-- Large Sparkle Star -->
            <path
              d="M 9 3.5 Q 9 7 12.5 7 Q 9 7 9 10.5 Q 9 7 5.5 7 Q 9 7 9 3.5 Z"
              fill="currentColor"
              stroke="none"
            />

            <!-- Left-Top Sparkle Star -->
            <path
              d="M 4 3.5 Q 4 5.5 6 5.5 Q 4 5.5 4 7.5 Q 4 5.5 2 5.5 Q 4 5.5 4 3.5 Z"
              fill="currentColor"
              stroke="none"
            />

            <!-- Left-Bottom Sparkle Star -->
            <path
              d="M 5 10 Q 5 12 7 12 Q 5 12 5 14 Q 5 12 3 12 Q 5 12 5 10 Z"
              fill="currentColor"
              stroke="none"
            />

            <!-- "AI" text inside the box -->
            <text
              x="14"
              y="14"
              text-anchor="middle"
              font-size="6.5"
              font-weight="900"
              font-family="'Outfit', 'Segoe UI', sans-serif"
              stroke="none"
              fill="currentColor"
            >
              AI
            </text>
          </svg>
          <span style="color: #65a30d; letter-spacing: -0.5px;">AI</span
          ><span style="color: #0f172a; letter-spacing: -0.5px;">Training System</span>
        </div>

        <!-- Title -->
        <h3 class="fw-bold text-center text-dark mb-1" style="font-size: 1.4rem;">
          Forgot Password?
        </h3>
        <p class="text-center mb-3" style="color: #64748b; font-size: 0.85rem;">
          No worries, we'll send you recovery instructions.
        </p>

        <form (ngSubmit)="onSubmit()" #forgotForm="ngForm">
          <div class="mb-3">
            <label for="email" class="login-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-control login-input"
              placeholder="Enter your email"
              [(ngModel)]="email"
              required
              email
            />
          </div>

          <button
            type="submit"
            class="btn btn-lime w-100 mb-2"
            [disabled]="isLoading || !forgotForm.form.valid"
          >
            Send Reset Code
          </button>

          <div class="text-center mt-3">
            <a routerLink="/login" class="lime-link small">
              <i class="bi bi-arrow-left me-1"></i> Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  email = '';
  isLoading = false;

  translateX = 0;
  translateY = 0;

  onMouseMove(event: MouseEvent) {
    const x = (event.clientX / window.innerWidth - 0.5) * 25;
    const y = (event.clientY / window.innerHeight - 0.5) * 25;
    this.translateX = -x;
    this.translateY = -y;
  }

  onSubmit() {
    if (!this.email) return;

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.toastr.success('Verification code sent! Please check your email.');
        this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || 'Failed to send reset code. Please verify your email.',
        );
        this.isLoading = false;
      },
    });
  }
}
