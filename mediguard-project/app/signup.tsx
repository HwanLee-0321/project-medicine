import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [id, setid] = useState('');
    const [password, setPassword] = useState('');
    const [phonenumber, setphonenumber] = useState('');

    const handleSignUp = () => {
        alert(`회원가입 완료!\n이름: ${name}\n이메일: ${id}`);
        router.push('/')

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <TextInput style={styles.input} placeholder="이름(본인)" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="아이디" value={id} onChangeText={setid} />
            <TextInput style={styles.input} placeholder="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="전화번호" value={phonenumber} onChangeText={setphonenumber} />
            <Button title="회원가입" onPress={handleSignUp} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 }
});