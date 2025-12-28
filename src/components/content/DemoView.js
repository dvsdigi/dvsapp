import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../../theme';

const { width } = Dimensions.get('window');

const DemoView = () => {
    const { theme } = useTheme();

    // Using a sample video URL for demonstration
    const videoSource = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.play();
        // player.muted = true; // Optional: mute by default if preferred
    });

    return (
        <View style={styles.container}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Product Demo</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>See Digital Vidya Saarthi in action.</Text>

            <View style={[styles.videoContainer, { borderColor: theme.surfaceBorder }]}>
                <VideoView
                    style={styles.video}
                    player={player}
                    contentFit="contain"
                    nativeControls={true}
                />
            </View>

            <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>Complete Walkthrough</Text>
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    Learn how our ERP simplifies school management, from admission to fee collection and exam report generation.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flex: 1, // Ensure it fills the space
        justifyContent: 'center', // Center content vertically
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    videoContainer: {
        width: '100%',
        height: 220, // Slightly larger
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        backgroundColor: '#000',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    infoCard: {
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
});

export default DemoView;
