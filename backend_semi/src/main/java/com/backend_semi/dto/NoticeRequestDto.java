package com.backend_semi.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoticeRequestDto {
    //공지사항에서 카테고리 ID
    // 프론트에서는 '중요공지' '업데이트'와 같은 카테고리 선택시
    // 실제로는 noticeCateogryId 숫자값을 보내는 구조
    private Long noticeCategoryId;

    //공지사항 제목
    private String title;

    //공지사항 내용
    private String contents;

    // 첨부파일 URL
    // 첨부파일이 없으면 Null 가능
    private String attachmentUrl;
}
