package com.backend_semi.service;

import com.backend_semi.constant.Role;
import com.backend_semi.dto.NoticeRequestDto;
import com.backend_semi.dto.NoticeResponseDto;
import com.backend_semi.entity.Notice;
import com.backend_semi.entity.Member;
import com.backend_semi.entity.NoticeCategory;
import com.backend_semi.repository.MemberRepository;
import com.backend_semi.repository.NoticeCateoryRepository;
import com.backend_semi.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final NoticeCateoryRepository noticeCategoryRepository;
    private final MemberRepository memberRepository;

    private final FileService fileService;

    // 공지사항 등록
    @Transactional
    public Long createNotice(String loginId, NoticeRequestDto request, MultipartFile file) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다!"));

        if (member.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("관리자만 공지사항을 작성할 수 있습니다!");
        }

        NoticeCategory noticeCategory = noticeCategoryRepository.findById(request.getNoticeCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("공지사항 카테고리를 찾을 수 없습니다!"));

        // 파일이 있으면 업로드하고 URL을 attachmentUrl로 세팅
        String attachmentUrl = null;
        if (file != null && !file.isEmpty()) {
            attachmentUrl = fileService.upload(file);
        }

        Notice notice = new Notice(
                noticeCategory,        // ← 카테고리를 먼저
                member,                // ← 멤버를 두 번째
                request.getTitle(),
                request.getContents(),
                attachmentUrl
        );

        Notice saved = noticeRepository.save(notice);
        return saved.getNoticeId();
    }

    @Transactional
    public void updateNotice(String loginId, Long noticeId, NoticeRequestDto request, MultipartFile file) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다!"));

        if (member.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("관리자만 공지사항을 수정할 수 있습니다!");
        }

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다!"));

        NoticeCategory noticeCategory = noticeCategoryRepository.findById(request.getNoticeCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("공지사항 카테고리를 찾을 수 없습니다!"));

        // 첨부파일 처리
        String attachmentUrl = request.getAttachmentUrl(); // 기존 값 유지 (변경 없으면)
        if (file != null && !file.isEmpty()) {
            // 새 파일이 왔으면 기존 파일 삭제 후 교체
            fileService.delete(notice.getAttachmentUrl());
            attachmentUrl = fileService.upload(file);
        }

        notice.updateNotice(
                noticeCategory,
                request.getTitle(),
                request.getContents(),
                attachmentUrl
        );
    }
    // 공지사항 삭제
    public void deleteNotice(String loginId, Long noticeId){
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(()->new IllegalArgumentException("회원을 찾을 수 없습니다!"));

        if(member.getRole() != Role.ADMIN){
            throw new IllegalArgumentException("관리자만 공지사항을 삭제할 수 있습니다!");
        }
        Notice notice = noticeRepository.findById(noticeId)

                .orElseThrow(()-> new IllegalArgumentException("공지사항을 찾을 수 없습니다!"));

        // 공지사항 삭제되면 해당 파일도 로컬에서 삭제됨
        // S3에서는 삭제 안됨
        fileService.delete(notice.getAttachmentUrl());
        noticeRepository.delete(notice);
    }

    // 전체 공지사항 조회
    @Transactional(readOnly = true)
    public List<NoticeResponseDto> getNoticeList(){
        return noticeRepository.findAllByOrderByCreatedAtDesc()
                                .stream()
                                .map(NoticeResponseDto::new)
                                .toList();
    }

    @Transactional(readOnly = true)
    public NoticeResponseDto getNotice(Long noticeId){
        Notice notice = noticeRepository.findById(noticeId)
                                        .orElseThrow(()->new IllegalArgumentException("공지사항을 찾을 수 없습니다."));

        return new NoticeResponseDto(notice);
    }

    // 카테고리별 공지사항 조회
    @Transactional(readOnly = true)
    public List<NoticeResponseDto> getNoticeListByCategory(Long noticeCategoryId){
        return noticeRepository.findByNoticeCategory_NoticeCategoryIdOrderByCreatedAtDesc(noticeCategoryId)
                                .stream()
                                .map(NoticeResponseDto::new)
                                .toList();
    }

    // 작성자별 공지사항 조회
    @Transactional(readOnly = true)
    public List<NoticeResponseDto> getNoticeListByMember(Long memberId){
        return noticeRepository.findByMember_MemberIdOrderByCreatedAtDesc(memberId)
                                .stream()
                                .map(NoticeResponseDto::new)
                                .toList();
    }
}
