import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import background from './background.jpg';
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
  const [playerName, setPlayerName] = useState(null);
  const [playerTurn, setPlateTurn] = useState(0);

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
        gameStatus: 'waiting', // New field to track game status
      };

      const docRef = await addDoc(collection(db, 'games'), newGame);
      console.log('Game created with ID:', docRef.id);
      setGameCode(newGame.gameCode);
      setGameId(docRef.id);

      // Count total games in Firestore
      const gamesSnapshot = await getDocs(collection(db, 'games'));
      console.log('Total games in Firestore:', gamesSnapshot.size);
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

    try {
      if (playerName) { 
        await AsyncStorage.setItem("name", JSON.stringify(playerName)); 
    } }catch {(error)}

    setIsLoading(true);

    try {
      const gameRef = doc(db, 'games', gameId);
      const gameSnapshot = await getDoc(gameRef);
      const gameData = gameSnapshot.data();
      let players = gameData ? gameData.players || [] : [];

      // Add creator (current user) to players if not already added
      if (!players.some(player => player.playerId === auth.currentUser.uid)) {
        const newPlayer = {
          playerId: auth.currentUser.uid,
          turn: players.length,
          name: playerName,
        };
        players.push(newPlayer);
        await updateDoc(gameRef, { players });
      }
      
      await updateDoc(gameRef, {
        characters: selectedCharacters, // Store selected characters
        gameStatus: 'started', // Update game status to 'started'
      });

      // Navigate to Waiting Room after game creation
      navigation.navigate('WaitingRoom', {
        gameCode,
        gameId,
        selectedCharacters,
        playerId,
        playerTurn,
      });

    } catch (error) {
      console.error('Error starting the game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source = {background} resizeMode='cover' style={styles.background}>
    <View style={styles.container}>
      <Text style={styles.title}>Create a</Text>
      <Text style={styles.title}>New Game</Text>

      <TextInput
        style={styles.input}
        placeholder="Nickname"
        maxLength={12}
        value={playerName}
      />

      {!loadingCharacters && (
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Choose Characters</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={startGame} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Starting Game...' : 'Start'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Return</Text>
      </TouchableOpacity>

      <CharacterSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        characters={characters}
        onSelectCharacter={handleSelectCharacters}
      />
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 0,
    marginTop: 0,
    color: '#FFFFFF' ,
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: {width:3, height:7},
    textShadowRadius: 10,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    width: '80%',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
});
