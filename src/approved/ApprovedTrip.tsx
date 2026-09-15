import { Component as ReactComponent, type ChangeEvent, type ReactNode } from 'react';
import data from '../data/approved-trip.json';
import { ApprovedTripSchema } from '../domain/schema';
import { renderApprovedView } from './view';

type Tab = 'itinerary' | 'backups' | 'tools' | 'packing';
type Fx = { rate: number; updatedAt: string; savedAt: number };
interface State {
 tab: Tab; selectedDayId: string | null; expanded: Record<string, boolean>; packChecked: Record<string, boolean>;
 gullLaunch: number; reduceMotion: boolean;
 showDriverCard: boolean; prepOpen: boolean; showManualRate: boolean; krwInput: string; manualRateInput: string;
 fx: Fx | null; fxStale?: boolean; fxError?: boolean; showAllBackups: boolean;
}

function naverUrl(query: string) { return 'https://map.naver.com/p/search/' + encodeURIComponent(query); }

function ymd(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(date);
}
function nowSeoul() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', hour12: false, hour: '2-digit', minute: '2-digit' }).formatToParts(new Date());
  const h = parts.find((p) => p.type === 'hour')!.value;
  const m = parts.find((p) => p.type === 'minute')!.value;
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}
function parseRangeMinutes(t: string) {
  const m = t.match(/(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { start: parseInt(m[1]!, 10) * 60 + parseInt(m[2]!, 10), end: parseInt(m[3]!, 10) * 60 + parseInt(m[4]!, 10) };
}
function splitTime(t: string) {
  const m = t.match(/^(\d{1,2}:\d{2})(?:[–-](\d{1,2}:\d{2}))?/);
  if (!m) return { isClock: false, start: '', end: '' };
  return { isClock: true, start: m[1], end: m[2] || '' };
}

export class ApprovedTrip extends ReactComponent<Record<string, never>, State> {
  trip = ApprovedTripSchema.parse(data);
  defaultDayId: string;
  render(): ReactNode { return renderApprovedView(this.renderVals()); }

  state: State = { tab: 'itinerary', selectedDayId: null, expanded: {}, packChecked: {}, gullLaunch: 0, reduceMotion: false, showDriverCard: false, prepOpen: false, showManualRate: false, krwInput: '', manualRateInput: '', fx: null, showAllBackups: false };

  constructor(props: Record<string, never>) {
    super(props);
    const today = ymd(new Date());
    const match = this.trip.days.find((d) => d.date === today);
    this.defaultDayId = match ? match.id : 'd1';
    let savedDayId = null;
    try { savedDayId = localStorage.getItem('busan-selected-day'); } catch { /* Storage can be unavailable in private browsing. */ }
    const savedValid = savedDayId && this.trip.days.some((d) => d.id === savedDayId);
    this.state.selectedDayId = savedValid ? savedDayId : this.defaultDayId;
  }

  componentDidMount() {
    try {
      const savedPack = JSON.parse(localStorage.getItem('busan-pack-v1') || '{}');
      const savedReduce = localStorage.getItem('busan-reduce-motion');
      const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.setState({ packChecked: savedPack, reduceMotion: savedReduce !== null ? savedReduce === '1' : !!prefersReduce });
    } catch { /* Storage can be unavailable in private browsing. */ }
    this.loadFx();
  }
  async loadFx() {
    try {
      const cached = JSON.parse(localStorage.getItem('busan-fx-v1') || 'null');
      if (cached && Date.now() - cached.savedAt < 24 * 3600 * 1000) { this.setState({ fx: cached }); return; }
      const res = await fetch('https://open.er-api.com/v6/latest/KRW');
      const data = await res.json();
      const rate = data && data.rates ? data.rates.TWD : null;
      if (rate) {
        const fx = { rate, updatedAt: data.time_last_update_utc || new Date().toISOString(), savedAt: Date.now() };
        localStorage.setItem('busan-fx-v1', JSON.stringify(fx));
        this.setState({ fx });
      } else if (cached) this.setState({ fx: cached, fxStale: true });
    } catch {
      try {
        const cached = JSON.parse(localStorage.getItem('busan-fx-v1') || 'null');
        if (cached) this.setState({ fx: cached, fxStale: true });
        else this.setState({ fxError: true });
      } catch { this.setState({ fxError: true }); }
    }
  }

  setTab = (tab: Tab) => { this.setState({ tab }); window.scrollTo({ top: 0 }); };
  selectDay = (id: string) => {
    if (id === this.state.selectedDayId) return;
    this.setState(state => ({ selectedDayId: id, gullLaunch: state.gullLaunch + 1 }));
    try { localStorage.setItem('busan-selected-day', id); } catch { /* Storage can be unavailable in private browsing. */ }
  };
  goToday = () => { this.selectDay(this.defaultDayId); };
  toggleExpand = (key: string) => this.setState((s) => ({ expanded: { ...s.expanded, [key]: !s.expanded[key] } }));
  togglePack = (id: string) => this.setState((s) => {
    const next = { ...s.packChecked, [id]: !s.packChecked[id] };
    try { localStorage.setItem('busan-pack-v1', JSON.stringify(next)); } catch { /* Storage can be unavailable in private browsing. */ }
    return { packChecked: next };
  });
  toggleDriverCard = () => this.setState((s) => ({ showDriverCard: !s.showDriverCard }));
  togglePrep = () => this.setState((s) => ({ prepOpen: !s.prepOpen }));
  toggleReduceMotion = () => this.setState((s) => {
    const next = !s.reduceMotion;
    try { localStorage.setItem('busan-reduce-motion', next ? '1' : '0'); } catch { /* Storage can be unavailable in private browsing. */ }
    return { reduceMotion: next };
  });
  toggleManualRate = () => this.setState((s) => ({ showManualRate: !s.showManualRate }));
  toggleShowAllBackups = () => this.setState((s) => ({ showAllBackups: !s.showAllBackups }));
  onKrwChange = (e: ChangeEvent<HTMLInputElement>) => this.setState({ krwInput: e.target.value });
  onManualRateChange = (e: ChangeEvent<HTMLInputElement>) => this.setState({ manualRateInput: e.target.value });

  renderVals() {
    const { tab, selectedDayId, expanded, packChecked, gullLaunch, reduceMotion, showDriverCard, prepOpen, showManualRate, krwInput, manualRateInput, fx, fxStale, fxError, showAllBackups } = this.state;
    const trip = this.trip;
    const todayKR = ymd(new Date());

    const days = trip.days.map((d) => {
      const selected = d.id === selectedDayId;
      const isToday = d.date === todayKR;
      return { ...d, select: () => this.selectDay(d.id), current: selected ? true : undefined, pressed: selected, bg: selected ? '#246B8E' : '#fff', color: selected ? '#fff' : '#183848', border: isToday && !selected ? '#246B8E' : '#D6E3E8' };
    });

    const current = trip.days.find((d) => d.id === selectedDayId) || trip.days[0]!;
    const isTodayView = current.date === todayKR;
    const nowMin = isTodayView ? nowSeoul() : -1;

    const dayItems = current.items.map((it, i) => {
      const key = current.id + '-' + i;
      const meta = it.status ? trip.statusMeta[it.status] : null;
      const isExpanded = !!expanded[key];
      const isTransit = it.kind === 'transit';
      const range = !isTransit ? parseRangeMinutes(it.time) : null;
      const isNow = range && nowMin >= range.start && nowMin <= range.end;
      const clock = !isTransit ? splitTime(it.time) : { isClock: false, start: '', end: '' };
      const hasDetails = !isTransit && !!(it.note && it.note.trim());
      const hasSteps = !isTransit && !!(it.steps && it.steps.length);
      const place = it.placeKey ? trip.places[it.placeKey] : null;
      return {
        ...it,
        key,
        isTransit,
        isEvent: !isTransit,
        expanded: isExpanded,
        detailId: 'detail-' + key,
        chevronDeg: isExpanded ? '180deg' : '0deg',
        tagLabel: isNow ? '現在' : (meta ? meta.label : ''),
        tagColor: isNow ? '#246B8E' : (meta ? meta.color : '#5B7280'),
        borderColor: isNow ? '#246B8E' : '#EEF3F5',
        isClockTime: clock.isClock,
        timeStart: clock.start, timeEnd: clock.end,
        showTimeLabel: !isTransit && !clock.isClock,
        hasDetails, noDetails: !hasDetails, hasSteps, stepList: it.steps || [],
        ariaLabel: it.title + '詳情',
        showMap: !!place,
        mapUrl: place ? naverUrl(place.query) : '',
        toggle: () => this.toggleExpand(key),
      };
    });

    const dayBackups = trip.backupGroups.filter((g) => g.dayId === selectedDayId);
    const visibleBackupGroups = showAllBackups ? trip.backupGroups : dayBackups;
    const noBackupsToday = !showAllBackups && dayBackups.length === 0;

    const packCats = trip.packing.map((cat) => {
      const items = cat.items.map((it) => {
        const checked = !!packChecked[it.id];
        return { ...it, checked, toggle: () => this.togglePack(it.id), textColor: checked ? '#5B7280' : '#183848', strike: checked ? 'line-through' : 'none' };
      });
      return { ...cat, items };
    });
    const packTotal = packCats.reduce((a, c) => a + c.items.length, 0);
    const packDone = packCats.reduce((a, c) => a + c.items.filter((i) => i.checked).length, 0);

    let rate = null;
    let fxStatusLine = '正在取得匯率…';
    const manualNum = parseFloat(manualRateInput);
    if (manualRateInput && !isNaN(manualNum) && manualNum > 0) { rate = manualNum; fxStatusLine = '使用手動匯率'; }
    else if (fx && fx.rate) {
      rate = fx.rate;
      const d = new Date(fx.updatedAt);
      const dateStr = isNaN(d.getTime()) ? '' : (d.getMonth() + 1) + '/' + d.getDate();
      fxStatusLine = (fxStale ? '離線・使用上次資料・' : '參考匯率・') + dateStr + ' 更新（open.er-api.com）';
    } else if (fxError) fxStatusLine = '無法取得匯率，可手動輸入';
    const krwNum = parseFloat((krwInput || '').replace(/,/g, ''));
    let twdResult = '約 NT$ —';
    if (rate && !isNaN(krwNum) && krwNum >= 0) twdResult = '約 NT$ ' + Math.round(krwNum * rate).toLocaleString('zh-TW');

    const tabIndex = { itinerary: 0, backups: 1, tools: 2, packing: 3 }[tab];
    const colorFor = (t: Tab) => (tab === t ? '#246B8E' : '#5B7280');
    const currentFor = (t: Tab) => (tab === t ? 'page' as const : undefined);

    return {
      isItinerary: tab === 'itinerary', isBackups: tab === 'backups', isTools: tab === 'tools', isPacking: tab === 'packing',
      tripName: trip.trip.name, dateRange: trip.trip.dateRange,
      days, currentDay: current, dayItems,
      showTodayButton: !!trip.days.find((d) => d.date === todayKR) && selectedDayId !== this.defaultDayId,
      goToday: this.goToday,
      gullLaunch, reduceMotion: reduceMotion ? 'true' : 'false',
      backupsHeading: showAllBackups ? '全部備案' : (current.dateLabel + ' 備案'),
      showAllBackupsLabel: showAllBackups ? ('只看 ' + current.dateLabel) : '查看全部',
      toggleShowAllBackups: this.toggleShowAllBackups,
      visibleBackupGroups, hasVisibleBackups: visibleBackupGroups.length > 0, noBackupsToday,
      toolsFixed: trip.tools.fixed.map((f) => ({ ...f, statusLabel: f.booked ? '已訂' : '未購買', statusColor: f.booked ? '#1F6B3A' : '#8F4718' })),
      toolsTransit: trip.tools.transit.map((t) => ({ ...t, pendingLabel: t.pending ? '待訂' : '' })),
      toolsTodo: trip.tools.todo, toolsAddress: trip.tools.address,
      lodging: trip.lodging, showDriverCard, toggleDriverCard: this.toggleDriverCard,
      prepOpen, prepChevronDeg: prepOpen ? '180deg' : '0deg', togglePrep: this.togglePrep,
      reduceMotionChecked: reduceMotion, toggleReduceMotion: this.toggleReduceMotion,
      krwInput, onKrwChange: this.onKrwChange, twdResult, fxStatusLine,
      showManualRate, manualRateInput, onManualRateChange: this.onManualRateChange, toggleManualRate: this.toggleManualRate,
      manualToggleLabel: showManualRate ? '收起手動輸入' : '沒有網路？手動輸入匯率',
      packCats, packDone, packTotal,
      navIndicatorLeft: 'calc(' + tabIndex + ' * 25%)',
      itineraryColor: colorFor('itinerary'), backupsColor: colorFor('backups'), toolsColor: colorFor('tools'), packingColor: colorFor('packing'),
      itineraryCurrent: currentFor('itinerary'), backupsCurrent: currentFor('backups'), toolsCurrent: currentFor('tools'), packingCurrent: currentFor('packing'),
      setTab1: () => this.setTab('itinerary'), setTab2: () => this.setTab('backups'), setTab3: () => this.setTab('tools'), setTab4: () => this.setTab('packing'),
    };
  }
}
