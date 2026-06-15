export type MemberInfo = {
  loginId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  memberLearningProfiles: string[];
};

export type MemberUpdateForm = {
  email: string;
  phone: string;
  birthDate: string;
  memberLearningProfiles: number[];
};
