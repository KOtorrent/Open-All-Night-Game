import type { NightId } from './campaignDefinition';

export type BeatKind = 'message' | 'task' | 'anomaly' | 'lore' | 'finale';
export interface NightBeat {
  minute: number;
  kind: BeatKind;
  id: string;
  text: string;
}

const t = (hour: number, minute: number) => (hour < 12 ? hour + 24 : hour) * 60 + minute;

export const NIGHT_TIMELINES: Record<NightId, NightBeat[]> = {
  1: [], // Night 1 currently uses its authored systems rather than this scaffold timeline.
  2: [
    { minute: t(22,55), kind: 'message', id: 'n2-start', text: 'NIGHT 2 — REGULARS' },
    { minute: t(23,5), kind: 'task', id: 'n2-customer-count', text: 'Count the customers before midnight' },
    { minute: t(23,28), kind: 'anomaly', id: 'repeater', text: 'A familiar customer returns too soon.' },
    { minute: t(23,52), kind: 'task', id: 'n2-face-candy', text: 'Face the candy rack' },
    { minute: t(24,18), kind: 'anomaly', id: 'wrong-face', text: 'A regular looks almost right.' },
    { minute: t(24,42), kind: 'anomaly', id: 'smiling-woman', text: 'A woman in a yellow coat enters.' },
    { minute: t(25,12), kind: 'task', id: 'n2-coffee', text: 'Refresh the coffee station' },
    { minute: t(25,38), kind: 'anomaly', id: 'coffee-rule', text: 'The coffee routine changes.' },
    { minute: t(26,15), kind: 'anomaly', id: 'head-count', text: 'The customer count no longer agrees.' },
    { minute: t(26,48), kind: 'lore', id: 'n2-daniel', text: 'Check the old schedule in the manager office' },
    { minute: t(27,22), kind: 'anomaly', id: 'window-reflection', text: 'The window reflection is wrong.' },
    { minute: t(28,5), kind: 'anomaly', id: 'customer-stayed', text: 'Someone never left.' },
    { minute: t(28,44), kind: 'task', id: 'n2-stock', text: 'Finish the overnight stock count' },
    { minute: t(29,16), kind: 'anomaly', id: 'impossible-receipt', text: 'The printer runs before a sale.' },
    { minute: t(29,55), kind: 'finale', id: 'n2-clockout', text: 'Five minutes left.' }
  ],
  3: [
    { minute: t(22,55), kind: 'message', id: 'n3-start', text: 'NIGHT 3 — THE STORM' },
    { minute: t(23,8), kind: 'task', id: 'n3-storm-check', text: 'Check the exterior doors before the storm worsens' },
    { minute: t(23,31), kind: 'anomaly', id: 'storm-blackout', text: 'The store loses power.' },
    { minute: t(24,2), kind: 'task', id: 'n3-breaker', text: 'Verify the breaker panel' },
    { minute: t(24,26), kind: 'anomaly', id: 'pump-7', text: 'Pump 7 requests authorization.' },
    { minute: t(24,58), kind: 'anomaly', id: 'rear-door-knock', text: 'Three knocks hit the rear door.' },
    { minute: t(25,25), kind: 'anomaly', id: 'camera-desync', text: 'Camera 6 shows the wrong rear lot.' },
    { minute: t(25,51), kind: 'task', id: 'n3-mop', text: 'Mop rainwater near the entrance' },
    { minute: t(26,14), kind: 'anomaly', id: 'false-cop', text: 'A deputy arrives during the storm.' },
    { minute: t(26,47), kind: 'anomaly', id: 'tall-man', text: 'Someone too tall stands beneath the canopy.' },
    { minute: t(27,33), kind: 'anomaly', id: 'frozen-clock', text: 'The clock stops at 3:33.' },
    { minute: t(28,6), kind: 'anomaly', id: 'wrong-door', text: 'A rear doorway is not where it belongs.' },
    { minute: t(28,42), kind: 'task', id: 'n3-delivery', text: 'Reconcile the storm delivery manifest' },
    { minute: t(29,15), kind: 'lore', id: 'n3-larry', text: 'Read the old overnight incident note' },
    { minute: t(29,55), kind: 'finale', id: 'n3-clockout', text: 'The storm is easing. Five minutes left.' }
  ],
  4: [
    { minute: t(22,55), kind: 'message', id: 'n4-start', text: 'NIGHT 4 — SOMEONE CHANGED THE RULES' },
    { minute: t(23,6), kind: 'task', id: 'n4-review-rules', text: 'Compare tonight’s notebook page with the old notes' },
    { minute: t(23,34), kind: 'anomaly', id: 'corrupted-rule', text: 'A notebook rule has changed.' },
    { minute: t(24,4), kind: 'anomaly', id: 'wrong-face', text: 'A regular returns with the wrong face.' },
    { minute: t(24,31), kind: 'task', id: 'n4-camera-check', text: 'Verify Cameras 4 and 6' },
    { minute: t(24,57), kind: 'anomaly', id: 'duplicate-player', text: 'CCTV shows the clerk somewhere else.' },
    { minute: t(25,26), kind: 'anomaly', id: 'false-cop', text: 'Authority arrives with the wrong details.' },
    { minute: t(25,59), kind: 'anomaly', id: 'head-count', text: 'There is one customer too many.' },
    { minute: t(26,24), kind: 'task', id: 'n4-trash', text: 'Take the rear trash out only if Camera 6 is clear' },
    { minute: t(26,53), kind: 'anomaly', id: 'wrong-door', text: 'A door opens onto the wrong room.' },
    { minute: t(27,33), kind: 'anomaly', id: 'frozen-clock', text: '3:33 returns.' },
    { minute: t(28,12), kind: 'anomaly', id: 'customer-stayed', text: 'Someone from earlier is still inside.' },
    { minute: t(28,49), kind: 'lore', id: 'n4-daniel-note', text: 'Find Daniel’s corrected rule note' },
    { minute: t(29,20), kind: 'anomaly', id: 'camera-desync', text: 'The cameras disagree with the store.' },
    { minute: t(29,55), kind: 'finale', id: 'n4-clockout', text: 'Five minutes. The notebook has one new line.' }
  ],
  5: [
    { minute: t(22,55), kind: 'message', id: 'n5-start', text: 'NIGHT 5 — OPEN ALL NIGHT' },
    { minute: t(23,12), kind: 'task', id: 'n5-routine', text: 'Keep the opening routine exactly the same' },
    { minute: t(23,48), kind: 'anomaly', id: 'impossible-receipt', text: 'A receipt prints with tomorrow’s date.' },
    { minute: t(24,22), kind: 'anomaly', id: 'duplicate-player', text: 'You are visible on two cameras.' },
    { minute: t(24,56), kind: 'task', id: 'n5-count', text: 'Count every person in the store' },
    { minute: t(25,31), kind: 'anomaly', id: 'customer-stayed', text: 'Nobody seems willing to leave.' },
    { minute: t(26,7), kind: 'anomaly', id: 'wrong-door', text: 'The back room opens somewhere impossible.' },
    { minute: t(26,44), kind: 'task', id: 'n5-coffee', text: 'Make another pot of coffee' },
    { minute: t(27,33), kind: 'anomaly', id: 'frozen-clock', text: 'The clock stops again.' },
    { minute: t(28,18), kind: 'anomaly', id: 'head-count', text: 'The store contains one extra person.' },
    { minute: t(29,10), kind: 'lore', id: 'n5-larry-file', text: 'Read Larry Case’s old night-clerk file' },
    { minute: t(29,40), kind: 'anomaly', id: 'larry-arrival', text: 'A customer arrives for shift change.' },
    { minute: t(29,55), kind: 'finale', id: 'n5-five-left', text: '5:55 AM. Morning does not look any closer.' },
    { minute: t(30,0), kind: 'anomaly', id: 'five-sixty', text: '5:60 AM.' },
    { minute: t(30,1), kind: 'finale', id: 'n5-ending-choice', text: 'Someone has to take the shift.' }
  ]
};
