package com.backend_semi.dto;

import com.backend_semi.entity.Notice;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class NoticeResponseDto {
    private Long noticeId;

    private Long noticeCategoryId;

    private String noticeCategoryName;

    private Long memberId;

    private String title;

    private String contents;

    private String attachmentUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public NoticeResponseDto(Notice notice) {
        this.noticeId = notice.getNoticeId();
        this.noticeCategoryId = notice.getNoticeCategory().getNoticeCategoryId();
        this.noticeCategoryName = notice.getNoticeCategory().getCategoryName();

        this.memberId = notice.getMember().getMemberId();

        this.title = notice.getTitle();
        this.contents = notice.getContents();
        this.attachmentUrl = notice.getAttachmentUrl();
        this.createdAt = notice.getCreatedAt();
        this.updatedAt = notice.getUpdatedAt();
    }
}
