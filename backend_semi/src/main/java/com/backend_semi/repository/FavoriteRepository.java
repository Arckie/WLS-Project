package com.backend_semi.repository;

import com.backend_semi.entity.Favorite;
import com.backend_semi.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findFavoriteByMember(Member member);

    void deleteByMember(Member member);
}
