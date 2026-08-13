import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { DepartmentCombobox } from "@/components/common/DepartmentCombobox";
import {
  FileText,
  HelpCircle,
  Send,
  ArrowLeft,
  Users,
  Loader2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotFound } from "@/pages/error/NotFound";
import { useAuth } from "@/hooks/useAuth";
import { api, type ClubForm, type FormQuestion } from "@/lib/api";

interface ClubInfo {
  title: string;
  category: string;
  description: string;
}
import { toast } from "sonner";

type ApplicationMode = "create" | "edit" | "view";

function isLongAnswerQuestion(question: FormQuestion) {
  const type = question.question_type.toLowerCase();
  return type.includes("장문") || type.includes("long") || type.includes("textarea");
}

function isMultipleChoiceQuestion(question: FormQuestion) {
  const type = question.question_type.toLowerCase();
  return type.includes("객관식") || type.includes("single") || type.includes("radio") || type.includes("choice");
}

export function ClubApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [mode, setMode] = useState<ApplicationMode>("create");
  const [clubData, setClubData] = useState<ClubInfo | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [applicationForm, setApplicationForm] = useState<ClubForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionErrors, setQuestionErrors] = useState<Record<string, boolean>>({});
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  useEffect(() => {
    if (isAuthLoading) return;

    let ignore = false;

    const determineMode = () => {
      if (location.pathname.endsWith("/view")) return "view";
      if (location.pathname.endsWith("/edit")) return "edit";
      return "create";
    };

    const currentMode = determineMode();
    setMode(currentMode);

    const loadData = async () => {
      if (!id) return;
      
      setIsDataLoading(true);

      if (currentMode === "create") {
        if (isAuthenticated && user) {
          try {
            const hasApplied = await api.checkApplicationStatus(id);
            if (ignore) return;

            if (hasApplied) {
              toast.error("이미 지원서를 제출한 동아리입니다.", { id: "already-applied" });
              navigate(`/users/${user.studentId}/applications`, { replace: true });
              return;
            }
          } catch (error) {
            console.error("Failed to check application status", error);
          }
        }

        if (ignore) return;
        try {
          const club = await api.getClub(id);
          const form = await api.getClubForm(id);
          if (!ignore) {
            setApplicationForm(form);
            setAnswers(Object.fromEntries(form.questions.map((question) => [question.id, ""])));
            setClubData({
              title: club.name,
              category: club.division || "",
              description: club.description || "동아리 지원서를 작성합니다.",
            });
          }
        } catch {
          if (!ignore) setClubData(null);
        }
      } else {
        try {
          const appData = currentMode === "edit"
            ? await api.getMyDraft(id)
            : await api.getMySubmittedDetail(id);

          if (!ignore) {
            setAnswers(Object.fromEntries(
              appData.answers.map((answer) => [answer.question_id, answer.answer_text || ""]),
            ));

            if (appData.club_id) {
              try {
                const [club, form] = await Promise.all([
                  api.getClub(appData.club_id),
                  api.getClubForm(appData.club_id),
                ]);
                if (!ignore) {
                  setApplicationForm(form);
                  setClubData({
                    title: club.name,
                    category: club.division || "",
                    description: club.description || "",
                  });
                }
              } catch {
                if (!ignore) {
                  setClubData({
                    title: appData.club_name || "동아리",
                    category: "",
                    description: "",
                  });
                }
              }
            } else {
              setClubData({
                title: appData.club_name || "동아리",
                category: "",
                description: "",
              });
            }
          }
        } catch (error) {
          console.error("Failed to load application", error);
          if (!ignore) setSubmitError("지원서 정보를 불러오는데 실패했습니다.");
        }
      }
      if (!ignore) setIsDataLoading(false);
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [id, location.pathname, isAuthLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name);
      setStudentId(String(user.studentId));
      setSelectedDepartment(user.department || "");
      setPhone(user.phone || "");
    }
  }, [isAuthenticated, user]);


  const [errors, setErrors] = useState<{
    name: boolean;
    studentId: boolean;
    department: boolean;
    phone: boolean;
  }>({
    name: false,
    studentId: false,
    department: false,
    phone: false,
  });

  const orderedQuestions = [...(applicationForm?.questions ?? [])].sort(
    (first, second) => first.order_index - second.order_index,
  );

  const buildAnswerPayload = () => orderedQuestions.map((question) => ({
    question_id: question.id,
    answer_text: answers[question.id] ?? "",
  }));

  const handleSubmit = async () => {
    if (mode === "view") return;

    const newErrors = {
      name: !name.trim(),
      studentId: !studentId.trim(),
      department: !selectedDepartment,
      phone: !phone.trim(),
    };

    const nextQuestionErrors = Object.fromEntries(
      orderedQuestions.map((question) => [
        question.id,
        question.is_required && !(answers[question.id] ?? "").trim(),
      ]),
    );

    setErrors(newErrors);
    setQuestionErrors(nextQuestionErrors);
    setSubmitError(null);

    const hasErrors = Object.values(newErrors).some((error) => error)
      || Object.values(nextQuestionErrors).some((error) => error);
    if (hasErrors) {
      return;
    }

    if (!isAuthenticated) {
      setSubmitError("로그인이 필요합니다.");
      return;
    }

    if (!id || !clubData || !applicationForm) {
      setSubmitError("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const answerPayload = buildAnswerPayload();

      if (mode === "create") {
        if (draftId) {
          await api.updateApplicationAnswers(draftId, answerPayload, false);
        } else {
          await api.submitApplication({
            form_id: applicationForm.id,
            answers: answerPayload,
            is_draft: false,
          });
        }
        toast.success("지원서가 성공적으로 제출되었습니다.");
        navigate(`/club/${id}`, { state: { applicationSuccess: true } });
      } else {
        await api.updateApplicationAnswers(id, answerPayload, false);
        toast.success("지원서가 성공적으로 수정되었습니다.");
        navigate(user ? `/users/${user.studentId}/applications` : "/");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "작업 처리에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (mode === "view" || !id || !applicationForm) return;

    const answerPayload = buildAnswerPayload();

    setIsSavingDraft(true);
    try {
      if (mode === "create") {
        if (draftId) {
          await api.updateApplicationAnswers(draftId, answerPayload, true);
        } else {
          const result = await api.submitApplication({
            form_id: applicationForm.id,
            answers: answerPayload,
            is_draft: true,
          });
          setDraftId(result.id);
        }
      } else {
        await api.updateApplicationAnswers(id, answerPayload, true);
      }
      toast.success("지원서가 임시저장되었습니다.");
    } catch {
      toast.error("임시저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const validateFieldOnBlur = (field: keyof typeof errors, value: string) => {
    if (value.trim() && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const isLoading = isAuthLoading || isDataLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!clubData && !submitError) {
    return <NotFound />;
  }
  
  if (submitError && !clubData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="text-destructive font-medium">{submitError}</div>
            <Button onClick={() => navigate(-1)}>뒤로 가기</Button>
        </div>
      );
  }

  const isReadOnly = mode === "view";
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="outline"
          onClick={() => {
             if (mode === 'create') {
                navigate(`/club/${id}`);
             } else {
                navigate(user ? `/users/${user.studentId}/applications` : '/');
             }
          }}
          className="inline-flex items-center justify-start text-left gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">
            {mode === 'create' ? '동아리 상세로 돌아가기' : '내 지원 내역으로 돌아가기'}
          </span>
        </Button>

        <div className="flex flex-col gap-8">
          <Card>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">
                      {clubData?.title || "동아리"}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {clubData?.category || "분과"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {clubData?.description || "동아리 지원서를 작성합니다."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="name" className="gap-1">
                    이름<span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => validateFieldOnBlur("name", name)}
                    className={cn(
                      "bg-muted cursor-not-allowed",
                      errors.name &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    readOnly
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="studentId" className="gap-1">
                    학번<span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="studentId"
                    placeholder="20251234"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onBlur={() => validateFieldOnBlur("studentId", studentId)}
                    className={cn(
                      "bg-muted cursor-not-allowed",
                      errors.studentId &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    readOnly
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="department" className="gap-1">
                    학과<span className="text-destructive">*</span>
                  </FieldLabel>
                  {isAuthenticated || isReadOnly ? (
                    <Input
                      id="department"
                      value={selectedDepartment}
                      className="bg-muted cursor-not-allowed"
                      readOnly
                    />
                  ) : (
                    <DepartmentCombobox
                      value={selectedDepartment}
                      onValueChange={(value) => {
                        setSelectedDepartment(value);
                        if (value && errors.department) {
                          setErrors((prev) => ({
                            ...prev,
                            department: false,
                          }));
                        }
                      }}
                      hasError={errors.department}
                    />
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone" className="gap-1">
                    전화번호<span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => validateFieldOnBlur("phone", phone)}
                    className={cn(
                      "bg-muted cursor-not-allowed",
                      errors.phone &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    readOnly
                    required
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                {applicationForm?.title || "지원서 문항"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderedQuestions.length > 0 ? (
                <FieldGroup className="gap-7">
                  {orderedQuestions.map((question, index) => {
                    const fieldId = `question-${question.id}`;
                    const value = answers[question.id] ?? "";
                    const hasError = questionErrors[question.id] ?? false;
                    const options = (question.options ?? []).filter(
                      (option): option is string => typeof option === "string" && option.trim().length > 0,
                    );

                    return (
                      <Field key={question.id} className="gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <FieldLabel htmlFor={fieldId} className="flex flex-wrap gap-1 text-base leading-6">
                              {question.question_text}
                              {question.is_required && <span className="text-destructive">*</span>}
                            </FieldLabel>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {question.is_required ? "필수 응답" : "선택 응답"}
                            </p>
                          </div>
                        </div>

                        {isMultipleChoiceQuestion(question) ? (
                          options.length > 0 ? (
                            <div
                              id={fieldId}
                              role="radiogroup"
                              aria-label={question.question_text}
                              className={cn(
                                "grid gap-2 rounded-xl border bg-muted/20 p-3",
                                hasError && "border-destructive",
                              )}
                            >
                              {options.map((option) => (
                                <label
                                  key={option}
                                  className={cn(
                                    "flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm transition-colors",
                                    !isReadOnly && "cursor-pointer hover:border-primary/40 hover:bg-primary/5",
                                    value === option && "border-primary bg-primary/5 ring-1 ring-primary/20",
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name={fieldId}
                                    value={option}
                                    checked={value === option}
                                    disabled={isReadOnly}
                                    onChange={() => {
                                      setAnswers((prev) => ({ ...prev, [question.id]: option }));
                                      setQuestionErrors((prev) => ({ ...prev, [question.id]: false }));
                                    }}
                                    className="size-4 accent-primary"
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                              관리자가 객관식 선택지를 아직 설정하지 않았습니다.
                            </p>
                          )
                        ) : isLongAnswerQuestion(question) ? (
                          <Textarea
                            id={fieldId}
                            value={value}
                            placeholder="답변을 입력해주세요."
                            readOnly={isReadOnly}
                            onChange={(event) => {
                              setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }));
                              if (event.target.value.trim()) {
                                setQuestionErrors((prev) => ({ ...prev, [question.id]: false }));
                              }
                            }}
                            className={cn(
                              "min-h-[140px] resize-y",
                              hasError && "border-destructive focus-visible:ring-destructive",
                              isReadOnly && "cursor-not-allowed bg-muted",
                            )}
                          />
                        ) : (
                          <Input
                            id={fieldId}
                            value={value}
                            placeholder="답변을 입력해주세요."
                            readOnly={isReadOnly}
                            onChange={(event) => {
                              setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }));
                              if (event.target.value.trim()) {
                                setQuestionErrors((prev) => ({ ...prev, [question.id]: false }));
                              }
                            }}
                            className={cn(
                              "h-11",
                              hasError && "border-destructive focus-visible:ring-destructive",
                              isReadOnly && "cursor-not-allowed bg-muted",
                            )}
                          />
                        )}

                        {hasError && (
                          <p className="ml-10 text-sm text-destructive">필수 문항에 답변해주세요.</p>
                        )}
                      </Field>
                    );
                  })}
                </FieldGroup>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                  <p className="font-medium text-foreground">등록된 지원 문항이 없습니다.</p>
                  <p className="mt-1 text-sm text-muted-foreground">동아리 관리자에게 문의해주세요.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {submitError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {submitError}
            </div>
          )}

          {!isReadOnly && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSavingDraft}
              >
                {isSavingDraft ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isSavingDraft ? "저장 중..." : "임시저장"}
              </Button>
              <Button
                size="lg"
                className="w-full py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    제출하기
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
