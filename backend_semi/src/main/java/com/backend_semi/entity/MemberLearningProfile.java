package com.backend_semi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "member_learning_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_member_learning_profle",
                        columnNames = {"member_id", "learning_profile_id"}
                )
        }
)
public class MemberLearningProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_learning_profile_id")
    private Long memberLearningProfileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "learning_profile_id", nullable = false)
    private LearningProfile learningProfile;

    public MemberLearningProfile(Member member, LearningProfile learningProfile){
        this.member = member;
        this.learningProfile = learningProfile;
    }
}
