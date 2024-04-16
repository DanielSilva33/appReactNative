import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Center,
  HStack,
  Heading,
  Modal,
  VStack,
  useSafeArea,
} from 'native-base';
import { Input } from '../../components/input/Input';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '../../components/button/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-tiny-toast';
import uuid from 'react-native-uuid';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../../router';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { ExcluirItemDialog } from '../../components/Dialog';
import { FindCEP } from '../../components/search/findCEP';

type FormDataProps = {
  id: any;
  nome: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  senha: string;
  confirmaSenha: string;
};

const schemaRegister = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Informe no minimo 3 digitos'),
  email: yup
    .string()
    .required('Email é obrigatório')
    .min(6, 'Informe no minimo 6 digitos')
    .email('E-mail informado não é valido'),
  cep: yup
    .string()
    .required('CEP é obrigatório')
    .min(3, 'Informe no minimo 3 digitos'),
  numero: yup
    .string()
    .required('Numero é obrigatório')
    .min(2, 'Informe no minimo 2 digitos'),
  senha: yup
    .string()
    .required('Senha é obrigatório')
    .min(3, 'Informe no minimo 3 digitos'),
  confirmaSenha: yup
    .string()
    .required('Confirmação de senha é obrigatório')
    .oneOf([yup.ref('senha')], 'As senha devem coincidir'),
});

type UsuarioRouteProp = BottomTabScreenProps<RootTabParamList, 'Usuario'>;

export const Usuario = ({ route, navigation }: UsuarioRouteProp) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: yupResolver(schemaRegister) as any,
  });

  const [loading, setLoading] = useState(true);
  const [cep, setCep] = useState('');
  const [seacheID, setSeacheID] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isEditing = !!route?.params?.id;

  useEffect(() => {
    if (isEditing) {
      handlerSearcher(route?.params?.id);
      setSeacheID(true);
    } else {
      reset();
      setSeacheID(false);
      setLoading(false);
    }
  }, [route, isEditing]);

  async function handlerRegister(data: FormDataProps) {
    data.id = uuid.v4().toString();
    try {
      const reponseData = await AsyncStorage.getItem('@crud_form:usuario');
      const dbData = reponseData ? JSON.parse(reponseData!) : [];
      console.log(dbData);
      const previewData = [...dbData, data];

      await AsyncStorage.setItem(
        '@crud_form:usuario',
        JSON.stringify(previewData)
      );
      reset();
      handleList();
      Toast.showSuccess('Usuário registrado com sucesso');
    } catch (e) {
      reset();
      Toast.showSuccess('Erro ao registrar usuário ' + e);
    }
    reset();
  }

  async function handlerSearcher(id: string) {
    try {
      setLoading(true);
      const responseData = await AsyncStorage.getItem('@crud_form:usuario');
      const dbData: FormDataProps[] = responseData
        ? JSON.parse(responseData)
        : [];

      const findItem = dbData?.find((item) => item.id === id);
      if (findItem) {
        Object.keys(findItem).forEach((key) =>
          setValue(
            key as keyof FormDataProps,
            findItem?.[key as keyof FormDataProps] as string
          )
        );
        setSeacheID(true);
      }
      setLoading(false);
    } catch (error) {
      reset();
      console.log(error);
    }
  }

  async function handlerAlterRegister(data: FormDataProps) {
    try {
      setLoading(true);
      const reponseData = await AsyncStorage.getItem('@crud_form:usuario');
      const dbData: FormDataProps[] = reponseData
        ? JSON.parse(reponseData)
        : [];

      const indexToRemove = dbData.findIndex((item) => item.id === data.id);

      if (indexToRemove !== -1) {
        dbData.splice(indexToRemove, 1);
        dbData.splice(indexToRemove, 0, data);
        await AsyncStorage.setItem(
          '@crud_form:usuario',
          JSON.stringify(dbData)
        );
        Toast.showSuccess('Usuário alterado com sucesso');
        setLoading(false);
        setSeacheID(false);
        await handleList();
      } else {
        Toast.show('Registro não localizado!');
      }
      reset();
    } catch (e) {
      reset();
      setLoading(false);
      console.log(e);
    }
  }

  async function handleList() {
    navigation.navigate('Home');
  }

  async function HandleDelete(data: FormDataProps) {
    try {
      setLoading(true);
      const reponseData = await AsyncStorage.getItem('@crud_form:usuario');
      const dbData: FormDataProps[] = reponseData
        ? JSON.parse(reponseData)
        : [];

      const indexRemove = dbData?.findIndex((item) => item.id === data.id);

      if (indexRemove !== -1) {
        dbData.splice(indexRemove, 1);
        await AsyncStorage.setItem(
          '@crud_form:usuario',
          JSON.stringify(dbData)
        );
        Toast.showSuccess('Usuário excluído com sucesso');
        setShowDeleteDialog(false);
        setLoading(false);
        setSeacheID(false);
        reset();
        await handleList();
      } else {
        Toast.show('Registro não localizado!');
      }
    } catch (e) {
      reset();
      console.log(e);
    }
  }

  async function handleFindCep() {
    try {
      const findCEP = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await findCEP.json();
      setValue('endereco', data.logradouro);
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) return <ActivityIndicator size='large' color='#000fff' />;
  return (
    <KeyboardAwareScrollView>
      <VStack bgColor='gray.300' flex={1} px={5} pb={100}>
        <Center>
          <Heading my={5}>Cadastro de Usuários</Heading>
          <Controller
            control={control}
            name='nome'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Nome'
                onChangeText={onChange}
                errorMessage={errors.nome?.message}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name='email'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='E-mail'
                onChangeText={onChange}
                errorMessage={errors.email?.message}
                value={value}
              />
            )}
          />
          <HStack pl={5} pr={5}>
            <Controller
              control={control}
              name='cep'
              defaultValue=''
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='CEP'
                  onChangeText={(text) => {
                    onChange(text);
                    setCep(text);
                  }}
                  errorMessage={errors.cep?.message}
                  value={value}
                />
              )}
            />
            <TouchableOpacity
              onPress={() => {
                handleFindCep();
              }}>
              <FindCEP />
            </TouchableOpacity>
          </HStack>
          <Controller
            control={control}
            name='endereco'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Endereço'
                onChangeText={onChange}
                errorMessage={errors.endereco?.message}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name='numero'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Numero'
                onChangeText={onChange}
                errorMessage={errors.numero?.message}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name='senha'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Senha'
                onChangeText={onChange}
                secureTextEntry
                errorMessage={errors.senha?.message}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name='confirmaSenha'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Confirma Senha'
                onChangeText={onChange}
                secureTextEntry
                errorMessage={errors.confirmaSenha?.message}
                value={value}
              />
            )}
          />
          {seacheID ? (
            <VStack>
              <HStack>
                <Button
                  rounded='md'
                  shadow={3}
                  title='Alterar'
                  color='#F48B20'
                  onPress={handleSubmit((data) => {
                    handlerAlterRegister(data);
                    reset();
                  })}
                />
              </HStack>
              <HStack paddingTop={5}>
                <Button
                  rounded='md'
                  shadow={3}
                  title='Excluir'
                  color='#CC0707'
                  onPress={() => setShowDeleteDialog(true)}
                />
              </HStack>
            </VStack>
          ) : (
            <Button
              title='Cadastrar'
              color='green.700'
              onPress={handleSubmit(handlerRegister)}
            />
          )}
        </Center>
      </VStack>
      <Modal
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}>
        <ExcluirItemDialog
          isVisible={showDeleteDialog}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleSubmit((data) => {
            HandleDelete(data), reset();
          })}
        />
      </Modal>
    </KeyboardAwareScrollView>
  );
};
