import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Trip, Participant } from '../../types';

interface TripDetailsModalProps {
    visible: boolean;
    trip: Trip | null;
    currentDeviceId: string | undefined;
    themeColor: string;
    onClose: () => void;
}

export const TripDetailsModal: React.FC<TripDetailsModalProps> = ({
    visible,
    trip,
    currentDeviceId,
    themeColor,
    onClose,
}) => {
    const copyTripId = async (tripId: string) => {
        await Clipboard.setStringAsync(tripId);
        Alert.alert('已複製', '計畫 ID 已複製到剪貼簿');
    };

    if (!trip) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.detailsModalContent}>
                    <Text style={styles.modalTitle}>計畫詳情</Text>

                    <ScrollView style={styles.detailsScroll}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>計畫 ID</Text>
                            <View style={styles.idCopyWrapper}>
                                <Text style={styles.detailValue}>{trip.id}</Text>
                                <TouchableOpacity onPress={() => copyTripId(trip.id)}>
                                    <Text style={[styles.copyText, { color: themeColor }]}>複製</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>計畫名稱</Text>
                            <Text style={styles.detailValue}>{trip.name}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>計畫密碼</Text>
                            <Text style={styles.detailValue}>{trip.password || '無'}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>目的地</Text>
                            <Text style={styles.detailValue}>{trip.destination}</Text>
                        </View>

                        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.detailLabel}>參與成員 ({trip.participants.length})</Text>
                            {trip.participants.map((p: Participant, idx: number) => (
                                <View key={idx} style={styles.memberItem}>
                                    <View style={[styles.memberColor, { backgroundColor: p.color }]} />
                                    <Text style={styles.memberName}>
                                        {p.nickname} {p.deviceId === currentDeviceId ? '(您)' : ''}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.detailsCloseBtn, { backgroundColor: themeColor }]}
                        onPress={onClose}
                    >
                        <Text style={styles.confirmButtonText}>確認</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsModalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    detailsScroll: {
        marginTop: 10,
        marginBottom: 20,
    },
    detailRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 6,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '400',
    },
    idCopyWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    copyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    memberColor: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    memberName: {
        fontSize: 15,
        color: '#333',
    },
    detailsCloseBtn: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});
