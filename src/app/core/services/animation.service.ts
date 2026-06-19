import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  /**
   * High performance number count-up animation utilizing requestAnimationFrame
   */
  animateNumber(start: number, end: number, duration: number, callback: (v: number) => void): void {
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad formula for smooth decelerating
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(start + (end - start) * easeProgress);

      callback(currentValue);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        callback(end);
      }
    };

    requestAnimationFrame(update);
  }

  /**
   * Utility to stagger adding an active class to a list of elements
   */
  staggerClass(elements: Element[], className: string, delayMs: number): void {
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add(className);
      }, index * delayMs);
    });
  }

  /**
   * Helper to perform a full page curtain/morph transition
   */
  performMorphTransition(overlaySelector: string, redirectCallback: () => void): void {
    const overlay = document.querySelector(overlaySelector);
    if (overlay) {
      overlay.classList.add('active');
      setTimeout(() => {
        redirectCallback();
      }, 800); // matches the CSS transition delay of .login-transition-overlay
    } else {
      redirectCallback();
    }
  }
}
