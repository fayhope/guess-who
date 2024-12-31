import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Characters from './characters';
import CreateGameScreen from './createGameScreen';
import Home from './home';
import JoinGame from './joinGame';



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Characters" component={Characters} />
        <Stack.Screen name="CreateGameScreen" component={CreateGameScreen} />
        <Stack.Screen name="JoinGame" component={JoinGame} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}