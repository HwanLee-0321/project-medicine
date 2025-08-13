// app/ocr.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@styles/colors';
import { postOcrMedications } from './_utils/medication';

type Row = {
  id: string;
  name: string;
  dosage: string;      // 🔹 회당 복용량 (숫자 문자열)
  timesPerDay: string; // 숫자 문자열
  days: string;        // 숫자 문자열
};

const onlyDigits = (s: string) => s.replace(/\D/g, '');
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const R = 14;

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  Platform.OS === 'ios' ? (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={48}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );

/** ✅ OCR 파라미터 방어적 파싱 */
const sanitizeRows = (input: unknown): Row[] => {
  if (!Array.isArray(input)) return [];
  return input.map((r, i) => {
    const obj = (typeof r === 'object' && r) ? (r as any) : {};
    const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id : `ocr-${i}`;
    const name = typeof obj.name === 'string' ? obj.name : '';
    const dosage = typeof obj.dosage === 'string' ? obj.dosage : (obj.dosage != null ? String(obj.dosage) : '');
    const timesPerDay = typeof obj.timesPerDay === 'string' ? obj.timesPerDay : (obj.timesPerDay != null ? String(obj.timesPerDay) : '');
    const days = typeof obj.days === 'string' ? obj.days : (obj.days != null ? String(obj.days) : '');
    return { id, name, dosage, timesPerDay, days };
  });
};

export default function OCRScreen() {
  const router = useRouter();
  const { rows: rowsParam } = useLocalSearchParams<{ rows?: string }>();

  // 4행 기본 제공(빈값)
  const [rows, setRows] = useState<Row[]>(
    Array.from({ length: 4 }).map((_, i) => ({
      id: `init-${i}`,
      name: '',
      dosage: '',
      timesPerDay: '',
      days: '',
    }))
  );
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!rowsParam) return;
    try {
      const parsed = JSON.parse(rowsParam);
      const cleaned = sanitizeRows(parsed);
      if (cleaned.length) setRows(cleaned);
    } catch (e) {
      console.warn('rows 파라미터 파싱 실패', e);
    }
  }, [rowsParam]);

  const totalMeds = useMemo(
    () => rows.filter(r => r.name.trim() !== '').length,
    [rows]
  );

  const startEdit = () => setEditing(true);

  const finishEdit = () => {
    // 간단 검증
    const bad = rows.find(
      r =>
        (r.name.trim() !== '' && r.dosage === '') ||
        (r.dosage !== '' && !/^\d+$/.test(r.dosage)) ||
        (r.timesPerDay !== '' && !/^\d+$/.test(r.timesPerDay)) ||
        (r.days !== '' && !/^\d+$/.test(r.days))
    );
    if (bad) {
      Alert.alert('입력 오류', '회당 복용량/일 복용 횟수/복약 일수는 숫자만 입력해주세요.');
      return;
    }
    setEditing(false);
  };

  const addRow = () => {
    const id = `row-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    setRows(prev => [...prev, { id, name: '', dosage: '', timesPerDay: '', days: '' }]);
  };

  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

  /** 🔥 서버 저장 */
  const saveToServer = async () => {
    // 저장할 행만 선별
    const items = rows
      .map(r => ({
        name: r.name.trim(),
        dosage: r.dosage.trim(),
        timesPerDay: r.timesPerDay.trim(),
        days: r.days.trim(),
      }))
      .filter(r => r.name && r.dosage && r.timesPerDay && r.days);

    if (items.length === 0) {
      Alert.alert('저장할 데이터가 없습니다', '약 이름/복용량/횟수/일수를 모두 채워주세요.');
      return;
    }

    // 최종 검증
    const invalid = items.find(
      r => !/^\d+$/.test(r.dosage) || !/^\d+$/.test(r.timesPerDay) || !/^\d+$/.test(r.days)
    );
    if (invalid) {
      Alert.alert('입력 오류', '회당 복용량/일 복용 횟수/복약 일수는 숫자만 입력해주세요.');
      return;
    }

    // 범위 제한(옵션)
    const normalized = items.map(r => ({
      name: r.name,
      dosage: String(clamp(Number(r.dosage), 1, 10)),
      timesPerDay: String(clamp(Number(r.timesPerDay), 1, 10)),
      days: String(clamp(Number(r.days), 1, 365)),
    }));

    try {
      setIsSaving(true);
      const { ok, fail, firstErrorMessage } = await postOcrMedications(normalized);
      if (fail === 0) {
        Alert.alert('저장 완료', `${ok}개 항목이 저장되었습니다.`);
        router.push('/role');
      } else if (ok > 0) {
        Alert.alert('부분 저장', `${ok}개 저장, ${fail}개 실패\n${firstErrorMessage ?? ''}`);
      } else {
        Alert.alert('저장 실패', firstErrorMessage ?? '서버와 통신 중 문제가 발생했어요.');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '서버와 통신 중 문제가 발생했어요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Wrapper>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>💊 복용 약</Text>
              <Text style={styles.cardSub}>
                {editing ? '값을 입력/수정해주세요' : '추가하거나 수정해주세요'}
              </Text>
            </View>

            {/* 테이블 */}
            <View style={styles.table}>
              {/* 헤더 */}
              <View style={[styles.row, styles.headRow]}>
                <Text style={[styles.cell, styles.headCell, styles.nameCol]}>약 이름</Text>
                <Text style={[styles.cell, styles.headCell]}>회당 복용량</Text>{/* 🔹 NEW */}
                <Text style={[styles.cell, styles.headCell]}>일 복용 횟수</Text>
                <Text style={[styles.cell, styles.headCell]}>복약 일수</Text>
                {editing && <Text style={[styles.cell, styles.headCell, styles.actionCol]}> </Text>}
              </View>

              {/* 바디 */}
              {rows.map((r) => (
                <View key={r.id} style={styles.row}>
                  {/* 약 이름 */}
                  <View style={[styles.cellBox, styles.nameColBox]}>
                    {editing ? (
                      <TextInput
                        style={[styles.input, styles.inputText]}
                        value={r.name}
                        onChangeText={(v) => updateRow(r.id, { name: v })}
                        placeholder="예: 아스피린"
                        placeholderTextColor={colors.textSecondary}
                        accessibilityLabel="약 이름 입력"
                        returnKeyType="done"
                        blurOnSubmit={false}
                      />
                    ) : (
                      <Text style={[styles.cellText, styles.left]} numberOfLines={1}>{r.name}</Text>
                    )}
                  </View>

                  {/* 회당 복용량 */}
                  <View style={styles.cellBox}>
                    {editing ? (
                      <TextInput
                        style={[styles.input, styles.inputNumber]}
                        value={r.dosage}
                        onChangeText={(v) => {
                          const d = onlyDigits(v).slice(0, 2);
                          const clampedVal = d === '' ? '' : String(clamp(Number(d), 1, 10));
                          updateRow(r.id, { dosage: clampedVal });
                        }}
                        placeholder="량"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        maxLength={2}
                        inputMode="numeric"
                        textAlign="center"
                        accessibilityLabel="회당 복용량 입력"
                        blurOnSubmit={false}
                      />
                    ) : (
                      <Text style={styles.cellText}>{r.dosage}</Text>
                    )}
                  </View>

                  {/* 일 복용 횟수 */}
                  <View style={styles.cellBox}>
                    {editing ? (
                      <TextInput
                        style={[styles.input, styles.inputNumber]}
                        value={r.timesPerDay}
                        onChangeText={(v) => {
                          const d = onlyDigits(v).slice(0, 2);
                          const clampedVal = d === '' ? '' : String(clamp(Number(d), 1, 10));
                          updateRow(r.id, { timesPerDay: clampedVal });
                        }}
                        placeholder="횟수"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        maxLength={2}
                        inputMode="numeric"
                        textAlign="center"
                        accessibilityLabel="일 복용 횟수 입력"
                        blurOnSubmit={false}
                      />
                    ) : (
                      <Text style={styles.cellText}>{r.timesPerDay}</Text>
                    )}
                  </View>

                  {/* 복약 일수 */}
                  <View style={styles.cellBox}>
                    {editing ? (
                      <TextInput
                        style={[styles.input, styles.inputNumber]}
                        value={r.days}
                        onChangeText={(v) => {
                          const d = onlyDigits(v).slice(0, 3);
                          const clampedVal = d === '' ? '' : String(clamp(Number(d), 1, 365));
                          updateRow(r.id, { days: clampedVal });
                        }}
                        placeholder="일수"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        maxLength={3}
                        inputMode="numeric"
                        textAlign="center"
                        accessibilityLabel="복약 일수 입력"
                        blurOnSubmit={false}
                      />
                    ) : (
                      <Text style={styles.cellText}>{r.days}</Text>
                    )}
                  </View>

                  {/* 삭제 버튼(편집 모드에서만) */}
                  {editing && (
                    <TouchableOpacity
                      style={[styles.cellBox, styles.actionColBox]}
                      onPress={() => removeRow(r.id)}
                      accessibilityLabel="행 삭제"
                    >
                      <Text style={styles.removeText}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* 하단 액션 */}
            <View style={styles.actionsRow}>
              {editing ? (
                <>
                  <TouchableOpacity style={[styles.actionBtn, styles.addBtn]} onPress={addRow} accessibilityLabel="행 추가">
                    <Text style={styles.actionBtnText}>+ 행 추가</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={finishEdit} accessibilityLabel="수정 완료">
                    <Text style={styles.saveBtnText}>완료</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={startEdit}
                    accessibilityLabel="약 정보 수정"
                  >
                    <Text style={styles.actionBtnText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.saveBtn, isSaving && { opacity: 0.7 }]}
                    onPress={isSaving ? undefined : saveToServer}
                    disabled={isSaving}
                    accessibilityLabel="서버에 저장"
                  >
                    {isSaving ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator />
                        <Text style={styles.saveBtnText}>저장 중...</Text>
                      </View>
                    ) : (
                      <Text style={styles.saveBtnText}>저장</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* 요약(옵션) */}
            <Text style={styles.summaryText}>
              현재 입력된 약 개수: <Text style={styles.summaryEm}>{totalMeds}</Text>개
            </Text>
          </View>

          {/* 마스코트 안내 */}
          <View style={styles.mascotWrap}>
            <TouchableOpacity
              onPress={() => router.push('/role')}
              accessibilityLabel="역할 선택 화면으로 이동"
            >
              <Image source={require('@assets/images/mascot.png')} style={styles.mascot} />
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>다 됐으면 저를 눌러주세요!!</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 24, gap: 16,
  },
  card: {
    width: '100%', maxWidth: 420, backgroundColor: colors.white, borderRadius: R,
    padding: 16, borderWidth: 1, borderColor: colors.panel,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  cardHeader: { marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 14, color: colors.textSecondary },

  table: { marginTop: 8, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.panel },
  row: { flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.panel, alignItems: 'stretch' },
  headRow: { backgroundColor: colors.secondary, borderTopWidth: 0 },

  cell: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, textAlign: 'center', color: colors.textPrimary },
  headCell: { fontWeight: '700', color: colors.onSecondary },
  nameCol: { flex: 1.2, textAlign: 'left' },

  cellBox: { flex: 1, borderLeftWidth: 1, borderLeftColor: colors.panel, paddingVertical: 8, paddingHorizontal: 10, justifyContent: 'center' },
  nameColBox: { flex: 1.2, borderLeftWidth: 0 },
  actionCol: { width: 64, textAlign: 'center' },
  actionColBox: { width: 64, borderLeftWidth: 1, alignItems: 'center' },

  cellText: { color: colors.textPrimary, textAlign: 'center' },
  left: { textAlign: 'left' },

  input: { borderWidth: 1, borderColor: colors.panel, backgroundColor: colors.white, color: colors.textPrimary, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  inputText: {},
  inputNumber: { textAlign: 'center' },
  removeText: { color: colors.danger, fontWeight: '700' },

  actionsRow: { marginTop: 12, flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.panel, backgroundColor: colors.white },
  editBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  addBtn: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  saveBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionBtnText: { color: colors.onSecondary, fontWeight: '700', fontSize: 16 },
  saveBtnText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },

  summaryText: { marginTop: 8, color: colors.textSecondary, fontSize: 12 },
  summaryEm: { color: colors.textPrimary, fontWeight: '700' },

  mascotWrap: { width: '100%', maxWidth: 420, alignItems: 'flex-end', paddingRight: 6 },
  mascot: { width: 92, height: 92, resizeMode: 'contain' },
  bubble: { position: 'absolute', right: 86, bottom: 26, backgroundColor: colors.white, borderColor: colors.panel, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  bubbleText: { color: colors.textPrimary, fontWeight: '700' },
});
