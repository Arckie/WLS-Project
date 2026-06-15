package com.backend_semi.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "lecture_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_member_lecture",
                        columnNames = {"member_id", "lecture_id"}
                )
        }
)
// 서비스 로직이 기존 기록이 있을떄만 그대로 호출하고, 아니면 new 생성자로 새로 만들 것.
public class LectureProgress {
    // 누가 봤는지
    // 마지막에 무얼 봤는지?
    // 대주제를 몇개 봤는지
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="lecture_progress_id")
    private Long lectureProgressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lecture_id", nullable = false)
    private Lecture lecture;

    // 마지막으로 본 시간
    @Column(name="last_viewed_at", nullable = false)
    private LocalDateTime lastViewedAt;

    // 본 회수
    @Column(name="view_count", nullable = false)
    private int viewCount;

    public LectureProgress(Member member, Lecture lecture){
        this.member = member;
        this.lecture = lecture;
        this.lastViewedAt =  LocalDateTime.now();
        this.viewCount = 1;
    }

    public void updateViewedAt(){
        this.lastViewedAt = LocalDateTime.now();
        this.viewCount += 1;
    }
}
