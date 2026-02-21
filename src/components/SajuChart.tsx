import {
    ELEMENT_COLOR,
    ELEMENT_BG,
    ELEMENT_KO,
    SIPSIN_COLOR,
    getSipsin,
} from '../lib/manseryeok';
import type { ManseryeokResult, Element } from '../lib/manseryeok';

type SajuChartProps = {
    result: ManseryeokResult;
};

function elementGradient(el: Element): string {
    const c = ELEMENT_COLOR[el];
    if (el === '金') return `linear-gradient(135deg, rgba(180,170,140,0.22), rgba(160,150,130,0.12))`;
    return `linear-gradient(135deg, ${c}18, ${c}08)`;
}

/** Returns appropriate CSS class for metal (金) element text */
function metalClass(el: Element, size: 'lg' | 'sm' | 'xs' = 'lg'): string {
    if (el !== '金') return '';
    if (size === 'lg') return 'metal-text';
    if (size === 'sm') return 'metal-text-sm';
    return 'metal-text-xs';
}

export default function SajuChart({ result }: SajuChartProps) {
    const { pillars, dayMaster } = result;

    return (
        <div className="saju-chart-container">
            <div className="day-master-badge">
                <span className="day-master-label">일간(日干)</span>
                <span
                    className={`day-master-value ${metalClass(dayMaster.element)}`}
                    style={{ color: ELEMENT_COLOR[dayMaster.element] }}
                >
                    {dayMaster.stem}
                </span>
                <span className="day-master-sub">
                    {dayMaster.stemKo} · {ELEMENT_KO[dayMaster.element]}({dayMaster.element}) · {dayMaster.yinyang}
                </span>
            </div>

            <div className="saju-table">
                <div className="saju-row saju-header-row">
                    {pillars.map((p) => (
                        <div key={p.label} className="saju-cell saju-label-cell">
                            {p.label}
                            <span className="saju-label-sub">
                                {p.label === '시주' ? '時' : p.label === '일주' ? '日' : p.label === '월주' ? '月' : '年'}柱
                            </span>
                        </div>
                    ))}
                </div>

                <div className="saju-row sipsin-row">
                    {pillars.map((p) => (
                        <div key={p.label} className="saju-cell sipsin-cell">
                            {p.isUnknown ? (
                                <span className="unknown-mark">—</span>
                            ) : (
                                <span
                                    className="sipsin-badge"
                                    style={{
                                        color: p.sipsin === '일간' ? ELEMENT_COLOR[dayMaster.element] : SIPSIN_COLOR[p.sipsin as keyof typeof SIPSIN_COLOR],
                                        background: p.sipsin === '일간'
                                            ? ELEMENT_BG[dayMaster.element]
                                            : `${SIPSIN_COLOR[p.sipsin as keyof typeof SIPSIN_COLOR]}18`,
                                    }}
                                >
                                    {p.sipsin}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="saju-row stem-row">
                    {pillars.map((p) => (
                        <div
                            key={p.label}
                            className={`saju-cell stem-cell ${p.label === '일주' ? 'day-master-highlight' : ''} ${!p.isUnknown && p.stemElement === '金' ? 'metal-bg' : ''}`}
                            style={{
                                background: p.isUnknown ? 'rgba(0,0,0,0.02)' : elementGradient(p.stemElement),
                                borderColor: p.isUnknown ? 'rgba(0,0,0,0.04)' : (p.stemElement === '金' ? 'rgba(180,170,140,0.35)' : `${ELEMENT_COLOR[p.stemElement]}33`),
                            }}
                        >
                            {p.isUnknown ? (
                                <span className="unknown-char">?</span>
                            ) : (
                                <>
                                    <span className={`hanja-char ${metalClass(p.stemElement)}`} style={{ color: ELEMENT_COLOR[p.stemElement] }}>
                                        {p.stem}
                                    </span>
                                    <span className={`hangul-char ${metalClass(p.stemElement, 'sm')}`} style={{ color: ELEMENT_COLOR[p.stemElement] }}>
                                        {p.stemKo}
                                    </span>
                                    <span className={`element-tag ${metalClass(p.stemElement, 'xs')}`} style={{ color: `${ELEMENT_COLOR[p.stemElement]}cc` }}>
                                        {ELEMENT_KO[p.stemElement]}
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="saju-row branch-row">
                    {pillars.map((p) => (
                        <div
                            key={p.label}
                            className={`saju-cell branch-cell ${!p.isUnknown && p.branchElement === '金' ? 'metal-bg' : ''}`}
                            style={{
                                background: p.isUnknown ? 'rgba(0,0,0,0.02)' : elementGradient(p.branchElement),
                                borderColor: p.isUnknown ? 'rgba(0,0,0,0.04)' : (p.branchElement === '金' ? 'rgba(180,170,140,0.35)' : `${ELEMENT_COLOR[p.branchElement]}33`),
                            }}
                        >
                            {p.isUnknown ? (
                                <span className="unknown-char">?</span>
                            ) : (
                                <>
                                    <span className={`hanja-char ${metalClass(p.branchElement)}`} style={{ color: ELEMENT_COLOR[p.branchElement] }}>
                                        {p.branch}
                                    </span>
                                    <span className={`hangul-char ${metalClass(p.branchElement, 'sm')}`} style={{ color: ELEMENT_COLOR[p.branchElement] }}>
                                        {p.branchKo}
                                    </span>
                                    <span className={`element-tag ${metalClass(p.branchElement, 'xs')}`} style={{ color: `${ELEMENT_COLOR[p.branchElement]}cc` }}>
                                        {ELEMENT_KO[p.branchElement]}
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="saju-row jijanggan-row">
                    {pillars.map((p) => (
                        <div key={p.label} className="saju-cell jijanggan-cell">
                            {p.isUnknown ? (
                                <span className="unknown-mark">—</span>
                            ) : (
                                <div className="jijanggan-items">
                                    {p.jijanggan.map((j, idx) => {
                                        const jSipsin = getSipsin(dayMaster.stem, j.stem);
                                        return (
                                            <div key={idx} className="jijanggan-item">
                                                <span className={`jijanggan-stem ${metalClass(j.element, 'sm')}`} style={{ color: ELEMENT_COLOR[j.element] }}>
                                                    {j.stem}
                                                </span>
                                                <span className={`jijanggan-ko ${metalClass(j.element, 'xs')}`} style={{ color: `${ELEMENT_COLOR[j.element]}cc` }}>
                                                    {j.stemKo}
                                                </span>
                                                <span className="jijanggan-sipsin" style={{ color: SIPSIN_COLOR[jSipsin] }}>
                                                    {jSipsin}
                                                </span>
                                                <span className="jijanggan-type">{j.type}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
