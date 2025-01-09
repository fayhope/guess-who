import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from './firebaseConfig';

export default function WaitingRoom({ route, navigation }) {
  const { gameCode, gameId, selectedCharacters } = route.params;
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to game updates in real time
    const gameRef = doc(db, 'games', gameId);
    
    const unsubscribe = onSnapshot(gameRef, async (docSnapshot) => {
    console.log("connected to db"); //checking that the issue isnt here
    const gameData = docSnapshot.data();
    const gamePlayers = gameData.players || [];
      
      setPlayers(gamePlayers);
      
      // Check if 2 players have joined
      if (gamePlayers.length === 2) {
        // Once 2 players have joined, set the game to 'started'
        await updateDoc(gameRef, { gameStatus: 'started' });

        // Navigate both players to the game screen
        navigation.navigate('GameScreen', {
          gameCode,
          gameId,
        });
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [gameId, gameCode, selectedCharacters, navigation]);

  const handleStartGame = () => {
    if (players.length === 2) {
      // Start the game when both players have joined
      navigation.navigate('GameScreen', {
        gameCode,
        gridRows: 5,
        gridCols: 5,
        gameID
      });
    } else {
      alert('Waiting for another player to join...');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting for Players</Text>
      
      <Text style={styles.infoText}>
        Game Code: {gameCode}
      </Text>
      
      <Text style={styles.infoText}>
        Players: {players.length} / 2
      </Text>

      {players.length === 2 && (
        <Text style={styles.infoText}>Both players have joined! Starting the game...</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleStartGame}
        disabled={players.length < 2}
      >
        <Text style={styles.buttonText}>
          {players.length === 2 ? 'Start Game' : 'Waiting for Player 2...'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.goBack()}
      >
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
  },
  infoText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
  button: {
    backgroundColor: '#008CBA',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  returnButton: {
    marginTop: 30,
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
