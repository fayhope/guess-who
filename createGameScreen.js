import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { db } from './firebaseConfig';

export default function CreateGameScreen() {
  const [gameCode, setGameCode] = useState(null);

  // Function to generate a 6-character game code
  const generateGameCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // Function to create a game and save to Firebase
  const auth = getAuth();
  signInAnonymously(auth)
    .then(() => {
      console.log("Signed in anonymously");
      handleCreateGame();
    })
    .catch((error) => {
      console.error("Error signing in:", error);
    });
  
  const handleCreateGame = async () => {
    try {
      const newGame = {
        gameCode: Math.random().toString(36).substr(2, 6).toUpperCase(), // 6-character code
        createdAt: new Date(),
      };
  
      const docRef = await addDoc(collection(db, "games"), newGame);
      console.log("Game created with ID:", docRef.id);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Game</Text>
      {gameCode ? (
        <View>
          <Text style={styles.gameCodeText}>Game Code:</Text>
          <Text style={styles.gameCode}>{gameCode}</Text>
          <Text style={styles.infoText}>Share this code with your friends to join the game!</Text>
        </View>
      ) : (
        <Button title="Create Game" onPress={handleCreateGame} />
      )}
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
  gameCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  gameCode: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'blue',
    marginVertical: 10,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
});
