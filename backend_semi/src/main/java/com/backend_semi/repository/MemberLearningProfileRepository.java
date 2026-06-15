package com.backend_semi.repository;

import com.backend_semi.entity.Member;
import com.backend_semi.entity.MemberLearningProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberLearningProfileRepository extends JpaRepository<MemberLearningProfile, Long> {
    void deleteByMember(Member member);

    // 추가
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from MemberLearningProfile m where m.member = :member")
    void deleteAllByMember(@Param("member") Member member);
}
