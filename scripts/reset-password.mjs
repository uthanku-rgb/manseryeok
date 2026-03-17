import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://jbihbfyuwvorzvqzwbqt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiaWhiZnl1d3Zvcnp2cXp3YnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTEwNzQsImV4cCI6MjA4MjQ4NzA3NH0.c0enyghHRZVcuUn6Tkz1_kP8tQO1eT3IdNZaR6eJIxA'
);

async function main() {
    console.log('비밀번호 재설정 이메일 전송 중...\n');

    const { data, error } = await supabase.auth.resetPasswordForEmail(
        'uthanku@gmail.com',
        { redirectTo: 'https://manseryeok-beta.vercel.app/' }
    );

    if (error) {
        console.error('❌ 에러:', error.message);
    } else {
        console.log('✅ 비밀번호 재설정 이메일이 uthanku@gmail.com 으로 전송되었습니다!');
        console.log('   Gmail 받은편지함 (또는 스팸함)을 확인해주세요.');
    }
}

main().catch(console.error);
