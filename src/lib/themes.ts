// ── Theme system ─────────────────────────────────────────────
// A theme = a palette (swaps the CSS colour variables) + an optional
// decorative background pattern + optional per-page accent colours.

export type ThemePref = {
  palette?: string;
  pattern?: string;
  perPage?: Record<string, string>; // viewKey -> hex
};

type Vars = Record<string, string>;

export type Palette = { id: string; name: string; group: 'gentle' | 'bold' | 'dark'; vars: Vars };

// Full variable set per palette so switching fully repaints (and back again).
export const PALETTES: Palette[] = [
  {
    id: 'classic', name: 'Classic Paper', group: 'gentle', vars: {
      '--paper': '#f6f1e7', '--paper2': '#efe7d6', '--card': '#fffdf8', '--ink': '#2b2419', '--ink-soft': '#6b6150',
      '--line': '#e0d5c0', '--line-strong': '#cdbfa3',
      '--plum': '#7c5cbf', '--plum-soft': '#efe9fb', '--rose': '#d6608a', '--rose-soft': '#fbe9f0',
      '--sage': '#5f8d6a', '--sage-soft': '#e8f1e7', '--gold': '#c79a3a', '--gold-soft': '#f7eecf',
      '--sky': '#5685b5', '--sky-soft': '#e6eef6', '--terra': '#c46a44',
    },
  },
  {
    id: 'pastel', name: 'Soft Pastel', group: 'gentle', vars: {
      '--paper': '#fcf7f9', '--paper2': '#f5ecf1', '--card': '#fffbfd', '--ink': '#4a4048', '--ink-soft': '#8c8090',
      '--line': '#efe2ea', '--line-strong': '#ddc9d6',
      '--plum': '#b49ad9', '--plum-soft': '#f1ebfa', '--rose': '#eaa6c0', '--rose-soft': '#fceef4',
      '--sage': '#a7cdb0', '--sage-soft': '#ecf4ed', '--gold': '#e6cd86', '--gold-soft': '#f9f1d8',
      '--sky': '#a9c8e2', '--sky-soft': '#eef4fa', '--terra': '#e6b196',
    },
  },
  {
    id: 'bold', name: 'Bold Blocks', group: 'bold', vars: {
      '--paper': '#ffffff', '--paper2': '#f2f2f4', '--card': '#ffffff', '--ink': '#161616', '--ink-soft': '#5a5a5a',
      '--line': '#e3e3e6', '--line-strong': '#c7c7cc',
      '--plum': '#6d28d9', '--plum-soft': '#ece3fb', '--rose': '#e11d6a', '--rose-soft': '#fce1ec',
      '--sage': '#18794e', '--sage-soft': '#dcf0e4', '--gold': '#d39e00', '--gold-soft': '#f8edcc',
      '--sky': '#2563eb', '--sky-soft': '#e0e8fd', '--terra': '#ea580c',
    },
  },
  {
    id: 'berry', name: 'Berry', group: 'bold', vars: {
      '--paper': '#fbf3f4', '--paper2': '#f4e6e9', '--card': '#fffafb', '--ink': '#3a2230', '--ink-soft': '#82606f',
      '--line': '#ecd9de', '--line-strong': '#d9b8c2',
      '--plum': '#8e4585', '--plum-soft': '#f4e6f1', '--rose': '#c43e6a', '--rose-soft': '#f8e0e8',
      '--sage': '#7a8b58', '--sage-soft': '#eef0e2', '--gold': '#c98a3a', '--gold-soft': '#f6ecd6',
      '--sky': '#6f7bb5', '--sky-soft': '#e9ebf5', '--terra': '#b9523f',
    },
  },
  {
    id: 'ocean', name: 'Ocean', group: 'gentle', vars: {
      '--paper': '#f0f5f6', '--paper2': '#e3edee', '--card': '#fbfdfd', '--ink': '#1f3036', '--ink-soft': '#5e7177',
      '--line': '#d3e1e2', '--line-strong': '#b3c8ca',
      '--plum': '#2f8f8f', '--plum-soft': '#e0f0ef', '--rose': '#e0857a', '--rose-soft': '#fbe9e5',
      '--sage': '#3f9e7c', '--sage-soft': '#e3f3ec', '--gold': '#cfa63f', '--gold-soft': '#f6efd6',
      '--sky': '#2f7fb0', '--sky-soft': '#e3eef6', '--terra': '#cf6b4a',
    },
  },
  {
    id: 'midnight', name: 'Midnight', group: 'dark', vars: {
      '--paper': '#21262e', '--paper2': '#2b313b', '--card': '#2b313b', '--ink': '#ece6da', '--ink-soft': '#9aa0ab',
      '--line': '#39414c', '--line-strong': '#4b5563',
      '--plum': '#a98be6', '--plum-soft': '#34304a', '--rose': '#ec7aa3', '--rose-soft': '#3d2a36',
      '--sage': '#6cc08a', '--sage-soft': '#233a2e', '--gold': '#e2bd63', '--gold-soft': '#3a3320',
      '--sky': '#6fa8dc', '--sky-soft': '#25303d', '--terra': '#e08a5f',
    },
  },
];

export const getPalette = (id?: string) => PALETTES.find(p => p.id === id) || PALETTES[0];

// ── Decorative background patterns ───────────────────────────
// Returned as inline background-image / size. 'dots' = default (handled specially).
export type Pattern = { id: string; name: string; group: 'plain' | 'girly' | 'sharp' };

export const PATTERNS: Pattern[] = [
  { id: 'dots', name: 'Dots (default)', group: 'plain' },
  { id: 'none', name: 'Plain', group: 'plain' },
  { id: 'bows', name: 'Bows', group: 'girly' },
  { id: 'cheetah', name: 'Cheetah', group: 'girly' },
  { id: 'hearts', name: 'Hearts', group: 'girly' },
  { id: 'plaid', name: 'Plaid', group: 'sharp' },
  { id: 'grid', name: 'Graph', group: 'sharp' },
  { id: 'waves', name: 'Waves', group: 'sharp' },
];

// pattern colour: faint, works on light themes; for dark we pass a light tint.
function patternImage(id: string, dark: boolean): { backgroundImage: string; backgroundSize: string } | null {
  const c = dark ? 'rgba(230,224,210,0.06)' : 'rgba(140,118,84,0.13)';
  const cEnc = encodeURIComponent(dark ? '#e6e0d2' : '#8c7654');
  const op = dark ? '0.07' : '0.16';
  switch (id) {
    case 'bows':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cg fill='none' stroke='${cEnc}' stroke-width='1.3' opacity='${op}'%3E%3Cpath d='M22 22 L12 16 L12 28 Z'/%3E%3Cpath d='M22 22 L32 16 L32 28 Z'/%3E%3Ccircle cx='22' cy='22' r='2.3' fill='${cEnc}' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '44px 44px',
      };
    case 'cheetah':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cg fill='${cEnc}' opacity='${op}'%3E%3Cellipse cx='16' cy='15' rx='6' ry='5'/%3E%3Cellipse cx='47' cy='30' rx='7' ry='5'/%3E%3Cellipse cx='26' cy='52' rx='6' ry='6'/%3E%3Cellipse cx='60' cy='60' rx='5' ry='6'/%3E%3Cellipse cx='58' cy='10' rx='5' ry='5'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '72px 72px',
      };
    case 'hearts':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='38' height='38'%3E%3Cpath d='M19 28 C9 20 11 12 16 12 C19 12 19 15 19 15 C19 15 19 12 22 12 C27 12 29 20 19 28 Z' fill='${cEnc}' opacity='${op}'/%3E%3C/svg%3E")`,
        backgroundSize: '38px 38px',
      };
    case 'plaid':
      return {
        backgroundImage: `repeating-linear-gradient(0deg, ${c} 0 2px, transparent 2px 26px), repeating-linear-gradient(90deg, ${c} 0 2px, transparent 2px 26px)`,
        backgroundSize: 'auto',
      };
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
        backgroundSize: '26px 26px',
      };
    case 'waves':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='20'%3E%3Cpath d='M0 10 Q15 0 30 10 T60 10' fill='none' stroke='${cEnc}' stroke-width='1.4' opacity='${op}'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 20px',
      };
    default:
      return null;
  }
}

// Apply a whole theme (palette + per-page paper tint + accent + pattern) to the DOM.
export function applyTheme(theme: ThemePref, view: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const pal = getPalette(theme.palette);
  Object.entries(pal.vars).forEach(([k, v]) => root.style.setProperty(k, v));

  // per-page accent: tint the page + set an accent var
  const perPage = theme.perPage?.[view];
  if (perPage) {
    root.style.setProperty('--paper', tint(perPage, 0.9));
    root.style.setProperty('--paper2', tint(perPage, 0.84));
    root.style.setProperty('--page-accent', perPage);
  } else {
    root.style.setProperty('--page-accent', pal.vars['--plum']);
  }

  // decorative pattern on the body
  const dark = pal.group === 'dark';
  const body = document.body;
  if (theme.pattern === 'none') { body.style.backgroundImage = 'none'; }
  else if (!theme.pattern || theme.pattern === 'dots') { body.style.backgroundImage = ''; body.style.backgroundSize = ''; }
  else {
    const p = patternImage(theme.pattern, dark);
    if (p) { body.style.backgroundImage = p.backgroundImage; body.style.backgroundSize = p.backgroundSize; }
  }
}

// mix a hex colour toward white by `amt` (0..1)
export function tint(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amt);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
