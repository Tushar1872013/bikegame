export class Menu {
  constructor() {
    this.startScreen = document.querySelector('#start-screen');
    this.startButton = document.querySelector('#start-button');
    this.title = document.querySelector('#start-title');
    this.subtitle = document.querySelector('#start-subtitle');
    this.controls = document.querySelector('#start-controls');
    this.loading = document.querySelector('#loading');
    this.loadingStatus = document.querySelector('#loading-status');
  }

  onStart(callback) {
    this.startButton.addEventListener('click', callback);
  }

  showStartScreen() {
    this.startScreen.classList.remove('hidden');
  }

  hideStartScreen() {
    this.startScreen.classList.add('hidden');
  }

  setLoading(text) {
    this.loadingStatus.textContent = text;
  }

  hideLoading() {
    this.loading.classList.add('hidden');
  }
}
