import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Alert, Image } from 'react-native';
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

const LoginScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rValue, setRValue] = useState(null); // Store r value

  const handleLogin = async () => {
    if (userId && password) {
      // Generate hashedPassword
      //const hashedPassword = parseInt(CryptoJS.SHA256(password).toString(), 16); // Parse as integer for calculation
      const hashedPassword = parseInt(password, 10)
      // Step 1: Generate commitment T
      const { r, T } = commitmentProver();
      setRValue(r); // Store r for later use
      console.log(`Prover sends T = ${T}`);

      try {
        // Step 2: Send POST request to /initiate_zkp with userId and T
        const response = await fetch('https://47a3-2409-4072-183-d9b2-b823-5a75-dae6-8eaa.ngrok-free.app/initiate_zkp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, T }),
        });

        const result = await response.json();

        if (response.ok) {
          const challenge = result.challenge; // Get challenge from response
          console.log(`Received challenge: ${challenge}`);

          // Step 3: Calculate response s using responseProver function
          const s = responseProver(r, challenge, hashedPassword);
          console.log(`Prover sends response s = ${s}`);

          // Step 4: Send s, challenge (c), and userId to /verify_zkp
          const verifyResponse = await fetch('https://47a3-2409-4072-183-d9b2-b823-5a75-dae6-8eaa.ngrok-free.app/verify_zkp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ s, challenge, userId }),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResponse.ok) {
            Alert.alert('Login Successful!', verifyResult.message);
          } else {
            Alert.alert('Login Failed', verifyResult.message || 'Verification failed');
          }
        } else {
          Alert.alert('Login failed', result.message || 'An error occurred');
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
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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

export default LoginScreen;
