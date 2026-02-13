/**
 * 만세력 (Manseryeok) — Professional Birth Chart Engine
 * 
 * Calculates:
 * - 사주팔자 (Four Pillars of Destiny)
 * - 지장간 (Hidden Heavenly Stems)
 * - 오행 (Five Elements)
 * - 십신 (Ten Gods / Relations)
 * - 대운 (Major Luck Periods)
 */

import { calculateSaju, HEAVENLY_STEMS, EARTHLY_BRANCHES, STEMS_KO, BRANCHES_KO } from './saju';
import type { SajuResult, SajuPillar } from './saju';

// ──────────────────────────────────────────────
// 오행 (Five Elements)
// ──────────────────────────────────────────────

export type Element = '木' | '火' | '土' | '金' | '水';
export type ElementKo = '목' | '화' | '토' | '금' | '수';

/** 천간 → 오행 */
export const STEM_ELEMENT: Record<string, Element> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
};

/** 지지 → 오행 */
export const BRANCH_ELEMENT: Record<string, Element> = {
    '子': '水', '丑': '土',
    '寅': '木', '卯': '木',
    '辰': '土', '巳': '火',
    '午': '火', '未': '土',
    '申': '金', '酉': '金',
    '戌': '土', '亥': '水',
};

export const ELEMENT_KO: Record<Element, ElementKo> = {
    '木': '목', '火': '화', '土': '토', '金': '금', '水': '수',
};

/** 오행별 CSS 색상 */
export const ELEMENT_COLOR: Record<Element, string> = {
    '木': '#22c55e',
    '火': '#ef4444',
    '土': '#eab308',
    '金': '#e2e8f0',
    '水': '#3b82f6',
};

/** 오행별 배경 색상 (투명도 적용) */
export const ELEMENT_BG: Record<Element, string> = {
    '木': 'rgba(34,197,94,0.15)',
    '火': 'rgba(239,68,68,0.15)',
    '土': 'rgba(234,179,8,0.15)',
    '金': 'rgba(226,232,240,0.12)',
    '水': 'rgba(59,130,246,0.15)',
};

/** 천간 음양 */
export const STEM_YINYANG: Record<string, '양' | '음'> = {
    '甲': '양', '乙': '음',
    '丙': '양', '丁': '음',
    '戊': '양', '己': '음',
    '庚': '양', '辛': '음',
    '壬': '양', '癸': '음',
};

// ──────────────────────────────────────────────
// 지장간 (Hidden Heavenly Stems)
// ──────────────────────────────────────────────

export type JijangganEntry = {
    stem: string;
    stemKo: string;
    element: Element;
    days: number;
    type: '여기' | '중기' | '정기';
};

/** 12지지별 지장간 */
export const JIJANGGAN: Record<string, JijangganEntry[]> = {
    '子': [
        { stem: '壬', stemKo: '임', element: '水', days: 10, type: '여기' },
        { stem: '癸', stemKo: '계', element: '水', days: 20, type: '정기' },
    ],
    '丑': [
        { stem: '癸', stemKo: '계', element: '水', days: 9, type: '여기' },
        { stem: '辛', stemKo: '신', element: '金', days: 3, type: '중기' },
        { stem: '己', stemKo: '기', element: '土', days: 18, type: '정기' },
    ],
    '寅': [
        { stem: '戊', stemKo: '무', element: '土', days: 7, type: '여기' },
        { stem: '丙', stemKo: '병', element: '火', days: 7, type: '중기' },
        { stem: '甲', stemKo: '갑', element: '木', days: 16, type: '정기' },
    ],
    '卯': [
        { stem: '甲', stemKo: '갑', element: '木', days: 10, type: '여기' },
        { stem: '乙', stemKo: '을', element: '木', days: 20, type: '정기' },
    ],
    '辰': [
        { stem: '乙', stemKo: '을', element: '木', days: 9, type: '여기' },
        { stem: '癸', stemKo: '계', element: '水', days: 3, type: '중기' },
        { stem: '戊', stemKo: '무', element: '土', days: 18, type: '정기' },
    ],
    '巳': [
        { stem: '戊', stemKo: '무', element: '土', days: 7, type: '여기' },
        { stem: '庚', stemKo: '경', element: '金', days: 7, type: '중기' },
        { stem: '丙', stemKo: '병', element: '火', days: 16, type: '정기' },
    ],
    '午': [
        { stem: '丙', stemKo: '병', element: '火', days: 10, type: '여기' },
        { stem: '己', stemKo: '기', element: '土', days: 9, type: '중기' },
        { stem: '丁', stemKo: '정', element: '火', days: 11, type: '정기' },
    ],
    '未': [
        { stem: '丁', stemKo: '정', element: '火', days: 9, type: '여기' },
        { stem: '乙', stemKo: '을', element: '木', days: 3, type: '중기' },
        { stem: '己', stemKo: '기', element: '土', days: 18, type: '정기' },
    ],
    '申': [
        { stem: '己', stemKo: '기', element: '土', days: 7, type: '여기' },
        { stem: '壬', stemKo: '임', element: '水', days: 7, type: '중기' },
        { stem: '庚', stemKo: '경', element: '金', days: 16, type: '정기' },
    ],
    '酉': [
        { stem: '庚', stemKo: '경', element: '金', days: 10, type: '여기' },
        { stem: '辛', stemKo: '신', element: '金', days: 20, type: '정기' },
    ],
    '戌': [
        { stem: '辛', stemKo: '신', element: '金', days: 9, type: '여기' },
        { stem: '丁', stemKo: '정', element: '火', days: 3, type: '중기' },
        { stem: '戊', stemKo: '무', element: '土', days: 18, type: '정기' },
    ],
    '亥': [
        { stem: '戊', stemKo: '무', element: '土', days: 7, type: '여기' },
        { stem: '甲', stemKo: '갑', element: '木', days: 7, type: '중기' },
        { stem: '壬', stemKo: '임', element: '水', days: 16, type: '정기' },
    ],
};

// ──────────────────────────────────────────────
// 십신 (Ten Gods / Relations)
// ──────────────────────────────────────────────

export type Sipsin = '비견' | '겁재' | '식신' | '상관' | '편재' | '정재' | '편관' | '정관' | '편인' | '정인';

const ELEMENT_ORDER: Element[] = ['木', '火', '土', '金', '水'];

function getElementRelation(dayElement: Element, targetElement: Element): 'same' | 'produces' | 'produced_by' | 'overcomes' | 'overcome_by' {
    if (dayElement === targetElement) return 'same';
    const di = ELEMENT_ORDER.indexOf(dayElement);
    const ti = ELEMENT_ORDER.indexOf(targetElement);
    if ((di + 1) % 5 === ti) return 'produces';
    if ((ti + 1) % 5 === di) return 'produced_by';
    if ((di + 2) % 5 === ti) return 'overcomes';
    return 'overcome_by';
}

export function getSipsin(dayMasterStem: string, targetStem: string): Sipsin {
    const dayElement = STEM_ELEMENT[dayMasterStem];
    const targetElement = STEM_ELEMENT[targetStem];
    const dayYY = STEM_YINYANG[dayMasterStem];
    const targetYY = STEM_YINYANG[targetStem];
    const sameYY = dayYY === targetYY;

    const relation = getElementRelation(dayElement, targetElement);

    switch (relation) {
        case 'same':
            return sameYY ? '비견' : '겁재';
        case 'produces':
            return sameYY ? '식신' : '상관';
        case 'overcomes':
            return sameYY ? '편재' : '정재';
        case 'overcome_by':
            return sameYY ? '편관' : '정관';
        case 'produced_by':
            return sameYY ? '편인' : '정인';
    }
}

/** 십신별 CSS 색상 */
export const SIPSIN_COLOR: Record<Sipsin, string> = {
    '비견': '#94a3b8',
    '겁재': '#cbd5e1',
    '식신': '#fb923c',
    '상관': '#f97316',
    '편재': '#a3e635',
    '정재': '#84cc16',
    '편관': '#c084fc',
    '정관': '#a855f7',
    '편인': '#67e8f9',
    '정인': '#22d3ee',
};

// ──────────────────────────────────────────────
// 대운 (Major Luck Periods)
// ──────────────────────────────────────────────

export type DaeunPeriod = {
    index: number;
    startAge: number;
    endAge: number;
    stem: string;
    branch: string;
    stemKo: string;
    branchKo: string;
    stemElement: Element;
    branchElement: Element;
    sipsinStem: Sipsin;
    sipsinBranch: Sipsin;
    isCurrent: boolean;
};

const JEOLGI_DATES: Record<number, number> = {
    1: 6, 2: 4, 3: 6, 4: 5, 5: 6, 6: 6,
    7: 7, 8: 8, 9: 8, 10: 8, 11: 7, 12: 7,
};

export function calculateDaeun(
    saju: SajuResult,
    gender: '남' | '여',
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    currentAge: number,
    count: number = 10
): DaeunPeriod[] {
    const yearStemYY = STEM_YINYANG[saju.year.stem];
    const isForward = (gender === '남' && yearStemYY === '양') ||
        (gender === '여' && yearStemYY === '음');

    let daysToJeolgi: number;

    if (isForward) {
        let nextMonth = birthMonth + 1;
        if (nextMonth > 12) nextMonth = 1;
        const nextJeolgi = JEOLGI_DATES[nextMonth];
        const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
        daysToJeolgi = (daysInMonth - birthDay) + nextJeolgi;
    } else {
        const thisJeolgi = JEOLGI_DATES[birthMonth];
        if (birthDay >= thisJeolgi) {
            daysToJeolgi = birthDay - thisJeolgi;
        } else {
            let prevMonth = birthMonth - 1;
            if (prevMonth < 1) prevMonth = 12;
            const prevJeolgi = JEOLGI_DATES[prevMonth];
            const daysInPrevMonth = new Date(birthYear, birthMonth - 1, 0).getDate();
            daysToJeolgi = birthDay + (daysInPrevMonth - prevJeolgi);
        }
    }

    const startAge = Math.round(daysToJeolgi / 3);

    const monthStemIdx = HEAVENLY_STEMS.indexOf(saju.month.stem);
    const monthBranchIdx = EARTHLY_BRANCHES.indexOf(saju.month.branch);

    const dayMasterStem = saju.day.stem;

    const periods: DaeunPeriod[] = [];

    for (let i = 1; i <= count; i++) {
        const direction = isForward ? i : -i;
        const stemIdx = ((monthStemIdx + direction) % 10 + 10) % 10;
        const branchIdx = ((monthBranchIdx + direction) % 12 + 12) % 12;

        const stem = HEAVENLY_STEMS[stemIdx];
        const branch = EARTHLY_BRANCHES[branchIdx];
        const periodStartAge = startAge + (i - 1) * 10;
        const periodEndAge = periodStartAge + 9;

        periods.push({
            index: i,
            startAge: periodStartAge,
            endAge: periodEndAge,
            stem,
            branch,
            stemKo: STEMS_KO[stemIdx],
            branchKo: BRANCHES_KO[branchIdx],
            stemElement: STEM_ELEMENT[stem],
            branchElement: BRANCH_ELEMENT[branch],
            sipsinStem: getSipsin(dayMasterStem, stem),
            sipsinBranch: getSipsin(dayMasterStem, JIJANGGAN[branch].find(j => j.type === '정기')?.stem || stem),
            isCurrent: currentAge >= periodStartAge && currentAge <= periodEndAge,
        });
    }

    return periods;
}

// ──────────────────────────────────────────────
// 세운 (Annual Luck / 연운)
// ──────────────────────────────────────────────

export type SeunPeriod = {
    year: number;
    age: number;
    stem: string;
    branch: string;
    stemKo: string;
    branchKo: string;
    stemElement: Element;
    branchElement: Element;
    sipsin: Sipsin;
    isCurrent: boolean;
};

export function calculateSeun(
    dayMasterStem: string,
    birthYear: number,
    startYear: number,
    count: number = 10
): SeunPeriod[] {
    const periods: SeunPeriod[] = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < count; i++) {
        const year = startYear + i;
        const offset = ((year - 4) % 60 + 60) % 60;
        const stemIdx = offset % 10;
        const branchIdx = offset % 12;
        const stem = HEAVENLY_STEMS[stemIdx];
        const branch = EARTHLY_BRANCHES[branchIdx];

        periods.push({
            year,
            age: year - birthYear + 1,
            stem,
            branch,
            stemKo: STEMS_KO[stemIdx],
            branchKo: BRANCHES_KO[branchIdx],
            stemElement: STEM_ELEMENT[stem],
            branchElement: BRANCH_ELEMENT[branch],
            sipsin: getSipsin(dayMasterStem, stem),
            isCurrent: year === currentYear,
        });
    }

    return periods;
}

// ──────────────────────────────────────────────
// 통합 만세력 결과
// ──────────────────────────────────────────────

export type PillarDetail = {
    label: string;
    stem: string;
    branch: string;
    stemKo: string;
    branchKo: string;
    stemElement: Element;
    branchElement: Element;
    sipsin: Sipsin | '일간';
    jijanggan: JijangganEntry[];
    isUnknown?: boolean;
};

export type ManseryeokResult = {
    pillars: PillarDetail[];
    daeun: DaeunPeriod[];
    seun: SeunPeriod[];
    dayMaster: {
        stem: string;
        stemKo: string;
        element: Element;
        yinyang: '양' | '음';
    };
    birthInfo: {
        year: number;
        month: number;
        day: number;
        hour: number;
        gender: '남' | '여';
        calendar: 'solar' | 'lunar';
        unknownTime: boolean;
    };
};

export function calculateManseryeok(
    year: number,
    month: number,
    day: number,
    hour: number,
    gender: '남' | '여',
    calendar: 'solar' | 'lunar' = 'solar',
    unknownTime: boolean = false,
    currentYear?: number,
): ManseryeokResult {
    const saju = calculateSaju(year, month, day, unknownTime ? 12 : hour);
    const dayMasterStem = saju.day.stem;

    const now = currentYear || new Date().getFullYear();
    const currentAge = now - year;

    const pillars: PillarDetail[] = [
        {
            label: '시주',
            ...saju.hour,
            stemElement: STEM_ELEMENT[saju.hour.stem],
            branchElement: BRANCH_ELEMENT[saju.hour.branch],
            sipsin: unknownTime ? '일간' : getSipsin(dayMasterStem, saju.hour.stem),
            jijanggan: unknownTime ? [] : JIJANGGAN[saju.hour.branch],
            isUnknown: unknownTime,
        },
        {
            label: '일주',
            ...saju.day,
            stemElement: STEM_ELEMENT[saju.day.stem],
            branchElement: BRANCH_ELEMENT[saju.day.branch],
            sipsin: '일간',
            jijanggan: JIJANGGAN[saju.day.branch],
        },
        {
            label: '월주',
            ...saju.month,
            stemElement: STEM_ELEMENT[saju.month.stem],
            branchElement: BRANCH_ELEMENT[saju.month.branch],
            sipsin: getSipsin(dayMasterStem, saju.month.stem),
            jijanggan: JIJANGGAN[saju.month.branch],
        },
        {
            label: '년주',
            ...saju.year,
            stemElement: STEM_ELEMENT[saju.year.stem],
            branchElement: BRANCH_ELEMENT[saju.year.branch],
            sipsin: getSipsin(dayMasterStem, saju.year.stem),
            jijanggan: JIJANGGAN[saju.year.branch],
        },
    ];

    const daeun = calculateDaeun(saju, gender, year, month, day, currentAge, 10);
    const seun = calculateSeun(dayMasterStem, year, now - 2, 10);

    return {
        pillars,
        daeun,
        seun,
        dayMaster: {
            stem: dayMasterStem,
            stemKo: saju.day.stemKo,
            element: STEM_ELEMENT[dayMasterStem],
            yinyang: STEM_YINYANG[dayMasterStem],
        },
        birthInfo: {
            year, month, day, hour, gender, calendar, unknownTime,
        },
    };
}

export { calculateSaju, HEAVENLY_STEMS, EARTHLY_BRANCHES, STEMS_KO, BRANCHES_KO };
export type { SajuResult, SajuPillar };
