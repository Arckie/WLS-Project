import { Alert, Form } from "react-bootstrap";
import { LECTURE_LANGUAGE_OPTIONS } from "../../constants/lectureForm";
import type { LectureFormErrors, LectureFormValue } from "../../types/LectureForm";

type LectureEditorFormProps = {
  title: string;
  description: string;
  lecture: LectureFormValue;
  errors: LectureFormErrors;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onFieldChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onSubmit: (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => void | Promise<void>;
  onCancel: () => void;
};

function LectureEditorForm({
  title,
  description,
  lecture,
  errors,
  categories,
  selectedCategory,
  onCategoryChange,
  onFieldChange,
  onSubmit,
  onCancel,
}: LectureEditorFormProps) {
  return (
    <main className="lecture-edit-page">
      <section className="lecture-edit-panel">
        <div className="lecture-edit-title-row">
          <div className="lecture-edit-title-icon">▣</div>

          <div>
            <p className="lecture-edit-badge">LECTURE ADMIN</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>

        {errors.general && (
          <Alert className="lecture-edit-alert" variant="danger">
            {errors.general}
          </Alert>
        )}

        {/* 입력 폼은 등록/수정 화면이 함께 사용한다. submit 이벤트만 부모 페이지가 처리한다. */}
        <Form className="lecture-edit-form" onSubmit={onSubmit}>
          <Form.Group className="lecture-form-row" controlId="formCategory">
            <Form.Label>대주제</Form.Label>

            <div className="lecture-form-control-area">
              {/* 기존 대주제를 고르거나, 없으면 직접 입력으로 새 대주제를 만든다. */}
              <Form.Select
                value={selectedCategory}
                onChange={onCategoryChange}
                isInvalid={!!errors.category}
              >
                <option value="">대주제를 선택해 주세요.</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}

                <option value="custom">직접 입력</option>
              </Form.Select>

              {selectedCategory === "custom" && (
                <Form.Control
                  className="lecture-custom-category"
                  as="textarea"
                  rows={2}
                  placeholder="새로운 대주제를 입력해 주세요."
                  name="category"
                  value={lecture.category}
                  onChange={onFieldChange}
                  isInvalid={!!errors.category}
                />
              )}

              <Form.Control.Feedback type="invalid">
                {errors.category}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="lecture-form-row" controlId="formName">
            <Form.Label>파일 이름</Form.Label>

            <div className="lecture-form-control-area">
              <Form.Control
                type="text"
                placeholder="파일 이름을 입력해 주세요."
                name="name"
                value={lecture.name}
                onChange={onFieldChange}
                isInvalid={!!errors.name}
              />

              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group
            className="lecture-form-row textarea-row"
            controlId="formlecture_description"
          >
            <Form.Label>강의 설명</Form.Label>

            <div className="lecture-form-control-area">
              <Form.Control
                className="description-textarea"
                as="textarea"
                rows={3}
                placeholder="강의 설명을 입력해 주세요."
                name="lecture_description"
                value={lecture.lecture_description}
                onChange={onFieldChange}
                isInvalid={!!errors.lecture_description}
              />

              <Form.Control.Feedback type="invalid">
                {errors.lecture_description}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="lecture-form-row textarea-row" controlId="formCode_example">
            <Form.Label>코드 예시</Form.Label>

            <div className="lecture-form-control-area">
              <Form.Control
                className="code-textarea"
                as="textarea"
                rows={8}
                placeholder="코드 예시를 입력해 주세요."
                name="code_example"
                value={lecture.code_example}
                onChange={onFieldChange}
                isInvalid={!!errors.code_example}
              />

              <Form.Control.Feedback type="invalid">
                {errors.code_example}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="lecture-form-row textarea-row" controlId="formCode_description">
            <Form.Label>코드 설명</Form.Label>

            <div className="lecture-form-control-area">
              <Form.Control
                className="code-textarea"
                as="textarea"
                rows={8}
                placeholder="코드 설명을 입력해 주세요."
                name="code_description"
                value={lecture.code_description}
                onChange={onFieldChange}
                isInvalid={!!errors.code_description}
              />

              <Form.Control.Feedback type="invalid">
                {errors.code_description}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="lecture-form-row" controlId="formLanguage">
            <Form.Label>언어</Form.Label>

            <div className="lecture-form-control-area">
              <Form.Select
                name="language"
                value={lecture.language}
                onChange={onFieldChange}
                isInvalid={!!errors.language}
              >
                <option value="-">언어 카테고리를 선택해 주세요.</option>

                {LECTURE_LANGUAGE_OPTIONS.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                {errors.language}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <div className="lecture-edit-button-row">
            <button
              type="button"
              className="lecture-cancel-button"
              onClick={onCancel}
            >
              취소
            </button>

            <button type="submit" className="lecture-submit-button">
              {title}
            </button>
          </div>
        </Form>
      </section>
    </main>
  );
}

export default LectureEditorForm;