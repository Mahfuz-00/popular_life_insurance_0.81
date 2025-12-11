//sandbox
// const BKASH_GRANT_TOKEN_API = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant";
// const BKASH_CREATE_PAYMENT_API = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create";
// const BKASH_EXECUTE_PAYMENT_API = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute";
// const BKASH_QUERY_PAYMENT_API = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status";

import {API} from '../config';
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

    return data.data.url || '';
  } catch (error: any) {
    console.log('err: ', error);
    return '';
  }
};