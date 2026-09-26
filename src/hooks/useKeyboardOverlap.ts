import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform, type View } from 'react-native';

/**
 * Borde superior del teclado en coordenadas de ventana (`null` si está oculto).
 * Parte del estado actual del teclado por si ya estaba abierto al montar.
 */
export function useKeyboardTop(animateLayout = false): number | null {
  const [keyboardTop, setKeyboardTop] = useState<number | null>(
    () => (Keyboard.isVisible() ? Keyboard.metrics()?.screenY ?? null : null)
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      if (animateLayout) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardTop(event.endCoordinates.screenY);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (animateLayout) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardTop(null);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animateLayout]);

  return keyboardTop;
}

/**
 * Cuánto tapa el teclado a una vista que ocupa toda la pantalla (p. ej. el
 * contenido de un Modal). En Android, con edge-to-edge, los Modal no se
 * redimensionan al abrir el teclado y KeyboardAvoidingView no es confiable:
 * aquí se compara el borde superior del teclado con el borde inferior de la
 * vista medida en ventana.
 *
 * Uso: `ref={rootRef}` y `onLayout={onRootLayout}` en la vista raíz, y aplicar
 * `overlap` como paddingBottom para que el contenido quede sobre el teclado.
 */
export function useKeyboardOverlap() {
  const rootRef = useRef<View>(null);
  const [rootFrame, setRootFrame] = useState<{ bottom: number; height: number } | null>(null);
  const keyboardTop = useKeyboardTop(true);

  const onRootLayout = useCallback(() => {
    rootRef.current?.measureInWindow((_x, y, _width, height) => {
      setRootFrame({ bottom: y + height, height });
    });
  }, []);

  const overlap =
    keyboardTop != null && rootFrame ? Math.max(0, Math.round(rootFrame.bottom - keyboardTop)) : 0;

  return {
    rootRef,
    onRootLayout,
    overlap,
    keyboardVisible: keyboardTop != null,
    rootHeight: rootFrame?.height ?? null,
  };
}
