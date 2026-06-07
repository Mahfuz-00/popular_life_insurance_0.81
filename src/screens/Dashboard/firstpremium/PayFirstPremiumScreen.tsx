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
import { fetchProjects, getAgentCodes, getRate } from '../../../actions/userActions';
import { getPlanList, getTermList } from '../../../actions/calculatePremiumActions';
import EnglishOnlyInput from '../../../components/input/EnglishOnlyInput';
import { saveFirstPremiumData } from '../../../actions/payFirstPremiumActions';
import { SHOW_LOADING, HIDE_LOADING } from '../../../store/constants/commonConstants';
import InfoModal from '../../../components/InfoModal';
import { PRIMARY_BUTTON_BG } from '../../../store/constants/colorConstants';

// Constants
const SPECIAL_PROJECTS = ['ABA', 'AKOK', 'ALA', 'IA', 'JBA', 'JBAK', 'IBT'];
const MODE_MULTIPLIER: Record<string, number> = { yly: 1, hly: 2, qly: 4, mly: 12, single: 1 };
const PLAN_72_FACTOR: Record<string, number> = { mly: 1, qly: 3, hly: 6, yly: 12, single: 1 };
const PROJECT_LABEL_MAP: Record<string, string> = {
  'Islami Bima Khudra': 'IDPS',
  'Popular DPS Khudra': 'PDPS',
  'Janapriya Bima Khudra': 'Janapriya Bima',
  'Alamin Bima Khudra': 'Alamin Bima',
};
const PLAN_72_COMMISSION: Record<string, number> = {
  '06': 0.156, '07': 0.182, '08': 0.208, '09': 0.234, '10': 0.286,
  '11': 0.286, '12': 0.286, '13': 0.286, '14': 0.286, '15': 0.286,
  '16': 0.286, '17': 0.286, '18': 0.286, '19': 0.286, '20': 0.286,
  '21': 0.286, '22': 0.286, '23': 0.286, '24': 0.286, '25': 0.286,
};

interface ProjectItem {
  label: string;
  value: string | number;
  code: string;
}

interface PlanItem {
  label: string;
  value: string;
  fullLabel?: string;
  modes?: { label: string; value: string }[];
}

const PayFirstPremiumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();

  // Selection State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [allPlans, setAllPlans] = useState<PlanItem[]>([]);
  const [terms, setTerms] = useState<{ label: string; value: string }[]>([]);
  const [modes, setModes] = useState<{ label: string; value: string }[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    nid: '', name: '', childName: '', mobile: '', plan: '', term: '', mode: '',
    sumAssured: '', servicingCell: '', agentMobile: '', fatherHusbandName: '',
    motherName: '', address: '', district: '', gender: '', guardianName: '',
    nominee1Name: '', nominee1Percent: '', nominee2Name: '', nominee2Percent: '',
    nominee3Name: '', nominee3Percent: '', fa: '', um: '', bm: '', agm: '',
    installments: '0' as String, feOeOption: '' as 'F/E' | 'O/E' | ''
  });

  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date('1990-01-01'));
  const [age, setAge] = useState<number>(0);
  const [selectedPlanLabel, setSelectedPlanLabel] = useState<string>('');

  // Calculated State
  const [calculated, setCalculated] = useState({
    code6Digit: '0', rate: '0', premium: '0', basePremium: '0',
    commission: '0', netCommission: '0', netAmount: '0', totalPremium: '0',
    feOeAmount: '0', extraCharge: '0', finalInstallment: 0,
    faCommission: '0', umCommission: '0', bmCommission: '0'  
  });

  // UI State
  const [loading, setLoading] = useState({ isSubmitting: false, isProjectLoading: true });
  const [editable, setEditable] = useState({ um: false, bm: false, agm: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFaFormatModal, setShowFaFormatModal] = useState(false);
  const [faExample, setFaExample] = useState('');
  const [isAgentFetched, setIsAgentFetched] = useState<boolean>(true);

  const entrydate = moment().format('YYYY-MM-DD');
  const isSpecialProject = selectedProject?.code ? SPECIAL_PROJECTS.includes(selectedProject.code) : false;
  const isInputDisabled = loading.isSubmitting || loading.isProjectLoading;
 

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateCalculated = (updates: Partial<typeof calculated>) => {
    setCalculated(prev => ({ ...prev, ...updates }));
  };

  const decimalTwoDigit = (num: number): number => Math.floor(num * 100) / 100;

  const getInstallmentNumber = () => {
    if (formData.mode === 'mly') {
      const val = parseInt(formData.installments.toString(), 10);
      return isNaN(val) || val <= 0 ? 1 : val;
    }
    return 1;
  };


  // Initialize projects and plans
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(prev => ({ ...prev, isProjectLoading: true }));

      const projectRes = await fetchProjects();
      if (projectRes?.data) {
        const formatted = projectRes.data.map((p: any) => ({
          label: PROJECT_LABEL_MAP[p.name] ?? p.name,
          value: p.id,
          code: p.code,
        }));
        setProjects(formatted);
      }

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
        setAllPlans(formattedPlans);
        setPlans(formattedPlans);
      }

      setLoading(prev => ({ ...prev, isProjectLoading: false }));
    };
    loadInitialData();
  }, []);

  // Filter plans based on project
  useEffect(() => {
    if (loading.isProjectLoading || !selectedProject?.code) {
      setPlans(allPlans);
      return;
    }

    if (!SPECIAL_PROJECTS.includes(selectedProject.code)) {
      const filtered = allPlans.filter(p => ['28', '57', '72'].includes(p.value));
      setPlans(filtered);
      if (formData.plan && !filtered.some(p => p.value === formData.plan)) {
        updateFormData({ plan: '', mode: '' });
        setModes([]);
      }
    } else {
      setPlans(allPlans);
    }
  }, [selectedProject?.code, allPlans, loading.isProjectLoading]);

  // Reset on project change
  useEffect(() => {
    updateFormData({ plan: '', mode: '', term: '', feOeOption: '' });
    setModes([]);
    setTerms([]);
  }, [selectedProject?.code]);

  // Update modes when plan changes
  useEffect(() => {
    const selected = plans.find(p => p.value === formData.plan);
    if (selected) {
      setSelectedPlanLabel(selected.fullLabel || '');
      setModes(selected.modes || []);
      console.log('Available modes for selected plan:', selected.modes);
      updateFormData({ mode: '' });
    } else {
      setSelectedPlanLabel('');
      setModes([]);
    }
  }, [formData.plan, plans]);

  // Fetch terms
  useEffect(() => {
    const loadTerms = async () => {
      if (!formData.plan || loading.isProjectLoading) {
        setTerms([]);
        updateFormData({ term: '' });
        return;
      }

      dispatch({ type: SHOW_LOADING, payload: 'Loading terms...' });

      try {
        const res = await getTermList(formData.plan);
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
          if (Platform.OS === 'android') {
            ToastAndroid.show('No term available for this plan', ToastAndroid.LONG);
          } else {
            Alert.alert('Info', 'No term available for this plan');
          }
        }
      } catch (error) {
        console.error('Failed to load terms:', error);
        setTerms([]);
        if (Platform.OS === 'android') {
          ToastAndroid.show('Failed to load terms', ToastAndroid.SHORT);
        } else {
          Alert.alert('Error', 'Failed to load terms');
        }
      } finally {
        dispatch({ type: HIDE_LOADING });
      }
    };

    loadTerms();
  }, [formData.plan, dispatch, loading.isProjectLoading]);

  // Calculate age
  useEffect(() => {
    if (!dateOfBirth) return;

    const birth = moment(dateOfBirth);
    const today = moment();
    const years = today.diff(birth, 'years');
    const lastBirthday = birth.clone().add(years, 'years');
    const months = today.diff(lastBirthday, 'months');
    const roundedAge = months >= 6 ? years + 1 : years;

    setAge(roundedAge);
  }, [dateOfBirth]);

  // Reset only calculation values
  const resetCalculated = useCallback(() => {
    updateCalculated({
      code6Digit: '0',
      rate: '0',
      premium: '0',
      basePremium: '0',
      commission: '0',
      netCommission: '0',
      netAmount: '0',
      totalPremium: '0',
      feOeAmount: '0',
      extraCharge: '0',
      finalInstallment: 0,
      faCommission: '0', umCommission: '0', bmCommission: '0'
    });
  }, []);

  // Hierarchical reset effect
  useEffect(() => {
    // Project changed → reset plan, term, mode, sumAssured, feOe
    updateFormData({ plan: '', term: '', mode: '', sumAssured: '', feOeOption: '', installments: '' });
    setModes([]);
    setTerms([]);
    resetCalculated();
  }, [selectedProject?.code]);

  useEffect(() => {
    // Plan changed → reset term, mode, sumAssured, feOe
    updateFormData({ term: '', mode: '', sumAssured: '', feOeOption: '', installments: '' });
    setTerms([]);
    resetCalculated();
  }, [formData.plan]);

  // Premium calculation
  useEffect(() => {
    const calculate = async () => {
      if (!selectedProject?.code || !formData.plan || !formData.term || age < 8 || !formData.sumAssured || !formData.mode || 
        !formData.fa || formData.fa.length !== 8 || !formData.bm || !formData.um ) return;

      dispatch({ type: SHOW_LOADING, payload: 'Calculating premium...' });

      const rateAge = age < 18 ? 18 : age;
      const sa = parseFloat(formData.sumAssured);
      const code6 = `${formData.plan}${formData.term.padStart(2, '0')}${rateAge.toString().padStart(2, '0')}`;

      let basePremiumFinal = 0;
      let fetchedRate = 0;
      let extraCharge = 0;
      // let commRate = parseInt(formData.term) < 15 ? 0.38 : 0.48;
      const termNum = parseInt(formData.term);
      const isPlan72 = formData.plan === '72';
      let faComm = 0, umComm = 0, bmComm = 0;

      // if (formData.plan === '10' || formData.plan === '15') commRate = 0.06;
      // if (formData.plan === '72') commRate = PLAN_72_COMMISSION[formData.term] ?? 0;

      // Plan 72 calculation
      if (formData.plan === '72') {
        const result = await getRate(selectedProject.code, formData.plan, formData.term, rateAge);
        if (!result?.success || result.rate <= 0) {
          dispatch({ type: HIDE_LOADING });
          updateCalculated({ rate: 'Not Found' });
          return;
        }

        fetchedRate = result.rate;
        const factor = PLAN_72_FACTOR[formData.mode] || 1;
        const basePremiumDecimal = decimalTwoDigit(sa / fetchedRate);
        basePremiumFinal = decimalTwoDigit(basePremiumDecimal * factor * 500);
      } else {
        // Other plans calculation
        if (isSpecialProject) {
          const result = await getRate(selectedProject.code, formData.plan, formData.term, rateAge);
          if (!result?.success || result.rate <= 0) {
            dispatch({ type: HIDE_LOADING });
            updateCalculated({ rate: 'Not Found' });
            return;
          }

          fetchedRate = result.rate;
          let adjusted = fetchedRate;

          // Mode adjustments
          if (['01', '02', '03', '05'].includes(formData.plan)) {
            if (formData.mode === 'hly') adjusted += 1;
            if (formData.mode === 'qly') adjusted += 2;
          } else if (['04', '06', '07'].includes(formData.plan)) {
            if (formData.mode === 'hly') adjusted -= 1;
            if (formData.mode === 'yly') adjusted -= 2;
          } else if (formData.plan === '08') {
            if (formData.mode === 'hly') adjusted *= 0.525;
            if (formData.mode === 'qly') adjusted *= 0.275;
          } else if (formData.plan === '09') {
            if (formData.mode === 'hly') adjusted -= 10;
            if (formData.mode === 'yly') adjusted -= 20;
          }

          const multiplier = MODE_MULTIPLIER[formData.mode] || 1;
          basePremiumFinal = decimalTwoDigit(decimalTwoDigit(sa / 1000) * adjusted / multiplier);
        } else {
          basePremiumFinal = decimalTwoDigit(sa / (12 * parseInt(formData.term)));
        }
      }

      // Extra charge calculation
      if (formData.feOeOption && sa > 0) {
        const ratePerThousand = formData.feOeOption === 'F/E' ? 3 : 2;
        const annualExtra = (sa / 1000) * ratePerThousand;

        let monthsPaid = 12;
        if (formData.mode === 'hly') monthsPaid = 6;
        else if (formData.mode === 'qly') monthsPaid = 3;
        else if (formData.mode === 'mly' && formData.installments)
          monthsPaid = 1;
        // monthsPaid = Number(formData.installments);

        extraCharge = Math.round((annualExtra / 12) * monthsPaid);
      }

      const roundedPremium = Math.floor(basePremiumFinal) + (basePremiumFinal % 1 >= 0.5 ? 1 : 0);
      const installmentNumber = getInstallmentNumber();
      const totalPremiumBeforeInstallment = roundedPremium + extraCharge;
      console.log('Total Premium Before Installment Multiplier:', totalPremiumBeforeInstallment);

      const totalPremiumBeforeCommission = roundedPremium * installmentNumber;
      console.log('Total Premium Before Commission:', totalPremiumBeforeCommission);
      if (isPlan72) {
        faComm = totalPremiumBeforeCommission * 0.22;
        console.log('FA Commission:', faComm);
        umComm = totalPremiumBeforeCommission * 0.066;
        console.log('UM Commission:', umComm);
        bmComm = totalPremiumBeforeCommission * 0.044;
        console.log('BM Commission:', bmComm);
      } else {
        const faRate = termNum < 15 ? 0.25 : 0.35;
        faComm = totalPremiumBeforeCommission * faRate;
        console.log('FA Commission:', faComm);
        umComm = totalPremiumBeforeCommission * 0.13;
        console.log('UM Commission:', umComm);
        bmComm = totalPremiumBeforeCommission * 0.08;
        console.log('BM Commission:', bmComm);
      }
      // const grossComm = totalPremiumBeforeCommission * commRate;
      const grossComm = faComm + umComm + bmComm;
      console.log('Gross Commission:', grossComm);
      const tax = grossComm * 0.05;
      console.log('Tax on Commission:', tax);
      const netComm = grossComm - tax;
      console.log('Net Commission:', netComm);

      // NEW: Distribute Net Commission proportionally
      let faCommission = 0;
      let umCommission = 0;
      let bmCommission = 0;

      if (isPlan72) {
        const totalRatio = 0.22 + 0.066 + 0.044; // 0.33
        faCommission = netComm * (0.22 / totalRatio);
        umCommission = netComm * (0.066 / totalRatio);
        bmCommission = netComm * (0.044 / totalRatio);
      } else {
        const totalRatio = 0.25 + 0.13 + 0.08; // 0.46
        faCommission = netComm * (0.25 / totalRatio);
        umCommission = netComm * (0.13 / totalRatio);
        bmCommission = netComm * (0.08 / totalRatio);
      }


      let netCommRounded = Math.floor(netComm) + (netComm % 1 >= 0.5 ? 1 : 0);
      let finalNet = Math.floor(totalPremiumBeforeCommission - netComm) + ((totalPremiumBeforeCommission - netComm) % 1 >= 0.5 ? 1 : 0) + extraCharge;

      const finalTotalPremium = totalPremiumBeforeCommission + extraCharge;

      updateCalculated({
        code6Digit: code6,
        rate: fetchedRate.toString(),
        premium: roundedPremium.toString(),
        commission: grossComm.toFixed(2),
        netCommission: netCommRounded.toFixed(2),
        netAmount: finalNet.toString(),
        totalPremium: totalPremiumBeforeInstallment.toString(),
        feOeAmount: extraCharge.toString(),
        extraCharge: extraCharge.toString(),
        finalInstallment: installmentNumber,
        faCommission: Math.round(faCommission).toString(),
        umCommission: Math.round(umCommission).toString(),
        bmCommission: Math.round(bmCommission).toString()
      });

      dispatch({ type: HIDE_LOADING });
    };

    const timer = setTimeout(calculate, 500);
    return () => clearTimeout(timer);
  }, [selectedProject?.code, formData.plan, formData.term, age, formData.sumAssured, formData.mode, formData.installments, formData.feOeOption, formData.fa, formData.um, formData.bm]);

  // FA code format warning
  useEffect(() => {
    if (!formData.fa) return;
    const digitsOnly = formData.fa.replace(/[^0-9]/g, '');

    if (digitsOnly.length > 0 && digitsOnly.length < 8) {
      const timer = setTimeout(() => {
        setFaExample(`${digitsOnly} -> ${digitsOnly.padStart(8, '0')}`);
        setShowFaFormatModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formData.fa]);

  // Agent code validation
  useEffect(() => {
    const faValidation = formData.fa.replace(/[^0-9]/g, '').slice(0, 8);

    if (!faValidation || faValidation.length !== 8 || !selectedProject?.code) {
      updateFormData({ um: '', bm: '', agm: '' });
      setEditable({ um: false, bm: false, agm: false });
      return;
    }

    const timer = setTimeout(async () => {
      dispatch({ type: SHOW_LOADING, payload: 'Verifying agent code...' });

      try {
        const res = await getAgentCodes(faValidation, selectedProject.code);
        if (res.success) {
          const umVal = res.um ?? '';
          const bmVal = res.bm ?? '';
          const agmVal = res.agm ?? '';

          updateFormData({ um: umVal, bm: bmVal, agm: agmVal });
          setEditable({ um: !umVal, bm: !bmVal, agm: !agmVal });
          setIsAgentFetched(true);
          if (Platform.OS === 'android') {
            ToastAndroid.show('Agent verified!', ToastAndroid.SHORT);
          } else {
            Alert.alert('Success', 'Agent verified!');
          }
        } else {
          updateFormData({ um: '', bm: '', agm: '' });
          setEditable({ um: true, bm: true, agm: true });
          setIsAgentFetched(false);
          if (Platform.OS === 'android') {
            ToastAndroid.show('Invalid FA Code, enter codes manually', ToastAndroid.LONG);
          } else {
            Alert.alert('Error', 'Invalid FA Code, please enter agent codes manually');
          }
        }
      } catch (error) {
        console.error('Agent verification error:', error);
        if (Platform.OS === 'android') {
          ToastAndroid.show('Agent verification failed.', ToastAndroid.LONG);
        } else {
          Alert.alert('Error', 'Agent verification failed. Please try again.');
        }
      } finally {
        dispatch({ type: HIDE_LOADING });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.fa, selectedProject?.code, dispatch]);

  const handleNomineePercent = (field: 'nominee1Percent' | 'nominee2Percent' | 'nominee3Percent') => (text: string) => {
    updateFormData({ [field]: text.replace(/[^0-9]/g, '').slice(0, 3) });
  };

  const checkNomineeTotal = () => {
    const total = [formData.nominee1Percent, formData.nominee2Percent, formData.nominee3Percent]
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
    return digitsOnly.length === 0 ? null : digitsOnly.padStart(6, '0');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nid) newErrors.nid = 'NID/Birth Reg/Passport is required';
    if (formData.nid.includes(' ')) newErrors.nid = 'NID must not contain spaces';
    if (!formData.name) newErrors.name = 'Proposer name is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    if (!selectedProject) newErrors.project = 'Project is required';
    if (!formData.plan) newErrors.plan = 'Plan is required';
    if (!formData.term) newErrors.term = 'Term is required';
    if (!formData.mode) newErrors.mode = 'Mode is required';
    if (!formData.sumAssured) newErrors.sumAssured = 'Sum Assured is required';
    if (!formData.servicingCell) newErrors.servicingCell = 'Servicing Cell is required';
    if (!formData.agentMobile) newErrors.agentMobile = 'Agent Mobile is required';
    if (!formData.fatherHusbandName) newErrors.fatherHusbandName = 'Father/Husband name is required';
    if (!formData.motherName) newErrors.motherName = 'Mother name is required';
    if (age < 8) newErrors.dateOfBirth = 'Age must be 8 or above';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.fa) newErrors.fa = 'FA code is required';
    if (formData.fa && formData.fa.length !== 8) newErrors.fa = 'FA must be 8 digits';
    if (!formData.um) newErrors.um = 'UM code is required';
    if (!formData.bm) newErrors.bm = 'BM code is required';
    if (!formData.nominee1Name) newErrors.nominee1Name = 'Nominee name is required';
    if (!formData.nominee1Percent) newErrors.nominee1Percent = 'Nominee percentage is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const installmentPremiumValue = React.useMemo(() => {
    const count = formData.mode === 'mly' ? Number(formData.installments || 1) : calculated.finalInstallment || 1;
    return (Number(calculated.totalPremium || 0) * count).toString();
  }, [formData.plan, calculated.totalPremium, formData.installments, calculated.finalInstallment, calculated.basePremium, calculated.feOeAmount, formData.mode]);

  const handleSubmit = async () => {
    if (isInputDisabled || !validateForm() || !checkNomineeTotal()) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please fix the highlighted fields', ToastAndroid.SHORT);
      } else {
        Alert.alert('Alert', 'Please fix the highlighted fields');
      }
      return;
    }

    if (age < 8 || !formData.fatherHusbandName || !formData.motherName || !formData.nominee1Name || !formData.nominee1Percent || !formData.fa) {
      return Alert.alert('Error', 'Please fill all required fields including FA code');
    }

    if (!calculated.netAmount || !calculated.code6Digit || !calculated.commission || calculated.netAmount === '0') {
      return Alert.alert('Error', 'Premium calculation incomplete. Check Project, Plan, Term, Mode, SA.');
    }

    setLoading(prev => ({ ...prev, isSubmitting: true }));
    dispatch({ type: SHOW_LOADING, payload: 'Preparing payment...' });

    try {
      dispatch(saveFirstPremiumData({
        project: selectedProject!.label,
        projectCode: selectedProject!.code,
        code: selectedProject!.value,
        nid: formData.nid,
        entrydate,
        name: formData.name,
        childName: formData.childName,
        mobile: formData.mobile,
        plan: formData.plan,
        planlabel: selectedPlanLabel,
        age,
        term: formData.term,
        mode: formData.mode,
        sumAssured: formData.sumAssured,
        totalPremium: calculated.totalPremium,
        servicingCell: formData.servicingCell,
        agentMobile: formData.agentMobile,
        fa: formData.fa,
        um: normalize6DigitCode(formData.um),
        bm: normalize6DigitCode(formData.bm),
        agm: normalize6DigitCode(formData.agm),
        rateCode: calculated.code6Digit,
        basePremium: calculated.premium,
        commission: calculated.netCommission,
        fa_commission: calculated.faCommission || '0',
        um_commission: calculated.umCommission || '0',
        bm_commission: calculated.bmCommission || '0',
        rate: calculated.rate,
        netAmount: calculated.netAmount,
        fatherHusbandName: formData.fatherHusbandName,
        motherName: formData.motherName,
        address: formData.address,
        district: formData.district,
        gender: formData.gender,
        nominee1Name: formData.nominee1Name,
        nominee1Percent: formData.nominee1Percent,
        nominee2Name: formData.nominee2Name,
        nominee2Percent: formData.nominee2Percent,
        nominee3Name: formData.nominee3Name,
        nominee3Percent: formData.nominee3Percent,
        feOeOption: formData.feOeOption,
        feOeAmount: calculated.feOeAmount,
        installments: formData.mode === 'mly' ? formData.installments : 1,
        installmentPremium: installmentPremiumValue.toString(),
        guardianName: formData.guardianName
      }));

      navigation.navigate('PayfirstPremiumGateways');
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare payment data.');
      console.error('Submission error:', error);
    } finally {
      setLoading(prev => ({ ...prev, isSubmitting: false }));
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
            {/* Project Selection */}
            <PickerComponent
              items={projects}
              value={selectedProject?.value || ''}
              setValue={(v) => {
                const p = projects.find(item => item.value === v);
                if (p) setSelectedProject(p);
              }}
              label="Project"
              placeholder={loading.isProjectLoading ? "Loading projects..." : "Select a project"}
              required
              disabled={isInputDisabled}
            />
            {errors.project && <Text style={styles.error}>{errors.project}</Text>}

            {/* Basic Information */}
            <Input label="NID/Birth Reg/Passport" value={formData.nid} onChangeText={(text) => updateFormData({ nid: text.replace(/\s+/g, '') })} keyboardType="numeric" required editable={!isInputDisabled} maxLength={17} />
            {errors.nid && <Text style={styles.error}>{errors.nid}</Text>}
            <Input label="Date" value={entrydate} editable={false} />
            <EnglishOnlyInput label="Proposer's Name" value={formData.name} onChangeText={(v) => updateFormData({ name: v })} required editable={!isInputDisabled} maxLength={35} />
            {errors.name && <Text style={styles.error}>{errors.name}</Text>}
            <EnglishOnlyInput label="Child Name" value={formData.childName} onChangeText={(v) => updateFormData({ childName: v })} editable={!isInputDisabled} maxLength={35} />
            <Input label="Mobile No." value={formData.mobile} onChangeText={(v) => updateFormData({ mobile: v })} keyboardType="phone-pad" maxLength={11} required editable={!isInputDisabled} />
            {errors.mobile && <Text style={styles.error}>{errors.mobile}</Text>}

            {/* Plan Details */}
            <PickerComponent items={plans} value={formData.plan} setValue={(v) => updateFormData({ plan: v })} label="Plan" placeholder="Select a plan" required disabled={isInputDisabled} />
            {errors.plan && <Text style={styles.error}>{errors.plan}</Text>}

            <View>
              <Text style={styles.planName}>Plan Name</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planNameScroll}>
                <Text style={styles.planNameInput}>{selectedPlanLabel || '...'}</Text>
              </ScrollView>
            </View>

            <DatePickerComponent date={dateOfBirth} setDate={setDateOfBirth} label="Birth Date" required />
            {age < 8 && <Text style={{ color: 'red', marginLeft: 15, fontWeight: 'bold' }}>Age: {age} years — First payment not allowed under 8</Text>}

            <PickerComponent items={terms} value={formData.term} setValue={(v) => updateFormData({ term: v })} label="Term" placeholder="Select a term" required disabled={isInputDisabled} />
            {errors.term && <Text style={styles.error}>{errors.term}</Text>}

            <PickerComponent items={modes} value={formData.mode} setValue={(v) => updateFormData({ mode: v })} label="Mode" placeholder="Select a mode" required disabled={isInputDisabled} />
            {errors.mode && <Text style={styles.error}>{errors.mode}</Text>}

            {formData.mode === 'mly' && (
              <Input
                label="Installments"
                value={formData.installments.toString()}
                onChangeText={(v) => {
                  const sanitized = v.replace(/[^0-9]/g, '');
                  const num = Number(sanitized);

                  if (!sanitized) {
                    updateFormData({ installments: '' });
                    return;
                  }

                  if (num > 12) {
                    if (Platform.OS === 'android') {
                      ToastAndroid.show('Maximum 12 installments allowed', ToastAndroid.SHORT);
                    } else {
                      Alert.alert('Alert', 'Maximum 12 installments allowed');
                    }
                    updateFormData({ installments: '12' });
                    return;
                  }

                  updateFormData({ installments: sanitized });
                }}
                keyboardType="numeric"
                placeholder="Maximum 12 installments allowed"
                required
                editable={!isInputDisabled}
              />
            )}



            <Input label="Sum Assured" value={formData.sumAssured} onChangeText={(v) => updateFormData({ sumAssured: v })} keyboardType="numeric" required editable={!isInputDisabled} />
            {errors.sumAssured && <Text style={styles.error}>{errors.sumAssured}</Text>}

            {/* Extra Charge */}
            <Text style={styles.sectionTitle}>Extra Charge</Text>
            <View style={styles.checkboxRow}>
              {['F/E', 'O/E'].map(option => {
                const checked = formData.feOeOption === option;
                return (
                  <TouchableOpacity
                    key={option}
                    disabled={isInputDisabled}
                    onPress={() => updateFormData({ feOeOption: formData.feOeOption === option ? '' : option as 'F/E' | 'O/E' })}
                    style={styles.checkboxItem}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Code Setup */}
            <Text style={styles.sectionTitle}>Code Setup</Text>
            <Input
              label="FA"
              value={formData.fa}
              onChangeText={(text) => updateFormData({ fa: text.replace(/[^0-9]/g, '').slice(0, 8) })}
              maxLength={8}
              keyboardType="numeric"
              required
              placeholder="Enter 8-digit FA code"
              editable={!isInputDisabled}
            />
            {errors.fa && <Text style={styles.error}>{errors.fa}</Text>}

            <Input label="UM" value={formData.um} onChangeText={(v) => updateFormData({ um: v })} maxLength={6} keyboardType="numeric" required editable={editable.um && !isInputDisabled} style={{ backgroundColor: editable.um && !isInputDisabled ? '#ffffff' : '#f0f0f0' }} />
            <Input label="BM" value={formData.bm} onChangeText={(v) => updateFormData({ bm: v })} maxLength={6} keyboardType="numeric" required editable={editable.bm && !isInputDisabled} style={{ backgroundColor: editable.bm && !isInputDisabled ? '#ffffff' : '#f0f0f0' }} />
            <Input label="AGM" value={formData.agm} onChangeText={(v) => updateFormData({ agm: v })} maxLength={6} keyboardType="numeric" required editable={editable.agm && !isInputDisabled} style={{ backgroundColor: editable.agm && !isInputDisabled ? '#ffffff' : '#f0f0f0' }} />

            {/* Premium Details */}
            <Text style={styles.sectionTitle}>Premium Details (Auto Calculated)</Text>
            <Input label="Code (Auto)" value={calculated.code6Digit} editable={false} />
            <Input label="Rate" value={isSpecialProject ? calculated.rate : '0'} editable={false} />
            <Input label="Premium" value={calculated.premium ? Math.ceil(parseFloat(calculated.premium)).toString() : ''} editable={false} />
            <Input label="F/E or O/E Amount" value={calculated.feOeAmount} editable={false} />
            <Input label="Total Premium" value={calculated.totalPremium ? Math.ceil(parseFloat(calculated.totalPremium)).toString() : ''} editable={false} />
            <Input label="Installment" value={calculated.finalInstallment.toString()} editable={false} />
            <Input label="Installment Premium" value={installmentPremiumValue} editable={false} />
            <Input label="Commission" value={calculated.netCommission ? Math.ceil(parseFloat(calculated.netCommission)).toString() : ''} editable={false} />
            <Input label="Payment Amount" value={calculated.netAmount ? Math.ceil(parseFloat(calculated.netAmount)).toString() : ''} editable={false} />


            {/* Agent Details */}
            <Text style={styles.sectionTitle}>Agent & Servicing Details</Text>
            <Input label="Servicing Cell Code" value={formData.servicingCell} onChangeText={(v) => updateFormData({ servicingCell: v })} maxLength={10} keyboardType="numeric" required editable={!isInputDisabled} />
            {errors.servicingCell && <Text style={styles.error}>{errors.servicingCell}</Text>}
            <Input label="Agent Mobile" value={formData.agentMobile} onChangeText={(v) => updateFormData({ agentMobile: v })} keyboardType="phone-pad" maxLength={11} required editable={!isInputDisabled} />
            {errors.agentMobile && <Text style={styles.error}>{errors.agentMobile}</Text>}

            {/* Personal Details */}
            <Text style={styles.sectionTitle}>Personal & Nominee Details</Text>
            <EnglishOnlyInput label="Father's / Husband's Name" value={formData.fatherHusbandName} onChangeText={(v) => updateFormData({ fatherHusbandName: v })} required editable={!isInputDisabled} maxLength={30} />
            {errors.fatherHusbandName && <Text style={styles.error}>{errors.fatherHusbandName}</Text>}
            <EnglishOnlyInput label="Mother's Name" value={formData.motherName} onChangeText={(v) => updateFormData({ motherName: v })} required editable={!isInputDisabled} maxLength={30} />
            {errors.motherName && <Text style={styles.error}>{errors.motherName}</Text>}
            <EnglishOnlyInput label="Address" value={formData.address} onChangeText={(v) => updateFormData({ address: v })} required multiline numberOfLines={4} textAlignVertical="top" style={{ paddingTop: 12 }} editable={!isInputDisabled} maxLength={250} />
            {errors.address && <Text style={styles.error}>{errors.address}</Text>}
            <EnglishOnlyInput label="District" value={formData.district} onChangeText={(v) => updateFormData({ district: v })} required editable={!isInputDisabled} maxLength={15} />
            {errors.district && <Text style={styles.error}>{errors.district}</Text>}

            <Text style={{ marginLeft: 15, marginTop: 10, fontWeight: '600', color: '#000' }}>Gender</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
              {['Male', 'Female'].map(g => (
                <TouchableOpacity
                  key={g}
                  onPress={() => {
                    updateFormData({ gender: g });
                    setErrors(prev => ({ ...prev, gender: '' }));
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  disabled={isInputDisabled}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#000', marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
                    {formData.gender === g && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#000' }} />}
                  </View>
                  <Text>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

            {/* Nominee Details */}
            <Text style={styles.sectionTitle}>Nominee Details</Text>
            <EnglishOnlyInput label="Nominee 1 Name" value={formData.nominee1Name} onChangeText={(v) => updateFormData({ nominee1Name: v })} required editable={!isInputDisabled} maxLength={35} />
            {errors.nominee1Name && <Text style={styles.error}>{errors.nominee1Name}</Text>}
            <Input label="Nominee 1 Ratio %" value={formData.nominee1Percent} onChangeText={handleNomineePercent('nominee1Percent')} keyboardType="numeric" required editable={!isInputDisabled} />
            {errors.nominee1Percent && <Text style={styles.error}>{errors.nominee1Percent}</Text>}

            <EnglishOnlyInput label="Nominee 2 Name" value={formData.nominee2Name} onChangeText={(v) => updateFormData({ nominee2Name: v })} editable={!isInputDisabled} maxLength={35} />
            <Input label="Nominee 2 Ratio %" value={formData.nominee2Percent} onChangeText={handleNomineePercent('nominee2Percent')} keyboardType="numeric" editable={!isInputDisabled} />
            <EnglishOnlyInput label="Nominee 3 Name" value={formData.nominee3Name} onChangeText={(v) => updateFormData({ nominee3Name: v })} editable={!isInputDisabled} maxLength={35} />
            <Input label="Nominee 3 Ratio %" value={formData.nominee3Percent} onChangeText={handleNomineePercent('nominee3Percent')} keyboardType="numeric" editable={!isInputDisabled} />

            {/* Guardian */}
            <Text style={styles.sectionTitle}>Guardian Details</Text>
            <EnglishOnlyInput label="Guardian Name" value={formData.guardianName} onChangeText={(v) => updateFormData({ guardianName: v })} editable={!isInputDisabled} maxLength={30} />

            <FilledButton
              title={loading.isSubmitting ? 'Preparing Payment...' : 'Submit'}
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#333' },
  planName: { color: 'black', marginBottom: 10 },
  planNameScroll: { marginBottom: 10, borderWidth: 1, borderColor: '#000', borderRadius: 7, backgroundColor: '#E0E0E0' },
  planNameInput: { padding: 15, fontSize: 14, color: '#333' },
  submitButton: { marginVertical: 20 },
  error: { color: 'red', marginTop: 4, fontSize: 16 },
  checkboxRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', marginRight: 30 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: PRIMARY_BUTTON_BG, borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkMark: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 18, textAlign: 'center' },
  checkboxChecked: { backgroundColor: PRIMARY_BUTTON_BG },
  checkboxLabel: { marginLeft: 10, fontSize: 16, color: '#000' },
});

export default PayFirstPremiumScreen;