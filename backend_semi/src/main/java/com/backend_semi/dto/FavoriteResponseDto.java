package com.backend_semi.dto;

import com.backend_semi.entity.Favorite;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FavoriteResponseDto {
    private Long favoriteId;
    private String favoriteUrl;

    public static FavoriteResponseDto from(Favorite favorite) {
        return new FavoriteResponseDto(
                favorite.getFavoriteId(),
                favorite.getFavoriteUrl()
        );
    }
}
