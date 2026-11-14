import { formatPct } from "./format";
import { formatWinRate } from "./ladder";
import type { LadderRow } from "./types";

/** Canvas drawing for the 1080x1080 ladder share card (drawn on-device, never uploaded). */

export const CARD_COLORS = {
  bg: "#0b0c0e",
  surface: "#14161a",
  fg: "#ecece8",
  muted: "#8a8d85",
  subtle: "#5c5f59",
  gain: "#3d8a5c",
  loss: "#c45c52",
};

const SANS = `"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif`;

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in ctx)
    (ctx as unknown as { letterSpacing: string }).letterSpacing = value;
}

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** The paper-sheet-with-a-line brand mark, scaled from its 32x32 viewBox. */
export function drawLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const s = size / 32;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  roundRectPath(ctx, 1, 1, 30, 30, 8);
  ctx.fillStyle = CARD_COLORS.surface;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, 8.5);
  ctx.lineTo(19.2, 8.5);
  ctx.lineTo(23, 12.2);
  ctx.lineTo(23, 23.2);
  ctx.arcTo(23, 24.5, 21.7, 24.5, 1.3);
  ctx.lineTo(9, 24.5);
  ctx.arcTo(7.7, 24.5, 7.7, 23.2, 1.3);
  ctx.lineTo(7.7, 9.8);
  ctx.arcTo(7.7, 8.5, 9, 8.5, 1.3);
  ctx.closePath();
  ctx.fillStyle = CARD_COLORS.bg;
  ctx.fill();
  ctx.strokeStyle = CARD_COLORS.fg;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(19.2, 8.5);
  ctx.lineTo(19.2, 11.9);
  ctx.arcTo(19.2, 12.6, 19.9, 12.6, 0.7);
  ctx.lineTo(23, 12.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(11, 20.2);
  ctx.lineTo(14.2, 16.6);
  ctx.lineTo(16.6, 18.4);
  ctx.lineTo(20.8, 13.8);
  ctx.strokeStyle = CARD_COLORS.fg;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

export async function drawLadderCard(
  canvas: HTMLCanvasElement,
  row: LadderRow,
) {
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  try {
    await Promise.all([
      document.fonts.load("600 160px Fraunces"),
      document.fonts.load(`500 28px "IBM Plex Sans"`),
      document.fonts.load(`400 22px "IBM Plex Sans"`),
    ]);
  } catch {
    /* fonts are optional – fall back to system */
  }
  const C = CARD_COLORS;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(236, 236, 232, 0.12)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, 48, 48, 984, 984, 36);
  ctx.stroke();
  drawLogo(ctx, 96, 96, 64);

  ctx.fillStyle = C.muted;
  ctx.font = `500 22px ${SANS}`;
  setLetterSpacing(ctx, "0.28em");
  ctx.fillText("PHANTASTIC PAPER", 180, 128);
  setLetterSpacing(ctx, "0px");
  ctx.fillStyle = C.fg;
  ctx.font = `500 36px ${SANS}`;
  ctx.fillText(row.handle, 96, 220);

  const headline = row.closed
    ? formatWinRate(row)
    : formatPct(row.returnPct, 1);
  const label = row.closed ? "WIN RATE" : "PAPER RETURN";
  ctx.fillStyle = row.closed
    ? row.winRate >= 0.5
      ? C.gain
      : C.loss
    : row.returnPct >= 0
      ? C.gain
      : C.loss;
  ctx.font = "italic 600 168px Fraunces, Georgia, serif";
  ctx.fillText(headline, 96, 430);
  ctx.fillStyle = C.subtle;
  ctx.font = `500 22px ${SANS}`;
  setLetterSpacing(ctx, "0.22em");
  ctx.fillText(label, 96, 490);
  setLetterSpacing(ctx, "0px");

  const tiles: { k: string; v: string; tone?: string }[] = [
    {
      k: "RETURN",
      v: formatPct(row.returnPct, 1),
      tone: row.returnPct >= 0 ? C.gain : C.loss,
    },
    { k: "CLOSED", v: row.closed ? `${row.wins}/${row.closed}` : "none" },
    { k: "STREAK", v: row.streak > 0 ? `Day ${row.streak}` : "—" },
  ];
  tiles.forEach((tile, i) => {
    const x = 96 + i * 304;
    ctx.fillStyle = C.surface;
    roundRectPath(ctx, x, 560, 280, 160, 20);
    ctx.fill();
    ctx.fillStyle = C.subtle;
    ctx.font = `500 18px ${SANS}`;
    setLetterSpacing(ctx, "0.18em");
    ctx.fillText(tile.k, x + 24, 612);
    setLetterSpacing(ctx, "0px");
    ctx.fillStyle = tile.tone ?? C.fg;
    ctx.font = "500 44px Fraunces, Georgia, serif";
    ctx.fillText(tile.v, x + 24, 676);
  });

  ctx.fillStyle = C.muted;
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText(
    "Simulated results  ·  paper desk  ·  not a live book",
    96,
    860,
  );
  ctx.fillStyle = C.subtle;
  ctx.font = `500 18px ${SANS}`;
  ctx.fillText("Climb the ladder. Come back tomorrow.", 96, 910);
}

// ---------------------------------------------------------------------------
// "Phantastic Paper is live" launch card + share links

export const LAUNCH_URL = "https://phantastic.net";
export const LAUNCH_TITLE = "Phantastic Paper is live";
export const LAUNCH_TEXT =
  "Grok flies a paper desk. Fake money. Real tape. Paper fills at last quote — not a broker, not advice. https://phantastic.net";

export function launchShareLinks() {
  const u = encodeURIComponent(LAUNCH_URL);
  const t = encodeURIComponent(LAUNCH_TEXT);
  return {
    x: `https://x.com/intent/tweet?text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    threads: `https://www.threads.net/intent/post?text=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    reddit: `https://www.reddit.com/submit?url=${u}&title=${encodeURIComponent(LAUNCH_TITLE)}`,
    bluesky: `https://bsky.app/intent/compose?text=${t}`,
    whatsapp: `https://wa.me/?text=${t}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
    hn: `https://news.ycombinator.com/submitlink?u=${u}&t=Show%20HN%3A%20Phantastic%20Paper%20%E2%80%94%20Grok%20flies%20a%20paper%20desk`,
  };
}

export async function drawLaunchCard(canvas: HTMLCanvasElement) {
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  try {
    await Promise.all([
      document.fonts.load("600 120px Fraunces"),
      document.fonts.load(`500 28px "IBM Plex Sans"`),
      document.fonts.load(`400 24px "IBM Plex Sans"`),
    ]);
  } catch {
    /* optional */
  }
  const C = CARD_COLORS;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(236, 236, 232, 0.12)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, 48, 48, 984, 984, 36);
  ctx.stroke();
  drawLogo(ctx, 96, 96, 64);
  ctx.fillStyle = C.muted;
  ctx.font = `500 22px ${SANS}`;
  setLetterSpacing(ctx, "0.28em");
  ctx.fillText("PHANTASTIC PAPER", 180, 128);
  setLetterSpacing(ctx, "0px");
  ctx.fillStyle = C.fg;
  ctx.font = "italic 600 92px Fraunces, Georgia, serif";
  ctx.fillText("Grok flies the", 96, 340);
  ctx.fillText("paper desk.", 96, 450);
  ctx.fillStyle = C.muted;
  ctx.font = `400 32px ${SANS}`;
  ctx.fillText("Fake money. Real tape.", 96, 560);
  ctx.fillStyle = C.surface;
  roundRectPath(ctx, 96, 640, 888, 160, 24);
  ctx.fill();
  ctx.fillStyle = C.subtle;
  ctx.font = `500 18px ${SANS}`;
  setLetterSpacing(ctx, "0.18em");
  ctx.fillText("LIVE", 128, 700);
  setLetterSpacing(ctx, "0px");
  ctx.fillStyle = C.fg;
  ctx.font = `500 36px ${SANS}`;
  ctx.fillText("phantastic.net", 128, 754);
  ctx.fillStyle = C.subtle;
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText("Paper fills at last quote. Not a broker.", 96, 910);
}
