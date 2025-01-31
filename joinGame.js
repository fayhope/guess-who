import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from './firebaseConfig';

export default function JoinGame({ navigation }) {
  const [enteredCode, setEnteredCode] = useState('');
  const [joinedGame, setJoinedGame] = useState(null);

  // Function to handle joining a game
  const handleJoinGame = async () => {
    try {
      const q = query(collection(db, 'games'), where('code', '==', enteredCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setJoinedGame(enteredCode.toUpperCase());
        Alert.alert('Success', `You've joined the game with code: ${enteredCode.toUpperCase()}`);
      } else {
        Alert.alert('Error', 'Invalid game code. Please try again.');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Error', 'Failed to join game. Please try again.');
    }

    setEnteredCode('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Game</Text>
      {joinedGame ? (
        <View>
          <Text style={styles.successText}>You've successfully joined the game!</Text>
          <Text style={styles.gameCode}>Game Code: {joinedGame}</Text>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Game Code"
            value={enteredCode}
            onChangeText={setEnteredCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Button title="Join Game" onPress={handleJoinGame} />
        </>
      )}

      {/* Return Button */}
      <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
        <Text style={styles.returnButtonText}>Return</Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
  },
  successText: {
    fontSize: 18,
    color: 'green',
    marginVertical: 10,
  },
  gameCode: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'blue',
    marginVertical: 10,
  },
  returnButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#008CBA',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  returnButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
