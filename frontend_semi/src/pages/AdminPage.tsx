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

interface AppRoutesProps {
    user: User | null;
}

function AdminPage({ user }: AppRoutesProps) {

    // 관리자만 관리자페이지에 접근
    const navigate = useNavigate();

    // localStorage의 role이 아니라 App에서 내려온 user 정보로 관리자 여부 판단
    const isAdmin = user?.role === "ADMIN";

    const [status, setStatus] = useState<AdminStatus | null>(null);
    const [members, setMembers] = useState<AdminMember[]>([]);
    const [keyword, setKeyword] = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [roleFilter, setRoleFilter] = useState("ALL");

    // 비로그인 또는 일반회원 접근 금지
    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login", { replace: true });
            return;
        }

        if (!isAdmin)
        {
            alert("관리자만 접근할 수 있습니다.");
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    // 관리자 페이지 최초 진입 시 관리자 통계와 회원 목록을 조회
    useEffect(() => {
        if (isAdmin) {
            getAdminStatus();
            getMemberList();
        }
    }, [isAdmin]);

    // 전체 회원 수, 오늘 가입자 수, 전체 강의 수 등의 관리자 통계 조회
    const getAdminStatus = async () => {
        try {
            const response = await customAxios.get("/api/admin");
            setStatus(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // 회원 목록 조회
    // 검색어, 권한 필터, 페이지 번호를 조건으로 전달하여 조회
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
                size: 10
            };

            if (searchKeyword.trim() !== "") {
                params.keyword = searchKeyword.trim();
            }

            if (role !== "ALL") {
                params.role = role;
            }

            const response = await customAxios.get("/api/admin/members", { params });

            setMembers(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setCurrentPage(response.data.number || 0);

        } catch (error) {
            console.error("회원 목록 조회 실패", error);
        }
    };

    // 페이지 번호 클릭 시 해당 페이지 회원 목록 조회
    const onPageChange = (page: number) => {
        getMemberList(page, roleFilter, keyword);
    };

    // 검색 버튼 클릭 시 입력한 아이디와 현재 필터 조건으로 조회
    const searchMember = () => {
        getMemberList(0, roleFilter, keyword);
    };

    // 회원 권한(USER/ADMIN) 변경
    const changeMemberRole = async (memberId: number, role: string) => {

        console.log("권한변경 클릭", memberId, role);

        if (role === "") return false;

        try {
            await customAxios.put(
                `/api/admin/members/${memberId}/role`,
                { role }
            );

            setMembers((prevMembers) =>
                prevMembers.map((member) =>
                    member.memberId === memberId
                        ? { ...member, role: role }
                        : member
                )
            );

            getAdminStatus();
            alert("권한이 변경되었습니다.");

        } catch (error) {
            console.error("권한 변경 실패:", error);
            return false;
        }
    };

    // 회원 삭제
    const deleteMember = async (memberId: number) => {

        if (!window.confirm("회원을 탈퇴시키겠습니까?")) {
            return;
        }

        try {
            await customAxios.delete(
                `/api/admin/members/${memberId}`
            );

            alert("회원이 삭제되었습니다.");

            getMemberList(currentPage, roleFilter, keyword);
            getAdminStatus();

        } catch (error) {
            console.error(error);
        }
    };

    // 관리자가 아닌 경우 화면을 잠깐이라도 보여주지 않음
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="admin-page">
            <MyPageSideBar user={user} />
            <main className="admin-main">
                <div className="admin-card">
                    <div className="admin-header">
                        <div>
                            <p className="admin-badge">AdminPage</p>
                            <h1>관리자 페이지</h1>
                            <p>시스템 현황을 한눈에 확인하고 관리할 수 있습니다.</p>
                        </div>
                    </div>

                    {/* 회원상황 통계 */}
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

                    {/* 회원 목록 조회 */}
                    <section className="member-section">
                        <div className="member-search">
                            <input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="아이디를 입력하세요."
                            />

                            <button
                                className="search-btn"
                                onClick={searchMember}
                            >
                                검색
                            </button>

                            <button
                                className={roleFilter === "ALL" ? "role-filter active" : "role-filter"}
                                onClick={() => {
                                    setRoleFilter("ALL");
                                    getMemberList(0, "ALL", keyword);
                                }}
                            >
                                전체회원
                            </button>

                            <button
                                className={roleFilter === "ADMIN" ? "role-filter active" : "role-filter"}
                                onClick={() => {
                                    setRoleFilter("ADMIN");
                                    getMemberList(0, "ADMIN", keyword);
                                }}
                            >
                                관리자
                            </button>

                            <button
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
                                                        onChange={async (e) => {
                                                            const selectBox = e.currentTarget;
                                                            const selectedRole = selectBox.value;

                                                            await changeMemberRole(
                                                                member.memberId,
                                                                selectedRole
                                                            );

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

                        {/* 페이징 */}
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={currentPage === 0}
                                onClick={() => onPageChange(currentPage - 1)}
                            >
                                &lt;&lt;
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    className={currentPage === index ? "page-btn active" : "page-btn"}
                                    onClick={() => onPageChange(index)}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
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