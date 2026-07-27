import { createSlice } from "@reduxjs/toolkit";

// Load user from localStorage if available
const initialState = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    removeUser: () => {
      localStorage.removeItem("user");
      return null;
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
