import { useIsFocused } from '@react-navigation/native';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import background from './background.jpg';
import { db } from './firebaseConfig';

export default function JoinGame({ navigation }) {
  const [enteredCode, setEnteredCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    const checkGameStatus = async () => {
      if (isLoading || !enteredCode || enteredCode.length < 6) return;

      try {
        await signInAnonymously(getAuth());
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, where('gameCode', '==', enteredCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const gameDoc = querySnapshot.docs[0];
          const gameData = gameDoc.data();
          setPlayers(gameData.players || []);
        } else {
          console.error('No game found with the entered code.');
          alert('Game not found. Please check the game code.');
        }
      } catch (error) {
        console.error('Error checking game status:', error);
      }
    };

    if (enteredCode) {
      checkGameStatus();
    }
  }, [enteredCode, isFocused, isLoading]);

  const handleJoinGame = async () => {
    setIsLoading(true);
    const auth = getAuth();

    // If not signed in yet, sign in anonymously
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, where('gameCode', '==', enteredCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const gameDoc = querySnapshot.docs[0];
      const gameData = gameDoc.data();

      const playerAlreadyJoined = gameData.players.some(
        (player) => player.playerId === auth.currentUser.uid
      );

      if (playerAlreadyJoined) {
        Alert.alert('Error', 'You are already in this game.');
        setIsLoading(false);
        return;
      }

      const newPlayer = {
        playerId: auth.currentUser.uid,
        turn: gameData.players.length,
      };

      const updatedPlayers = [...gameData.players, newPlayer];
      const playerId = auth.currentUser.uid;
      // Update the game with the new player
      await updateDoc(doc(db, 'games', gameDoc.id), { players: updatedPlayers });
      console.log('Player joined', updatedPlayers.length);
      // Redirect to the Waiting Room
      setIsLoading(false);
      navigation.navigate('WaitingRoom', {
        gameCode: enteredCode,
        gameId: gameDoc.id,
        playerId: playerId,
      });
    } else {
      Alert.alert('Error', 'Invalid game code');
    }
  };

  return (
    <ImageBackground source = {background} resizeMode='cover' style={styles.background}>
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Join a Game</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Game Code"
        value={enteredCode}
        onChangeText={setEnteredCode}
        maxLength={6}
      />
        <TextInput
        style={styles.input}
        placeholder="Nickname"
        maxLength={12}
        value={playerName}
      />
    {isLoading && <Text>Loading Game...</Text>}
    <TouchableOpacity style={styles.Button} onPress={() => handleJoinGame() }>
        <Text style={styles.ButtonText}>Join Game</Text>
    </TouchableOpacity>   
    <TouchableOpacity style={styles.Button} onPress={() => navigation.goBack()}>
        <Text style={styles.ButtonText}>Return</Text>
    </TouchableOpacity>
    </SafeAreaView>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
    backgroundColor: "#FFFFFF"
  },
  waitingText: {
    fontSize: 18,
    color: 'orange',
    marginVertical: 10,
  },
  Button: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#008CBA',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
});
