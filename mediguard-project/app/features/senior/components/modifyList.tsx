// app/features/senior/components/modifyList.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors';
import { readOcrMedications, MedRow } from '@app/_utils/medication';

export default function ModifyMedicationListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<MedRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const rows = await readOcrMedications();
      setItems(rows);
    } catch (e: any) {
      const msg = e?.message || '목록을 불러오지 못했습니다.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const rows = await readOcrMedications();
      setItems(rows);
    } catch (e: any) {
      Alert.alert('오류', e?.message || '새로고침 실패');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goBack = () => router.back();
  const gotoOcr = () => router.push('/prescription');

  // 테이블 행 렌더링(데이터 있으면 items, 없으면 4행 빈칸)
  const rowsForTable: Array<Partial<MedRow> & { __empty?: boolean }> =
    items.length > 0 ? items : Array.from({ length: 4 }).map(() => ({ __empty: true }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="뒤로 가기"
            onPress={goBack}
            style={styles.iconBtn}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>복약 목록 재설정</Text>
          <View style={styles.iconBtnPlaceholder} />
        </View>

        {/* Body */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>불러오는 중…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={[styles.button, styles.primaryBtn, styles.retryBtn]} onPress={load}>
              <Text style={styles.buttonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          >
            {/* 테이블 카드 */}
            <View style={styles.card}>
              <View style={styles.cardHeaderOnly}>
                <Text style={styles.cardTitle}>💊 복용 약</Text>
                <Text style={styles.cardSub}>
                  {items.length > 0 ? '아래 표에서 현재 등록된 복약 정보를 확인하세요' : '아직 등록된 항목이 없어요'}
                </Text>
              </View>

              <View style={styles.table}>
                {/* 헤더 */}
                <View style={[styles.row, styles.headRow]}>
                  <Text style={[styles.cell, styles.headCell, styles.nameCol]}>약 이름</Text>
                  <Text style={[styles.cell, styles.headCell]}>회당 복용량</Text>
                  <Text style={[styles.cell, styles.headCell]}>일 복용 횟수</Text>
                  <Text style={[styles.cell, styles.headCell]}>복약 일수</Text>
                </View>

                {/* 바디 */}
                {rowsForTable.map((r, i) => (
                  <View key={i} style={styles.row}>
                    <View style={[styles.cellBox, styles.nameColBox]}>
                      <Text style={[styles.cellText, styles.left]} numberOfLines={1}>
                        {r.__empty ? '' : r.med_nm ?? ''}
                      </Text>
                    </View>
                    <View style={styles.cellBox}>
                      <Text style={styles.cellText}>{r.__empty ? '' : String(r.dosage ?? '')}</Text>
                    </View>
                    <View style={styles.cellBox}>
                      <Text style={styles.cellText}>{r.__empty ? '' : String(r.times_per_day ?? '')}</Text>
                    </View>
                    <View style={styles.cellBox}>
                      <Text style={styles.cellText}>{r.__empty ? '' : String(r.duration_days ?? '')}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ✅ 목록 바로 아래 붙는 액션 영역(함께 스크롤) */}
            {items.length > 0 ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.button, styles.primaryBtn, styles.grow]} onPress={gotoOcr}>
                  <Text style={styles.buttonText}>OCR 다시 등록</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.button, styles.primaryBtn, styles.cta]} onPress={gotoOcr}>
                  <Text style={styles.buttonText}>OCR로 등록하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },

  /* Header */
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnPlaceholder: { width: 44, height: 44 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },

  /* Scroll content: 버튼이 함께 스크롤되도록 하단 패딩만 약간 */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
  },

  /* 카드/테이블 */
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.panel,
  },
  cardHeaderOnly: { marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 14, color: colors.textSecondary },

  table: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.panel,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.panel,
    alignItems: 'stretch',
  },
  headRow: { backgroundColor: colors.secondary, borderTopWidth: 0 },
  cell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  headCell: { fontWeight: '700', color: colors.onSecondary },
  nameCol: { flex: 1.2, textAlign: 'left' },

  cellBox: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: colors.panel,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  nameColBox: { flex: 1.2, borderLeftWidth: 0 },

  cellText: { color: colors.textPrimary, textAlign: 'center' },
  left: { textAlign: 'left' },

  /* 상태 뷰 */
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: colors.textSecondary },
  errorText: { color: colors.danger, marginBottom: 12, textAlign: 'center' },

  /* 액션 영역 (스크롤 컨텐츠 안) */
  actionsRow: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: 12,
  },
  actionsRowSplit: {
    flexDirection: 'row',
    gap: 8,
  },

  /* Buttons */
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  grow: { flex: 1 },
  cta: { width: '100%' },
  primaryBtn: { backgroundColor: colors.primary },
  secondaryBtn: { backgroundColor: colors.panel },
  retryBtn: { paddingHorizontal: 16 },
  buttonText: { color: colors.onPrimary, fontSize: 18, fontWeight: '700' },
  footerBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
});
