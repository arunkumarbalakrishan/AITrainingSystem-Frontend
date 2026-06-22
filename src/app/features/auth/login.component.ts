import {
  Component,
  inject,
  ChangeDetectorRef,
  NgZone,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnimationService } from '../../core/services/animation.service';
import { ToastrService } from 'ngx-toastr';
import { LoginMascotComponent } from './login-mascot.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, LoginMascotComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private animationService = inject(AnimationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private route = inject(ActivatedRoute);

  // Signals for Mascot & Parallax State tracking
  typingPassword = signal(false);
  sadState = signal(false);
  celebrate = signal(false);
  mouseX = signal(0);
  mouseY = signal(0);
  skeletonLoading = signal(true);

  // Form validation state computed signal
  formValid = computed(() => {
    if (this.isRegistering) {
      return this.registerForm.valid;
    } else {
      return this.loginForm.valid;
    }
  });

  isRegistering = false;
  loading = false;
  showPassword = false;
  showRegisterPassword = false;

  private mouseMoveListener?: (e: MouseEvent) => void;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['Student', [Validators.required]],
  });

  ngOnInit(): void {
    // Force remove active transition overlay class on init/reload to prevent black screen lock
    const overlay = document.querySelector('.login-transition-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }

    // Listen to query parameters to toggle between login and registration mode
    this.route.queryParams.subscribe((params) => {
      this.isRegistering = params['mode'] === 'register';
      this.sadState.set(false);
      this.cdr.detectChanges();
    });

    // Simulate skeleton loading time (e.g. 200ms)
    setTimeout(() => {
      this.skeletonLoading.set(false);
      this.cdr.detectChanges();
    }, 200);

    // Track mouse moves outside Angular zone for high performance (60 FPS)
    this.ngZone.runOutsideAngular(() => {
      this.mouseMoveListener = (event: MouseEvent) => {
        // Calculate normalized values from -0.5 to 0.5 relative to window center
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;

        // Update signals. This does not trigger Angular global change detection because it's outside zone
        this.mouseX.set(x);
        this.mouseY.set(y);
      };
      window.addEventListener('mousemove', this.mouseMoveListener);
    });
  }

  ngOnDestroy(): void {
    if (this.mouseMoveListener) {
      window.removeEventListener('mousemove', this.mouseMoveListener);
    }
  }

  clearSadState(): void {
    if (this.sadState()) {
      this.sadState.set(false);
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleRegister() {
    const nextMode = this.isRegistering ? 'login' : 'register';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: nextMode },
      queryParamsHandling: 'merge',
    });
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.sadState.set(false);
    this.cdr.detectChanges();

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.celebrate.set(true);
        this.cdr.detectChanges();
        this.toastr.success('Welcome back to AITraining!');

        // Trigger morph transition before navigating
        this.animationService.performMorphTransition('.login-transition-overlay', () => {
          this.ngZone.run(() => {
            this.router.navigate(['/dashboard']);
          });
        });
      },
      error: (err) => {
        this.loading = false;
        this.sadState.set(true);
        this.cdr.detectChanges();
        const msg = err.error?.message || 'Login failed. Please check your credentials.';
        this.toastr.error(msg);
      },
    });
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.sadState.set(false);
    this.cdr.detectChanges();

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toastr.success('Account created successfully! Please sign in.');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { mode: 'login' },
          queryParamsHandling: 'merge',
        });
        this.cdr.detectChanges();
        // Prefill email
        this.loginForm.patchValue({ email: this.registerForm.value.email });
      },
      error: (err) => {
        this.loading = false;
        this.sadState.set(true);
        this.cdr.detectChanges();
        const msg = err.error?.message || 'Registration failed. Try a different email.';
        this.toastr.error(msg);
      },
    });
  }

  onGoogleLogin() {
    this.loading = true;
    this.sadState.set(false);
    this.cdr.detectChanges();

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.loading = false;
        this.celebrate.set(true);
        this.cdr.detectChanges();
        this.toastr.success('Welcome back to AITraining!');

        // Trigger morph transition before navigating
        this.animationService.performMorphTransition('.login-transition-overlay', () => {
          this.ngZone.run(() => {
            this.router.navigate(['/dashboard']);
          });
        });
      },
      error: (err) => {
        this.loading = false;
        this.sadState.set(true);
        this.cdr.detectChanges();
        console.error('Google Login Error details:', err);
        console.error('Error Body:', err.error);

        let msg = 'Google Login failed. Please try again.';
        if (err.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error.message) {
            msg = err.error.message;
          } else if (err.error.detail) {
            msg = err.error.detail;
          } else {
            msg = JSON.stringify(err.error);
          }
        } else if (err.message) {
          msg = err.message;
        }

        this.toastr.error(msg);
      },
    });
  }
}
