import { useState, useCallback } from 'react';
import { saveClient } from '../lib/supabase';

type SaveClientButtonProps = {
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: number | null;
    gender: '남' | '여';
    calendar: 'solar' | 'lunar';
    onSaved?: () => void;
};

export default function SaveClientButton({
    birthYear, birthMonth, birthDay, birthHour,
    gender, calendar, onSaved,
}: SaveClientButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [memo, setMemo] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = useCallback(async () => {
        if (!name.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }
        try {
            setSaving(true);
            await saveClient({
                name: name.trim(),
                birth_year: birthYear,
                birth_month: birthMonth,
                birth_day: birthDay,
                birth_hour: birthHour,
                gender,
                calendar,
                memo: memo.trim() || null,
            });
            setSaved(true);
            setIsOpen(false);
            onSaved?.();
        } catch (err) {
            console.error('Save failed:', err);
            alert('저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    }, [name, memo, birthYear, birthMonth, birthDay, birthHour, gender, calendar, onSaved]);

    if (saved) {
        return (
            <span className="saved-badge">✓ 저장됨</span>
        );
    }

    if (!isOpen) {
        return (
            <button
                type="button"
                className="action-btn save-client-btn"
                onClick={() => setIsOpen(true)}
            >
                💾 내담자 저장
            </button>
        );
    }

    return (
        <div className="save-client-form">
            <div className="save-client-inputs">
                <input
                    type="text"
                    className="save-client-name"
                    placeholder="이름 (필수)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
                <input
                    type="text"
                    className="save-client-memo"
                    placeholder="메모 (선택)"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                />
            </div>
            <div className="save-client-actions">
                <button
                    type="button"
                    className="save-confirm-btn"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? '저장 중...' : '저장'}
                </button>
                <button
                    type="button"
                    className="save-cancel-btn"
                    onClick={() => setIsOpen(false)}
                >
                    취소
                </button>
            </div>
        </div>
    );
}
