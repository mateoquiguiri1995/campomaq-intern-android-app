import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, type TextInput } from 'react-native';

/**
 * Estado de foco de la barra de búsqueda, para abrir/cerrar el panel de
 * sugerencias. En Android, ocultar el teclado con "atrás" no quita el foco
 * del input: se fuerza el blur para que el panel se cierre y un nuevo toque
 * vuelva a disparar onFocus.
 */
export function useSearchFieldFocus() {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', () => {
      inputRef.current?.blur();
    });
    return () => subscription.remove();
  }, []);

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);

  const dismiss = useCallback(() => {
    inputRef.current?.blur();
    Keyboard.dismiss();
    setFocused(false);
  }, []);

  return { inputRef, focused, onFocus, onBlur, dismiss };
}
