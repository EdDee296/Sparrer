import { StyleSheet, Image, Platform, View, Text, ScrollView, FlatList } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const demoProfiles = [
  {
    id: '259389830744794',
    first_name: 'Candice',
    birthday: '10/18/1986',
    work: [{position:{name:'Supermodel'}}],
    image_url: 'https://www.instagram.com/p/CeWZqQsMOBx'
  },
  {
    id: '720115413',
    first_name: 'Alessandra',
    birthday: '1/10/1989',
    work: [{position:{name:'Dancer'}}],
    image_url: 'https://www.instagram.com/p/CPdY-ujN5T7'
  },
  {
    id: '912478262117011',
    first_name: 'Rosie',
    birthday: '9/4/1989',
    work: [{position:{name:'Artist'}}],
    image_url: 'https://www.instagram.com/p/CZZKSO1v4M2'
  },
  {
    id: '1476279359358140',
    first_name: 'Alissa',
    birthday: '2/11/1990',
    work: [{position:{name:'Comedian'}}],
    image_url: 'https://www.instagram.com/p/CF3XYdVpjRa'
  },
  {
    id: '173567062703796',
    first_name: 'Kendall',
    birthday: '8/17/1992',
    work: [{position:{name:'Truck Driver'}}],
    image_url: 'https://www.instagram.com/p/CRD9c1YJG7Z'
  },
  {
    id: '169571172540',
    first_name: 'Miranda',
    birthday: '12/12/1983',
    work: [{position:{name:'Doctor'}}],
    image_url: 'https://www.instagram.com/p/CKO9xDhLYXx'
  },
  {
    id: '1492309647af685574',
    first_name: 'Behati',
    birthday: '3/23/1991',
    work: [{position:{name:'Developer'}}],
    image_url: 'https://www.instagram.com/p/CUJ9GZJpT8k'
  },
  {
    id: '6622543539ff34918',
    first_name: 'Anna',
    birthday: '3/23/1989',
    work: [{position:{name:'Personal Trainer'}}],
    image_url: 'https://www.instagram.com/p/CKtnm_5jWJR'
  },
  {
    id: '4241542777aa77372',
    first_name: 'Gabriella',
    birthday: '3/23/1988',
    work: [{position:{name:'Surfer'}}],
    image_url: 'https://www.instagram.com/p/CMqdePwnnUK'
  },
  {
    id: '66272010379ff6952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '6627201037z96952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '662720103796f952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '66272010379a6952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '6627w20103796952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '66272010379e6952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '66272010afasd3796952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '66272010f37fsda96952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '6627201037dfaf96952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '662720ffd103796952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '66adf2720103796952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '66272010a3796952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  },
  {
    id: '66272010fa3796952',
    first_name: 'Mara',
    birthday: '3/23/1987',
    work: [{position:{name:'Lifeguard'}}],
    image_url: 'https://www.instagram.com/p/CFdYhEoB51F'
  }
]


export default function TabTwoScreen() {

  const renderRow = (data) => {
    const first_name = data.item.first_name;
    const url = data.item.image_url;
    return (
      <View style={styles.container}>
          {/* Use the tw function to apply TailwindCSS styles */}
          <Image
            source={{ uri: 'https://graph.facebook.com/259389830744794/picture?height=500' }}
            style={styles.image}
          />
          <Text style={styles.text}>
            {first_name}
          </Text>
        </View>
    )
  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={demoProfiles}
          renderItem={renderRow}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 10,
          }}
        >

        </FlatList>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Aligns children in a row
    alignItems: 'center', // Centers children vertically in the container
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25, // Adjusted for a more appropriate circle shape given the size
  },
  text: {
    color: 'white', // Assuming you want white text
    fontSize: 24, // Adjusted for better visual balance with the image size
    marginLeft: 10, // Adds some space between the image and the text
  },
});