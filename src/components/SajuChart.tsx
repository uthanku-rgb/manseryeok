import {
    ELEMENT_COLOR,
    ELEMENT_BG,
    ELEMENT_KO,
    SIPSIN_COLOR,
    RELATION_COLOR,
    STEM_RELATION_COLOR,
    getSipsin,
} from '../lib/manseryeok';
import type { ManseryeokResult, Element, BranchRelation, StemRelation } from '../lib/manseryeok';

type SajuChartProps = {
    result: ManseryeokResult;
};

function elementGradient(el: Element): string {
    const c = ELEMENT_COLOR[el];
    if (el === '金') return `linear-gradient(135deg, rgba(200,195,185,0.22), rgba(180,175,165,0.12))`;
    return `linear-gradient(135deg, ${c}18, ${c}08)`;
}

/** Returns appropriate CSS class for metal (金) element text */
function metalClass(el: Element, size: 'lg' | 'sm' | 'xs' = 'lg'): string {
    if (el !== '金') return '';
    if (size === 'lg') return 'metal-text';
    if (size === 'sm') return 'metal-text-sm';
    return 'metal-text-xs';
}

/** 뱃지 스타일 연결선 공용 컴포넌트
 * 인접 기둥 사이에 라벨 뱃지를 배치 (글자를 가리지 않음) */
function ConnectionLineRow({ relations, colorMap }: {
    relations: (BranchRelation | StemRelation)[];
    colorMap: Record<string, string>;
}) {
    // 인접 쌍별 관계를 그룹핑: gap 0 = 시주-일주, gap 1 = 일주-월주, gap 2 = 월주-년주
    const gaps: Record<number, (BranchRelation | StemRelation)[]> = { 0: [], 1: [], 2: [] };
    for (const r of relations) {
        const gapIdx = r.positions[0];
        gaps[gapIdx].push(r);
    }

    const lines: { startCol: number; endCol: number; type: string; label: string; color: string }[] = [];
    const usedGaps = new Set<string>();

    for (let g = 0; g <= 2; g++) {
        for (const rel of gaps[g]) {
            const key = `${g}-${rel.type}`;
            if (!usedGaps.has(key)) {
                usedGaps.add(key);
                lines.push({
                    startCol: g,
                    endCol: g + 1,
                    type: rel.type,
                    label: rel.label,
                    color: colorMap[rel.type] || '#6b7280',
                });
            }
        }
    }

    if (lines.length === 0) return null;

    return (
        <div className="connection-lines-container">
            {lines.map((line, idx) => {
                // 4열 기준, 각 열 25%. 뱃지는 startCol과 endCol의 중간에 배치
                // startCol 열의 중앙 = (startCol * 25 + 12.5)%, endCol 열의 중앙 = (endCol * 25 + 12.5)%
                // 뱃지 중심 = 두 중앙의 평균
                const centerPct = ((line.startCol + line.endCol) / 2 + 0.5) * 25;
                return (
                    <div key={idx} className="connection-badge-row">
                        <div className="connection-badge-inner" style={{ marginLeft: `${centerPct - 12}%`, width: '24%' }}>
                            <div className="connection-dash" style={{ backgroundColor: line.color }} />
                            <span
                                className="connection-badge-label"
                                style={{
                                    color: line.color,
                                    borderColor: `${line.color}55`,
                                    background: `${line.color}12`,
                                }}
                            >
                                {line.label}
                            </span>
                            <div className="connection-dash" style={{ backgroundColor: line.color }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function SajuChart({ result }: SajuChartProps) {
    const { pillars, branchRelations, stemRelations, dayMaster } = result;

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

                {/* 천간 십신 행 */}
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

                {/* 천간 행 */}
                <div className="saju-row stem-row">
                    {pillars.map((p) => (
                        <div
                            key={p.label}
                            className={`saju-cell stem-cell ${p.label === '일주' ? 'day-master-highlight' : ''}`}
                            style={{
                                background: p.isUnknown ? 'rgba(0,0,0,0.02)' : elementGradient(p.stemElement),
                                borderColor: p.isUnknown ? 'rgba(0,0,0,0.04)' : (p.stemElement === '金' ? 'rgba(100,100,100,0.3)' : `${ELEMENT_COLOR[p.stemElement]}33`),
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

                {/* 천간 합충 가로줄 */}
                {stemRelations.length > 0 && (
                    <ConnectionLineRow
                        relations={stemRelations}
                        colorMap={STEM_RELATION_COLOR as Record<string, string>}
                    />
                )}

                {/* 지지 행 */}
                <div className="saju-row branch-row">
                    {pillars.map((p) => (
                        <div
                            key={p.label}
                            className={`saju-cell branch-cell`}
                            style={{
                                background: p.isUnknown ? 'rgba(0,0,0,0.02)' : elementGradient(p.branchElement),
                                borderColor: p.isUnknown ? 'rgba(0,0,0,0.04)' : (p.branchElement === '金' ? 'rgba(100,100,100,0.3)' : `${ELEMENT_COLOR[p.branchElement]}33`),
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

                {/* 지지 십신 행 */}
                <div className="saju-row sipsin-row branch-sipsin-row">
                    {pillars.map((p) => (
                        <div key={p.label} className="saju-cell sipsin-cell">
                            {p.isUnknown || p.branchSipsin == null ? (
                                <span className="unknown-mark">—</span>
                            ) : (
                                <span
                                    className="sipsin-badge branch-sipsin-badge"
                                    style={{
                                        color: p.branchSipsin === '일주'
                                            ? ELEMENT_COLOR[dayMaster.element]
                                            : SIPSIN_COLOR[p.branchSipsin as keyof typeof SIPSIN_COLOR],
                                        background: p.branchSipsin === '일주'
                                            ? ELEMENT_BG[dayMaster.element]
                                            : `${SIPSIN_COLOR[p.branchSipsin as keyof typeof SIPSIN_COLOR]}18`,
                                    }}
                                >
                                    {p.branchSipsin}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* 합충형파해 가로줄 — 인접 기둥 사이에만 표시 */}
                {branchRelations.length > 0 && (
                    <ConnectionLineRow
                        relations={branchRelations}
                        colorMap={RELATION_COLOR as Record<string, string>}
                    />
                )}

                {/* 지장간 행 */}
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
