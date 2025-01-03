import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Characters from './characters';
import CreateGameScreen from './createGameScreen';
import GameScreen from './gameScreen';
import Home from './home';
import JoinGame from './joinGame';



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Characters" component={Characters} options={{ headerShown: false }} />
        <Stack.Screen name="CreateGameScreen" component={CreateGameScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="JoinGame" component={JoinGame} options={{ headerShown: false }}/>
        <Stack.Screen name="GameScreen" component={GameScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}