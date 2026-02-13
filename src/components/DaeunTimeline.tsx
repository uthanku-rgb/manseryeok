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

export default function DaeunTimeline({ result }: DaeunTimelineProps) {
    const { daeun, seun } = result;
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const currentEl = scrollRef.current.querySelector('.daeun-card.current');
            if (currentEl) {
                currentEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [daeun]);

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
                                    ? ELEMENT_COLOR[d.stemElement]
                                    : 'rgba(0,0,0,0.06)',
                                background: d.isCurrent
                                    ? `linear-gradient(135deg, ${ELEMENT_BG[d.stemElement]}, ${ELEMENT_BG[d.branchElement]})`
                                    : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {d.isCurrent && <div className="current-marker">현재</div>}
                            <div className="daeun-age">{d.startAge}~{d.endAge}세</div>
                            <div className="daeun-pillar">
                                <span className="daeun-hanja stem" style={{ color: ELEMENT_COLOR[d.stemElement] }}>
                                    {d.stem}
                                </span>
                                <span className="daeun-hanja branch" style={{ color: ELEMENT_COLOR[d.branchElement] }}>
                                    {d.branch}
                                </span>
                            </div>
                            <div className="daeun-hangul">
                                <span style={{ color: `${ELEMENT_COLOR[d.stemElement]}bb` }}>{d.stemKo}</span>
                                <span style={{ color: `${ELEMENT_COLOR[d.branchElement]}bb` }}>{d.branchKo}</span>
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
                                ? ELEMENT_COLOR[s.stemElement]
                                : 'rgba(0,0,0,0.06)',
                            background: s.isCurrent
                                ? `linear-gradient(135deg, ${ELEMENT_BG[s.stemElement]}, ${ELEMENT_BG[s.branchElement]})`
                                : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        {s.isCurrent && <div className="current-dot" style={{ background: ELEMENT_COLOR[s.stemElement] }} />}
                        <div className="seun-year">{s.year}</div>
                        <div className="seun-age">{s.age}세</div>
                        <div className="seun-pillar">
                            <span style={{ color: ELEMENT_COLOR[s.stemElement] }}>{s.stem}</span>
                            <span style={{ color: ELEMENT_COLOR[s.branchElement] }}>{s.branch}</span>
                        </div>
                        <div className="seun-hangul">
                            <span style={{ color: `${ELEMENT_COLOR[s.stemElement]}99` }}>{s.stemKo}</span>
                            <span style={{ color: `${ELEMENT_COLOR[s.branchElement]}99` }}>{s.branchKo}</span>
                        </div>
                        <SipsinTag sipsin={s.sipsin} small />
                    </div>
                ))}
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
                background: `${SIPSIN_COLOR[sipsin]}15`,
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
                background: ELEMENT_COLOR[element],
                opacity: 0.7,
                display: 'inline-block',
            }}
            title={`${ELEMENT_KO[element]}(${element})`}
        />
    );
}
