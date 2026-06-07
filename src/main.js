import './styles/style.css';
import { Game } from './core/game.js';

const game = new Game(document.querySelector('#game'));
game.start();
