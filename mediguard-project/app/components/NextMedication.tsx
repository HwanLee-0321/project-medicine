// components/NextMedication.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const medicationTimes = [
  { hour: 8, minute: 0 },
  { hour: 13, minute: 0 },
  { hour: 18, minute: 0 },
];

const formatTime = (hour: number, minute: number) => {
  const suffix = hour >= 12 ? '오후' : '오전';
  const formattedHour = hour > 12 ? hour - 12 : hour;
  const paddedMinute = minute.toString().padStart(2, '0');
  return `${suffix} ${formattedHour}시 ${paddedMinute}분`;
};

const getNextMedicationTime = (): string => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let time of medicationTimes) {
    const timeMinutes = time.hour * 60 + time.minute;
    if (nowMinutes < timeMinutes) {
      return formatTime(time.hour, time.minute);
    }
  }

  // 다음날 첫 복약 시간
  const first = medicationTimes[0];
  return `내일 ${formatTime(first.hour, first.minute)}`;
};

const NextMedication = () => {
  const [nextTime, setNextTime] = useState(getNextMedicationTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setNextTime(getNextMedicationTime());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>다음 복약 시간</Text>
      <Text style={styles.time}>{nextTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 28,
    fontWeight: '600',
  },
  time: {
    fontSize: 36,
    marginTop: 10,
    color: '#0a84ff',
    fontWeight: 'bold',
  },
});

export default NextMedication;
