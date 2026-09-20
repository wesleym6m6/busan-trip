import { useId, useState, type CSSProperties } from 'react';
import type { ApprovedTrip } from './ApprovedTrip';
import { CardIllustration } from './CardIllustration';
import './content-cards.css';

type View = ReturnType<ApprovedTrip['renderVals']>;
type Item = View['dayItems'][number];
type Backup = View['visibleBackupGroups'][number]['items'][number];

function Chevron({ expanded }: { expanded: boolean }) {
  return <svg aria-hidden="true" className="content-chevron" data-expanded={expanded} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;
}

function MapLink({ url, label }: { url: string; label: string }) {
  return <a className="content-map" href={url} aria-label={`${label}地圖搜尋`} target="_blank" rel="noopener noreferrer">
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11Z" /><circle cx="12" cy="10" r="2.2" /></svg>
    地圖搜尋
  </a>;
}

function PracticalDetails({ details }: { details: string[] }) {
  return <ul className="content-facts">{details.map((detail, i) => <li key={i}>{detail}</li>)}</ul>;
}

export function ItineraryCard({ item: it }: { item: Item }) {
  if (it.isTransit) return <li className="trip-transit"><span>{it.time}</span><span>{it.title}</span></li>;

  const heading = <>
    <span className="trip-card-meta">
      <span className={it.isClockTime ? 'trip-card-time' : 'trip-card-relative'}>
        {it.isClockTime ? <>{it.timeStart}{it.timeEnd && <span className="trip-card-time-end">–{it.timeEnd}</span>}{it.timeQualifier && <span data-time-qualifier className="trip-card-qualifier">{it.timeQualifier}</span>}</> : it.time}
      </span>
      {it.tagLabel && <span className="trip-card-status" style={{color: it.tagColor}}><span aria-hidden="true">●</span>{it.tagLabel}</span>}
      {it.hasDetails && <Chevron expanded={it.expanded} />}
    </span>
    <span className="trip-card-title">{it.title}</span>
    {(it.hasSteps || it.illustrationKey) && <span className="trip-card-summary">
      {it.illustrationKey && <CardIllustration key={it.illustrationKey} name={it.illustrationKey} />}
      {it.hasSteps && <span className="trip-card-steps">{it.stepList.map((step, i) => <span key={i}>{step}</span>)}</span>}
    </span>}
  </>;

  return <li className="trip-card" style={{'--card-border': it.borderColor} as CSSProperties}>
    {it.hasDetails ? <button className="trip-card-heading" onClick={it.toggle} aria-expanded={it.expanded} aria-controls={it.detailId} aria-label={it.ariaLabel}>{heading}</button> : <div className="trip-card-heading">{heading}</div>}
    {(it.visitLabel || it.showMap) && <div className="trip-card-actions">
      {it.visitLabel && <span className="trip-card-budget">{it.visitLabel}</span>}
      {it.showMap && <MapLink url={it.mapUrl} label={it.title} />}
    </div>}
    {it.expanded && <div id={it.detailId} className="trip-card-detail">
      {it.description && <p className="content-description">{it.description}</p>}
      {!!it.placeDetails.length && <section className="content-practical" aria-label="現場資訊">
        <h3 className="content-label">現場資訊</h3>
        <PracticalDetails details={it.placeDetails} />
      </section>}
      {it.note?.trim() && <section className="content-plan" aria-label="這次安排">
        <h3 className="content-label">這次安排</h3>
        {it.note.split('\n').filter(line => line.trim()).map((line, i) => <p key={i}>{line}</p>)}
      </section>}
    </div>}
  </li>;
}

function BackupPlace({ place, role }: { place: Backup['main']; role: string }) {
  const [expanded, setExpanded] = useState(false);
  const detailId = useId();
  const details = place.details || [];
  return <section className="backup-place">
    <div className="backup-place-role">{role}</div>
    <h4 className="backup-place-title">{place.label}</h4>
    {place.description && <p className="content-description">{place.description}</p>}
    <div className="backup-place-actions">
      {!!details.length && <button className="backup-detail-toggle" aria-label={`${place.label}用餐資訊`} aria-controls={detailId} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>用餐資訊<Chevron expanded={expanded} /></button>}
      <MapLink url={place.mapUrl} label={place.label} />
    </div>
    {expanded && <div id={detailId} className="backup-place-details"><PracticalDetails details={details} /></div>}
  </section>;
}

export function BackupCard({ backup }: { backup: Backup }) {
  return <div className="backup-card">
    <BackupPlace key={backup.main.query} place={backup.main} role="主餐廳" />
    <BackupPlace key={backup.backup.query} place={backup.backup} role="備選" />
    {backup.others.map(place => <BackupPlace key={place.query} place={place} role="也可以考慮" />)}
    {backup.note && <p className="backup-decision">{backup.note}</p>}
  </div>;
}
