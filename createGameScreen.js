import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CharacterSelectionModal from './characterSelectionModal';
import { auth, db } from './firebaseConfig';

export default function CreateGameScreen({ navigation }) {
  console.log("CreateGameScreen Mounted");
  const [gameCode, setGameCode] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
    const [gameId, setGameId] = useState(null);
  const [loadingCharacters, setLoadingCharacters] = useState(true);

  useEffect(() => {
    const loadCharacters = async () => {
      setLoadingCharacters(true);
      try {
        const storedCharacters = await AsyncStorage.getItem('characters');
        if (storedCharacters) {
          const parsedCharacters = JSON.parse(storedCharacters);
          setCharacters(parsedCharacters);
          console.log("Characters loaded from storage:", parsedCharacters);
        } else {
          console.log('No characters found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to load characters:', error);
      }
      setLoadingCharacters(false);
    };

    loadCharacters();
  }, []);

  const createGame = async () => {
    try {
      await signInAnonymously(auth);
      console.log('Signed in anonymously');

      const newGame = {
        gameCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        createdAt: new Date(),
        players: [],
        turn: 0,
      };

      const docRef = await addDoc(collection(db, 'games'), newGame);
      console.log('Game created with ID:', docRef.id);
      setGameCode(newGame.gameCode);
        setGameId(docRef.id);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  useEffect(() => {
    createGame();
  }, []);

  const handleSelectCharacters = (selectedIds) => {
    setSelectedCharacters(selectedIds);
  };

    const startGame = async () => {
        if (characters.length === 0) {
            alert('Please wait for the characters to load.');
            return;
        }
        
        if (selectedCharacters.length === 0) {
            alert('Please select at least one character to start the game.');
            return;
        }
    
      setIsLoading(true);

        try {
          const gameRef = doc(db, 'games', gameId);
          const gameSnapshot = await getDoc(gameRef);
          const gameData = gameSnapshot.data()
          let players = gameData ? gameData.players || [] : [];
          
           // Add creator (current user) to players
           const newPlayer = {
               playerId: auth.currentUser.uid,
               selectedCharacters,
               turn: players.length === 0 ? 0 : 1,  // First player goes first
             };

           players.push(newPlayer);
           
           // If the players length is 2, then start the game
          if (players.length === 2) {
            await updateDoc(gameRef, { gameStatus: 'started' });
         }
          
            // Update the game document in Firebase
          await updateDoc(gameRef, { players }).then(() => {
                // Navigate to the game screen
                navigation.navigate('GameScreen', {
                  gameCode,
                selectedCharacters,
                    gridRows: 5,
                    gridCols: 5,
                });
           })
          
          // Set player ID and stop loading
          setPlayerId(auth.currentUser.uid);
          setIsLoading(false);
    
        } catch (error) {
          console.error('Error starting the game:', error);
          setIsLoading(false); // Stop loading in case of error
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
        <Text style={styles.infoText}>Creating game...</Text>
      )}

      {!loadingCharacters && (
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Choose Characters</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={startGame} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Starting Game...' : 'Start'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
        <Text style={styles.returnButtonText}>Return</Text>
      </TouchableOpacity>

      <CharacterSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        characters={characters}
        onSelectCharacter={handleSelectCharacters}
      />
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