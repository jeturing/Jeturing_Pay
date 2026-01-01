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
  TextField,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { useEffect, useState } from "react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerName: string;
  createdAt: string;
  description: string;
}

const PaymentList = ({ userContext, environment }: ExtensionContextValue) => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "succeeded" | "pending" | "failed">("all");

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Mock data - integrar con tu API
      const mockPayments: Payment[] = [
        {
          id: "pi_1234567890",
          amount: 1500.00,
          currency: "mxn",
          status: "succeeded",
          customerName: "Juan Pérez",
          createdAt: new Date().toISOString(),
          description: "Pago de servicio",
        },
        {
          id: "pi_0987654321",
          amount: 850.00,
          currency: "mxn",
          status: "pending",
          customerName: "María García",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          description: "Suscripción mensual",
        },
        {
          id: "pi_1122334455",
          amount: 2300.00,
          currency: "mxn",
          status: "succeeded",
          customerName: "Carlos López",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          description: "Compra de productos",
        },
      ];

      const filteredPayments = filter === "all" 
        ? mockPayments 
        : mockPayments.filter(p => p.status === filter);

      setPayments(filteredPayments);
    } catch (err) {
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge type="positive">Completado</Badge>;
      case "pending":
        return <Badge type="warning">Pendiente</Badge>;
      case "failed":
        return <Badge type="negative">Fallido</Badge>;
      default:
        return <Badge type="neutral">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPayments = payments.filter(payment =>
    payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ContextView title="Jeturing Pay - Pagos">
      <Box css={{ padding: "medium" }}>
        <Stack spacing="medium">
          {/* Header */}
          <Inline spacing="small" alignY="center">
            <Icon name="payment" size="medium" />
            <Text size="large" emphasis>
              Lista de Pagos
            </Text>
          </Inline>

          {/* Search and Filters */}
          <TextField
            label="Buscar"
            placeholder="Buscar por cliente o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Inline spacing="small">
            <Button
              type={filter === "all" ? "primary" : "secondary"}
              onPress={() => setFilter("all")}
              size="small"
            >
              Todos
            </Button>
            <Button
              type={filter === "succeeded" ? "primary" : "secondary"}
              onPress={() => setFilter("succeeded")}
              size="small"
            >
              Completados
            </Button>
            <Button
              type={filter === "pending" ? "primary" : "secondary"}
              onPress={() => setFilter("pending")}
              size="small"
            >
              Pendientes
            </Button>
            <Button
              type={filter === "failed" ? "primary" : "secondary"}
              onPress={() => setFilter("failed")}
              size="small"
            >
              Fallidos
            </Button>
          </Inline>

          <Divider />

          {/* Payment List */}
          {loading ? (
            <Box css={{ textAlign: "center", padding: "large" }}>
              <Spinner size="large" />
            </Box>
          ) : filteredPayments.length === 0 ? (
            <Box css={{ textAlign: "center", padding: "large" }}>
              <Text color="secondary">No se encontraron pagos</Text>
            </Box>
          ) : (
            <List>
              {filteredPayments.map((payment) => (
                <ListItem
                  key={payment.id}
                  title={
                    <Inline spacing="small" alignY="center">
                      <Text emphasis>{payment.customerName}</Text>
                      {getStatusBadge(payment.status)}
                    </Inline>
                  }
                  secondaryTitle={
                    <Stack spacing="xxsmall">
                      <Text size="small" color="secondary">
                        {payment.description}
                      </Text>
                      <Text size="small" color="secondary">
                        {formatDate(payment.createdAt)}
                      </Text>
                    </Stack>
                  }
                  value={
                    <Text emphasis size="medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </Text>
                  }
                />
              ))}
            </List>
          )}

          {/* Summary */}
          <Divider />
          <Inline spread>
            <Text color="secondary">
              {filteredPayments.length} pago(s) encontrado(s)
            </Text>
            <Button onPress={loadPayments} size="small">
              Actualizar
            </Button>
          </Inline>
        </Stack>
      </Box>
    </ContextView>
  );
};

export default PaymentList;
