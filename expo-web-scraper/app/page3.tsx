import React from 'react';
import { Alert } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

export default function Page3() {
  const jsCode = `
    const body = document.body.innerHTML;
    const root = document.querySelector('#theTime').innerHTML;
    window.ReactNativeWebView.postMessage(root.trim());
  `;

  const onMessage = (e: WebViewMessageEvent) => {
    const message = e.nativeEvent.data;
    Alert.alert('Time message received', message);
  };

  return (
    <WebView
      source={{ uri: 'https://www.worldtimeserver.com/current_time_in_US-NY.aspx' }}
      javaScriptEnabled={true}
      injectedJavaScript={jsCode}
      onMessage={onMessage}
    />
  );
}
