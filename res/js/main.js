import * as THREE from "three";


// AUDIO
let battleAudio = new Audio('./res/audio/battle-sound.mp3');
let bossWelcomeRoundAudio = new Audio('./res/audio/boss-round-welcome-sound.mp3');
let dictionaryBgAudio = new Audio('./res/audio/dictionary-bg-sound.mp3');
let openingBgAudio = new Audio('./res/audio/opening-bg-sound.mp3');

battleAudio.volume = 0.25;
bossWelcomeRoundAudio.volume = 0.6;
dictionaryBgAudio.volume = 0.2;
openingBgAudio.volume = 0.3;