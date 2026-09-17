export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  hidden?: boolean;
  category: 'campaign' | 'ending' | 'mastery' | 'anomaly' | 'endless' | 'lore';
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'FIRST_DAY', title: 'FIRST DAY', description: 'Finish Night 1.', category: 'campaign' },
  { id: 'REGULAR', title: 'REGULAR', description: 'Serve every ordinary Night 1 customer.', category: 'mastery' },
  { id: 'STORM_WARNING', title: 'STORM WARNING', description: 'Finish Night 3.', category: 'campaign' },
  { id: 'TRUST_ISSUES', title: 'TRUST ISSUES', description: 'Survive the Silent Customer without speaking.', category: 'anomaly' },
  { id: 'OVERTIME', title: 'OVERTIME', description: 'Reach the impossible time on Night 5.', category: 'campaign' },
  { id: 'FUCK_THIS_JOB', title: 'FUCK THIS JOB', description: 'Choose CLOCK OUT.', category: 'ending' },
  { id: 'OPEN_ALL_NIGHT', title: 'OPEN ALL NIGHT', description: 'Choose to stay.', category: 'ending' },
  { id: 'BREAK_THE_RULES', title: 'BREAK THE RULES', description: 'Reach the hidden sabotage ending.', hidden: true, category: 'ending' },
  { id: 'CLOCKED_OUT_FOR_GOOD', title: 'CLOCKED OUT FOR GOOD', description: 'See all three endings.', hidden: true, category: 'ending' },
  { id: 'DALE_WAS_FINE', title: 'DALE WAS FINE', description: 'Serve Dale. He remains completely harmless.', category: 'mastery' },
  { id: 'EMPLOYEE_OF_THE_MONTH', title: 'EMPLOYEE OF THE MONTH', description: 'Finish a campaign night with every assigned chore complete and no known rule broken.', category: 'mastery' },
  { id: 'TENURE', title: 'TENURE', description: 'Finish all five campaign nights.', category: 'campaign' },
  { id: 'RULE_FOLLOWER', title: 'RULE FOLLOWER', description: 'Finish a night without breaking a known rule.', category: 'mastery' },
  { id: 'RULE_BREAKER', title: 'RULE BREAKER', description: 'Break a supernatural rule and survive the shift.', category: 'mastery' },
  { id: 'CAMERA_SHY', title: 'CAMERA SHY', description: 'Witness a CCTV-only anomaly.', category: 'anomaly' },
  { id: 'PUMP_SEVEN', title: 'PUMP 7', description: 'Witness Pump 7 activity.', category: 'anomaly' },
  { id: 'THREE_THIRTY_THREE', title: '3:33', description: 'Witness the frozen clock.', category: 'anomaly' },
  { id: 'NO_SERVICE', title: 'NO SERVICE', description: 'Refuse a dangerous fuel authorization.', category: 'mastery' },
  { id: 'NOBODY_HOME', title: 'NOBODY HOME', description: 'Check the rear door after the knocking stops.', category: 'anomaly' },
  { id: 'WRONG_NUMBER', title: 'WRONG NUMBER', description: 'Answer the counter phone.', category: 'anomaly' },
  { id: 'PAPER_TRAIL', title: 'PAPER TRAIL', description: 'Inspect an impossible receipt.', category: 'anomaly' },
  { id: 'NIGHT_AUDITOR', title: 'NIGHT AUDITOR', description: 'Read every optional office record.', category: 'lore' },
  { id: 'LARRY', title: 'LARRY', description: 'Meet Larry.', hidden: true, category: 'campaign' },
  { id: 'MYTHIC', title: 'YOU SAW THAT TOO?', description: 'Witness any mythic event.', hidden: true, category: 'anomaly' },
  { id: 'ALL_MYTHICS', title: 'FOLKLORE', description: 'Witness all mythic events.', hidden: true, category: 'anomaly' },
  { id: 'ENDLESS_30', title: 'GRAVEYARD SHIFT', description: 'Survive 30 real minutes in Endless Mode.', category: 'endless' },
  { id: 'ENDLESS_60', title: 'STILL HERE', description: 'Survive 60 real minutes in Endless Mode.', category: 'endless' },
  { id: 'ENDLESS_100', title: 'OPEN FOREVER', description: 'Survive 100 anomalies in Endless Mode.', hidden: true, category: 'endless' },
  { id: 'PERFECT_WEEK', title: 'PERFECT WEEK', description: 'Finish all five campaign nights without a known rule violation.', category: 'mastery' },
  { id: 'ALL_ACHIEVEMENTS', title: 'NIGHT MANAGER', description: 'Unlock every other achievement.', hidden: true, category: 'mastery' }
];

export const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((x) => [x.id, x]));
