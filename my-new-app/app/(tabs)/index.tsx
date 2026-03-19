import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StockSearch from '@/components/StockSearch';
import StockCalculator from '@/components/StockCalculator';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Stock Average Calculator
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            ค้นหาราคาหุ้นและคำนวณต้นทุนเฉลี่ยต่อหุ้น (DCA)
          </Text>
        </View>

        {/* Stock Search + Chart */}
        <StockSearch />

        <View style={{ height: 20 }} />

        {/* Stock Calculator */}
        <StockCalculator />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#94a3b8',
    marginTop: 4,
  },
});
