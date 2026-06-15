/**
 * 프로토타입용 동아리 가입 여부 판별 로직.
 * - 아직 백엔드 가입/멤버십 API가 없으므로,
 *   (studentId + clubId) 짝수인 경우 가입으로 가정합니다.
 * - 추후 실제 가입 여부 API가 생기면 여기 로직만 교체하면 됩니다.
 */
export function isMockClubMember(
  studentId: number | string | null | undefined,
  clubId: number | string | null | undefined
): boolean {
  if (typeof window !== "undefined") {
    if (clubId === null || clubId === undefined) return false;
    const c = Number(clubId);
    if (!Number.isFinite(c)) return false;

    // 프로토타입에서 “가입 처리”를 로컬스토리지로 강제할 수 있게 합니다.
    // 예: 지원 완료 후 상세로 돌아왔을 때 가입으로 간주.
    const overrideKey = `mock_club_member:${String(c)}`;
    const stored = window.localStorage.getItem(overrideKey);
    if (stored === "1") return true;
  }

  if (studentId === null || studentId === undefined) return false;
  if (clubId === null || clubId === undefined) return false;

  const s = Number(studentId);
  const c = Number(clubId);
  if (!Number.isFinite(s) || !Number.isFinite(c)) return false;

  return (s + c) % 2 === 0;
}

