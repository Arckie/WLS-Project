import MyPageSideBar from "../components/layout/MyPageSideBar";
import { LEARNING_PROFILE_OPTIONS } from "../constants/memberProfile";
import { useMyPage } from "../hooks/useMyPage";
import "./MyPage.css";

// 컴포넌트 props 타입 추가
type AppRoutesProps = {
    handleLogout: (event?: React.MouseEvent<HTMLElement>) => void;
};


function MyPage({ handleLogout }: AppRoutesProps) {
    /*
      useMyPage는 마이페이지에서 필요한 상태와 이벤트 함수를 모아둔 커스텀 훅입니다.
      이 파일(MyPage.tsx)은 화면을 그리는 역할에 집중하고,
      API 호출/검증/수정 모드 전환 같은 동작은 hooks/useMyPage.ts에서 관리합니다.
    */
    const {
        memberInfo,
        loading,
        currentPassword,
        memberPassword,
        memberPasswordConfirm,
        isEditMode,
        memberUpdateForm,
        isPasswordTyped,
        isPasswordConfirmTyped,
        isPasswordValid,
        isPasswordMatch,
        setCurrentPassword,
        setMemberPassword,
        setMemberPasswordConfirm,
        handlePasswordCheck,
        handlePasswordChange,
        handleEditModeStart,
        handleEditCancel,
        handleMemberUpdateChange,
        handleLearningProfileChange,
        handleMemberInfoUpdate,
        handleMemberSignOff,
    } = useMyPage(handleLogout);

    // 회원 정보를 아직 서버에서 가져오는 중이면, 실제 폼 대신 로딩 문구를 먼저 보여줍니다.
    if (loading) {
        return <div className="mypage-main">회원정보를 불러오는 중입니다...</div>;
    }

    // 로딩은 끝났지만 회원 정보가 없다면, 아래 JSX에서 null 접근 오류가 나지 않도록 여기서 종료합니다.
    if (memberInfo === null) {
        return <div className="mypage-main">회원정보가 없습니다!</div>;
    }

    return (
        <div className="mypage-page">
            <MyPageSideBar />

            <main className="mypage-main">
                <section className="member-info-card">
                    <div className="member-info-layout">
                        <div className="member-info-content">
                            <div className="member-info-header">
                                <p className="member-info-badge">PROFILE</p>
                                <h1>회원정보</h1>
                                <p>내 계정 정보와 비밀번호를 관리할 수 있습니다.</p>
                            </div>

                            <form className="member-info-form">
                                {/* 아이디와 이름은 수정 대상이 아니므로 항상 읽기 전용(readOnly)입니다. */}
                                <div className="member-form-row">
                                    <label>아이디</label>
                                    <input
                                        className="member-info-input"
                                        type="text"
                                        value={memberInfo.loginId}
                                        readOnly
                                    />
                                </div>

                                <div className="member-form-row">
                                    <label>이름</label>
                                    <input
                                        className="member-info-input"
                                        type="text"
                                        name="name"
                                        value={memberInfo.name}
                                        readOnly
                                    />
                                </div>

                                {/* 비밀번호 입력 영역은 조회 모드와 수정 모드에서 모두 사용할 수 있습니다. */}
                                <div className="member-password-area">
                                    <label>비밀번호</label>

                                    <div className="member-password-fields password-change-fields">
                                        {/* 현재 비밀번호: 비밀번호 변경/회원정보 저장 시 본인 확인용으로 사용합니다. */}
                                        <div className="member-password-input-group member-password-current">
                                            <input
                                                className="member-info-input"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(event) =>
                                                    setCurrentPassword(event.target.value)
                                                }
                                                placeholder="현재 비밀번호를 입력하세요."
                                            />

                                            {(isEditMode || currentPassword.length > 0) && (
                                                <p className="member-password-guide">
                                                    현재 사용 중인 비밀번호를 입력해 주세요.
                                                </p>
                                            )}
                                        </div>

                                        {/* 새 비밀번호: 입력값이 규칙에 맞지 않으면 CSS 클래스로 빨간 테두리를 표시합니다. */}
                                        <div className="member-password-input-group">
                                            <input
                                                className={
                                                    isPasswordTyped && !isPasswordValid
                                                        ? "member-info-input password-error"
                                                        : "member-info-input"
                                                }
                                                type="password"
                                                value={memberPassword}
                                                onChange={(event) =>
                                                    setMemberPassword(event.target.value)
                                                }
                                                placeholder="새 비밀번호"
                                            />

                                            {(isEditMode || isPasswordTyped) && (
                                                <p
                                                    className={
                                                        isPasswordTyped && !isPasswordValid
                                                            ? "member-password-guide error"
                                                            : "member-password-guide"
                                                    }
                                                >
                                                    8자리 이상, 대문자 1개 이상, 특수문자 포함
                                                </p>
                                            )}
                                        </div>

                                        {/* 새 비밀번호 확인: 새 비밀번호와 같은지 비교해 성공/오류 안내 문구를 보여줍니다. */}
                                        <div className="member-password-input-group">
                                            <input
                                                className={
                                                    isPasswordConfirmTyped && !isPasswordMatch
                                                        ? "member-info-input password-error"
                                                        : "member-info-input"
                                                }
                                                type="password"
                                                value={memberPasswordConfirm}
                                                onChange={(event) =>
                                                    setMemberPasswordConfirm(event.target.value)
                                                }
                                                placeholder="새 비밀번호 확인"
                                            />

                                            {(isEditMode || isPasswordConfirmTyped) && (
                                                <p
                                                    className={
                                                        isPasswordConfirmTyped && isPasswordMatch
                                                            ? "member-password-guide success"
                                                            : isPasswordConfirmTyped && !isPasswordMatch
                                                                ? "member-password-guide error"
                                                                : "member-password-guide"
                                                    }
                                                >
                                                    {isPasswordConfirmTyped
                                                        ? isPasswordMatch
                                                            ? "비밀번호가 일치합니다."
                                                            : "비밀번호가 일치하지 않습니다."
                                                        : isEditMode
                                                            ? "비밀번호 확인을 입력해 주세요."
                                                            : ""}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            className="member-password-button"
                                            onClick={handlePasswordCheck}
                                        >
                                            확인
                                        </button>
                                    </div>
                                </div>

                                {/* 수정 모드일 때는 memberUpdateForm 값을 보여주고, 조회 모드일 때는 서버에서 받은 memberInfo 값을 보여줍니다. */}
                                <div className="member-form-row">
                                    <label>이메일</label>
                                    <input
                                        className="member-info-input"
                                        type="text"
                                        name="email"
                                        value={
                                            isEditMode
                                                ? memberUpdateForm.email
                                                : memberInfo.email
                                        }
                                        onChange={handleMemberUpdateChange}
                                        readOnly={!isEditMode}
                                    />
                                </div>

                                {/* 전화번호는 useMyPage 내부에서 숫자 입력을 010-0000-0000 형태로 정리합니다. */}
                                <div className="member-form-row">
                                    <label>전화번호</label>
                                    <input
                                        className="member-info-input"
                                        type="text"
                                        name="phone"
                                        value={
                                            isEditMode
                                                ? memberUpdateForm.phone
                                                : memberInfo.phone
                                        }
                                        onChange={handleMemberUpdateChange}
                                        readOnly={!isEditMode}
                                        maxLength={13}
                                    />
                                </div>

                                {/* type="date"는 브라우저 기본 날짜 선택 UI를 사용합니다. */}
                                <div className="member-form-row">
                                    <label>생년월일</label>
                                    <input
                                        className="member-info-input"
                                        type="date"
                                        name="birthDate"
                                        value={
                                            isEditMode
                                                ? memberUpdateForm.birthDate
                                                : memberInfo.birthDate
                                        }
                                        onChange={handleMemberUpdateChange}
                                        readOnly={!isEditMode}
                                    />
                                </div>

                                <div className="member-form-row">
                                    <label>관심학습분야</label>

                                    <div className="member-learning-box">
                                        {/*
                                          수정 모드: 체크박스로 관심 분야를 고릅니다.
                                          조회 모드: 저장된 관심 분야를 칩 형태로 보여줍니다.
                                          저장된 관심 분야가 없으면 빈 상태 문구를 보여줍니다.
                                        */}
                                        {isEditMode ? (
                                            LEARNING_PROFILE_OPTIONS.map((profile) => (
                                                <label
                                                    key={profile.id}
                                                    className="member-learning-check"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={memberUpdateForm.memberLearningProfiles.includes(
                                                            profile.id
                                                        )}
                                                        onChange={() =>
                                                            handleLearningProfileChange(profile.id)
                                                        }
                                                    />
                                                    <span>{profile.name}</span>
                                                </label>
                                            ))
                                        ) : memberInfo.memberLearningProfiles &&
                                            memberInfo.memberLearningProfiles.length > 0 ? (
                                            memberInfo.memberLearningProfiles.map((name) => (
                                                <span
                                                    key={name}
                                                    className="member-learning-chip"
                                                >
                                                    {name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="member-learning-empty">
                                                선택한 관심 학습 분야가 없습니다.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="member-info-actions">
                                    {/* 수정 모드에서는 취소/저장 버튼, 조회 모드에서는 수정/비밀번호 변경 버튼을 보여줍니다. */}
                                    {isEditMode ? (
                                        <>
                                            <button
                                                type="button"
                                                className="member-info-button danger"
                                                onClick={handleMemberSignOff}
                                            >
                                                회원탈퇴
                                            </button>

                                            <button
                                                type="button"
                                                className="member-info-button secondary"
                                                onClick={handleEditCancel}
                                            >
                                                취소
                                            </button>

                                            <button
                                                type="button"
                                                className="member-info-button primary"
                                                onClick={handleMemberInfoUpdate}
                                            >
                                                저장하기
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="member-info-button secondary"
                                                onClick={handleEditModeStart}
                                            >
                                                회원정보 수정
                                            </button>

                                            <button
                                                type="button"
                                                className="member-info-button primary"
                                                onClick={handlePasswordChange}
                                            >
                                                비밀번호 변경
                                            </button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default MyPage;
