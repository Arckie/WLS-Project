package com.backend_semi.admin.service;

import com.backend_semi.admin.dto.AdminMemberResponse;
import com.backend_semi.admin.dto.AdminStatusResponse;
import com.backend_semi.constant.Role;
import com.backend_semi.controller.MemberController;
import com.backend_semi.entity.Member;
import com.backend_semi.repository.LectureRepository;
import com.backend_semi.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMemberService {

    private final MemberRepository memberRepository;
    private final LectureRepository lectureRepository;

    // 관리자 통계 조회 처리

    public AdminStatusResponse getAdminStatus(){

        Long totalMemberCount = memberRepository.count();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime tomorrowStart = LocalDate.now().plusDays(1).atStartOfDay();
        Long todayJoinMember = memberRepository.
                countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        todayStart, tomorrowStart
                );

        Long totalLectureCount = lectureRepository.count();

        return new AdminStatusResponse(
                totalMemberCount,
                todayJoinMember,
                totalLectureCount

        );
    }


    // 관리자 회원 목록 조회 처리

    public Page<AdminMemberResponse> getMembers(
            int page, int size, String keyword, Role role
    ){
        Pageable pageable = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC,"createdAt")
        );

        Page<Member> members;

        if (keyword != null && !keyword.isBlank() && role != null){
            members = memberRepository.findByLoginIdContainingAndRole(
                    keyword,role,pageable
             );
          } else if (keyword != null && !keyword.isBlank()) {
            members = memberRepository.findByLoginIdContaining(
                    keyword,pageable
            );
          } else if (role != null) {
            members = memberRepository.findByRole(
                    role, pageable
            );

        } else {
            members = memberRepository.findAll(pageable);

        }

        return members.map(AdminMemberResponse::new);
    }




    //관리자 권한 변경 처리
    @Transactional
    public void changeMemberRole(Long memberId, Role role){
        if (role == null){
            throw new IllegalArgumentException("변경할 권한이 없습니다.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(()-> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));

        member.changeRole(role);
    }

    // 관리자 회원 삭제 처리
    @Transactional
    public void deleteMember(Long memberId){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(()-> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));

        memberRepository.delete(member);

    }

}