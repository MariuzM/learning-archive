import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export const CustomLink = ({ to, text }: { to: any; text: string }) => {
  return (
    <Link href={to}>
      <View
        style={{
          alignItems: 'center',
          borderColor: 'black',
          borderWidth: 1,
          height: 50,
          justifyContent: 'center',
          width: 100,
        }}
      >
        <Text style={{ color: 'blue', fontSize: 20 }}>{text}</Text>
      </View>
    </Link>
  );
};
