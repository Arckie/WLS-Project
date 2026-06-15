package com.backend_semi.controller;

import com.backend_semi.dto.LectureProgressRecentResponseDto;
import com.backend_semi.dto.LectureProgressSummaryResponseDto;
import com.backend_semi.service.LectureProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lecture/list/progress")
@RequiredArgsConstructor
public class LectureProgressController {

    private final LectureProgressService lectureProgressService;

    @PostMapping("/{lectureId}")
    public ResponseEntity<Void> saveProgress(
            Authentication authentication,
            @PathVariable Long lectureId
    ) {
        String loginId = (String) authentication.getDetails();

        lectureProgressService.saveProgress(loginId, lectureId);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/recent-list")
    public ResponseEntity<List<LectureProgressRecentResponseDto>> getRecentProgressList(
            Authentication authentication
    ) {
        String loginId = (String) authentication.getDetails();

        List<LectureProgressRecentResponseDto> recentList =
                lectureProgressService.getRecentProgressList(loginId);

        return ResponseEntity.ok(recentList);
    }

    @GetMapping("/summary")
    public ResponseEntity<List<LectureProgressSummaryResponseDto>> getProgressSummary(
            Authentication authentication
    ) {
        String loginId = (String) authentication.getDetails();

        List<LectureProgressSummaryResponseDto> summary =
                lectureProgressService.getProgressSummary(loginId);

        return ResponseEntity.ok(summary);
    }
}