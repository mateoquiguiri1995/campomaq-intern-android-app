import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { Button } from '@/components/common/Button';
import { PlaceholderCard } from '@/components/common/PlaceholderCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { DraftQuoteCard } from '@/features/quotes/components/DraftQuoteCard';
import { deleteQuote, listQuotes } from '@/features/quotes/services/quoteService';
import type { Quote } from '@/features/quotes/types';
import { spacing } from '@/theme/spacing';

/**
 * Pestaña Reportes: punto de entrada de cotizaciones.
 *
 * Las cotizaciones se generan y comparten como PDF desde el propio
 * teléfono del vendedor; no se guardan en ninguna base de datos.
 */
export default function ReportsScreen() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuotes = useCallback(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    listQuotes()
      .then((data) => {
        if (!isMounted) return;
        setQuotes(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setQuotes([]);
        setError(err instanceof Error ? err.message : 'No pudimos cargar las cotizaciones.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => loadQuotes(), [loadQuotes])
  );

  function handleNewQuote() {
    router.push('/quotes/select-client');
  }

  function handleOpenQuote(quote: Quote) {
    router.push({ pathname: '/quotes/summary', params: { draftId: quote.id } });
  }

  function handleDeleteQuote(quote: Quote) {
    Alert.alert('Eliminar cotización', '¿Seguro que quieres eliminar esta cotización guardada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteQuote(quote.id);
            setQuotes((current) => current.filter((q) => q.id !== quote.id));
          } catch (err) {
            Alert.alert(
              'No se pudo eliminar',
              err instanceof Error ? err.message : 'Intenta de nuevo.'
            );
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <AppHeader title="Reportes" subtitle="Cotizaciones" />

      <Button label="Nueva cotización" onPress={handleNewQuote} />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.message}>Cargando cotizaciones...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>No pudimos cargar las cotizaciones</Text>
          <Text style={styles.message}>{error}</Text>
          <Button label="Reintentar" variant="ghost" onPress={loadQuotes} />
        </View>
      )}

      {!loading && quotes.length === 0 && (
        <PlaceholderCard
          icon="🧾"
          title="Aún no tienes cotizaciones"
          description="Crea tu primera cotización con el botón de arriba."
        />
      )}

      {quotes.length > 0 && (
        <View style={styles.list}>
          {quotes.map((quote) => (
            <DraftQuoteCard
              key={quote.id}
              quote={quote}
              onPress={() => handleOpenQuote(quote)}
              onDelete={() => handleDeleteQuote(quote)}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  message: {
    textAlign: 'center',
  },
  errorTitle: {
    fontWeight: '700',
  },
});
