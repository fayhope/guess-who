import { getAuth, signInAnonymously } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from './firebaseConfig';

export default function JoinGame({ navigation }) {
  const [enteredCode, setEnteredCode] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const checkGameStatus = async () => {
      const q = query(collection(db, 'games'), where('gameCode', '==', enteredCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const gameDoc = querySnapshot.docs[0];
        const gameData = gameDoc.data();
        setPlayers(gameData.players);
        setGameStatus(gameData.gameStatus);
      }
    };

    if (enteredCode) {
      checkGameStatus();
    }
  }, [enteredCode]);

  const handleJoinGame = async () => {
    const auth = getAuth();

    // Sign in anonymously if not already signed in
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    const q = query(collection(db, 'games'), where('gameCode', '==', enteredCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const gameDoc = querySnapshot.docs[0];
      const gameData = gameDoc.data();

      const playerAlreadyJoined = gameData.players.some(player => player.playerId === auth.currentUser.uid);

      if (playerAlreadyJoined) {
        Alert.alert('Error', 'You are already in this game.');
        return;
      }

      // Add player to the game
      const newPlayer = {
        playerId: auth.currentUser.uid,
        selectedCharacters: [],  // Players will select characters after joining
      };

      const updatedPlayers = [...gameData.players, newPlayer];
      await updateDoc(doc(db, 'games', gameDoc.id), { players: updatedPlayers });

      // Navigate to game screen
      if (gameData.gameStatus === 'started') {
        navigation.navigate('GameScreen', { gameCode: enteredCode });
      } else {
        Alert.alert('Waiting', 'Waiting for the game to start...');
      }
    } else {
      Alert.alert('Error', 'Invalid game code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Game</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Game Code"
        value={enteredCode}
        onChangeText={setEnteredCode}
        maxLength={6}
      />

      <Button title="Join Game" onPress={handleJoinGame} />

      {gameStatus === 'waiting' && players.length < 2 && (
        <Text style={styles.waitingText}>Waiting for the game to start...</Text>
      )}

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
  waitingText: {
    fontSize: 18,
    color: 'orange',
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
  },
  returnButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
});
