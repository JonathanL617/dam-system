import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import assetsReducer from "./slices/assetsSlice";

cinst store = configureStore({
    reducer: {
        auth: authReducer,
        assets: assetsReducer,
    },
});

export default store;