import MyPageSideBar from "../components/layout/MyPageSideBar";
import { LEARNING_PROFILE_OPTIONS } from "../constants/memberProfile";
import { useMyPage } from "../hooks/useMyPage";
import axios from "axios";
import "./MyPage.css";
import { API_BASE_URL } from "../config/config";

type AppRoutesProps = {
    handleLogout: (event?: React.MouseEvent<HTMLElement>) => void;
};

function MyPage({ handleLogout }: AppRoutesProps) {
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

    const getAxiosErrorMessage = (error: any) => {
        const data = error.response?.data;

        if (typeof data === "string") {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (error.message) {
            return error.message;
        }

        return "요청 처리 중 오류가 발생했습니다.";
    };

    const handlePasswordlessWithdrawal = async () => {
        const ok = window.confirm(
            "Passwordless 등록을 해지하시겠습니까?\n해지 후에는 Passwordless 로그인을 다시 등록해야 사용할 수 있습니다."
        );

        if (!ok) {
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }

            await axios.post(
                `${API_BASE_URL}/api/passwordless/my-withdrawal`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: false,
                }
            );

            alert("Passwordless 등록이 해지되었습니다.");
        } catch (error: any) {
            console.error("Passwordless 해지 실패:", error);
            alert(getAxiosErrorMessage(error));
        }
    };

    if (loading) {
        return <div className="mypage-main">회원정보를 불러오는 중입니다...</div>;
    }

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

                                <div className="member-password-area">
                                    <label>비밀번호</label>

                                    <div className="member-password-fields password-change-fields">
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
                                    {isEditMode ? (
                                        <>
                                            <button
                                                type="button"
                                                className="member-info-button danger"
                                                onClick={handlePasswordlessWithdrawal}
                                            >
                                                Passwordless 해지
                                            </button>

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