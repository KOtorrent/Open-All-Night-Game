export type AnomalyTier = 'standard' | 'mythic';
export type AnomalyCategory = 'customer' | 'store' | 'cctv' | 'exterior' | 'time' | 'rule' | 'finale';

export interface AnomalyDefinition {
  id: string;
  title: string;
  tier: AnomalyTier;
  category: AnomalyCategory;
  nights: number[];
  endlessWeight: number;
  cooldownMinutes: number;
  notes: string;
}

const standard = (id: string, title: string, category: AnomalyCategory, nights: number[], weight: number, cooldown: number, notes: string): AnomalyDefinition => ({
  id, title, tier: 'standard', category, nights, endlessWeight: weight, cooldownMinutes: cooldown, notes
});
const mythic = (id: string, title: string, category: AnomalyCategory, nights: number[], weight: number, cooldown: number, notes: string): AnomalyDefinition => ({
  id, title, tier: 'mythic', category, nights, endlessWeight: weight, cooldownMinutes: cooldown, notes
});

export const ANOMALIES: AnomalyDefinition[] = [
  standard('silent-customer', 'Silent Customer', 'customer', [1,2,3,4,5], 8, 55, 'Enters without chime; do not speak.'),
  standard('freezer-flicker', 'Freezer Flicker', 'store', [1,2,3,4,5], 8, 45, 'Aisle 4 lights flash; leave until they stop.'),
  standard('bathroom-knock', 'Bathroom Knock', 'store', [1,2,3,4,5], 7, 60, 'Knocking after 2:00 AM; do not open.'),
  standard('repeater', 'Repeater', 'customer', [2,3,4,5], 7, 55, 'Same customer returns too soon.'),
  standard('smiling-woman', 'Smiling Woman', 'customer', [2,3,4,5], 6, 70, 'Yellow coat; behavior subtly wrong.'),
  standard('tall-man', 'Tall Man', 'customer', [3,4,5], 5, 85, 'Impossible height and stillness.'),
  standard('wrong-face', 'Wrong Face', 'customer', [2,3,4,5], 6, 70, 'Recognizable regular with incorrect face.'),
  standard('customer-stayed', 'Customer Stayed', 'customer', [2,3,4,5], 6, 65, 'Customer should have left but remains somewhere in store.'),
  standard('pump-7', 'Pump 7', 'exterior', [1,2,3,4,5], 7, 60, 'Unattended request/vehicle activity at Pump 7.'),
  standard('coffee-rule', 'Coffee Rule', 'store', [2,3,4,5], 5, 55, 'Coffee routine becomes a containment instruction.'),
  standard('window-reflection', 'Window Reflection', 'store', [2,3,4,5], 5, 50, 'Front glass shows something not physically present.'),
  standard('head-count', 'Head Count', 'rule', [2,3,4,5], 6, 70, 'Customer count no longer matches reality.'),
  standard('rear-door-knock', 'Back Door Knock', 'store', [3,4,5], 6, 60, 'Rear door requires CCTV verification.'),
  standard('frozen-clock', 'Frozen Clock 3:33', 'time', [3,4,5], 6, 90, 'Clock stalls while world continues.'),
  standard('false-cop', 'False Cop', 'customer', [3,4,5], 5, 90, 'Looks official, details fail verification.'),
  standard('duplicate-player', 'Duplicate Player', 'cctv', [4,5], 4, 110, 'CCTV shows the clerk in two places.'),
  standard('impossible-receipt', 'Impossible Receipt', 'store', [1,2,3,4,5], 7, 55, 'Printer outputs impossible transaction/time.'),
  standard('wrong-door', 'Wrong Door', 'store', [3,4,5], 5, 85, 'A familiar doorway leads somewhere it should not.'),
  standard('camera-desync', 'Camera Desync', 'cctv', [3,4,5], 6, 65, 'CCTV state differs from physical store.'),
  standard('cam4-figure', 'Camera 4 Figure', 'cctv', [1,2,3,4,5], 5, 60, 'Figure exists only on Camera 4.'),
  standard('window-watcher', 'Window Watcher', 'exterior', [1,2,3,4,5], 5, 60, 'Person appears outside without arrival cues.'),
  standard('storm-blackout', 'Storm Blackout', 'store', [3], 8, 50, 'Partial or total power loss during storm.'),
  standard('corrupted-rule', 'Corrupted Rule', 'rule', [4,5], 7, 75, 'Notebook instruction is false or altered.'),
  standard('wrong-price', 'Wrong Price', 'store', [2,3,4,5], 4, 45, 'Register price conflicts with shelf/receipt.'),
  standard('missing-aisle', 'Missing Aisle', 'store', [3,4,5], 4, 95, 'An aisle appears absent or shortened.'),
  standard('extra-door', 'Extra Door', 'store', [3,4,5], 4, 95, 'A door exists where wall should be.'),
  standard('no-chime-exit', 'No Chime Exit', 'customer', [2,3,4,5], 4, 55, 'Customer leaves without triggering exit chime.'),
  standard('same-car', 'Same Car', 'exterior', [2,3,4,5], 4, 70, 'Same vehicle repeats impossible arrivals.'),
  standard('pump-counter-rollover', 'Pump Counter Rollover', 'exterior', [3,4,5], 4, 80, 'Pump amount increments without authorization.'),
  standard('lottery-repeat', 'Lottery Repeat', 'store', [2,3,4,5], 3, 65, 'Scratch-off serial/pack repeats.'),
  standard('shelf-reset', 'Shelf Reset', 'store', [2,3,4,5], 4, 55, 'Faced merchandise returns to prior arrangement.'),
  standard('freezer-handprint', 'Freezer Handprint', 'store', [2,3,4,5], 4, 60, 'Condensation print appears from inside.'),
  standard('radio-voice', 'Radio Voice', 'store', [3,4,5], 4, 75, 'Store audio/radio says context-specific phrase.'),
  standard('receipt-name', 'Receipt Name', 'store', [2,3,4,5], 4, 70, 'Receipt contains a name that should not be known.'),
  standard('light-follow', 'Following Light', 'store', [3,4,5], 3, 80, 'A lit zone seems to follow player position.'),
  standard('mirror-delay', 'Mirror Delay', 'store', [3,4,5], 3, 90, 'Mirror/reflection movement lags.'),
  standard('empty-queue', 'Empty Queue', 'customer', [2,3,4,5], 4, 55, 'Register queue sound/transaction state with no customer.'),
  standard('door-chime-false', 'False Door Chime', 'store', [1,2,3,4,5], 5, 45, 'Door chimes with nobody entering.'),
  standard('cctv-time-slip', 'CCTV Time Slip', 'cctv', [3,4,5], 4, 75, 'Camera timestamp leads/lags world time.'),
  // category is 'finale' (not 'time') to match its sibling 'larry-arrival' below: gameSession.ts's
  // Endless pool filter excludes category 'finale'. Confirmed in-engine that with the old 'time'
  // category, '5:60' — a one-time Night 5 story beat with no generic anomaly handler registered —
  // could be randomly selected in Endless Mode, silently consuming an anomaly slot with no visible
  // effect (no handler exists for it outside nightFiveRuntime.ts's own campaign-specific logic).
  standard('five-sixty', '5:60', 'finale', [5], 9, 999, 'Night 5 impossible final minute.'),
  standard('larry-arrival', 'Larry Arrival', 'finale', [5], 9, 999, 'Final shift-change encounter.'),

  mythic('empty-bus', 'Empty Bus', 'exterior', [3,4,5], 1, 240, 'Bus arrives with doors open and nobody aboard.'),
  mythic('second-store', 'Second Store', 'store', [4,5], 1, 240, 'An impossible duplicate Case’s exists beyond a threshold.'),
  mythic('wrong-moon', 'Wrong Moon', 'exterior', [3,4,5], 1, 240, 'Sky/moon becomes visibly impossible.'),
  mythic('customer-with-your-name', 'Customer With Your Name', 'customer', [2,4,5], 1, 240, 'Customer identity matches the clerk.'),
  mythic('larry-parking-lot', 'Larry in the Parking Lot', 'finale', [5], 1, 999, 'Rare Larry sighting before final encounter.')
];

export const STANDARD_ANOMALIES = ANOMALIES.filter((x) => x.tier === 'standard');
export const MYTHIC_ANOMALIES = ANOMALIES.filter((x) => x.tier === 'mythic');
export const ANOMALY_BY_ID = new Map(ANOMALIES.map((x) => [x.id, x]));
