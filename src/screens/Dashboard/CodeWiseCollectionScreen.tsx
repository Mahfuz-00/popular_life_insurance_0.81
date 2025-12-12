import React, { useState, useEffect } from 'react';
import { View, ScrollView, ImageBackground, Alert, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { PickerComponent } from '../../components/PickerComponent';
import { FilledButton } from '../../components/FilledButton';
import { Input } from '../../components/input/Input';
import SummaryTable from '../../components/report/TableSummary';
import DetailsTable from '../../components/report/TableDetails';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants';
import { fetchProjects, fetchDesignations, getCodeWiseCollectionSummary, getCodeWiseCollectionDetails } from '../../actions/userActions';

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

  // Fetch Projects
  useEffect(() => {
    const loadProjects = async () => {
      const response = await fetchProjects();
      if (response?.data) {
        const unfiltered = response.data.map((p: any) => ({
          label: p.name,
          value: p.code,
        }));
        setProjectsUnfiltered(unfiltered);

        const exclude = ['ABAD', 'ADPS', 'IBDPS', 'ALAD', 'JBAD', 'IAD', 'JBADK'];
        const filtered = response.data
          .filter((p: any) => !exclude.includes(p.code))
          .map((p: any) => ({ label: p.name, value: p.code }));
        setProjects(filtered);
      }
    };
    loadProjects();
  }, []);

  // Fetch Designations
  useEffect(() => {
    const loadDesignations = async () => {
      try {
        dispatch({ type: SHOW_LOADING, payload: 'Loading designations...' });
        const response = await fetchDesignations();

        if (response?.data) {
          const allowed = ['Agent', 'Manager', 'Am', 'Agm', 'Branch', 'Service Cell'];
          const formatted = response.data
            .filter((item: string) => allowed.includes(item))
            .map((item: string) => {
              const map: Record<string, string> = {
                Agent: 'FA',
                Manager: 'BM',
                Am: 'UM',
                Agm: 'AGM',
                Branch: 'Branch',
                'Service Cell': 'Service Cell',
              };
              return {
                label: map[item] || item,
                value: item,
              };
            });
          setDesignations(formatted);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load designations');
      } finally {
        dispatch({ type: HIDE_LOADING });
      }
    };
    loadDesignations();
  }, [dispatch]);

  // Fetch Report Data
  const fetchData = async () => {
    if (!selectedProject?.value || !selectedDesignation || !code.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      dispatch({ type: SHOW_LOADING, payload: 'Fetching report...' });

      const result = reportType === 'Summary'
        ? await getCodeWiseCollectionSummary(selectedProject.value, selectedDesignation, code)
        : await getCodeWiseCollectionDetails(selectedProject.value, selectedDesignation, code);

      if (result?.data && Object.keys(result.data).length > 0) {
        setData(result.data);
      } else {
        Alert.alert('No Data', 'No records found');
        setData(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
      setData(null);
    } finally {
      dispatch({ type: HIDE_LOADING });
    }
  };

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
                setValue={(v) => {
                  const p = projects.find(item => item.value === v);
                  setSelectedProject(p || null);
                }}
                label="Project"
                required
              />
              <PickerComponent
                items={designations}
                value={selectedDesignation}
                setValue={setSelectedDesignation}
                label="Designation"
                required
              />
              <Input label="Code" value={code} onChangeText={setCode} required />
              <PickerComponent
                items={[
                  { label: 'Summary', value: 'Summary' },
                  { label: 'Details', value: 'Details' },
                ]}
                value={reportType}
                setValue={setReportType}
                label="Report Type"
                required
              />
              <FilledButton title="Fetch Data" onPress={fetchData} style={styles.fetchButton} />
            </View>

            {data && reportType === 'Summary' && (
              <SummaryTable data={data} projectsUnfiltered={projectsUnfiltered} code={code} />
            )}
            {data && reportType === 'Details' && (
              <DetailsTable data={data} projectsUnfiltered={projectsUnfiltered} code={code} />
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { marginVertical: 20 },
  fetchButton: { width: '50%', borderRadius: 50, alignSelf: 'center' },
});

export default CodeWiseCollectionScreen;