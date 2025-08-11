import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0부터 시작
  const date = now.getDate();
  const day = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];

  return `${year}년 ${month}월 ${date}일 ${day}요일`;
};

const getFormattedTime = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const suffix = hour >= 12 ? '오후' : '오전';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedMinute = minute.toString().padStart(2, '0');
  return `${suffix} ${formattedHour}시 ${formattedMinute}분`;
};

const CurrentTime = () => {
  const [currentDate, setCurrentDate] = useState(getFormattedDate());
  const [currentTime, setCurrentTime] = useState(getFormattedTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(getFormattedDate());
      setCurrentTime(getFormattedTime());
    }, 60 * 1000); // 1분마다 갱신

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{currentDate}</Text>
      <Text style={styles.time}>{currentTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    fontSize: 22,
    fontWeight: '500',
    color: '#555',
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 4,
  },
});

export default CurrentTime;
