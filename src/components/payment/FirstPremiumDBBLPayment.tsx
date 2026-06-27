import React, { useState, useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import {
    Alert,
    ActivityIndicator,
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';
import moment from 'moment';
import { dbblPaymentUrl, dbblCheckTransaction } from '../../actions/paymentServiceActions';
import {
    userPayFirstPremium,
    userPayFirstPremiumUpdate,
    userPayPremium,
    downloadFirstPremiumReceipt,
} from '../../actions/userActions';
import { useDispatch } from 'react-redux';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants';

type FirstPremiumDBBLProps = {
    amount: string;
    nid: string;
    mobileNo: string;
    proposalData: any;
    onSuccess: () => void;
    onClose: () => void;
    navigation: any;
    secondaryPaymentId?: number | null;
};

type CardOption = {
    label: string;
    value: number;
};

const CARD_OPTIONS: CardOption[] = [
    { label: 'DBBL Nexus', value: 1 },
    { label: 'Master Debit', value: 2 },
    { label: 'Visa Debit', value: 3 },
    { label: 'Visa', value: 4 },
    { label: 'MasterCard', value: 5 },
    { label: 'Rocket', value: 6 },
];

export const FirstPremiumDBBLPayment: React.FC<FirstPremiumDBBLProps> = ({
    amount,
    nid,
    mobileNo,
    proposalData,
    onSuccess,
    onClose,
    navigation,
    secondaryPaymentId,
}) => {
    const dispatch = useDispatch();

    const [url, setUrl] = useState<string>('');
    const [transId, setTransId] = useState<string>('');
    const [processing, setProcessing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // card type selection
    const [showCardTypeModal, setShowCardTypeModal] = useState<boolean>(true);
    const [selectedCardType, setSelectedCardType] = useState<number | null>(null);

    const trxNoRef = useRef(moment().format('YYMMDD_HHmmss'));
    const trxNo = trxNoRef.current;

    // prevent duplicate verify calls
    const verifyStartedRef = useRef(false);

    const initPayment = async (cardType: number) => {
        try {
            setLoading(true);

            const invoice = `P${nid}${trxNo}`;

            const response = await dbblPaymentUrl(Number(amount), invoice, cardType);

            console.log('DBBL First Premium Init Response Body:', response);

            /**
             * Expected normalized response:
             * {
             *   status: true,
             *   payment_url: 'https://....',
             *   transaction_id: '....'
             * }
             */
            if (
                response?.status === true &&
                response?.payment_url &&
                response?.transaction_id
            ) {
                setUrl(response.payment_url);
                setTransId(response.transaction_id);
            } else {
                Alert.alert('Error', 'Failed to initialize DBBL payment');
                onClose();
            }
        } catch (error) {
            console.error('DBBL First Premium init error:', error);
            Alert.alert('Error', 'Failed to initialize DBBL payment');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCardType !== null) {
            initPayment(selectedCardType);
        }
    }, [selectedCardType]);

    const verifyAndProcessPayment = async () => {
        if (processing || verifyStartedRef.current || !transId) return;

        verifyStartedRef.current = true;
        setProcessing(true);

        try {
            console.log('Checking DBBL first premium transaction with trans_id:', transId);

            const verifyRes = await dbblCheckTransaction(transId);

            console.log('DBBL First Premium Verify Response:', verifyRes);

            /**
             * IMPORTANT:
             * success/fail should depend on status true/false only
             */
            const verifyText =
                typeof verifyRes === 'string'
                    ? verifyRes
                    : typeof verifyRes?.data === 'string'
                        ? verifyRes.data
                        : '';

            const upperVerifyText = verifyText.toUpperCase();

            const isSuccess =
                upperVerifyText.includes('RESULT: OK') ||
                upperVerifyText.includes('RESULT: CREATED') ||
                upperVerifyText.includes('PAYMENT SUCCESSFUL') ||
                upperVerifyText.includes('RESULT: SUCCESS')||
                verifyRes === 'Payment Successful!';

            if (!isSuccess) {
                navigation.pop();
                Alert.alert('Transaction Failed', 'Payment could not be verified.');
                onClose();
                return;
            }

            // Verified success → close gateway screen immediately
            navigation.pop();

            // Show loader while app saves payment
            dispatch({ type: SHOW_LOADING, payload: 'Completing your payment...' });

            const realTrxId = transId;

            /* ---------------- STEP 1: RECORD PAYMENT ---------------- */
            const paymentPostData = {
                project_name: proposalData.project,
                policy_no: proposalData.nid,
                method: 'dbbl',
                amount: amount,
                transaction_no: realTrxId,
                date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
            };

            const paymentResult = await userPayPremium(paymentPostData);

            if (!paymentResult?.data?.data?.id) {
                dispatch({ type: HIDE_LOADING });

                Alert.alert(
                    'Processing Error',
                    `Payment succeeded at DBBL but no confirmation ID received.\n\nPlease contact support with TrxID: ${realTrxId}`
                );
                return;
            }

            /* ---------------- SECONDARY UPDATE (ASYNC) ---------------- */
            if (secondaryPaymentId) {
                const updatePostData = {
                    method: 'dbbl',
                    transaction_no: realTrxId,
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

                userPayFirstPremiumUpdate(updatePostData)
                    .then((res) => {
                        if (res?.success) {
                            console.log('Secondary server updated');
                        } else {
                            console.warn('Secondary update failed — retry later');
                        }
                    })
                    .catch((err) => {
                        console.warn('Secondary update error:', err);
                    });
            }

            /* ---------------- STEP 2: FINAL FIRST PREMIUM SAVE ---------------- */
            const fullPostData = {
                payment_id: paymentResult.data.data.id,
                ...proposalData,
            };

            const firstPremiumResult = await userPayFirstPremium(fullPostData);

            dispatch({ type: HIDE_LOADING });

            if (firstPremiumResult?.success) {
                Alert.alert(
                    'Payment Successful!',
                    'Your first premium has been processed.\n\nDownload your e-Receipt below.',
                    [
                        {
                            text: 'Download Receipt',
                            onPress: () => downloadFirstPremiumReceipt(nid, realTrxId),
                        },
                        {
                            text: 'Done',
                            onPress: onSuccess,
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                Alert.alert(
                    'Processing Error',
                    `Payment succeeded at DBBL but final processing failed.\n\nPlease contact support with TrxID: ${realTrxId}`
                );
            }
        } catch (err: any) {
            dispatch({ type: HIDE_LOADING });
            navigation.pop();
            Alert.alert('Transaction Failed', 'Payment could not be verified.');
            console.error('DBBL first premium error:', err);
            onClose();
        } finally {
            setProcessing(false);
        }
    };

    const handleSelectCardType = (cardType: number) => {
        setShowCardTypeModal(false);
        setSelectedCardType(cardType);
    };

    const handleCancelCardSelection = () => {
        setShowCardTypeModal(false);
        onClose();
    };

    if (showCardTypeModal) {
        return (
            <Modal visible={true} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select Card Type</Text>
                        <Text style={styles.modalSubtitle}>
                            Please choose your card type to continue payment
                        </Text>

                        {CARD_OPTIONS.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                style={styles.optionButton}
                                onPress={() => handleSelectCardType(item.value)}
                            >
                                <Text style={styles.optionText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelCardSelection}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    if (loading || !url) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loaderText}>Preparing DBBL payment...</Text>
            </View>
        );
    }

    return (
        <WebView
            source={{ uri: url }}
            style={{ flex: 1, marginTop: 20 }}
            startInLoadingState={true}
            onNavigationStateChange={(navState) => {
                const pageUrl = navState.url;

                console.log('DBBL First Premium WebView URL:', pageUrl);

                if (processing || verifyStartedRef.current) return;

                /**
                 * DO NOT rely on success/fail/cancel/abort keywords.
                 *
                 * Instead:
                 * Once user leaves DBBL domain, verify by API using transId.
                 */
                const isStillOnDbblGateway =
                    pageUrl.includes('ecomtest.dutchbanglabank.com') ||
                    pageUrl.includes('dutchbanglabank.com');

                if (!isStillOnDbblGateway && transId) {
                    console.log('DBBL first premium flow seems finished, verifying transaction...');
                    // setTimeout(verifyAndSavePayment, 2500);
                    verifyAndProcessPayment();
                }
            }}
            onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('DBBL First Premium WebView error:', nativeEvent);

                /**
                 * Sometimes WebView throws after redirect / callback page issue.
                 * Try verify anyway if we already have transId.
                 */
                if (!verifyStartedRef.current && transId) {
                    console.log('WebView error after redirect, trying verify anyway...');
                    verifyAndProcessPayment();
                } else {
                    navigation.pop();
                    Alert.alert('Payment Error', 'Unable to load payment page.');
                    onClose();
                }
            }}
        />
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    optionButton: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    cancelButton: {
        marginTop: 8,
        paddingVertical: 12,
    },
    cancelText: {
        textAlign: 'center',
        fontSize: 15,
        color: '#d11a2a',
        fontWeight: '600',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
});