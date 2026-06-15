package com.backend_semi.entity;

import com.backend_semi.constant.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @ToString @Getter @Setter
@Table(name = "members")
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name= "member_id")
    private Long memberId;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    @NotBlank(message = "비밀번호는 필수 입력사항입니다.")
    @Size(min = 9, max = 255, message = "비밀 번호는 8자리 이상, 255자리 이하로 입력해 주세요.")
    @Pattern(regexp = ".*[A-Z].*", message = "비밀 번호는 대문자 1개 이상을 포함해야 합니다.")
    @Pattern(regexp = ".*[~!@#$%^&].*", message = "비밀 번호는 특수 문자 '~,!,@,#,$,%,^,&' 중 하나 이상을 포함해야 합니다.")
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @NotBlank(message = "이메일은 필수 입력 사항입니다.")
    @Email(message = "올바른 이메일 형식으로 입력하십시오.")
    private String email;

    @NotBlank(message = "이름은 필수 입력 사항입니다.")
    private String name;

    @Column(length = 30)
    private String phone;

    private LocalDate birthDate;

    private LocalDateTime createdAt = LocalDateTime.now().withNano(0);

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MemberLearningProfile> memberLearningProfiles = new ArrayList<>();

    public Member(
            Role role,
            String name,
            String loginId,
            String password,
            String email,
            String phone,
            LocalDate birthDate
    ){
        this.role = role;
        this.name = name;
        this.loginId = loginId;
        this.password = password;
        this.email = email;
        this.phone = phone;
        this.birthDate = birthDate;
    }
    public void changePassword(String encodedPassword){
        this.password = encodedPassword;
    }

    public void updateMemberInfo(
            String email,
            String phone,
            LocalDate birthDate
    ){
        this.email = email;
        this.phone = phone;
        this.birthDate = birthDate;
    }
}
