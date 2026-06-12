package com.backend_semi.repository;

import com.backend_semi.constant.Role;
import com.backend_semi.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    boolean existsByEmail(String email);

    // 아이디 검색과 권한 필터를 통해 페이지 단위로 조회
    Page<Member> findByLoginIdContaining(String keyword, Pageable pageable);

    Page<Member> findByRole(Role role, Pageable pageable);

    Page<Member> findByLoginIdContainingAndRole(
            String keyword, Role role, Pageable pageable
    );

    // 오늘 가입자 수
    Long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            LocalDateTime todayStart,
            LocalDateTime tomorrowStart
    );
}