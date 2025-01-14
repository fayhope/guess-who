import { onValue, ref, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db, liveDb } from './firebaseConfig';

export default function GameScreen({ route, navigation }) {
  const { gameCode } = route.params; // Get game code passed from the previous screen
  const {gameId} = route.params; 
  const {playerId} = route.params;
  const [game, setGame] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [players, setPlayers] = useState([]);
  const [turn, setTurn] = useState(null); // 0 for Player 1, 1 for Player 2
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [removeMode, setRemoveMode] = useState(false); // Toggle remove mode
  const [board, setBoard] = useState({}); // Board state for each player
  const [playerBoards, setPlayerBoards] = useState({});

  const populateBoards = () => {
    players.forEach(player => {
        const playerBoard = characters.map(character => ({
          id: character.id,
          inPlay: 1, // Default to in-play
        }));
        boards[player.playerId] = playerBoard; // Assign to the player's ID
        const boardRef = ref(liveDb, `liveGames/${gameId}/players/${player.playerId}`);
        set(boardRef, playerBoard);
      });
      setPlayerBoards(boards);
  };

  // Fetch static game data from Firestore
  const fetchGameData = async () => {
    try {
      console.log("gameId:", gameId);
      console.log("Trying");

      const gameRef = doc(db, 'games', gameId);
      console.log("got ref");
      const gameSnapshot = await getDoc(gameRef);
      console.log("got snapshot");
      const gameData = gameSnapshot.data();
      console.log("got data:", gameData);
  
      // Check if gameData exists
      if (gameData) {
        console.log("Saving data to Realtime Database...");
        
        setGame(gameData);
        const liveGameRef = ref(liveDb, `liveGames/${gameId}`);
        await set(liveGameRef, gameData);
        console.log("Data successfully saved to Realtime Database");
      } else {
        console.error("Game data is undefined or empty");
      }
    } catch (error) {
      console.error("Error fetching or saving game data:", error);
    }
  };

  // Subscribe to live updates (turn, selected characters, and board) from Realtime Database 
  //NEXT STEP TO MAKE THIS WORK
  const subscribeToGameUpdates = () => {
    const gameRef = ref(liveDb, `liveGames/${gameId}`);
    
    onValue(gameRef, (snapshot) => {
      const gameState = snapshot.val();
  
      if (gameState) {
        setTurn(gameState.turn); 
        setSelectedCharacters(gameState.characters);  
        setBoard(gameState.board || {}); // Update board state from liveDb
      } else {
        console.error('Game state is null or undefined');
      }
    });
  };

  // Update the current turn in the live database
  const updateTurn = async (newTurn) => {
    try {
      const turnRef = ref(liveDb, `liveGames/${gameId}/turn`);
      await set(turnRef, newTurn); // Update turn in liveDb
    } catch (error) {
      console.error('Error updating turn:', error);
    }
  };

  // Update the character's status on the board (0 for removed, 1 for in play)
  const updateCharacterStatus = async (playerId, characterId, status) => {
    try {
      const boardRef = ref(liveDb, `liveGames/${gameId}/players/${playerId}`);
      await set(boardRef, { ...board[playerId], [characterId]: status });
    } catch (error) {
      console.error('Error updating character status:', error);
    }
  };

  // Toggle between "guess" and "remove" modes
  const toggleRemoveMode = () => {
    setRemoveMode(!removeMode);
  };

  // Handle character selection or removal
  const handleSelectCharacter = (characterId) => {
    const updatedSelectedCharacters = [...selectedCharacters];
    const index = updatedSelectedCharacters.indexOf(characterId);
    
    if (removeMode) {
      if (index !== -1) {
        updatedSelectedCharacters.splice(index, 1); // Remove character if in remove mode
        updateCharacterStatus(playerId, characterId, 0); // Update board status to 0 (removed)
      }
    } else {
      if (index === -1) {
        updatedSelectedCharacters.push(characterId); // Add character if not in remove mode
        updateCharacterStatus(playerId, characterId, 1); // Update board status to 1 (in play)
      }
    }

    setSelectedCharacters(updatedSelectedCharacters);
    updateGameSelection(updatedSelectedCharacters);
  };

  // Update game selection in Realtime Database
  const updateGameSelection = async (updatedSelectedCharacters) => {
    try {
      const playersRef = ref(liveDb, `liveGames/${gameId}/players/${playerId}`);
      await set(playersRef, { selectedCharacter: updatedSelectedCharacters });
    } catch (error) {
      console.error('Error updating character selection:', error);
    }
  };

  useEffect(() => {
    fetchGameData();
  }, [gameId]);

  useEffect(() => {
    subscribeToGameUpdates();
  }, [gameId]);

  // Handle turn switch (end of a player's turn)
  const switchTurn = async () => {
    const newTurn = turn === 0 ? 1 : 0; // Switch between Player 1 and Player 2
    await updateTurn(newTurn); // Update turn in liveDb
    setTurn(newTurn); // Update turn state locally
  };

  // Loading screen
  if (!game) {
    return <Text>Loading game...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text>Game Code: {gameCode}</Text>
      <Text>{playerId}</Text>
      <Text>{gameId.turn === players.find(player => player.playerId === playerId)?.turn ? 'Your Turn' : 'Not Your Turn'}</Text>
      <Text>Selected Characters: {selectedCharacters.join(", ")}</Text>

      <View style={styles.board}>
        {players.map(player => (
          <View key={player.playerId} style={styles.playerBoard}>
            <Text>{`Player ${player.turn + 1}'s Board:`}</Text>
            <FlatList
              data={selectedCharacters}
              renderItem={({ item }) => (
                <View style={styles.characterRow}>
                  <Text>{item.name}</Text>
                  <Text>{board[player.playerId]?.[item.id] === 1 ? "In Play" : "Removed"}</Text>
                </View>
              )}
              keyExtractor={item => item.id}
            />
          </View>
        ))}
      </View>

      <View style={styles.characters}>
        <FlatList
          data={characters}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectCharacter(item.id)}
              style={[
                styles.character,
                selectedCharacters.includes(item.id) && styles.selectedCharacter,
                removeMode && styles.removedCharacter
              ]}
              disabled={turn !== (playerId === game.players[0].playerId ? 0 : 1)}
            >
              <Text style={styles.characterName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      </View>

      <TouchableOpacity onPress={toggleRemoveMode} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>
          {removeMode ? 'Switch to Guess Mode' : 'Switch to Remove Mode'}
        </Text>
      </TouchableOpacity>

      {turn === (playerId === game.players[0].playerId ? 0 : 1) && (
        <TouchableOpacity onPress={switchTurn} style={styles.switchTurnButton}>
          <Text style={styles.switchTurnText}>End Turn</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
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
    backgroundColor: '#f0f0f0',
  },
  character: {
    fontSize: 18,
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#c0c0c0',
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  selectedCharacter: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  removedCharacter: {
    backgroundColor: '#9E9E9E',
    opacity: 0.6,
  },
  characterName: {
    fontSize: 16,
    color: 'white',
  },
  returnButtonText: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
  toggleButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
  },
  switchTurnButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 15,
  },
  switchTurnText: {
    color: 'white',
    fontSize: 16,
  },
  characters: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  board: {
    marginTop: 20,
    width: '100%',
  },
  playerBoard: {
    marginBottom: 20,
  },
  characterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
