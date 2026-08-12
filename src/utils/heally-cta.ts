export type HeallyCtaType = 'generate_schedule' | 'open_screening' | 'open_daily_log';

export type HeallyCtaAction = {
  type: HeallyCtaType;
  label: string;
};

const CTA_REGEX = /\[HEALLY_CTA:([^|\]]+)(?:\|([^\]]+))?\]/g;

export function parseHeallyCtas(content: string): {
  cleanContent: string;
  actions: HeallyCtaAction[];
} {
  const actions: HeallyCtaAction[] = [];
  const seen = new Set<string>();

  for (const match of content.matchAll(CTA_REGEX)) {
    const type = match[1] as HeallyCtaType;
    const label = (match[2] ?? match[1]).trim();
    if (seen.has(type)) continue;
    seen.add(type);
    actions.push({ type, label });
  }

  const cleanContent = content.replace(CTA_REGEX, '').replace(/\n{3,}/g, '\n\n').trim();
  return { cleanContent, actions };
}

export function isScheduleIntentMessage(message: string): boolean {
  return /jadwal|schedule|rutin harian|buatkan.*(makan|olahraga)|generate.*schedule/i.test(message);
}
