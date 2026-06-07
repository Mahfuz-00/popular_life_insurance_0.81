import React, { useState, useEffect, useRef } from 'react';
import {
    Alert,
    ActivityIndicator,
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { dbblPaymentUrl, dbblCheckTransaction } from '../../actions/paymentServiceActions';
import { userPayPremium, userPayPremiumUpdate } from '../../actions/userActions';

type PaymentType = 'full' | 'partial';

type DBBLPaymentProps = {
    amount: string;
    number: string;
    mobileNo: string;
    paymentType: PaymentType;
    partialAmount?: string;
    adjustWith?: string;
    cause?: string;
    policyDetails: any;
    onSuccess: (trxID: string) => void;
    onClose: () => void;
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

export const DBBLPayment: React.FC<DBBLPaymentProps> = ({
    amount,
    number,
    mobileNo,
    paymentType,
    partialAmount,
    adjustWith,
    cause,
    policyDetails,
    onSuccess,
    onClose,
    secondaryPaymentId,
}) => {
    const [url, setUrl] = useState<string>('');
    const [transId, setTransId] = useState<string>('');
    const [processing, setProcessing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showProcessingModal, setShowProcessingModal] = useState<boolean>(false);

    const [showCardTypeModal, setShowCardTypeModal] = useState<boolean>(true);
    const [selectedCardType, setSelectedCardType] = useState<number | null>(null);

    const trxNoRef = useRef(moment().format('YYMMDD_HHmmss'));
    const trxNo = trxNoRef.current;

    const trxNoRefDateTime = React.useRef(moment().format('YYYYMMDDHHmmss'));
    const trxNoDateTime = trxNoRefDateTime.current;

    const verifyStartedRef = useRef(false);

    const initPayment = async (cardType: number) => {
        try {
            setLoading(true);
            console.log('Policy Details for DBBL Payment:', policyDetails);
            const invoice = `P${policyDetails?.Policyno}_${trxNo}`;

            const response = await dbblPaymentUrl(Number(amount), invoice, cardType);

            console.log('DBBL Init Response:', response);

            if (response?.status === true && response?.payment_url && response?.transaction_id) {
                setUrl(response.payment_url);
                setTransId(response.transaction_id);
            } else {
                Alert.alert('Error', 'Failed to start DBBL payment');
                onClose();
            }
        } catch (error) {
            console.error('DBBL init error:', error);
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

    const verifyAndSavePayment = async () => {
        if (processing || verifyStartedRef.current || !transId) return;

        verifyStartedRef.current = true;
        setProcessing(true);
        setShowProcessingModal(true);

        try {
            console.log('Checking DBBL transaction with trans_id:', transId);

            const verifyRes = await dbblCheckTransaction(transId);
            console.log('DBBL Check Response:', verifyRes);
            console.log('DBBL Verify Response:', verifyRes);

            const verifyText = typeof verifyRes === 'string'
                ? verifyRes
                : typeof verifyRes?.data === 'string'
                    ? verifyRes.data
                    : '';

            const upperVerifyText = verifyText.toUpperCase();
            const isSuccess =
                upperVerifyText.includes('PAYMENT SUCCESSFUL') ||
                upperVerifyText.includes('RESULT: OK') ||
                upperVerifyText.includes('RESULT: SUCCESS') ||
                upperVerifyText.includes('RESULT: CREATED') ||
                verifyRes === 'Payment Successful!';

            if (!isSuccess) {
                setShowProcessingModal(false);
                Alert.alert('Transaction Failed', 'Payment could not be verified.');
                onClose();
                return;
            }

            const realTrxId = transId;

            const partialFields = paymentType === 'partial' ? {
                partial_amount: partialAmount,
                adjust_with: adjustWith,
                cause: cause?.trim(),
            } : {};

            if (secondaryPaymentId) {
                const updatePostData = {
                    policy_no: number,
                    method: 'dbbl',
                    amount: paymentType === 'full' ? amount : partialAmount,
                    transaction_no: realTrxId,
                    date_time: trxNoDateTime,
                    id: secondaryPaymentId,
                };
                const successUpdate = await userPayPremiumUpdate(updatePostData);
                if (successUpdate) console.log('Secondary server updated');
            }

            const postData: any = {
                policy_no: number,
                method: 'dbbl',
                amount: paymentType === 'full' ? amount : null,
                transaction_no: realTrxId,
                date_time: trxNoDateTime,
                ...partialFields,
                service_cell_code: policyDetails?.service_cell_code || '',
                branch_code: policyDetails?.branch_code || '',
            };

            console.log('DBBL PAYMENT POST DATA:', postData);

            const saved = JSON.parse((await AsyncStorage.getItem('syncPayments')) || '[]');
            await AsyncStorage.setItem('syncPayments', JSON.stringify([...saved, postData]));

            const lastId = await AsyncStorage.getItem('lastTransactionId');
            if (lastId === realTrxId) {
                setShowProcessingModal(false);
                onClose();
                return;
            }

            await AsyncStorage.setItem('lastTransactionId', realTrxId);

            const success = await userPayPremium(postData);

            console.log('DBBL Payment Save Result:', success);

            if (success) {
                const latestSaved = JSON.parse((await AsyncStorage.getItem('syncPayments')) || '[]');
                const updated = latestSaved.filter((p: any) => p.transaction_no !== realTrxId);
                await AsyncStorage.setItem('syncPayments', JSON.stringify(updated));

                setShowProcessingModal(false);
                onSuccess(realTrxId);
            } else {
                setShowProcessingModal(false);
                Alert.alert('Transaction Failed', 'Payment verified but failed to save.');
                onClose();
            }
        } catch (err) {
            console.error('DBBL verifyAndSavePayment error:', err);
            setShowProcessingModal(false);
            Alert.alert('Transaction Failed', 'Payment could not be verified.');
            onClose();
        } finally {
            setProcessing(false);
        }
    };

    const handleNavigation = (navState: any) => {
        const pageUrl = navState.url;
        console.log('DBBL WebView URL:', pageUrl);

        if (processing || verifyStartedRef.current) return;

        const isStillOnDbbl = pageUrl.includes('ecomtest.dutchbanglabank.com') ||
            pageUrl.includes('dutchbanglabank.com');

        if (pageUrl.includes('/rsaotp/checkRSA')) {
            setTimeout(verifyAndSavePayment, 2500);
            verifyAndSavePayment();
            return;
        }

        if (!isStillOnDbbl && transId) {
            console.log('DBBL flow seems finished, verifying transaction...');
            setTimeout(verifyAndSavePayment, 2500);
            verifyAndSavePayment();
        } else if (showProcessingModal && !isStillOnDbbl) {
            setShowProcessingModal(false);
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
        <>
            <WebView
                source={{ uri: url }}
                style={{ flex: 1, marginTop: 20 }}
                startInLoadingState={true}
                onNavigationStateChange={handleNavigation}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                    if (!verifyStartedRef.current && transId) {
                        verifyAndSavePayment();
                    } else {
                        Alert.alert('Payment Error', 'Unable to load payment page.');
                        onClose();
                    }
                }}
            />

            <Modal visible={showProcessingModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ActivityIndicator size="large" color="#0066cc" />
                        <Text style={styles.loaderText}>Completing transaction...</Text>
                        <Text style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
                            Please wait while we verify your payment
                        </Text>
                    </View>
                </View>
            </Modal>
        </>
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
        padding: 30,
        alignItems: 'center',
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
        width: '100%',
        alignItems: 'center',
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
        textAlign: 'center',
    },
});