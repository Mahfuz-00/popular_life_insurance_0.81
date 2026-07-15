import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    bkashGetToken,
    bkashCreatePayment,
    bkashExecutePayment,
} from '../../actions/paymentServiceActions';
import { userPayPremium, userPayFirstPremium, userPayFirstPremiumUpdate } from '../../actions/userActions';
import { downloadFirstPremiumReceipt } from '../../actions/userActions';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants';

type FirstPremiumBkashProps = {
    amount: string;
    nid: string;
    proposalData: any;
    onSuccess: () => void;
    onClose: () => void;
    navigation: any;
    secondaryPaymentId?: number | null;
};

const getApiErrorMessage = (errorResponse: any, fallback: string) => {
    if (!errorResponse) return fallback;

    const directKey = Object.keys(errorResponse).find(
        key => Array.isArray(errorResponse[key])
    );

    if (directKey) {
        return errorResponse[directKey][0];
    }

    if (errorResponse.errors) {
        const errorKey = Object.keys(errorResponse.errors)[0];
        return errorResponse.errors[errorKey][0];
    }

    return fallback;
};

export const FirstPremiumBkashPayment: React.FC<FirstPremiumBkashProps> = ({
    amount,
    nid,
    proposalData,
    onSuccess,
    onClose,
    navigation,
    secondaryPaymentId,
}) => {
    const dispatch = useDispatch();

    // ==================== DEBUG: Incoming Data ====================
    console.log('🔍 [FirstPremiumBkashPayment] Component Mounted');
    console.log('📦 Amount:', amount);
    console.log('🆔 NID:', nid);
    console.log('🔑 Secondary Payment ID:', secondaryPaymentId);
    console.log('📋 Full Proposal Data Received:', JSON.stringify(proposalData, null, 2));
    // ============================================================

    const [bkashUrl, setBkashUrl] = useState<string>('');
    const [bkashToken, setBkashToken] = useState<string>('');
    const [bkashPaymentId, setBkashPaymentId] = useState<string>('');

    const startPayment = async () => {
        console.log('🚀 [Bkash] Starting payment process...');
        console.log('Requesting token...');

        const timeoutId = setTimeout(() => {
            console.error('⏰ bKash initialization timeout');
            console.log('Request timed out');
            Alert.alert('Timeout', 'bKash is taking too long. Please try again.');
            onClose();
        }, 25000); // 25 seconds timeout

        try {
            let token = await AsyncStorage.getItem('bkashToken');
            if (!token) {
                const res = await bkashGetToken();
                token = res.id_token;
                await AsyncStorage.setItem('bkashToken', token!);
                setTimeout(() => AsyncStorage.removeItem('bkashToken'), 55 * 60 * 1000);
            }

            const result = await bkashCreatePayment(token!, amount, nid);

            clearTimeout(timeoutId);
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

    const handleSuccess = async (trxID: string) => {
        console.log('✅ Bkash Execute Success - TrxID:', trxID);
        console.log('Proposal Data:', proposalData);

        try {
            // Immediately pop back for instant UX feedback
            navigation.pop();

            // Show loading while processing both APIs
            dispatch({ type: SHOW_LOADING, payload: 'Completing your payment...' });

            // Step 1: Record payment via userPayPremium (minimal data)
            const paymentPostData = {
                project_name: proposalData.project,
                policy_no: proposalData.nid,
                method: 'bkash',
                amount: amount,
                transaction_no: trxID,
                date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
            };

            console.log('📤 Sending to userPayPremium:', paymentPostData);
            const paymentResult = await userPayPremium(paymentPostData);
            console.log('📥 userPayPremium Response:', paymentResult);

            if (!paymentResult?.data?.data?.id) {
                dispatch({ type: HIDE_LOADING });
                console.error('❌ No payment_id received from primary');
                const apiMsg = getApiErrorMessage(
                    paymentResult?.data,
                    `Payment succeeded at bKash but no confirmation ID received.\n\nPlease contact support with TrxID: ${trxID}`
                );

                Alert.alert('Processing Error', apiMsg);
                return;
            }

            /* ---------------- SECONDARY UPDATE (FIRST & ALWAYS) ---------------- */
            const updatePostData = {
                method: proposalData.method || 'bkash',
                transaction_no: trxID,
                nid: proposalData.nid,
                project: proposalData.project,
                code: proposalData.code,
                mobile: proposalData.mobile,
                net_pay: proposalData.net_pay,
                servicingCell: proposalData.servicingCell,
                entrydate: proposalData.entrydate,
                agentMobile: proposalData.agentMobile,
                id: secondaryPaymentId,
            };

            console.log('📤 Sending to Secondary Update:', updatePostData);

            userPayFirstPremiumUpdate(updatePostData)
                .then(res => {
                    if (res.success) console.log('Secondary server updated');
                    else console.warn('Secondary update failed — retry later');
                });


            /* ---------------- PRIMARY PAYLOAD ---------------- */
            // Step 2: Submit full first premium with payment_id
            const fullPostData = {
                payment_id: paymentResult.data.data.id,
                ...proposalData,
            };

            console.log('📤 Sending Full First Premium Data:', fullPostData);

            const firstPremiumResult = await userPayFirstPremium(fullPostData);

            console.log('📥 First Premium Final Response:', firstPremiumResult);

            dispatch({ type: HIDE_LOADING });

            if (firstPremiumResult.success) {
                Alert.alert(
                    'Payment Successful!',
                    'Your first premium has been processed.\n\nDownload your e-Receipt below.',
                    [
                        {
                            text: 'Download Receipt',
                            onPress: () => downloadFirstPremiumReceipt(nid, trxID),
                        },
                        {
                            text: 'Done',
                            onPress: onSuccess,
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                const apiMsg = getApiErrorMessage(
                    paymentResult?.data,
                    `Payment succeeded at bKash but no confirmation ID received.\n\nPlease contact support with TrxID: ${trxID}`
                );

                Alert.alert('Processing Error', apiMsg);
            }
        } catch (err: any) {
            dispatch({ type: HIDE_LOADING });
            Alert.alert('Error', 'Something went wrong during processing. Please contact support.');
            console.error('Bkash first premium error:', err);
        }
    };

    if (!bkashUrl) return null;

    return (
        <WebView
            source={{ uri: bkashUrl }}
            style={{ flex: 1, marginTop: 20 }}

            onLoadStart={() => console.log('🌍 WebView Load Started')}
            onLoad={() => console.log('✅ WebView Loaded Successfully')}
            onLoadEnd={() => console.log('🏁 WebView Load Ended')}
            onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('❌ WebView Error:', nativeEvent);
            }}

            onNavigationStateChange={async (navState) => {
                console.log('🔄 Navigation State Changed → URL:', navState.url);

                if (navState.url.includes('status=success')) {
                    console.log('🎉 Success URL Detected!');
                    setBkashUrl('');

                    try {
                        const executeResult = await bkashExecutePayment(bkashToken, bkashPaymentId);

                        if (executeResult.transactionStatus === 'Completed') {
                            await handleSuccess(executeResult.trxID);
                        } else {
                            dispatch({ type: HIDE_LOADING });
                            Alert.alert('Payment Failed', executeResult.statusMessage || 'Transaction failed');
                            onClose();
                        }
                    } catch (error) {
                        dispatch({ type: HIDE_LOADING });
                        Alert.alert('Error', 'Failed to verify payment. Please contact support.');
                        onClose();
                    }
                } else if (navState.url.includes('status=failure') || navState.url.includes('cancel')) {
                    console.log('❌ Failure/Cancel URL Detected');
                    navigation.pop();
                    Alert.alert('Payment Cancelled', 'Transaction was cancelled.');
                    onClose();
                }
            }}
        />
    );
};