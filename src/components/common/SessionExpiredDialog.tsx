import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

interface SessionExpiredDialogProps {
  open: boolean;
  onConfirm: () => void;
}

export function SessionExpiredDialog({
  open,
  onConfirm,
}: SessionExpiredDialogProps) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    onConfirm();
    navigate("/login");
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-destructive" />
            세션이 만료되었습니다
          </AlertDialogTitle>
          <AlertDialogDescription>
            로그인 세션이 만료되어 다시 로그인이 필요합니다.
            <br />
            로그인 페이지로 이동합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm}>
            로그인 하러 가기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
