export type RootStackParamList = {
  // Public
  Home: undefined;
  PremiumCalculator: undefined;
  CompanyInfo: undefined;
  LocateUs: undefined;
  PayPremium: undefined;
  ProductInfo: undefined;
  ClaimSubmission: undefined;
  MessageFromMd: undefined;
  PolicyInfo: undefined;
  ContactUs: undefined;
  ApplyOnline: undefined;
  PolicyPhoneUpdate: undefined;
  ProposalTracking: undefined;
  MyTransaction: undefined;
  SyncPayment: undefined;

  // First Premium
  PhPayFirstPremium: undefined;
  PayfirstPremiumGateways: undefined;
  PayFirstPremiumTransaction: undefined;
  CodeWiseCollectionScreen: undefined;

  // Auth
  Login: undefined;
  Registration: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  SelectLogin: undefined;

  // Policy Holder
  DashboardPh: undefined;
  PhPolicyList: undefined;
  PhPolicyStatement: { policyNo: string };
  PhDuePremium: undefined;
  PhPayPremium: { policyNo: string };
  PhPolicyTransactions: { policyNo: string };
  PhPolicyPartialTransactions: { policyNo: string };
  AuthPolicyInfo: undefined;
  PhMyProfile: undefined;
  PhClaimSubmission: undefined;
  PhPRList: undefined;

  // Producer
  DashboardProducer: undefined;
  BusinessInfo: undefined;
  EarningInfo: undefined;
  PolicyList: undefined;
  OrgMyProfile: undefined;
};