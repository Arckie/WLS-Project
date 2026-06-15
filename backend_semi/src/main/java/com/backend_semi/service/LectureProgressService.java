package com.backend_semi.service;

import com.backend_semi.dto.LectureProgressRecentResponseDto;
import com.backend_semi.dto.LectureProgressSummaryResponseDto;
import com.backend_semi.entity.Lecture;
import com.backend_semi.entity.LectureProgress;
import com.backend_semi.entity.Member;
import com.backend_semi.repository.LectureProgressRepository;
import com.backend_semi.repository.LectureRepository;
import com.backend_semi.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LectureProgressService {

    private final MemberRepository memberRepository;
    private final LectureRepository lectureRepository;
    private final LectureProgressRepository lectureProgressRepository;

    @Transactional
    public void saveProgress(String loginId, Long lectureId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("강의를 찾을 수 없습니다."));

        LectureProgress progress = lectureProgressRepository
                .findByMemberAndLecture(member, lecture)
                .orElse(null);

        if (progress == null) {
            LectureProgress newProgress = new LectureProgress(member, lecture);
            lectureProgressRepository.save(newProgress);
            return;
        }

        progress.updateViewedAt();
    }

    @Transactional(readOnly = true)
    public List<LectureProgressRecentResponseDto> getRecentProgressList(String loginId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        return lectureProgressRepository.findByMemberOrderByLastViewedAtDesc(member)
                .stream()
                .map(LectureProgressRecentResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LectureProgressSummaryResponseDto> getProgressSummary(String loginId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        List<Object[]> totalResults = lectureRepository.countTotalLecturesByCategory();
        List<Object[]> viewedResults = lectureProgressRepository.countViewedLecturesByCategory(member);

        Map<String, Long> viewedCountMap = new HashMap<>();

        for (Object[] row : viewedResults) {
            String category = (String) row[0];
            Long viewedCount = (Long) row[1];

            viewedCountMap.put(category, viewedCount);
        }

        return totalResults.stream()
                .map(row -> {
                    String category = (String) row[0];
                    Long totalCount = (Long) row[1];
                    Long viewedCount = viewedCountMap.getOrDefault(category, 0L);

                    int progressRate = 0;

                    if (totalCount > 0) {
                        progressRate = Math.round((viewedCount * 100.0f) / totalCount);
                    }

                    return new LectureProgressSummaryResponseDto(
                            category,
                            viewedCount,
                            totalCount,
                            progressRate
                    );
                })
                .toList();
    }
}