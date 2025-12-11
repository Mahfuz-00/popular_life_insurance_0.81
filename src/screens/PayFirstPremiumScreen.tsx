import React, { useState, useEffect } from 'react';
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

import globalStyle from '../styles/globalStyle';
import { Input } from '../components/Input';
import { FilledButton } from '../components/FilledButton';
import { PickerComponent } from '../components/PickerComponent';
import { DatePickerComponent } from '../components/DatePickerComponent';
import Header from '../components/Header';
import BackgroundImage from '../assets/BackgroundImage.png';
import { fetchProjects, getAgentCodes } from '../actions/userActions';
import { getPlanList, getTermList } from '../actions/calculatePremiumActions';
import { getRate } from '../actions/userActions';

const SPECIAL_PROJECTS = ['ABA', 'AKOK', 'ALA', 'IA', 'JBA', 'JBAK', 'IBT'];
const MODE_MULTIPLIER: Record<string, number> = { yly: 1, hly: 2, qly: 4, mly: 12, single: 1 };
const PLAN_72_FACTOR: Record<string, number> = { mly: 1, qly: 3, hly: 6, yly: 12, single: 1 };

type Project = { name: string; id: number | string; code: string };
type Mode = { label: string; value: string };
type Plan = { label: string; value: string; fullLabel?: string; modes?: Mode[]};

const PayFirstPremiumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>({
    code: '',
    id: '',
    name: '',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [modes, setModes] = useState<{ label: string; value: string }[]>([]);

  const [code, setCode] = useState<string>('');
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

  const entrydate = moment().format('YYYY-MM-DD');

  const isSpecialProject = selectedProject?.code ? SPECIAL_PROJECTS.includes(selectedProject.code) : false;

  // Fetch Projects
  useEffect(() => {
    const loadProjects = async () => {
      const res = await fetchProjects();
      if (res?.data) {
        const formatted = res.data.map((p: any) => ({
          label: p.name,
          value: p.id,
          code: p.code,
        }));
        setProjects(formatted);
      }
    };
    loadProjects();
  }, []);

  // Update code when project changes
  useEffect(() => {
    setCode(selectedProject?.id?.toString() || '');
  }, [selectedProject]);

  // Reset fields on project change
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

  // Fetch Plans
  useEffect(() => {
    const loadPlans = async () => {
      const res = await getPlanList();
      if (!res || !Array.isArray(res)) return;

      let allowed = res;
      if (selectedProject?.code && !SPECIAL_PROJECTS.includes(selectedProject.code)) {
        allowed = res.filter((p: any) => ['28', '57', '72'].includes(p.value));
      }

      const formatted = allowed.map((p: any) => ({
        label: p.value,
        value: p.value,
        fullLabel: p.label,
         modes: Object.values(p.modes || {}).filter(Boolean).map((m: any) => ({
            label: m.label || m,  
            value: m.value || m,
        })),
      }));

      setPlans(formatted);

      if (plan && !formatted.some((p: Plan) => p.value === plan)) {
        setPlan('');
        setModes([]);
        setMode('');
        ToastAndroid.show('Only Plan 28 & 57 allowed for this project', ToastAndroid.LONG);
      }
    };
    loadPlans();
  }, [selectedProject?.code]);

  // Update modes & plan label
  useEffect(() => {
    const selected = plans.find(p => p.value === plan);
    if (selected) {
      setSelectedPlanLabel(selected.fullLabel || '');
       setModes(
        selected.modes?.map((m) => ({
            label: m.label.toUpperCase(),
            value: m.value,
        })) || []
      );
      setMode('');
    } else {
      setSelectedPlanLabel('');
      setModes([]);
    }
  }, [plan, plans]);

  // Fetch Terms
  useEffect(() => {
    const loadTerms = async () => {
      if (!plan) {
        setTerms([]);
        setTerm('');
        return;
      }
      const res = await getTermList(plan);
      if (res && Array.isArray(res)) {
        setTerms(res);
      } else {
        setTerms([]);
        setTerm('');
        ToastAndroid.show('No term available', ToastAndroid.LONG);
      }
    };
    loadTerms();
  }, [plan]);

  // Calculate Age (Bangladesh Rule: +1 after July 1)
  useEffect(() => {
    if (!dateOfBirth) return;
    const birth = moment(dateOfBirth);
    const today = moment();
    const july1 = moment().year(today.year()).month(6).date(1);
    let calculatedAge = today.diff(birth, 'years');
    if (today.isSameOrAfter(july1)) calculatedAge += 1;
    setAge(calculatedAge);
  }, [dateOfBirth]);

  // Auto Calculate Premium
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

  // Fetch Agent Codes
  useEffect(() => {
    if (!fa || fa.length !== 8 || !/^\d+$/.test(fa) || !selectedProject?.code) {
      setUm(''); setBm(''); setAgm('');
      return;
    }

    (async () => {
      const res = await getAgentCodes(fa, selectedProject.code);
      if (res.success) {
        setUm(res.um || '');
        setBm(res.bm || '');
        setAgm(res.agm || '');
        ToastAndroid.show('Agent verified!', ToastAndroid.SHORT);
      } else {
        setUm(''); setBm(''); setAgm('');
        ToastAndroid.show('Invalid FA Code', ToastAndroid.LONG);
      }
    })();
  }, [fa, selectedProject?.code]);

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

  const handleSubmit = () => {
    if (!checkNomineeTotal()) return;
    if (age < 18) return Alert.alert('Error', 'Age must be 18 or above');
    if (!fatherHusbandName || !motherName || !nominee1Name || !nominee1Percent)
      return Alert.alert('Error', 'Please fill all required fields');

    if (!netAmount || !code6Digit || !commission)
      return Alert.alert('Error', 'Premium calculation incomplete');

    navigation.navigate('PayfirstPremiumGateways', {
      project: selectedProject!.name,
      projectCode: selectedProject!.code,
      code: selectedProject!.id,
      nid, entrydate, name, mobile,
      plan: `${selectedProject!.id}${plan}`,
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
    });
  };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Pay First Premium" />
        <ScrollView style={[globalStyle.wrapper, { margin: 10 }]}>
          {/* All your inputs here - exactly as you wrote */}
          <PickerComponent 
          items={projects.map(p => ({ label: p.name, value: p.id }))} 
          value={selectedProject?.id ?? ''}
          setValue={(v) => {
            const p = projects.find(p => p.id === v);
            if (p) setSelectedProject({ id: p.id, code: p.code, name: p.name });
          }} 
          label="Project" 
          required />

          <Input label="NID" value={nid} onChangeText={setNid} required />
          <Input label="Date" value={entrydate} editable={false} />
          <Input label="Proposer's Name" value={name} onChangeText={setName} required />
          <Input label="Mobile No." value={mobile} onChangeText={setMobile} keyboardType="phone-pad" required />

          <PickerComponent items={plans} value={plan} setValue={setPlan} label="Plan" required />

          <View>
            <Text style={styles.planName}>Plan Name</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planNameScroll}>
              <Text style={styles.planNameInput}>{selectedPlanLabel}</Text>
            </ScrollView>
          </View>

          <DatePickerComponent date={dateOfBirth} setDate={setDateOfBirth} label="Birth Date" required />
          {age < 18 && <Text style={{ color: 'red', marginLeft: 15, fontWeight: 'bold' }}>
            Age: {age} years — First payment not allowed under 18
          </Text>}

          <PickerComponent 
            items={terms.map(t => ({ label: t, value: t }))} 
            value={term} 
            setValue={setTerm} 
            label="Term" required />
          <PickerComponent items={modes} value={mode} setValue={setMode} label="Mode" required />

          <Input label="Sum Assured" value={sumAssured} onChangeText={setSumAssured} keyboardType="numeric" required />
          <Input label="Code (Auto)" value={code6Digit} editable={false} />
          <Input label="Rate" value={isSpecialProject ? rate : '0'} editable={false} />
          <Input label="Premium" value={premium ? Math.ceil(parseFloat(premium)).toString() : ''} editable={false} />
          <Input label="Commission" value={netCommission ? Math.ceil(parseFloat(netCommission)).toString() : ''} editable={false} />
          <Input label="Payment Amount" value={netAmount ? Math.ceil(parseFloat(netAmount)).toString() : ''} editable={false} />

           <Input
            label={'Total Premium'}
            value={totalPremium}
            onChangeText={setTotalPremium}
            required
            keyboardType="numeric"
          />
          <Input
            label={'Servicing Cell Code'}
            value={servicingCell}
            onChangeText={setServicingCell}
            required
          />
          <Input
            label={'Agent Mobile'}
            value={agentMobile}
            onChangeText={setAgentMobile}
            keyboardType="phone-pad"
            required
          />

          <Text style={styles.sectionTitle}>Personal & Nominee Details</Text>
          <Input label="Father's / Husband's Name" value={fatherHusbandName} onChangeText={setFatherHusbandName} required />
          <Input label="Mother's Name" value={motherName} onChangeText={setMotherName} required />
          <Input 
            label="Address" 
            value={address} 
            onChangeText={setAddress} 
            required
            multiline={true}                     
            numberOfLines={4}                   
            textAlignVertical="top"             
            style={{ paddingTop: 12 }}
          />
          <Input label="District" value={district} onChangeText={setDistrict} required/>

          <Text style={{ marginLeft: 15, marginTop: 10, fontWeight: '600', color: '#000' }}>Gender</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
            {['Male', 'Female'].map(g => (
              <TouchableOpacity key={g} onPress={() => setGender(g)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#000', marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
                  {gender === g && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#000' }} />}
                </View>
                <Text>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Nominee Details</Text>
          <Input label="Nominee 1 Name" value={nominee1Name} onChangeText={setNominee1Name} required />
          <Input label="Nominee 1 Ratio %" value={nominee1Percent} onChangeText={handleNomineePercent(setNominee1Percent)} keyboardType="numeric" required />
          <Input label="Nominee 2 Name" value={nominee2Name} onChangeText={setNominee2Name} />
          <Input label="Nominee 2 Ratio %" value={nominee2Percent} onChangeText={handleNomineePercent(setNominee2Percent)} keyboardType="numeric" />
          <Input label="Nominee 3 Name" value={nominee3Name} onChangeText={setNominee3Name} />
          <Input label="Nominee 3 Ratio %" value={nominee3Percent} onChangeText={handleNomineePercent(setNominee3Percent)} keyboardType="numeric" />

          <Text style={styles.sectionTitle}>Code Setup</Text>
          <Input
            label={'FA'}
            value={fa}
            onChangeText={(text) => {
              setFa(text.replace(/[^0-9]/g, '').slice(0, 8)); // only numbers, max 8
            }}
            maxLength={8}
            keyboardType="numeric"
            required
            placeholder="Enter 8-digit FA code"
          />
         <Input
            label={'UM'}
            value={um}
            onChangeText={setUm}
            maxLength={8}
            editable={false}       
            style={{ backgroundColor: '#f0f0f0' }} 
          />
          <Input
            label={'BM'}
            value={bm}
            onChangeText={setBm}
            maxLength={8}
            editable={false}         
            style={{ backgroundColor: '#f0f0f0' }}
          />
          <Input
            label={'AGM'}
            value={agm}
            onChangeText={setAgm}
            maxLength={8}
            editable={false}         
            style={{ backgroundColor: '#f0f0f0' }}
          />

          <FilledButton title="Submit" onPress={handleSubmit} style={styles.submitButton} />
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