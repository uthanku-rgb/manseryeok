import { useState, useCallback, useRef } from 'react';
import { calculateManseryeok, ELEMENT_COLOR, ELEMENT_KO } from './lib/manseryeok';
import type { ManseryeokResult } from './lib/manseryeok';
import type { ManseryeokClient } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import SajuChart from './components/SajuChart';
import DaeunTimeline from './components/DaeunTimeline';
import ClientList from './components/ClientList';
import SaveClientButton from './components/SaveClientButton';
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
  year: '',
  month: '',
  day: '',
  hour: '',
  minute: '',
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
      {elements.map((el) => {
        const isMetal = el === '金';
        const displayColor = isMetal ? '#8b7d6e' : ELEMENT_COLOR[el];
        return (
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
                background: isMetal ? 'linear-gradient(135deg, #5a5349, #6b6258)' : `${ELEMENT_COLOR[el]}22`,
                border: `2px solid ${isMetal ? '#7a705f' : `${ELEMENT_COLOR[el]}55`}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontFamily: "'Noto Serif KR', serif",
                color: isMetal ? '#fff' : ELEMENT_COLOR[el],
                fontWeight: 400,
                textShadow: isMetal ? '0 1px 3px rgba(0,0,0,0.3)' : undefined,
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
                  background: displayColor,
                  transition: 'width 0.5s',
                }}
              />
            </div>
            <span style={{ fontSize: 10, color: '#3d3028' }}>
              {counts[el].toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, isLoggedIn, authError, signUpWithEmail, signInWithEmail, signOut, clearError } = useAuth();
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [result, setResult] = useState<ManseryeokResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [clientListKey, setClientListKey] = useState(0);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [showClientList, setShowClientList] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleAuthSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim();
    const password = passwordRef.current?.value;
    if (!email || !password) return;

    setAuthSubmitting(true);
    if (authMode === 'signup') {
      const success = await signUpWithEmail(email, password);
      if (success && passwordRef.current) passwordRef.current.value = '';
    } else {
      const success = await signInWithEmail(email, password);
      if (success) setShowAuthModal(false);
    }
    setAuthSubmitting(false);
  }, [authMode, signUpWithEmail, signInWithEmail]);

  const handleAuthModeSwitch = useCallback((mode: 'login' | 'signup') => {
    setAuthMode(mode);
    clearError();
  }, [clearError]);

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
      undefined,
      parseInt(values.minute, 10) || 0,
    );
    setResult(r);
    setIsCalculated(true);
    setSelectedClientName(null);
  }, [values]);

  const handleReset = useCallback(() => {
    setResult(null);
    setIsCalculated(false);
    setSelectedClientName(null);
  }, []);

  const handleClientSelect = useCallback((client: ManseryeokClient) => {
    const hour = client.birth_hour != null ? client.birth_hour : 12;
    const unknownTime = client.birth_hour == null;

    const r = calculateManseryeok(
      client.birth_year,
      client.birth_month,
      client.birth_day,
      hour,
      client.gender,
      client.calendar,
      unknownTime,
    );
    setResult(r);
    setIsCalculated(true);
    setSelectedClientName(client.name);

    // Also update form values
    setValues({
      year: String(client.birth_year),
      month: String(client.birth_month),
      day: String(client.birth_day),
      hour: client.birth_hour != null ? String(client.birth_hour) : '12',
      minute: '0',
      gender: client.gender,
      calendar: client.calendar,
      unknownTime,
    });
  }, []);

  const handleSaved = useCallback(() => {
    setClientListKey((prev) => prev + 1);
  }, []);

  return (
    <div className="manseryeok-page">
      {/* Floating Auth Button (bottom-right) */}
      <div className="auth-floating no-print">
        {authLoading ? null : isLoggedIn ? (
          <div className="auth-floating-logged-in">
            <span className="auth-floating-email">{user?.email?.split('@')[0]}</span>
            <button type="button" className="auth-floating-btn logged-in" onClick={signOut} title="로그아웃">
              로그아웃
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="auth-floating-btn"
            onClick={() => setShowAuthModal(true)}
            title="로그인"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && !isLoggedIn && (
        <div className="auth-modal-overlay no-print">
          <div className="auth-modal-backdrop" onClick={() => setShowAuthModal(false)} />
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              onClick={() => setShowAuthModal(false)}
            >
              ✕
            </button>
            <div className="auth-modal-header">
              <span className="auth-modal-icon">☰</span>
              <h3 className="auth-modal-title">만세력 로그인</h3>
              <p className="auth-modal-subtitle">로그인하면 만세력을 저장할 수 있습니다</p>
            </div>
            <div className="auth-mode-toggle">
              <button
                type="button"
                className={`auth-mode-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => handleAuthModeSwitch('login')}
              >
                로그인
              </button>
              <button
                type="button"
                className={`auth-mode-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => handleAuthModeSwitch('signup')}
              >
                회원가입
              </button>
            </div>
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <input
                ref={emailRef}
                type="email"
                placeholder="이메일"
                className="auth-input"
                autoComplete="email"
                required
              />
              <input
                ref={passwordRef}
                type="password"
                placeholder="비밀번호 (6자 이상)"
                className="auth-input"
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
              {authError && (
                <div className="auth-error">{authError}</div>
              )}
              <button type="submit" className="auth-submit-btn" disabled={authSubmitting}>
                {authSubmitting ? '처리 중...' : authMode === 'login' ? '로그인' : '회원가입'}
              </button>
            </form>
          </div>
        </div>
      )}

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

      {/* Client List (logged in only) */}
      {isLoggedIn && !isCalculated && (
        <div className="client-section no-print">
          <ClientList key={clientListKey} onSelect={handleClientSelect} />
        </div>
      )}

      {/* Client List overlay (from result view) */}
      {isLoggedIn && isCalculated && showClientList && (
        <div className="client-overlay no-print">
          <div className="client-overlay-backdrop" onClick={() => setShowClientList(false)} />
          <div className="client-overlay-content">
            <div className="client-overlay-header">
              <h3>📋 저장된 만세력</h3>
              <button
                type="button"
                className="client-overlay-close"
                onClick={() => setShowClientList(false)}
              >
                ✕
              </button>
            </div>
            <ClientList key={clientListKey} onSelect={(client) => { handleClientSelect(client); setShowClientList(false); }} />
          </div>
        </div>
      )}

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
            <div className="birth-summary-left">
              {selectedClientName && (
                <span className="client-name-badge">{selectedClientName}</span>
              )}
              <span className="birth-info">
                {result.birthInfo.calendar === 'solar' ? '양력' : '음력'}{' '}
                {result.birthInfo.year}년 {result.birthInfo.month}월 {result.birthInfo.day}일{' '}
                {result.birthInfo.unknownTime ? '(시간 미상)' : `${result.birthInfo.hour}시 ${result.birthInfo.minute}분`}{' '}
                · {result.birthInfo.gender === '남' ? '♂ 남자' : '♀ 여자'}
              </span>
            </div>
            <div className="result-actions no-print">
              <button type="button" className="action-btn" onClick={handleReset}>
                다시 조회
              </button>
              {isLoggedIn && (
                <button
                  type="button"
                  className="action-btn client-list-btn"
                  onClick={() => setShowClientList(true)}
                >
                  📋 저장된 만세력 보기
                </button>
              )}
              {isLoggedIn && !selectedClientName && (
                <SaveClientButton
                  birthYear={parseInt(values.year, 10)}
                  birthMonth={parseInt(values.month, 10)}
                  birthDay={parseInt(values.day, 10)}
                  birthHour={values.unknownTime ? null : parseInt(values.hour, 10)}
                  gender={values.gender}
                  calendar={values.calendar}
                  onSaved={handleSaved}
                />
              )}
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
