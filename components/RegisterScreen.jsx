import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Alert, Image } from 'react-native';
import CryptoJS from 'crypto-js';

const RegisterScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (userId && password) {
      //const hashedPassword = parseInt(CryptoJS.SHA256(password).toString(), 16);
      const hashedPassword = parseInt(password, 10)
      // Prepare the data to be sent to the blockchain
      const data = {
        userId: userId,
        hashedPassword: hashedPassword
      };

      try {
        // Make the POST request to the blockchain endpoint
        const response = await fetch('https://47a3-2409-4072-183-d9b2-b823-5a75-dae6-8eaa.ngrok-free.app/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          Alert.alert('Registration Successful!');
          navigation.goBack();
        } else {
          Alert.alert('Registration failed', result.message || 'An error occurred');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to connect to the blockchain');
      }
    } else {
      Alert.alert('Please fill in all fields.');
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
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
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
    marginTop:-60 
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
