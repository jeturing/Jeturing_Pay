import {
  Box,
  Button,
  ContextView,
  Divider,
  Icon,
  Inline,
  Link,
  List,
  ListItem,
  Spinner,
  Stack,
  Text,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { useEffect, useState } from "react";

const API_URL = "https://api-001.sajet.us";

interface DashboardStats {
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
  connectedDevices: number;
}

const JeturingHome = ({ userContext, environment }: ExtensionContextValue) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      // Simulación de stats - integrar con tu API
      const mockStats: DashboardStats = {
        totalPayments: 1250,
        totalRevenue: 45680.50,
        pendingPayments: 12,
        connectedDevices: 5,
      };
      setStats(mockStats);
    } catch (err) {
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ContextView title="Jeturing Pay">
        <Box css={{ padding: "large", textAlign: "center" }}>
          <Spinner size="large" />
          <Text>Cargando dashboard...</Text>
        </Box>
      </ContextView>
    );
  }

  if (error) {
    return (
      <ContextView title="Jeturing Pay">
        <Box css={{ padding: "large" }}>
          <Text color="critical">{error}</Text>
          <Button onPress={loadDashboardStats}>Reintentar</Button>
        </Box>
      </ContextView>
    );
  }

  return (
    <ContextView title="Jeturing Pay - Dashboard">
      <Box css={{ padding: "medium" }}>
        <Stack spacing="medium">
          {/* Header */}
          <Inline spacing="small" alignY="center">
            <Icon name="payment" size="medium" />
            <Text size="large" emphasis>
              Panel de Control
            </Text>
          </Inline>

          <Divider />

          {/* Stats Grid */}
          <Box css={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "medium" }}>
            <Box css={{ padding: "medium", backgroundColor: "container", borderRadius: "medium" }}>
              <Stack spacing="xsmall">
                <Text size="small" color="secondary">
                  Total de Pagos
                </Text>
                <Text size="xlarge" emphasis>
                  {stats?.totalPayments.toLocaleString()}
                </Text>
              </Stack>
            </Box>

            <Box css={{ padding: "medium", backgroundColor: "container", borderRadius: "medium" }}>
              <Stack spacing="xsmall">
                <Text size="small" color="secondary">
                  Ingresos Totales
                </Text>
                <Text size="xlarge" emphasis>
                  ${stats?.totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </Text>
              </Stack>
            </Box>

            <Box css={{ padding: "medium", backgroundColor: "container", borderRadius: "medium" }}>
              <Stack spacing="xsmall">
                <Text size="small" color="secondary">
                  Pagos Pendientes
                </Text>
                <Text size="xlarge" emphasis color="warning">
                  {stats?.pendingPayments}
                </Text>
              </Stack>
            </Box>

            <Box css={{ padding: "medium", backgroundColor: "container", borderRadius: "medium" }}>
              <Stack spacing="xsmall">
                <Text size="small" color="secondary">
                  Dispositivos Activos
                </Text>
                <Text size="xlarge" emphasis color="success">
                  {stats?.connectedDevices}
                </Text>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* Quick Actions */}
          <Text size="medium" emphasis>
            Acciones Rápidas
          </Text>

          <List>
            <ListItem
              title="Gestionar Dispositivos"
              secondaryTitle="Administrar dispositivos de cobro autorizados"
              css={{ cursor: "pointer" }}
            />
            <ListItem
              title="Ver Transacciones"
              secondaryTitle="Historial completo de pagos"
              css={{ cursor: "pointer" }}
            />
            <ListItem
              title="Configuración"
              secondaryTitle="Ajustes de la cuenta y notificaciones"
              css={{ cursor: "pointer" }}
            />
          </List>

          <Divider />

          {/* Footer */}
          <Box css={{ textAlign: "center", paddingTop: "medium" }}>
            <Text size="small" color="secondary">
              Jeturing Pay v1.0.0
            </Text>
            <Link href="https://jeturing.com/soporte" external>
              Soporte
            </Link>
          </Box>
        </Stack>
      </Box>
    </ContextView>
  );
};

export default JeturingHome;
