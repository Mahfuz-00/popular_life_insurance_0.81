//sandbox
// const BKASH_GRANT_TOKEN_API = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant";
// const BKASH_CREATE_PAYMENT_API = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create";
// const BKASH_EXECUTE_PAYMENT_API = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute";
// const BKASH_QUERY_PAYMENT_API = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status";

import { API } from '../config';
import axios from '../utils/axios';

// export const BKASH_USERNAME = "sandboxTokenizedUser02";
// export const BKASH_PASSWORD = "sandboxTokenizedUser02@12345";
// export const BKASH_APP_KEY = "4f6o0cjiki2rfm34kfdadl1eqq";
// export const BKASH_APP_SECRET_KEY = "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b";

//live
const BKASH_GRANT_TOKEN_API =
  'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant';
const BKASH_CREATE_PAYMENT_API =
  'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create';
const BKASH_EXECUTE_PAYMENT_API =
  'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/execute';
const BKASH_QUERY_PAYMENT_API =
  'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status';

export const BKASH_USERNAME = '01713372465';
export const BKASH_PASSWORD = 'iD2z3xnQN)3';
export const BKASH_APP_KEY = 'LpCMb2L3ks8QsujRq0buczEvtc';
export const BKASH_APP_SECRET_KEY =
  'uRtxZ97C0TKnHYPwjneinmkrrmAyGYFj0vLMC8g97coPR2YFrP4c';


export const bkashGetToken = async (): Promise<any> => {
  const res = await fetch(BKASH_GRANT_TOKEN_API, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET_KEY,
    }),
  });

  const data = await res.json();
  return data;
};

export const bkashCreatePayment = async (token: string, amount: string, policyNo: string) => {
  const res = await fetch(BKASH_CREATE_PAYMENT_API, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: token,
      'x-app-key': BKASH_APP_KEY,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: policyNo,
      callbackURL: 'https://www.popularlifeins.com/',
      merchantAssociationInfo: '',
      amount: amount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: `Inv${Math.floor(1000 + Math.random() * 900000)}`,
    }),
  });

  const data = await res.json();
  return data;
};

export const bkashExecutePayment = async (token: string, paymentId: string) => {
  const res = await fetch(BKASH_EXECUTE_PAYMENT_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'x-app-key': BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID: paymentId }),
  });

  const data = await res.json();
  return data;
};

export const bkashPaymentStatus = async (token: string, paymentId: string) => {
  const res = await fetch(BKASH_QUERY_PAYMENT_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'x-app-key': BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID: paymentId }),
  });

  const data = await res.json();
  return data;
};

export const nagadPaymentUrl = async (postData: any): Promise<string> => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    const { data } = await axios.post<{ data: { url?: string } }>(
      `${API}/api/get-nagad-url`,
      postData,
      config
    );

    console.log('Nagad Payment URL Response:', data);

    return data.data.url || '';
  } catch (error: any) {
    console.log('err: ', error);
    return '';
  }
};

export type DBBLPaymentInitResponse = {
  status: boolean;
  payment_url: string;
  transaction_id: string;
  raw?: any;
};

export const dbblPaymentUrl = async (
  amount: number,
  invoice: string,
  cardType: number
): Promise<DBBLPaymentInitResponse> => {
  try {

    console.log('Initiating DBBL Payment with:', { amount, invoice, cardType });
    const { data, status } = await axios.post(
      `${API}/api/get-dbbl-url`,
      { amount, invoice, card_type: cardType as Number },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('HTTP Status Code:', status);
    console.log('DBBL Init Response:', data);

    const payload = data?.data || data || {};

    return {
      status: payload?.status === true,
      payment_url: payload?.payment_url || '',
      transaction_id: payload?.transaction_id || '',
      raw: data,
    };
  } catch (error: any) {

    console.error('DBBL Payment Error:', error);


    // 👉 added logs only
    console.log('DBBL Check Error Status:', error?.response?.status);
    console.log('DBBL Check Error Data:', error?.response?.data);
    console.log('DBBL Check Error Message:', error?.message);
    return {
      status: false,
      payment_url: '',
      transaction_id: '',
      raw: null,
    };
  }
};

export const dbblCheckTransaction = async (trans_id: string): Promise<any> => {
  try {
    const { data, status } = await axios.post(
      `${API}/api/check-dbbl-transaction`,
      { trans_id },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('HTTP Status Code:', status);
    console.log('DBBL Check Response:', data);
    return data;
  } catch (error: any) {
    console.error('DBBL Check Error:', error);

    // 👉 added logs only
    console.log('DBBL Check Error Status:', error?.response?.status);
    console.log('DBBL Check Error Data:', error?.response?.data);
    console.log('DBBL Check Error Message:', error?.message);

    return null;
  }
};