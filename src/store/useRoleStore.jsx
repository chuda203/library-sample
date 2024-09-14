import { create } from "zustand";

export const useRoleStore = create((set) => ({
  role: "Guest",
  setRole: (newRole) => set({ role: newRole }),
}));
