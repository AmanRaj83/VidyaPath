export type UserRole = "student" | "teacher";

const roleKey = (userId: string) => `vidyapath-role-${userId}`;

export const saveUserRole = (userId: string, role: UserRole) => {
  localStorage.setItem(roleKey(userId), role);
};

export const getUserRole = (userId: string): UserRole | null => {
  const stored = localStorage.getItem(roleKey(userId));
  return stored === "student" || stored === "teacher" ? stored : null;
};

export const clearUserRole = (userId: string) => {
  localStorage.removeItem(roleKey(userId));
};
