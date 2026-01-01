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
  KeyboardAvoidingView,
  Platform
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
import InfoModal from '../../../components/InfoModal';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFaFormatModal, setShowFaFormatModal] = useState(false);
  const [faExample, setFaExample] = useState('');
  const [installments, setInstallments] = useState<'6' | '12' | ''>('');
  const [feOeOption, setFeOeOption] = useState<'F/E' | 'O/E' | ''>('');
  const [feOeAmount, setFeOeAmount] = useState<string>('0');
  const feOeOptions = ['F/E', 'O/E'] as const;


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

      if (!selectedProject?.code || !plan || !term || age < 0 || !sumAssured || !mode || !installments || !feOeOption) return;

      const sa = parseFloat(sumAssured);
      const paddedAge = age.toString().padStart(2, '0');
      const paddedTerm = term.toString().padStart(2, '0');
      const code6 = `${plan}${paddedTerm}${paddedAge}`;
      setCode6Digit(code6);

      let basePremiumFinal = 0;
      let fetchedRate = 0;
      let extraCharge = 0;

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
          if (['01', '02', '03', '05'].includes(plan)) {
            if (mode === 'hly') adjusted += 1;
            if (mode === 'qly') adjusted += 2;
          } else if (['04', '06', '07'].includes(plan)) {
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

      let adjustedPremium = basePremiumFinal;

      if (mode === 'mly' && installments) {
        const multiplier = installments === '6' ? 6 : 12;
        adjustedPremium = basePremiumFinal * multiplier;
      }

      if (feOeOption && adjustedPremium > 0) {
        const ratePerThousand = feOeOption === 'F/E' ? 3 : 2;
        extraCharge = Math.floor((adjustedPremium / 1000) * ratePerThousand);
      }

      setFeOeAmount(extraCharge.toString());

      const roundedPremium = Math.floor(adjustedPremium) + (adjustedPremium % 1 >= 0.5 ? 1 : 0);
      const grossComm = roundedPremium * commRate;
      const tax = grossComm * 0.05;
      const netComm = grossComm - tax;
      const finalNet = Math.floor(roundedPremium - netComm) + ((roundedPremium - netComm) % 1 >= 0.5 ? 1 : 0) + extraCharge;
      const finalTotalPremium = roundedPremium + extraCharge;

      setPremium(roundedPremium.toString());
      setCommission(grossComm.toFixed(2));
      setNetCommission(netComm.toFixed(2));
      setNetAmount(finalNet.toString());
      setTotalPremium(finalTotalPremium.toString());
    };

    const timer = setTimeout(calculate, 500);
    return () => clearTimeout(timer);
  }, [selectedProject?.code, plan, term, age, sumAssured, mode, installments, feOeOption,]);

  useEffect(() => {
    if (!fa) return;

    const digitsOnly = fa.replace(/[^0-9]/g, '');

    // Only warn if user stopped typing & length is between 1–7
    if (digitsOnly.length > 0 && digitsOnly.length < 8) {
      const timer = setTimeout(() => {
        setFaExample(`${digitsOnly} -> ${digitsOnly.padStart(8, '0')}`);
        setShowFaFormatModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fa]);


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

  const normalize6DigitCode = (value?: string | null): string | null => {
    if (!value || value.trim() === '') return null;

    const digitsOnly = value.replace(/[^0-9]/g, '');

    if (digitsOnly.length === 0) return null;

    return digitsOnly.padStart(6, '0');
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nid) newErrors.nid = 'NID is required';
    if (!name) newErrors.name = 'Proposer name is required';
    if (!mobile) newErrors.mobile = 'Mobile number is required';

    if (!selectedProject) newErrors.project = 'Project is required';
    if (!plan) newErrors.plan = 'Plan is required';
    if (!term) newErrors.term = 'Term is required';
    if (!mode) newErrors.mode = 'Mode is required';

    if (!sumAssured) newErrors.sumAssured = 'Sum Assured is required';
    if (!feOeOption) newErrors.feOeOption = 'F/E or O/E option is required';
    if (!servicingCell) newErrors.servicingCell = 'Servicing Cell is required';
    if (!agentMobile) newErrors.agentMobile = 'Agent Mobile is required';

    if (!fatherHusbandName) newErrors.fatherHusbandName = 'Father/Husband name is required';
    if (!motherName) newErrors.motherName = 'Mother name is required';
    if (age < 18) newErrors.dateOfBirth = 'Age must be 18 or above';
    if (!address) newErrors.address = 'Address is required';
    if (!district) newErrors.district = 'District is required';
    if (!gender) newErrors.gender = 'Gender is required';


    if (!fa) newErrors.fa = 'FA code is required';
    if (fa && fa.length < 8) newErrors.fa = 'FA must be 8 digits';

    if (!nominee1Name) newErrors.nominee1Name = 'Nominee name is required';
    if (!nominee1Percent) newErrors.nominee1Percent = 'Nominee percentage is required';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async () => {
    if (isInputDisabled) return;

    if (!validateForm()) {
      ToastAndroid.show('Please fix the highlighted fields', ToastAndroid.SHORT);
      return;
    }

    if (!checkNomineeTotal()) return;
    if (age < 18) return Alert.alert('Error', 'Age must be 18 or above');
    if (!fatherHusbandName || !motherName || !nominee1Name || !nominee1Percent || !fa)
      return Alert.alert('Error', 'Please fill all required fields including FA code');

    const normalizedUM = normalize6DigitCode(um);
    const normalizedBM = normalize6DigitCode(bm);
    const normalizedAGM = normalize6DigitCode(agm);

    if (!netAmount || !code6Digit || !commission || netAmount === '0')
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
        fa,
        um: normalizedUM,
        bm: normalizedBM,
        agm: normalizedAGM,
        rateCode: code6Digit,
        basePremium: premium,
        commission: netCommission,
        rate,
        netAmount,
        fatherHusbandName, motherName, address, district, gender,
        nominee1Name, nominee1Percent, nominee2Name, nominee2Percent,
        nominee3Name, nominee3Percent,
        feOeOption,
        feOeAmount,
        installments: mode === 'mly' ? installments : null,
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
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
            {errors.project && <Text style={styles.error}>{errors.project}</Text>}

            <Input label="NID" value={nid} onChangeText={setNid} keyboardType="numeric" required editable={!isInputDisabled} />
            {errors.nid && <Text style={styles.error}>{errors.nid}</Text>}
            <Input label="Date" value={entrydate} editable={false} />
            <EnglishOnlyInput label="Proposer's Name" value={name} onChangeText={setName} required editable={!isInputDisabled} />
            {errors.name && <Text style={styles.error}>{errors.name}</Text>}
            <Input label="Mobile No." value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={11} required editable={!isInputDisabled} />
            {errors.mobile && <Text style={styles.error}>{errors.mobile}</Text>}

            <PickerComponent
              items={plans}
              value={plan}
              setValue={setPlan}
              label="Plan"
              placeholder="Select a plan"
              required
              disabled={isInputDisabled}
            />
            {errors.plan && <Text style={styles.error}>{errors.plan}</Text>}

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
            {errors.term && <Text style={styles.error}>{errors.term}</Text>}


            <PickerComponent
              items={modes}
              value={mode}
              setValue={setMode}
              label="Mode"
              placeholder="Select a mode"
              required
              disabled={isInputDisabled}
            />
            {errors.mode && <Text style={styles.error}>{errors.mode}</Text>}

            {mode === 'mly' && (
              <>
                <PickerComponent
                  items={[
                    { label: '6', value: '6' },
                    { label: '12', value: '12' },
                  ]}
                  value={installments}
                  setValue={setInstallments}
                  label="Installments"
                  placeholder="Select installments"
                  required
                  disabled={isInputDisabled}
                />
                {errors.installments && <Text style={styles.error}>{errors.installments}</Text>}
              </>
            )}

            <Input label="Sum Assured" value={sumAssured} onChangeText={setSumAssured} keyboardType="numeric" required editable={!isInputDisabled} />
            {errors.sumAssured && <Text style={styles.error}>{errors.sumAssured}</Text>}

            <Text style={styles.sectionTitle}>Extra Charge</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
              {feOeOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setFeOeOption(option)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  disabled={isInputDisabled}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#0066CC', marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
                    {feOeOption === option && <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#0066CC' }} />}
                  </View>
                  <Text style={{ fontSize: 16 }}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.feOe && <Text style={styles.error}>{errors.feOe}</Text>}

            <Text style={styles.sectionTitle}>Premium Details (Auto Calculated)</Text>
            <Input label="Code (Auto)" value={code6Digit} editable={false} />
            <Input label="Rate" value={isSpecialProject ? rate : '0'} editable={false} />
            <Input label="Premium" value={premium ? Math.ceil(parseFloat(premium)).toString() : ''} editable={false} />
            <Input label="F/E or O/E Amount" value={feOeAmount} editable={false} />
            <Input label="Commission" value={netCommission ? Math.ceil(parseFloat(netCommission)).toString() : ''} editable={false} />
            <Input label="Payment Amount" value={netAmount ? Math.ceil(parseFloat(netAmount)).toString() : ''} editable={false} />


            <Input label="Total Premium" value={totalPremium ? Math.ceil(parseFloat(totalPremium)).toString() : ''} editable={false} />
            <Input label="Servicing Cell Code" value={servicingCell} onChangeText={setServicingCell} maxLength={10} keyboardType="numeric" required editable={!isInputDisabled} />
            {errors.servicingCell && <Text style={styles.error}>{errors.servicingCell}</Text>}
            <Input label="Agent Mobile" value={agentMobile} onChangeText={setAgentMobile} keyboardType="phone-pad" maxLength={11} required editable={!isInputDisabled} />
            {errors.agentMobile && <Text style={styles.error}>{errors.agentMobile}</Text>}
            <Text style={styles.sectionTitle}>Personal & Nominee Details</Text>
            <EnglishOnlyInput label="Father's / Husband's Name" value={fatherHusbandName} onChangeText={setFatherHusbandName} required editable={!isInputDisabled} />
            {errors.fatherHusbandName && <Text style={styles.error}>{errors.fatherHusbandName}</Text>}
            <EnglishOnlyInput label="Mother's Name" value={motherName} onChangeText={setMotherName} required editable={!isInputDisabled} />
            {errors.motherName && <Text style={styles.error}>{errors.motherName}</Text>}
            <EnglishOnlyInput label="Address" value={address} onChangeText={setAddress} required multiline numberOfLines={4} textAlignVertical="top" style={{ paddingTop: 12 }} editable={!isInputDisabled} />
            {errors.address && <Text style={styles.error}>{errors.address}</Text>}
            <EnglishOnlyInput label="District" value={district} onChangeText={setDistrict} required editable={!isInputDisabled} />
            {errors.district && <Text style={styles.error}>{errors.district}</Text>}

            <Text style={{ marginLeft: 15, marginTop: 10, fontWeight: '600', color: '#000' }}>Gender</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
              {['Male', 'Female'].map(g => (
                <TouchableOpacity key={g}
                  onPress={() => {
                    setGender(g);
                    setErrors(prev => ({ ...prev, gender: '' }));
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center' }} disabled={isInputDisabled}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#000', marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
                    {gender === g && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#000' }} />}
                  </View>
                  <Text>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && (<Text style={styles.error}>{errors.gender}</Text>)}

            <Text style={styles.sectionTitle}>Nominee Details</Text>
            <EnglishOnlyInput label="Nominee 1 Name" value={nominee1Name} onChangeText={setNominee1Name} required editable={!isInputDisabled} />
            {errors.nominee1Name && <Text style={styles.error}>{errors.nominee1Name}</Text>}
            <Input label="Nominee 1 Ratio %" value={nominee1Percent} onChangeText={handleNomineePercent(setNominee1Percent)} keyboardType="numeric" required editable={!isInputDisabled} />
            {errors.nominee1Percent && (<Text style={styles.error}>{errors.nominee1Percent}</Text>)}

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
            {errors.fa && <Text style={styles.error}>{errors.fa}</Text>}

            <Input
              label="UM"
              value={um}
              onChangeText={setUm}
              maxLength={6}
              keyboardType="numeric"
              editable={isUmEditable && !isInputDisabled}
              style={{
                backgroundColor: isUmEditable && !isInputDisabled ? '#ffffff' : '#f0f0f0'
              }}
            />
            <Input
              label="BM"
              value={bm}
              onChangeText={setBm}
              maxLength={6}
              keyboardType="numeric"
              editable={isBmEditable && !isInputDisabled}
              style={{
                backgroundColor: isBmEditable && !isInputDisabled ? '#ffffff' : '#f0f0f0'
              }}
            />
            <Input
              label="AGM"
              value={agm}
              onChangeText={setAgm}
              maxLength={6}
              keyboardType="numeric"
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
          <InfoModal
            visible={showFaFormatModal}
            onClose={() => setShowFaFormatModal(false)}
            title="FA Code Format"
            message={`FA code must be exactly 8 digits.\n\nMissing digits will be filled with leading zeros.\n\nExample:\n${faExample}`}
            buttonText="OK"
          />
        </ImageBackground>
      </KeyboardAvoidingView>
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
  error: {
    color: 'red',
    marginTop: 4,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  modalButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default PayFirstPremiumScreen;