import React, { useState, useCallback, useRef, useEffect } from "react";
import YoutubePlayer from "react-native-youtube-iframe";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';

const YoutubePlayerScreen = ({ route }) => {
  const { paperTheme } = route.params;

  const playerRef = useRef();
  const [elapsed, setElapsed] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playback, setPlayback] = useState(1);
  const [playbackRates, setPlaybackRates] = useState([]);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const togglePlayback = useCallback(() => {
    setPlayback((prev) => {
      const index = playbackRates.indexOf(prev);
      const nextIndex = (index + 1) % playbackRates.length;
      return playbackRates[nextIndex];
    });
  }, [playbackRates]);

  const calculateTime = (time) => {
    const elapsed_ms = Math.floor(time * 1000);
    const min = Math.floor(elapsed_ms / 60000);
    const seconds = Math.floor((elapsed_ms - min * 60000) / 1000);

    return min.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const elapsed_sec = await playerRef.current.getCurrentTime();
      const total_sec = await playerRef.current.getDuration();

      setElapsed(calculateTime(elapsed_sec));
      setTotalTime(calculateTime(total_sec));

      setPlayback(await playerRef.current.getPlaybackRate());
      setPlaybackRates(await playerRef.current.getAvailablePlaybackRates());
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: paperTheme.colors.background, padding: 14, gap: 30 }}>
      <Text style={{ color: paperTheme.colors.tertiary, fontSize: 36, fontWeight: 'bold', textAlign: 'center' }}>Youtube Player</Text>

      <View style={{}}>
        <YoutubePlayer
          ref={playerRef}
          height={200}
          play={playing}
          mute={isMuted}
          playbackRate={playback}
          videoId={"Uw0mLXWIb6Q"}
          onChangeState={onStateChange}
          initialPlayerParams={{
            controls: false,
            preventFullScreen: true,
          }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            allowsFullscreenVideo: false,
            mediaPlaybackRequiresUserAction: false,
            borderRadius: 12,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-evenly' }}>
        <TouchableOpacity onPress={toggleMute} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: paperTheme.colors.secondaryContainer, borderRadius: 12, padding: 8, alignSelf: 'flex-start' }}>
          <Icon name={isMuted ? 'volume-off' : 'volume-high'} size={24} color={paperTheme.colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayback} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: paperTheme.colors.secondaryContainer, borderRadius: 12, padding: 12, width: 64, justifyContent: 'center' }}>
          <Text style={{ color: paperTheme.colors.secondary, fontWeight: '600' }}>{playback}x</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlaying} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: paperTheme.colors.primaryContainer, borderRadius: 12, padding: 8, alignSelf: 'flex-start' }}>
          <Icon name={playing ? 'pause' : 'play'} size={24} color={paperTheme.colors.primary} />
          <Text style={{ color: paperTheme.colors.primary, paddingRight: 2 }}>{playing ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 4, backgroundColor: paperTheme.colors.tertiaryContainer, borderRadius: 12, padding: 8, paddingVertical: 12, alignSelf: 'flex-start' }}>
          <Text style={{ color: paperTheme.colors.tertiary, fontWeight: '600' }}>{elapsed}</Text>
          <Text style={{ color: paperTheme.colors.tertiary }}>{'/'}</Text>
          <Text style={{ color: paperTheme.colors.tertiary }}>{totalTime}</Text>
        </View>
      </View>

    </View>
  );
};

export default YoutubePlayerScreen;