import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type TPVMode2ScreenProps = {
  navigation: StackNavigationProp<any>;
};

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const TPVMode2Screen: React.FC<TPVMode2ScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['Todos', 'Bebidas', 'Comida', 'Snacks', 'Postres', 'Otros'];

  const products: Product[] = [
    { id: '1', name: 'Coca Cola 500ml', price: 2.50, category: 'Bebidas', stock: 45 },
    { id: '2', name: 'Agua Mineral', price: 1.50, category: 'Bebidas', stock: 60 },
    { id: '3', name: 'Hamburguesa Clásica', price: 8.99, category: 'Comida', stock: 15 },
    { id: '4', name: 'Pizza Margarita', price: 12.99, category: 'Comida', stock: 8 },
    { id: '5', name: 'Papas Fritas', price: 3.50, category: 'Snacks', stock: 30 },
    { id: '6', name: 'Helado Vainilla', price: 4.50, category: 'Postres', stock: 20 },
    { id: '7', name: 'Café Americano', price: 2.99, category: 'Bebidas', stock: 100 },
    { id: '8', name: 'Sandwich Club', price: 6.50, category: 'Comida', stock: 12 },
  ];

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'Todos' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
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

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="menu" size={24} color="#0C0E1D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Punto de Venta</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <MaterialCommunityIcons 
              name={viewMode === 'grid' ? 'view-list' : 'view-grid'} 
              size={20} 
              color="#5A67D8" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Left Panel - Products */}
        <View style={styles.leftPanel}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar producto o código..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.scanButton}>
                <MaterialCommunityIcons name="barcode-scan" size={20} color="#5A67D8" />
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

          {/* Products */}
          <ScrollView style={styles.productsScroll}>
            <View style={viewMode === 'grid' ? styles.productsGrid : styles.productsList}>
              {filteredProducts.map((product) => {
                const inCart = cart.find(item => item.id === product.id);
                const remaining = product.stock - (inCart?.quantity || 0);
                
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={viewMode === 'grid' ? styles.productCardGrid : styles.productCardList}
                    onPress={() => addToCart(product)}
                    disabled={remaining <= 0}
                  >
                    <View style={styles.productIcon}>
                      <MaterialCommunityIcons 
                        name={product.category === 'Bebidas' ? 'cup' : 'food'} 
                        size={viewMode === 'grid' ? 28 : 24} 
                        color={remaining <= 0 ? '#B0B8E0' : '#5A67D8'} 
                      />
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, remaining <= 0 && styles.productNameDisabled]}>
                        {product.name}
                      </Text>
                      <Text style={styles.productStock}>
                        Stock: {remaining}
                      </Text>
                      <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                    </View>
                    {inCart && (
                      <View style={styles.productBadge}>
                        <Text style={styles.productBadgeText}>{inCart.quantity}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Right Panel - Cart */}
        <View style={styles.rightPanel}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Orden Actual</Text>
            {cart.length > 0 && (
              <TouchableOpacity onPress={() => setCart([])}>
                <Text style={styles.clearCart}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.cartScroll}>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialCommunityIcons name="cart-outline" size={48} color="#B0B8E0" />
                <Text style={styles.emptyCartText}>Carrito vacío</Text>
                <Text style={styles.emptyCartSubtext}>Agrega productos para comenzar</Text>
              </View>
            ) : (
              cart.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemHeader}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <MaterialCommunityIcons name="close" size={18} color="#E25950" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cartItemFooter}>
                    <View style={styles.cartItemQuantity}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <MaterialCommunityIcons name="minus" size={14} color="#FFF" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => addToCart(item)}
                        disabled={item.quantity >= item.stock}
                      >
                        <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cartItemTotal}>
                      ${(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Cart Summary */}
          <View style={styles.cartSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({getItemCount()} items)</Text>
              <Text style={styles.summaryValue}>${getTotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IVA (0%)</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.chargeButton, cart.length === 0 && styles.chargeButtonDisabled]}
              disabled={cart.length === 0}
              onPress={() => navigation.navigate('PaymentModeSelection', { amount: getTotal() })}
            >
              <MaterialCommunityIcons name="credit-card-outline" size={20} color="#FFF" />
              <Text style={styles.chargeButtonText}>Procesar Pago</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8F4',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C0E1D',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 2,
    backgroundColor: '#F7F8FC',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0C0E1D',
  },
  scanButton: {
    padding: 4,
  },
  categoriesScroll: {
    maxHeight: 52,
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
    backgroundColor: '#E6E8F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#5A67D8',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4551A1',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  productsScroll: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  productsList: {
    padding: 16,
    gap: 12,
  },
  productCardGrid: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  productCardList: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  productIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6E8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0C0E1D',
    marginBottom: 4,
    textAlign: 'center',
  },
  productNameDisabled: {
    color: '#B0B8E0',
  },
  productStock: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5A67D8',
    textAlign: 'center',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0022FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E6E8F4',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8F4',
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  clearCart: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E25950',
  },
  cartScroll: {
    flex: 1,
    padding: 16,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 13,
    color: '#B0B8E0',
    marginTop: 4,
  },
  cartItem: {
    backgroundColor: '#F7F8FC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C0E1D',
    flex: 1,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5A67D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0C0E1D',
    minWidth: 20,
    textAlign: 'center',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  cartSummary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E8F4',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C0E1D',
  },
  totalRow: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E8F4',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0022FF',
  },
  chargeButton: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#0022FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
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

export default TPVMode2Screen;
