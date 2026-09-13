/**
 * vitest 環境設定：jsdom 缺少的 API 補上最小實作，讓元件測試能跑。
 */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// jsdom 尚未實作 <dialog> 的 showModal/close 與 matchMedia / IntersectionObserver / scrollIntoView
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & { showModal?: () => void; close?: () => void };
  if (!proto.showModal) {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (!proto.close) {
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }
}
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
if (!('IntersectionObserver' in window)) {
  class IO {
    observe() {}
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', { value: IO, writable: true });
}
window.scrollTo = () => {};
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
