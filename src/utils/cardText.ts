// порожня сторона картки показується як "…" (як у Quizlet);
// стосується тільки показу — у полях редагування лишається порожньо
export const cardSideText = (value: string | undefined) => value?.trim() || "…";
