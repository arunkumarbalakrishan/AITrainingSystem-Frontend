import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CertificateService } from '../../../core/services/certificate.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <div class="mb-4">
        <h3 class="fw-bold mb-1">My Certificates</h3>
        <p class="text-muted mb-0">Your earned credentials and achievements</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <!-- Certificate Cards -->
      <div *ngIf="!loading" class="row g-4">
        <div class="col-md-6 col-xl-4" *ngFor="let cert of certificates; let i = index">
          <div class="aws-cert-card h-100 d-flex flex-column position-relative">
            <!-- Badge Graphic (Hexagon) -->
            <div class="d-flex justify-content-center mb-4 mt-2">
              <div class="cert-hexagon">
                <div
                  class="hex-content d-flex flex-column align-items-center justify-content-center h-100 text-center"
                  *ngIf="getHexagonData(cert.courseName) as hexData"
                >
                  <!-- AWS Style -->
                  <ng-container *ngIf="hexData.isAws">
                    <div class="d-flex flex-column align-items-center mb-2">
                      <div class="d-flex align-items-center">
                        <span
                          class="text-white fw-bold me-1"
                          style="font-size: 1.1rem; letter-spacing: -0.5px;"
                          >aws</span
                        >
                        <div
                          class="bg-warning rounded-1 d-flex align-items-center justify-content-center"
                          style="width: 12px; height: 12px;"
                        >
                          <i
                            class="bi bi-check text-white"
                            style="font-size: 0.8rem; line-height: 1;"
                          ></i>
                        </div>
                      </div>
                      <span
                        class="text-white"
                        style="font-size: 0.6rem; letter-spacing: 0.5px; margin-top: -2px;"
                        >certified</span
                      >
                    </div>
                    <span
                      class="fw-bold text-white lh-sm"
                      style="font-size: 1.05rem; max-width: 100px; text-wrap: balance;"
                    >
                      {{ hexData.title }}
                    </span>
                    <span
                      class="text-white mt-3 fw-bold text-uppercase"
                      style="font-size: 0.55rem; letter-spacing: 1.5px;"
                      >{{ hexData.subtitle }}</span
                    >
                  </ng-container>

                  <!-- Default Style -->
                  <ng-container *ngIf="!hexData.isAws">
                    <div class="d-flex align-items-center mb-2 mt-2">
                      <span
                        class="text-white fw-bold me-1"
                        style="font-size: 1.1rem; letter-spacing: -0.5px;"
                        >{{ hexData.issuer }}</span
                      >
                      <i
                        class="bi bi-patch-check-fill text-warning"
                        style="font-size: 0.95rem;"
                      ></i>
                    </div>
                    <span
                      class="text-white fw-bold text-uppercase mt-3"
                      style="font-size: 0.75rem; letter-spacing: 2px;"
                      >{{ hexData.subtitle }}</span
                    >
                  </ng-container>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-grow-1 text-start px-2 mt-3">
              <h5
                class="fw-bold text-dark mb-2"
                style="font-size: 1.15rem; letter-spacing: -0.3px;"
              >
                {{ cert.courseName }}
              </h5>
              <p
                class="text-muted mb-0"
                style="font-size: 0.95rem; line-height: 1.5; color: #475569 !important;"
              >
                Unlock new career possibilities with this AI certification.
              </p>
            </div>

            <!-- Footer Actions -->
            <div class="d-flex justify-content-end align-items-center mt-4 px-2">
              <button
                (click)="downloadCert(cert)"
                class="btn rounded-circle shadow-sm d-flex align-items-center justify-content-center download-btn"
                title="Download PDF"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  class="bi bi-download"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
                  />
                  <path
                    d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!loading && certificates.length === 0"
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
          <!-- Diploma/Certificate Illustration -->
          <rect x="40" y="40" width="160" height="110" rx="4" fill="#cbd5e1" opacity="0.3" />
          <rect
            x="50"
            y="50"
            width="140"
            height="90"
            fill="white"
            stroke="var(--primary-color)"
            stroke-width="4"
          />
          <path
            d="M70 70H170M70 90H140"
            stroke="var(--primary-color)"
            stroke-width="4"
            stroke-linecap="round"
          />
          <circle cx="150" cy="110" r="15" fill="#f59e0b" />
          <path d="M145 125L140 145L150 140L160 145L155 125" fill="#f59e0b" />
        </svg>
        <h3 class="fw-bold mb-2">No Certificates Yet</h3>
        <p class="text-muted mb-4" style="max-width: 450px;">
          Complete a course and pass all requirements to earn your first certificate!
        </p>
        <a
          routerLink="/explore"
          class="btn btn-primary px-5 py-3 fw-semibold shadow-sm"
          style="border-radius: 30px; font-size: 1.1rem; transition: transform 0.2s;"
        >
          Find a Course
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .aws-cert-card {
        background: #f4f5f7 !important;
        border: none !important;
        border-radius: 12px;
        padding: 2.5rem 1rem 2rem 1rem;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .aws-cert-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
      }
      .cert-hexagon {
        width: 130px;
        height: 150px;
        background: #cbd5e1;
        position: relative;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .cert-hexagon::before {
        content: '';
        position: absolute;
        top: 6px;
        left: 6px;
        right: 6px;
        bottom: 6px;
        background: #232f3e;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        z-index: 0;
      }
      .hex-content {
        z-index: 1;
        position: relative;
        width: 100%;
      }
      .download-btn {
        width: 45px;
        height: 45px;
        background: #ffffff !important;
        color: #0f172a !important;
        border: none !important;
      }
      .download-btn:hover {
        background: #ffffff !important;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      }
      .aws-cert-card h5,
      .aws-cert-card svg.text-dark {
        color: #0f172a !important;
      }
    `,
  ],
})
export class MyCertificatesComponent implements OnInit {
  private certService = inject(CertificateService);
  private toastr = inject(ToastrService);

  certificates: any[] = [];
  loading = true;

  getHexagonData(courseName: string): {
    issuer: string;
    title: string;
    subtitle: string;
    isAws: boolean;
  } {
    if (!courseName)
      return { issuer: 'AITraining', title: 'Certificate', subtitle: 'CERTIFICATE', isAws: false };

    const name = courseName.toLowerCase();

    if (name.includes('aws')) {
      let title = courseName.replace(/AWS Certified\s*/i, '').trim();
      if (title.length > 25) title = title.substring(0, 25) + '...';
      return { issuer: 'aws', title: title || 'AWS Cert', subtitle: 'FOUNDATIONAL', isAws: true };
    }

    let title = courseName;
    if (title.length > 25) title = title.substring(0, 25) + '...';
    return { issuer: 'AITraining', title: title, subtitle: 'CERTIFICATE', isAws: false };
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

  ngOnInit() {
    this.certService.getMyCertificates().subscribe({
      next: (res: any) => {
        let certs = res?.data ?? res ?? [];
        if (!Array.isArray(certs)) {
          if (certs && Array.isArray(certs.items)) {
            certs = certs.items;
          } else {
            certs = [];
          }
        }
        this.certificates = certs;
        this.loading = false;
      },
      error: () => {
        this.certificates = [];
        this.loading = false;
      },
    });
  }

  downloadCert(cert: any) {
    this.certService.downloadCertificate(cert.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${cert.certificateNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        this.toastr.success('Certificate downloaded!');
      },
      error: () => {
        this.toastr.error('Download failed');
      },
    });
  }
}
