import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  ToastAndroid,
  Alert,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import globalStyle from '../../../styles/globalStyle';
import { Input } from '../../../components/input/Input';
import { FilledButton } from '../../../components/FilledButton';
import { PickerComponent } from '../../../components/PickerComponent';
import { DatePickerComponent } from '../../../components/DatePickerComponent';
import Header from '../../../components/Header';
import BackgroundImage from '../../../assets/BackgroundImage.png';
import { fetchProjects, getAgentCodes } from '../../../actions/userActions';
import { getPlanList, getTermList } from '../../../actions/calculatePremiumActions';
import { getRate } from '../../../actions/userActions';
import EnglishOnlyInput from '../../../components/input/EnglishOnlyInput';
import { saveFirstPremiumData } from '../../../actions/payFirstPremiumActions';
import { SHOW_LOADING, HIDE_LOADING } from '../../../store/constants/commonConstants';

const SPECIAL_PROJECTS = ['ABA', 'AKOK', 'ALA', 'IA', 'JBA', 'JBAK', 'IBT'];
const MODE_MULTIPLIER: Record<string, number> = { yly: 1, hly: 2, qly: 4, mly: 12, single: 1 };
const PLAN_72_FACTOR: Record<string, number> = { mly: 1, qly: 3, hly: 6, yly: 12, single: 1 };

interface ProjectItem {
  label: string;
  value: string | number;
  code: string;
}

interface ModeItem {
  label: string;
  value: string;
}

interface PlanItem {
  label: string;
  value: string;
  fullLabel?: string;
  modes?: ModeItem[];
}

const PayFirstPremiumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [terms, setTerms] = useState<{ label: string; value: string }[]>([]);
  const [modes, setModes] = useState<ModeItem[]>([]);

  // ⭐️ Renamed local loading states and removed isFaValidating
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  const [nid, setNid] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [selectedPlanLabel, setSelectedPlanLabel] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date('1990-01-01'));
  const [age, setAge] = useState<number>(0);
  const [term, setTerm] = useState<string>('');
  const [mode, setMode] = useState<string>('');
  const [sumAssured, setSumAssured] = useState<string>('');
  const [totalPremium, setTotalPremium] = useState<string>('');

  const [code6Digit, setCode6Digit] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [premium, setPremium] = useState<string>('');
  const [commission, setCommission] = useState<string>('');
  const [netCommission, setNetCommission] = useState<string>('');
  const [netAmount, setNetAmount] = useState<string>('');

  const [servicingCell, setServicingCell] = useState<string>('');
  const [agentMobile, setAgentMobile] = useState<string>('');
  const [fa, setFa] = useState<string>('');
  const [um, setUm] = useState<string>('');
  const [bm, setBm] = useState<string>('');
  const [agm, setAgm] = useState<string>('');

  const [fatherHusbandName, setFatherHusbandName] = useState<string>('');
  const [motherName, setMotherName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [nominee1Name, setNominee1Name] = useState<string>('');
  const [nominee1Percent, setNominee1Percent] = useState<string>('');
  const [nominee2Name, setNominee2Name] = useState<string>('');
  const [nominee2Percent, setNominee2Percent] = useState<string>('');
  const [nominee3Name, setNominee3Name] = useState<string>('');
  const [nominee3Percent, setNominee3Percent] = useState<string>('');
  const [isAgentFetched, setIsAgentFetched] = useState<boolean>(true);
  const [isUmEditable, setIsUmEditable] = useState(false);
  const [isBmEditable, setIsBmEditable] = useState(false);
  const [isAgmEditable, setIsAgmEditable] = useState(false);



  const entrydate = moment().format('YYYY-MM-DD');
  const isSpecialProject = selectedProject?.code ? SPECIAL_PROJECTS.includes(selectedProject.code) : false;
  
  // ⭐️ Combined Loading state (use isSubmitting for button/input disabling)
  const isInputDisabled = isSubmitting || isProjectLoading; 


  // Fetch Projects and Plans
  useEffect(() => {
    const loadInitialData = async () => {
      setIsProjectLoading(true);
      
      // 1. Fetch Projects
      const projectRes = await fetchProjects();
      if (projectRes?.data) {
        const formatted = projectRes.data.map((p: any) => ({
          label: p.name,
          value: p.id,
          code: p.code,
        }));
        setProjects(formatted);
      }
      
      // 2. Fetch Plans
      const planRes = await getPlanList();
      if (planRes && Array.isArray(planRes)) {
        const formattedPlans = planRes.map((p: any) => ({
            label: p.value,
            value: p.value,
            fullLabel: p.fullLabel || p.label,
            modes: Object.values(p.modes || {})
                .filter(Boolean)
                .map((m: any) => ({
                    label: m.label || m,    
                    value: m.value || m,
                })),
        }));
        setPlans(formattedPlans);
      }

      setIsProjectLoading(false);
    };
    loadInitialData();
  }, []);

  // Filter Plans based on selected project
  useEffect(() => {
    if (isProjectLoading) return;

    let allowed = plans;
    if (selectedProject?.code && !SPECIAL_PROJECTS.includes(selectedProject.code)) {
      allowed = plans.filter((p: PlanItem) => ['28', '57', '72'].includes(p.value));
      
      if (plan && !allowed.some((p: PlanItem) => p.value === plan)) {
        setPlan('');
        setModes([]);
        setMode('');
      }
    }
  }, [selectedProject?.code, plans, isProjectLoading]);
  
  // Reset on project change
  useEffect(() => {
    setPlan('');
    setModes([]);
    setMode('');
    setTerm('');
    setTerms([]);
    setCode6Digit('');
    setRate('');
    setPremium('');
    setCommission('');
    setNetAmount('');
    setSelectedPlanLabel('');
  }, [selectedProject?.code]);

  // Update modes & plan label
  useEffect(() => {
    const selected = plans.find(p => p.value === plan);
    if (selected) {
      setSelectedPlanLabel(selected.fullLabel || '');
      setModes(selected.modes || []);
      setMode('');
    } else {
      setSelectedPlanLabel('');
      setModes([]);
    }
  }, [plan, plans]);

  // Fetch Terms
  useEffect(() => {
    const loadTerms = async () => {
      if (!plan || isProjectLoading) {
        setTerms([]);
        setTerm('');
        return;
      }

      dispatch({ type: SHOW_LOADING, payload: 'Loading terms...' });

      try {
        const res = await getTermList(plan);

        let parsedTerms: { label: string; value: string }[] = [];

        if (Array.isArray(res)) {
          parsedTerms = res.map((t: any) => ({
            label: String(t.label ?? t.value),
            value: String(t.value),
          }));
        } else if (res?.data && Array.isArray(res.data)) {
          parsedTerms = res.data.map((t: any) => ({
            label: String(t.label ?? t.value),
            value: String(t.value),
          }));
        }

        setTerms(parsedTerms);

        if (parsedTerms.length === 0) {
          ToastAndroid.show('No term available for this plan', ToastAndroid.LONG);
          setTerm('');
        }
      } catch (error) {
        console.error('Failed to load terms:', error);
        setTerms([]);
        setTerm('');
        ToastAndroid.show('Failed to load terms', ToastAndroid.SHORT);
      } finally {
        dispatch({ type: HIDE_LOADING });
      }
    };

    loadTerms();
  }, [plan, dispatch, isProjectLoading]);


  // Age calculation
  useEffect(() => {
    if (!dateOfBirth) return;
    const birth = moment(dateOfBirth);
    const today = moment();
    const july1 = moment().year(today.year()).month(6).date(1);
    let calculatedAge = today.diff(birth, 'years');
    if (today.isSameOrAfter(july1)) calculatedAge += 1;
    setAge(calculatedAge);
  }, [dateOfBirth]);

  // Premium calculation (same as before)
  useEffect(() => {
    const calculate = async () => {
      setCode6Digit(''); setRate(''); setPremium(''); setCommission(''); setNetAmount('');

      if (!selectedProject?.code || !plan || !term || age < 0 || !sumAssured || !mode) return;

      const sa = parseFloat(sumAssured);
      const paddedAge = age.toString().padStart(2, '0');
      const paddedTerm = term.toString().padStart(2, '0');
      const code6 = `${plan}${paddedTerm}${paddedAge}`;
      setCode6Digit(code6);

      let basePremiumFinal = 0;
      let fetchedRate = 0;
      let commRate = parseInt(term) < 15 ? 0.38 : 0.48;
      if (plan === '10' || plan === '15') commRate = 0.06;

      if (isSpecialProject) {
        const result = await getRate(selectedProject.code, plan, term, age);

        if (!result?.success || result.rate <= 0) {
          setRate('Not Found');
          return;
        }
        fetchedRate = result.rate;
        setRate(fetchedRate.toString());

        if (plan === '72') {
          const factor = PLAN_72_FACTOR[mode] || 1;
          basePremiumFinal = (sa / fetchedRate) * factor * 500;
        } else {
          let adjusted = fetchedRate;
          if (['01','02','03','05'].includes(plan)) {
            if (mode === 'hly') adjusted += 1;
            if (mode === 'qly') adjusted += 2;
          } else if (['04','06','07'].includes(plan)) {
            if (mode === 'hly') adjusted -= 1;
            if (mode === 'yly') adjusted -= 2;
          } else if (plan === '08') {
            if (mode === 'hly') adjusted *= 0.525;
            if (mode === 'qly') adjusted *= 0.275;
          } else if (plan === '09') {
            if (mode === 'hly') adjusted -= 10;
            if (mode === 'yly') adjusted -= 20;
          }
          const multiplier = MODE_MULTIPLIER[mode] || 1;
          basePremiumFinal = (sa / 1000) * adjusted / multiplier;
        }
      } else {
        setRate('0');
        basePremiumFinal = sa / (12 * parseInt(term));
      }

      const roundedPremium = Math.floor(basePremiumFinal) + (basePremiumFinal % 1 >= 0.5 ? 1 : 0);
      const grossComm = roundedPremium * commRate;
      const tax = grossComm * 0.05;
      const netComm = grossComm - tax;
      const finalNet = Math.floor(roundedPremium - netComm) + ((roundedPremium - netComm) % 1 >= 0.5 ? 1 : 0);

      setPremium(roundedPremium.toString());
      setCommission(grossComm.toFixed(2));
      setNetCommission(netComm.toFixed(2));
      setNetAmount(finalNet.toString());
    };

    const timer = setTimeout(calculate, 500);
    return () => clearTimeout(timer);
  }, [selectedProject?.code, plan, term, age, sumAssured, mode]);

  // ⭐️ Agent codes validation - Now using useEffect and Redux Global Loading
  useEffect(() => {
    const faValidation = fa.replace(/[^0-9]/g, '').slice(0, 8);

    console.log('Validating FA Code:', faValidation);
    
    if (!faValidation || faValidation.length !== 8 || !selectedProject?.code) {
      setUm(''); 
      setBm(''); 
      setAgm('');
      setIsUmEditable(false);
      setIsBmEditable(false);
      setIsAgmEditable(false);
      return;
    }

    // Debounce agent validation slightly
    const timer = setTimeout(async () => {
        // ⭐️ Treat as major operation: Use Redux dispatch for global loading
        dispatch({ type: SHOW_LOADING, payload: 'Verifying agent code...' });
        
        try {
            const res = await getAgentCodes(faValidation, selectedProject.code);
            console.log('Agent verification response:', res);
            if (res.success) {
                const umVal = res.um ?? '';
                const bmVal = res.bm ?? '';
                const agmVal = res.agm ?? '';

                setUm(umVal);
                setBm(bmVal);
                setAgm(agmVal);

                setIsUmEditable(!umVal);
                setIsBmEditable(!bmVal);
                setIsAgmEditable(!agmVal);

                setIsAgentFetched(true);
                ToastAndroid.show('Agent verified!', ToastAndroid.SHORT);
            } else {
                setUm(''); 
                setBm(''); 
                setAgm('');

                setIsUmEditable(true);
                setIsBmEditable(true);
                setIsAgmEditable(true);

                setIsAgentFetched(false); 
                ToastAndroid.show('Invalid FA Code, enter codes manually', ToastAndroid.LONG);
            }
        } catch (error) {
            console.error('Agent verification error:', error);
            ToastAndroid.show('Agent verification failed.', ToastAndroid.LONG);
        } finally {
            // ⭐️ Hide Redux loading
            dispatch({ type: HIDE_LOADING });
        }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
    
  }, [fa, selectedProject?.code, dispatch]);


  const handleNomineePercent = (setter: (v: string) => void) => (text: string) => {
    const filtered = text.replace(/[^0-9]/g, '').slice(0, 3);
    setter(filtered);
  };

  const checkNomineeTotal = () => {
    const total = [nominee1Percent, nominee2Percent, nominee3Percent]
      .reduce((sum, p) => sum + parseInt(p || '0'), 0);
    if (total > 100) {
      Alert.alert('Error', 'Total nominee percentage cannot exceed 100%');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isInputDisabled) return; 

    if (!checkNomineeTotal()) return;
    if (age < 18) return Alert.alert('Error', 'Age must be 18 or above');
    if (!fatherHusbandName || !motherName || !nominee1Name || !nominee1Percent || !fa || !um)
      return Alert.alert('Error', 'Please fill all required fields including FA/UM codes');

    if (!netAmount || !code6Digit || !commission)
      return Alert.alert('Error', 'Premium calculation incomplete. Check Project, Plan, Term, Mode, SA.');

    setIsSubmitting(true);
    dispatch({ type: SHOW_LOADING, payload: 'Preparing payment...' });

    try {
        // Save to Redux instead of navigation params
        dispatch(saveFirstPremiumData({
            project: selectedProject!.label,
            projectCode: selectedProject!.code,
            code: selectedProject!.value,
            nid, entrydate, name, mobile,
            plan: `${selectedProject!.value}${plan}`,
            planlabel: selectedPlanLabel,
            age, term, mode, sumAssured,
            totalPremium, servicingCell, agentMobile,
            fa, um, bm, agm,
            rateCode: code6Digit,
            basePremium: premium,
            commission: netCommission,
            rate,
            netAmount,
            fatherHusbandName, motherName, address, district, gender,
            nominee1Name, nominee1Percent, nominee2Name, nominee2Percent,
            nominee3Name, nominee3Percent,
        }));

        navigation.navigate('PayfirstPremiumGateways');
    } catch (error) {
        Alert.alert('Error', 'Failed to prepare payment data.');
        console.error('Submission error:', error);
    } finally {
        setIsSubmitting(false);
        dispatch({ type: HIDE_LOADING });
    }
  };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Pay First Premium" />
        <ScrollView style={[globalStyle.wrapper, { margin: 10 }]}>
          <PickerComponent
            items={projects}
            value={selectedProject?.value || ''}
            setValue={(v) => {
              const p = projects.find(item => item.value === v);
              if (p) {
                setSelectedProject(p);
              }
            }}
            label="Project"
            placeholder={isProjectLoading ? "Loading projects..." : "Select a project"}
            required
            disabled={isInputDisabled} 
          />

          <Input label="NID" value={nid} onChangeText={setNid} keyboardType="numeric" required editable={!isInputDisabled} />
          <Input label="Date" value={entrydate} editable={false} />
          <EnglishOnlyInput label="Proposer's Name" value={name} onChangeText={setName} required editable={!isInputDisabled} />
          <Input label="Mobile No." value={mobile} onChangeText={setMobile} keyboardType="phone-pad" required editable={!isInputDisabled} />

          <PickerComponent
            items={plans}
            value={plan}
            setValue={setPlan}
            label="Plan"
            placeholder="Select a plan"
            required
            disabled={isInputDisabled} 
          />

          <View>
            <Text style={styles.planName}>Plan Name</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planNameScroll}>
              <Text style={styles.planNameInput}>{selectedPlanLabel || '...'}</Text>
            </ScrollView>
          </View>

          <DatePickerComponent date={dateOfBirth} setDate={setDateOfBirth} label="Birth Date" required />
          {age < 18 && <Text style={{ color: 'red', marginLeft: 15, fontWeight: 'bold' }}>
            Age: {age} years — First payment not allowed under 18
          </Text>}

          <PickerComponent
            items={terms}
            value={term}
            setValue={setTerm}
            label="Term"
            placeholder="Select a term"
            required
            disabled={isInputDisabled} 
          />


          <PickerComponent 
            items={modes} 
            value={mode} 
            setValue={setMode} 
            label="Mode" 
            placeholder="Select a mode" 
            required 
            disabled={isInputDisabled} 
          />

          <Input label="Sum Assured" value={sumAssured} onChangeText={setSumAssured} keyboardType="numeric" required editable={!isInputDisabled} />
          <Input label="Code (Auto)" value={code6Digit} editable={false} />
          <Input label="Rate" value={isSpecialProject ? rate : '0'} editable={false} />
          <Input label="Premium" value={premium ? Math.ceil(parseFloat(premium)).toString() : ''} editable={false} />
          <Input label="Commission" value={netCommission ? Math.ceil(parseFloat(netCommission)).toString() : ''} editable={false} />
          <Input label="Payment Amount" value={netAmount ? Math.ceil(parseFloat(netAmount)).toString() : ''} editable={false} />

          <Input label="Total Premium" value={totalPremium} onChangeText={setTotalPremium} keyboardType="numeric" required editable={!isInputDisabled} />
          <Input label="Servicing Cell Code" value={servicingCell} onChangeText={setServicingCell} keyboardType="numeric" required editable={!isInputDisabled} />
          <Input label="Agent Mobile" value={agentMobile} onChangeText={setAgentMobile} keyboardType="phone-pad" required editable={!isInputDisabled} />

          <Text style={styles.sectionTitle}>Personal & Nominee Details</Text>
          <EnglishOnlyInput label="Father's / Husband's Name" value={fatherHusbandName} onChangeText={setFatherHusbandName} required editable={!isInputDisabled} />
          <EnglishOnlyInput label="Mother's Name" value={motherName} onChangeText={setMotherName} required editable={!isInputDisabled} />
          <EnglishOnlyInput label="Address" value={address} onChangeText={setAddress} required multiline numberOfLines={4} textAlignVertical="top" style={{ paddingTop: 12 }} editable={!isInputDisabled} />
          <EnglishOnlyInput label="District" value={district} onChangeText={setDistrict} required editable={!isInputDisabled} />

          <Text style={{ marginLeft: 15, marginTop: 10, fontWeight: '600', color: '#000' }}>Gender</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
            {['Male', 'Female'].map(g => (
              <TouchableOpacity key={g} onPress={() => setGender(g)} style={{ flexDirection: 'row', alignItems: 'center' }} disabled={isInputDisabled}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#000', marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
                  {gender === g && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#000' }} />}
                </View>
                <Text>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Nominee Details</Text>
          <EnglishOnlyInput label="Nominee 1 Name" value={nominee1Name} onChangeText={setNominee1Name} required editable={!isInputDisabled} />
          <Input label="Nominee 1 Ratio %" value={nominee1Percent} onChangeText={handleNomineePercent(setNominee1Percent)} keyboardType="numeric" required editable={!isInputDisabled} />
          <EnglishOnlyInput label="Nominee 2 Name" value={nominee2Name} onChangeText={setNominee2Name} editable={!isInputDisabled} />
          <Input label="Nominee 2 Ratio %" value={nominee2Percent} onChangeText={handleNomineePercent(setNominee2Percent)} keyboardType="numeric" editable={!isInputDisabled} />
          <EnglishOnlyInput label="Nominee 3 Name" value={nominee3Name} onChangeText={setNominee3Name} editable={!isInputDisabled} />
          <Input label="Nominee 3 Ratio %" value={nominee3Percent} onChangeText={handleNomineePercent(setNominee3Percent)} keyboardType="numeric" editable={!isInputDisabled} />

          <Text style={styles.sectionTitle}>Code Setup</Text>
          <Input
            label="FA"
            value={fa}
            onChangeText={(text) => setFa(text.replace(/[^0-9]/g, '').slice(0, 8))}
            maxLength={8}
            keyboardType="numeric"
            required
            placeholder="Enter 8-digit FA code"
            editable={!isInputDisabled} 
          />
          <Input 
            label="UM" 
            value={um} 
            onChangeText={setUm}
            editable={isUmEditable && !isInputDisabled}
            style={{
              backgroundColor: isUmEditable && !isInputDisabled ? '#ffffff' : '#f0f0f0'
            }}
          />
          <Input 
            label="BM" 
            value={bm} 
            onChangeText={setUm}
            editable={isBmEditable && !isInputDisabled}
            style={{
              backgroundColor: isBmEditable && !isInputDisabled ? '#ffffff' : '#f0f0f0'
            }}
          />
          <Input 
            label="AGM" 
            value={agm} 
            onChangeText={setUm}
            editable={isAgmEditable && !isInputDisabled}
            style={{
              backgroundColor: isAgmEditable && !isInputDisabled ? '#ffffff' : '#f0f0f0'
            }}
          />

          <FilledButton 
            title={isSubmitting ? 'Preparing Payment...' : 'Submit'} 
            onPress={handleSubmit} 
            style={styles.submitButton} 
            disabled={isInputDisabled || !selectedProject} 
          />
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  planName: { color: 'black', marginBottom: 10 },
  planNameScroll: { marginBottom: 10, borderWidth: 1, borderColor: '#000', borderRadius: 7, backgroundColor: '#E0E0E0' },
  planNameInput: { padding: 15, fontSize: 14, color: '#333' },
  submitButton: { marginVertical: 20 },
});

export default PayFirstPremiumScreen;