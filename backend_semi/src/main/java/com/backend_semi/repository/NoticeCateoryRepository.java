package com.backend_semi.repository;


import com.backend_semi.entity.NoticeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeCateoryRepository extends JpaRepository<NoticeCategory, Long> {
}
