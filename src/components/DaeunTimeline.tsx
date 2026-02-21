import { useRef, useEffect } from 'react';
import {
    ELEMENT_COLOR,
    ELEMENT_BG,
    ELEMENT_KO,
    SIPSIN_COLOR,
} from '../lib/manseryeok';
import type { ManseryeokResult, Sipsin, Element } from '../lib/manseryeok';

type DaeunTimelineProps = {
    result: ManseryeokResult;
};

function metalClass(el: Element, size: 'lg' | 'sm' | 'xs' = 'lg'): string {
    if (el !== '金') return '';
    if (size === 'lg') return 'metal-text';
    if (size === 'sm') return 'metal-text-sm';
    return 'metal-text-xs';
}

export default function DaeunTimeline({ result }: DaeunTimelineProps) {
    const { daeun, seun, ilun } = result;
    const scrollRef = useRef<HTMLDivElement>(null);
    const ilunScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const currentEl = scrollRef.current.querySelector('.daeun-card.current');
            if (currentEl) {
                currentEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [daeun]);

    useEffect(() => {
        if (ilunScrollRef.current) {
            const currentEl = ilunScrollRef.current.querySelector('.ilun-card.current');
            if (currentEl) {
                currentEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [ilun]);

    return (
        <div className="daeun-container">
            <div className="section-header">
                <h3 className="section-title">
                    <span className="section-icon">☰</span>
                    대운 (大運)
                </h3>
                <span className="section-sub">10년 주기 운의 흐름</span>
            </div>

            <div className="daeun-scroll" ref={scrollRef}>
                <div className="daeun-track">
                    {daeun.map((d) => (
                        <div
                            key={d.index}
                            className={`daeun-card ${d.isCurrent ? 'current' : ''}`}
                            style={{
                                borderColor: d.isCurrent
                                    ? (d.stemElement === '金' ? '#b4aa8c' : ELEMENT_COLOR[d.stemElement])
                                    : 'rgba(0,0,0,0.06)',
                                background: d.isCurrent
                                    ? `linear-gradient(135deg, ${ELEMENT_BG[d.stemElement]}, ${ELEMENT_BG[d.branchElement]})`
                                    : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {d.isCurrent && <div className="current-marker">현재</div>}
                            <div className="daeun-age">{d.startAge}~{d.endAge}세</div>
                            <div className="daeun-pillar">
                                <span className={`daeun-hanja stem ${metalClass(d.stemElement)}`} style={{ color: ELEMENT_COLOR[d.stemElement] }}>
                                    {d.stem}
                                </span>
                                <span className={`daeun-hanja branch ${metalClass(d.branchElement)}`} style={{ color: ELEMENT_COLOR[d.branchElement] }}>
                                    {d.branch}
                                </span>
                            </div>
                            <div className="daeun-hangul">
                                <span className={metalClass(d.stemElement, 'xs')} style={{ color: ELEMENT_COLOR[d.stemElement] }}>{d.stemKo}</span>
                                <span className={metalClass(d.branchElement, 'xs')} style={{ color: ELEMENT_COLOR[d.branchElement] }}>{d.branchKo}</span>
                            </div>
                            <div className="daeun-sipsin">
                                <SipsinTag sipsin={d.sipsinStem} />
                            </div>
                            <div className="daeun-elements">
                                <ElementDot element={d.stemElement} />
                                <ElementDot element={d.branchElement} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="section-header" style={{ marginTop: 32 }}>
                <h3 className="section-title">
                    <span className="section-icon">◈</span>
                    세운 (歲運)
                </h3>
                <span className="section-sub">연도별 운의 흐름</span>
            </div>

            <div className="seun-grid">
                {seun.map((s) => (
                    <div
                        key={s.year}
                        className={`seun-card ${s.isCurrent ? 'current' : ''}`}
                        style={{
                            borderColor: s.isCurrent
                                ? (s.stemElement === '金' ? '#b4aa8c' : ELEMENT_COLOR[s.stemElement])
                                : 'rgba(0,0,0,0.06)',
                            background: s.isCurrent
                                ? `linear-gradient(135deg, ${ELEMENT_BG[s.stemElement]}, ${ELEMENT_BG[s.branchElement]})`
                                : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        {s.isCurrent && <div className="current-dot" style={{ background: s.stemElement === '金' ? '#b4aa8c' : ELEMENT_COLOR[s.stemElement] }} />}
                        <div className="seun-year">{s.year}</div>
                        <div className="seun-age">{s.age}세</div>
                        <div className="seun-pillar">
                            <span className={metalClass(s.stemElement, 'sm')} style={{ color: ELEMENT_COLOR[s.stemElement] }}>{s.stem}</span>
                            <span className={metalClass(s.branchElement, 'sm')} style={{ color: ELEMENT_COLOR[s.branchElement] }}>{s.branch}</span>
                        </div>
                        <div className="seun-hangul">
                            <span className={metalClass(s.stemElement, 'xs')} style={{ color: `${ELEMENT_COLOR[s.stemElement]}cc` }}>{s.stemKo}</span>
                            <span className={metalClass(s.branchElement, 'xs')} style={{ color: `${ELEMENT_COLOR[s.branchElement]}cc` }}>{s.branchKo}</span>
                        </div>
                        <SipsinTag sipsin={s.sipsin} small />
                    </div>
                ))}
            </div>

            {/* 일운 (Daily Luck) */}
            <div className="section-header" style={{ marginTop: 32 }}>
                <h3 className="section-title">
                    <span className="section-icon">◉</span>
                    일운 (日運)
                </h3>
                <span className="section-sub">일별 운의 흐름 · 오늘 기준 ±15일</span>
            </div>

            <div className="ilun-scroll" ref={ilunScrollRef}>
                <div className="ilun-track">
                    {ilun.map((il) => (
                        <div
                            key={il.date}
                            className={`ilun-card ${il.isCurrent ? 'current' : ''}`}
                            style={{
                                borderColor: il.isCurrent
                                    ? (il.stemElement === '金' ? '#b4aa8c' : ELEMENT_COLOR[il.stemElement])
                                    : 'rgba(0,0,0,0.06)',
                                background: il.isCurrent
                                    ? `linear-gradient(135deg, ${ELEMENT_BG[il.stemElement]}, ${ELEMENT_BG[il.branchElement]})`
                                    : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {il.isCurrent && <div className="current-marker">오늘</div>}
                            <div className="ilun-date">{il.displayDate}</div>
                            <div className="ilun-dow">{il.dayOfWeek}</div>
                            <div className="ilun-pillar">
                                <span className={`ilun-hanja ${metalClass(il.stemElement, 'sm')}`} style={{ color: ELEMENT_COLOR[il.stemElement] }}>
                                    {il.stem}
                                </span>
                                <span className={`ilun-hanja ${metalClass(il.branchElement, 'sm')}`} style={{ color: ELEMENT_COLOR[il.branchElement] }}>
                                    {il.branch}
                                </span>
                            </div>
                            <div className="ilun-hangul">
                                <span className={metalClass(il.stemElement, 'xs')} style={{ color: ELEMENT_COLOR[il.stemElement] }}>{il.stemKo}</span>
                                <span className={metalClass(il.branchElement, 'xs')} style={{ color: ELEMENT_COLOR[il.branchElement] }}>{il.branchKo}</span>
                            </div>
                            <SipsinTag sipsin={il.sipsin} small />
                            <div className="ilun-elements">
                                <ElementDot element={il.stemElement} />
                                <ElementDot element={il.branchElement} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SipsinTag({ sipsin, small }: { sipsin: Sipsin; small?: boolean }) {
    return (
        <span
            style={{
                fontSize: small ? '8px' : '9px',
                fontWeight: 600,
                color: SIPSIN_COLOR[sipsin],
                background: `${SIPSIN_COLOR[sipsin]}25`,
                padding: small ? '1px 4px' : '2px 6px',
                borderRadius: 4,
                letterSpacing: '0.02em',
            }}
        >
            {sipsin}
        </span>
    );
}

function ElementDot({ element }: { element: Element }) {
    return (
        <span
            style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: element === '金' ? '#b4aa8c' : ELEMENT_COLOR[element],
                border: element === '金' ? '1px solid #8b7d6e' : 'none',
                opacity: 0.85,
                display: 'inline-block',
            }}
            title={`${ELEMENT_KO[element]}(${element})`}
        />
    );
}
