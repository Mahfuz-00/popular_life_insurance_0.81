import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Alert, ToastAndroid } from 'react-native';
import moment from 'moment';
import { nagadPaymentUrl } from '../../actions/paymentServiceActions';
import { userPayFirstPremium, userPayPremium } from '../../actions/userActions';
import { downloadFirstPremiumReceipt } from '../../actions/userActions';
import { useDispatch } from 'react-redux';
import { HIDE_LOADING } from '../../store/constants/commonConstants';

type FirstPremiumNagadProps = {
    amount: string;
    nid: string;
    mobileNo: string;
    proposalData: any;
    onSuccess: () => void;
    onClose: () => void;
    navigation: any;
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
    const trxNo = moment().format('YYYYMMDDHHmmss');

    useEffect(() => {
        const init = async () => {
            const postData = {
                policyNo: nid,
                amount,
                mobileNo,
                transactionNo: trxNo,
            };
            const paymentUrl = await nagadPaymentUrl(postData);
            if (paymentUrl) setUrl(paymentUrl);
            else {
                Alert.alert('Error', 'Failed to initialize payment');
                onClose();
            }
        };
        init();
    }, []);

    const handleSuccess = async () => {
        try {
            const transactionPostData = {
                project_name: proposalData.project,
                policy_no: proposalData.nid,
                method: 'nagad',
                amount: amount,
                transaction_no: trxNo,
                date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
            };

            const isSuccess = await userPayPremium(transactionPostData);
            console.log('userPayPremium Result:', isSuccess);

            if (!isSuccess || !isSuccess.data?.data.id) {
                dispatch({ type: HIDE_LOADING });
                ToastAndroid.show(
                    'Payment processing failed: Invalid response from server.',
                    ToastAndroid.LONG
                );
                navigation.pop();
                return;
            }

            // Submit first premium
            const submissionResult = await userPayFirstPremium({
                payment_id: isSuccess.data?.data.id,
                ...proposalData,
            });

            if (submissionResult.success) {
                Alert.alert(
                    'Payment Successful!',
                    'Your first premium has been processed. Download your e-Receipt.',
                    [
                        {
                            text: 'Download Receipt',
                            onPress: () => downloadFirstPremiumReceipt(nid, trxNo),
                        },
                        { text: 'OK', onPress: onSuccess },
                    ]
                );
            } else {
                Alert.alert(
                    'Error',
                    'Payment succeeded but processing failed. Contact support.'
                );
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to complete payment.');
        }
    };

    if (!url) return null;

    return (
        <WebView
            source={{ uri: url, method: 'post' }}
            style={{ flex: 1, marginTop: 20 }}
            onNavigationStateChange={(navState) => {
                const pageUrl = navState.url;
                if (pageUrl.includes('Success')) {
                    handleSuccess();
                } else if (pageUrl.includes('Failed') || pageUrl.includes('Aborted')) {
                    Alert.alert(
                        'Payment Failed',
                        pageUrl.includes('Aborted') ? 'Cancelled' : 'Failed'
                    );
                    onClose();
                }
            }}
        />
    );
};
