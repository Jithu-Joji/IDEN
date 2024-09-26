import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Alert, Image, ActivityIndicator, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const g = 5; // Constant g
const p = 29; // Constant p

const modExp = (base, exp, mod) => {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
};

// Commitment prover function
const commitmentProver = () => {
  const r = Math.floor(Math.random() * (p - 2)) + 1; // Random value r in range [1, p-2]
  const T = modExp(g, r, p); // Commitment T = g^r mod p
  return { r, T };
};

// Response prover function
const responseProver = (r, c, hashedPassword) => {
  const s = (r + c * hashedPassword) % (p - 1); // Response s = (r + c * hashedPassword) % (p-1)
  return s;
};

const authorityNodes = [
  'https://47a3-2409-4072-183-d9b2-b823-5a75-dae6-8eaa.ngrok-free.app',
  'https://8a80-115-240-194-54.ngrok-free.app',
];

const LoginScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rValue, setRValue] = useState(null); // Store r value
  const [loading, setLoading] = useState(false); // Loader state

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (userId && password) {
      // Start loading
      setLoading(true);

      const hashedPassword = parseInt(password, 10);

      // Step 1: Generate commitment T
      const { r, T } = commitmentProver();
      setRValue(r); // Store r for later use
      console.log(`Prover sends T = ${T}`);

      let successfulResponses = 0; // Counter for successful responses
      let tokens = []; // Array to store tokens from authority nodes

      // Loop through each authority node
      for (let i = 0; i < authorityNodes.length; i++) {
        const nodeUrl = authorityNodes[i];

        try {
          // Step 2: Send POST request to /initiate_zkp on the current authority node
          const response = await fetch(`${nodeUrl}/initiate_zkp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, T }),
          });

          const result = await response.json();

          if (response.ok) {
            const challenge = result.challenge; // Get challenge from response
            console.log(`Received challenge from ${nodeUrl}: ${challenge}`);

            // Step 3: Calculate response s using responseProver function
            const s = responseProver(r, challenge, hashedPassword);
            console.log(`Prover sends response s = ${s} to ${nodeUrl}`);

            // Step 4: Send s, challenge, and userId to /verify_zkp
            const verifyResponse = await fetch(`${nodeUrl}/verify_zkp`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ s, challenge, userId }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResponse.ok) {
              successfulResponses += 1;
              if (verifyResult.token) {
                tokens.push(verifyResult.token); // Store all tokens
                console.log(`Received token from ${nodeUrl}: ${verifyResult.token}`);
              }
            }
          }

          // If the number of successful responses equals n/2 + 1, proceed to token validation
          if (successfulResponses >= Math.floor(authorityNodes.length / 2) + 1) {
            break; // Exit the loop early as the condition is met
          }
        } catch (error) {
          console.log(`Error connecting to ${nodeUrl}:`, error);
          // Continue to next node if there's an error
        }
      }

      // Final validation after all requests
      if (successfulResponses >= Math.floor(authorityNodes.length / 2) + 1) {
        // Store all received tokens securely using AsyncStorage
        try {
          await AsyncStorage.setItem('userTokens', JSON.stringify(tokens));
          Alert.alert('Login Successful!', 'You have been authenticated successfully.');
        } catch (storageError) {
          Alert.alert('Error', 'Failed to store the authentication tokens.');
          console.error('AsyncStorage Error:', storageError);
        }
      } else {
        Alert.alert('Login Failed', 'Verification did not pass majority of authority nodes.');
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
        source={require('../assets/login.png')} 
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
      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
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

export default LoginScreen;
