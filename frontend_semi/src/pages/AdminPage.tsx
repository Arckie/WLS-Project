import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import customAxios from "../api/axiosInstance";
import "./AdminPage.css";
import type { User } from "../types/User";
import MyPageSideBar from "../components/layout/MyPageSideBar";

interface AdminStatus {
    totalMemberCount: number;
    todayJoinMember: number;
    totalLectureCount: number;
}

interface AdminMember {
    memberId: number;
    loginId: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
}

interface AdminPageProps {
    user: User | null;
}

function AdminPage({ user }: AdminPageProps) {
    const navigate = useNavigate();

    const getRoleFromToken = () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            return null;
        }

        try {
            const payloadBase64 = token.split(".")[1];

            if (!payloadBase64) {
                return null;
            }

            const payloadJson = atob(
                payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
            );

            const payload = JSON.parse(payloadJson);

            return payload.role ?? null;
        } catch (error) {
            console.error("JWT role 파싱 실패:", error);
            return null;
        }
    };

    const tokenRole = getRoleFromToken();
    const isAdmin = user?.role === "ADMIN" || tokenRole === "ADMIN";

    const [status, setStatus] = useState<AdminStatus | null>(null);
    const [members, setMembers] = useState<AdminMember[]>([]);
    const [keyword, setKeyword] = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [roleFilter, setRoleFilter] = useState("ALL");

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/members/login", { replace: true });
            return;
        }

        if (!isAdmin) {
            alert("관리자만 접근할 수 있습니다.");
            navigate("/", { replace: true });
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        if (isAdmin) {
            getAdminStatus();
            getMemberList();
        }
    }, [isAdmin]);

    const getAdminStatus = async () => {
        try {
            const response = await customAxios.get("/api/admin");
            setStatus(response.data);
        } catch (error) {
            console.error("관리자 통계 조회 실패", error);
        }
    };

    const getMemberList = async (
        page = 0,
        role = roleFilter,
        searchKeyword = keyword
    ) => {
        try {
            const params: {
                page: number;
                size: number;
                keyword?: string;
                role?: string;
            } = {
                page,
                size: 10,
            };

            if (searchKeyword.trim() !== "") {
                params.keyword = searchKeyword.trim();
            }

            if (role !== "ALL") {
                params.role = role;
            }

            const response = await customAxios.get("/api/admin/members", {
                params,
            });

            setMembers(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setCurrentPage(response.data.number || 0);
        } catch (error) {
            console.error("회원 목록 조회 실패", error);
        }
    };

    const onPageChange = (page: number) => {
        getMemberList(page, roleFilter, keyword);
    };

    const searchMember = () => {
        getMemberList(0, roleFilter, keyword);
    };

    const changeMemberRole = async (memberId: number, role: string) => {
        if (role === "") return;

        try {
            await customAxios.put(`/api/admin/members/${memberId}/role`, {
                role,
            });

            setMembers((prevMembers) =>
                prevMembers.map((member) =>
                    member.memberId === memberId
                        ? { ...member, role }
                        : member
                )
            );

            getAdminStatus();
            alert("권한이 변경되었습니다.");
        } catch (error) {
            console.error("권한 변경 실패:", error);
        }
    };

    const deleteMember = async (memberId: number) => {
        if (!window.confirm("회원을 탈퇴시키겠습니까?")) {
            return;
        }

        try {
            await customAxios.delete(`/api/admin/members/${memberId}`);

            alert("회원이 삭제되었습니다.");

            getMemberList(currentPage, roleFilter, keyword);
            getAdminStatus();
        } catch (error) {
            console.error("회원 삭제 실패", error);
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="admin-page">
            <MyPageSideBar user={user} fallbackRole={tokenRole} />

            <main className="admin-main">
                <div className="admin-card">
                    <div className="admin-header">
                        <div>
                            <p className="admin-badge">AdminPage</p>
                            <h1>관리자 페이지</h1>
                            <p>시스템 현황을 한눈에 확인하고 관리할 수 있습니다.</p>
                        </div>
                    </div>

                    <section className="admin-status">
                        <div className="status-box">
                            <h4>전체 회원 수</h4>
                            <strong>{status?.totalMemberCount ?? 0}명</strong>
                        </div>

                        <div className="status-box">
                            <h4>오늘 가입자</h4>
                            <strong>{status?.todayJoinMember ?? 0}명</strong>
                        </div>

                        <div className="status-box">
                            <h4>전체 강의 수</h4>
                            <strong>{status?.totalLectureCount ?? 0}개</strong>
                        </div>

                        <div className="status-box">
                            <h4>오늘 학습 수</h4>
                            <strong>준비중</strong>
                        </div>
                    </section>

                    <section className="member-section">
                        <div className="member-search">
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="아이디를 입력하세요."
                            />

                            <button type="button" className="search-btn" onClick={searchMember}>
                                검색
                            </button>

                            <button
                                type="button"
                                className={roleFilter === "ALL" ? "role-filter active" : "role-filter"}
                                onClick={() => {
                                    setRoleFilter("ALL");
                                    getMemberList(0, "ALL", keyword);
                                }}
                            >
                                전체회원
                            </button>

                            <button
                                type="button"
                                className={roleFilter === "ADMIN" ? "role-filter active" : "role-filter"}
                                onClick={() => {
                                    setRoleFilter("ADMIN");
                                    getMemberList(0, "ADMIN", keyword);
                                }}
                            >
                                관리자
                            </button>

                            <button
                                type="button"
                                className={roleFilter === "USER" ? "role-filter active" : "role-filter"}
                                onClick={() => {
                                    setRoleFilter("USER");
                                    getMemberList(0, "USER", keyword);
                                }}
                            >
                                일반회원
                            </button>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>아이디</th>
                                    <th>이름</th>
                                    <th>이메일</th>
                                    <th>가입일</th>
                                    <th>권한</th>
                                    <th>관리</th>
                                </tr>
                            </thead>

                            <tbody>
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>회원 목록이 없습니다.</td>
                                    </tr>
                                ) : (
                                    members.map((member, index) => (
                                        <tr key={member.memberId}>
                                            <td>{currentPage * 10 + index + 1}</td>
                                            <td>{member.loginId}</td>
                                            <td>{member.name}</td>
                                            <td>{member.email}</td>
                                            <td>{member.createdAt.substring(0, 10)}</td>
                                            <td>{member.role}</td>
                                            <td>
                                                <div className="member-action">
                                                    <select
                                                        className="role-select"
                                                        defaultValue=""
                                                        onChange={async (event) => {
                                                            const selectBox = event.currentTarget;
                                                            const selectedRole = selectBox.value;

                                                            await changeMemberRole(member.memberId, selectedRole);

                                                            selectBox.value = "";
                                                        }}
                                                    >
                                                        <option value="" disabled>
                                                            권한변경
                                                        </option>
                                                        <option value="USER">USER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </select>

                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        onClick={() => deleteMember(member.memberId)}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <button
                                type="button"
                                className="page-btn"
                                disabled={currentPage === 0}
                                onClick={() => onPageChange(currentPage - 1)}
                            >
                                &lt;&lt;
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    type="button"
                                    key={index}
                                    className={currentPage === index ? "page-btn active" : "page-btn"}
                                    onClick={() => onPageChange(index)}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                type="button"
                                className="page-btn"
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => onPageChange(currentPage + 1)}
                            >
                                &gt;&gt;
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default AdminPage;