import React from "react";
import { Text, View } from 'react-native';

export default function HowToPlay({ route, navigation }) {
    return(
        <View>
            <Text>Add Your Characters!</Text>
            <Text>Click the button at the top of the home page and add any characters, or import from contacts!</Text>
            <Text>Play the Game</Text>
            <Text>The game is designed for you to play in person or on the phone so you ask all the questions in real life! Just select the players you want to remove </Text>
        </View>
    );
}