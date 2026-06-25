import React from 'react';
import WebView from 'react-native-webview';

export default function Page2() {
  return <WebView source={{ uri: 'https://www.worldtimeserver.com/current_time_in_US-NY.aspx' }} />;
}
