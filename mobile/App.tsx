import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { 
  MD3DarkTheme, 
  Provider as PaperProvider, 
  Text, 
  Surface 
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import StockSearch from './src/components/StockSearch';
import StockCalculator from './src/components/StockCalculator';
import { Search, Calculator } from 'lucide-react-native';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7c3aed',
    secondary: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b',
    outline: 'rgba(255,255,255,0.1)',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'calc'>('search');

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          
          {/* App Header */}
          <View style={styles.header}>
            <View>
              <Text variant="headlineMedium" style={styles.headerTitle}>
                Personal Tracker
              </Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                {activeTab === 'search' ? 'Market Overview' : 'Average Calculator'}
              </Text>
            </View>

            {/* Tab Toggle */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                onPress={() => setActiveTab('search')}
                style={[styles.tab, activeTab === 'search' && styles.activeTab]}
              >
                <Search size={20} color={activeTab === 'search' ? '#fff' : '#64748b'} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab('calc')}
                style={[styles.tab, activeTab === 'calc' && styles.activeTab]}
              >
                <Calculator size={20} color={activeTab === 'calc' ? '#fff' : '#64748b'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {activeTab === 'search' ? <StockSearch /> : <StockCalculator />}
          </View>
          
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#64748b',
    marginTop: -4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    padding: 8,
    borderRadius: 8,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
  },
  content: {
    flex: 1,
  },
});
