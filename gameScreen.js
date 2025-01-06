import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CharacterSelectionModal from './characterSelectionModal';
import { auth, db } from './firebaseConfig';


export default function GameScreen({ route, navigation }) {
  const { gameCode, selectedCharacters, gridRows, gridCols, secondPlayer } = route.params;
  const [game, setGame] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
  const [playerId, setPlayerId] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

    const isFocused = useIsFocused();

      useEffect(() => {
      const loadCharacters = async () => {
        try {
          const storedCharacters = await AsyncStorage.getItem('characters');
          if (storedCharacters) {
             const parsedCharacters = JSON.parse(storedCharacters);
            setCharacters(parsedCharacters);
          } else {
            console.log('No characters found in AsyncStorage');
          }
        } catch (error) {
          console.error('Failed to load characters:', error);
        }
      };
  
      loadCharacters();
    }, []);

    useEffect(() => {
      const fetchGameData = async () => {
          setIsLoading(true)
           try {
              const gamesRef = collection(db, 'games');
              const q = query(gamesRef, where('gameCode', '==', gameCode.toUpperCase()));
             const querySnapshot = await getDocs(q);
  
               if (!querySnapshot.empty) {
                  const gameDoc = querySnapshot.docs[0];
                  const gameData = gameDoc.data();
                   const player = gameData.players.find(player => player.playerId === auth.currentUser.uid);

                    if (!player || player.selectedCharacters.length === 0) {
                       if (secondPlayer) {
                         setModalVisible(true);
                         setPlayerId(auth.currentUser.uid);
                      } else {
                             if (selectedCharacters && selectedCharacters.length > 0) {
                                const char = characters.filter((character) =>
                                  selectedCharacters.includes(character.id)
                                );
                                 setGame({ ...gameData, players: gameData.players, characters: char, gridRows: 5, gridCols: 5});
                                 setPlayerId(auth.currentUser.uid);
                           } else {
                                setModalVisible(true);
                                 setPlayerId(auth.currentUser.uid);
                            }
                      }
                  } else {
                        const char = characters.filter((character) =>
                            player.selectedCharacters.includes(character.id)
                         );
                    setGame({...gameData, players: gameData.players, characters: char, gridRows: 5, gridCols: 5});
                    setPlayerId(auth.currentUser.uid)
                  }
                }
               } catch (error) {
                console.error('Error fetching game data:', error);
           } finally {
               setIsLoading(false)
           }
        };
        fetchGameData();
    }, [gameCode, isFocused, secondPlayer]);

  const handleSelectCharacters = async (selectedIds) => {
    setSelectedCharacters(selectedIds);

      try {
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, where('gameCode', '==', gameCode.toUpperCase()));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
             const gameDoc = querySnapshot.docs[0];
          const gameData = gameDoc.data();
          const updatedPlayers = gameData.players.map((player) => {
           if(player.playerId === playerId) {
               return {
                ...player,
                selectedCharacters: selectedIds
               };
           }
               return player;
         });

           await updateDoc(doc(db, 'games', gameDoc.id), { players: updatedPlayers });

           const char = characters.filter((character) =>
                selectedIds.includes(character.id)
            );
                setGame({...gameData, players: updatedPlayers, characters: char, gridRows: 5, gridCols: 5});
             setModalVisible(false);
        }
      } catch (error) {
        console.error("Error selecting characters:", error);
      }
   
  };

    if (isLoading) {
      return (
        <View style={styles.container}>
          <Text>Loading Game...</Text>
        </View>
      )
    }
    
    if (!game) {
      return (
        <View style={styles.container}>
          <Text>Game Loading Error...</Text>
        </View>
      )
    }

  return (
    <View style={styles.container}>
      <Text>Game Code: {gameCode}</Text>
      {game && game.players.map(player => (
          <View key={player.playerId}>
            <Text>Player Id: {player.playerId}</Text>
            <Text>Selected Characters: {player.selectedCharacters.join(', ')}</Text>
          </View>
      ))}
        <Text>Characters: {game.characters.map((char) => char.name).join(", ")}</Text>
       {game && (
          <Text>
              Rows: {game.gridRows} and Cols: {game.gridCols}
          </Text>
        )}
    
          <CharacterSelectionModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              characters={characters}
              onSelectCharacter={handleSelectCharacters}
          />

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
});