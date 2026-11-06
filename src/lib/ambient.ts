/** Generates focus background noise locally with Web Audio (no files, no network). */
export type Ambient = "off" | "white" | "brown" | "rain";
export function startAmbient(kind: Exclude<Ambient, "off">): () => void {
  const ctx = new AudioContext();
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "white") d[i] = w * 0.25;
    else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
  }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const gain = ctx.createGain(); gain.gain.value = kind === "rain" ? 0.5 : 0.35;
  let node: AudioNode = src;
  if (kind === "rain") { const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 900; src.connect(f); node = f; }
  node.connect(gain).connect(ctx.destination); src.start();
  return () => { try { src.stop(); } catch { /* already stopped */ } void ctx.close(); };
}
