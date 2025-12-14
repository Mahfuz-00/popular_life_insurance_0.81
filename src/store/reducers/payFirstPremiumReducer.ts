const initialState = {
  formData: null,
};

export const payFirstPremiumReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'SAVE_FIRST_PREMIUM_DATA':
      return { ...state, formData: action.payload };
    case 'CLEAR_FIRST_PREMIUM_DATA':
        return { ...state, formData: null };
    default:
      return state;
  }
};