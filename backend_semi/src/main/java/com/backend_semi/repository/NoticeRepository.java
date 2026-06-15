package com.backend_semi.repository;

import com.backend_semi.entity.Notice;
import com.backend_semi.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    // 최신순 전체 조회
    List<Notice> findAllByOrderByCreatedAtDesc();

    // 카테고리별 최신순 조회
    //  notice.noticeCategory.noticeCategoryId 기준
    List<Notice> findByNoticeCategory_NoticeCategoryIdOrderByCreatedAtDesc(Long noticeCategoryId);

    // 작성자별 공지사항 최신순 조회
    // Notice.member.memberId 기준
    List<Notice> findByMember_MemberIdOrderByCreatedAtDesc(Long memberId);

    // 작성자 Id 순서대로 전체 조회
    List<Notice> findAllByOrderByMember_MemberIdAsc();

    //작성자 ID 순서 + 최신순
    List<Notice> findAllByOrderByMember_MemberIdAscCreatedAtDesc();

    List<Notice> findByNoticeCategory_NoticeCategoryIdAndMember_MemberIdOrderByCreatedAtDesc(
            Long noticeCategoryId,
            Long memberId
    );

    void deleteByMember(Member member);
}
