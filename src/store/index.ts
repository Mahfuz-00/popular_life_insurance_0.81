// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './reducers/userReducers';
import { loadingReducer } from './reducers/commonReducers';

// This is the new, official, shorter, safer way
const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingReducer,
  },
  // thunk is included automatically
  // devTools is auto-enabled in development
  // middleware is safe by default (no need to disable serializableCheck in most cases)
});

// Types — even better than before
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;