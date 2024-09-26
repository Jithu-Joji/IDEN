import React from 'react';
import { Text, View, StyleSheet, Pressable, Image } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.outerContainer}>
      <Text style={styles.title}>IDENTITY ACCESS MANAGEMENT SYSTEM</Text>
      
      <View style={styles.container}>
        <Image 
          source={require('../assets/home.png')} 
          style={styles.image}
        />
        <Pressable style={styles.button1} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.text}>{"Register"}</Text>
        </Pressable>
        <View style={styles.space} />
        <Pressable style={styles.button2} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.text}>{"Login"}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000',
    
  },
  title: {
    fontSize: 24, 
    color: '#fff', 
    textAlign: 'center', 
    marginTop: 50, 
    marginBottom: 40,
    fontWeight: 'bold',
  },
  image: {
    width: 230, 
    height: 200, 
    resizeMode: 'contain', 
    alignSelf: 'center', 
    marginBottom: 40,
    marginTop:-60 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D3D3D3'
  },
  button1: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
    borderRadius: 15,
  },
  button2: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 43,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
    borderRadius: 15,
  },
  space: {
    height: 60, 
  },
  text: {
    color: '#fff',
    fontSize: 23, 
  },
});

export default HomeScreen;
