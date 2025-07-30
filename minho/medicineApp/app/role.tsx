import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function RoleSelect() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사용자 유형을 선택해주세요</Text>

      <TouchableOpacity
        style={[styles.roleButton, { backgroundColor: '#2196F3' }]}
        onPress={() => router.push('/home')}
      >
        <Text style={styles.buttonText}>고령자</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleButton, { backgroundColor: '#2196F3' }]}
        onPress={() => router.push('/Guardian')}
      >
        <Text style={styles.buttonText}>보호자</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  roleButton: {
    paddingVertical: 18,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
