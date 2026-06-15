package com.backend_semi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity @Getter @Setter
@NoArgsConstructor
@Table(name = "learning_profiles")
public class LearningProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "learning_profile_id")
    private Long learningProfileId;

    @Column(name = "profile_code")
    private String profileCode;
}
