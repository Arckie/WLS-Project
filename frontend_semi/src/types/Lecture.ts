export interface Lecture {
    id: number;
    category: string;
    name: string;
    lecture_description: string;
    code_example: string;
    code_description: string;
    language: string;
    created_at: string;
    updated_at: string | null; // 수정 전에는 null일 수 있음
}