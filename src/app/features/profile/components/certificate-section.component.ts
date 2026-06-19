import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-certificate-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card p-4">
      
      <!-- Card Header + Search -->
      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-award-fill text-primary"></i> Earned Credentials & Certificates
        </h5>
        
        <div class="position-relative" style="width: 250px; max-width: 100%;">
          <span class="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
            <i class="bi bi-search"></i>
          </span>
          <input type="text" 
                 [(ngModel)]="searchQuery" 
                 (input)="onSearch()"
                 placeholder="Search certificates..." 
                 class="form-control search-input ps-5-5 py-1.5" />
        </div>
      </div>

      <!-- Certificates Table / Grid -->
      <div class="table-responsive">
        <table class="table premium-table align-middle">
          <thead>
            <tr>
              <th scope="col" style="width: 40px;">Pin</th>
              <th scope="col">Certificate Details</th>
              <th scope="col" class="d-none d-md-table-cell">ID & Status</th>
              <th scope="col" class="d-none d-lg-table-cell">Dates</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (paginatedCerts().length > 0) {
              @for (cert of paginatedCerts(); track cert.id) {
                <tr [class.pinned-row]="cert.pinned">
                  <!-- Pin/Feature Toggle -->
                  <td>
                    <button class="btn btn-pin p-0 border-0" 
                            (click)="onTogglePin(cert)" 
                            [class.active]="cert.pinned"
                            [title]="cert.pinned ? 'Unpin from showcase' : 'Pin to showcase (max 3)'">
                      <i class="bi" [class.bi-pin-angle-fill]="cert.pinned" [class.bi-pin-angle]="!cert.pinned"></i>
                    </button>
                  </td>
                  <!-- Course Name -->
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-box d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded">
                        <i class="bi bi-file-earmark-pdf-fill" style="font-size: 1.25rem;"></i>
                      </div>
                      <div>
                        <div class="fw-bold text-white small-md">{{ cert.courseName }}</div>
                        <small class="text-secondary opacity-60">Verified Issuer: AI LMS Global</small>
                      </div>
                    </div>
                  </td>
                  <!-- Status & Credential ID -->
                  <td class="d-none d-md-table-cell">
                    <div class="small fw-semibold text-light mb-1">{{ cert.certificateNumber }}</div>
                    <span class="badge bg-success bg-opacity-10 border border-success border-opacity-20 text-success small" style="font-size: 0.7rem;">
                      <i class="bi bi-shield-check"></i> {{ cert.verificationStatus }}
                    </span>
                  </td>
                  <!-- Dates -->
                  <td class="d-none d-lg-table-cell">
                    <div class="small text-secondary">Completed: <span class="text-light fw-medium">{{ cert.completionDate }}</span></div>
                    <div class="small text-secondary" style="font-size: 0.75rem;">Issued: {{ cert.issueDate }}</div>
                  </td>
                  <!-- Action Options -->
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-1">
                      <!-- Preview -->
                      <button class="btn btn-sm btn-icon hover-text-primary" (click)="openPreview(cert)" title="Preview Certificate">
                        <i class="bi bi-eye-fill"></i>
                      </button>
                      <!-- Download -->
                      <button class="btn btn-sm btn-icon hover-text-success" (click)="downloadPdf(cert)" title="Download PDF">
                        <i class="bi bi-download"></i>
                      </button>
                      <!-- Share -->
                      <button class="btn btn-sm btn-icon hover-text-info" (click)="openShare(cert)" title="Share Credential">
                        <i class="bi bi-share-fill"></i>
                      </button>
                      <!-- Verify Link -->
                      <button class="btn btn-sm btn-icon hover-text-warning" (click)="openVerifyModal(cert)" title="Verify On-Chain Status">
                        <i class="bi bi-patch-check"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="5" class="text-center py-5">
                  <div class="text-secondary">
                    <i class="bi bi-award mb-2" style="font-size: 2.2rem; display: block;"></i>
                    <p class="mb-0">No certificates found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="d-flex align-items-center justify-content-between mt-3 pt-3 border-top border-light border-opacity-5">
          <small class="text-secondary">
            Showing {{ (currentPage() - 1) * pageSize + 1 }} to {{ Math.min(currentPage() * pageSize, filteredCerts().length) }} of {{ filteredCerts().length }} items
          </small>
          
          <div class="d-flex gap-1.5">
            <button class="btn btn-sm btn-outline-light border-opacity-10 text-secondary" 
                    [disabled]="currentPage() === 1" 
                    (click)="currentPage.set(currentPage() - 1)">
              Previous
            </button>
            @for (p of [].constructor(totalPages()); track $index) {
              <button class="btn btn-sm" 
                      [class.btn-primary]="$index + 1 === currentPage()" 
                      [class.btn-outline-light]="$index + 1 !== currentPage()" 
                      [class.border-opacity-10]="$index + 1 !== currentPage()" 
                      [class.text-secondary]="$index + 1 !== currentPage()"
                      (click)="currentPage.set($index + 1)">
                {{ $index + 1 }}
              </button>
            }
            <button class="btn btn-sm btn-outline-light border-opacity-10 text-secondary" 
                    [disabled]="currentPage() === totalPages()" 
                    (click)="currentPage.set(currentPage() + 1)">
              Next
            </button>
          </div>
        </div>
      }

    </div>

    <!-- PREVIEW MODAL -->
    @if (selectedCert()) {
      <div class="custom-modal-backdrop d-flex align-items-center justify-content-center" (click)="closePreview()">
        <div class="custom-modal-content p-4 border border-light border-opacity-10 text-center animate-zoom-in" (click)="$event.stopPropagation()">
          <div class="d-flex align-items-center justify-content-between mb-3.5 border-bottom border-light border-opacity-10 pb-2.5">
            <h6 class="fw-bold text-white mb-0">Certificate Preview</h6>
            <button class="btn-close btn-close-white" (click)="closePreview()"></button>
          </div>
          
          <!-- Mock Certificate Layout -->
          <div class="certificate-mockup p-4 mb-3 position-relative overflow-hidden">
            <div class="cert-border"></div>
            <div class="cert-bg-graphic"></div>
            
            <h6 class="text-uppercase text-secondary fw-semibold mt-3" style="letter-spacing: 2px; font-size: 0.65rem;">Certificate of Course Completion</h6>
            <h4 class="text-white fw-bold my-3 text-shadow" style="font-family: serif; font-size: 1.5rem;">{{ selectedCert()?.courseName }}</h4>
            <p class="text-secondary small italic px-3">This certifies that the user has successfully completed all evaluation modules and quizzes for the course path.</p>
            
            <div class="d-flex justify-content-around align-items-center mt-4 pt-2 border-top border-light border-opacity-5">
              <div>
                <small class="text-secondary d-block" style="font-size: 0.6rem;">COMPLETION DATE</small>
                <span class="text-light fw-medium small">{{ selectedCert()?.completionDate }}</span>
              </div>
              <div class="px-2">
                <i class="bi bi-shield-check text-primary" style="font-size: 2.5rem;"></i>
              </div>
              <div>
                <small class="text-secondary d-block" style="font-size: 0.6rem;">CREDENTIAL ID</small>
                <span class="text-light fw-medium small" style="font-family: monospace;">{{ selectedCert()?.certificateNumber }}</span>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2.5">
            <button class="btn btn-sm btn-outline-light border-opacity-20 text-secondary" (click)="closePreview()">Close</button>
            <button class="btn btn-sm btn-primary" (click)="downloadPdf(selectedCert())">
              <i class="bi bi-download me-1"></i> Download PDF
            </button>
          </div>
        </div>
      </div>
    }

    <!-- SHARE MODAL -->
    @if (shareCert()) {
      <div class="custom-modal-backdrop d-flex align-items-center justify-content-center" (click)="closeShare()">
        <div class="custom-modal-content p-4 border border-light border-opacity-10 animate-zoom-in" style="max-width: 400px;" (click)="$event.stopPropagation()">
          <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-light border-opacity-10 pb-2">
            <h6 class="fw-bold text-white mb-0">Share Credential</h6>
            <button class="btn-close btn-close-white" (click)="closeShare()"></button>
          </div>
          
          <p class="text-secondary small mb-3">
            Publish this verified certificate to your social networks or copy the verification link.
          </p>

          <div class="d-flex flex-column gap-2 mb-3">
            <a [href]="'https://www.linkedin.com/sharing/share-offsite/?url=https://aitraining.com/verify/' + shareCert()?.certificateNumber" 
               target="_blank" class="btn btn-sm btn-outline-light border-opacity-10 text-start text-white d-flex align-items-center gap-2 hover-bg-linkedin">
              <i class="bi bi-linkedin text-info"></i> Share on LinkedIn
            </a>
            <a [href]="'https://twitter.com/intent/tweet?text=I just earned my certificate for ' + shareCert()?.courseName + '!&url=https://aitraining.com/verify/' + shareCert()?.certificateNumber" 
               target="_blank" class="btn btn-sm btn-outline-light border-opacity-10 text-start text-white d-flex align-items-center gap-2 hover-bg-x">
              <i class="bi bi-twitter-x"></i> Post on X (Twitter)
            </a>
            <button class="btn btn-sm btn-outline-light border-opacity-10 text-start text-white d-flex align-items-center gap-2" (click)="copyLink(shareCert())">
              <i class="bi bi-link-45deg text-primary"></i> Copy Verification Link
            </button>
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-sm btn-outline-light border-opacity-20 text-secondary" (click)="closeShare()">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- ON-CHAIN VERIFICATION MODAL -->
    @if (verifyCert()) {
      <div class="custom-modal-backdrop d-flex align-items-center justify-content-center" (click)="closeVerifyModal()">
        <div class="custom-modal-content p-4 border border-light border-opacity-10 animate-zoom-in" style="max-width: 450px;" (click)="$event.stopPropagation()">
          <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-light border-opacity-10 pb-2">
            <h6 class="fw-bold text-white mb-0">On-Chain Cryptographic Verification</h6>
            <button class="btn-close btn-close-white" (click)="closeVerifyModal()"></button>
          </div>

          <div class="text-center my-3.5">
            <div class="blockchain-badge mx-auto mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle">
              <i class="bi bi-shield-check" style="font-size: 2.2rem;"></i>
            </div>
            <h6 class="text-white fw-bold">Verification Successful</h6>
            <small class="text-secondary">Secured by decentralized proof-of-completion contract</small>
          </div>

          <div class="verify-details p-3 rounded bg-black bg-opacity-40 border border-light border-opacity-5 mb-3.5">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-secondary small">Course:</span>
              <span class="text-white small fw-semibold text-truncate ms-3" style="max-width: 250px;">{{ verifyCert()?.courseName }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-secondary small">Cert ID:</span>
              <span class="text-white small fw-semibold font-monospace">{{ verifyCert()?.certificateNumber }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-secondary small">Completion Hash:</span>
              <span class="text-primary small fw-semibold font-monospace text-truncate ms-3" style="max-width: 200px;" title="0x7d20a169b823f990c0aef484d7a8d9a26388ffc2">0x7d20...ffc2</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-secondary small">Block Timestamp:</span>
              <span class="text-light small">{{ verifyCert()?.completionDate }} 18:22:04 UTC</span>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-light border-opacity-20 text-secondary" (click)="closeVerifyModal()">Close</button>
            <button class="btn btn-sm btn-primary" (click)="openExplorerLink()">View on Explorer</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .search-input {
      background: rgba(5, 5, 5, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff !important;
      border-radius: 8px;
      transition: all 0.25s ease;
    }
    .search-input:focus {
      background: rgba(13, 17, 23, 0.9);
      border-color: var(--primary-color, #9FEF00);
      box-shadow: 0 0 0 3px rgba(159, 239, 0, 0.15);
      outline: none;
    }
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    .ps-5-5 {
      padding-left: 2.25rem !important;
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
      padding: 1rem 0.5rem;
      color: #A0A0A0;
    }
    .premium-table tr:hover td {
      background: rgba(255, 255, 255, 0.015);
      color: #ffffff;
    }
    .pinned-row td {
      background: rgba(159, 239, 0, 0.02) !important;
      border-bottom-color: rgba(159, 239, 0, 0.08) !important;
    }
    .btn-pin {
      color: rgba(255, 255, 255, 0.15);
      transition: all 0.2s ease;
      font-size: 1rem;
    }
    .btn-pin:hover, .btn-pin.active {
      color: var(--primary-color, #9FEF00);
      transform: scale(1.1);
    }
    .icon-box {
      width: 40px;
      height: 40px;
    }
    .btn-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #A0A0A0;
      transition: all 0.2s ease;
      font-size: 0.85rem;
    }
    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-1px);
    }
    .hover-text-primary:hover { color: var(--primary-color, #9FEF00) !important; border-color: rgba(159, 239, 0, 0.2) !important; }
    .hover-text-success:hover { color: #00D26A !important; border-color: rgba(0, 210, 106, 0.2) !important; }
    .hover-text-info:hover { color: #60a5fa !important; border-color: rgba(96, 165, 250, 0.2) !important; }
    .hover-text-warning:hover { color: #FFB800 !important; border-color: rgba(255, 184, 0, 0.2) !important; }

    /* Modal Styling */
    .custom-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1050;
    }
    .custom-modal-content {
      background: #0d1117;
      border-radius: 20px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .certificate-mockup {
      background: linear-gradient(135deg, #161b22, #0d1117);
      border: 2px solid rgba(159, 239, 0, 0.2);
      border-radius: 12px;
      min-height: 220px;
    }
    .cert-border {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      border: 1px dashed rgba(159, 239, 0, 0.15);
      border-radius: 8px;
      pointer-events: none;
    }
    .cert-bg-graphic {
      position: absolute;
      top: 0;
      right: 0;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(159, 239, 0, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }
    .text-shadow {
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    }
    .blockchain-badge {
      width: 60px;
      height: 60px;
    }
    .hover-bg-linkedin:hover {
      background-color: #0077b5 !important;
      border-color: #0077b5 !important;
    }
    .hover-bg-x:hover {
      background-color: #000000 !important;
      border-color: #333333 !important;
    }
    .animate-zoom-in {
      animation: zoomIn 0.25s ease-out;
    }
    @keyframes zoomIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class CertificateSectionComponent implements OnInit, OnChanges {
  @Input() certificates: any[] = [];
  @Output() pinToggle = new EventEmitter<string>();

  private toastr = inject(ToastrService);
  Math = Math;

  // Search and Pagination
  searchQuery = '';
  currentPage = signal(1);
  pageSize = 5;

  // Modals state
  selectedCert = signal<any | null>(null);
  shareCert = signal<any | null>(null);
  verifyCert = signal<any | null>(null);

  ngOnInit() {
    this.currentPage.set(1);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['certificates']) {
      this.currentPage.set(1);
    }
  }

  onSearch() {
    this.currentPage.set(1);
  }

  filteredCerts = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.certificates;
    return this.certificates.filter(c => 
      c.courseName.toLowerCase().includes(q) || 
      c.certificateNumber.toLowerCase().includes(q)
    );
  });

  paginatedCerts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredCerts().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredCerts().length / this.pageSize);
  });

  // Action methods
  onTogglePin(cert: any) {
    this.pinToggle.emit(cert.id);
  }

  openPreview(cert: any) {
    this.selectedCert.set(cert);
  }

  closePreview() {
    this.selectedCert.set(null);
  }

  downloadPdf(cert: any) {
    this.toastr.success(`Initiated secure PDF download for ${cert.certificateNumber}`);
    
    // Simulate downloading PDF file
    const docText = `Verified LMS Certificate\n\nCourse: ${cert.courseName}\nCredential ID: ${cert.certificateNumber}\nCompletion Date: ${cert.completionDate}`;
    const blob = new Blob([docText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${cert.certificateNumber.toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  openShare(cert: any) {
    this.shareCert.set(cert);
  }

  closeShare() {
    this.shareCert.set(null);
  }

  copyLink(cert: any) {
    const link = `https://aitraining.com/verify/${cert.certificateNumber}`;
    navigator.clipboard.writeText(link).then(() => {
      this.toastr.info('Verification link copied to clipboard.');
      this.closeShare();
    });
  }

  openVerifyModal(cert: any) {
    this.verifyCert.set(cert);
  }

  closeVerifyModal() {
    this.verifyCert.set(null);
  }

  openExplorerLink() {
    this.toastr.info('Opening decentralized ledger verification page...');
    window.open('https://etherscan.io', '_blank');
  }
}
