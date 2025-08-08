// app/signup.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [password, setPassword] = useState('');
    const [guardianEmail, setGuardianEmail] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [calendarType, setCalendarType] = useState<'양력' | '음력'>('양력');
    const [gender, setGender] = useState<'남성' | '여성' | null>(null);

    // 가짜 ID 중복 확인 로직
    const handleCheckDuplicateId = () => {
        if (id === 'takenId') {
            Alert.alert('이미 사용 중인 아이디입니다.');
            setIsIdChecked(false);
        } else {
            Alert.alert('사용 가능한 아이디입니다!');
            setIsIdChecked(true);
        }
    };

    const handleSignUp = () => {
        if (!name || !id || !password || !guardianEmail || !birthdate || !gender) {
            Alert.alert('모든 항목을 입력해주세요.');
            return;
        }

        if (!isIdChecked) {
            Alert.alert('아이디 중복 확인을 해주세요!');
            return;
        }

        // 예시용 가입 완료 알림
        Alert.alert(`${name}님, 회원가입이 완료되었습니다!`);
        const newUser = {
            name,
            id,
            password,
            guardianEmail,
            birthdate,
            calendarType,
            gender,
            createdAt: new Date().toISOString(),
            isFirstLogin: true,
        };
        router.replace('/');


    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>

            <TextInput style={styles.input} placeholder="이름" value={name} onChangeText={setName} />

            <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="아이디" value={id} onChangeText={(text) => {
                    setId(text);
                    setIsIdChecked(false); // 아이디 변경 시 중복 확인 다시 필요
                }} />
                <TouchableOpacity style={styles.checkButton} onPress={handleCheckDuplicateId}>
                    <Text style={styles.checkText}>중복 확인</Text>
                </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="보호자 이메일" value={guardianEmail} onChangeText={setGuardianEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="생년월일 (YYYY-MM-DD)" value={birthdate} onChangeText={setBirthdate} />

            <Text style={styles.label}>달력 종류</Text>
            <View style={styles.row}>
                {['양력', '음력'].map((type) => (
                    <TouchableOpacity key={type} style={styles.radioItem} onPress={() => setCalendarType(type as '양력' | '음력')}>
                        <View style={[styles.radioCircle, calendarType === type && styles.radioSelected]} />
                        <Text>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>성별</Text>
            <View style={styles.row}>
                {['남성', '여성'].map((g) => (
                    <TouchableOpacity key={g} style={styles.radioItem} onPress={() => setGender(g as '남성' | '여성')}>
                        <View style={[styles.radioCircle, gender === g && styles.radioSelected]} />
                        <Text>{g}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>회원가입 완료</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>로그인 화면으로 돌아가기</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    label: { marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
    input: {
        borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 12,
    },
    row: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    },
    checkButton: {
        marginLeft: 8, paddingVertical: 10, paddingHorizontal: 14,
        backgroundColor: '#eee', borderRadius: 8,
    },
    checkText: { fontWeight: 'bold' },
    button: {
        backgroundColor: '#4E88FF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20,
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    link: { marginTop: 20, color: '#4E88FF', textAlign: 'center' },
    radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    radioCircle: {
        width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#4E88FF',
        marginRight: 6,
    },
    radioSelected: {
        backgroundColor: '#4E88FF',
    },
});
