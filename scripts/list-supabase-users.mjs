// List all Supabase auth users and optionally reset password
// Usage: node scripts/list-supabase-users.mjs
// Requires: SUPABASE_SERVICE_ROLE_KEY env var (get from Supabase Dashboard > Settings > API)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jbihbfyuwvorzvqzwbqt.supabase.co';

// The anon key cannot list users - you need the service_role key
// Get it from: https://supabase.com/dashboard/project/jbihbfyuwvorzvqzwbqt/settings/api
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  Supabase Service Role Key가 필요합니다!                         ║
╚══════════════════════════════════════════════════════════════════╝

아래 방법 중 하나로 비밀번호를 복구할 수 있습니다:

━━━━ 방법 1: Supabase Dashboard에서 직접 확인/변경 (추천) ━━━━

1. https://supabase.com/dashboard 에 로그인
2. 프로젝트 선택 (jbihbfyuwvorzvqzwbqt)
3. 왼쪽 메뉴 "Authentication" 클릭
4. "Users" 탭에서 등록된 이메일 확인 가능
5. 사용자 클릭 → 비밀번호 변경 가능

━━━━ 방법 2: 이 스크립트 사용 ━━━━

1. Supabase Dashboard → Settings → API → service_role key 복사
2. 아래 명령어를 실행:

   $env:SUPABASE_SERVICE_ROLE_KEY="여기에_service_role_key_붙여넣기"
   node scripts/list-supabase-users.mjs

━━━━ 방법 3: 비밀번호 재설정 링크 ━━━━

가입할 때 사용한 이메일 주소를 기억하신다면,
Supabase Dashboard > Authentication > Users 에서
해당 사용자의 "Send magic link" 또는 "Reset password" 를 클릭하세요.
  `);
    process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log('\n=== Supabase Auth 사용자 목록 ===\n');

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!users || users.length === 0) {
        console.log('등록된 사용자가 없습니다.');
        return;
    }

    for (const u of users) {
        console.log(`  이메일: ${u.email}`);
        console.log(`  ID: ${u.id}`);
        console.log(`  가입일: ${u.created_at}`);
        console.log(`  마지막 로그인: ${u.last_sign_in_at || '없음'}`);
        console.log('  ---');
    }
    console.log(`\n총 ${users.length}명의 사용자가 등록되어 있습니다.`);

    // Uncomment below to reset a user's password:
    // const NEW_PASSWORD = 'your-new-password-here';
    // const USER_ID = 'user-id-here';
    // const { error: updateError } = await supabase.auth.admin.updateUserById(USER_ID, { password: NEW_PASSWORD });
    // if (updateError) console.error('Password reset failed:', updateError.message);
    // else console.log('Password reset successful!');
}

main().catch(console.error);
