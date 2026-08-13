import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface LoginAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
}

export function LoginAlertDialog({
  open,
  onOpenChange,
  reason,
}: LoginAlertDialogProps) {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            navigate("/login");
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>로그인이 필요한 서비스입니다</AlertDialogTitle>
          <AlertDialogDescription>
            {reason}
            <br />
            로그인 페이지로 이동하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => navigate("/login")}>
            로그인 하러 가기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
