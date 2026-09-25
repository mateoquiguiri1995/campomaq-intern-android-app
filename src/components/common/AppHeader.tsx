import { Text, View } from 'react-native';

import { UserAvatar } from '@/components/common/UserAvatar';
import { styles } from '@/theme/styles/src_components_common_AppHeader';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
}

/**
 * Encabezado de pantalla con título, subtítulo y avatar opcional.
 * El avatar se despliega suavemente al centro del dispositivo al presionarlo.
 */
export function AppHeader({ title, subtitle, showAvatar = true }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {showAvatar && <UserAvatar size={44} style={styles.avatarButton} />}
    </View>
  );
}
