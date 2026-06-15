package com.backend_semi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Entity
@NoArgsConstructor
@Table(name="notice_categories")
public class NoticeCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="notice_category_id")
    private Long noticeCategoryId;

    @Column(name="category_name", nullable = false, length = 100)
    private String categoryName;

    public NoticeCategory(String categoryName) {
        this.categoryName = categoryName;
    }
}