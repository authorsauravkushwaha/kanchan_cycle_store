import { describe, expect, it, vi } from 'vitest';
import { clamp, readMotionPreference, revealPose, saveMotionPreference, sceneProgress } from '../src/lib/motion';

describe('reversible scroll choreography', () => {
  it('clamps normalized progress without overshoot', () => {
    expect(clamp(-2)).toBe(0);
    expect(clamp(0.42)).toBe(0.42);
    expect(clamp(3)).toBe(1);
  });

  it('maps the same scroll position to the same hero pose in either direction', () => {
    const positions = [0, 120, 300, 520, 780];
    const down = positions.map(y => sceneProgress(y, 110, 700, 900, true));
    const up = [...positions].reverse().map(y => sceneProgress(y, 110, 700, 900, true));
    expect(up).toEqual([...down].reverse());
    expect(down[0]).toBe(0);
    expect(down.at(-1)).toBe(1);
    expect(down.every((value, index) => index === 0 || value >= down[index - 1])).toBe(true);
  });

  it('animates ordinary sections across their viewport journey', () => {
    expect(sceneProgress(0, 1200, 600, 900)).toBe(0);
    expect(sceneProgress(1200, 1200, 600, 900)).toBeCloseTo(0.6);
    expect(sceneProgress(2400, 1200, 600, 900)).toBe(1);
  });

  it('reveals cards without fading text and restores the pose on scroll-up', () => {
    const below = revealPose(0, 1100, 260, 900);
    const settled = revealPose(700, 1100, 260, 900);
    const returned = revealPose(0, 1100, 260, 900);
    expect(below.y).toBeGreaterThan(0);
    expect(below.scale).toBeLessThan(1);
    expect(settled.y).toBeLessThanOrEqual(0);
    expect(settled.scale).toBe(1);
    expect(returned).toEqual(below);
    expect(below.opacity).toBe(1);
    expect(settled.opacity).toBe(1);
  });

  it('handles zero-sized layouts safely', () => {
    expect(sceneProgress(100, 0, 0, 900)).toBe(0);
    expect(sceneProgress(100, 0, 500, 0)).toBe(0);
    expect(revealPose(0, 0, 0, 0).scale).toBe(1);
  });

  it('remembers an explicit pause but survives unavailable storage', () => {
    saveMotionPreference(true);
    expect(readMotionPreference()).toBe(true);
    saveMotionPreference(false);
    expect(readMotionPreference()).toBe(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    expect(readMotionPreference()).toBe(false);
    expect(() => saveMotionPreference(true)).not.toThrow();
  });
});
