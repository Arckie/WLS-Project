package com.backend_semi.service;

import com.backend_semi.constant.Role;
import com.backend_semi.dto.*;
import com.backend_semi.entity.LearningProfile;
import com.backend_semi.entity.MemberLearningProfile;
import com.backend_semi.entity.Member;
import com.backend_semi.repository.LearningProfileRepository;
import com.backend_semi.repository.FavoriteRepository;
import com.backend_semi.repository.LectureProgressRepository;
import com.backend_semi.repository.MemberLearningProfileRepository;
import com.backend_semi.repository.MemberRepository;
import com.backend_semi.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backend_semi.security.JwtUtil;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final LearningProfileRepository learningProfileRepository;
    private final MemberLearningProfileRepository memberLearningProfileRepository;
    private final FavoriteRepository favoriteRepository;
    private final LectureProgressRepository lectureProgressRepository;
    private final NoticeRepository noticeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public Long signup(MemberSignupRequestDto request){
        // 1.아이디 중복 확인
        if(memberRepository.existsByLoginId(request.getLoginId())){
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // 2. 이메일 중복 확인
        if(memberRepository.existsByEmail(request.getEmail())){
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 3. Member 객체 생성
        Member member = new Member(
                Role.USER,
                request.getName(),
                request.getLoginId(),
                encodedPassword,
                request.getEmail(),
                request.getPhone(),
                request.getBirthDate()
        );

        // 4. members 테이블에 저장

        Member savedMember = memberRepository.save(member);

        // 5. 선택한 관심학습분야 저장
        if(request.getProfileIds() != null){
            for(Long profileId : request.getProfileIds()){
                LearningProfile learningProfile = learningProfileRepository.findById(profileId)
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 학습 프로필입니다."));

                MemberLearningProfile memberLearningProfile = new MemberLearningProfile(savedMember, learningProfile);

                memberLearningProfileRepository.save(memberLearningProfile);
            }
        }
        return savedMember.getMemberId();
    }

    @Transactional(readOnly = true)
    public MemberLoginResponseDto login(MemberLoginRequestDto request){
        // 1.loginId로 회원 찾기
        Member member = memberRepository.findByLoginId(request.getLoginId())
                .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 아이디입니다."));
        // 2. 비밀번호 비교
        if(!passwordEncoder.matches(request.getPassword(), member.getPassword())){
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다!");
        }

        String accessToken = jwtUtil.createAccessToken(
                member.getMemberId(),
                member.getLoginId(),
                member.getName(),
                member.getRole().name()
        );

        // 3.로그인 성공 응답 변환
        return new MemberLoginResponseDto(
                accessToken,
                member.getMemberId(),
                member.getRole().name(),
                member.getLoginId(),
                member.getEmail(),
                member.getName(),
                member.getPhone()
        );
    }

    @Transactional(readOnly = true)
    public MemberInfoResponseDto getMyInfo(Long memberId){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 회원입니다."));

        List<String> profileCodes = member.getMemberLearningProfiles()
                .stream()
                .map(memberLearningProfile ->
                        memberLearningProfile.getLearningProfile().getProfileCode()
                )
                .toList();

        return new MemberInfoResponseDto(
                member.getLoginId(),
                member.getName(),
                member.getPhone(),
                member.getEmail(),
                member.getBirthDate(),
                profileCodes
        );
    }

    @Transactional(readOnly = true)
    public boolean checkLoginDuplicate(String loginId){
        return memberRepository.existsByLoginId(loginId);
    }

    // 패스워드를 변경하는 메서드
    @Transactional
    public void changePassword(String loginId, MemberPasswordChangeRequestDto request){
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("현재 비밀번호를 입력해 주세요.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("새 비밀번호를 입력해 주세요.");
        }

        if (request.getNewPasswordConfirm() == null || request.getNewPasswordConfirm().isBlank()) {
            throw new IllegalArgumentException("새 비밀번호 확인을 입력해 주세요.");
        }

        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
        }

        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        member.changePassword(passwordEncoder.encode(request.getNewPassword()));
    }
    // 회원정보를 수정하는 메서드
    @Transactional
    public void updateMemberInfo(String loginId, MemberUpdateRequestDto request) {
        // 특정 정보만 수정가능하게 해야함.
        // 그러면 일단은 기본 정보를 가져와야하지 않을까?
        // 그러면 먼저 데이터를 가져갔다가, 수정될 데이터만 새로 입력받아서 보내는 걸로 컨셉을 정하자.
        // #1 기존 데이터를 memberRepository에서 받아온다.
        // #2 기존 데이터를 프론트에서 받고, 수정될 데이터만 다시 입혀서 Json 형태로 백으로 돌려받는다.
        //.#3 돌려받은 데이터를 JPA로 UPDATE 한다.
        // #4 완료!!
        // Password는 DB에서 가져올 수 없으므로 Password는 생략하고 가져오자.
        // loginId, name은 수정 못하는걸로 하자.
        // 그러면 수정할 수 있는게 이메일, 전화번호, 생년월일, 관심학습분야임.
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(()->new IllegalArgumentException(("회원 정보를 찾을 수 없습니다!")));
        // 이메일을 못받았는가?
        if(request.getEmail() == null || request.getEmail().isBlank()){
            throw new IllegalArgumentException("이메일을 입력해주세요!");
        }

        // 전화번호를 못받았는가?
        if(request.getPhone() == null || request.getPhone().isBlank()){
            throw new IllegalArgumentException("전화번호를 입력해주세요!");
        }

        // 생년월일을 못받았는가? YYYY-MM-DD
        if(request.getBirthDate() == null){
            throw new IllegalArgumentException("생일을 입력해주세요!");
        }

        member.updateMemberInfo(
                request.getEmail(),
                request.getPhone(),
                request.getBirthDate()
        );

        // 2. 관심 학습 분야 수정
        // 프론트에서 learningProfile 배열을 보내면 기존걸 지우고 새 배열로 교체.
        if (request.getLearningProfile() != null) { // 수정
            memberLearningProfileRepository.deleteAllByMember(member);

            for (Long learningProfileId : request.getLearningProfile()) {
                LearningProfile learningProfile = learningProfileRepository.findById(learningProfileId)
                        .orElseThrow(() -> new IllegalArgumentException("관심학습분야를 찾을 수 없습니다."));

                MemberLearningProfile memberLearningProfile =
                        new MemberLearningProfile(member, learningProfile);

                memberLearningProfileRepository.save(memberLearningProfile);
            }
        }


        // 3. 비밀번호 입력 값이 하나라도 있으면 비밀번호 변경 시도로 봄.
        if(hasPasswordChangeRequest(request)){
            changePasswordInternal(
                    member,
                    request.getCurrentPassword(),
                    request.getNewPassword(),
                    request.getNewPasswordConfirm()
            );
        }
    }
    private boolean hasPasswordChangeRequest(MemberUpdateRequestDto request){
        return request.getCurrentPassword() != null && !request.getCurrentPassword().isBlank()
                || request.getNewPassword() != null && !request.getNewPassword().isBlank()
                || request.getNewPasswordConfirm() != null && !request.getNewPasswordConfirm().isBlank();
    }

    private void changePasswordInternal(
            Member member,
            String currentPassword,
            String newPassword,
            String newPasswordConfirm
    ){
        if(currentPassword == null || currentPassword.isBlank()){
            throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
        }

        if(newPassword == null || newPassword.isBlank()){
            throw new IllegalArgumentException("새 비밀번호를 입력해주세요.");
        }

        if(newPasswordConfirm == null || newPasswordConfirm.isBlank()){
            throw new IllegalArgumentException("새 비밀번호 확인을 입력해주세요.");
        }

        if(!newPassword.equals(newPasswordConfirm)){
            throw new IllegalArgumentException("새 비밀번호가 일치하지않습니다.");
        }

        if(!passwordEncoder.matches(currentPassword, member.getPassword())){
            throw new IllegalArgumentException("현재 비밀번호가 일치하지않습니다.");
        }
        String encodedPassword = passwordEncoder.encode(newPassword);

        member.changePassword(encodedPassword);
    }

    @Transactional
    public void deleteMember(String loginId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));

        /*
          members를 바로 지우면 favorite, lecture_progress, notices가
          member_id를 참조하고 있어서 DB 외래키 제약 조건에 걸립니다.
          회원 탈퇴는 자식 데이터부터 정리한 뒤 마지막에 회원을 삭제합니다.
        */
        favoriteRepository.deleteByMember(member);
        lectureProgressRepository.deleteByMember(member);
        noticeRepository.deleteByMember(member);

        memberRepository.delete(member);
    }

    // Passwordless 로그인 - userId로 회원 찾아서 JWT 발급
    @Transactional
    public MemberLoginResponseDto passwordlessLogin(String loginId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        String accessToken = jwtUtil.createAccessToken(
                member.getMemberId(),
                member.getLoginId(),
                member.getName(),
                member.getRole().name()
        );

        return new MemberLoginResponseDto(
                accessToken,
                member.getMemberId(),
                member.getRole().name(),
                member.getLoginId(),
                member.getEmail(),
                member.getName(),
                member.getPhone()
        );
    }
}
