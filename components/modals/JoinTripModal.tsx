import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Trip } from '../../types';
import { Alert } from '../../utils/alert';

interface JoinTripModalProps {
    visible: boolean;
    themeColor: string;
    onClose: () => void;
    onJoinTrip: (tripId: string, password: string) => Promise<Trip>;
}

export const JoinTripModal: React.FC<JoinTripModalProps> = ({
    visible,
    themeColor,
    onClose,
    onJoinTrip,
}) => {
    const [joinTripId, setJoinTripId] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [joining, setJoining] = useState(false);

    const handleJoin = async () => {
        if (!joinTripId.trim()) {
            Alert.alert('提示', '請輸入計畫 ID');
            return;
        }

        if (!joinPassword.trim()) {
            Alert.alert('提示', '請輸入計畫密碼');
            return;
        }

        try {
            setJoining(true);
            await onJoinTrip(joinTripId.trim(), joinPassword.trim());

            setJoinTripId('');
            setJoinPassword('');
            onClose();

            Alert.alert('成功', '已加入計畫！');
        } catch (error: any) {
            Alert.alert('錯誤', error.message || '加入計畫失敗');
        } finally {
            setJoining(false);
        }
    };

    const handleClose = () => {
        setJoinTripId('');
        setJoinPassword('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>加入計畫</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="輸入計畫 ID"
                        placeholderTextColor="#999"
                        value={joinTripId}
                        onChangeText={setJoinTripId}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="輸入計畫密碼"
                        placeholderTextColor="#999"
                        value={joinPassword}
                        onChangeText={setJoinPassword}
                        secureTextEntry
                    />

                    <Text style={styles.hint}>
                        💡 向創建者索取計畫 ID 和密碼
                    </Text>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>取消</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: themeColor }]}
                            onPress={handleJoin}
                            disabled={joining}
                        >
                            {joining ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>加入</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        color: '#333',
    },
    hint: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});
