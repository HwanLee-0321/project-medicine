// components/CalendarTab.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';

type Record = {
  time: string;
  tookMedicine: string;
  missedMedicine: string;
  healthIssue: string;
};

// 예시 데이터
const records: { [date: string]: Record[] } = {
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

export default function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getRecordsForDate = (date: string): Record[] => {
    return (
      records[date] || [
        { time: '아침', tookMedicine: '~~', missedMedicine: '', healthIssue: '' },
        { time: '점심', tookMedicine: '~~', missedMedicine: '', healthIssue: '' },
        { time: '저녁', tookMedicine: '~~', missedMedicine: '', healthIssue: '' },
      ]
    );
  };

  return (
    <View style={styles.historyWrapper}>
      <Calendar
        style={styles.calendar}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...Object.keys(records).reduce((acc, date) => {
            acc[date] = { marked: true, dotColor: 'blue' };
            return acc;
          }, {} as { [key: string]: any }),
          ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#2a5dab' } } : {}),
        }}
      />

      {selectedDate ? (
        <View style={styles.summaryTable}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>시간</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>먹은 약</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>놓친 약</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>건강 이상</Text>
          </View>

          {getRecordsForDate(selectedDate).map((record, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCell}>{record.time}</Text>
              <Text style={styles.tableCell}>{record.tookMedicine}</Text>
              <Text style={styles.tableCell}>{record.missedMedicine}</Text>
              <Text style={styles.tableCell}>{record.healthIssue}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>날짜를 선택하세요.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  calendar: {
    width: Dimensions.get('window').width * 0.9,
    borderRadius: 10,
  },
  summaryTable: {
    marginTop: 20,
    width: Dimensions.get('window').width * 0.9,
    borderWidth: 1,
    borderColor: '#2a5dab',
    borderRadius: 8,
    backgroundColor: '#f0f4fb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#2a5dab',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tableHeaderRow: {
    backgroundColor: '#2a5dab',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
