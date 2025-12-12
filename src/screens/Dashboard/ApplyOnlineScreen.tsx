import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, ImageBackground, ScrollView, StyleSheet, Alert, Text } from 'react-native';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { PickerComponent } from '../../components/PickerComponent';
import { DatePickerComponent } from '../../components/DatePickerComponent';
import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { useDispatch } from 'react-redux';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants'; 

// --- Constants from the code provided ---
const RelationOptions = [ 
    {value:'FATHER', label:'Father'},
    {value:'MOTHER', label:'Mother'},
    {value:'WIFE', label:'Wife'},
    {value:'HUSBAND', label:'Husband'},
    {value:'SON', label:'Son'},
    {value:'DAUGHTER', label:'Daughter'},
    {value:'BROTHER', label:'Brother'},
    {value:'SISTER', label:'Sister'},
    {value:'NEPHEW', label:'Nephew'},
    {value:'NIECE', label:'Niece'},
    {value:'UNCLE', label:'Uncle'},
    {value:'AUNT', label:'Aunt'},
    {value:'GRAND FATHER', label:'Grand Father'},
    {value:'GRAND MOTHER', label:'Grand Mother'},
];

const educationOptions = [ 
    {value:'NoLit', label:'No Literacy'},
    {value:'PSC', label:'PSC'},
    {value:'JSC', label:'JSC'},
    {value:'SSC/Equivalent', label:'SSC/Equivalent'},
    {value:'HSC/Equivalent', label:'HSC/Equivalent'},
    {value:'BSc/Equivalent', label:'BSc/Equivalent'},
    {value:'MSc/Equivalent', label:'MSc/Equivalent'},
    {value:'PhD/Equivalent', label:'PhD/Equivalent'}
 ];
// ----------------------------------------


const ApplyOnlineScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const dispatch = useDispatch(); 
    const firstRender = useRef(true);

    // Initial Policy Details (from route params)
    const initialPremium = route.params?.premium ?? '';
    const initialAge = route.params?.age ?? '';
    const initialPlan = route.params?.plan ?? '';
    const initialTerm = route.params?.term ?? '';
    const initialRate = route.params?.rate ?? '';
    const initialMode = route.params?.mode ?? '';
    const initialSumAssured = route.params?.sumAssured ?? '';

    // State for Policy Details (partially pre-filled from PremiumCalculatorScreen)
    const [dateOfBirth, setDateOfBirth] = useState(new Date('1990-01-01'));
    // Mock data arrays for pickers (replace with actual fetch/redux state in a real app)
    const [plans, setPlans] = useState([{label: 'product one', value:'01'}, {label: 'two product', value:'02'}]);
    const [terms, setTerms] = useState([{label: '6', value:'80.5'}, {label: '10', value:'75'}]);
    const [modes, setModes] = useState([{label: 'Yearly', value:'Yly'}, {label: 'Monthly', value:'Mly'}]);
    
    const [age, setAge] = useState(initialAge);
    const [plan, setPlan] = useState(initialPlan);
    const [term, setTerm] = useState(initialTerm);
    const [rate, setRate] = useState(initialRate);
    const [mode, setMode] = useState(initialMode);
    const [sumAssured, setSumAssured] = useState(initialSumAssured);
    const [premium, setPremium] = useState(initialPremium);
    
    // State for Proposer/Nominee Details
    const [idType, setIdType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [proposersName, setProposersName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [education, setEducation] = useState('');
    const [faCode, setFaCode] = useState('');
    const [nomineeName, setNomineeName] = useState('');
    const [nomineeAge, setNomineeAge] = useState('');
    const [nomineeRelation, setNomineeRelation] = useState('');

    const [isLoading, setIsLoading] = useState(false); 

    useLayoutEffect(() => {
        if (!firstRender.current) {
            setPremium('');
        }                          
    }, [dateOfBirth, plan, term, mode, sumAssured]);

    useEffect(() => {        
        firstRender.current = false;    
    }, []);


    const validatePremiumData = () => {
        if (!plan || !term || !mode || !sumAssured || Number(sumAssured) <= 0) {
            Alert.alert('Required', 'Please select a Plan, Term, Mode, and enter a valid Sum Assured.');
            return false;
        }
        return true;
    }

    const getPremium = async () => {
        if (isLoading || !validatePremiumData()) return;

        setIsLoading(true);
        dispatch({ type: SHOW_LOADING, payload: 'Calculating premium...' });

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            const mockPremium = '1000'; 

            if (mockPremium) {
                setPremium(mockPremium);
                Alert.alert('Success', `Premium calculated: ${mockPremium}`);
            } else {
                Alert.alert('Error', 'Could not calculate premium. Please check inputs.');
                setPremium('');
            }
        } catch (error) {
            console.error('Premium calculation failed:', error);
            Alert.alert('Error', 'Network error during premium calculation.');
            setPremium('');
        } finally {
            setIsLoading(false);
            dispatch({ type: HIDE_LOADING });
        }
    }  

    const handleSubmit = async () => {
        if (isLoading) return;

        if (!premium) {
            Alert.alert('Error', 'Please calculate the premium first.');
            return;
        }

        setIsLoading(true);
        dispatch({ type: SHOW_LOADING, payload: 'Submitting application...' });

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            Alert.alert('Success', 'Policy application submitted successfully!');
            navigation.goBack(); 
            
        } catch (error) {
            console.error('Submission failed:', error);
            Alert.alert('Error', 'An error occurred during submission.');
        } finally {
            setIsLoading(false);
            dispatch({ type: HIDE_LOADING });
        }
    };

    const inputDisabled = isLoading;
    const premiumButtonTitle = isLoading ? 'CALCULATING...' : 'GET PREMIUM';
    const submitButtonTitle = isLoading ? 'SUBMITTING...' : 'SUBMIT';


    return (
        <View style={globalStyle.container}>
        <ImageBackground source={BackgroundImage} style={{flex:1}}>
            <Header navigation = {navigation} title = {'Apply for Policy'}/>
            <ScrollView style={[globalStyle.wrapper, {margin: 10}]}>     

            {/* Policy Details Section */}
            <DatePickerComponent
                date = {dateOfBirth}
                setDate= {setDateOfBirth}
                label = {'Birth Date'}
                editable={!inputDisabled}
            />

            <PickerComponent
                items = {plans}
                value = {plan}
                setValue = {setPlan}
                label ={'Product / Plan'}
                placeholder = {'Select one'}
                disabled={inputDisabled} 
            />

            <PickerComponent
                items = {terms}
                value = {rate}
                setValue = {setRate}
                setLabel = {setTerm}
                label ={'Term'}
                placeholder = {'Select one'}
                disabled={inputDisabled} 
            />

            <PickerComponent
                items = {modes}
                value = {mode}
                setValue = {setMode}
                label ={'Mode of Payment'}
                placeholder = {'Select one'}
                disabled={inputDisabled} 
            />

            <Input
                label={'Sum Assured'}
                placeholder={''}        
                value={sumAssured}
                onChangeText={setSumAssured}
                keyboardType='numeric'
                editable={!inputDisabled} 
            />

            <Input
                label={'Premium'}
                placeholder={''}        
                value={premium}
                editable={false}
            />
        {/* GET PREMIUM Button */}
        {
            premium == '' &&
            <>
                <FilledButton
                    title={premiumButtonTitle}
                    style={styles.loginButton}
                    onPress={getPremium}
                    disabled={isLoading} 
                />
            </>
        }

        {/* Proposer and Nominee Details Section */}
        {
            premium != '' && 
            <>
                <Text style={styles.title}>PROPOSER DETAILS</Text>
                
                <Input
                    label={'Proposers Name'}
                    placeholder={''}        
                    value={proposersName}
                    onChangeText={setProposersName}
                    editable={!inputDisabled} 
                />
                
                <PickerComponent
                    items = {[{label: 'NID', value:'NID'}, {label: 'Birth Certificate', value:'Birth_Certificate'}]}
                    value = {idType}
                    setValue = {setIdType}
                    label ={'ID Type'}
                    placeholder = {'Select one'}
                    disabled={inputDisabled} 
                />

                <Input
                    label={'ID Number'}
                    placeholder={''}        
                    value={idNumber}
                    onChangeText={setIdNumber}
                    editable={!inputDisabled} 
                />

                <Input
                    label={'Father Name'}
                    placeholder={''}        
                    value={fatherName}
                    onChangeText={setFatherName}
                    editable={!inputDisabled} 
                />

                <Input
                    label={'Mother Name'}
                    placeholder={''}        
                    value={motherName}
                    onChangeText={setMotherName}
                    editable={!inputDisabled} 
                />

                <Input
                    label={'Address'}
                    placeholder={''}        
                    value={address}
                    onChangeText={setAddress}
                    editable={!inputDisabled} 
                />

                <PickerComponent
                    items = {[{label: 'Male', value:'male'}, {label: 'Female', value:'female'}]}
                    value = {gender}
                    setValue = {setGender}
                    label ={'Gender'}
                    placeholder = {'Select one'}
                    disabled={inputDisabled} 
                />

                <PickerComponent
                    items = {educationOptions}
                    value = {education}
                    setValue = {setEducation}
                    label ={'Education'}
                    placeholder = {'Select one'}
                    disabled={inputDisabled} 
                />

                <Input
                    label={'FA Code ( optional )'}
                    placeholder={''}        
                    value={faCode}
                    onChangeText={setFaCode}
                    editable={!inputDisabled} 
                />
                
                <Text style={styles.title}>NOMINEE DETAILS</Text>

                <Input
                    label={'Nominee Name'}
                    placeholder={''}        
                    value={nomineeName}
                    onChangeText={setNomineeName}
                    editable={!inputDisabled} 
                />

                <Input
                    label={'Nominee Age'}
                    placeholder={''}        
                    value={nomineeAge}
                    onChangeText={setNomineeAge}
                    keyboardType='numeric'
                    editable={!inputDisabled} 
                />

                <PickerComponent
                    items = {RelationOptions}
                    value = {nomineeRelation}
                    setValue = {setNomineeRelation}
                    label ={'Nominee Relation'}
                    placeholder = {'Select one'}
                    disabled={inputDisabled} 
                />

                <FilledButton
                    title={submitButtonTitle} 
                    style={styles.loginButton}
                    onPress={handleSubmit}
                    disabled={isLoading} 
                />
            </>
        }
            </ScrollView>
        </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
      marginVertical: 10,
      fontWeight:'bold',
      fontSize: 18,
      color: '#182E44'
    },
    loginButton: {
      marginVertical: 10,
    }
  });

export default ApplyOnlineScreen