import {
  Badge,
  Box,
  Button,
  ContextView,
  Divider,
  Icon,
  Inline,
  List,
  ListItem,
  Spinner,
  Stack,
  Text,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { useEffect, useState } from "react";

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  created: string;
  totalSpent: number;
  transactionCount: number;
  lastPaymentDate: string;
  paymentMethods: {
    type: string;
    last4: string;
    brand: string;
  }[];
  recentPayments: {
    id: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

const CustomerDetail = ({ userContext, environment, objectContext }: ExtensionContextValue) => {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get customer ID from context
  const customerId = objectContext?.id;

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      // Mock data - integrar con tu API
      const mockCustomer: CustomerData = {
        id: customerId || "cus_mock123",
        name: "Juan Pérez",
        email: "juan.perez@email.com",
        phone: "+52 55 1234 5678",
        created: new Date(Date.now() - 30 * 86400000).toISOString(),
        totalSpent: 15680.50,
        transactionCount: 23,
        lastPaymentDate: new Date(Date.now() - 86400000).toISOString(),
        paymentMethods: [
          { type: "card", last4: "4242", brand: "Visa" },
          { type: "card", last4: "1234", brand: "Mastercard" },
        ],
        recentPayments: [
          { id: "pi_001", amount: 1500.00, status: "succeeded", date: new Date().toISOString() },
          { id: "pi_002", amount: 850.00, status: "succeeded", date: new Date(Date.now() - 86400000).toISOString() },
          { id: "pi_003", amount: 2300.00, status: "pending", date: new Date(Date.now() - 172800000).toISOString() },
        ],
      };
      setCustomer(mockCustomer);
    } catch (err) {
      setError("Error al cargar datos del cliente");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge type="positive">✓</Badge>;
      case "pending":
        return <Badge type="warning">⏳</Badge>;
      case "failed":
        return <Badge type="negative">✗</Badge>;
      default:
        return <Badge type="neutral">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <ContextView title="Jeturing Pay - Cliente">
        <Box css={{ padding: "large", textAlign: "center" }}>
          <Spinner size="large" />
          <Text>Cargando información del cliente...</Text>
        </Box>
      </ContextView>
    );
  }

  if (error || !customer) {
    return (
      <ContextView title="Jeturing Pay - Cliente">
        <Box css={{ padding: "large" }}>
          <Text color="critical">{error || "Cliente no encontrado"}</Text>
          <Button onPress={loadCustomerData}>Reintentar</Button>
        </Box>
      </ContextView>
    );
  }

  return (
    <ContextView title="Jeturing Pay - Detalle de Cliente">
      <Box css={{ padding: "medium" }}>
        <Stack spacing="medium">
          {/* Customer Header */}
          <Box css={{ padding: "medium", backgroundColor: "container", borderRadius: "medium" }}>
            <Stack spacing="small">
              <Inline spacing="small" alignY="center">
                <Icon name="user" size="medium" />
                <Text size="large" emphasis>
                  {customer.name}
                </Text>
              </Inline>
              <Text size="small" color="secondary">
                {customer.email}
              </Text>
              <Text size="small" color="secondary">
                {customer.phone}
              </Text>
              <Text size="xsmall" color="secondary">
                Cliente desde: {formatDate(customer.created)}
              </Text>
            </Stack>
          </Box>

          <Divider />

          {/* Customer Stats */}
          <Text size="medium" emphasis>
            Resumen de Actividad
          </Text>
          <Box css={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "small" }}>
            <Box css={{ padding: "small", backgroundColor: "container", borderRadius: "medium" }}>
              <Stack spacing="xxsmall">
                <Text size="xsmall" color="secondary">
                  Total Gastado
                </Text>
                <Text size="medium" emphasis color="success">
                  {formatCurrency(customer.totalSpent)}
                </Text>
              </Stack>
            </Box>
            <Box css={{ padding: "small", backgroundColor: "container", borderRadius: "medium" }}>
              <Stack spacing="xxsmall">
                <Text size="xsmall" color="secondary">
                  Transacciones
                </Text>
                <Text size="medium" emphasis>
                  {customer.transactionCount}
                </Text>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* Payment Methods */}
          <Text size="medium" emphasis>
            Métodos de Pago
          </Text>
          <List>
            {customer.paymentMethods.map((method, index) => (
              <ListItem
                key={index}
                title={
                  <Inline spacing="small">
                    <Icon name="payment" size="small" />
                    <Text>{method.brand}</Text>
                  </Inline>
                }
                secondaryTitle={`**** **** **** ${method.last4}`}
              />
            ))}
          </List>

          <Divider />

          {/* Recent Payments */}
          <Text size="medium" emphasis>
            Pagos Recientes
          </Text>
          <List>
            {customer.recentPayments.map((payment) => (
              <ListItem
                key={payment.id}
                title={
                  <Inline spacing="small" alignY="center">
                    <Text>{formatCurrency(payment.amount)}</Text>
                    {getStatusBadge(payment.status)}
                  </Inline>
                }
                secondaryTitle={formatDate(payment.date)}
              />
            ))}
          </List>

          {/* Actions */}
          <Divider />
          <Inline spacing="small">
            <Button type="primary" size="small">
              Nuevo Cobro
            </Button>
            <Button type="secondary" size="small">
              Enviar Recibo
            </Button>
          </Inline>
        </Stack>
      </Box>
    </ContextView>
  );
};

export default CustomerDetail;
