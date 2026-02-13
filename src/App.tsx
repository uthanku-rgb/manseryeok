import { useState, useCallback } from 'react';
import { calculateManseryeok, ELEMENT_COLOR, ELEMENT_KO } from './lib/manseryeok';
import type { ManseryeokResult } from './lib/manseryeok';
import SajuChart from './components/SajuChart';
import DaeunTimeline from './components/DaeunTimeline';
import './App.css';

type FormValues = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  gender: '남' | '여';
  calendar: 'solar' | 'lunar';
  unknownTime: boolean;
};

const defaultValues: FormValues = {
  year: '1990',
  month: '5',
  day: '15',
  hour: '8',
  minute: '0',
  gender: '남',
  calendar: 'solar',
  unknownTime: false,
};

function ElementSummary({ result }: { result: ManseryeokResult }) {
  const { pillars } = result;
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  pillars.forEach((p) => {
    if (!p.isUnknown) {
      counts[p.stemElement] = (counts[p.stemElement] || 0) + 1;
      counts[p.branchElement] = (counts[p.branchElement] || 0) + 1;
      p.jijanggan.forEach((j) => {
        counts[j.element] = (counts[j.element] || 0) + 0.5;
      });
    }
  });

  const maxCount = Math.max(...Object.values(counts), 1);
  const elements = ['木', '火', '土', '金', '水'] as const;

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      {elements.map((el) => (
        <div
          key={el}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            minWidth: 56,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: `${ELEMENT_COLOR[el]}22`,
              border: `2px solid ${ELEMENT_COLOR[el]}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontFamily: "'Noto Serif KR', serif",
              color: ELEMENT_COLOR[el],
              fontWeight: 400,
            }}
          >
            {el}
          </div>
          <span style={{ fontSize: 11, color: '#4a3d32' }}>{ELEMENT_KO[el]}</span>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(counts[el] / maxCount) * 100}%`,
                height: '100%',
                borderRadius: 2,
                background: ELEMENT_COLOR[el],
                transition: 'width 0.5s',
              }}
            />
          </div>
          <span style={{ fontSize: 10, color: '#5a4d40' }}>
            {counts[el].toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [result, setResult] = useState<ManseryeokResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleChange = useCallback((key: keyof FormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCalculate = useCallback(() => {
    const year = parseInt(values.year, 10);
    const month = parseInt(values.month, 10);
    const day = parseInt(values.day, 10);
    const hour = values.unknownTime ? 12 : parseInt(values.hour, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return;

    const r = calculateManseryeok(
      year, month, day, hour,
      values.gender,
      values.calendar,
      values.unknownTime,
    );
    setResult(r);
    setIsCalculated(true);
  }, [values]);

  const handleReset = useCallback(() => {
    setResult(null);
    setIsCalculated(false);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="manseryeok-page">
      {/* Header */}
      <div className="manseryeok-header">
        <div className="header-decoration">
          <span className="header-symbol">☰</span>
          <span className="header-symbol">☷</span>
          <span className="header-symbol">☲</span>
          <span className="header-symbol">☵</span>
        </div>
        <h1 className="page-title">만세력</h1>
        <p className="page-subtitle">萬歲曆 · 사주팔자 · 지장간 · 대운</p>
      </div>

      {/* Input Form */}
      {!isCalculated && (
        <div className="input-section">
          <div className="input-card">
            <h2 className="input-title">생년월일시 입력</h2>

            {/* Gender */}
            <div className="field-row">
              <label className="field-label">성별</label>
              <div className="gender-toggle">
                <button
                  type="button"
                  className={`gender-btn ${values.gender === '남' ? 'active male' : ''}`}
                  onClick={() => handleChange('gender', '남')}
                >
                  ♂ 남
                </button>
                <button
                  type="button"
                  className={`gender-btn ${values.gender === '여' ? 'active female' : ''}`}
                  onClick={() => handleChange('gender', '여')}
                >
                  ♀ 여
                </button>
              </div>
            </div>

            {/* Calendar Type */}
            <div className="field-row">
              <label className="field-label">역법</label>
              <div className="calendar-toggle">
                <button
                  type="button"
                  className={`cal-btn ${values.calendar === 'solar' ? 'active' : ''}`}
                  onClick={() => handleChange('calendar', 'solar')}
                >
                  양력
                </button>
                <button
                  type="button"
                  className={`cal-btn ${values.calendar === 'lunar' ? 'active' : ''}`}
                  onClick={() => handleChange('calendar', 'lunar')}
                >
                  음력
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="field-row">
              <label className="field-label">생년월일</label>
              <div className="date-inputs">
                <div className="date-field">
                  <input
                    type="number"
                    value={values.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    placeholder="연도"
                    min="1900"
                    max="2100"
                  />
                  <span className="field-suffix">년</span>
                </div>
                <div className="date-field">
                  <input
                    type="number"
                    value={values.month}
                    onChange={(e) => handleChange('month', e.target.value)}
                    placeholder="월"
                    min="1"
                    max="12"
                  />
                  <span className="field-suffix">월</span>
                </div>
                <div className="date-field">
                  <input
                    type="number"
                    value={values.day}
                    onChange={(e) => handleChange('day', e.target.value)}
                    placeholder="일"
                    min="1"
                    max="31"
                  />
                  <span className="field-suffix">일</span>
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="field-row">
              <label className="field-label">태어난 시간</label>
              <div className="time-section">
                <label className="unknown-check">
                  <input
                    type="checkbox"
                    checked={values.unknownTime}
                    onChange={(e) => handleChange('unknownTime', e.target.checked)}
                  />
                  <span>시간 미상</span>
                </label>
                {!values.unknownTime && (
                  <div className="time-inputs">
                    <div className="date-field">
                      <input
                        type="number"
                        value={values.hour}
                        onChange={(e) => handleChange('hour', e.target.value)}
                        placeholder="시"
                        min="0"
                        max="23"
                      />
                      <span className="field-suffix">시</span>
                    </div>
                    <div className="date-field">
                      <input
                        type="number"
                        value={values.minute}
                        onChange={(e) => handleChange('minute', e.target.value)}
                        placeholder="분"
                        min="0"
                        max="59"
                      />
                      <span className="field-suffix">분</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              className="calculate-btn"
              onClick={handleCalculate}
            >
              만세력 조회
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {isCalculated && result && (
        <div className="result-section">
          <div className="birth-summary">
            <span className="birth-info">
              {result.birthInfo.calendar === 'solar' ? '양력' : '음력'}{' '}
              {result.birthInfo.year}년 {result.birthInfo.month}월 {result.birthInfo.day}일{' '}
              {result.birthInfo.unknownTime ? '(시간 미상)' : `${result.birthInfo.hour}시`}{' '}
              · {result.birthInfo.gender === '남' ? '♂ 남자' : '♀ 여자'}
            </span>
            <div className="result-actions">
              <button type="button" className="action-btn" onClick={handleReset}>
                다시 조회
              </button>
              <button type="button" className="action-btn print-btn" onClick={handlePrint}>
                🖨 인쇄
              </button>
            </div>
          </div>

          <div className="result-card">
            <SajuChart result={result} />
          </div>

          <div className="result-card element-summary-card">
            <h3 className="card-title">오행 분포</h3>
            <ElementSummary result={result} />
          </div>

          <div className="result-card">
            <DaeunTimeline result={result} />
          </div>
        </div>
      )}
    </div>
  );
}
