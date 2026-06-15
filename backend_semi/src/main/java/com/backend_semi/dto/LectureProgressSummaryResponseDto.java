package com.backend_semi.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LectureProgressSummaryResponseDto {

    private String category;
    private long viewedCount;
    private long totalCount;
    private int progressRate;
}