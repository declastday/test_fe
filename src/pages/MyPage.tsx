import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  const handleWithdrawal = async () => {
    setIsWithdrawing(true);
    setWithdrawalError(null);

    try {
      await api.withdrawAccount();
      logout();
      navigate("/", { replace: true });
    } catch (error) {
      setWithdrawalError(
        error instanceof Error
          ? error.message
          : "회원탈퇴 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          마이페이지
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          계정 정보와 회원 상태를 관리할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <UserRound className="size-5" aria-hidden />
            </div>
            <div>
              <CardTitle>내 정보</CardTitle>
              <CardDescription>현재 로그인한 계정 정보입니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <Info label="이름" value={user.name} />
          <Info label="학번" value={String(user.studentId)} />
          <Info label="이메일" value={user.email || "미입력"} />
          <Info label="학과" value={user.department || "미입력"} />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2 text-destructive">
              <ShieldAlert className="size-5" aria-hidden />
            </div>
            <div>
              <CardTitle>회원탈퇴</CardTitle>
              <CardDescription>
                탈퇴 후 동일한 학번과 이메일로 다시 가입할 수 있습니다.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            개인정보는 익명화되며 신청서와 게시글 등 기존 활동 기록은 서비스
            운영을 위해 보존됩니다. 동아리 회장은 다른 부원에게 회장 권한을
            이전한 후 탈퇴할 수 있습니다.
          </p>

          {withdrawalError && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {withdrawalError}
            </p>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">회원탈퇴</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 회원탈퇴하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  현재 계정의 개인정보가 익명화되고 즉시 로그아웃됩니다. 같은
                  학번과 이메일로 다시 가입할 수 있지만, 기존 활동 기록은 새
                  계정으로 복구되지 않습니다. 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isWithdrawing}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void handleWithdrawal()}
                  disabled={isWithdrawing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isWithdrawing ? "처리 중..." : "탈퇴하기"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 break-all font-medium text-foreground">{value}</div>
    </div>
  );
}
