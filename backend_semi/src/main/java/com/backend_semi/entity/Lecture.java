package com.backend_semi.entity;

import com.backend_semi.constant.Language;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Entity
@Table(name = "lectures")
@Getter @Setter @ToString
public class Lecture {

    // PK
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lecture_id")
    private Long id;

    // 대주제
    @Column(nullable = false)
    @NotBlank(message = "대주제는 필수 입력 사항입니다.")
    private String category;

    // 소주제 - 파일 이름
    @Column(nullable = false)
    @NotBlank(message = "소주제는 필수 입력 사항입니다.")
    private String name;

    // 강의 설명 - 소주제 소개문구
    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "강의 설명은 필수 입력 사항입니다.")
    private String lecture_description;

    // 코드 예시
    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "코드 예시는 필수 입력 사항입니다.")
    private String code_example;

    // 코드 설명
    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "코드 설명은 필수 입력 사항입니다.")
    private String code_description;

    // 사용 언어
    @Enumerated(EnumType.STRING)
    @NotNull(message = "사용 언어는 필수 선택 사항입니다.")
    private Language language;

    // 생성일자
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate created_at ; // 등록 일자

    // 수정일자
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate updated_at ; // 등록 일자

}
