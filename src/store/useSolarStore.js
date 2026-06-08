import { create } from 'zustand';

const createLog = (message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  message,
});

export const useSolarStore = create((set) => ({
  selectedPlanetId: 'mars',
  followingPlanetId: null,
  spacecraftHomePlanetId: 'earth',
  mode: 'cinematic',
  speed: 1,
  showOrbits: true,
  showLabels: true,
  quizOpen: false,
  answeredQuiz: null,
  focusTarget: [0, 0, 0],
  planetPositions: {},
  ephemeris: {
    status: 'idle',
    source: null,
    startDate: null,
    stopDate: null,
    fetchedAt: null,
    fromCache: false,
    error: null,
    bodies: {},
  },
    game: {
    activePlanetId: null,
    questionIndex: 0,
    wrongCount: 0,
    completedPlanetIds: [],
    explodedPlanetId: null,
    failedPlanetId: null,
    status: 'playing',
    lastResult: null,
  },
  uiVisible: true,
  storyBookOpen: false,
  cinematicTour: {
    active: false,
    index: 0,
  },
  mission: {
    id: 0,
    status: 'idle',
    targetId: 'mars',
    progress: 0,
    fuel: 100,
    speed: 0,
    distance: 0,
    eta: '--',
    signal: 'SẴN SÀNG',
    autopilot: false,
    spacecraftPosition: [0, 0, 0],
    log: [
      createLog('Trung tâm điều khiển đã sẵn sàng. Hãy chọn hành tinh và phóng tàu.'),
    ],
  },
  selectPlanet: (selectedPlanetId) => set({ selectedPlanetId, followingPlanetId: selectedPlanetId }),
  stopFollowingPlanet: () => set({ followingPlanetId: null, cinematicTour: { active: false, index: 0 } }),
  setMode: (mode) => set({ mode }),
  setSpeed: (speed) => set({ speed }),
  setFocusTarget: (focusTarget) => set({ focusTarget }),
  setEphemerisLoading: () =>
    set((state) => ({
      ephemeris: {
        ...state.ephemeris,
        status: 'loading',
        error: null,
      },
    })),
  setEphemerisData: (ephemeris) =>
    set({
      ephemeris: {
        status: 'ready',
        source: ephemeris.source,
        startDate: ephemeris.startDate,
        stopDate: ephemeris.stopDate,
        fetchedAt: ephemeris.fetchedAt,
        fromCache: ephemeris.fromCache,
        error: null,
        bodies: ephemeris.bodies,
      },
    }),
  setEphemerisError: (error) =>
    set((state) => ({
      ephemeris: {
        ...state.ephemeris,
        status: 'error',
        error,
      },
    })),
  setPlanetPosition: (planetId, position) => {
    useSolarStore.getState().planetPositions[planetId] = position;
  },
  launchMission: () =>
    set((state) => {
      const targetId = state.selectedPlanetId;

      return {
        selectedPlanetId: targetId,
        followingPlanetId: null,
        mission: {
          ...state.mission,
          id: state.mission.id + 1,
          status: 'launch',
          targetId,
          progress: 0,
          fuel: 100,
          speed: 0,
          distance: 0,
          eta: 'Đang tính',
          signal: 'ĐÃ KHÓA',
          autopilot: true,
          log: [
            createLog(`Bắt đầu nhiệm vụ từ ${state.spacecraftHomePlanetId.toUpperCase()} đến ${targetId.toUpperCase()}.`),
            createLog('Chế độ tự lái đã bật. Đường bay đã được tính toán.'),
            ...state.mission.log,
          ].slice(0, 8),
        },
      };
    }),
  abortMission: () =>
    set((state) => ({
      mission: {
        ...state.mission,
        status: 'idle',
        progress: 0,
        fuel: 100,
        speed: 0,
        eta: '--',
        signal: 'SẴN SÀNG',
        autopilot: false,
        log: [createLog('Đã hủy nhiệm vụ. Trả camera về điều khiển tự do.'), ...state.mission.log].slice(0, 8),
      },
    })),
  setMissionTelemetry: (telemetry) =>
    set((state) => ({
      mission: {
        ...state.mission,
        ...telemetry,
      },
    })),
  completeMission: () =>
    set((state) => ({
      selectedPlanetId: state.mission.targetId,
      followingPlanetId: state.mission.targetId,
      spacecraftHomePlanetId: state.mission.targetId,
      game: {
        ...state.game,
        activePlanetId: state.mission.targetId,
        questionIndex: state.game.activePlanetId === state.mission.targetId ? state.game.questionIndex : 0,
        wrongCount: state.game.activePlanetId === state.mission.targetId ? state.game.wrongCount : 0,
        explodedPlanetId: null,
        lastResult: null,
        status: 'playing',
      },
      mission: {
        ...state.mission,
        status: 'scan',
        progress: 1,
        fuel: Math.max(0, state.mission.fuel),
        speed: 0,
        eta: 'Đã đến',
        signal: 'ĐANG QUÉT',
        autopilot: false,
        log: [
          createLog(`Tàu đã đáp thành công xuống ${state.mission.targetId.toUpperCase()}.`),
          createLog('Có thể khám phá Thử thách hoặc Kể chuyện trong bảng thông tin.'),
          ...state.mission.log,
        ].slice(0, 8),
      },
    })),
  closeGameQuiz: () =>
    set((state) => ({
      game: {
        ...state.game,
        activePlanetId: null,
        questionIndex: 0,
        wrongCount: 0,
        lastResult: null,
        status: 'playing',
      },
      mission: {
        ...state.mission,
        status: 'idle',
        progress: 0,
        speed: 0,
        eta: '--',
        signal: 'SẴN SÀNG',
        autopilot: false,
        log: [
          createLog('Đã đóng bảng thử thách. Chuyển sang chế độ ngắm tự do.'),
          ...state.mission.log,
        ].slice(0, 8),
      },
    })),
  answerGameQuestion: (answerIndex) =>
    set((state) => {
      const isCorrect = answerIndex === 0;
      const wrongCount = isCorrect ? state.game.wrongCount : state.game.wrongCount + 1;
      const activePlanetId = state.game.activePlanetId;

      if (!activePlanetId) {
        return state;
      }

      if (wrongCount > 2) {
        return {
          game: {
            ...state.game,
            questionIndex: 0,
            wrongCount: 0,
            explodedPlanetId: null,
            failedPlanetId: activePlanetId,
            lastResult: 'exploded',
            status: 'failed',
          },
          mission: {
            ...state.mission,
            status: 'idle',
            progress: 0,
            fuel: 100,
            speed: 0,
            eta: '--',
            signal: 'SẴN SÀNG',
            autopilot: false,
            log: [
              createLog('Sai quá 2 câu. Nhiệm vụ thất bại. Hãy chơi lại từ đầu.'),
              ...state.mission.log,
            ].slice(0, 8),
          },
        };
      }

      if (state.game.questionIndex >= 4) {
        const completedPlanetIds = Array.from(
          new Set([...state.game.completedPlanetIds, activePlanetId])
        );
        const status = completedPlanetIds.length >= 8 ? 'complete' : 'playing';

        return {
          game: {
            ...state.game,
            questionIndex: 0,
            wrongCount: 0,
            completedPlanetIds,
            explodedPlanetId: null,
            activePlanetId: null,
            lastResult: 'passed',
            status,
          },
          mission: {
            ...state.mission,
            status: 'idle',
            signal: status === 'complete' ? 'HOÀN THÀNH' : 'SẴN SÀNG',
            eta: '--',
            speed: 0,
            fuel: 100,
            progress: 0,
            autopilot: false,
            log: [
              createLog(`Đã hoàn thành thử thách của ${activePlanetId.toUpperCase()}.`),
              ...state.mission.log,
            ].slice(0, 8),
          },
        };
      }

      return {
        game: {
          ...state.game,
          questionIndex: state.game.questionIndex + 1,
          wrongCount,
          explodedPlanetId: null,
          lastResult: isCorrect ? 'correct' : 'wrong',
        },
      };
    }),
  clearExplosion: () =>
    set((state) => ({
      game: {
        ...state.game,
        explodedPlanetId: null,
        lastResult: null,
      },
    })),
  restartGame: () =>
    set((state) => ({
      selectedPlanetId: 'mars',
  followingPlanetId: null,
  spacecraftHomePlanetId: 'earth',
      game: {
        activePlanetId: null,
        questionIndex: 0,
        wrongCount: 0,
        completedPlanetIds: [],
        explodedPlanetId: null,
        failedPlanetId: null,
        status: 'playing',
        lastResult: null,
      },
      mission: {
        ...state.mission,
        id: state.mission.id + 1,
        status: 'idle',
        targetId: 'mars',
        progress: 0,
        fuel: 100,
        speed: 0,
        eta: '--',
        signal: 'SẴN SÀNG',
        autopilot: false,
        log: [createLog('Bắt đầu lại hành trình khám phá 8 hành tinh.')],
      },
    })),
  followSpacecraft: () =>
    set((state) => ({
      followingPlanetId: null,
      mission: {
        ...state.mission,
        autopilot: true,
        log:
          state.mission.status === 'idle'
            ? state.mission.log
            : [createLog('Camera đang theo dõi phi thuyền.'), ...state.mission.log].slice(0, 8),
      },
    })),
  disableMissionAutopilot: () =>
    set((state) => ({
      mission: {
        ...state.mission,
        autopilot: false,
      },
    })),
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleUI: () => set((state) => ({ uiVisible: !state.uiVisible })),
  toggleQuiz: () => set((state) => ({ quizOpen: !state.quizOpen })),
  answerQuiz: (answeredQuiz) => set({ answeredQuiz }),
  openQuiz: () => set((state) => {
    // Chỉ mở nếu đang có selectedPlanetId
    if (state.selectedPlanetId) {
      return {
        game: {
          ...state.game,
          activePlanetId: state.selectedPlanetId,
          status: 'quiz',
        }
      };
    }
    return state;
  }),
  openStoryBook: () => set({ storyBookOpen: true }),
  closeStoryBook: () => set({ storyBookOpen: false }),
  startCinematicTour: () =>
    set((state) => ({
      followingPlanetId: null,
      cinematicTour: { active: true, index: 0 },
      mission: {
        ...state.mission,
        autopilot: false,
        log: [createLog('Bắt đầu chế độ tham quan điện ảnh.'), ...state.mission.log].slice(0, 8),
      },
    })),
  stopCinematicTour: () => set({ cinematicTour: { active: false, index: 0 } }),
  setCinematicTourIndex: (index) =>
    set((state) => {
      const targetIds = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
      const targetId = targetIds[index % targetIds.length];

      return {
        selectedPlanetId: targetId === 'sun' ? state.selectedPlanetId : targetId,
        followingPlanetId: targetId === 'sun' ? null : targetId,
        cinematicTour: { active: true, index: index % targetIds.length },
      };
    }),
}));












