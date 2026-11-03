const nf = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });

export const fmtNumber = (n) => nf.format(n ?? 0);
export const fmtKg = (kg) => ((kg ?? 0) >= 1000 ? `${nf.format(kg / 1000)} t` : `${nf.format(kg ?? 0)} kg`);
export const fmtXaf = (n) => `${Math.round(n ?? 0).toLocaleString('fr-CM')} XAF`;

export const fmtDate = (d) =>
  d ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

export function timeAgo(iso) {
  if (!iso) return 'Never';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} d ago` : fmtDate(iso);
}

export function fmtUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min ${Math.floor(seconds % 60)} s`;
}

export const fmtBytes = (b) => {
  const mb = (b ?? 0) / (1024 * 1024);
  return mb >= 1024 ? `${nf.format(mb / 1024)} GB` : `${nf.format(mb)} MB`;
};

const LABELS = {
  WATERING: 'Watering', TREATMENT: 'Treatment', FERTILIZING: 'Fertilizing', WEEDING: 'Weeding',
  ACTIVE: 'Active', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
  CROP: 'Crop', LIVESTOCK: 'Livestock', MIXED: 'Mixed',
  SEEDS: 'Seeds', FERTILIZER: 'Fertilizer', PESTICIDE: 'Pesticide', OTHER: 'Other',
  KG: 'kg', TONS: 't', BAGS: 'bags',
  REGISTER: 'Signed up', LOGIN: 'Signed in', LOGIN_FAILED: 'Failed sign-in',
  GOOGLE_REGISTER: 'Signed up with Google', GOOGLE_LOGIN: 'Signed in with Google', GOOGLE_LOGIN_FAILED: 'Google sign-in failed',
};
export const label = (key) => LABELS[key] || key || '—';

export const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).map((n) => n[0]).join('').substring(0, 2).toUpperCase() || '?';
