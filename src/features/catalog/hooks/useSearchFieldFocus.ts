import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, type TextInput } from 'react-native';

/**
 * Estado de apertura del panel de sugerencias de la barra de búsqueda.
 *
 * El panel se abre al enfocar el input y solo se cierra con `dismiss` (tocar
 * fuera, elegir una opción o buscar) o si el input pierde el foco por otra
 * acción. Ocultar el teclado NO lo cierra: así el vendedor puede bajar el
 * teclado para ver mejor los recientes o las sugerencias.
 *
 * En Android, ocultar el teclado con "atrás" no quita el foco del input: se
 * fuerza el blur para que un nuevo toque vuelva a abrir el teclado.
 */
export function useSearchFieldFocus() {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  // Marca que el próximo blur viene de ocultar el teclado y no debe cerrar el panel.
  const keepOpenOnBlurRef = useRef(false);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', () => {
      if (!inputRef.current?.isFocused()) return;
      keepOpenOnBlurRef.current = true;
      inputRef.current.blur();
    });
    return () => subscription.remove();
  }, []);

  const onFocus = useCallback(() => {
    keepOpenOnBlurRef.current = false;
    setFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    if (keepOpenOnBlurRef.current) {
      keepOpenOnBlurRef.current = false;
      return;
    }
    setFocused(false);
  }, []);

  const dismiss = useCallback(() => {
    keepOpenOnBlurRef.current = false;
    inputRef.current?.blur();
    Keyboard.dismiss();
    setFocused(false);
  }, []);

  return { inputRef, focused, onFocus, onBlur, dismiss };
}
