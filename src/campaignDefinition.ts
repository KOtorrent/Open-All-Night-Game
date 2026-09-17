export type GameMode = 'campaign' | 'chapter' | 'endless';
export type NightId = 1 | 2 | 3 | 4 | 5;

export interface NightDefinition {
  id: NightId;
  title: string;
  subtitle: string;
  startMinutes: number;
  endMinutes: number;
  weather: 'clear' | 'rain' | 'storm' | 'wrong';
  rules: string[];
  goals: string[];
  anomalyIds: string[];
  mythicIds: string[];
}

export const NIGHTS: Record<NightId, NightDefinition> = {
  1: {
    id: 1,
    title: 'FIRST SHIFT',
    subtitle: 'Learn the store. Learn the rules.',
    startMinutes: 22 * 60 + 55,
    endMinutes: 30 * 60,
    weather: 'clear',
    rules: [
      'If the freezer lights flash, leave Aisle 4 until they stop.',
      'If someone enters without the chime, do not speak.',
      'The restroom closes at 2:00 AM. If you hear knocking after that, do not open it.'
    ],
    goals: ['Learn the register', 'Complete routine chores', 'Survive the first three rules', 'Clock out at 6:00 AM'],
    anomalyIds: ['freezer-flicker', 'silent-customer', 'bathroom-knock', 'pump-7', 'cam4-figure', 'window-watcher', 'impossible-receipt'],
    mythicIds: []
  },
  2: {
    id: 2,
    title: 'REGULARS',
    subtitle: 'You start recognizing faces. Some of them recognize you first.',
    startMinutes: 22 * 60 + 55,
    endMinutes: 30 * 60,
    weather: 'clear',
    rules: [
      'Count the customers before midnight. The number should not change afterward.',
      'Do not serve the same customer twice in one hour.',
      'If a receipt prints before the sale, do not read the customer name.'
    ],
    goals: ['Handle a busier customer flow', 'Track repeat visitors', 'Use CCTV to verify inconsistencies', 'Clock out at 6:00 AM'],
    anomalyIds: ['repeater', 'smiling-woman', 'wrong-face', 'customer-stayed', 'head-count', 'impossible-receipt', 'coffee-rule', 'window-reflection'],
    mythicIds: ['customer-with-your-name']
  },
  3: {
    id: 3,
    title: 'THE STORM',
    subtitle: 'The road disappears first.',
    startMinutes: 22 * 60 + 55,
    endMinutes: 30 * 60,
    weather: 'storm',
    rules: [
      'During a blackout, do not leave the counter until emergency lights come on.',
      'If Pump 7 requests authorization during the storm, deny it.',
      'When the rear door knocks three times, check Camera 6 before touching the lock.'
    ],
    goals: ['Keep the store operating through outages', 'Handle storm deliveries', 'Use the breaker and CCTV under pressure', 'Clock out at 6:00 AM'],
    anomalyIds: ['storm-blackout', 'pump-7', 'rear-door-knock', 'false-cop', 'tall-man', 'wrong-door', 'camera-desync', 'frozen-clock'],
    mythicIds: ['empty-bus', 'wrong-moon']
  },
  4: {
    id: 4,
    title: 'SOMEONE CHANGED THE RULES',
    subtitle: 'The notebook is no longer trustworthy.',
    startMinutes: 22 * 60 + 55,
    endMinutes: 30 * 60,
    weather: 'rain',
    rules: [
      'Some written rules are false tonight.',
      'Verify suspicious instructions against the store, CCTV, and repeated behavior.',
      'Do not follow a rule merely because it is written in the notebook.'
    ],
    goals: ['Identify corrupted rules', 'Cross-check anomalies instead of blindly obeying', 'Protect the mundane routine', 'Clock out at 6:00 AM'],
    anomalyIds: ['corrupted-rule', 'duplicate-player', 'wrong-face', 'false-cop', 'wrong-door', 'camera-desync', 'customer-stayed', 'head-count', 'frozen-clock'],
    mythicIds: ['second-store', 'customer-with-your-name']
  },
  5: {
    id: 5,
    title: 'OPEN ALL NIGHT',
    subtitle: 'Morning is late.',
    startMinutes: 22 * 60 + 55,
    endMinutes: 30 * 60,
    weather: 'wrong',
    rules: [
      'Keep the routine moving.',
      'Do not trust the clock after 5:55 AM.',
      'Someone must take the shift before morning can arrive.'
    ],
    goals: ['Reach 6:00 AM', 'Survive impossible time', 'Meet Larry', 'Choose how the shift ends'],
    anomalyIds: ['duplicate-player', 'wrong-door', 'frozen-clock', 'impossible-receipt', 'head-count', 'customer-stayed', 'larry-arrival', 'five-sixty'],
    mythicIds: ['larry-parking-lot', 'second-store', 'wrong-moon']
  }
};

export const ENDINGS = {
  clockOut: { id: 'CLOCK_OUT', title: 'CLOCK OUT', achievementId: 'FUCK_THIS_JOB' },
  stay: { id: 'OPEN_ALL_NIGHT', title: 'OPEN ALL NIGHT', achievementId: 'OPEN_ALL_NIGHT' },
  breakRules: { id: 'BREAK_THE_RULES', title: 'BREAK THE RULES', achievementId: 'BREAK_THE_RULES' }
} as const;
