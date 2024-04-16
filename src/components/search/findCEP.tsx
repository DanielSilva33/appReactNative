import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './styles';

export function FindCEP() {
  return (
    <View style={styles.container}>
      <MaterialIcons name='search' size={22} color='#888D97' />
    </View>
  );
}
