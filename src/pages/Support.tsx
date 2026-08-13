import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Copy, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqCategory } from "@/data/faq";

/** 문의를 받는 개발자 이메일 */
const SUPPORT_EMAIL = "zzzeow3@gmail.com";

/** 문의 유형 */
const INQUIRY_TYPES = [
  "이용 문의",
  "버그 신고",
  "기능 제안",
  "계정 문제",
  "기타",
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 고객센터 페이지
 * - 상단: 자주 묻는 질문(카테고리 필터 + 아코디언)
 * - 하단: 개발자 이메일로 전달되는 문의 작성 폼
 */
export function Support() {
  const { user } = useAuth();

  const [category, setCategory] = useState<"전체" | FaqCategory>("전체");
  const [openId, setOpenId] = useState<number | null>(null);

  const filteredFaq = useMemo(
    () =>
      category === "전체"
        ? FAQ_ITEMS
        : FAQ_ITEMS.filter((item) => item.category === category),
    [category],
  );

  return (
    <div className="mx-auto w-full max-w-4xl pb-16 sm:pb-20">
      <div className="flex flex-col gap-10 sm:gap-14">
        {/* 페이지 헤더 */}
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
          고객센터
        </h1>

        {/* 자주 묻는 질문 */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            많이 하는 질문
          </h2>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["전체", ...FAQ_CATEGORIES] as const).map((label) => {
              const isActive = category === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setCategory(label);
                    setOpenId(null);
                  }}
                  aria-pressed={isActive}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground shadow-xs hover:bg-muted/60",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* 질문 목록 (아코디언) */}
          <ul className="flex flex-col border-t border-border/60">
            {filteredFaq.map((item) => {
              const isOpen = openId === item.id;
              return (
                <li key={item.id} className="border-b border-border/60">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center gap-3 py-4 text-left transition-colors hover:text-primary"
                  >
                    <span className="shrink-0 text-base font-bold text-primary">
                      Q
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-foreground transition-colors group-hover:text-primary">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-5 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>

                  {isOpen && (
                    <div className="flex gap-3 bg-muted/40 px-4 py-4 sm:px-5">
                      <span className="shrink-0 text-base font-bold text-muted-foreground">
                        A
                      </span>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* 문의하기 */}
        <InquiryForm defaultName={user?.name ?? ""} />
      </div>
    </div>
  );
}

/**
 * 문의 작성 폼
 * - 별도 백엔드가 없으므로 메일 클라이언트를 열어 개발자 이메일로 발송합니다.
 */
function InquiryForm({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState("");
  const [type, setType] = useState<InquiryType>("이용 문의");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [touched, setTouched] = useState(false);

  const errors = {
    name: !name.trim(),
    email: !EMAIL_REGEX.test(email.trim()),
    title: !title.trim(),
    content: !content.trim(),
  };
  const hasError = Object.values(errors).some(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (hasError) {
      toast.error("입력하지 않은 항목이 있습니다.");
      return;
    }

    const subject = `[드림라운지 문의] [${type}] ${title.trim()}`;
    const body = [
      `문의 유형: ${type}`,
      `이름: ${name.trim()}`,
      `답변받을 이메일: ${email.trim()}`,
      "",
      "─".repeat(20),
      "",
      content.trim(),
    ].join("\n");

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    toast.success("메일 작성 창을 열었습니다. 전송을 완료해주세요.");
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      toast.success("이메일 주소를 복사했습니다.");
    } catch {
      toast.error("복사에 실패했습니다. 직접 입력해주세요.");
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
        문의하기
      </h2>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup className="gap-4">
              {/* 문의 유형 */}
              <Field>
                <FieldLabel>문의 유형</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_TYPES.map((option) => {
                    const isActive = type === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setType(option)}
                        aria-pressed={isActive}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-muted/60",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* 이름 / 이메일 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="inquiry-name">이름</FieldLabel>
                  <Input
                    id="inquiry-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력해주세요"
                    className={cn(
                      touched &&
                        errors.name &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {touched && errors.name && (
                    <p className="mt-1 text-sm text-destructive">
                      이름을 입력해주세요.
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="inquiry-email">
                    답변받을 이메일
                  </FieldLabel>
                  <Input
                    id="inquiry-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@cju.ac.kr"
                    className={cn(
                      touched &&
                        errors.email &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {touched && errors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      올바른 이메일 형식으로 입력해주세요.
                    </p>
                  )}
                </Field>
              </div>

              {/* 제목 */}
              <Field>
                <FieldLabel htmlFor="inquiry-title">제목</FieldLabel>
                <Input
                  id="inquiry-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문의 제목을 입력해주세요"
                  maxLength={60}
                  className={cn(
                    touched &&
                      errors.title &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {touched && errors.title && (
                  <p className="mt-1 text-sm text-destructive">
                    제목을 입력해주세요.
                  </p>
                )}
              </Field>

              {/* 내용 */}
              <Field>
                <FieldLabel htmlFor="inquiry-content">문의 내용</FieldLabel>
                <Textarea
                  id="inquiry-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="문의하실 내용을 자세히 적어주세요. 버그 신고라면 어떤 화면에서 어떻게 하면 재현되는지 함께 적어주시면 도움이 됩니다."
                  rows={7}
                  maxLength={1000}
                  className={cn(
                    "resize-none",
                    touched &&
                      errors.content &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <div className="flex items-center justify-between">
                  {touched && errors.content ? (
                    <p className="text-sm text-destructive">
                      문의 내용을 입력해주세요.
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {content.length} / 1000
                  </span>
                </div>
              </Field>

              <Button type="submit" size="lg" className="w-full font-bold">
                <Send className="size-4" />
                문의 보내기
              </Button>

              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                오류가 발생하면 아래 주소로 직접 보내주세요.
              </p>

              {/* 직접 보내기 */}
              <div className="flex items-center justify-center gap-2">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label="이메일 주소 복사"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
