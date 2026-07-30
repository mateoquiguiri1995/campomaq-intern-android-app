import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ClientDetail } from '@/features/clients/components/ClientDetail';
import { getClientDetail } from '@/features/clients/services/clientDetailService';
import type { Client, ClientDetail as ClientDetailType } from '@/features/clients/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

import { getClients } from '@/features/clients/services/clientService';
import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients } = useAppBootstrap();
  const [client, setClient] = useState<ClientDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      try {
        let found = clients.find((c) => c.id === id);

        if (!found) {
          const res = await getClients({ q: id });
          found = res.clients.find((c) => c.id === id);
        }

        if (!found) {
          throw new Error('Cliente no encontrado');
        }

        const detail = await getClientDetail(found);
        if (isMounted) {
          setClient(detail);
        }
      } catch (err) {
        if (isMounted) {
          setError('No pudimos cargar la ficha del cliente.');
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [id, clients]);

  return (
    <ScreenContainer hasHeader>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Ficha de cliente',
          headerBackTitle: 'Clientes',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.black,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable style={inlineLayoutStyles.clientHeaderAction}>
              <Ionicons name="notifications" size={22} color={colors.black} />
            </Pressable>
          ),
        }}
      />

      {!client && !error && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text style={styles.message}>Cargando ficha del cliente...</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.message}>{error}</Text>
        </View>
      )}

      {client && <ClientDetail client={client} />}
    </ScreenContainer>
  );
}

import { styles } from '@/theme/styles/app_client_id_';
import { inlineLayoutStyles } from '@/theme/styles/inlineLayout';
