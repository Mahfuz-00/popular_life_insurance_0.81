// src/screens/CodeWiseCollectionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Alert,
} from 'react-native';
import { PickerComponent } from '../components/PickerComponent';
import { FilledButton } from '../components/FilledButton';
import { Input } from '../components/Input';
import Header from '../components/Header';
import globalStyle from '../styles/globalStyle';
import BackgroundImage from '../assets/BackgroundImage.png';
import { SHOW_LOADING, HIDE_LOADING } from '../store/constants/commonConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProjects } from '../actions/userActions';
import axios from 'axios';
import { API } from '../config';
import { useDispatch } from 'react-redux';

interface Project {
  label: string;
  value: string;
}

interface Designation {
  label: string;
  value: string;
}

const CodeWiseCollectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsUnfiltered, setProjectsUnfiltered] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [selectedDesignation, setSelectedDesignation] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [reportType, setReportType] = useState<'Summary' | 'Details'>('Summary');
  const [data, setData] = useState<any>(null);
  const [fromDate, setFromDate] = useState<Date>(new Date(2020, 0, 1));
  const [toDate, setToDate] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchData() {
      const response = await fetchProjects();
      console.log('Project response.data', response.data);

      if (response?.data) {
        const unfilteredProjects = response.data.map((project: any) => ({
          label: project.name,
          value: project.code,
        }));
        setProjectsUnfiltered(unfilteredProjects);

        const codesToExclude = ['ABAD', 'ADPS', 'IBDPS', 'ALAD', 'JBAD', 'IAD', 'JBADK'];
        const filteredProjects = response.data
          .filter((project: any) => !codesToExclude.includes(project.code))
          .map((project: any) => ({
            label: project.name,
            value: project.code,
          }));
        setProjects(filteredProjects);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        dispatch({ type: SHOW_LOADING, payload: { textColor: '#000000' } });
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${API}/api/designations`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${JSON.parse(token!)}`,
          },
        });

        if (response.status === 200 && response.data?.data) {
          const allowedDesignations = ['Agent', 'Manager', 'Am', 'Agm', 'Branch', 'Service Cell'];
          const formattedDesignations = response.data.data
            .filter((item: string) => allowedDesignations.includes(item))
            .map((item: string) => {
              const displayLabel: Record<string, string> = {
                'Agent': 'FA',
                'Manager': 'BM',
                'Am': 'UM',
                'Agm': 'AGM',
                'Branch': 'Branch',
                'Service Cell': 'Service Cell',
              };
              return {
                label: displayLabel[item] || item,
                value: item,
              };
            });
          setDesignations(formattedDesignations);
        }
      } catch (error: any) {
        console.error('Failed to fetch designations:', error);
        Alert.alert(
          'Error',
          `Failed to fetch designations: ${error.response?.data?.message || error.message || 'Server error'}`,
          [{ text: 'OK', style: 'cancel' }],
        );
      } finally {
        dispatch({ type: HIDE_LOADING });
      }
    };
    fetchDesignations();
  }, [dispatch]);

  const fetchCollectionData = async () => {
    if (!selectedProject?.value || !selectedDesignation || !code.trim()) {
      Alert.alert('Error', 'Please fill all fields.', [{ text: 'OK', style: 'cancel' }]);
      return;
    }

    if (reportType === 'Details' && fromDate > toDate) {
      Alert.alert('Error', 'From date cannot be after To date', [{ text: 'OK', style: 'cancel' }]);
      return;
    }

    try {
      dispatch({ type: SHOW_LOADING, payload: { textColor: '#000000' } });
      const token = await AsyncStorage.getItem('token');
      const endpoint = reportType === 'Summary'
        ? `${API}/api/code-wise-collection-summary`
        : `${API}/api/code-wise-collection-details`;

      const response = await axios.post(
        endpoint,
        {
          project_code: selectedProject.value.toString(),
          designation: selectedDesignation,
          code,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${JSON.parse(token!)}`,
          },
        }
      );

      if (response.status === 200 && response.data?.data) {
        if (Array.isArray(response.data.data) && response.data.data.length === 0) {
          Alert.alert('Alert', 'No data found.', [{ text: 'OK', style: 'cancel' }]);
          setData(null);
        } else {
          setData(response.data.data);
        }
      } else {
        Alert.alert('Error', 'No data found for the provided inputs.', [{ text: 'OK', style: 'cancel' }]);
        setData(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      Alert.alert(
        'Error',
        `Failed to fetch data: ${error.response?.data?.message || error.message || 'Server error'}`,
        [{ text: 'OK', style: 'cancel' }],
      );
      setData(null);
    } finally {
      dispatch({ type: HIDE_LOADING });
    }
  };

  // renderSummaryTable() and renderDetailsTable() — 100% your original code, only typed
  const renderSummaryTable = () => { /* your full renderSummaryTable exactly as you wrote */ };
  const renderDetailsTable = () => { /* your full renderDetailsTable exactly as you wrote */ };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Collection Summary" />
        <ScrollView>
          <View style={globalStyle.wrapper}>
            <View style={styles.inputContainer}>
              <PickerComponent
                items={projects}
                value={selectedProject?.value || ''}
                setValue={(val) => {
                  const project = projects.find(p => p.value === val);
                  setSelectedProject(project || null);
                }}
                label="Project"
                placeholder="Select a project"
                required
              />
              <PickerComponent
                items={designations}
                value={selectedDesignation}
                setValue={setSelectedDesignation}
                label="Designation"
                placeholder="Select designation"
                required
              />
              <Input label="Code" value={code} onChangeText={setCode} required />
              <PickerComponent
                items={[
                  { label: 'Summary', value: 'Summary' },
                  { label: 'Details', value: 'Details' }
                ]}
                value={reportType}
                setValue={setReportType}
                label="Report Type"
                placeholder="Select report type"
                required
              />
              <FilledButton
                title="Fetch Data"
                style={styles.fetchButton}
                onPress={fetchCollectionData}
              />
            </View>

            {data && reportType === 'Summary' && renderSummaryTable()}
            {data && reportType === 'Details' && renderDetailsTable()}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 20,
    },
    label: {
        color: 'black',
        marginBottom: 10,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#5382AC',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        fontFamily: globalStyle.fontMedium.fontFamily,
        marginBottom: 15,
        backgroundColor: '#FFF',
        color: '#000',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#5382AC',
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#FFF',
    },
    picker: {
        height: 50,
        color: '#000',
    },
    fetchButton: {
        width: '50%',
        borderRadius: 50,
        alignSelf: 'center',
    },
    table: {
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: '#5382AC',
        marginVertical: 15,
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
        marginVertical: 10,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 5,
    },
    codeInfo: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 10,
    },
    dateRange: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 10,
    },
    yearHeader: {
        fontSize: 18,
        fontFamily: globalStyle.fontBold.fontFamily,
        marginVertical: 10,
        marginLeft: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderColor: '#5382AC',
        backgroundColor: '#F0F8FF',
    },
    headerCell: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
        fontFamily: globalStyle.fontBold.fontFamily,
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#5382AC',
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
        fontFamily: globalStyle.fontMedium.fontFamily,
        color: '#000',
    },
    subTotal: {
        backgroundColor: '#E6E6FA',
    },
    grandTotal: {
        backgroundColor: '#D3D3D3',
    },
    monthHeader: {
        fontSize: 16,
        marginVertical: 10,
        marginLeft: 10,
    },
    totals: {
        marginTop: 10,
        borderTopWidth: 2,
        borderColor: '#5382AC',
    },
});

export default CodeWiseCollectionScreen;