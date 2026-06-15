package com.backend_semi.service;

import com.backend_semi.entity.Favorite;
import com.backend_semi.entity.Member;
import com.backend_semi.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    // 즐겨찾기 등록
    // 빈 공지사항이 혹시 들어오면 예외처리.
    public Favorite saveFavorite(Favorite favorite){
        if(favorite.getFavoriteUrl() == null || favorite.getFavoriteUrl().isBlank()){
            throw new IllegalArgumentException("공지사항 URL이 비어있습니다.");
        }
        return favoriteRepository.save(favorite);
    }
    // 즐겨찾기 조회(Member 엔티티의 member_id를 기반으로 Favorite를 찾아서 반환함.
    public List<Favorite> queryFavoriteList(Member member){
        return favoriteRepository.findFavoriteByMember(member);
    }
    // 즐겨찾기 삭제
    public boolean deleteFavorite(Long favoriteId){
        Favorite favorite = favoriteRepository.findById(favoriteId)
                                               .orElse(null);
        if(favorite == null){
            throw new IllegalArgumentException("삭제하고자 하는 즐겨찾기가 없습니다!");
        }

        favoriteRepository.deleteById(favoriteId);
        return true;
    }
}
