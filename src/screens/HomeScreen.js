import { View, Text, SafeAreaView, Image, ScrollView, TouchableOpacity, TextInput, Keyboard, StyleSheet } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-package';

import { apiCall } from '../api/openai'


export default function HomeScreen() {
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState('');
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [scrollHeight, setScrollHeight] = useState(hp(90));
  const scrollViewRef = useRef();

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 200)
  }

  const handleSendButtonPress = async () => {
    fetchResponse();
    setInputValue('')
  }

  const storeMessage = async (message) => {
    try {
      let storedMessages = await AsyncStorage.getItem('messages');
      if (storedMessages !== null) {
        storedMessages = JSON.parse(storedMessages);
      } else {
        storedMessages = [];
      }
      const updatedMessages = [
        ...storedMessages,
        ...message.slice(-2)
      ];
      await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
    } catch (error) {
      console.log('Error storing message:', error);
    }
  }

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('messages');
      if (storedMessages !== null) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.log('Error loading messages:', error);
    }
  }

  const clearMessages = async () => {
    try {
      await AsyncStorage.clear();
      setMessages([]); // optional: reset messages state to an empty array
    } catch (error) {
      console.log('Error clearing messages:', error);
    }
  }

  const fetchResponse = async () => {
    // clearMessages(); 
    if (result.trim().length > 0) {
      setLoading(true);
      let newMsgs = [...messages]
      newMsgs.push({ role: 'user', content: result.trim() });

      setMessages(newMsgs);

      // updateScrollView();
      apiCall(result.trim(), newMsgs).then(res => {

        setLoading(false);
        if (res.success) {
          setMessages([...res.data]);
          storeMessage(res.data);
          setResult('');
          // updateScrollView();

        }
      })

    }
  }

  useEffect(() => {
    updateScrollView();
  }, [messages.length])

  useEffect(() => {
    setResult(inputValue);
  }, [inputValue])

  useEffect(() => {
    loadMessages();
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setScrollHeight(hp(50));
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setScrollHeight(hp(90));
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View className='flex-1 bg-white' style={{ flex: 1, margin: 0 }}>
      <SafeAreaView style={{ flex: 1, margin: 5, padding: 0 }}>
        {/* <View className='flex-row justify-center'>
          <Image source={require('../../assets/images/bot.png')} style={{ height: hp(15), width: hp(15) }} />
        </View> */}

        {
          (
            <View className='space-x-2 flex-1'>
              <View
                style={{ height: scrollHeight }}
                className='bg-white rounded-3xl '
              >
                <ScrollView
                  ref={scrollViewRef}
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  // style={{ flex: 1, margin: 0 }}
                >
                  {
                    messages.map((message, index) => {
                      if (message.role == 'assistant') {
                        if (message.content.includes('https')) {
                          return (
                            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                              <Image source={require('../../assets/images/bothead.png')} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} />
                              <View style={{ maxWidth: wp(50), backgroundColor: 'white', borderRadius: 8, padding: 10 }}>
                                <Image
                                  source={{ uri: message.content }}
                                  style={{ height: wp(60), width: wp(60), borderRadius: 8 }}
                                  resizeMode='contain'
                                />
                              </View>
                            </View>
                          )

                        } else {
                          return (

                            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                              <Image source={require('../../assets/images/bothead.png')} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} />
                              <View style={{ maxWidth: wp(60), borderRadius: 8, padding: 10 }} className=' bg-yellow-400'>
                                {/* <Text style={{ textAlign: 'left', fontSize: 14, color: '#333' }}>
                                  {message.content}
                                </Text> */}
                                <Markdown styles={markdownStyle}>
                                  {message.content}
                                </Markdown>
                              </View>
                            </View>
                          )
                        }
                      } else {
                        return (
                          <View key={index} className='flex-row justify-end'>
                            <View style={{ maxWidth: wp(60), borderRadius: 8, padding: 10 }} className='bg-blue-300'>
                              <Text style={{ textAlign: 'left', fontSize: 14, color: '#333' }}>
                                {message.content}
                              </Text>
                            </View>
                            <Image source={require('../../assets/images/userhead.png')} style={{ width: 50, height: 50, marginLeft: 10, borderRadius: 25 }} />
                          </View>

                        )
                      }
                    })

                  }
                </ScrollView>
              </View>
            </View>
          )
        }
        <View style={{ flexDirection: 'row', alignItems: 'center' }} className='bg-gray-500 p-3 rounded-2xl'>
          <TouchableOpacity
            style={{ padding: 10, marginRight: 20, marginLeft: 0 }}
            className=' bg-red-500 mx-5 p-2.5 rounded-2xl'
            disabled={messages.length === 0}
            onPress={clearMessages}
          >
            <Text style={{ color: 'white' }}>clear</Text>
          </TouchableOpacity>
          <TextInput
            style={{ width: wp(55), color: 'black' }}
            className='bg-emerald-100 rounded-xl p-2'
            multiline={true}
            keyboardType='default'
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
            }}
          />
          <TouchableOpacity
            style={{ padding: 10, marginLeft: 20, marginRight: 0 }}
            className='bg-emerald-500 mx-5 p-3 rounded-2xl'
            disabled={inputValue.length === 0}
            onPress={handleSendButtonPress}
          >
            <Text style={{ color: 'white' }}>send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}


const markdownStyle = {
  heading1: {
    color: 'red',
  },
  heading2: {
    color: 'green',
    textAlign: 'right',
  },
  strong: {
    color: 'blue',
  },
  em: {
    color: 'cyan',
  },
  text: {
    color: 'black',
  },
  blockQuoteText: {
    color: 'grey',
  },
  blockQuoteSection: {
    flexDirection: 'row',
  },
  blockQuoteSectionBar: {
    width: 3,
    height: null,
    backgroundColor: '#DDDDDD',
    marginRight: 15,
  },
  codeBlock: {
    fontFamily: 'Courier',
    fontWeight: '500',
    backgroundColor: '#DDDDDD',
  },
  tableHeader: {
    backgroundColor: 'grey',
  },
};