package com.backend_semi.dto;

import com.backend_semi.entity.Member;
import com.backend_semi.entity.NoticeCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class NoticeDto {
    private Long noticeId;
    private NoticeCategory noticeCategory;
    private Member member;
    private String title;
    private String contents;
    private String attachmentUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
