import { onChildChanged, onValue, ref, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { db, liveDb } from './firebaseConfig';

export default function GameScreen({ route, navigation }) {
  const { gameCode, gameId, playerId, playerTurn } = route.params;

  const [game, setGame] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [players, setPlayers] = useState([]);
  const [turn, setTurn] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [removeMode, setRemoveMode] = useState(false);
  const [playerBoards, setPlayerBoards] = useState({});

  // Initialize player boards
  const populateBoards = () => {
    const boards = {};
    players.forEach(player => {
      if (!playerBoards[player.playerId]) {  // Avoid overwriting existing boards
        boards[player.playerId] = characters.reduce((acc, character) => {
          acc[character.id] = 1;
          return acc;
        }, {});
        const boardRef = ref(liveDb, `liveGames/${gameId}/players/${playerTurn}/board`);
        set(boardRef, boards[player.playerId]);
      }
    });
    setPlayerBoards(prev => ({ ...prev, ...boards }));
  };

  // Fetch game data from Firestore
  const fetchGameData = async () => {
    try {
      const gameRef = doc(db, 'games', gameId);
      const gameSnapshot = await getDoc(gameRef);
      const gameData = gameSnapshot.data();
  
      if (gameData) {
        setGame(gameData);
        setPlayers(gameData.players || []);
        setCharacters(gameData.characters || []);
  
        // Only set data if liveDb doesn't have it
        const liveGameRef = ref(liveDb, `liveGames/${gameId}`);
        onValue(liveGameRef, (snapshot) => {
          if (!snapshot.exists()) {
            set(liveGameRef, gameData);
            populateBoards();
          }
        }, { onlyOnce: true });
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  };
  

  // Subscribe to game updates
  const subscribeToGameUpdates = () => {
    const gameRef = ref(liveDb, `liveGames/${gameId}`);
    onChildChanged(gameRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      if (key === 'turn') setTurn(value);
      if (key === 'characters') setSelectedCharacters(value || []);
      if (key === 'players') setPlayerBoards(value || {});
    });
  };

  // Update turn in the database
  const updateTurn = async (newTurn) => {
    try {
      const turnRef = ref(liveDb, `liveGames/${gameId}/turn`);
      await set(turnRef, newTurn);
      setTurn(newTurn);
    } catch (error) {
      console.error('Error updating turn:', error);
    }
  };

  // Update character status
  let characterUpdateTimeout;

  const updateCharacterStatus = (characterId, status) => {
    clearTimeout(characterUpdateTimeout);
    characterUpdateTimeout = setTimeout(async () => {
      try {
        const boardRef = ref(liveDb, `liveGames/${gameId}/players/${playerId}/board`);
        await set(boardRef, {
          ...playerBoards[playerId],
          [characterId]: status,
        });
      } catch (error) {
        console.error('Error updating character status:', error);
      }
    }, 500); // Batch changes within 500ms
  };
  

  // Toggle Guess/Remove Mode
  const toggleRemoveMode = () => {
    setRemoveMode(!removeMode);
  };

  // Handle character selection
  const handleSelectCharacter = (characterId) => {
    const updatedSelection = [...selectedCharacters];
    const index = updatedSelection.indexOf(characterId);

    if (removeMode && index !== -1) {
      updatedSelection.splice(index, 1);
      updateCharacterStatus(characterId, 0);
    } else if (!removeMode && index === -1) {
      updatedSelection.push(characterId);
      updateCharacterStatus(characterId, 1);
    }

    setSelectedCharacters(updatedSelection);
  };

  // Switch turn between players
  const switchTurn = async () => {
    const newTurn = turn === 0 ? 1 : 0;
    await updateTurn(newTurn);
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    subscribeToGameUpdates();
  }, []);

  // Loading state
  if (!game) {
    return <Text>Loading game...</Text>;
  }

  const isPlayerTurn = turn === players.findIndex(p => p.playerId === playerId);

  return (
    <SafeAreaView style={styles.container}>
      <Text>Game Code: {gameCode}</Text>
      <Text>{isPlayerTurn ? "Your Turn" : "Waiting for Opponent..."}</Text>

      <FlatList
        data={characters}
        style={styles.board}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectCharacter(item.id)}
            style={[
              styles.character,
              selectedCharacters.includes(item.id) && styles.selectedCharacter,
              removeMode && styles.removedCharacter
            ]}
            disabled={!isPlayerTurn}
          >
            <Text style={styles.characterName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        numColumns={4}
      />

      <TouchableOpacity onPress={toggleRemoveMode} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>
          {removeMode ? 'Switch to Guess Mode' : 'Switch to Remove Mode'}
        </Text>
      </TouchableOpacity>

      {isPlayerTurn && (
        <TouchableOpacity onPress={switchTurn} style={styles.switchTurnButton}>
          <Text style={styles.switchTurnText}>End Turn</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.returnButtonText}>Return</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  character: {
    backgroundColor: '#c0c0c0',
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
    width: '25%',
    height: '50%',
    alignItems: 'center',
  },
  selectedCharacter: {
    backgroundColor: '#4CAF50',
  },
  removedCharacter: {
    backgroundColor: '#9E9E9E',
    opacity: 0.5,
  },
  characterName: {
    color: 'white',
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
  },
  board:{
    width: '95%',
  },
  switchTurnButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  switchTurnText: {
    color: 'white',
    fontSize: 16,
  },
  returnButtonText: {
    color: '#007BFF',
    fontSize: 16,
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
