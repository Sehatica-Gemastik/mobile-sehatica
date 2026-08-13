import { create } from 'zustand';

export type HealyCorner = 'bottom-right' | 'bottom-left';

export type HealyMessage = {
  id: string;
  askId?: string;
  title?: string;
  text: string;
  corner: HealyCorner;
};

const CORNERS: HealyCorner[] = ['bottom-right', 'bottom-left'];

const IDLE_MESSAGES = [
  'Sudah minum air cukup hari ini?',
  'Cek jadwal obatmu biar nggak ketinggalan.',
  'Gerak ringan 5 menit juga membantu lho.',
  'Kalau ada gejala baru, catat di Rekam ya.',
  'Istirahat sejenak — tubuhmu butuh recovery.',
];

function pickCorner(exclude?: HealyCorner): HealyCorner {
  const pool = exclude ? CORNERS.filter((c) => c !== exclude) : CORNERS;
  return pool[Math.floor(Math.random() * pool.length)] ?? 'bottom-right';
}

type HealyStore = {
  queue: HealyMessage[];
  current: HealyMessage | null;
  shownAskIds: Record<string, true>;
  welcomeShown: boolean;
  enqueue: (input: Omit<HealyMessage, 'corner'> & { corner?: HealyCorner }) => void;
  showWelcome: (text: string) => void;
  dismissCurrent: () => void;
  enqueueIdleTip: () => void;
  hasAsk: (askId: string) => boolean;
  reset: () => void;
};

export const useHealyStore = create<HealyStore>((set, get) => ({
  queue: [],
  current: null,
  shownAskIds: {},
  welcomeShown: false,

  hasAsk: (askId) => Boolean(get().shownAskIds[askId]),

  reset: () => set({
    queue: [],
    current: null,
    shownAskIds: {},
    welcomeShown: false,
  }),

  enqueue: (input) => {
    if (input.askId && get().shownAskIds[input.askId]) return;

    const message: HealyMessage = {
      ...input,
      corner: input.corner ?? pickCorner(get().current?.corner),
    };

    const shownAskIds = input.askId
      ? { ...get().shownAskIds, [input.askId]: true as const }
      : get().shownAskIds;

    const { current, queue } = get();
    if (!current) {
      set({ current: message, shownAskIds, welcomeShown: true });
      return;
    }

    set({ queue: [...queue, message], shownAskIds, welcomeShown: true });
  },

  showWelcome: (text) => {
    const { current, welcomeShown } = get();
    if (current || welcomeShown) return;

    set({
      current: {
        id: `welcome_${Date.now()}`,
        text,
        corner: pickCorner(),
      },
      welcomeShown: true,
    });
  },

  dismissCurrent: () => {
    const { queue } = get();
    set({
      current: queue[0] ?? null,
      queue: queue.slice(1),
    });
  },

  enqueueIdleTip: () => {
    const { current, queue } = get();
    if (current || queue.length > 0) return;

    const text = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)] ?? IDLE_MESSAGES[0];
    set({
      current: {
        id: `idle_${Date.now()}`,
        text,
        corner: pickCorner(),
      },
    });
  },
}));
