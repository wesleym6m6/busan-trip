import { Fragment, type CSSProperties, type ReactNode } from 'react';
import type { ApprovedTrip } from './ApprovedTrip';
import { assetUrl } from './assets';

/** Direct translation of the approved Claude template; keep layout and copy aligned with the baseline. */
export function renderApprovedView(v: ReturnType<ApprovedTrip['renderVals']>): ReactNode {
 return <>
<div data-reduce-motion={v.reduceMotion} style={({"fontFamily": "'Noto Sans TC','Manrope',-apple-system,BlinkMacSystemFont,'PingFang TC','Apple SD Gothic Neo','Noto Sans KR','Segoe UI',Roboto,sans-serif", "color": "#183848", "background": "#F7FBFC", "minHeight": "100dvh", "position": "relative"} as CSSProperties)}>
<header style={({"paddingTop": "env(safe-area-inset-top)"} as CSSProperties)}>
<div ref={v.setHeaderRef} style={({"position": "relative", "height": "92px", "overflow": "hidden", "background": "#DCEEF2"} as CSSProperties)}>
<img src={assetUrl("uploads/busan-coast.png")} alt={"廣安大橋與海灘"} width={"1983"} height={"793"} style={({"position": "absolute", "inset": "0", "width": "100%", "height": "100%", "objectFit": "cover", "objectPosition": "50% 62%"} as CSSProperties)}/>
<div className={"om-foam"} aria-hidden={"true"} style={({"position": "absolute", "left": "0", "bottom": "0", "width": "30%", "height": "48%", "pointerEvents": "none", "animationPlayState": v.wavePlayState} as CSSProperties)}>
<svg viewBox={"0 0 100 48"} preserveAspectRatio={"none"} style={({"width": "100%", "height": "100%", "display": "block"} as CSSProperties)}>
<path d={"M0,14 Q10,6 20,13 T40,10 Q50,17 58,12 L58,48 L0,48 Z"} fill={"#fff"} style={({"filter": "blur(.6px)", "animation": "foam-breathe-a 9s ease-in-out infinite", "animationPlayState": v.wavePlayState} as CSSProperties)}></path>
<path d={"M0,20 Q9,14 18,19 T36,17 Q46,22 54,18 L54,48 L0,48 Z"} fill={"#fff"} style={({"filter": "blur(.8px)", "animation": "foam-breathe-b 11.5s ease-in-out infinite -4s", "animationPlayState": v.wavePlayState} as CSSProperties)}></path>
</svg>
</div>
<div className={"om-foam"} aria-hidden={"true"} style={({"position": "absolute", "right": "0", "bottom": "0", "width": "18%", "height": "40%", "pointerEvents": "none", "animationPlayState": v.wavePlayState} as CSSProperties)}>
<svg viewBox={"0 0 60 40"} preserveAspectRatio={"none"} style={({"width": "100%", "height": "100%", "display": "block"} as CSSProperties)}>
<path d={"M60,16 Q50,8 40,14 T20,11 Q10,17 0,13 L0,40 L60,40 Z"} fill={"#fff"} style={({"filter": "blur(.6px)", "animation": "foam-breathe-a 10.5s ease-in-out infinite -2s", "animationPlayState": v.wavePlayState} as CSSProperties)}></path>
<path d={"M60,22 Q52,17 42,21 T22,19 Q12,23 2,20 L2,40 L60,40 Z"} fill={"#fff"} style={({"filter": "blur(.8px)", "animation": "foam-breathe-b 13s ease-in-out infinite -6s", "animationPlayState": v.wavePlayState} as CSSProperties)}></path>
</svg>
</div>
{!!(v.showGull) && <>
<img className={"om-gull"} src={assetUrl("uploads/seagull.png")} alt={""} aria-hidden={"true"} width={"56"} height={"41"} style={({"position": "absolute", "top": "12px", "left": "0", "width": "56px", "height": "41px", "pointerEvents": "none", "animation": "gull-pass 1.6s ease-in-out 1 forwards"} as CSSProperties)}/>
 </>}
</div>
<div style={({"padding": "7px 16px", "background": "#F7FBFC", "borderBottom": "1px solid #D6E3E8", "display": "flex", "justifyContent": "space-between", "alignItems": "baseline"} as CSSProperties)}>
<span style={({"fontWeight": 700, "fontSize": "14px", "color": "#183848"} as CSSProperties)}>{v.tripName}</span>
<span style={({"fontSize": "11px", "color": "#5B7280", "fontFamily": "'Manrope',sans-serif"} as CSSProperties)}>{v.dateRange}</span>
</div>
</header>
<main style={({"maxWidth": "640px", "margin": "0 auto", "padding": "0 16px calc(60px + env(safe-area-inset-bottom) + 20px)", "boxSizing": "border-box"} as CSSProperties)}>
{!!(v.isItinerary) && <>
<div style={({"position": "sticky", "top": "0", "zIndex": 10, "background": "#F7FBFC", "margin": "0 -16px", "padding": "8px 16px 6px", "borderBottom": "1px solid #D6E3E8"} as CSSProperties)}>
<div style={({"display": "flex", "gap": "6px"} as CSSProperties)}>
{v.days.map((day, index1) => <Fragment key={index1}>
<button onClick={day.select} aria-current={day.current} aria-pressed={day.pressed} style={({"flex": 1, "minWidth": "0", "minHeight": "44px", "padding": "6px 2px", "borderRadius": "12px", "border": "1px solid " + day.border, "background": day.bg, "color": day.color, "cursor": "pointer", "textAlign": "center", "transition": "background-color 160ms,color 160ms"} as CSSProperties)} className={"approved-press-0"}>
<div style={({"fontFamily": "'Manrope',sans-serif", "fontSize": "13px", "fontWeight": 700, "fontVariantNumeric": "tabular-nums"} as CSSProperties)}>{day.dateLabel}</div>
<div style={({"fontSize": "11px", "opacity": .85, "marginTop": "1px"} as CSSProperties)}>{"週"}{day.weekday}</div>
</button>
</Fragment>)}
</div>
{!!(v.showTodayButton) && <>
<button onClick={v.goToday} style={({"marginTop": "6px", "fontSize": "12px", "fontWeight": 700, "color": "#246B8E", "background": "transparent", "border": "0", "padding": "2px 0", "cursor": "pointer"} as CSSProperties)}>{"回到今天"}</button>
 </>}
</div>
<section style={({"padding": "12px 0 8px", "display": "flex", "alignItems": "center", "gap": "12px"} as CSSProperties)}>
{!!(v.currentDay.image) && <>
<img src={assetUrl(v.currentDay.image)} alt={""} loading={"eager"} decoding={"async"} width={"120"} height={"80"} style={({"flex": "none", "width": "104px", "height": "70px", "objectFit": "cover", "borderRadius": "12px"} as CSSProperties)}/>
 </>}
<div style={({"minWidth": "0"} as CSSProperties)}>
<div style={({"fontSize": "12px", "color": "#5B7280", "fontFamily": "'Manrope',sans-serif", "fontWeight": 700} as CSSProperties)}>{v.currentDay.dateLabel}{"週"}{v.currentDay.weekday}</div>
<h1 style={({"fontSize": "25px", "fontWeight": 600, "margin": "2px 0 0", "lineHeight": 1.3} as CSSProperties)}>{v.currentDay.summary}</h1>
</div>
</section>
<ul style={({"listStyle": "none", "margin": "0", "padding": "0", "display": "flex", "flexDirection": "column", "gap": "10px"} as CSSProperties)}>
{v.dayItems.map((it, index2) => <Fragment key={index2}>
{!!(it.isEvent) && <>
<li style={({"background": "#FFFFFF", "border": "1px solid " + it.borderColor, "borderRadius": "16px", "boxShadow": "0 1px 2px rgba(24,56,72,.05)"} as CSSProperties)}>
{!!(it.hasDetails) && <>
<button onClick={it.toggle} aria-expanded={it.expanded} aria-controls={it.detailId} aria-label={it.ariaLabel} style={({"width": "100%", "display": "flex", "alignItems": "flex-start", "padding": "13px 14px", "gap": "12px", "minHeight": "44px", "background": "transparent", "border": "0", "textAlign": "left", "cursor": "pointer", "font": "inherit", "color": "inherit"} as CSSProperties)} className={"approved-press-1"}>
{!!(it.isClockTime) && <>
<div style={({"flex": "none", "width": "60px"} as CSSProperties)}>
<div style={({"fontFamily": "'Manrope',sans-serif", "fontWeight": 700, "fontSize": "17px"} as CSSProperties)}>{it.timeStart}</div>
{!!(it.timeEnd) && <>
<div style={({"fontFamily": "'Manrope',sans-serif", "fontWeight": 500, "fontSize": "12px", "color": "#5B7280"} as CSSProperties)}>{"–"}{it.timeEnd}</div>
 </>}
</div>
 </>}
<div style={({"minWidth": "0", "flex": 1} as CSSProperties)}>
{!!(it.showTimeLabel) && <>
<div style={({"fontSize": "12px", "fontWeight": 700, "color": "#246B8E", "marginBottom": "2px"} as CSSProperties)}>{it.time}</div>
 </>}
<div style={({"display": "flex", "alignItems": "baseline", "gap": "8px", "flexWrap": "wrap"} as CSSProperties)}>
<div style={({"fontSize": "18px", "fontWeight": 600, "lineHeight": 1.3} as CSSProperties)}>{it.title}</div>
{!!(it.tagLabel) && <>
<span style={({"display": "inline-flex", "alignItems": "center", "gap": "4px", "fontSize": "11px", "fontWeight": 700, "color": it.tagColor} as CSSProperties)}><span style={({"width": "6px", "height": "6px", "borderRadius": "50%", "background": it.tagColor} as CSSProperties)}></span>{it.tagLabel}</span>
 </>}
</div>
{!!(it.hasSteps) && <>
<ol style={({"listStyle": "none", "margin": "4px 0 0", "padding": "0", "display": "flex", "flexDirection": "column", "gap": "2px"} as CSSProperties)}>
{it.stepList.map((s, index3) => <Fragment key={index3}>
<li style={({"fontSize": "15px", "color": "#3E5A69", "lineHeight": 1.55} as CSSProperties)}>{s}</li>
</Fragment>)}
</ol>
 </>}
</div>
<span aria-hidden={"true"} style={({"flex": "none", "width": "24px", "height": "24px", "display": "flex", "alignItems": "center", "justifyContent": "center", "marginTop": "-2px"} as CSSProperties)}>
<svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5B7280"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} style={({"transform": "rotate(" + it.chevronDeg + ")", "transition": "transform 200ms"} as CSSProperties)}>
<path d={"m6 9 6 6 6-6"}></path>
</svg>
</span>
</button>
 </>}
{!!(it.noDetails) && <>
<div style={({"width": "100%", "display": "flex", "alignItems": "flex-start", "padding": "13px 14px", "gap": "12px", "minHeight": "44px"} as CSSProperties)}>
{!!(it.isClockTime) && <>
<div style={({"flex": "none", "width": "60px"} as CSSProperties)}>
<div style={({"fontFamily": "'Manrope',sans-serif", "fontWeight": 700, "fontSize": "17px"} as CSSProperties)}>{it.timeStart}</div>
{!!(it.timeEnd) && <>
<div style={({"fontFamily": "'Manrope',sans-serif", "fontWeight": 500, "fontSize": "12px", "color": "#5B7280"} as CSSProperties)}>{"–"}{it.timeEnd}</div>
 </>}
</div>
 </>}
<div style={({"minWidth": "0", "flex": 1} as CSSProperties)}>
{!!(it.showTimeLabel) && <>
<div style={({"fontSize": "12px", "fontWeight": 700, "color": "#246B8E", "marginBottom": "2px"} as CSSProperties)}>{it.time}</div>
 </>}
<div style={({"display": "flex", "alignItems": "baseline", "gap": "8px", "flexWrap": "wrap"} as CSSProperties)}>
<div style={({"fontSize": "18px", "fontWeight": 600, "lineHeight": 1.3} as CSSProperties)}>{it.title}</div>
{!!(it.tagLabel) && <>
<span style={({"display": "inline-flex", "alignItems": "center", "gap": "4px", "fontSize": "11px", "fontWeight": 700, "color": it.tagColor} as CSSProperties)}><span style={({"width": "6px", "height": "6px", "borderRadius": "50%", "background": it.tagColor} as CSSProperties)}></span>{it.tagLabel}</span>
 </>}
</div>
{!!(it.hasSteps) && <>
<ol style={({"listStyle": "none", "margin": "4px 0 0", "padding": "0", "display": "flex", "flexDirection": "column", "gap": "2px"} as CSSProperties)}>
{it.stepList.map((s, index4) => <Fragment key={index4}>
<li style={({"fontSize": "15px", "color": "#3E5A69", "lineHeight": 1.55} as CSSProperties)}>{s}</li>
</Fragment>)}
</ol>
 </>}
</div>
</div>
 </>}
{!!(it.showMap) && <>
<div style={({"padding": "0 14px 12px"} as CSSProperties)}>
<a href={it.mapUrl} target={"_blank"} rel={"noopener noreferrer"} style={({"display": "inline-flex", "alignItems": "center", "gap": "6px", "fontSize": "14px", "fontWeight": 700, "color": "#246B8E", "background": "#DCEEF2", "borderRadius": "10px", "padding": "9px 14px", "textDecoration": "none", "minHeight": "44px", "boxSizing": "border-box"} as CSSProperties)} className={"approved-press-2"}>
<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11Z"}></path><circle cx={"12"} cy={"10"} r={"2.2"}></circle></svg>{"\n                    地圖搜尋\n                  "}</a>
</div>
 </>}
{!!(it.expanded) && <>
<div id={it.detailId} style={({"padding": "0 14px 14px", "fontSize": "14px", "color": "#3E5A69", "lineHeight": 1.6, "borderTop": "1px solid #EEF3F5", "paddingTop": "10px", "whiteSpace": "pre-line", "animation": "fx-fade 200ms ease"} as CSSProperties)}>{it.note}</div>
 </>}
</li>
 </>}
{!!(it.isTransit) && <>
<li style={({"display": "flex", "alignItems": "baseline", "gap": "8px", "padding": "2px 4px", "fontSize": "13px", "color": "#5B7280"} as CSSProperties)}>
<span style={({"flex": "none", "fontFamily": "'Manrope',sans-serif", "fontWeight": 700, "color": "#183848"} as CSSProperties)}>{it.time}</span>
<span style={({"flex": 1, "minWidth": "0"} as CSSProperties)}>{it.title}</span>
</li>
 </>}
</Fragment>)}
</ul>
 </>}
{!!(v.isBackups) && <>
<div style={({"padding": "16px 0", "display": "flex", "flexDirection": "column", "gap": "16px"} as CSSProperties)}>
<div style={({"display": "flex", "alignItems": "center", "gap": "12px"} as CSSProperties)}>
<img src={assetUrl("uploads/pork-soup.png")} alt={""} loading={"lazy"} width={"200"} height={"140"} style={({"flex": "none", "width": "104px", "height": "auto", "borderRadius": "12px"} as CSSProperties)}/>
<div style={({"flex": 1, "minWidth": "0", "display": "flex", "justifyContent": "space-between", "alignItems": "baseline", "gap": "8px"} as CSSProperties)}>
<h2 style={({"fontSize": "14px", "fontWeight": 700, "color": "#183848", "margin": "0"} as CSSProperties)}>{v.backupsHeading}</h2>
<button onClick={v.toggleShowAllBackups} style={({"flex": "none", "fontSize": "12px", "fontWeight": 700, "color": "#246B8E", "background": "transparent", "border": "0", "cursor": "pointer"} as CSSProperties)}>{v.showAllBackupsLabel}</button>
</div>
</div>
{!!(v.hasVisibleBackups) && <>
{v.visibleBackupGroups.map((grp, index5) => <Fragment key={index5}>
<section >
<h3 style={({"fontSize": "12px", "fontWeight": 700, "color": "#5B7280", "margin": "0 0 8px"} as CSSProperties)}>{grp.label}</h3>
<div style={({"display": "flex", "flexDirection": "column", "gap": "10px"} as CSSProperties)}>
{grp.items.map((b, index6) => <Fragment key={index6}>
<div style={({"background": "#fff", "border": "1px solid #D6E3E8", "borderRadius": "16px", "padding": "14px", "boxShadow": "0 1px 2px rgba(24,56,72,.05)"} as CSSProperties)}>
<div style={({"display": "flex", "justifyContent": "space-between", "alignItems": "flex-start", "gap": "10px"} as CSSProperties)}>
<div style={({"minWidth": "0"} as CSSProperties)}>
<div style={({"fontSize": "11px", "fontWeight": 700, "color": "#246B8E"} as CSSProperties)}>{"主餐廳"}</div>
<div style={({"fontWeight": 700, "fontSize": "16px", "marginTop": "2px"} as CSSProperties)}>{b.main}</div>
</div>
<a href={b.mainMapUrl} target={"_blank"} rel={"noopener noreferrer"} style={({"flex": "none", "fontSize": "13px", "fontWeight": 700, "color": "#246B8E", "background": "#DCEEF2", "borderRadius": "10px", "padding": "8px 12px", "textDecoration": "none", "minHeight": "44px", "display": "flex", "alignItems": "center"} as CSSProperties)} className={"approved-press-3"}>{"地圖搜尋"}</a>
</div>
<div style={({"display": "flex", "justifyContent": "space-between", "alignItems": "flex-start", "gap": "10px", "marginTop": "10px", "paddingTop": "10px", "borderTop": "1px solid #EEF3F5"} as CSSProperties)}>
<div style={({"minWidth": "0"} as CSSProperties)}>
<div style={({"fontSize": "11px", "fontWeight": 700, "color": "#5B7280"} as CSSProperties)}>{"備選"}</div>
<div style={({"fontSize": "14px", "marginTop": "2px"} as CSSProperties)}>{b.backup}</div>
</div>
{!!(b.altMapUrl) && <>
<a href={b.altMapUrl} target={"_blank"} rel={"noopener noreferrer"} style={({"flex": "none", "fontSize": "13px", "fontWeight": 700, "color": "#5B7280", "background": "#F7FBFC", "border": "1px solid #D6E3E8", "borderRadius": "10px", "padding": "8px 12px", "textDecoration": "none", "minHeight": "44px", "display": "flex", "alignItems": "center"} as CSSProperties)} className={"approved-press-4"}>{"地圖搜尋"}</a>
 </>}
</div>
{!!(b.note) && <>
<div style={({"fontSize": "13px", "color": "#5B7280", "marginTop": "8px", "lineHeight": 1.5} as CSSProperties)}>{b.note}</div>
 </>}
</div>
</Fragment>)}
</div>
</section>
</Fragment>)}
 </>}
{!!(v.noBackupsToday) && <>
<div style={({"fontSize": "14px", "color": "#5B7280", "padding": "16px", "textAlign": "center", "background": "#fff", "border": "1px solid #D6E3E8", "borderRadius": "14px"} as CSSProperties)}>{"這天沒有另外安排備案。"}</div>
 </>}
</div>
 </>}
{!!(v.isTools) && <>
<div style={({"padding": "16px 0", "display": "flex", "flexDirection": "column", "gap": "20px"} as CSSProperties)}>
<section style={({"background": "#fff", "border": "1px solid #D6E3E8", "borderRadius": "16px", "padding": "16px"} as CSSProperties)}>
<h2 style={({"fontSize": "13px", "fontWeight": 700, "color": "#5B7280", "margin": "0 0 10px"} as CSSProperties)}>{"韓元換算"}</h2>
<div style={({"display": "flex", "alignItems": "center", "gap": "10px"} as CSSProperties)}>
<span style={({"fontFamily": "'Manrope',sans-serif", "fontWeight": 700, "color": "#5B7280"} as CSSProperties)}>{"₩"}</span>
<label style={({"flex": 1, "minWidth": "0"} as CSSProperties)}>
<span style={({"position": "absolute", "width": "1px", "height": "1px", "overflow": "hidden", "clip": "rect(0 0 0 0)"} as CSSProperties)}>{"韓元金額"}</span>
<input type={"text"} inputMode={"decimal"} value={v.krwInput} onChange={v.onKrwChange} placeholder={"輸入韓元金額"} style={({"width": "100%", "fontFamily": "'Manrope',sans-serif", "fontSize": "20px", "fontWeight": 700, "border": "0", "borderBottom": "2px solid #D6E3E8", "padding": "8px 2px", "background": "transparent", "color": "#183848"} as CSSProperties)}/>
</label>
</div>
<div style={({"fontSize": "24px", "fontWeight": 700, "marginTop": "12px", "color": "#246B8E"} as CSSProperties)}>{v.twdResult}</div>
<div style={({"fontSize": "12px", "color": "#5B7280", "marginTop": "6px"} as CSSProperties)}>{v.fxStatusLine}</div>
{!!(v.showManualRate) && <>
<div style={({"marginTop": "10px", "paddingTop": "10px", "borderTop": "1px solid #EEF3F5", "display": "flex", "alignItems": "center", "gap": "8px"} as CSSProperties)}>
<label htmlFor={"manual-rate-input"} style={({"fontSize": "13px", "color": "#5B7280", "flex": "none"} as CSSProperties)}>{"手動匯率 1 ₩ ="}</label>
<input id={"manual-rate-input"} type={"text"} inputMode={"decimal"} value={v.manualRateInput} onChange={v.onManualRateChange} aria-label={"手動匯率，1 韓元等於多少台幣"} placeholder={"0.023"} style={({"width": "80px", "fontSize": "14px", "border": "1px solid #D6E3E8", "borderRadius": "8px", "padding": "6px 8px"} as CSSProperties)}/>
<span style={({"fontSize": "13px", "color": "#5B7280"} as CSSProperties)}>{"NT$"}</span>
</div>
 </>}
<button onClick={v.toggleManualRate} style={({"marginTop": "8px", "fontSize": "12px", "color": "#246B8E", "background": "transparent", "border": "0", "padding": "0", "cursor": "pointer", "textDecoration": "underline"} as CSSProperties)}>{v.manualToggleLabel}</button>
</section>
<section >
<h2 style={({"fontSize": "13px", "fontWeight": 700, "color": "#5B7280", "margin": "0 0 8px"} as CSSProperties)}>{"住宿與地圖"}</h2>
<div style={({"background": "#fff", "border": "1px solid #D6E3E8", "borderRadius": "16px", "padding": "16px"} as CSSProperties)}>
<div style={({"fontWeight": 700, "fontSize": "16px"} as CSSProperties)}>{v.lodging.name}</div>
<div style={({"fontSize": "13px", "color": "#5B7280", "marginTop": "2px"} as CSSProperties)}>{v.lodging.area}</div>
<div style={({"marginTop": "10px", "padding": "10px 12px", "background": "#FBF0DD", "borderRadius": "10px", "fontSize": "13px", "color": "#7A4E14", "lineHeight": 1.5} as CSSProperties)}>{v.lodging.notice}</div>
<div style={({"display": "flex", "gap": "8px", "marginTop": "12px", "flexWrap": "wrap"} as CSSProperties)}>
<a href={v.lodging.mapUrl} target={"_blank"} rel={"noopener noreferrer"} style={({"flex": 1, "minWidth": "120px", "textAlign": "center", "fontSize": "14px", "fontWeight": 700, "color": "#fff", "background": "#246B8E", "borderRadius": "10px", "padding": "11px", "textDecoration": "none", "minHeight": "44px", "boxSizing": "border-box", "display": "flex", "alignItems": "center", "justifyContent": "center"} as CSSProperties)} className={"approved-press-5"}>{"地圖搜尋（僅區域）"}</a>
<button onClick={v.toggleDriverCard} style={({"flex": 1, "minWidth": "120px", "fontSize": "14px", "fontWeight": 700, "color": "#246B8E", "background": "#DCEEF2", "border": "0", "borderRadius": "10px", "padding": "11px", "cursor": "pointer", "minHeight": "44px"} as CSSProperties)}>{"附近地標（待確認）"}</button>
</div>
{!!(v.showDriverCard) && <>
<div style={({"marginTop": "12px", "padding": "16px", "background": "#183848", "borderRadius": "14px", "animation": "fx-fade 180ms ease"} as CSSProperties)}>
<div style={({"background": "rgba(224,150,134,.2)", "border": "1px solid rgba(224,150,134,.5)", "borderRadius": "8px", "padding": "8px 10px", "fontSize": "12px", "color": "#F7D9CE", "marginBottom": "12px", "textAlign": "center"} as CSSProperties)}>{"⚠ 這是附近地標，不是住宿門牌"}</div>
<div style={({"color": "#fff", "fontSize": "19px", "fontWeight": 700, "fontFamily": "'Manrope',sans-serif", "textAlign": "center"} as CSSProperties)} lang={"ko"}>{v.lodging.kr}</div>
<div style={({"color": "#B9D3DC", "fontSize": "12px", "marginTop": "6px", "textAlign": "center"} as CSSProperties)}>{v.lodging.crossRef}</div>
<div style={({"textAlign": "center", "marginTop": "14px"} as CSSProperties)}>
<button onClick={v.toggleDriverCard} style={({"fontSize": "13px", "color": "#fff", "background": "rgba(255,255,255,.15)", "border": "0", "borderRadius": "8px", "padding": "8px 16px", "cursor": "pointer"} as CSSProperties)}>{"關閉"}</button>
</div>
</div>
 </>}
</div>
</section>
<section >
<h2 style={({"fontSize": "13px", "fontWeight": 700, "color": "#5B7280", "margin": "0 0 8px"} as CSSProperties)}>{"票券與航班"}</h2>
<div style={({"display": "flex", "flexDirection": "column", "gap": "8px"} as CSSProperties)}>
{v.toolsFixed.map((f, index7) => <Fragment key={index7}>
<div style={({"background": "#fff", "border": "1px solid #D6E3E8", "borderRadius": "14px", "padding": "12px 14px", "display": "flex", "justifyContent": "space-between", "alignItems": "baseline", "gap": "10px"} as CSSProperties)}>
<div style={({"minWidth": "0"} as CSSProperties)}>
<div style={({"fontWeight": 700, "fontSize": "15px"} as CSSProperties)}>{f.label}</div>
<div style={({"fontSize": "13px", "color": "#5B7280", "marginTop": "2px"} as CSSProperties)}>{f.content}</div>
</div>
<span style={({"flex": "none", "fontSize": "11px", "fontWeight": 700, "color": f.statusColor} as CSSProperties)}>{f.statusLabel}</span>
</div>
</Fragment>)}
</div>
</section>
<section >
<h2 style={({"fontSize": "13px", "fontWeight": 700, "color": "#5B7280", "margin": "0 0 8px"} as CSSProperties)}>{"交通"}</h2>
<div style={({"display": "flex", "flexDirection": "column", "gap": "8px"} as CSSProperties)}>
{v.toolsTransit.map((t, index8) => <Fragment key={index8}>
<div style={({"background": "#DCEEF2", "borderRadius": "12px", "padding": "10px 12px", "fontSize": "13px", "color": "#3E5A69", "display": "flex", "justifyContent": "space-between", "alignItems": "baseline", "gap": "8px"} as CSSProperties)}>
<div style={({"minWidth": "0"} as CSSProperties)}>
<div style={({"fontWeight": 700} as CSSProperties)}>{t.leg}</div>
<div style={({"marginTop": "2px"} as CSSProperties)}>{t.mode}{" · "}{t.budget}</div>
</div>
{!!(t.pendingLabel) && <>
<span style={({"flex": "none", "fontSize": "11px", "fontWeight": 700, "color": "#8F4718"} as CSSProperties)}>{t.pendingLabel}</span>
 </>}
</div>
</Fragment>)}
</div>
</section>
<section >
<button onClick={v.togglePrep} aria-expanded={v.prepOpen} aria-controls={"prep-panel"} style={({"width": "100%", "display": "flex", "justifyContent": "space-between", "alignItems": "center", "background": "transparent", "border": "0", "padding": "6px 0", "cursor": "pointer", "minHeight": "44px"} as CSSProperties)}>
<span style={({"fontSize": "13px", "fontWeight": 700, "color": "#5B7280"} as CSSProperties)}>{"行前待辦與資料說明"}</span>
<svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5B7280"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} style={({"transform": "rotate(" + v.prepChevronDeg + ")", "transition": "transform 200ms"} as CSSProperties)}><path d={"m6 9 6 6 6-6"}></path></svg>
</button>
{!!(v.prepOpen) && <>
<div id={"prep-panel"} style={({"display": "flex", "flexDirection": "column", "gap": "8px", "marginTop": "8px", "animation": "fx-fade 180ms ease"} as CSSProperties)}>
{v.toolsTodo.map((td, index9) => <Fragment key={index9}>
<div style={({"background": "#fff", "border": "1px solid #D6E3E8", "borderRadius": "12px", "padding": "12px 14px"} as CSSProperties)}>
<div style={({"fontWeight": 700, "fontSize": "14px"} as CSSProperties)}>{td.item}</div>
<div style={({"fontSize": "13px", "color": "#5B7280", "marginTop": "3px"} as CSSProperties)}>{td.detail}</div>
</div>
</Fragment>)}
<div style={({"marginTop": "8px"} as CSSProperties)}>
<div style={({"fontSize": "12px", "fontWeight": 700, "color": "#5B7280", "marginBottom": "6px"} as CSSProperties)}>{"地點快查"}</div>
<div style={({"display": "flex", "flexDirection": "column", "gap": "6px"} as CSSProperties)}>
{v.toolsAddress.map((a, index10) => <Fragment key={index10}>
<a href={a.url} target={"_blank"} rel={"noopener noreferrer"} style={({"display": "flex", "justifyContent": "space-between", "alignItems": "center", "gap": "8px", "fontSize": "13px", "color": "#183848", "background": "#fff", "border": "1px solid #D6E3E8", "borderRadius": "10px", "padding": "9px 12px", "textDecoration": "none", "minHeight": "44px"} as CSSProperties)} className={"approved-press-6"}>
<span >{a.label}</span>
<span style={({"fontSize": "11px", "color": "#5B7280", "flex": "none"} as CSSProperties)}>{"搜尋 ↗"}</span>
</a>
</Fragment>)}
</div>
</div>
<label style={({"display": "flex", "alignItems": "center", "gap": "8px", "fontSize": "13px", "color": "#5B7280", "marginTop": "8px", "minHeight": "44px"} as CSSProperties)}>
<input type={"checkbox"} checked={v.reduceMotionChecked} onChange={v.toggleReduceMotion} style={({"width": "18px", "height": "18px"} as CSSProperties)}/>{"\n                減少動態效果\n              "}</label>
</div>
 </>}
</section>
</div>
 </>}
{!!(v.isPacking) && <>
<div style={({"padding": "16px 0", "display": "flex", "flexDirection": "column", "gap": "18px"} as CSSProperties)}>
<div style={({"fontSize": "14px", "color": "#5B7280"} as CSSProperties)}>{"已準備 "}{v.packDone}{"／"}{v.packTotal}{"・只保存在這支手機"}</div>
{v.packCats.map((cat, index11) => <Fragment key={index11}>
<div >
<h3 style={({"fontSize": "13px", "fontWeight": 700, "color": "#5B7280", "margin": "0 0 6px"} as CSSProperties)}>{cat.label}</h3>
<div style={({"display": "flex", "flexDirection": "column", "gap": "6px"} as CSSProperties)}>
{cat.items.map((it, index12) => <Fragment key={index12}>
<label style={({"display": "flex", "alignItems": "center", "gap": "10px", "background": "#fff", "border": "1px solid #D6E3E8", "borderRadius": "12px", "padding": "12px 14px", "minHeight": "44px", "cursor": "pointer"} as CSSProperties)}>
<input type={"checkbox"} checked={it.checked} onChange={it.toggle} style={({"width": "20px", "height": "20px", "flex": "none", "accentColor": "#246B8E"} as CSSProperties)}/>
<span style={({"fontSize": "15px", "color": it.textColor, "textDecoration": it.strike} as CSSProperties)}>{it.label}</span>
</label>
</Fragment>)}
</div>
</div>
</Fragment>)}
</div>
 </>}
</main>
<nav aria-label={"主要頁面"} style={({"position": "fixed", "inset": "auto 0 0 0", "zIndex": 20, "background": "#fff", "borderTop": "1px solid #D6E3E8", "paddingBottom": "env(safe-area-inset-bottom)"} as CSSProperties)}>
<div style={({"maxWidth": "640px", "margin": "0 auto", "position": "relative", "display": "grid", "gridTemplateColumns": "repeat(4,1fr)", "height": "58px"} as CSSProperties)}>
<div style={({"position": "absolute", "top": "0", "left": v.navIndicatorLeft, "width": "25%", "height": "2.5px", "background": "#246B8E", "transition": "left 220ms ease"} as CSSProperties)}></div>
<button onClick={v.setTab1} aria-current={v.itineraryCurrent} style={({"display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "center", "gap": "2px", "background": "transparent", "border": "0", "fontSize": "12px", "fontWeight": 700, "color": v.itineraryColor, "cursor": "pointer"} as CSSProperties)}>
<svg width={"21"} height={"21"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><circle cx={"6"} cy={"6"} r={"2"}></circle><circle cx={"18"} cy={"18"} r={"2"}></circle><path d={"M8 6h6a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h6"}></path></svg>
<span >{"行程"}</span>
</button>
<button onClick={v.setTab2} aria-current={v.backupsCurrent} style={({"display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "center", "gap": "2px", "background": "transparent", "border": "0", "fontSize": "12px", "fontWeight": 700, "color": v.backupsColor, "cursor": "pointer"} as CSSProperties)}>
<svg width={"21"} height={"21"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><rect x={"4"} y={"5"} width={"16"} height={"14"} rx={"2"}></rect><path d={"M4 10h16M9 14h6"}></path></svg>
<span >{"備案"}</span>
</button>
<button onClick={v.setTab3} aria-current={v.toolsCurrent} style={({"display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "center", "gap": "2px", "background": "transparent", "border": "0", "fontSize": "12px", "fontWeight": 700, "color": v.toolsColor, "cursor": "pointer"} as CSSProperties)}>
<svg width={"21"} height={"21"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M14.5 6.5a4 4 0 0 0-5.4 5.2L4 16.8 6.8 20l5.3-5.2a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.6-2.6 2.3-2.8Z"}></path></svg>
<span >{"工具"}</span>
</button>
<button onClick={v.setTab4} aria-current={v.packingCurrent} style={({"display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "center", "gap": "2px", "background": "transparent", "border": "0", "fontSize": "12px", "fontWeight": 700, "color": v.packingColor, "cursor": "pointer"} as CSSProperties)}>
<svg width={"21"} height={"21"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><rect x={"4"} y={"4"} width={"16"} height={"16"} rx={"3"}></rect><path d={"M8 12l2.5 2.5L16 9"}></path></svg>
<span >{"打包"}</span>
</button>
</div>
</nav>
</div>
</>;
}
