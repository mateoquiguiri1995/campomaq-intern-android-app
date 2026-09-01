import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles/src_features_quotes_components_QuoteTermsModal';

export interface PRESET_OPTION {
  id: string;
  label: string;
  text: string;
}

export const PRESET_TERMS: PRESET_OPTION[] = [
  {
    id: 'term_1',
    label: 'Forma de Pago',
    text: '1. Forma de Pago: Contra entrega o crédito autorizado previo.',
  },
  {
    id: 'term_2',
    label: 'Garantía del Producto',
    text: '2. Garantía: 1 año de garantía total contra defectos de fabricación en talleres autorizados.',
  },
  {
    id: 'term_3',
    label: 'Stock de Repuestos',
    text: '3. Repuestos: Stock de repuestos originales garantizado por 5 años.',
  },
  {
    id: 'term_4',
    label: 'Vigencia de Proforma',
    text: '4. Validez de la oferta: 30 días a partir de la fecha de emisión.',
  },
];

export const PRESET_OBSERVATIONS: PRESET_OPTION[] = [
  {
    id: 'obs_1',
    label: 'Mantenimiento Preventivo',
    text: 'El precio especial de la proforma incluye el primer mantenimiento preventivo gratuito a las 50 horas de uso.',
  },
  {
    id: 'obs_2',
    label: 'Entrega en Bodega',
    text: 'Las entregas se realizarán directamente en las bodegas del cliente sin costo adicional de transporte dentro del perímetro urbano.',
  },
  {
    id: 'obs_3',
    label: 'Sujeto a Stock',
    text: 'Precios y disponibilidad de productos sujetos a cambio sin previo aviso según disponibilidad de stock.',
  },
];

interface QuoteTermsModalProps {
  visible: boolean;
  initialTerms?: string;
  initialObservations?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (values: { termsAndConditions: string; observations: string }) => void;
}

export function QuoteTermsModal({
  visible,
  initialTerms = '',
  initialObservations = '',
  loading = false,
  onCancel,
  onConfirm,
}: QuoteTermsModalProps) {
  const [selectedTerms, setSelectedTerms] = useState<Record<string, boolean>>({});
  const [customTerms, setCustomTerms] = useState('');
  const [selectedObs, setSelectedObs] = useState<Record<string, boolean>>({});
  const [customObs, setCustomObs] = useState('');

  useEffect(() => {
    if (visible) {
      // Parse initialTerms to match preset terms if available
      const termsMap: Record<string, boolean> = {};
      let remainingTerms = initialTerms;

      PRESET_TERMS.forEach((preset) => {
        if (initialTerms && initialTerms.includes(preset.text)) {
          termsMap[preset.id] = true;
          remainingTerms = remainingTerms.replace(preset.text, '').trim();
        } else {
          termsMap[preset.id] = false;
        }
      });
      setSelectedTerms(termsMap);
      setCustomTerms(remainingTerms);

      // Parse initialObservations to match preset observations if available
      const obsMap: Record<string, boolean> = {};
      let remainingObs = initialObservations;

      PRESET_OBSERVATIONS.forEach((preset) => {
        if (initialObservations && initialObservations.includes(preset.text)) {
          obsMap[preset.id] = true;
          remainingObs = remainingObs.replace(preset.text, '').trim();
        } else {
          obsMap[preset.id] = false;
        }
      });
      setSelectedObs(obsMap);
      setCustomObs(remainingObs);
    }
  }, [visible, initialTerms, initialObservations]);

  function toggleTerm(id: string) {
    setSelectedTerms((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleObs(id: string) {
    setSelectedObs((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleConfirm() {
    // Build combined terms and conditions
    const termsParts: string[] = [];
    PRESET_TERMS.forEach((preset) => {
      if (selectedTerms[preset.id]) {
        termsParts.push(preset.text);
      }
    });
    if (customTerms.trim()) {
      termsParts.push(customTerms.trim());
    }
    const finalTerms = termsParts.join('\n');

    // Build combined observations
    const obsParts: string[] = [];
    PRESET_OBSERVATIONS.forEach((preset) => {
      if (selectedObs[preset.id]) {
        obsParts.push(preset.text);
      }
    });
    if (customObs.trim()) {
      obsParts.push(customObs.trim());
    }
    const finalObs = obsParts.join('\n');

    onConfirm({
      termsAndConditions: finalTerms,
      observations: finalObs,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Acuerdos, Condiciones y Observaciones</Text>
            <Text style={styles.subtitle}>
              Selecciona las opciones que apliquen a esta cotización. Si no seleccionas ninguna, no aparecerán en el PDF.
            </Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Sección 1: Acuerdos y Condiciones */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="document-text-outline" size={18} color={colors.black} style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Términos y Acuerdos Comerciales</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Marca las condiciones comerciales que apliquen a esta cotización:
              </Text>

              <View style={styles.optionsList}>
                {PRESET_TERMS.map((preset) => {
                  const isChecked = !!selectedTerms[preset.id];
                  return (
                    <Pressable
                      key={preset.id}
                      style={[styles.checkboxRow, isChecked && styles.checkboxRowSelected]}
                      onPress={() => toggleTerm(preset.id)}
                    >
                      <Ionicons
                        name={isChecked ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={isChecked ? colors.primary : colors.gray}
                        style={styles.checkboxIcon}
                      />
                      <Text style={[styles.checkboxText, isChecked && styles.checkboxTextSelected]}>
                        {preset.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.customInputLabel}>Acuerdos adicionales o personalizados (opcional):</Text>
              <TextInput
                style={styles.customInput}
                value={customTerms}
                onChangeText={setCustomTerms}
                multiline
                placeholder="Escribe acuerdos adicionales aquí..."
                placeholderTextColor={colors.gray}
              />
            </View>

            {/* Sección 2: Observaciones */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="information-circle-outline" size={18} color={colors.black} style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Observaciones de la Cotización</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Marca las observaciones que desees incluir:
              </Text>

              <View style={styles.optionsList}>
                {PRESET_OBSERVATIONS.map((preset) => {
                  const isChecked = !!selectedObs[preset.id];
                  return (
                    <Pressable
                      key={preset.id}
                      style={[styles.checkboxRow, isChecked && styles.checkboxRowSelected]}
                      onPress={() => toggleObs(preset.id)}
                    >
                      <Ionicons
                        name={isChecked ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={isChecked ? colors.primary : colors.gray}
                        style={styles.checkboxIcon}
                      />
                      <Text style={[styles.checkboxText, isChecked && styles.checkboxTextSelected]}>
                        {preset.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.customInputLabel}>Observaciones adicionales o personalizadas (opcional):</Text>
              <TextInput
                style={styles.customInput}
                value={customObs}
                onChangeText={setCustomObs}
                multiline
                placeholder="Escribe observaciones adicionales aquí..."
                placeholderTextColor={colors.gray}
              />
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actionsRow}>
            <View style={styles.cancelButton}>
              <Button label="Cancelar" variant="ghost" onPress={onCancel} disabled={loading} />
            </View>
            <View style={styles.confirmButton}>
              <Button
                label={loading ? 'Enviando…' : 'Enviar cotización'}
                onPress={handleConfirm}
                disabled={loading}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
