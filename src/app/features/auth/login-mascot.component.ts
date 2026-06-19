import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-mascot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-mascot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginMascotComponent {
  typingPassword = input<boolean>(false);
  formValid = input<boolean>(false);
  sadState = input<boolean>(false);
  celebrate = input<boolean>(false);
  mouseX = input<number>(0);
  mouseY = input<number>(0);

  // Compute pupil translate style based on normalized mouse coordinates
  pupilStyle = computed(() => {
    const x = this.mouseX() * 12; // shift up to 12px
    const y = this.mouseY() * 8; // shift up to 8px
    return `translate(${x}px, ${y}px)`;
  });

  // Background layer: slow parallax
  bgParallaxStyle = computed(() => {
    const x = this.mouseX() * 10;
    const y = this.mouseY() * 10;
    return `translate3d(${x}px, ${y}px, 0)`;
  });

  // Middle layer: medium parallax
  middleParallaxStyle = computed(() => {
    const x = this.mouseX() * 22;
    const y = this.mouseY() * 22;
    return `translate3d(${x}px, ${y}px, 0)`;
  });

  // Foreground layer: fast parallax
  fgParallaxStyle = computed(() => {
    const x = this.mouseX() * 45;
    const y = this.mouseY() * 45;
    return `translate3d(${x}px, ${y}px, 0)`;
  });
}
