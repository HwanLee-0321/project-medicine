// app/medications.tsx
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
  Modal,
} from 'react-native';
import { colors } from '@styles/colors';
import { postOcrMedications, OcrItemSnake } from './_utils/medication';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Row = {
  id: string;
  med_nm: string;         // 약 이름
  dosage: string;         // 회당 복용량(소수 2자리까지 허용)
  times_per_day: string;  // 일 복용 횟수(정수)
  duration_days: string;  // 복약 일수(정수)
  morning: boolean;
  lunch: boolean;
  dinner: boolean;
};

type EditorState = {
  id: string;
  med_nm: string;
  dosage: string;
  times_per_day: string;
  duration_days: string;
  morning: boolean;
  lunch: boolean;
  dinner: boolean;
};

const onlyDigits = (s: string) => s.replace(/\D/g, '');
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const onlyDecimalN = (s: string, maxDecimals = 2) => {
  const cleaned = s.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length === 1) return parts[0];
  const intPart = parts[0] || '0';
  const decPart = parts.slice(1).join('').replace(/\./g, '').slice(0, maxDecimals);
  return decPart ? `${intPart}.${decPart}` : intPart;
};

const clampFloatStr = (s: string, min = 0.01, max = 10, maxDecimals = 2) => {
  if (s === '') return '';
  const n = Number(s);
  if (!Number.isFinite(n)) return '';
  const clamped = Math.max(min, Math.min(max, n));
  return clamped
    .toFixed(maxDecimals)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '');
};

const R = 14;

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  Platform.OS === 'ios' ? (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={48}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );

/** ✅ OCR 파라미터 방어적 파싱 → 내부 상태는 컬럼명 그대로 */
const sanitizeRows = (input: unknown): Row[] => {
  if (!Array.isArray(input)) return [];
  return input.map((r, i) => {
    const obj = (typeof r === 'object' && r) ? (r as any) : {};
    const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id : `ocr-${i}`;

    // 들어오는 키가 camelCase(name, timesPerDay, days)일 수도 있으니 모두 허용해서 스네이크로 매핑
    const med_nm       = typeof obj.med_nm === 'string' ? obj.med_nm
                        : typeof obj.name === 'string'   ? obj.name : '';
    const dosage       = typeof obj.dosage === 'string' ? obj.dosage
                        : (obj.dosage != null ? String(obj.dosage) : '');
    const times_per_day= typeof obj.times_per_day === 'string' ? obj.times_per_day
                        : typeof obj.timesPerDay === 'string'   ? obj.timesPerDay
                        : (obj.times_per_day != null || obj.timesPerDay != null
                            ? String(obj.times_per_day ?? obj.timesPerDay) : '');
    const duration_days= typeof obj.duration_days === 'string' ? obj.duration_days
                        : typeof obj.days === 'string'         ? obj.days
                        : (obj.duration_days != null || obj.days != null
                            ? String(obj.duration_days ?? obj.days) : '');

    const morning = Boolean(obj.morning);
    const lunch   = Boolean(obj.lunch);
    const dinner  = Boolean(obj.dinner);

    return { id, med_nm, dosage, times_per_day, duration_days, morning, lunch, dinner };
  });
};

/** ✅ string | string[] 파라미터를 단일 문자열로 정규화 */
const pickFirst = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v ?? undefined);

export default function OCRScreen() {
  const router = useRouter();

  const { rows: rowsParam, error: errorParam } =
    useLocalSearchParams<{ rows?: string | string[]; error?: string | string[] }>();

  const [rows, setRows] = useState<Row[]>(
    Array.from({ length: 4 }).map((_, i) => ({
      id: `init-${i}`,
      med_nm: '',
      dosage: '',
      times_per_day: '',
      duration_days: '',
      morning: false,
      lunch: false,
      dinner: false,
    }))
  );

  const [editingMode, setEditingMode] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const rawRows = pickFirst(rowsParam);
    const rawErr  = pickFirst(errorParam);

    if (rawErr && typeof rawErr === 'string' && rawErr.trim()) {
      Alert.alert('알림', rawErr);
    }

    if (!rawRows) return;

    try {
      const parsed = JSON.parse(rawRows);
      const cleaned = sanitizeRows(parsed);
      if (cleaned.length) setRows(cleaned);
    } catch (e) {
      console.warn('rows 파라미터 파싱 실패', e);
    }
  }, [rowsParam, errorParam]);

  const totalMeds = useMemo(
    () => rows.filter(r => r.med_nm.trim() !== '').length,
    [rows]
  );

  const startEdit = () => setEditingMode(true);
  const finishEdit = () => { setEditorVisible(false); setEditor(null); setEditingMode(false); };

  const addRow = () => {
    const id = `row-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    setRows(prev => [...prev, {
      id, med_nm: '', dosage: '', times_per_day: '', duration_days: '',
      morning: false, lunch: false, dinner: false,
    }]);
  };

  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const openEditor = (row: Row) => {
    if (!editingMode) return;
    setEditor({
      id: row.id,
      med_nm: row.med_nm,
      dosage: row.dosage,
      times_per_day: row.times_per_day,
      duration_days: row.duration_days,
      morning: row.morning,
      lunch: row.lunch,
      dinner: row.dinner,
    });
    setEditorVisible(true);
  };

  const applyEditor = () => {
    if (!editor) return;

    const n  = editor.med_nm.trim();
    const d  = editor.dosage.trim();
    const t  = editor.times_per_day.trim();
    const ds = editor.duration_days.trim();

    const isInt  = (x: string) => /^\d+$/.test(x);
    const isDec2 = (x: string) => /^\d+(\.\d{1,2})?$/.test(x);

    if ((n && d === '') ||
        (d && !isDec2(d)) ||
        (t && !isInt(t)) ||
        (ds && !isInt(ds))) {
      Alert.alert('입력 오류', '복용량은 소수 둘째 자리까지, 횟수/일수는 정수만 입력해주세요.');
      return;
    }

    const dosage        = d  === '' ? '' : clampFloatStr(d, 0.01, 10, 2);
    const times_per_day = t  === '' ? '' : String(clamp(Number(t), 1, 10));
    const duration_days = ds === '' ? '' : String(clamp(Number(ds), 1, 365));

    updateRow(editor.id, {
      med_nm: n,
      dosage,
      times_per_day,
      duration_days,
      morning: editor.morning,
      lunch: editor.lunch,
      dinner: editor.dinner,
    });

    setEditorVisible(false);
  };

  /** 🔥 서버 저장 (컬럼명 그대로 items 전송) */
  const saveToServer = async () => {
    const items: OcrItemSnake[] = rows
      .map(r => ({
        med_nm: r.med_nm.trim(),
        dosage: r.dosage.trim(),
        times_per_day: r.times_per_day.trim(),
        duration_days: r.duration_days.trim(),
        morning: r.morning,
        lunch: r.lunch,
        dinner: r.dinner,
      }))
      .filter(r => r.med_nm && r.dosage && r.times_per_day && r.duration_days);

    if (items.length === 0) {
      Alert.alert('저장할 데이터가 없습니다', '약 이름/복용량/횟수/일수를 모두 채워주세요.');
      return;
    }

    const isInt  = (x: string) => /^\d+$/.test(x);
    const isDec2 = (x: string) => /^\d+(\.\d{1,2})?$/.test(x);

    const invalid = items.find(
      r => !isDec2(r.dosage) || !isInt(r.times_per_day) || !isInt(r.duration_days)
    );
    if (invalid) {
      Alert.alert('입력 오류', '복용량은 소수 둘째 자리까지, 횟수/일수는 정수만 입력해주세요.');
      return;
    }

    // 최종 정규화(범위/자릿수) — 문자열로 유지하여 API util에서 Number 변환
    const normalized: OcrItemSnake[] = items.map(r => ({
      med_nm: r.med_nm,
      dosage: clampFloatStr(r.dosage, 0.01, 10, 2),
      times_per_day: String(clamp(Number(r.times_per_day), 1, 10)),
      duration_days: String(clamp(Number(r.duration_days), 1, 365)),
      morning: !!r.morning,
      lunch:   !!r.lunch,
      dinner:  !!r.dinner,
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
                {editingMode ? '행을 눌러 크게 수정하세요' : '추가하거나 수정해주세요'}
              </Text>
            </View>

            {/* 테이블 */}
            <View style={styles.table}>
              <View style={[styles.row, styles.headRow]}>
                <Text style={[styles.cell, styles.headCell, styles.nameCol]}>약 이름</Text>
                <Text style={[styles.cell, styles.headCell]}>회당 복용량</Text>
                <Text style={[styles.cell, styles.headCell]}>일 복용 횟수</Text>
                <Text style={[styles.cell, styles.headCell]}>복약 일수</Text>
                {editingMode && <Text style={[styles.cell, styles.headCell, styles.actionCol]}> </Text>}
              </View>

              {rows.map((r) => (
                <TouchableOpacity key={r.id} style={styles.row} activeOpacity={editingMode ? 0.7 : 1} onPress={() => openEditor(r)}>
                  <View style={[styles.cellBox, styles.nameColBox]}>
                    <Text style={[styles.cellText, styles.left]} numberOfLines={1}>{r.med_nm}</Text>
                  </View>
                  <View style={styles.cellBox}>
                    <Text style={styles.cellText}>{r.dosage}</Text>
                  </View>
                  <View style={styles.cellBox}>
                    <Text style={styles.cellText}>{r.times_per_day}</Text>
                  </View>
                  <View style={styles.cellBox}>
                    <Text style={styles.cellText}>{r.duration_days}</Text>
                  </View>
                  {editingMode && (
                    <TouchableOpacity
                      style={[styles.cellBox, styles.actionColBox]}
                      onPress={() => removeRow(r.id)}
                      accessibilityLabel="행 삭제"
                    >
                      <Text style={styles.removeText}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionsRow}>
              {editingMode ? (
                <>
                  <TouchableOpacity style={[styles.actionBtn, styles.addBtn]} onPress={addRow} accessibilityLabel="행 추가">
                    <Text style={styles.actionBtnText}>+ 행 추가</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={finishEdit} accessibilityLabel="수정 종료">
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

            <Text style={styles.summaryText}>
              현재 입력된 약 개수: <Text style={styles.summaryEm}>{totalMeds}</Text>개
            </Text>
          </View>

          <View style={styles.mascotWrap}>
            <Image source={require('@assets/images/mascot.png')} style={styles.mascot} />
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>다 됐으면 ‘저장’ 버튼을 눌러주세요!</Text>
            </View>
          </View>
        </ScrollView>
      </Wrapper>

      {/* ========= 모달 편집기 ========= */}
      <Modal
        visible={editorVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setEditorVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheetContainer}>
            <KeyboardAwareScrollView
              contentContainerStyle={styles.sheetContent}
              keyboardShouldPersistTaps="handled"
              enableOnAndroid
              enableAutomaticScroll
              extraScrollHeight={32}
            >
              <Text style={styles.modalTitle}>행 수정</Text>

              <LabeledInput
                label="약 이름"
                value={editor?.med_nm ?? ''}
                onChangeText={(v) => setEditor((s) => s ? { ...s, med_nm: v } : s)}
                placeholder="예: 아스피린"
                a11y="약 이름 입력"
              />
              <LabeledInput
                label="회당 복용량"
                value={editor?.dosage ?? ''}
                onChangeText={(v) => setEditor((s) => {
                  const dec = onlyDecimalN(v, 2); // 입력 중엔 정리만
                  return s ? { ...s, dosage: dec } : s;
                })}
                keyboardType="decimal-pad"
                inputMode="decimal"
                a11y="회당 복용량 입력"
                placeholder="예: 0.25"
                center
              />
              <LabeledInput
                label="일 복용 횟수"
                value={editor?.times_per_day ?? ''}
                onChangeText={(v) => setEditor((s) => {
                  const d = onlyDigits(v).slice(0, 2);
                  const clampedVal = d === '' ? '' : String(clamp(Number(d), 1, 10));
                  return s ? { ...s, times_per_day: clampedVal } : s;
                })}
                keyboardType="number-pad"
                inputMode="numeric"
                a11y="일 복용 횟수 입력"
                placeholder="예: 3"
                center
              />
              <LabeledInput
                label="복약 일수"
                value={editor?.duration_days ?? ''}
                onChangeText={(v) => setEditor((s) => {
                  const d = onlyDigits(v).slice(0, 3);
                  const clampedVal = d === '' ? '' : String(clamp(Number(d), 1, 365));
                  return s ? { ...s, duration_days: clampedVal } : s;
                })}
                keyboardType="number-pad"
                inputMode="numeric"
                a11y="복약 일수 입력"
                placeholder="예: 7"
                center
              />

              <Text style={styles.sectionLabel}>복용 시간대</Text>
              <View style={styles.slotRow}>
                <SlotChip
                  label="아침"
                  active={Boolean(editor?.morning)}
                  onPress={() => setEditor((s) => s ? { ...s, morning: !s.morning } : s)}
                />
                <SlotChip
                  label="점심"
                  active={Boolean(editor?.lunch)}
                  onPress={() => setEditor((s) => s ? { ...s, lunch: !s.lunch } : s)}
                />
                <SlotChip
                  label="저녁"
                  active={Boolean(editor?.dinner)}
                  onPress={() => setEditor((s) => s ? { ...s, dinner: !s.dinner } : s)}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setEditorVisible(false)}>
                  <Text style={styles.modalCancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={applyEditor}>
                  <Text style={styles.modalSaveText}>저장</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>
      {/* ========= /모달 편집기 ========= */}
    </SafeAreaView>
  );
}

/** =========================
 * Sub Components
 * ========================= */
function LabeledInput({
  label, value, onChangeText, placeholder, a11y, keyboardType, inputMode, center,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  a11y?: string;
  keyboardType?: any;
  inputMode?: any;
  center?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.bigInput, center && { textAlign: 'center' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={a11y}
        keyboardType={keyboardType}
        inputMode={inputMode}
        maxLength={center ? 5 : 40} // "10.25" 고려
      />
    </View>
  );
}

function SlotChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}
      style={[styles.chip, active ? styles.chipOn : styles.chipOff]}>
      <Text style={[styles.chipText, active && { color: colors.onPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** =========================
 * Styles
 * ========================= */
const styles = StyleSheet.create({
  removeText: { color: colors.danger, fontWeight: '700' },
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
  actionColBox: { width: 64, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: colors.panel },

  cellText: { color: colors.textPrimary, textAlign: 'center' },
  left: { textAlign: 'left' },

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

  /* ===== 모달 ===== */
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheetContainer: {
    marginTop: 'auto',
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: colors.panel,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  sheetContent: { padding: 16, paddingBottom: 24 },

  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  inputLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
  bigInput: {
    borderWidth: 1, borderColor: colors.panel, backgroundColor: colors.white, color: colors.textPrimary,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, fontSize: 18,
  },
  sectionLabel: { marginTop: 8, marginBottom: 6, color: colors.textSecondary, fontSize: 14 },
  slotRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipOff: { backgroundColor: colors.white, borderColor: colors.panel },
  chipText: { fontWeight: '700', color: colors.textPrimary },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalCancel: { backgroundColor: colors.panel },
  modalSave: { backgroundColor: colors.primary },
  modalCancelText: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
  modalSaveText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
});
