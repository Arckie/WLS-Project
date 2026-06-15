package com.backend_semi.repository;

import com.backend_semi.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    List<Lecture> findLectureByOrderByIdAsc();

    @Query("""
            SELECT l.category, COUNT(l)
            FROM Lecture l
            GROUP BY l.category
            ORDER BY MIN(l.id)
            """)
    List<Object[]> countTotalLecturesByCategory();
}