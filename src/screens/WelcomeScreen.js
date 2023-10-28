import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native'
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-around', backgroundColor: '#cfd0d4' }}>
      <View className="space-x-0">
        <Text style={{ fontSize: wp(10) }} className="text-center  font-bold text-gray-700">
          pocketBot
        </Text>
        <Text style={{ fontSize: wp(4) }} className="text-center tracking-wider text-gray-600 font-semibold">
          the bot in your pocket.
        </Text>
      </View>
      <View className="flex-row justify-center">
        <Image source={require("../../assets/images/welcome.png")} style={{ width: wp(75), height: wp(75) }} />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} className='bg-emerald-500 mx-5 p-4 rounded-2xl'>
        <Text style={{ fontSize: wp(6) }} className='text-center font-bold text-white'>Get Started</Text>
      </TouchableOpacity>

    </SafeAreaView>
  )
}