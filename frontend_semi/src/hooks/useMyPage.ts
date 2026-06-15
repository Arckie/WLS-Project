import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import customAxios from "../api/axiosInstance";
import { MEMBER_PASSWORD_REGEX } from "../constants/validation";
import type { MemberInfo, MemberUpdateForm } from "../types/MemberPage";
import {
  convertProfileNamesToIds,
  formatPhoneNumber,
} from "../utils/memberFormUtils";

const INITIAL_MEMBER_UPDATE_FORM: MemberUpdateForm = {
  email: "",
  phone: "",
  birthDate: "",
  memberLearningProfiles: [],
};

function toMemberInfo(responseData: any): MemberInfo {
  return {
    loginId: responseData.loginId || "",
    name: responseData.name || "",
    email: responseData.email || "",
    phone: responseData.phone || "",
    birthDate: responseData.birthDate || "",
    memberLearningProfiles: responseData.memberLearningProfiles || [],
  };
}

function toMemberUpdateForm(memberInfo: MemberInfo): MemberUpdateForm {
  return {
    email: memberInfo.email || "",
    phone: memberInfo.phone || "",
    birthDate: memberInfo.birthDate || "",
    memberLearningProfiles: convertProfileNamesToIds(
      memberInfo.memberLearningProfiles || []
    ),
  };
}

export function useMyPage(
  handleLogout: (event?: React.MouseEvent<HTMLElement>) => void
) {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberPasswordConfirm, setMemberPasswordConfirm] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [memberUpdateForm, setMemberUpdateForm] =
    useState<MemberUpdateForm>(INITIAL_MEMBER_UPDATE_FORM);

  const isPasswordTyped = memberPassword.length > 0;
  const isPasswordConfirmTyped = memberPasswordConfirm.length > 0;
  const isPasswordValid = MEMBER_PASSWORD_REGEX.test(memberPassword);
  const isPasswordMatch =
    memberPassword.length > 0 &&
    memberPasswordConfirm.length > 0 &&
    memberPassword === memberPasswordConfirm;

  const hasPasswordInput = () => {
    return (
      currentPassword.trim() !== "" ||
      memberPassword.trim() !== "" ||
      memberPasswordConfirm.trim() !== ""
    );
  };

  const clearPasswordInputs = () => {
    setCurrentPassword("");
    setMemberPassword("");
    setMemberPasswordConfirm("");
  };

  const getMemberInfo = async () => {
    try {
      const response = await customAxios.get("/api/members/mypage");
      const data = toMemberInfo(response.data);

      setMemberInfo(data);
      setMemberUpdateForm(toMemberUpdateForm(data));
    } catch (error) {
      console.error("회원정보 조회 실패:", error);
      alert("회원정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMemberInfo();
  }, []);

  const handlePasswordCheck = () => {
    if (!currentPassword.trim()) {
      alert("현재 비밀번호를 입력해 주세요.");
      return;
    }

    if (!isPasswordTyped || !isPasswordConfirmTyped) {
      alert("새 비밀번호와 비밀번호 확인을 모두 입력해 주세요.");
      return;
    }

    if (!isPasswordValid) {
      alert("비밀번호는 8자리 이상, 대문자 1개 이상, 특수문자를 포함해야 합니다.");
      return;
    }

    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    alert("사용 가능한 비밀번호입니다.");
  };

  const handlePasswordChange = async () => {
    if (!currentPassword.trim()) {
      alert("현재 비밀번호를 입력해 주세요.");
      return;
    }

    if (!memberPassword || !memberPasswordConfirm) {
      alert("변경할 비밀번호를 입력해 주세요.");
      return;
    }

    if (!isPasswordValid) {
      alert("비밀번호는 8자리 이상, 대문자 1개 이상, 특수문자를 포함해야 합니다.");
      return;
    }

    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await customAxios.patch(
        "/api/members/mypage/password",
        {
          currentPassword,
          newPassword: memberPassword,
          newPasswordConfirm: memberPasswordConfirm,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("비밀번호가 변경되었습니다.");
      clearPasswordInputs();
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      alert("비밀번호 변경에 실패했습니다.");
    }
  };

  const handleEditModeStart = () => {
    if (!memberInfo) {
      return;
    }

    setIsEditMode(true);
    clearPasswordInputs();
    setMemberUpdateForm(toMemberUpdateForm(memberInfo));
  };

  const handleEditCancel = () => {
    if (!memberInfo) {
      return;
    }

    setIsEditMode(false);
    clearPasswordInputs();
    setMemberUpdateForm(toMemberUpdateForm(memberInfo));
  };

  const handleMemberUpdateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setMemberUpdateForm((prev) => ({
      ...prev,
      [name]: name === "phone" ? formatPhoneNumber(value) : value,
    }));
  };

  const handleLearningProfileChange = (profileId: number) => {
    setMemberUpdateForm((prev) => {
      const alreadySelected = prev.memberLearningProfiles.includes(profileId);

      return {
        ...prev,
        memberLearningProfiles: alreadySelected
          ? prev.memberLearningProfiles.filter((id) => id !== profileId)
          : [...prev.memberLearningProfiles, profileId],
      };
    });
  };

  const validatePasswordForUpdate = () => {
    if (!hasPasswordInput()) {
      return true;
    }

    if (!currentPassword.trim()) {
      alert("현재 비밀번호를 입력해 주세요.");
      return false;
    }

    if (!memberPassword.trim()) {
      alert("새 비밀번호를 입력해 주세요.");
      return false;
    }

    if (!memberPasswordConfirm.trim()) {
      alert("새 비밀번호 확인을 입력해 주세요.");
      return false;
    }

    if (!isPasswordValid) {
      alert("비밀번호는 8자리 이상, 대문자 1개 이상, 특수문자를 포함해야 합니다.");
      return false;
    }

    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return false;
    }

    return true;
  };

  const handleMemberInfoUpdate = async () => {
    if (!memberUpdateForm.email.trim()) {
      alert("이메일을 입력해 주세요.");
      return;
    }

    if (!memberUpdateForm.phone.trim()) {
      alert("전화번호를 입력해 주세요.");
      return;
    }

    if (!memberUpdateForm.birthDate.trim()) {
      alert("생년월일을 입력해 주세요.");
      return;
    }

    if (!validatePasswordForUpdate()) {
      return;
    }

    try {
      const requestBody = {
        email: memberUpdateForm.email,
        phone: memberUpdateForm.phone,
        birthDate: memberUpdateForm.birthDate,
        learningProfile: memberUpdateForm.memberLearningProfiles,
        ...(hasPasswordInput()
          ? {
            currentPassword,
            newPassword: memberPassword,
            newPasswordConfirm: memberPasswordConfirm,
          }
          : {}),
      };

      await customAxios.put("/api/members/mypage", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      alert("회원정보가 수정되었습니다.");

      setIsEditMode(false);
      clearPasswordInputs();
      await getMemberInfo();
    } catch (error) {
      console.error("회원정보 수정 실패:", error);
      alert("회원정보 수정에 실패했습니다.");
    }
  };

  const handleMemberSignOff = async () => {
    const firstConfirm = window.confirm(
      "정말 회원탈퇴를 진행하시겠습니까?\n탈퇴 후 계정 정보는 복구할 수 없습니다."
    );

    if (!firstConfirm) {
      return;
    }

    const finalConfirm = window.confirm(
      "마지막 확인입니다. 회원탈퇴를 완료할까요?"
    );

    if (!finalConfirm) {
      return;
    }

    try {
      await customAxios.delete("/api/members/signoff");

      sessionStorage.setItem("memberSignOffAt", String(Date.now()));
      localStorage.removeItem("refreshToken");

      handleLogout();
      alert("회원탈퇴가 완료되었습니다.");
    } catch (error) {
      console.error("회원탈퇴 실패:", error);
      alert("회원탈퇴에 실패했습니다.");
    }
  };

  return {
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
  };
}
