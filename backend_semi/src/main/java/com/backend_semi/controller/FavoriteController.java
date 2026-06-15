package com.backend_semi.controller;

import com.backend_semi.dto.FavoriteRequestDto;
import com.backend_semi.dto.FavoriteResponseDto;
import com.backend_semi.entity.Favorite;
import com.backend_semi.entity.Member;
import com.backend_semi.repository.MemberRepository;
import com.backend_semi.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final MemberRepository memberRepository;

    @PostMapping
    public ResponseEntity<FavoriteResponseDto> saveFavorite(
            Authentication authentication,
            @RequestBody FavoriteRequestDto request
    ) {
        String loginId = (String) authentication.getDetails();

        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Favorite favorite = new Favorite(
                member,
                request.getFavoriteUrl()
        );

        Favorite savedFavorite = favoriteService.saveFavorite(favorite);

        return ResponseEntity.ok(FavoriteResponseDto.from(savedFavorite));
    }

    @GetMapping("/me")
    public ResponseEntity<List<FavoriteResponseDto>> getMyFavorites(
            Authentication authentication
    ) {
        String loginId = (String) authentication.getDetails();

        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        List<FavoriteResponseDto> favorites = favoriteService.queryFavoriteList(member)
                .stream()
                .map(FavoriteResponseDto::from)
                .toList();

        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<Void> deleteFavorite(
            @PathVariable Long favoriteId
    ) {
        favoriteService.deleteFavorite(favoriteId);

        return ResponseEntity.noContent().build();
    }
}