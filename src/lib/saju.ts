/**
 * Simple Saju (Four Pillars) Calculator
 * Calculates Gan-Ji (Heavenly Stem and Earthly Branch) for Year, Month, Day, Hour.
 */

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

export type SajuPillar = {
    stem: string;
    branch: string;
    stemKo: string;
    branchKo: string;
};

export type SajuResult = {
    year: SajuPillar;
    month: SajuPillar;
    day: SajuPillar;
    hour: SajuPillar;
};

function getGanJi(offset: number): SajuPillar {
    const stemIndex = offset % 10;
    const branchIndex = offset % 12;
    return {
        stem: HEAVENLY_STEMS[stemIndex],
        branch: EARTHLY_BRANCHES[branchIndex],
        stemKo: STEMS_KO[stemIndex],
        branchKo: BRANCHES_KO[branchIndex]
    };
}

export function calculateSaju(year: number, month: number, day: number, hour: number = 12): SajuResult {
    // 1. Year Pillar
    let sajuYear = year;
    if (month < 2 || (month === 2 && day < 4)) {
        sajuYear = year - 1;
    }
    const yearPillar = getGanJi((sajuYear - 4 + 6000) % 60);

    // 2. Month Pillar
    const yearStemIdx = (sajuYear - 4 + 6000) % 10;
    const firstMonthStem = (yearStemIdx * 2 + 2) % 10;

    let monthDelta = month - 2;
    if (day < 5) monthDelta -= 1;
    if (monthDelta < 0) monthDelta += 12;

    const monthStem = (firstMonthStem + monthDelta) % 10;
    const monthBranch = (2 + monthDelta) % 12;

    const monthPillar = {
        stem: HEAVENLY_STEMS[monthStem],
        branch: EARTHLY_BRANCHES[monthBranch],
        stemKo: STEMS_KO[monthStem],
        branchKo: BRANCHES_KO[monthBranch]
    };

    // 3. Day Pillar
    const refDate = new Date(2000, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffTime = targetDate.getTime() - refDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const dayOffset = (54 + diffDays) % 60;
    const normalizedDayOffset = (dayOffset + 600000) % 60;
    const dayPillar = getGanJi(normalizedDayOffset);

    // 4. Hour Pillar
    const hourBranchIdx = Math.floor((hour + 1) / 2) % 12;
    const dayStemIdx = HEAVENLY_STEMS.indexOf(dayPillar.stem);
    const firstHourStem = (dayStemIdx * 2) % 10;
    const hourStemIdx = (firstHourStem + hourBranchIdx) % 10;

    const hourPillar = {
        stem: HEAVENLY_STEMS[hourStemIdx],
        branch: EARTHLY_BRANCHES[hourBranchIdx],
        stemKo: STEMS_KO[hourStemIdx],
        branchKo: BRANCHES_KO[hourBranchIdx]
    };

    return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
    };
}
