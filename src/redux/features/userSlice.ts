import { createSlice } from "@reduxjs/toolkit";

export type User = {
    id: string,
    name: string,
    avatar?: string,
}

const defaultUser: User = {
    id: '1145141919810',
    name: 'Tadokoro Kouji',
    avatar: undefined,
}

const userSlice = createSlice({
    name: 'user',
    initialState: defaultUser,
    reducers: {}
})

const userReducer = userSlice.reducer
export const {} = userSlice.actions;

export default userReducer;
