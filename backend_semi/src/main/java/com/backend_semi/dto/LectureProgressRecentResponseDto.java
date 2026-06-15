package com.backend_semi.dto;

import com.backend_semi.entity.LectureProgress;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class LectureProgressRecentResponseDto {

    private Long lectureId;
    private String category;
    private String name;
    private int viewCount;
    private LocalDateTime lastViewedAt;

    public static LectureProgressRecentResponseDto from(LectureProgress progress) {
        return new LectureProgressRecentResponseDto(
                progress.getLecture().getId(),
                progress.getLecture().getCategory(),
                progress.getLecture().getName(),
                progress.getViewCount(),
                progress.getLastViewedAt()
        );
    }
}