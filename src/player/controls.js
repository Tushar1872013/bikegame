export class Controls {
  constructor() {
    this.keys = new Set();
    this.touch = { throttle: 0, steer: 0, brake: false, nitro: false };
    window.addEventListener('keydown', (event) => this.keys.add(event.code));
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    this.bindTouchControls();
  }

  bindTouchControls() {
    const joystick = document.querySelector('#joystick');
    const knob = joystick?.querySelector('span');
    const brake = document.querySelector('[data-action="brake"]');
    const nitro = document.querySelector('[data-action="nitro"]');
    let active = false;
    let origin = { x: 0, y: 0 };

    joystick?.addEventListener('pointerdown', (event) => {
      active = true;
      origin = { x: event.clientX, y: event.clientY };
      joystick.setPointerCapture(event.pointerId);
    });
    joystick?.addEventListener('pointermove', (event) => {
      if (!active) return;
      const dx = Math.max(-42, Math.min(42, event.clientX - origin.x));
      const dy = Math.max(-42, Math.min(42, event.clientY - origin.y));
      this.touch.steer = dx / 42;
      this.touch.throttle = -dy / 42;
      if (knob) knob.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    joystick?.addEventListener('pointerup', () => {
      active = false;
      this.touch.steer = 0;
      this.touch.throttle = 0;
      if (knob) knob.style.transform = 'translate(0, 0)';
    });

    const hold = (element, key) => {
      element?.addEventListener('pointerdown', () => { this.touch[key] = true; });
      element?.addEventListener('pointerup', () => { this.touch[key] = false; });
      element?.addEventListener('pointercancel', () => { this.touch[key] = false; });
    };
    hold(brake, 'brake');
    hold(nitro, 'nitro');
  }

  read() {
    const throttle = Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) - Number(this.keys.has('KeyS') || this.keys.has('ArrowDown'));
    const steer = Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft')) - Number(this.keys.has('KeyD') || this.keys.has('ArrowRight'));
    return {
      throttle: throttle || this.touch.throttle,
      steer: steer || this.touch.steer,
      brake: this.keys.has('Space') || this.touch.brake,
      nitro: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.touch.nitro
    };
  }
}
