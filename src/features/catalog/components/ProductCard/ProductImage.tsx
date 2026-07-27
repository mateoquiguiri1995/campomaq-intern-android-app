import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

interface ProductImageProps {
  code: string;
  imageUrl?: string;
}

export function ProductImage({
  code,
  imageUrl,
}: ProductImageProps) {
  return (
    <View style={styles.imageWrapper}>
      <Image
        source={
          imageUrl
            ? { uri: imageUrl }
            : require('../../../../../assets/images/campomaq/campomaq.png')
        }
        style={styles.image}
        contentFit="contain"
        transition={250}
        cachePolicy="memory-disk"
      />

      {/* Code overlay pill */}
      <View style={styles.codeBadge}>
        <Text style={styles.codeText}>{code}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  codeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 0.5,
    borderColor: '#EAEAEA',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  codeText: {
    color: '#8E8E93',
    fontSize: 7.5,
    fontWeight: '700',
  },
});
