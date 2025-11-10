import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
};

const assetsSlice = createSlice({
    name: "assets",
    initialState,
    reducers: {
        setAssets(state, action) {
            state.items = action.payload;
        },
        addAsset(state, action) {
            state.items.unshift(action.payload);
        },
    },
});

export const { setAssets, addAsset } = assetsSlice.actions;
export default assetsSlice.reducer;