import { Component, createRef } from 'react';
import { assetUrl } from './assets';
import { createSeaRenderer, type SeaRenderer } from './seaRenderer';

export class SeaCanvas extends Component<{ paused: boolean; reduced: boolean }, { ready: boolean }> {
  state = { ready: false };
  private canvas = createRef<HTMLCanvasElement>();
  private renderer: SeaRenderer | null = null;
  private source?: HTMLImageElement;
  private frame?: number;
  private lastTime?: number;
  private seconds = 0;
  private generation = 0;
  private resize?: ResizeObserver;
  componentDidMount() {
    const generation = ++this.generation;
    this.canvas.current?.addEventListener('webglcontextlost', this.contextLost);
    this.canvas.current?.addEventListener('webglcontextrestored', this.initialize);
    this.source = new Image();
    this.source.onload = () => { if (generation === this.generation) this.initialize(); };
    this.source.src = assetUrl('uploads/busan-coast.png');
    if (typeof ResizeObserver !== 'undefined') {
      this.resize = new ResizeObserver(() => this.renderer?.draw(this.seconds));
      this.resize.observe(this.canvas.current!);
    }
  }
  componentDidUpdate(previous: Readonly<{paused: boolean; reduced: boolean}>) {
    if (previous.paused !== this.props.paused || previous.reduced !== this.props.reduced) this.schedule();
  }
  componentWillUnmount() {
    ++this.generation;
    this.canvas.current?.removeEventListener('webglcontextlost', this.contextLost);
    this.canvas.current?.removeEventListener('webglcontextrestored', this.initialize);
    if (this.source) this.source.onload = null;
    cancelAnimationFrame(this.frame ?? 0); this.resize?.disconnect(); this.renderer?.dispose();
  }
  private contextLost = (event: Event) => {
    event.preventDefault(); cancelAnimationFrame(this.frame ?? 0);
    this.renderer?.dispose(); this.renderer = null; this.setState({ready:false});
  };
  private initialize = () => {
    if (!this.canvas.current || !this.source) return;
    this.renderer?.dispose();
    this.renderer = createSeaRenderer(this.canvas.current, this.source);
    this.setState({ready: !!this.renderer});
    this.renderer?.draw(this.seconds);
    this.schedule();
  };
  private schedule = () => {
    cancelAnimationFrame(this.frame ?? 0); this.lastTime = undefined;
    if (this.renderer && !this.props.paused && !this.props.reduced) this.frame = requestAnimationFrame(this.tick);
  };
  private tick = (now: number) => {
    if (this.props.paused || this.props.reduced) return;
    if (this.lastTime === undefined) this.lastTime = now;
    const delta = now - this.lastTime;
    if (delta >= 1000 / 30) {
      this.seconds += Math.min(delta, 100) / 1000;
      this.lastTime = now;
      this.renderer?.draw(this.seconds);
    }
    this.frame = requestAnimationFrame(this.tick);
  };
  render() {
    return <canvas ref={this.canvas} className="sea-canvas" aria-hidden="true"
      data-renderer={this.state.ready ? 'webgl' : 'static'}
      data-playing={this.state.ready && !this.props.paused && !this.props.reduced}
      style={{opacity: this.state.ready && !this.props.reduced ? 1 : 0}} />;
  }
}
