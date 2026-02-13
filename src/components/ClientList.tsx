import { useState, useEffect, useCallback } from 'react';
import { fetchClients, deleteClient } from '../lib/supabase';
import type { ManseryeokClient } from '../lib/supabase';

type ClientListProps = {
    onSelect: (client: ManseryeokClient) => void;
};

export default function ClientList({ onSelect }: ClientListProps) {
    const [clients, setClients] = useState<ManseryeokClient[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const loadClients = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchClients();
            setClients(data);
        } catch (err) {
            console.error('Failed to load clients:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const handleDelete = useCallback(async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        if (!confirm(`"${name}" 내담자를 삭제하시겠습니까?`)) return;
        try {
            await deleteClient(id);
            setClients((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('삭제에 실패했습니다.');
        }
    }, []);

    const filtered = clients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="client-list-container">
                <div className="client-loading">불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="client-list-container">
            <div className="client-list-header">
                <h3 className="client-list-title">
                    <span className="client-list-icon">📋</span>
                    내 내담자
                    <span className="client-count">{clients.length}명</span>
                </h3>
                {clients.length > 0 && (
                    <input
                        type="text"
                        className="client-search"
                        placeholder="이름 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="client-empty">
                    {clients.length === 0
                        ? '저장된 내담자가 없습니다.\n만세력 조회 후 저장해보세요!'
                        : '검색 결과가 없습니다.'}
                </div>
            ) : (
                <div className="client-grid">
                    {filtered.map((client) => (
                        <div
                            key={client.id}
                            className="client-card"
                            onClick={() => onSelect(client)}
                        >
                            <div className="client-card-top">
                                <span className="client-name">{client.name}</span>
                                <button
                                    className="client-delete-btn"
                                    onClick={(e) => handleDelete(e, client.id, client.name)}
                                    title="삭제"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="client-card-info">
                                <span className="client-birth">
                                    {client.calendar === 'lunar' ? '음력 ' : ''}
                                    {client.birth_year}.{client.birth_month}.{client.birth_day}
                                    {client.birth_hour != null ? ` ${client.birth_hour}시` : ' (시간미상)'}
                                </span>
                                <span className="client-gender">
                                    {client.gender === '남' ? '♂' : '♀'} {client.gender}
                                </span>
                            </div>
                            {client.memo && (
                                <div className="client-memo">{client.memo}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
