import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from '@expo/vector-icons/MaterialIcons';
import FeaturesTab from './components/FeaturesTab';  // 상대경로 맞춰서 import

const screenWidth = Dimensions.get("window").width;

type TabType = "dashboard" | "features";

const Caregiver: React.FC = () => {
  const [tab, setTab] = useState<TabType>("dashboard");

  const medicationData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [{ data: [3, 4, 2, 5, 3, 4, 1] }],
  };

  return (
    <View/>
  );
};

export default Caregiver;
