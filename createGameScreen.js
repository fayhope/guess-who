import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CharacterSelectionModal from './characterSelectionModal';
import { auth, db } from './firebaseConfig';

export default function CreateGameScreen({ navigation }) {
  const [gameCode, setGameCode] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [characters, setCharacters] = useState([]); 
  const [modalVisible, setModalVisible] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const storedCharacters = await AsyncStorage.getItem('characters');
        if (storedCharacters) {
          setCharacters(JSON.parse(storedCharacters));
        }
      } catch (error) {
        console.error('Failed to load characters', error);
      }
    };

    loadCharacters();

    const createGame = async () => {
      try {
        await signInAnonymously(auth);
        console.log('Signed in anonymously');

        // Create a new game
        const newGame = {
          gameCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
          createdAt: new Date(),
          players: [], // Players array to hold player data
          turn: 0, // Track turn (0 for player 1, 1 for player 2, etc.)
        };

        const docRef = await addDoc(collection(db, 'games'), newGame);
        console.log('Game created with ID:', docRef.id);
        setGameCode(newGame.gameCode);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    createGame();
  }, []);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectCharacters = (selectedIds) => {
    setSelectedCharacters(selectedIds);
  };

  const startGame = async () => {
    if (selectedCharacters.length === 0) {
      alert('Please select at least one character to start the game.');
      return;
    }

    try {
      const gameRef = doc(db, 'games', gameCode);  
      const gameSnapshot = await getDoc(gameRef);
      
      if (gameSnapshot.exists()) {
        const gameData = gameSnapshot.data();
        const players = gameData.players || [];

        const newPlayer = {
          playerId: auth.currentUser.uid,
          selectedCharacters,
          turn: players.length === 0 ? 0 : 1,  
        };

        players.push(newPlayer);

        await updateDoc(gameRef, { players });

        // Save player ID
        setPlayerId(auth.currentUser.uid);
        navigation.navigate('GameScreen', {
          gameCode,
          characters: characters.filter((character) =>
            selectedCharacters.includes(character.id)
          ),
          gridRows: 5, 
          gridCols: 5,
        });
      }
    } catch (error) {
      console.error('Error starting the game:', error);
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

      <TouchableOpacity style={styles.button} onPress={handleOpenModal}>
        <Text style={styles.buttonText}>Choose Characters</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={startGame}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
        <Text style={styles.returnButtonText}>Return</Text>
      </TouchableOpacity>

      <CharacterSelectionModal
        visible={modalVisible}
        onClose={handleCloseModal}
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
