import { useAutoComplete } from '@/hooks/useAutoComplete';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

export const GoogleAutoComplete = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data, isLoading, error } = useAutoComplete(debouncedSearch);

  useEffect(() => {
    if (error) console.log("ERROR", error.message);
   else  if (data) console.log("DATAT", data);
  }, [data, error]);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [search]);
  
    return (
   <View style={{borderWidth: 1, borderColor: 'black', width: '100%', height: '100%', padding: 10}}>
    <Text>Hello</Text>
    <TextInput 
      placeholder='Search' 
      style={{borderWidth: 1, borderColor: 'black', width: '100%', height: 40, padding: 10, borderRadius: 10}} 
      onChangeText={(text) => {
        setSearch(text);

      }}
      
      />
   </View>
    )
}
