import React, { useEffect, useMemo, useRef, useState } from 'react';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';
import ShooterThreeScene from './ShooterThreeScene.jsx';
import {
  defaultShooterConfig,
  planetShooterConfig,
  shooterSprites,
  upgradeTypes,
  weaponTypes,
} from './planetShooterConfig.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const hit = (a, b) => distance(a, b) <= (a.r || 0) + (b.r || 0);
const roundStages = [
  { id: 'easy', label: 'Dễ', title: 'Scout Contact', kills: 7, speed: 0.72, spawn: 1.35, hazard: 0.45, boss: false },
  { id: 'normal', label: 'Trung bình', title: 'Elite Ambush', kills: 10, speed: 0.88, spawn: 1.08, hazard: 0.72, boss: false },
  { id: 'hard', label: 'Khó', title: 'Boss Arrival', kills: 13, speed: 1.04, spawn: 0.9, hazard: 0.95, boss: true },
];

const enemyShotColors = {
  scout: '#34d399',
  scoutAlt: '#7dd3fc',
  blade: '#f59e0b',
  heavy: '#ef4444',
  boss: '#c084fc',
};

const getShotColor = (config, kind, variant) => {
  const colors = config.shotColors || enemyShotColors;
  if (kind === 'boss') return colors.boss || enemyShotColors.boss;
  if (kind === 'heavy') return colors.heavy || enemyShotColors.heavy;
  if (kind === 'blade') return colors.blade || enemyShotColors.blade;
  if (variant === 'alt') return colors.scoutAlt || enemyShotColors.scoutAlt;
  return colors.scout || enemyShotColors.scout;
};

const getPlayerShotColor = (config, weaponId, offset = 0) => {
  if (weaponId === 'seeker') return '#fde047';
  if (weaponId === 'triBeam') {
    if (offset < 0) return config.palette[0] || '#38bdf8';
    if (offset > 0) return config.palette[1] || '#a78bfa';
    return '#f8fafc';
  }
  return config.accent || '#a7f3d0';
};

const initialStars = (width, height) =>
  Array.from({ length: 96 }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: 0.35 + Math.random() * 1.6,
    s: index % 9 === 0 ? 2.2 : 1 + Math.random() * 1.4,
  }));

const makeInitialState = (width, height, config = defaultShooterConfig, loadout = {}) => ({
  ship: {
    x: width * 0.17,
    y: height * 0.5,
    vx: 0,
    vy: 0,
    r: 24,
    hp: 100,
    shield: loadout.upgrade === 'shield' ? 82 : 48,
    invincible: 0,
    power: loadout.upgrade === 'overdrive' ? 2 : 1,
    powerTimer: loadout.upgrade === 'overdrive' ? 12 : 0,
    engineBonus: loadout.upgrade === 'engine' ? 1.16 : 1,
  },
  weaponId: loadout.weaponId || 'pulse',
  bullets: [],
  enemyShots: [],
  enemies: [],
  hazards: [],
  powerups: [],
  sparks: [],
  stars: initialStars(width, height),
  boss: null,
  round: 0,
  roundKills: 0,
  roundTransition: null,
  animeEnemy: null,
  score: 0,
  kills: 0,
  combo: 1,
  time: config.mission?.timeLimit || 82,
  wave: 0,
  cooldown: 0,
  spawnTimer: 0,
  hazardTimer: 1.8,
  powerTimer: 8,
  bossSpawned: false,
  shake: 0,
  phase: 'briefing',
  rank: null,
});

const addSparks = (state, x, y, color, count = 12) => {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 70 + Math.random() * 260;
    state.sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 1.5 + Math.random() * 3.5,
      life: 0.25 + Math.random() * 0.55,
      maxLife: 0.8,
      color,
    });
  }
};

const createAudio = () => {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  const context = new AudioContext();

  const tone = (frequency, duration = 0.08, type = 'sine', gain = 0.035) => {
    if (context.state === 'suspended') context.resume();
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.45), context.currentTime + duration);
    volume.gain.setValueAtTime(gain, context.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  return {
    shoot: () => tone(620, 0.055, 'square', 0.018),
    hit: () => tone(180, 0.09, 'sawtooth', 0.03),
    pickup: () => tone(880, 0.11, 'triangle', 0.032),
    boss: () => tone(96, 0.22, 'sawtooth', 0.04),
    win: () => {
      tone(660, 0.12, 'triangle', 0.035);
      window.setTimeout(() => tone(990, 0.16, 'triangle', 0.035), 120);
    },
    lose: () => tone(72, 0.28, 'sawtooth', 0.045),
    close: () => context.close(),
  };
};

const rankMission = (state, config) => {
  const mission = config.mission || {};
  const hpScore = state.ship.hp + state.ship.shield * 0.5;
  if (state.score >= mission.targetScore * 1.35 && hpScore > 95 && state.combo >= 5) return 'S';
  if (state.score >= mission.targetScore && hpScore > 70) return 'A';
  if (state.score >= mission.targetScore * 0.72) return 'B';
  return 'C';
};

const startRoundTransition = (state, config, nextRound) => {
  const stage = roundStages[nextRound] || roundStages[roundStages.length - 1];
  state.roundTransition = {
    nextRound,
    timer: 2.25,
    title: stage.title,
    label: stage.label,
  };
  state.animeEnemy = {
    x: 1.08,
    y: 0.38 + Math.random() * 0.24,
    r: nextRound === 2 ? 0.16 : 0.11,
    color: nextRound === 2 ? config.bossColor : config.enemyColor,
  };
  state.ship.vx = 900;
  state.ship.vy = 0;
  state.enemies = [];
  state.enemyShots = [];
  state.hazards = [];
  state.powerups = [];
};

const spawnEnemyShots = (state, enemy, config, difficulty) => {
  const angle = Math.atan2(state.ship.y - enemy.y, state.ship.x - enemy.x);
  const baseSpeed = (enemy.kind === 'heavy' ? 150 : enemy.kind === 'blade' ? 165 : 145) * difficulty;
  const pattern = enemy.kind === 'heavy' ? [-0.18, 0.18] : [0];
  const color = getShotColor(config, enemy.kind, enemy.variant);

  pattern.forEach((offset) => {
    const shotAngle = angle + offset;
    state.enemyShots.push({
      x: enemy.x - enemy.r,
      y: enemy.y,
      r: enemy.kind === 'heavy' ? 7 : 5.5,
      vx: Math.cos(shotAngle) * baseSpeed,
      vy: Math.sin(shotAngle) * baseSpeed,
      kind: enemy.kind,
      color,
    });
  });
};

const maybeDropPowerup = (state, enemy) => {
  const baseChance = enemy.kind === 'heavy' ? 0.32 : enemy.kind === 'blade' ? 0.2 : 0.13;
  const assistChance = state.ship.hp < 42 || state.ship.shield < 18 ? 0.1 : 0;
  if (Math.random() > baseChance + assistChance) return;

  let type = 'shield';
  const roll = Math.random();
  if (state.ship.hp < 45 && roll < 0.48) type = 'repair';
  else if (state.ship.shield < 24 && roll < 0.58) type = 'shield';
  else if (roll > 0.78) type = 'overdrive';
  else if (roll > 0.52) type = 'weapon';

  state.powerups.push({
    x: enemy.x,
    y: enemy.y,
    r: 15,
    vx: -120,
    type,
  });
};

function roundedPoly(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function drawImageCover(ctx, image, x, y, width, height) {
  if (!image?.complete || image.naturalWidth === 0) return false;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (imageRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) * 0.5;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) * 0.5;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  return true;
}

function drawImageContain(ctx, image, x, y, width, height) {
  if (!image?.complete || image.naturalWidth === 0) return false;
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  ctx.drawImage(image, x + (width - drawW) * 0.5, y + (height - drawH) * 0.5, drawW, drawH);
  return true;
}

function drawPlanetBackdrop(ctx, bg, config, width, height, wave, planetId) {
  const radius = Math.max(height * 0.43, width * 0.24);
  const x = width + radius * 0.1;
  const y = height * 0.52;

  ctx.save();
  ctx.shadowColor = config.palette[0];
  ctx.shadowBlur = 70;
  ctx.fillStyle = config.palette[1];
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.clip();

  if (bg?.complete) {
    const scroll = (wave * 28) % radius;
    ctx.globalAlpha = 0.96;
    ctx.drawImage(bg, x - radius - scroll, y - radius, radius * 2.4, radius * 2);
    ctx.drawImage(bg, x - radius * 0.1 - scroll, y - radius, radius * 2.4, radius * 2);
  }

  const shade = ctx.createRadialGradient(x - radius * 0.48, y - radius * 0.42, 4, x, y, radius);
  shade.addColorStop(0, 'rgba(255,255,255,0.34)');
  shade.addColorStop(0.46, 'rgba(255,255,255,0.02)');
  shade.addColorStop(1, 'rgba(0,0,0,0.74)');
  ctx.fillStyle = shade;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = planetId === 'saturn' ? 0.6 : 0.16;
  ctx.strokeStyle = config.accent;
  ctx.lineWidth = planetId === 'saturn' ? 18 : 3;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 1.33, radius * 0.22, -0.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawShip(ctx, ship, config, sprites) {
  ctx.save();
  ctx.translate(ship.x, ship.y);

  const engine = ctx.createLinearGradient(-42, 0, -8, 0);
  engine.addColorStop(0, 'rgba(255,255,255,0)');
  engine.addColorStop(0.35, `${config.palette[0]}aa`);
  engine.addColorStop(1, config.accent);
  ctx.fillStyle = engine;
  ctx.beginPath();
  ctx.ellipse(-28, 0, 30 + Math.sin(performance.now() * 0.02) * 6, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = config.palette[0];
  ctx.shadowBlur = 24;
  const shipWidth = 76;
  const shipHeight = 104;
  ctx.rotate(Math.PI / 2);
  if (!drawImageContain(ctx, sprites.ship, -shipWidth * 0.5, -shipHeight * 0.5, shipWidth, shipHeight)) {
    const hull = ctx.createLinearGradient(-24, -18, 30, 18);
    hull.addColorStop(0, '#ffffff');
    hull.addColorStop(0.48, config.accent);
    hull.addColorStop(1, config.palette[0]);
    ctx.fillStyle = hull;
    roundedPoly(ctx, [[34, 0], [-18, -20], [-28, 0], [-18, 20]]);
    ctx.fill();
  }
  ctx.restore();

  if (ship.shield > 0) {
    ctx.save();
    ctx.globalAlpha = 0.18 + Math.min(0.28, ship.shield / 140);
    ctx.strokeStyle = config.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, 31, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawEnemy(ctx, enemy, config, sprites) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(Math.sin(enemy.spin) * 0.08);
  ctx.shadowColor = enemy.kind === 'heavy' ? config.bossColor : config.enemyColor;
  ctx.shadowBlur = enemy.kind === 'heavy' ? 24 : 18;

  const enemySprite = enemy.kind === 'heavy'
    ? sprites.miniHeavy
    : enemy.kind === 'blade'
      ? sprites.miniBlade
      : enemy.variant === 'alt'
        ? sprites.miniScoutAlt
        : sprites.miniScout;

  const size = enemy.kind === 'heavy' ? enemy.r * 4.6 : enemy.kind === 'blade' ? enemy.r * 4.1 : enemy.r * 3.7;
  if (!drawImageContain(ctx, enemySprite, -size * 0.5, -size * 0.5, size, size)) {
    ctx.beginPath();
    ctx.arc(0, 0, enemy.r * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = enemy.kind === 'heavy' ? config.bossColor : config.enemyColor;
    ctx.fill();
  }
  ctx.restore();
}

function drawHazard(ctx, hazard, config, sprites) {
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.rotate(hazard.spin);
  ctx.fillStyle = config.hazardColor;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.shadowColor = config.hazardColor;
  ctx.shadowBlur = 16;
  roundedPoly(ctx, [[0, -hazard.r], [hazard.r * 0.8, -hazard.r * 0.2], [hazard.r * 0.58, hazard.r], [-hazard.r * 0.7, hazard.r * 0.5], [-hazard.r, -hazard.r * 0.35]]);
  ctx.save();
  ctx.clip();
  if (!drawImageCover(ctx, sprites.hazard, -hazard.r, -hazard.r, hazard.r * 2, hazard.r * 2)) {
    ctx.fill();
  }
  ctx.restore();
  ctx.stroke();
  ctx.restore();
}

function drawBoss(ctx, boss, config, sprites) {
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.shadowColor = config.bossColor;
  ctx.shadowBlur = 40;
  const body = ctx.createLinearGradient(-78, -55, 78, 55);
  body.addColorStop(0, config.palette[2]);
  body.addColorStop(0.45, config.bossColor);
  body.addColorStop(1, '#0b1020');

  ctx.save();
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = config.bossColor;
  ctx.beginPath();
  ctx.ellipse(0, 8, 92, 112, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (!drawImageContain(ctx, sprites.boss, -112, -132, 224, 264)) {
    ctx.beginPath();
    ctx.roundRect(-76, -44, 152, 88, 24);
    ctx.fillStyle = body;
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.78)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 4, 72, 94, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = config.accent;
  ctx.beginPath();
  ctx.arc(-34, -38, 8, 0, Math.PI * 2);
  ctx.arc(30, -38, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(-74, -146, 148, 10);
  ctx.fillStyle = config.accent;
  ctx.fillRect(-74, -146, 148 * Math.max(0, boss.hp / boss.maxHp), 10);
  ctx.restore();
}

export default function PlanetShooterGame() {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const deepBgRef = useRef(null);
  const spriteRefs = useRef({});
  const keysRef = useRef(new Set());
  const pointerRef = useRef({ active: false, x: 0, y: 0, fire: false });
  const stateRef = useRef(null);
  const audioRef = useRef(null);
  const frameRef = useRef(0);
  const hudFrameRef = useRef(0);
  const [result, setResult] = useState(null);
  const [loadout, setLoadout] = useState({ weaponId: 'pulse', upgrade: 'shield' });
  const [briefing, setBriefing] = useState(true);
  const [hud, setHud] = useState({
    hp: 100,
    shield: 36,
    score: 0,
    time: 82,
    combo: 1,
    kills: 0,
    weaponId: 'pulse',
    bossPhase: 0,
    round: 0,
    roundKills: 0,
    roundTarget: roundStages[0].kills,
    roundLabel: roundStages[0].label,
    transition: null,
  });

  const game = useSolarStore((state) => state.game);
  const closeShooterMission = useSolarStore((state) => state.closeShooterMission);
  const completeShooterMission = useSolarStore((state) => state.completeShooterMission);

  const planetId = game.activePlanetId;
  const planet = planetMap[planetId];
  const config = useMemo(
    () => planetShooterConfig[planetId] || defaultShooterConfig,
    [planetId]
  );

  useEffect(() => {
    if (game.status !== 'shooter' || !planetId) return undefined;

    const bg = new Image();
    bg.src = config.background;
    bgRef.current = bg;
    const deepBg = new Image();
    deepBg.src = config.deepSpace;
    deepBgRef.current = deepBg;
    Object.entries(shooterSprites).forEach(([key, src]) => {
      const image = new Image();
      image.src = src;
      spriteRefs.current[key] = image;
    });

    const down = (event) => {
      keysRef.current.add(event.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
    };
    const up = (event) => keysRef.current.delete(event.code);

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    audioRef.current = createAudio();

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      cancelAnimationFrame(frameRef.current);
      audioRef.current?.close();
      audioRef.current = null;
    };
  }, [config.background, config.deepSpace, game.status, planetId]);

  useEffect(() => {
    if (game.status !== 'shooter' || !planetId) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stateRef.current = makeInitialState(rect.width, rect.height, config, loadout);
      setBriefing(true);
      setHud({
        hp: 100,
        shield: stateRef.current.ship.shield,
        score: 0,
        time: config.mission?.timeLimit || 82,
        combo: 1,
        kills: 0,
        weaponId: loadout.weaponId,
        bossPhase: 0,
        round: 0,
        roundKills: 0,
        roundTarget: roundStages[0].kills,
        roundLabel: roundStages[0].label,
        transition: null,
      });
      setResult(null);
    };

    resize();
    window.addEventListener('resize', resize);

    const damageShip = (state, amount) => {
      if (state.ship.invincible > 0) return;
      if (state.ship.shield > 0) {
        const blocked = Math.min(state.ship.shield, amount);
        state.ship.shield -= blocked;
        amount -= blocked * 0.7;
      }
      state.ship.hp -= Math.max(4, amount);
      state.ship.invincible = 0.72;
      state.combo = 1;
      state.shake = 0.34;
      addSparks(state, state.ship.x, state.ship.y, '#ffffff', 18);
      audioRef.current?.hit();
    };

    const shoot = (state) => {
      if (state.cooldown > 0) return;
      const weapon = weaponTypes[state.weaponId] || weaponTypes.pulse;
      const boosted = state.ship.power > 1;
      const spread = boosted && weapon.id === 'pulse' ? [-10, 0, 10] : weapon.spread;
      spread.forEach((offset) => {
        state.bullets.push({
          x: state.ship.x + 28,
          y: state.ship.y + offset,
          r: weapon.id === 'seeker' ? 8 : boosted ? 5.8 : 5,
          vx: weapon.speed,
          vy: offset * 1.4,
          damage: weapon.damage + (boosted ? 1 : 0),
          homing: weapon.homing,
          type: weapon.id,
          color: getPlayerShotColor(config, weapon.id, offset),
        });
      });
      state.cooldown = boosted ? weapon.cooldown * 0.72 : weapon.cooldown;
      audioRef.current?.shoot();
    };

    const loop = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const state = stateRef.current;
      const keys = keysRef.current;
      const pointer = pointerRef.current;
      const sprites = spriteRefs.current;
      const mission = config.mission || {};
      const stage = roundStages[state.round] || roundStages[0];
      const stageDifficulty = config.difficulty * stage.speed;

      if (state.phase === 'playing') {
        if (state.roundTransition) {
          state.roundTransition.timer -= dt;
          state.wave += dt * 1.8;
          state.ship.x = Math.min(width * 0.86, state.ship.x + 820 * dt);
          state.ship.y += Math.sin(state.wave * 12) * 20 * dt;
          state.shake = Math.max(state.shake, 0.08);

          if (state.roundTransition.timer <= 0) {
            const nextRound = state.roundTransition.nextRound;
            state.round = nextRound;
            state.roundKills = 0;
            state.roundTransition = null;
            state.animeEnemy = null;
            state.ship.x = width * 0.17;
            state.ship.y = height * 0.5;
            state.ship.vx = 0;
            state.ship.vy = 0;
            state.spawnTimer = 0.2;
            state.hazardTimer = 1.2;
            audioRef.current?.boss();
          }
        } else {
        if (keys.has('Digit1')) state.weaponId = 'pulse';
        if (keys.has('Digit2')) state.weaponId = 'triBeam';
        if (keys.has('Digit3')) state.weaponId = 'seeker';

        const moveX =
          (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) -
          (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
        const moveY =
          (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0) -
          (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0);
        const len = Math.hypot(moveX, moveY) || 1;
        const accel = 2950 * state.ship.engineBonus;

        if (pointer.active) {
          const dx = pointer.x - state.ship.x;
          const dy = pointer.y - state.ship.y;
          state.ship.vx += clamp(dx, -180, 180) * 9 * dt;
          state.ship.vy += clamp(dy, -180, 180) * 9 * dt;
        } else {
          state.ship.vx += (moveX / len) * accel * dt;
          state.ship.vy += (moveY / len) * accel * dt;
        }

        state.ship.vx *= 0.9;
        state.ship.vy *= 0.9;
        state.ship.x = clamp(state.ship.x + state.ship.vx * dt, 38, width * 0.72);
        state.ship.y = clamp(state.ship.y + state.ship.vy * dt, 62, height - 62);
        state.ship.invincible = Math.max(0, state.ship.invincible - dt);
        state.ship.powerTimer = Math.max(0, state.ship.powerTimer - dt);
        if (state.ship.powerTimer <= 0) state.ship.power = 1;
        state.ship.shield = Math.min(68, state.ship.shield + dt * 2.6);
        state.cooldown = Math.max(0, state.cooldown - dt);
        state.time = Math.max(0, state.time - dt);
        state.wave += dt;
        state.spawnTimer -= dt;
        state.hazardTimer -= dt;
        state.powerTimer -= dt;
        state.shake = Math.max(0, state.shake - dt);

        if (keys.has('Space') || keys.has('KeyJ') || pointer.fire) shoot(state);

        if (state.spawnTimer <= 0 && !state.boss) {
          const heavy = state.kills > 8 && Math.random() > 0.68;
          const blade = state.round >= 1 && Math.random() > 0.58;
          state.enemies.push({
            x: width + 54,
            y: 76 + Math.random() * (height - 152),
            r: heavy ? 30 + state.round * 3 : blade ? 24 + state.round * 2 : 22 + state.round,
            hp: heavy ? 3 + state.round : 1 + (state.round === 2 ? 1 : 0),
            vx: -(170 + Math.random() * 110) * stageDifficulty,
            wave: Math.random() * Math.PI * 2,
            spin: 0,
            shotTimer: (heavy ? 2.75 : blade ? 2.35 : 3.05) + Math.random() * 1.2,
            kind: heavy ? 'heavy' : blade ? 'blade' : 'scout',
            variant: !heavy && !blade && Math.random() > 0.58 ? 'alt' : 'main',
          });
          state.spawnTimer = Math.max(0.22, (0.78 - state.wave * 0.01) * stage.spawn) / config.difficulty;
        }

        if (state.hazardTimer <= 0) {
          state.hazards.push({
            x: width + 70,
            y: 72 + Math.random() * (height - 144),
            r: 22 + Math.random() * 18,
            vx: -(230 + Math.random() * 90) * stageDifficulty,
            spin: Math.random() * Math.PI,
          });
          state.hazardTimer = (1.5 + Math.random() * 1.4) / ((mission.hazardRate || 1) * stage.hazard);
        }

        if (state.powerTimer <= 0) {
          const roll = Math.random();
          state.powerups.push({
            x: width + 40,
            y: 86 + Math.random() * (height - 172),
            r: 16,
            vx: -190,
            type: roll > 0.72 ? 'repair' : roll > 0.48 ? 'weapon' : roll > 0.24 ? 'shield' : 'overdrive',
          });
          state.powerTimer = 9 + Math.random() * 8;
        }

        if (!state.bossSpawned && stage.boss && (state.roundKills >= stage.kills || state.time <= 30)) {
          state.bossSpawned = true;
          state.boss = {
            x: width + 140,
            y: height * 0.5,
            r: 86,
            hp: Math.round((mission.bossHp || 48) * config.difficulty),
            maxHp: Math.round((mission.bossHp || 48) * config.difficulty),
            vx: -92,
            shotTimer: 0.5,
            phase: 1,
          };
          audioRef.current?.boss();
        }
        }

        state.bullets.forEach((bullet) => {
          if (bullet.homing) {
            const targets = state.boss ? [state.boss, ...state.enemies] : state.enemies;
            const target = targets
              .filter(Boolean)
              .sort((a, b) => distance(bullet, a) - distance(bullet, b))[0];
            if (target) {
              bullet.vy += clamp(target.y - bullet.y, -140, 140) * 4.5 * dt;
              bullet.vy = clamp(bullet.vy, -220, 220);
            }
          }
          bullet.x += bullet.vx * dt;
          bullet.y += bullet.vy * dt;
        });
        state.enemyShots.forEach((shot) => {
          shot.x += shot.vx * dt;
          shot.y += shot.vy * dt;
        });
        state.enemies.forEach((enemy) => {
          enemy.x += enemy.vx * dt;
          enemy.y += Math.sin(state.wave * 3.1 + enemy.wave) * 58 * dt;
          enemy.spin += dt * (enemy.kind === 'blade' ? 4.8 : 2.7);
          enemy.shotTimer -= dt;
          if (enemy.shotTimer <= 0) {
            spawnEnemyShots(state, enemy, config, Math.max(0.7, stageDifficulty));
            enemy.shotTimer = enemy.kind === 'heavy' ? 2.65 : enemy.kind === 'blade' ? 2.35 : 3.05;
          }
        });
        state.hazards.forEach((hazard) => {
          hazard.x += hazard.vx * dt;
          hazard.spin += dt * 1.7;
        });
        state.powerups.forEach((powerup) => {
          powerup.x += powerup.vx * dt;
          powerup.y += Math.sin(state.wave * 4 + powerup.x * 0.01) * 34 * dt;
        });

        if (state.boss) {
          const hpRatio = state.boss.hp / state.boss.maxHp;
          state.boss.phase = hpRatio < 0.34 ? 3 : hpRatio < 0.67 ? 2 : 1;
          state.boss.x = Math.max(width - 148, state.boss.x + state.boss.vx * dt);
          state.boss.y = height * 0.5 + Math.sin(state.wave * (1.3 + state.boss.phase * 0.35)) * height * (0.18 + state.boss.phase * 0.035);
          state.boss.shotTimer -= dt;
          if (state.boss.shotTimer <= 0) {
            const pattern = state.boss.phase === 1 ? [0] : state.boss.phase === 2 ? [-0.26, 0.26] : [-0.38, 0, 0.38];
            pattern.forEach((offset) => {
              state.enemyShots.push({
                x: state.boss.x - 70,
                y: state.boss.y,
                r: state.boss.phase === 3 ? 9 : 8,
                vx: -(220 + state.boss.phase * 30) * config.difficulty,
                vy: Math.sin(offset) * 190,
                kind: 'boss',
                color: getShotColor(config, 'boss'),
              });
            });
            if (state.boss.phase === 3) {
              state.hazards.push({
                x: state.boss.x - 78,
                y: state.boss.y + (Math.random() - 0.5) * 130,
                r: 18 + Math.random() * 14,
                vx: -300 * config.difficulty,
                spin: Math.random() * Math.PI,
              });
            }
            state.boss.shotTimer = state.boss.phase === 1 ? 1.6 : state.boss.phase === 2 ? 1.25 : 1.05;
          }
        }

        state.sparks.forEach((spark) => {
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;
          spark.vx *= 0.96;
          spark.vy *= 0.96;
          spark.life -= dt;
        });

        state.bullets.forEach((bullet) => {
          state.enemies.forEach((enemy) => {
            if (enemy.hp > 0 && hit(bullet, enemy)) {
              bullet.x = width + 200;
              enemy.hp -= bullet.damage || 1;
              addSparks(state, enemy.x, enemy.y, config.enemyColor, 7);
              if (enemy.hp <= 0) {
                state.kills += 1;
                state.roundKills += 1;
                state.combo = Math.min(9, state.combo + 0.35);
                state.score += Math.round((enemy.kind === 'heavy' ? 120 : 55) * state.combo);
                addSparks(state, enemy.x, enemy.y, config.accent, 18);
                maybeDropPowerup(state, enemy);
                const currentStage = roundStages[state.round] || roundStages[0];
                if (!state.boss && !currentStage.boss && state.roundKills >= currentStage.kills) {
                  startRoundTransition(state, config, state.round + 1);
                  audioRef.current?.win();
                }
              }
            }
          });
          if (state.boss && hit(bullet, state.boss)) {
            bullet.x = width + 200;
            state.boss.hp -= bullet.damage || 1;
            state.score += Math.round(18 * state.combo);
            addSparks(state, bullet.x, bullet.y, config.accent, 3);
          }
        });

        state.enemies.forEach((enemy) => {
          if (enemy.hp > 0 && hit(state.ship, enemy)) {
            enemy.hp = 0;
            damageShip(state, enemy.kind === 'heavy' ? 22 : 13);
          }
        });
        state.hazards.forEach((hazard) => {
          if (hit(state.ship, hazard)) {
            hazard.x = -200;
            damageShip(state, 19);
          }
        });
        state.enemyShots.forEach((shot) => {
          if (hit(state.ship, shot)) {
            shot.x = -200;
            damageShip(state, 11);
          }
        });
        state.powerups.forEach((powerup) => {
          if (hit(state.ship, powerup)) {
            powerup.x = -200;
            state.score += 150;
            if (powerup.type === 'shield') state.ship.shield = Math.min(80, state.ship.shield + 30);
            else if (powerup.type === 'repair') state.ship.hp = Math.min(100, state.ship.hp + 18);
            else if (powerup.type === 'weapon') {
              const order = ['pulse', 'triBeam', 'seeker'];
              state.weaponId = order[(order.indexOf(state.weaponId) + 1) % order.length];
            } else {
              state.ship.power = 3;
              state.ship.powerTimer = 10;
            }
            addSparks(state, state.ship.x, state.ship.y, config.accent, 24);
            audioRef.current?.pickup();
          }
        });

        state.bullets = state.bullets.filter((bullet) => bullet.x < width + 60);
        state.enemyShots = state.enemyShots.filter((shot) => shot.x > -80);
        state.enemies = state.enemies.filter((enemy) => enemy.x > -90 && enemy.hp > 0);
        state.hazards = state.hazards.filter((hazard) => hazard.x > -120);
        state.powerups = state.powerups.filter((powerup) => powerup.x > -80);
        state.sparks = state.sparks.filter((spark) => spark.life > 0);

        if (state.boss && state.boss.hp <= 0) {
          state.score += 1200;
          state.rank = rankMission(state, config);
          state.phase = 'won';
          setResult('won');
          audioRef.current?.win();
          addSparks(state, state.boss.x, state.boss.y, config.accent, 70);
        }

        if (state.ship.hp <= 0 || (state.time <= 0 && state.phase !== 'won')) {
          state.rank = 'D';
          state.phase = 'lost';
          setResult('lost');
          audioRef.current?.lose();
        }
      }

      const hudFrame = Math.floor(now / 140);
      if (hudFrame !== hudFrameRef.current) {
        hudFrameRef.current = hudFrame;
        setHud({
          hp: Math.max(0, Math.round(state.ship.hp)),
          shield: Math.max(0, Math.round(state.ship.shield)),
          score: Math.round(state.score),
          time: Math.ceil(state.time),
          combo: Number(state.combo.toFixed(1)),
          kills: state.kills,
          weaponId: state.weaponId,
          bossPhase: state.boss?.phase || 0,
          round: state.round,
          roundKills: state.roundKills,
          roundTarget: (roundStages[state.round] || roundStages[0]).kills,
          roundLabel: (roundStages[state.round] || roundStages[0]).label,
          transition: state.roundTransition,
        });
      }

      const shakeX = state.shake ? (Math.random() - 0.5) * state.shake * 18 : 0;
      const shakeY = state.shake ? (Math.random() - 0.5) * state.shake * 18 : 0;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(shakeX, shakeY);

      const bg = bgRef.current;
      const deepBg = deepBgRef.current;
      const space = ctx.createLinearGradient(0, 0, width, height);
      space.addColorStop(0, '#020411');
      space.addColorStop(0.42, `${config.palette[1]}66`);
      space.addColorStop(1, '#02030a');
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = space;
      ctx.fillRect(-20, -20, width + 40, height + 40);
      ctx.globalAlpha = 1;

      if (deepBg?.complete) {
        const offset = (state.wave * 12) % width;
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.drawImage(deepBg, -offset, 0, width, height);
        ctx.drawImage(deepBg, width - offset, 0, width, height);
        ctx.restore();
      }

      state.stars.forEach((star) => {
        star.x -= dt * 38 * star.z;
        if (star.x < -10) {
          star.x = width + 10;
          star.y = Math.random() * height;
        }
        ctx.globalAlpha = 0.28 + star.z * 0.28;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(star.x, star.y, star.s, star.s);
      });
      ctx.globalAlpha = 1;

      drawPlanetBackdrop(ctx, bg, config, width, height, state.wave, planetId);

      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = config.accent;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i += 1) {
        const y = ((i * 104 + state.wave * 42) % (height + 120)) - 60;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(width * 0.32, y + 50, width * 0.62, y - 40, width, y + 12);
        ctx.stroke();
      }
      ctx.restore();

      state.hazards.forEach((hazard) => drawHazard(ctx, hazard, config, sprites));
      state.powerups.forEach((powerup) => {
        ctx.save();
        ctx.translate(powerup.x, powerup.y);
        ctx.shadowColor = config.accent;
        ctx.shadowBlur = 22;
        const itemSize = powerup.r * 3.6;
        if (!drawImageContain(ctx, sprites.power, -itemSize * 0.5, -itemSize * 0.5, itemSize, itemSize)) {
          const fallbackSprite = sprites.miniScoutAlt || sprites.miniScout;
          if (!drawImageContain(ctx, fallbackSprite, -itemSize * 0.5, -itemSize * 0.5, itemSize, itemSize)) {
          ctx.fillStyle = powerup.type === 'shield' ? '#a7f3d0' : '#fde68a';
            ctx.beginPath();
            ctx.arc(0, 0, powerup.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });

      state.bullets.forEach((bullet) => {
        ctx.save();
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = bullet.type === 'seeker' ? 22 : 16;

        const length = bullet.type === 'seeker' ? 34 : bullet.type === 'triBeam' ? 26 : 22;
        const height = bullet.type === 'seeker' ? 13 : bullet.type === 'triBeam' ? 7 : 8;
        const trail = ctx.createLinearGradient(bullet.x - length, bullet.y, bullet.x + length * 0.55, bullet.y);
        trail.addColorStop(0, 'rgba(255,255,255,0)');
        trail.addColorStop(0.34, `${bullet.color}66`);
        trail.addColorStop(0.78, bullet.color);
        trail.addColorStop(1, '#ffffff');

        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.ellipse(bullet.x + length * 0.2, bullet.y, length * 0.62, height * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.36;
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.ellipse(bullet.x - length * 0.32, bullet.y, length * 0.48, height * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();

        if (bullet.type === 'seeker') {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bullet.x + length * 0.42, bullet.y, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      state.enemyShots.forEach((shot) => {
        ctx.save();
        ctx.shadowColor = shot.color || config.bossColor;
        ctx.shadowBlur = 14;
        ctx.fillStyle = shot.color || config.bossColor;
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.32;
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.r * 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      state.enemies.forEach((enemy) => drawEnemy(ctx, enemy, config, sprites));
      if (state.boss) drawBoss(ctx, state.boss, config, sprites);

      state.sparks.forEach((spark) => {
        ctx.globalAlpha = clamp(spark.life / spark.maxLife, 0, 1);
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      drawShip(ctx, state.ship, config, sprites);
      ctx.restore();

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [config, game.status, loadout, planetId]);

  if (game.status !== 'shooter' || !planetId) return null;

  const restart = () => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    stateRef.current = makeInitialState(rect.width, rect.height, config, loadout);
    setBriefing(true);
    setHud({
      hp: 100,
      shield: stateRef.current.ship.shield,
      score: 0,
      time: config.mission?.timeLimit || 82,
      combo: 1,
      kills: 0,
      weaponId: loadout.weaponId,
      bossPhase: 0,
      round: 0,
      roundKills: 0,
      roundTarget: roundStages[0].kills,
      roundLabel: roundStages[0].label,
      transition: null,
    });
    setResult(null);
  };

  const launchRun = () => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    stateRef.current = makeInitialState(rect.width, rect.height, config, loadout);
    stateRef.current.phase = 'playing';
    setBriefing(false);
    setResult(null);
    audioRef.current?.pickup();
  };

  const setPointer = (event, active) => {
    const rect = canvasRef.current.getBoundingClientRect();
    pointerRef.current.active = active;
    pointerRef.current.x = event.clientX - rect.left;
    pointerRef.current.y = event.clientY - rect.top;
  };

  return (
    <div className={`shooter-shell shooter-${planetId}`}>
      <ShooterThreeScene config={config} />
      <canvas
        ref={canvasRef}
        className="shooter-canvas"
        onPointerDown={(event) => setPointer(event, true)}
        onPointerMove={(event) => pointerRef.current.active && setPointer(event, true)}
        onPointerUp={() => {
          pointerRef.current.active = false;
        }}
        onPointerCancel={() => {
          pointerRef.current.active = false;
        }}
      />
      <div className="shooter-vignette" />
      <div className="shooter-hud">
        <div>
          <span>{planet?.name} / {config.terrain}</span>
          <strong>{config.title}</strong>
        </div>
        <div className="shooter-stat">
          <span>Hull</span>
          <strong>{hud.hp}</strong>
        </div>
        <div className="shooter-stat">
          <span>Shield</span>
          <strong>{hud.shield}</strong>
        </div>
        <div className="shooter-stat">
          <span>Score</span>
          <strong>{hud.score}</strong>
        </div>
        <div className="shooter-stat">
          <span>Combo</span>
          <strong>x{hud.combo}</strong>
        </div>
        <div className="shooter-stat">
          <span>Round</span>
          <strong>{hud.round + 1}/3 {hud.roundLabel}</strong>
        </div>
        <div className="shooter-stat">
          <span>Kills</span>
          <strong>{hud.roundKills}/{hud.roundTarget}</strong>
        </div>
        <div className="shooter-stat">
          <span>Weapon</span>
          <strong>{weaponTypes[hud.weaponId]?.label || 'Pulse'}</strong>
        </div>
        <div className="shooter-stat">
          <span>Time</span>
          <strong>{hud.time}s</strong>
        </div>
        <button type="button" onClick={closeShooterMission} aria-label="Thoát game">
          Thoát
        </button>
      </div>

      <div className="shooter-help">
        <strong>{config.bossName}</strong>
        <span>{config.mission?.objective}. WASD / mũi tên để bay, Space hoặc J để bắn, 1-3 đổi vũ khí.</span>
      </div>

      {briefing && !result && (
        <div className="shooter-briefing">
          <section>
            <p>Mission Loadout</p>
            <h2>{config.title}</h2>
            <span>{config.mission?.objective}</span>
            <div className="briefing-grid">
              <div>
                <strong>Weapon</strong>
                {Object.values(weaponTypes).map((weapon) => (
                  <button
                    key={weapon.id}
                    type="button"
                    className={loadout.weaponId === weapon.id ? 'active' : ''}
                    onClick={() => setLoadout((current) => ({ ...current, weaponId: weapon.id }))}
                  >
                    <b>{weapon.name}</b>
                    <small>DMG {weapon.damage} / CD {weapon.cooldown}s</small>
                  </button>
                ))}
              </div>
              <div>
                <strong>Upgrade</strong>
                {Object.values(upgradeTypes).map((upgrade) => (
                  <button
                    key={upgrade.id}
                    type="button"
                    className={loadout.upgrade === upgrade.id ? 'active' : ''}
                    onClick={() => setLoadout((current) => ({ ...current, upgrade: upgrade.id }))}
                  >
                    <b>{upgrade.name}</b>
                    <small>{upgrade.description}</small>
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="briefing-launch" onClick={launchRun}>
              Launch Mission
            </button>
          </section>
        </div>
      )}

      {hud.transition && !result && (
        <div className="round-anime-overlay">
          <div className="round-speed-lines" />
          <section>
            <p>Enemy Incoming</p>
            <h2>Vòng {hud.transition.nextRound + 1}: {hud.transition.label}</h2>
            <strong>{hud.transition.title}</strong>
            <div className="anime-enemy-card">
              <span />
              <i />
            </div>
          </section>
        </div>
      )}

      <div className="shooter-touch-controls" aria-label="Điều khiển cảm ứng">
        <button
          type="button"
          onPointerDown={() => {
            pointerRef.current.fire = true;
          }}
          onPointerUp={() => {
            pointerRef.current.fire = false;
          }}
          onPointerCancel={() => {
            pointerRef.current.fire = false;
          }}
        >
          Fire
        </button>
      </div>

      {result && (
        <div className="shooter-result">
          <section>
            <p>{result === 'won' ? 'Nhiệm vụ hoàn thành' : 'Tàu bị phá hủy'}</p>
            <h2>{result === 'won' ? `Rank ${stateRef.current?.rank || 'A'}` : 'Thử lại nhé'}</h2>
            <span>
              {result === 'won'
                ? `Bạn đã đánh bại ${config.bossName} và bảo vệ ${planet?.name}.`
                : `${config.enemyLabel} vẫn đang áp sát. Né đạn, giữ combo và ăn power-up để phản công.`}
            </span>
            <div>
              {result === 'won' ? (
                <button type="button" onClick={() => completeShooterMission(planetId)}>
                  Nhận hoàn thành
                </button>
              ) : (
                <button type="button" onClick={restart}>
                  Chơi lại
                </button>
              )}
              <button type="button" className="ghost" onClick={closeShooterMission}>
                Quay lại
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
