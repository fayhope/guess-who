import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guess Who - Your Friends Edition!</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Characters')}
      >
        <Text style={styles.buttonText}>Go to Characters</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('CreateGameScreen')}
      >
        <Text style={styles.buttonText}>New Game</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('JoinGame')}
      >
        <Text style={styles.buttonText}>Join Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: '#008CBA',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});