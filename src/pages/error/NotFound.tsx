import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

/**
 * 404 Not Found 페이지 컴포넌트
 * - 잘못된 경로로 접근하거나 데이터가 존재하지 않을 때 표시됩니다.
 * - 메인으로 돌아가는 링크를 제공합니다.
 */
export function NotFound() {
    return (
        <div className="container mx-auto py-20 text-center space-y-4">
            <h2 className="text-2xl font-bold">존재하지 않는 페이지입니다.</h2>
            <p className="text-muted-foreground">요청하신 페이지를 찾을 수 없습니다.</p>
            <div className="mt-4">
                <Link to="/">
                    <Button variant="outline">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        메인으로 돌아가기
                    </Button>
                </Link>
            </div>
        </div>
    );
}
