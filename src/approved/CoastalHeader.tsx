import { Component, createRef, type CSSProperties, type AnimationEvent } from 'react';
import { assetUrl } from './assets';
import { SeaCanvas } from './SeaCanvas';
import './header-motion.css';

interface Flight { id: number; direction: 'right' | 'left'; style: CSSProperties; duration: number }
interface Props { launchId: number; reduced: boolean }
interface State { flights: Flight[]; spriteReady: boolean; visible: boolean; hidden: boolean }
const poses = [
  {x: 65, width: 620, offset: 0},
  {x: 720, width: 760, offset: 748},
  {x: 1540, width: 590, offset: 1456},
];

/** Each change creates a new keyed flight; existing flights finish independently. */
export class CoastalHeader extends Component<Props, State> {
  state: State = { flights: [], spriteReady: false, visible: true, hidden: document.hidden };
  private lastLaunch = -1;
  private container = createRef<HTMLDivElement>();
  private observer?: IntersectionObserver;
  componentDidMount() {
    document.addEventListener('visibilitychange', this.visibility);
    this.observer = new IntersectionObserver(entries => this.setState({visible: !!entries[0]?.isIntersecting}));
    this.observer.observe(this.container.current!);
  }
  componentDidUpdate(previous: Props) {
    if (previous.launchId !== this.props.launchId || previous.reduced !== this.props.reduced) this.launchPending();
  }
  componentWillUnmount() { document.removeEventListener('visibilitychange', this.visibility); this.observer?.disconnect(); }
  private visibility = () => this.setState({hidden: document.hidden});
  private launchPending = () => {
    if (this.props.reduced) {
      this.lastLaunch = this.props.launchId;
      if (this.state.flights.length) this.setState({flights: []});
      return;
    }
    if (!this.state.spriteReady || this.lastLaunch >= this.props.launchId) return;
    const added: Flight[] = [];
    while (this.lastLaunch < this.props.launchId) {
      const id = ++this.lastLaunch;
      // Alternate near/far paths and direction, with small per-flight variation.
      const direction = id % 2 === 0 ? 'right' : 'left';
      const size = [65, 43, 55, 36][id % 4]!;
      const duration = [6.0, 7.2, 5.8, 6.7][id % 4]! + Math.random() * 0.5;
      const high = id % 3 === 1;
      const start = high ? 2 : 16 + (id % 3) * 6;
      const middle = high ? 20 : 1 + (id % 3) * 3;
      const end = 8 + (id % 4) * 7;
      added.push({id, direction, duration, style: {
        '--gull-size': `${size}px`, '--gull-start': direction === 'right' ? '-84px' : 'calc(100vw + 84px)',
        '--gull-end': direction === 'right' ? 'calc(100vw + 84px)' : '-84px',
        '--gull-y-start': `${start}px`, '--gull-y-mid': `${middle}px`, '--gull-y-end': `${end}px`,
        '--gull-facing': direction === 'right' ? 1 : -1,
        '--gull-bank': `${high ? 9 : -7}deg`, '--wingbeat': `${1.65 + (id % 3) * .35}s`,
        animationDuration: `${duration}s`, '--flight-time': `${duration}s`,
      } as CSSProperties});
    }
    this.setState(state => ({flights: [...state.flights, ...added]}));
  };
  private finish = (id: number, event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.animationName !== 'gull-traverse') return;
    this.setState(state => ({flights: state.flights.filter(f => f.id !== id)}));
  };
  render() {
    const paused = this.state.hidden || !this.state.visible;
    return <div ref={this.container} className="coastal-header" data-motion={this.props.reduced ? 'reduced' : paused ? 'paused' : 'running'}>
      <img className="coastal-art" src={assetUrl('uploads/busan-coast.png')} alt="廣安大橋與海灘" width="1983" height="793" />
      <SeaCanvas paused={paused} reduced={this.props.reduced} />
      <img className="gull-preload" data-gull-sprite src={assetUrl('uploads/seagull-flight-sheet.png')} alt="" aria-hidden="true"
        onLoad={() => this.setState({spriteReady:true}, this.launchPending)} />
      {this.state.flights.map(flight => <div key={flight.id} className="gull-flight" data-flight-id={flight.id} data-direction={flight.direction}
        style={flight.style} aria-hidden="true" onAnimationEnd={event => this.finish(flight.id, event)}>
        <div className="gull-arc"><div className="gull-facing"><div className="gull-sprite">
          {poses.map((pose, index) => <svg key={index} className={`gull-pose gull-pose-${index}`} viewBox="0 0 724 724" overflow="visible">
            <defs><clipPath id={`gull-crop-${flight.id}-${index}`}><rect x={pose.x} y="0" width={pose.width} height="724" /></clipPath></defs>
            <g transform={`translate(${-pose.offset} 0)`}>
              <image href={assetUrl('uploads/seagull-flight-sheet.png')} width="2172" height="724" clipPath={`url(#gull-crop-${flight.id}-${index})`} />
            </g>
          </svg>)}
        </div></div></div>
      </div>)}
    </div>;
  }
}
