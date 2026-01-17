import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'NewPayment'>;

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const CATEGORIES = ['Todas', 'Bebidas', 'Snacks', 'Postres', 'Otros'];

export default function NewPaymentScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([
    { id: '1', name: 'Producto Ejemplo 1', quantity: 2, price: 150.00 },
    { id: '2', name: 'Otro Producto Largo', quantity: 1, price: 45.50 },
  ]);

  const total = selectedProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const handleContinue = () => {
    navigation.navigate('PaymentModeSelection', { amount: total });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productQuantity}>
          {item.quantity} x ${item.price.toFixed(2)}
        </Text>
      </View>
      <Text style={styles.productTotal}>${(item.quantity * item.price).toFixed(2)}</Text>
      <TouchableOpacity onPress={() => handleRemoveProduct(item.id)}>
        <MaterialCommunityIcons name="delete" size={24} color="#E25950" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C0E1D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Cobro (TPV de Inventario)</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={24} color="#4551A1" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar producto..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#4551A1"
            />
          </View>
          <TouchableOpacity style={styles.scannerButton}>
            <MaterialCommunityIcons name="barcode-scan" size={24} color="#0C0E1D" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Products */}
        <View style={styles.productsCard}>
          <Text style={styles.sectionTitle}>Productos seleccionados</Text>
          <FlatList
            data={selectedProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
          <View style={styles.separator} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Information */}
        <Text style={styles.sectionTitle}>Información</Text>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="store" size={24} color="#0C0E1D" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Sucursal seleccionada</Text>
            <Text style={styles.infoValue}>Sucursal Central</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="account" size={24} color="#0C0E1D" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Cajero</Text>
            <Text style={styles.infoValue}>Usuario Activo</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Cobrar ahora</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('TransactionHistory')}>
          <Text style={styles.secondaryButtonText}>Ver historial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8FC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0C0E1D',
    flex: 1,
    textAlign: 'center',
    marginRight: -24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E8F4',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#0C0E1D',
  },
  scannerButton: {
    width: 56,
    height: 56,
    backgroundColor: '#E6E8F4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C0E1D',
    marginBottom: 12,
  },
  categories: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF',
  },
  categoryButtonActive: {
    backgroundColor: '#0022FF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0C0E1D',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  productsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0C0E1D',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#4551A1',
  },
  productTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C0E1D',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0C0E1D',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0C0E1D',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F8F8FC',
    padding: 16,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0C0E1D',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#4551A1',
  },
  bottomButtons: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#0022FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButton: {
    backgroundColor: '#E6E8F4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C0E1D',
  },
});
