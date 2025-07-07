// src/utils/getImagePrompt.ts

export function getImagePrompt(task: string, emoji?: string) {
  return `
Color pencil sketch style illustration of ${task}.
A cozy, gentle scene without humans, showing only objects or actions related to the habit ${emoji || ''}.
Soft lighting, pastel tones. Ultra-detailed, warm feeling, no faces, no characters.
`;
}
