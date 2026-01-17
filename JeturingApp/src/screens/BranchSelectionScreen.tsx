import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'BranchSelection'>;

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  terminalId: string;
}

const BRANCHES: Branch[] = [
  {
    id: '1',
    name: 'Sucursal Principal',
    address: 'Av. Principal #123, Centro',
    phone: '+1 (555) 123-4567',
    terminalId: 'term_abc123',
  },
  {
    id: '2',
    name: 'Sucursal Norte',
    address: 'Calle Norte #456, Zona Norte',
    phone: '+1 (555) 234-5678',
    terminalId: 'term_def456',
  },
  {
    id: '3',
    name: 'Sucursal Sur',
    address: 'Av. Sur #789, Zona Sur',
    phone: '+1 (555) 345-6789',
    terminalId: 'term_ghi789',
  },
];

export default function BranchSelectionScreen({ navigation }: Props) {
  const [selectedBranch, setSelectedBranch] = useState('1');

  const handleContinue = () => {
    const branch = BRANCHES.find(b => b.id === selectedBranch);
    navigation.navigate('Dashboard', { branch });
  };

  const renderBranchItem = ({ item }: { item: Branch }) => (
    <TouchableOpacity
      style={[
        styles.branchCard,
        selectedBranch === item.id && styles.branchCardSelected,
      ]}
      onPress={() => setSelectedBranch(item.id)}
    >
      <View style={styles.branchHeader}>
        <View style={styles.branchIcon}>
          <MaterialCommunityIcons name="store" size={24} color="#0022FF" />
        </View>
        <View style={styles.branchInfo}>
          <Text style={styles.branchName}>{item.name}</Text>
          <Text style={styles.branchDetail}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#64748B" />
            {' '}{item.address}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={selectedBranch === item.id ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={24}
          color={selectedBranch === item.id ? '#0022FF' : '#CBD5E1'}
        />
      </View>

      <View style={styles.branchFooter}>
        <View style={styles.branchDetailRow}>
          <MaterialCommunityIcons name="phone" size={16} color="#64748B" />
          <Text style={styles.branchDetailText}>{item.phone}</Text>
        </View>
        <View style={styles.branchDetailRow}>
          <MaterialCommunityIcons name="credit-card-wireless" size={16} color="#64748B" />
          <Text style={styles.branchDetailText}>{item.terminalId}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Selecciona sucursal</Text>
        <Text style={styles.subtitle}>
          Elige la ubicación donde se realizará el cobro
        </Text>

        {/* Branch List */}
        <FlatList
          data={BRANCHES}
          renderItem={renderBranchItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.branchList}
        />

        {/* Add New Branch */}
        <TouchableOpacity style={styles.addBranchButton}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="#0022FF" />
          <Text style={styles.addBranchText}>Agregar nueva sucursal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    lineHeight: 24,
  },
  branchList: {
    gap: 16,
  },
  branchCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  branchCardSelected: {
    borderColor: '#0022FF',
    backgroundColor: '#F0F4FF',
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  branchIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  branchDetail: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  branchFooter: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  branchDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  branchDetailText: {
    fontSize: 13,
    color: '#64748B',
  },
  addBranchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#0022FF',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  addBranchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0022FF',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  continueButton: {
    backgroundColor: '#0022FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
