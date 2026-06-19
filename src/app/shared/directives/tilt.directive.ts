import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective {
  @Input() maxTilt = 10; // Max tilt in degrees
  @Input() scale = 1.02; // Scale on hover

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.1s ease-out');
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
    this.renderer.setStyle(this.el.nativeElement, 'transform-style', 'preserve-3d');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();

    // Calculate cursor position relative to center of element
    const x = event.clientX - rect.left; // x position within the element
    const y = event.clientY - rect.top; // y position within the element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt percentage (-1 to 1)
    const tiltX = (y - centerY) / centerY;
    const tiltY = (centerX - x) / centerX;

    // Apply max tilt
    const rotateX = tiltX * this.maxTilt;
    const rotateY = tiltY * this.maxTilt;

    // Apply the transform
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${this.scale}, ${this.scale}, ${this.scale})`,
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    // Reset the transform smoothly when mouse leaves
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    );

    // Restore fast transition for next hover
    setTimeout(() => {
      this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.1s ease-out');
    }, 400);
  }
}
