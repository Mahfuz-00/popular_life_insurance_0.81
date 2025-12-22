import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Alert, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    bkashGetToken,
    bkashCreatePayment,
    bkashExecutePayment,
} from '../../actions/paymentServiceActions';
import { userPayFirstPremium, userPayPremium } from '../../actions/userActions';
import { downloadFirstPremiumReceipt } from '../../actions/userActions';
import moment from 'moment';
import { HIDE_LOADING } from '../../store/constants/commonConstants';
import { useDispatch } from 'react-redux';


type FirstPremiumBkashProps = {
    amount: string;
    nid: string;
    proposalData: any;
    onSuccess: () => void;
    onClose: () => void;
    navigation: any;
};

export const FirstPremiumBkashPayment: React.FC<FirstPremiumBkashProps> = ({
    amount,
    nid,
    proposalData,
    onSuccess,
    onClose,
    navigation,
}) => {
    const dispatch = useDispatch();
    const [bkashUrl, setBkashUrl] = useState<string>('');
    const [bkashToken, setBkashToken] = useState<string>('');
    const [bkashPaymentId, setBkashPaymentId] = useState<string>('');

    const startPayment = async () => {
        try {
            let token = await AsyncStorage.getItem('bkashToken');
            if (!token) {
                const res = await bkashGetToken();
                token = res.id_token;
                await AsyncStorage.setItem('bkashToken', token!);
                setTimeout(() => AsyncStorage.removeItem('bkashToken'), 55 * 60 * 1000);
            }

            const result = await bkashCreatePayment(token!, amount, nid);
            if (result?.message?.includes('expired')) {
                await AsyncStorage.removeItem('bkashToken');
                Alert.alert('Session Expired', 'Please try again.');
                onClose();
                return;
            }

            setBkashToken(token!);
            setBkashPaymentId(result.paymentID);
            setBkashUrl(result.bkashURL);
        } catch (err: any) {
            Alert.alert('Payment Failed', err.message || 'Network error');
            onClose();
        }
    };

    useEffect(() => {
        startPayment();
    }, []);

    const handleSuccess = async (trxID: string, id: string) => {
        try {
            const postData = {
                payment_id: id,
                ...proposalData,
            };

            const result = await userPayFirstPremium(postData);
            console.log('First Premium Payment Post Data:', postData);
            console.log('First Premium Payment Result:', result);
            if (result.success) {
                Alert.alert(
                    'Payment Successful!',
                    'Your first premium has been processed. Download your e-Receipt.',
                    [
                        {
                            text: 'Download Receipt',
                            onPress: () => downloadFirstPremiumReceipt(nid, trxID),
                        },
                        { text: 'OK', onPress: onSuccess },
                    ]
                );
            } else {
                Alert.alert('Error', 'Payment succeeded but processing failed. Contact support with TrxID: ' + trxID);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to complete payment. Contact support.');
        }
    };

    if (!bkashUrl) return null;

    return (
        <WebView
            source={{ uri: bkashUrl }}
            style={{ flex: 1, marginTop: 20 }}
            onNavigationStateChange={async (navState) => {
                if (navState.url.includes('status=success')) {
                    setBkashUrl('');
                    const result = await bkashExecutePayment(bkashToken, bkashPaymentId);
                    if (result.transactionStatus === 'Completed') {
                        let transactionPostData = {
                            project_name: proposalData.project,
                            policy_no: proposalData.nid,
                            method: 'bkash',
                            amount: amount,
                            transaction_no: result.trxID,
                            date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
                        };

                        console.log('Post Data: ', transactionPostData);

                        const getIdfrompaypremium = await userPayPremium(transactionPostData);
                        console.log('userPayPremium Result:', getIdfrompaypremium);

                        if (!getIdfrompaypremium || !getIdfrompaypremium.data?.data.id) {
                            dispatch({ type: HIDE_LOADING });
                            ToastAndroid.show(
                                'Payment processing failed: Invalid response from server.',
                                ToastAndroid.LONG,
                            );
                            navigation.pop();
                            return;
                        }
                        await handleSuccess(result.trxID, getIdfrompaypremium.data?.data.id);
                    } else {
                        Alert.alert('Payment Failed', result.statusMessage || 'Transaction failed');
                        onClose();
                    }
                } else if (navState.url.includes('status=failure') || navState.url.includes('cancel')) {
                    Alert.alert('Payment Cancelled', 'Transaction was cancelled.');
                    onClose();
                }
            }}
        />
    );
};