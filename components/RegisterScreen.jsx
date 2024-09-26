import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Alert, Image, ActivityIndicator, Keyboard } from 'react-native';
import CryptoJS from 'crypto-js';

const RegisterScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (userId && password) {

      setLoading(true);

      const hashedPassword = parseInt(password, 10);
      const data = {
        userId: userId,
        hashedPassword: hashedPassword,
      };

      const endpoints = [
        'https://47a3-2409-4072-183-d9b2-b823-5a75-dae6-8eaa.ngrok-free.app/register',
        'https://8a80-115-240-194-54.ngrok-free.app/register',
      ];

      const responses = [];

      for (let i = 0; i < endpoints.length; i++) {
        try {
          const response = await fetch(endpoints[i], {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          responses.push(result); 

          if (!response.ok) {
            Alert.alert('Registration failed at endpoint ' + (i + 1), result.message || 'An error occurred');
            setLoading(false);
            return; // Stop further processing if any request fails
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to connect to endpoint ' + (i + 1));
          setLoading(false);
          return; // Stop further processing on error
        }
      }

      // Check if both responses indicate success
      const allSuccessful = responses.every(res => res.message === "Registration successful");

      if (allSuccessful) {
        Alert.alert('Registration Successful!');
        navigation.goBack();
      } else {
        Alert.alert('Registration failed for one or more endpoints');
        setLoading(false);
      }
      // Stop loading
      setLoading(false);
    } else {
      Alert.alert('Please fill in all fields.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/register.png')} 
        style={styles.image}
      />
      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#D3D3D3',
  },
  image: {
    width: 230, 
    height: 200, 
    resizeMode: 'contain', 
    alignSelf: 'center', 
    marginBottom: 40,
    marginTop: -60,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 30,
    padding: 10,
    color: '#fff',
    backgroundColor: '#808080',
    borderRadius: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'black',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 26,
  },
});

export default RegisterScreen;
