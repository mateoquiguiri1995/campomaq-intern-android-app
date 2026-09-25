import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles/src_features_quotes_components_QuoteTermsModal';
import { PRESET_SELLERS, getSavedDefaultSellerId, saveDefaultSellerId } from '../constants/sellers';
import type { QuoteSellerInfo } from '../types';

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
  initialSeller?: QuoteSellerInfo | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (values: {
    termsAndConditions: string;
    observations: string;
    seller: QuoteSellerInfo;
  }) => void;
}

export function QuoteTermsModal({
  visible,
  initialTerms = '',
  initialObservations = '',
  initialSeller = null,
  loading = false,
  onCancel,
  onConfirm,
}: QuoteTermsModalProps) {
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isChangingSeller, setIsChangingSeller] = useState(false);

  const [selectedTerms, setSelectedTerms] = useState<Record<string, boolean>>({});
  const [customTerms, setCustomTerms] = useState('');
  const [selectedObs, setSelectedObs] = useState<Record<string, boolean>>({});
  const [customObs, setCustomObs] = useState('');

  function splitPresetLines<T extends { id: string; text: string }>(
    text: string,
    presets: T[]
  ): { map: Record<string, boolean>; remaining: string } {
    const map: Record<string, boolean> = {};
    if (!text) {
      presets.forEach((preset) => {
        map[preset.id] = false;
      });
      return { map, remaining: '' };
    }

    const lines = text.split('\n');
    const matchedLineIndexes = new Set<number>();

    presets.forEach((preset) => {
      const lineIndex = lines.findIndex((line, i) => !matchedLineIndexes.has(i) && line === preset.text);
      if (lineIndex !== -1) {
        map[preset.id] = true;
        matchedLineIndexes.add(lineIndex);
      } else {
        map[preset.id] = false;
      }
    });

    const remaining = lines.filter((_, i) => !matchedLineIndexes.has(i)).join('\n').trim();
    return { map, remaining };
  }

  useEffect(() => {
    if (visible) {
      const termsResult = splitPresetLines(initialTerms, PRESET_TERMS);
      setSelectedTerms(termsResult.map);
      setCustomTerms(termsResult.remaining);

      const obsResult = splitPresetLines(initialObservations, PRESET_OBSERVATIONS);
      setSelectedObs(obsResult.map);
      setCustomObs(obsResult.remaining);

      // Carga del asesor responsable
      if (initialSeller?.id) {
        setSelectedSellerId(initialSeller.id);
        setIsChangingSeller(false);
      } else {
        getSavedDefaultSellerId().then((savedId) => {
          if (savedId && PRESET_SELLERS.some((s) => s.id === savedId)) {
            setSelectedSellerId(savedId);
            setIsChangingSeller(false);
          } else {
            // Primera vez en este equipo: obligatorio elegir
            setSelectedSellerId(null);
            setIsChangingSeller(true);
          }
        });
      }
    }
  }, [visible, initialTerms, initialObservations, initialSeller]);

  const activeSeller = PRESET_SELLERS.find((s) => s.id === selectedSellerId);

  function toggleTerm(id: string) {
    setSelectedTerms((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleObs(id: string) {
    setSelectedObs((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleConfirm() {
    if (!activeSeller) {
      Alert.alert('Asesor requerido', 'Por favor selecciona quién está emitiendo la cotización.');
      return;
    }

    // Guardar para las próximas cotizaciones en este teléfono
    saveDefaultSellerId(activeSeller.id);

    // Unir acuerdos comerciales
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

    // Unir observaciones
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
      seller: activeSeller,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={onCancel}>
          <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
            {/* Manija de arrastre */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Finalizar Cotización</Text>
              <Text style={styles.subtitle}>
                Verifica el asesor responsable y los acuerdos antes de generar la proforma.
              </Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Sección 1: Asesor Comercial Responsable */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="person-circle-outline" size={20} color={colors.black} />
                    <Text style={styles.sectionTitle}>¿Quién está cotizando?</Text>
                  </View>
                  {!activeSeller ? (
                    <View style={styles.sectionRequiredBadge}>
                      <Text style={styles.sectionRequiredText}>Obligatorio</Text>
                    </View>
                  ) : !isChangingSeller ? (
                    <View style={styles.sectionSavedBadge}>
                      <Text style={styles.sectionSavedText}>Recordado</Text>
                    </View>
                  ) : null}
                </View>

                {/* Si ya hay vendedor recordado y no estamos en modo cambiar */}
                {activeSeller && !isChangingSeller ? (
                  <View style={styles.sellerSummaryCard}>
                    <View style={styles.sellerSummaryLeft}>
                      <View style={styles.sellerAvatarContainer}>
                        <Ionicons name="person" size={20} color={colors.black} />
                      </View>
                      <View style={styles.sellerSummaryInfo}>
                        <Text style={styles.sellerSummaryName}>{activeSeller.name}</Text>
                        <Text style={styles.sellerSummaryDetails} numberOfLines={1}>
                          {activeSeller.location} · {activeSeller.phone}
                          {activeSeller.email && activeSeller.email !== '----' ? ` · ${activeSeller.email}` : ''}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.sellerChangeBtn}
                      activeOpacity={0.7}
                      onPress={() => setIsChangingSeller(true)}
                    >
                      <Ionicons name="swap-horizontal" size={16} color={colors.black} />
                      <Text style={styles.sellerChangeBtnText}>Cambiar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Modo selección: Radio buttons de los vendedores */
                  <View style={styles.radioList}>
                    {PRESET_SELLERS.map((s) => {
                      const isSelected = selectedSellerId === s.id;
                      return (
                        <Pressable
                          key={s.id}
                          style={[styles.radioCard, isSelected && styles.radioCardSelected]}
                          onPress={() => {
                            setSelectedSellerId(s.id);
                            // Al seleccionar uno nuevo, se mantiene marcado
                          }}
                        >
                          <View style={styles.radioCircle}>
                            <Ionicons
                              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                              size={22}
                              color={isSelected ? colors.black : colors.gray}
                            />
                          </View>
                          <View style={styles.radioInfo}>
                            <Text style={[styles.radioName, isSelected && styles.radioNameSelected]}>
                              {s.name}
                            </Text>
                            <Text style={styles.radioDetails}>
                              {s.location} · {s.phone}
                              {s.email && s.email !== '----' ? ` · ${s.email}` : ''}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                    <Text style={styles.sellerHelpText}>
                      * Tu selección se recordará automáticamente en este teléfono para las próximas cotizaciones.
                    </Text>
                  </View>
                )}
              </View>

              {/* Sección 2: Acuerdos y Condiciones */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="document-text-outline" size={18} color={colors.black} />
                    <Text style={styles.sectionTitle}>Términos y Acuerdos</Text>
                  </View>
                </View>
                <Text style={styles.sectionDescription}>
                  Marca las condiciones comerciales que apliquen:
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
                          size={19}
                          color={isChecked ? colors.black : colors.gray}
                          style={styles.checkboxIcon}
                        />
                        <Text style={[styles.checkboxText, isChecked && styles.checkboxTextSelected]}>
                          {preset.text}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.customInputLabel}>Acuerdos adicionales (opcional):</Text>
                <TextInput
                  style={styles.customInput}
                  value={customTerms}
                  onChangeText={setCustomTerms}
                  multiline
                  placeholder="Escribe acuerdos adicionales aquí..."
                  placeholderTextColor={colors.gray}
                />
              </View>

              {/* Sección 3: Observaciones */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="information-circle-outline" size={18} color={colors.black} />
                    <Text style={styles.sectionTitle}>Observaciones</Text>
                  </View>
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
                          size={19}
                          color={isChecked ? colors.black : colors.gray}
                          style={styles.checkboxIcon}
                        />
                        <Text style={[styles.checkboxText, isChecked && styles.checkboxTextSelected]}>
                          {preset.text}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.customInputLabel}>Observaciones adicionales (opcional):</Text>
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
                  label={loading ? 'Generando…' : 'Enviar cotización'}
                  onPress={handleConfirm}
                  disabled={loading}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
