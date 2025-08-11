import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';  // expo-router import

// 외부 컴포넌트 임포트 (경로 맞게 조정)
import CalendarTab from '../../../Calendar';
import MedicationTimeTab from './MedicationTime';
import NotificationSettingTab from './NotificationSetting';

// 로그인 화면 컴포넌트 (TextInput 사용, 아이디는 읽기전용)
function LoginScreen({ userId, onLoginSuccess, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password.length < 4) {
      setError('비밀번호를 4자 이상 입력하세요');
      return;
    }
    setError('');
    if (password === '1234') {
      onLoginSuccess();
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={styles.title}>로그인</Text>
          <Text style={{ marginBottom: 8 }}>아이디</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#eee' }]}
            value={userId}
            editable={false}
          />
          <Text style={{ marginTop: 20, marginBottom: 8 }}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호 입력"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={[styles.card, styles.blueCard, { marginTop: 20, width: '80%', height: 50, justifyContent: 'center' }]} onPress={handleLogin}>
            <Text style={styles.cardText}>로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
            <Text style={{ color: '#2196F3' }}>뒤로가기</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export default function FunctionMain() {
  const router = useRouter();  // router 사용
  const [mainTab, setMainTab] = useState<'dashboard' | 'function'>('function');
  const [activeFunctionTab, setActiveFunctionTab] = useState<
    'home' | 'calendar' | 'medTime' | 'notification' | 'other' | 'login'
  >('home');

  const [savedUserId, setSavedUserId] = useState('minho25'); // 예시 저장 아이디

  // 로그인 성공 후 역할선택 페이지로 이동
  const onLoginSuccess = () => {
    router.push('/role');  // role.tsx 페이지로 이동
  };

  const renderTopTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, mainTab === 'dashboard' ? styles.activeTab : styles.inactiveTab]}
        onPress={() => setMainTab('dashboard')}
      >
        <Text style={mainTab === 'dashboard' ? styles.activeTabText : styles.inactiveTabText}>대시보드</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, mainTab === 'function' ? styles.activeTab : styles.inactiveTab]}
        onPress={() => setMainTab('function')}
      >
        <Text style={mainTab === 'function' ? styles.activeTabText : styles.inactiveTabText}>기능</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDashboard = () => (
    <ScrollView
      style={styles.dashboardContainer}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileBox}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png' }}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.profileText}>대상자: 김노인</Text>
          <Text style={styles.profileText}>상태: 정상</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>주간 복약횟수</Text>
        <LineChart
          data={{
            labels: ['월', '화', '수', '목', '금'],
            datasets: [{ data: [3, 2, 5, 4, 2] }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: () => '#000',
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>⚠️ 미복약 알림</Text>
        <Text style={styles.alertSubText}>8월 6일 아침약 미복용</Text>
      </View>
      <View style={styles.alertBox}>
        <Text style={styles.alertText}>🚨 이상징후 감지</Text>
        <Text style={styles.alertSubText}>어지러움 호소 (8월 6일)</Text>
      </View>
    </ScrollView>
  );

  const renderFunctionHome = () => (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 180,
        paddingBottom: 20,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { marginBottom: 30 }]}>기능 화면</Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[styles.card, styles.blueCard]}
          onPress={() => setActiveFunctionTab('medTime')}
        >
          <Text style={styles.cardText}>복약/시간설정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.redCard]}
          onPress={() => setActiveFunctionTab('calendar')}
        >
          <Text style={styles.cardText}>이력 데이터 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.yellowCard]}
          onPress={() => setActiveFunctionTab('notification')}
        >
          <Text style={[styles.cardText, { color: '#000' }]}>알림 설정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.greenCard]}
          onPress={() => setActiveFunctionTab('login')}
        >
          <Text style={styles.cardText}>역할 선택</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderFunctionTabContent = () => {
    switch (activeFunctionTab) {
      case 'calendar':
        return <CalendarTab />;
      case 'medTime':
        return <MedicationTimeTab />;
      case 'notification':
        return <NotificationSettingTab />;
      case 'login':
        return (
          <LoginScreen
            userId={savedUserId}
            onLoginSuccess={onLoginSuccess}
            onBack={() => setActiveFunctionTab('home')}
          />
        );
      case 'other':
        return (
          <View style={styles.container}>
            <Text style={styles.title}>기타 기능 화면</Text>
          </View>
        );
      default:
        return renderFunctionHome();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderTopTabs()}
      <View style={{ flex: 1 }}>
        {mainTab === 'dashboard' && renderDashboard()}
        {mainTab === 'function' && renderFunctionTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  inactiveTab: {},
  activeTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  inactiveTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },

  cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    width: '40%',
    height: 100,
    margin: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  blueCard: { backgroundColor: '#2196F3' },
  redCard: { backgroundColor: '#F44336' },
  yellowCard: { backgroundColor: '#FFEB3B' },
  greenCard: { backgroundColor: '#4CAF50' },

  dashboardContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileText: { fontSize: 16 },

  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000',
  },
  chart: {
    borderRadius: 10,
  },

  alertBox: {
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#ffcc00',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  alertText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertSubText: {
    fontSize: 15,
    color: '#555',
  },

  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
});
