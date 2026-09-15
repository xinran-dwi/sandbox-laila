import type { BurstConfig } from "../protocol";

/**
 * Spawns confetti particles. Deliberately tiny: it positions elements and sets
 * three custom properties per particle, then gets out of the way — the motion
 * is entirely the effect's keyframe.
 *
 * NOTE: `exportSnippet` below is the one piece of genuine duplication in the
 * motion lab. Everything else derives from a single source, but a runtime
 * can't be mechanically turned into readable example code. Keep the two in
 * step by hand; there is little enough here that it should stay cheap.
 */

export const PARTICLE_ATTR = "data-sandbox-particle";

export function spawnBurst(
  doc: Document,
  layer: HTMLElement,
  origin: { x: number; y: number },
  config: BurstConfig,
) {
  for (let i = 0; i < config.count; i++) {
    const angle = (Math.PI * 2 * i) / config.count + Math.random() * 0.5;
    const reach = config.distance * (0.55 + Math.random() * 0.65);

    const particle = doc.createElement("span");
    particle.setAttribute(PARTICLE_ATTR, "");
    particle.style.position = "absolute";
    particle.style.left = `${origin.x}px`;
    particle.style.top = `${origin.y}px`;
    particle.style.width = `${config.size}px`;
    particle.style.height = `${config.size}px`;
    particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    particle.style.background =
      config.colors[i % config.colors.length] ?? "currentColor";
    particle.style.setProperty("--x", `${Math.cos(angle) * reach}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * reach}px`);
    particle.style.setProperty("--r", `${Math.round(Math.random() * 720 - 360)}deg`);
    particle.style.animationName = config.keyframe;
    particle.style.animationDuration = `${config.duration}ms`;
    particle.style.animationTimingFunction = "cubic-bezier(.15,.7,.3,1)";
    particle.style.animationFillMode = "forwards";
    particle.style.animationDelay = `${Math.random() * 60}ms`;

    particle.addEventListener("animationend", () => particle.remove(), {
      once: true,
    });
    layer.append(particle);
  }
}

/** Shown in the panel's JS tab. Mirrors spawnBurst above — keep in step. */
export const exportSnippet = `// Fire a burst from an element's centre. Pair with the CSS from the CSS tab.
export function burstFrom(el: HTMLElement, opts = {}) {
  const { count = 18, distance = 90, size = 7, duration = 900,
          colors = ["#d8e200", "#e6b9ff", "#f2f4fd"] } = opts;
  const box = el.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999";
  document.body.append(layer);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const reach = distance * (0.55 + Math.random() * 0.65);
    const p = document.createElement("span");
    p.style.cssText =
      \`position:absolute;left:\${box.left + box.width / 2}px;top:\${box.top + box.height / 2}px;\` +
      \`width:\${size}px;height:\${size}px;border-radius:\${Math.random() > 0.5 ? "50%" : "2px"};\` +
      \`background:\${colors[i % colors.length]};animation:fly \${duration}ms cubic-bezier(.15,.7,.3,1) forwards\`;
    p.style.setProperty("--x", \`\${Math.cos(angle) * reach}px\`);
    p.style.setProperty("--y", \`\${Math.sin(angle) * reach}px\`);
    p.style.setProperty("--r", \`\${Math.round(Math.random() * 720 - 360)}deg\`);
    layer.append(p);
  }
  setTimeout(() => layer.remove(), duration + 400);
}`;
