import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWeather, WeatherData } from '../services/weatherService';

export const WeatherWidget = ({ destination }: { destination: string }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);

    useEffect(() => {
        if (destination) {
            getWeather(destination).then(setWeather);
        }
    }, [destination]);

    if (!weather) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{weather.icon}</Text>
            <Text style={styles.temp}>{weather.temp}°C</Text>
            <Text style={styles.label}>{weather.condition}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    icon: { fontSize: 16, marginRight: 6 },
    temp: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    label: {
        color: '#fff',
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
        opacity: 0.9
    }
});
