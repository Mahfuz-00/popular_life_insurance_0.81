import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Alert } from 'react-native';
import moment from 'moment';
import { nagadPaymentUrl } from '../../actions/paymentServiceActions';
import { userPayFirstPremium, userPayFirstPremiumUpdate, userPayPremium } from '../../actions/userActions';
import { downloadFirstPremiumReceipt } from '../../actions/userActions';
import { useDispatch } from 'react-redux';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants';

type FirstPremiumNagadProps = {
    amount: string;
    nid: string;
    mobileNo: string;
    proposalData: any;
    onSuccess: () => void;
    onClose: () => void;
    navigation: any;
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

export const FirstPremiumNagadPayment: React.FC<FirstPremiumNagadProps> = ({
    amount,
    nid,
    mobileNo,
    proposalData,
    onSuccess,
    onClose,
    navigation,
}) => {
    const dispatch = useDispatch();
    const [url, setUrl] = useState<string>('');
    const trxNoRef = React.useRef(moment().format('YYYYMMDDHHmmss'));
    const trxNo = trxNoRef.current;

    useEffect(() => {
        const init = async () => {
            const postData = {
                policyNo: nid,
                amount,
                mobileNo,
                transactionNo: trxNo,
            };
            const paymentUrl = await nagadPaymentUrl(postData);
            if (paymentUrl) {
                setUrl(paymentUrl);
            } else {
                Alert.alert('Error', 'Failed to initialize payment');
                onClose();
            }
        };
        init();
    }, []);

    const handleSuccess = async () => {
        try {
            // Immediately pop back to gateway for instant feedback
            navigation.pop();

            // Show meaningful loading while processing the two APIs
            dispatch({ type: SHOW_LOADING, payload: 'Completing your payment...' });

            // Step 1: Record the payment (minimal data) via userPayPremium
            const paymentPostData = {
                project_name: proposalData.project,
                policy_no: proposalData.nid,
                method: 'nagad',
                amount: amount,
                transaction_no: trxNo,
                date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
            };

            const paymentResult = await userPayPremium(paymentPostData);

            if (!paymentResult?.data?.data?.id) {
                dispatch({ type: HIDE_LOADING });
                const apiMsg = getApiErrorMessage(
                    paymentResult?.data,
                    `Payment succeeded at bKash but no confirmation ID received.\n\nPlease contact support with TrxID: ${trxNo}`
                );

                Alert.alert('Processing Error', apiMsg);
                return;
            }


            /* ---------------- SECONDARY UPDATE (FIRST & ALWAYS) ---------------- */
            const updatePostData = {
                method: proposalData.method || 'bkash',
                transaction_no: trxNo,
                nid: proposalData.nid,
                project: proposalData.project,
                code: proposalData.code,
                mobile: proposalData.mobile,
                net_pay: proposalData.net_pay,
                servicingCell: proposalData.servicingCell,
                entrydate: proposalData.entrydate,
                agentMobile: proposalData.agentMobile,
            };
            
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

            const firstPremiumResult = await userPayFirstPremium(fullPostData);

            dispatch({ type: HIDE_LOADING });

            if (firstPremiumResult.success) {
                Alert.alert(
                    'Payment Successful!',
                    'Your first premium has been processed.\n\nDownload your e-Receipt below.',
                    [
                        {
                            text: 'Download Receipt',
                            onPress: () => downloadFirstPremiumReceipt(nid, trxNo),
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
                    `Payment succeeded at bKash but no confirmation ID received.\n\nPlease contact support with TrxID: ${trxNo}`
                );

                Alert.alert('Processing Error', apiMsg);
            }
        } catch (err: any) {
            dispatch({ type: HIDE_LOADING });
            Alert.alert('Error', 'Something went wrong during processing. Please contact support.');
            console.error('Nagad first premium error:', err);
        }
    };

    if (!url) {
        return null;
    }

    return (
        <WebView
            source={{ uri: url, method: 'post' }}
            style={{ flex: 1, marginTop: 20 }}
            onNavigationStateChange={(navState) => {
                const pageUrl = navState.url;

                if (pageUrl.includes('Success')) {
                    handleSuccess();
                } else if (pageUrl.includes('Failed') || pageUrl.includes('Aborted')) {
                    navigation.pop();
                    Alert.alert(
                        'Payment Failed',
                        pageUrl.includes('Aborted') ? 'Transaction was cancelled.' : 'Transaction failed.'
                    );
                    onClose();
                }
            }}
        />
    );
};