package com.backend_semi.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminStatusResponse {
    private Long totalMemberCount;
    private Long todayJoinMember;
    private Long totalLectureCount;


}
