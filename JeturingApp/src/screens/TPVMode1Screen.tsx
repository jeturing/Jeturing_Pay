import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type TPVMode1ScreenProps = {
  navigation: StackNavigationProp<any>;
};

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const TPVMode1Screen: React.FC<TPVMode1ScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);

  const categories = ['Todos', 'Bebidas', 'Comida', 'Snacks', 'Postres'];

  const products: Product[] = [
    { id: '1', name: 'Coca Cola', price: 2.50, category: 'Bebidas' },
    { id: '2', name: 'Agua', price: 1.50, category: 'Bebidas' },
    { id: '3', name: 'Hamburguesa', price: 8.99, category: 'Comida' },
    { id: '4', name: 'Pizza', price: 12.99, category: 'Comida' },
    { id: '5', name: 'Papas Fritas', price: 3.50, category: 'Snacks' },
    { id: '6', name: 'Helado', price: 4.50, category: 'Postres' },
  ];

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'Todos' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.id === productId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="menu" size={24} color="#0C0E1D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Cobro</Text>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>JETURING</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.searchIconLeft}>
            <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.scannerButton}>
            <MaterialCommunityIcons name="barcode-scan" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => addToCart(product)}
            >
              <View style={styles.productIcon}>
                <MaterialCommunityIcons 
                  name={product.category === 'Bebidas' ? 'cup' : 'food'} 
                  size={32} 
                  color="#5A67D8" 
                />
              </View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cart */}
        {cart.length > 0 && (
          <View style={styles.cartSection}>
            <Text style={styles.cartTitle}>Carrito</Text>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>
                    {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.cartItemActions}>
                  <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => removeFromCart(item.id)}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={styles.cartQuantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => addToCart(item)}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${getTotal().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.chargeButton, cart.length === 0 && styles.chargeButtonDisabled]}
          disabled={cart.length === 0}
          onPress={() => navigation.navigate('PaymentModeSelection', { amount: getTotal() })}
        >
          <Text style={styles.chargeButtonText}>Cobrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C0E1D',
    flex: 1,
    textAlign: 'center',
  },
  logoContainer: {
    width: 40,
  },
  logoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5A67D8',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconLeft: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0C0E1D',
    paddingHorizontal: 8,
  },
  scannerButton: {
    width: 48,
    backgroundColor: '#0022FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  categoriesScroll: {
    maxHeight: 52,
    backgroundColor: '#FFF',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  categoryChip: {
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 34, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  productIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6E8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C0E1D',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A67D8',
  },
  cartSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C0E1D',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8F4',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C0E1D',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 13,
    color: '#64748B',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5A67D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C0E1D',
    minWidth: 24,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E6E8F4',
    gap: 16,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  chargeButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#0022FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chargeButtonDisabled: {
    backgroundColor: '#B0B8E0',
  },
  chargeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default TPVMode1Screen;
