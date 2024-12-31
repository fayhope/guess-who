import React from 'react';
import { Button, Text, View } from 'react-native';

export default function Home({ navigation }) {
  return (
    <View>
      <Text>Guess Who - Your Friends Edition!</Text>
      <Button
        title="Go to Characters"
        onPress={() => navigation.navigate('Characters')}
      />
      <Button
        title="New Game"
        onPress={() => navigation.navigate('CreateGameScreen')}
      />
      <Button
        title="Join Game"
        onPress={() => navigation.navigate('JoinGame')}
      />
    </View>
  )
}