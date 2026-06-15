package com.backend_semi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name="favorite")
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="favorite_id")
    private Long favoriteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "member_id", nullable = false)
    private Member member;

    @Column(name="favorite_url")
    private String favoriteUrl;

    public Favorite(
            Member member,
            String favoriteUrl
    ){
        this.member = member;
        this.favoriteUrl = favoriteUrl;
    }

}
