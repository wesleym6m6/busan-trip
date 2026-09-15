import { fireEvent, render, screen, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function ready() {
  render(<App />);
  await act(async () => {});
  const sprite = document.querySelector('[data-gull-sprite]');
  if (sprite) fireEvent.load(sprite);
}
const endAnimation = (element: Element, animationName: string) => {
  // Without AnimationEvent, React detects jsdom's WebKit-prefixed event.
  const type = 'AnimationEvent' in window ? 'animationend' : 'webkitAnimationEnd';
  const event = Object.assign(new Event(type, {bubbles:true}), {animationName});
  fireEvent(element, event);
};
const flying = () => Array.from(document.querySelectorAll<HTMLElement>('[data-flight-id]'));

describe('頁首海鷗的獨立生命週期', () => {
  it('連續切日新增海鷗，保留先前個體直到各自飛完', async () => {
    await ready();
    expect(flying()).toHaveLength(1);
    const first = flying()[0]!;
    fireEvent.click(screen.getByRole('button', {name:'10/04 週日'}));
    fireEvent.click(screen.getByRole('button', {name:'10/05 週一'}));
    expect(flying()).toHaveLength(3);
    expect(flying()[0]).toBe(first);
    endAnimation(flying()[1]!, 'gull-traverse');
    expect(flying()).toHaveLength(2);
    expect(flying()[0]).toBe(first);
    endAnimation(first, 'gull-traverse');
    expect(flying()).toHaveLength(1);
  });
  it('不同個體有大小、方向、路徑差異；拍翅事件不會刪掉飛行', async () => {
    await ready();
    for(const name of ['10/04 週日','10/05 週一','10/06 週二']) fireEvent.click(screen.getByRole('button',{name}));
    expect(new Set(flying().map(f=>f.getAttribute('data-direction'))).size).toBe(2);
    expect(new Set(flying().map(f=>f.style.getPropertyValue('--gull-size'))).size).toBeGreaterThan(1);
    expect(new Set(flying().map(f=>f.style.getPropertyValue('--gull-y-mid'))).size).toBeGreaterThan(1);
    endAnimation(flying()[0]!.querySelector('.gull-sprite')!, 'gull-wingbeat');
    expect(flying()).toHaveLength(4);
  });
  it('減少動態時維持靜態海岸，不累積海鷗', async () => {
    localStorage.setItem('busan-reduce-motion','1');
    await ready();
    fireEvent.click(screen.getByRole('button',{name:'10/04 週日'}));
    expect(flying()).toHaveLength(0);
    expect(document.querySelector('.coastal-header')?.getAttribute('data-motion')).toBe('reduced');
    expect(screen.getByAltText('廣安大橋與海灘')).toBeTruthy();
  });
});
