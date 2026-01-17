import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type TPVMode3ScreenProps = {
  navigation: StackNavigationProp<any>;
};

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  barcode: string;
  stock: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
  notes?: string;
  discount?: number;
}

const TPVMode3Screen: React.FC<TPVMode3ScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const categories = ['Todos', 'Bebidas', 'Comida', 'Snacks', 'Postres', 'Otros'];

  const products: Product[] = [
    { id: '1', name: 'Coca Cola 500ml', price: 2.50, category: 'Bebidas', barcode: '7501234567890', stock: 45 },
    { id: '2', name: 'Agua Mineral', price: 1.50, category: 'Bebidas', barcode: '7501234567891', stock: 60 },
    { id: '3', name: 'Hamburguesa Clásica', price: 8.99, category: 'Comida', barcode: '7501234567892', stock: 15 },
    { id: '4', name: 'Pizza Margarita', price: 12.99, category: 'Comida', barcode: '7501234567893', stock: 8 },
    { id: '5', name: 'Papas Fritas Grande', price: 3.50, category: 'Snacks', barcode: '7501234567894', stock: 30 },
    { id: '6', name: 'Helado Vainilla 1L', price: 4.50, category: 'Postres', barcode: '7501234567895', stock: 20 },
    { id: '7', name: 'Café Americano', price: 2.99, category: 'Bebidas', barcode: '7501234567896', stock: 100 },
    { id: '8', name: 'Sandwich Club', price: 6.50, category: 'Comida', barcode: '7501234567897', stock: 12 },
  ];

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'Todos' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.barcode.includes(searchQuery))
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
      // Clean up notes and discounts
      const newNotes = { ...notes };
      const newDiscounts = { ...discounts };
      delete newNotes[productId];
      delete newDiscounts[productId];
      setNotes(newNotes);
      setDiscounts(newDiscounts);
    }
  };

  const calculateItemTotal = (item: CartItem) => {
    const subtotal = item.price * item.quantity;
    const discount = discounts[item.id] || 0;
    return subtotal - (discount / 100) * subtotal;
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalDiscount = () => {
    return cart.reduce((sum, item) => {
      const subtotal = item.price * item.quantity;
      const discount = discounts[item.id] || 0;
      return sum + ((discount / 100) * subtotal);
    }, 0);
  };

  const getTotal = () => {
    return getSubtotal() - getTotalDiscount();
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
        <Text style={styles.headerTitle}>TPV Avanzado</Text>
        <TouchableOpacity onPress={() => setShowCustomerModal(true)}>
          <MaterialCommunityIcons name="account-plus" size={24} color="#5A67D8" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Left Panel - Products (60%) */}
        <View style={styles.leftPanel}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o código de barras..."
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

          {/* Products Grid */}
          <ScrollView style={styles.productsScroll}>
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => {
                const inCart = cart.find(item => item.id === product.id);
                const remaining = product.stock - (inCart?.quantity || 0);
                
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => addToCart(product)}
                    disabled={remaining <= 0}
                  >
                    <View style={styles.productImageContainer}>
                      <MaterialCommunityIcons 
                        name={product.category === 'Bebidas' ? 'cup' : 'food'} 
                        size={32} 
                        color={remaining <= 0 ? '#B0B8E0' : '#5A67D8'} 
                      />
                      {inCart && (
                        <View style={styles.productBadge}>
                          <Text style={styles.productBadgeText}>{inCart.quantity}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.productDetails}>
                      <Text style={[styles.productName, remaining <= 0 && styles.productNameDisabled]}>
                        {product.name}
                      </Text>
                      <Text style={styles.productBarcode}>#{product.barcode}</Text>
                      <View style={styles.productFooter}>
                        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                        <Text style={[styles.productStock, remaining <= 5 && styles.productStockLow]}>
                          {remaining <= 0 ? 'Agotado' : `${remaining} unid.`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Right Panel - Cart (40%) */}
        <View style={styles.rightPanel}>
          {/* Customer Info */}
          {customerInfo.name && (
            <View style={styles.customerInfo}>
              <View style={styles.customerHeader}>
                <MaterialCommunityIcons name="account" size={20} color="#5A67D8" />
                <Text style={styles.customerName}>{customerInfo.name}</Text>
              </View>
              {customerInfo.email && (
                <Text style={styles.customerDetail}>📧 {customerInfo.email}</Text>
              )}
              {customerInfo.phone && (
                <Text style={styles.customerDetail}>📞 {customerInfo.phone}</Text>
              )}
            </View>
          )}

          {/* Cart Header */}
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Orden ({getItemCount()} items)</Text>
            {cart.length > 0 && (
              <TouchableOpacity onPress={() => setCart([])}>
                <Text style={styles.clearCart}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cart Items */}
          <ScrollView style={styles.cartScroll}>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialCommunityIcons name="cart-outline" size={48} color="#B0B8E0" />
                <Text style={styles.emptyCartText}>Sin productos</Text>
                <Text style={styles.emptyCartSubtext}>Agrega items para comenzar</Text>
              </View>
            ) : (
              cart.map((item, index) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemHeader}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => {
                      const newCart = cart.filter(i => i.id !== item.id);
                      setCart(newCart);
                    }}>
                      <MaterialCommunityIcons name="close" size={18} color="#E25950" />
                    </TouchableOpacity>
                  </View>

                  {/* Quantity and Price */}
                  <View style={styles.cartItemRow}>
                    <View style={styles.quantityControls}>
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
                    <Text style={styles.itemPrice}>
                      ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>

                  {/* Discount */}
                  <View style={styles.cartItemRow}>
                    <Text style={styles.inputLabel}>Descuento %:</Text>
                    <TextInput
                      style={styles.smallInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={discounts[item.id]?.toString() || ''}
                      onChangeText={(text) => {
                        const value = parseFloat(text) || 0;
                        if (value >= 0 && value <= 100) {
                          setDiscounts({ ...discounts, [item.id]: value });
                        }
                      }}
                    />
                  </View>

                  {/* Notes */}
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Notas del pedido..."
                    placeholderTextColor="#B0B8E0"
                    value={notes[item.id] || ''}
                    onChangeText={(text) => setNotes({ ...notes, [item.id]: text })}
                    multiline
                  />

                  {/* Item Total */}
                  <View style={styles.itemTotalRow}>
                    <Text style={styles.itemTotalLabel}>Subtotal:</Text>
                    <Text style={styles.itemTotalValue}>${calculateItemTotal(item).toFixed(2)}</Text>
                  </View>

                  {index < cart.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            )}
          </ScrollView>

          {/* Summary */}
          <View style={styles.summaryPanel}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${getSubtotal().toFixed(2)}</Text>
            </View>
            {getTotalDiscount() > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.discountLabel]}>Descuentos:</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>-${getTotalDiscount().toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IVA (0%):</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.chargeButton, cart.length === 0 && styles.chargeButtonDisabled]}
              disabled={cart.length === 0}
              onPress={() => navigation.navigate('PaymentModeSelection', { 
                amount: getTotal(),
                customer: customerInfo,
                cart,
                notes,
                discounts
              })}
            >
              <MaterialCommunityIcons name="credit-card-check" size={20} color="#FFF" />
              <Text style={styles.chargeButtonText}>Procesar Pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Customer Modal */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Información del Cliente</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#0C0E1D" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre completo"
              placeholderTextColor="#B0B8E0"
              value={customerInfo.name}
              onChangeText={(text) => setCustomerInfo({ ...customerInfo, name: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Correo electrónico"
              placeholderTextColor="#B0B8E0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={customerInfo.email}
              onChangeText={(text) => setCustomerInfo({ ...customerInfo, email: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Teléfono"
              placeholderTextColor="#B0B8E0"
              keyboardType="phone-pad"
              value={customerInfo.phone}
              onChangeText={(text) => setCustomerInfo({ ...customerInfo, phone: text })}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCustomerModal(false)}
            >
              <Text style={styles.modalButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 3,
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
  productCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#E6E8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
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
  productDetails: {
    gap: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0C0E1D',
  },
  productNameDisabled: {
    color: '#B0B8E0',
  },
  productBarcode: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5A67D8',
  },
  productStock: {
    fontSize: 11,
    color: '#32D583',
    fontWeight: '600',
  },
  productStockLow: {
    color: '#E25950',
  },
  rightPanel: {
    flex: 2,
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E6E8F4',
  },
  customerInfo: {
    padding: 16,
    backgroundColor: '#F0F4FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8F4',
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  customerDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
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
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityControls: {
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
  itemPrice: {
    fontSize: 13,
    color: '#64748B',
  },
  inputLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  smallInput: {
    width: 60,
    height: 32,
    borderWidth: 1,
    borderColor: '#E6E8F4',
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#0C0E1D',
    textAlign: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E6E8F4',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    color: '#0C0E1D',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  itemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E6E8F4',
  },
  itemTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  itemTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E8F4',
    marginTop: 12,
  },
  summaryPanel: {
    padding: 16,
    borderTopWidth: 2,
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
  discountLabel: {
    color: '#E25950',
  },
  discountValue: {
    color: '#E25950',
  },
  totalRow: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E6E8F4',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  totalValue: {
    fontSize: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E6E8F4',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0C0E1D',
    marginBottom: 16,
  },
  modalButton: {
    height: 52,
    backgroundColor: '#0022FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default TPVMode3Screen;
