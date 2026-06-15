package com.backend_semi.repository;

import com.backend_semi.entity.Lecture;
import com.backend_semi.entity.LectureProgress;
import com.backend_semi.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LectureProgressRepository extends JpaRepository<LectureProgress, Long> {

    Optional<LectureProgress> findByMemberAndLecture(Member member, Lecture lecture);

    Optional<LectureProgress> findTopByMemberOrderByLastViewedAtDesc(Member member);

    List<LectureProgress> findByMemberOrderByLastViewedAtDesc(Member member);

    void deleteByMember(Member member);

    void deleteByLecture(Lecture lecture);

    @Query("""
            SELECT lp.lecture.category, COUNT(lp)
            FROM LectureProgress lp
            WHERE lp.member = :member
            GROUP BY lp.lecture.category
            """)
    List<Object[]> countViewedLecturesByCategory(Member member);
}
