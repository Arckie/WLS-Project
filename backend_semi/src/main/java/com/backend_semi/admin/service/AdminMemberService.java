package com.backend_semi.admin.service;

import com.backend_semi.admin.dto.AdminMemberResponse;
import com.backend_semi.constant.Role;
import com.backend_semi.controller.MemberController;
import com.backend_semi.entity.Member;
import com.backend_semi.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMemberService {

    private final MemberRepository memberRepository;

    // 관리자 회원 목록 조회 처리
    @Transactional(readOnly = true)
    public List<AdminMemberResponse> getMembers(){
        List<Member> members = memberRepository.findAll();

        return members.stream()
                .map(member -> new AdminMemberResponse(member))
                .toList();
    }
    // 관리자 회원 탈퇴 처리
    @Transactional
    public void deleteMember(Long memberId){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(()-> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));

        memberRepository.delete(member);

    }

    //관리자 권한 변경 처리
    @Transactional
    public void changeMemberRoleToAdmin(Long memberId){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(()-> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));

        member.changeRole(Role.ADMIN);
    }

}