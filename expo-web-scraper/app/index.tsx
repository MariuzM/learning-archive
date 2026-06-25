import { parse } from 'node-html-parser';
import React, { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import WebView from 'react-native-webview';

export default function Root() {
  const [htmlString, setHtmlString] = useState<string>('');
  const { width } = useWindowDimensions();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    try {
      timer = setInterval(async () => {
        const res = await fetch('https://www.worldtimeserver.com/current_time_in_US-NY.aspx');
        const html = await res.text();
        const root = parse(html);
        const getText = root.querySelector('#theTime')?.outerHTML;
        if (!getText) throw new Error('No text found');
        setHtmlString(getText);
      }, 1000);
    } catch (error) {
      console.log('🚀 ~ error:', error);
    }
    return () => {
      timer && clearInterval(timer);
    };
  }, []);

  return (
    <>
      <View style={{ height: 50 }}>
        <Text>WebView</Text>
        <WebView source={{ html: htmlString }} />
      </View>

      <View>
        <Text>React-Native-Render-Html</Text>
        <RenderHtml contentWidth={width} source={{ html: htmlString }} />
      </View>
    </>
  );
}
