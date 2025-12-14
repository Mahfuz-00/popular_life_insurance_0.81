export const saveFirstPremiumData = (data: any) => ({
  type: 'SAVE_FIRST_PREMIUM_DATA',
  payload: data,
});

export const clearFirstPremiumData = () => ({
  type: 'CLEAR_FIRST_PREMIUM_DATA',
});