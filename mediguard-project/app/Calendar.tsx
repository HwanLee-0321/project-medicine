// components/CalendarTab.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Calendar, DateObject, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors';

type RecordT = {
  time: '아침' | '점심' | '저녁';
  tookMedicine: string;
  missedMedicine: string;
  healthIssue: string;
};

// ── 한국어 로케일
LocaleConfig.locales.kr = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

// ── 예시 데이터
const records: { [date: string]: RecordT[] } = {
  '2025-08-01': [
    { time: '아침', tookMedicine: '복용함', missedMedicine: '-', healthIssue: '두통' },
    { time: '점심', tookMedicine: '복용함', missedMedicine: '-', healthIssue: '-' },
    { time: '저녁', tookMedicine: '복용함', missedMedicine: '-', healthIssue: '-' },
  ],
  '2025-08-05': [
    { time: '아침', tookMedicine: '-', missedMedicine: '오메강3', healthIssue: '-' },
    { time: '점심', tookMedicine: '복용함', missedMedicine: '-', healthIssue: '치통' },
    { time: '저녁', tookMedicine: '복용함', missedMedicine: '-', healthIssue: '복통' },
  ],
};

const TIMES: Array<RecordT['time']> = ['아침', '점심', '저녁'];
const W = Dimensions.get('window').width;
const pad2 = (n: number) => String(n).padStart(2, '0');
const addMonths = (ym: string, delta: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, (m - 1) + delta, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};
const BASE_CAL_HEIGHT = 320;

export default function CalendarTab() {
  const router = useRouter();

  const today = new Date();
  const initialYear = today.getFullYear();
  const initialMonthNum = today.getMonth() + 1;
  const initialMonth = `${initialYear}-${pad2(initialMonthNum)}`;

  const [visibleMonth, setVisibleMonth] = useState<string>(initialMonth); // YYYY-MM
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 연·월 선택 모달
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tempYear, setTempYear] = useState<number>(initialYear);
  const [tempMonth, setTempMonth] = useState<number>(initialMonthNum);

  // 월별 요약 집계
  const monthlySummary = useMemo(() => {
    const summary: Record<string, { medCount: number; issueCount: number }> = {
      아침: { medCount: 0, issueCount: 0 },
      점심: { medCount: 0, issueCount: 0 },
      저녁: { medCount: 0, issueCount: 0 },
    };
    Object.entries(records).forEach(([date, recs]) => {
      if (!date.startsWith(visibleMonth)) return;
      recs.forEach((r) => {
        if (r.tookMedicine && r.tookMedicine !== '-') summary[r.time].medCount += 1;
        if (r.healthIssue && r.healthIssue !== '-') summary[r.time].issueCount += 1;
      });
    });
    return summary;
  }, [visibleMonth]);

  // 달력 마킹
  const marked = useMemo(() => {
    const dots: { [k: string]: any } = {};
    Object.keys(records).forEach((d) => {
      if (d.startsWith(visibleMonth)) dots[d] = { marked: true, dotColor: colors.secondary };
    });
    if (selectedDate) {
      dots[selectedDate] = { ...(dots[selectedDate] || {}), selected: true, selectedColor: colors.primary };
    }
    return dots;
  }, [visibleMonth, selectedDate]);

  const handleDayPress = (day: DateObject) => {
    setSelectedDate((prev) => (prev === day.dateString ? null : day.dateString));
  };

  const handleMonthChange = (m: DateObject) => {
    const ym = `${m.year}-${pad2(m.month)}`;
    setVisibleMonth(ym);
    setSelectedDate(null);
  };

  const getRecordsForDate = (date: string): RecordT[] => {
    return (
      records[date] || [
        { time: '아침', tookMedicine: '~~', missedMedicine: '', healthIssue: '' },
        { time: '점심', tookMedicine: '~~', missedMedicine: '', healthIssue: '' },
        { time: '저녁', tookMedicine: '~~', missedMedicine: '', healthIssue: '' },
      ]
    );
  };

  const [curYear, curMonthNum] = visibleMonth.split('-').map(Number) as [number, number];

  // ── 완전 커스텀 헤더(좌/우 화살표 + 제목 터치)
  const Header = () => (
    <View style={styles.headerBar}>
      <TouchableOpacity
        style={styles.headerArrow}
        onPress={() => {
          const next = addMonths(visibleMonth, -1);
          setVisibleMonth(next);
          setSelectedDate(null);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.headerArrowText}>◀</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerTitleWrap}
        onPress={() => {
          setTempYear(curYear);
          setTempMonth(curMonthNum);
          setPickerOpen(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.headerText}>{curYear}년 {curMonthNum}월</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerArrow}
        onPress={() => {
          const next = addMonths(visibleMonth, +1);
          setVisibleMonth(next);
          setSelectedDate(null);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.headerArrowText}>▶</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 상단 뒤로가기 */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backIcon}>◀</Text>
        <Text style={styles.backText}>뒤로</Text>
      </TouchableOpacity>

      <View style={styles.centerBlock}>
        {/* 1.2배 확대 */}
        <View style={styles.calendarWrapper}>
          <Calendar
            key={visibleMonth}                       // ← 강제 리렌더
            current={`${visibleMonth}-01`}
            style={styles.calendar}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={marked}
            // 화살표/기본 타이틀 숨기고 완전 커스텀 헤더 사용
            hideArrows
            renderHeader={() => <Header />}
            showSixWeeks                 // ✅ 항상 6주로 렌더 → 높이 고정
            hideExtraDays={false}        // 앞/뒤 월 날짜 흐리게 노출(원하면 true로 감춤)
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: colors.panel,
              textSectionTitleColor: colors.textSecondary,
              dayTextColor: colors.textPrimary,
              todayTextColor: colors.danger,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.onPrimary,
              textDisabledColor: '#C7BEB8',
            }}
          />
        </View>

        {/* 월 요약표 / 일별 상세표 토글 */}
        {!selectedDate ? (
          <View style={styles.summaryTable}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>시간</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>복약</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>건강 이상 호소</Text>
            </View>
            {TIMES.map((t) => (
              <View key={t} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.cellText]}>{t}</Text>
                <Text style={[styles.tableCell, styles.cellText]}>{monthlySummary[t].medCount}회</Text>
                <Text style={[styles.tableCell, styles.cellText]}>{monthlySummary[t].issueCount}회</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.summaryTable}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>시간</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>먹은 약</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>놓친 약</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>건강 이상</Text>
            </View>
            {getRecordsForDate(selectedDate).map((r, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.cellText]}>{r.time}</Text>
                <Text style={[styles.tableCell, styles.cellText]}>{r.tookMedicine}</Text>
                <Text style={[styles.tableCell, styles.cellText]}>{r.missedMedicine}</Text>
                <Text style={[styles.tableCell, styles.cellText]}>{r.healthIssue}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 연·월 선택 모달 */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>연·월 선택</Text>

            <View style={styles.yearRow}>
              <TouchableOpacity onPress={() => setTempYear((y) => y - 1)} style={styles.yearBtn}>
                <Text style={styles.yearBtnText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.yearText}>{tempYear}년</Text>
              <TouchableOpacity onPress={() => setTempYear((y) => y + 1)} style={styles.yearBtn}>
                <Text style={styles.yearBtnText}>▶</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.monthGrid}>
              {Array.from({ length: 12 }).map((_, i) => {
                const m = i + 1;
                const active = tempMonth === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.monthCell, active && styles.monthCellActive]}
                    onPress={() => setTempMonth(m)}
                  >
                    <Text style={[styles.monthCellText, active && styles.monthCellTextActive]}>{m}월</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setPickerOpen(false)}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => {
                  const ym = `${tempYear}-${pad2(tempMonth)}`;
                  setVisibleMonth(ym);   // ← 달력 연/월 상태 변경
                  setSelectedDate(null);
                  setPickerOpen(false);
                }}
              >
                <Text style={styles.confirmText}>이동</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    padding: 6,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  backIcon: { fontSize: 18, color: colors.textPrimary, marginRight: 6 },
  backText: { fontSize: 20, color: colors.textPrimary },

  centerBlock: {
    width: W * 0.92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  // 1.2배 확대
  calendarWrapper: { width: '100%', alignItems: 'center' },
  calendar: { width: '100%', borderRadius: 12, overflow: 'hidden' },

  // ── 커스텀 헤더
  headerBar: {
    width: '100%',
    backgroundColor: colors.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerArrow: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  headerArrowText: { fontSize: 18, color: colors.textPrimary },
  headerTitleWrap: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  headerText: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },

  summaryTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.panel,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.panel,
  },
  tableHeaderRow: { backgroundColor: colors.primary, borderBottomColor: colors.primary },
  tableCell: { flex: 1, fontSize: 18, textAlign: 'center' },
  tableHeaderCell: { fontWeight: 'bold', color: colors.onPrimary },
  cellText: { color: colors.textPrimary },

  // ── 모달
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginVertical: 8 },
  yearBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.panel },
  yearBtnText: { fontSize: 16, color: colors.textPrimary },
  yearText: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },

  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  monthCell: { width: 80, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.panel, alignItems: 'center' },
  monthCellActive: { backgroundColor: colors.primary },
  monthCellText: { fontSize: 16, color: colors.textPrimary },
  monthCellTextActive: { color: colors.onPrimary, fontWeight: '600' },

  modalActions: { marginTop: 6, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  cancelBtn: { backgroundColor: colors.panel },
  confirmBtn: { backgroundColor: colors.primary },
  cancelText: { color: colors.textPrimary, fontSize: 16 },
  confirmText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
});
