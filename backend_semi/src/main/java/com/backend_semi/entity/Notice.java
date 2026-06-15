package com.backend_semi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@Entity
@Table(name="notices")
@NoArgsConstructor
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="notice_id")
    private Long noticeId;

    // 공지사항 카테고리 FK
    // notices.notice_category_id -> notice_categories.notice_category_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="notice_category_id", nullable=false)
    private NoticeCategory noticeCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="member_id", nullable=false)
    private Member member;

    @Column(name="title", nullable = false)
    private String title;

    @Column(name="contents", nullable=false, columnDefinition="TEXT")
    private String contents;

    @Column(name="attachment_url", length=500)
    private String attachmentUrl;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    public Notice(
            NoticeCategory noticeCategory,
            Member member,
            String title,
            String contents,
            String attachmentUrl
    ){
        this.noticeCategory = noticeCategory;
        this.member = member;
        this.title = title;
        this.contents = contents;
        this.attachmentUrl = attachmentUrl;
        this.createdAt = LocalDateTime.now();
    }

    public void updateNotice(
            NoticeCategory noticeCategory,
            String title,
            String contents,
            String attachmentUrl
    ){
        this.noticeCategory = noticeCategory;
        this.title = title;
        this.contents = contents;
        this.attachmentUrl = attachmentUrl;
        this.updatedAt = LocalDateTime.now();
    }
}
