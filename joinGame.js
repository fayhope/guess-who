import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db, signInAnonymously } from './firebaseConfig';

export default function JoinGame({ navigation }) {
  const [enteredCode, setEnteredCode] = useState('');
  const [players, setPlayers] = useState([]);

    const handleJoinGame = async () => {
      const auth = getAuth();

       if (!auth.currentUser) {
          await signInAnonymously();
    }

     const gamesRef = collection(db, 'games');
      const q = query(gamesRef, where('gameCode', '==', enteredCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
         const gameDoc = querySnapshot.docs[0];
         const gameData = gameDoc.data();
            setPlayers(gameData.players || []);
            const playerAlreadyJoined = gameData.players.some(
            (player) => player.playerId === auth.currentUser.uid
        );

      if (playerAlreadyJoined) {
        Alert.alert('Error', 'You are already in this game.');
          return;
       }

      const newPlayer = {
        playerId: auth.currentUser.uid,
        selectedCharacters: [],
      };

      const updatedPlayers = [...gameData.players, newPlayer];
      await updateDoc(doc(db, 'games', gameDoc.id), { players: updatedPlayers }).then(() => {
          if (updatedPlayers.length === 2) {
           navigation.navigate('GameScreen', { gameCode: enteredCode, secondPlayer: true});
         } else {
               console.log("Waiting for other player")
           }
        })
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

        {players.length < 2 && (
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