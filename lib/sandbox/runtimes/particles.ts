import type { ParticleConfig } from "../protocol";

/**
 * Spawns particles for any event-triggered effect.
 *
 * Deliberately ignorant of shape. It creates elements, colours them, staggers
 * them and cleans them up; WHERE each one goes comes from the effect's own
 * `place`, handed in as already-computed declarations. That's what keeps a new
 * particle effect a data change — this file never learns about a third one.
 *
 * All motion is the effect's keyframe. Nothing here animates anything.
 */

export const PARTICLE_ATTR = "data-sandbox-particle";

export function spawnParticles(
  doc: Document,
  layer: HTMLElement,
  origin: { x: number; y: number },
  config: ParticleConfig,
  /** Per-particle custom properties, from the effect's `place`. */
  placements: Record<string, string>[],
) {
  for (let i = 0; i < config.count; i++) {
    const particle = doc.createElement("span");
    particle.setAttribute(PARTICLE_ATTR, "");
    particle.style.position = "absolute";
    particle.style.left = `${origin.x}px`;
    particle.style.top = `${origin.y}px`;
    particle.style.width = `${config.size}px`;
    particle.style.height = `${config.size}px`;

    const tint = config.colors[i % config.colors.length] ?? "currentColor";
    if (config.glyph) {
      // A constant authored in the effect definition, never user input.
      particle.innerHTML = config.glyph;
      // Colour reaches the SVG through currentColor, not a background.
      particle.style.color = tint;
      particle.style.lineHeight = "0";
    } else {
      particle.style.borderRadius = i % 3 === 0 ? "2px" : "50%";
      particle.style.background = tint;
    }

    for (const [prop, value] of Object.entries(placements[i] ?? {})) {
      particle.style.setProperty(prop, value);
    }

    particle.style.animationName = config.keyframe;
    particle.style.animationDuration = `${config.duration}ms`;
    particle.style.animationTimingFunction = config.easing;
    // "both", not "forwards": a staggered particle would otherwise sit visible
    // at its un-animated base style during its delay, so a stream would show as
    // a pile of dots on the target before any of them launched. Backwards fill
    // applies the 0% keyframe (opacity 0) during the wait instead.
    particle.style.animationFillMode = "both";
    // A stagger makes the effect draw itself rather than appear at once; the
    // jitter stops it reading as a mechanical sweep.
    particle.style.animationDelay = `${i * config.stagger + Math.random() * 40}ms`;

    particle.addEventListener("animationend", () => particle.remove(), {
      once: true,
    });
    layer.append(particle);
  }
}
