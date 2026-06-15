import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MoreLinkProps = React.ComponentProps<typeof Button>;

/**
 * 더보기 링크 컴포넌트
 * - "더보기"와 같은 링크 버튼을 통일된 스타일로 제공합니다.
 * - Button 컴포넌트(ghost variant)를 기반으로 우측 화살표 아이콘을 포함합니다.
 */
export function MoreLink({ children, className, ...props }: MoreLinkProps) {
    return (
        <Button
            variant="ghost"
            className={cn(
                "text-gray-500 hover:text-gray-900 group p-0 hover:bg-transparent",
                className
            )}
            {...props}
        >
            <span className="text-sm mr-2">{children}</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
    );
}
