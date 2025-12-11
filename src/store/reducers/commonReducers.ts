import { SHOW_LOADING, HIDE_LOADING } from '../constants/commonConstants';

interface LoadingState {
  loading: boolean;
  message: string;
}

const initialState: LoadingState = {
  loading: false,
  message: 'Loading...',
};

export const loadingReducer = (
  state = initialState,
  action: { type: string; payload?: string }
): LoadingState => {
  switch (action.type) {
    case SHOW_LOADING:
      return {
        ...state,
        loading: true,
        message: action.payload || 'Loading...',
      };

    case HIDE_LOADING:
      return {
        ...state,
        loading: false,
      };

    default:
      return state;
  }
};