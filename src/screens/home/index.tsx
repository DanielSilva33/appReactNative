import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, CardProps } from '../../components/card';
import { FlatList } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';

type Props = {
  navigation: any;
};

export const Home = ({ navigation }: Props) => {
  const [data, setData] = useState<CardProps[]>([]);

  useFocusEffect(
    useCallback(() => {
      handleFetchData();
    }, [])
  );

  function handleEdit(id: string) {
    navigation.navigate('Usuario', { id: id });
  }
  async function handleFetchData() {
    try {
      const jsonValue = await AsyncStorage.getItem('@crud_form:usuario');
      const data = jsonValue ? JSON.parse(jsonValue) : [];
      setData(data);
      return jsonValue;
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listCotent}
        renderItem={({ item }) => (
          <Card data={item} onPress={() => handleEdit(item.id)}></Card>
        )}></FlatList>
    </View>
  );
};
