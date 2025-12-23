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
import * as Clipboard from 'expo-clipboard';
import { Trip } from '../../types';
import { Alert } from '../../utils/alert';

interface CreateTripModalProps {
    visible: boolean;
    themeColor: string;
    onClose: () => void;
    onCreateTrip: (name: string, destination: string, password: string, tripId: string) => Promise<Trip>;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
    visible,
    themeColor,
    onClose,
    onCreateTrip,
}) => {
    const [newTripId, setNewTripId] = useState('');
    const [newTripName, setNewTripName] = useState('');
    const [newTripDestination, setNewTripDestination] = useState('東京');
    const [newTripPassword, setNewTripPassword] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!newTripId.trim()) {
            Alert.alert('提示', '請設定計畫 ID');
            return;
        }

        if (newTripId.trim().length < 4) {
            Alert.alert('提示', '計畫 ID 長度至少需要 4 個字元');
            return;
        }

        const idRegex = /^[a-zA-Z0-9_]+$/;
        if (!idRegex.test(newTripId.trim())) {
            Alert.alert('提示', '計畫 ID 只能包含字母、數字或底線');
            return;
        }

        if (!newTripName.trim()) {
            Alert.alert('提示', '請輸入計畫名稱');
            return;
        }

        if (!newTripPassword.trim()) {
            Alert.alert('提示', '請設定計畫密碼');
            return;
        }

        try {
            setCreating(true);
            const trip = await onCreateTrip(
                newTripName.trim(),
                newTripDestination.trim(),
                newTripPassword.trim(),
                newTripId.trim().toLowerCase()
            );

            setNewTripId('');
            setNewTripName('');
            setNewTripDestination('東京');
            setNewTripPassword('');
            onClose();

            Alert.alert(
                '計畫已創建！',
                `計畫 ID: ${trip.id}\n\n請將此 ID 和密碼分享給家人朋友，他們就能加入計畫。`,
                [
                    {
                        text: '複製 ID',
                        onPress: async () => {
                            await Clipboard.setStringAsync(trip.id);
                            Alert.alert('已複製', '計畫 ID 已複製到剪貼簿');
                        },
                    },
                    { text: '確定' },
                ]
            );
        } catch (error: any) {
            Alert.alert('錯誤', error.message || '創建計畫失敗');
        } finally {
            setCreating(false);
        }
    };

    const handleClose = () => {
        setNewTripId('');
        setNewTripName('');
        setNewTripDestination('東京');
        setNewTripPassword('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>創建新計畫</Text>

                    <Text style={styles.inputLabel}>計畫 ID (其他人加入用)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="例如: tokyo2024 (至少4位)"
                        placeholderTextColor="#999"
                        value={newTripId}
                        onChangeText={setNewTripId}
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={20}
                    />

                    <Text style={styles.inputLabel}>計畫名稱</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="例如: 東京跨年之旅"
                        placeholderTextColor="#999"
                        value={newTripName}
                        onChangeText={setNewTripName}
                        maxLength={30}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="目的地"
                        placeholderTextColor="#999"
                        value={newTripDestination}
                        onChangeText={setNewTripDestination}
                        maxLength={20}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="設定計畫密碼（分享給家人朋友）"
                        placeholderTextColor="#999"
                        value={newTripPassword}
                        onChangeText={setNewTripPassword}
                        secureTextEntry
                        maxLength={20}
                    />

                    <Text style={styles.hint}>
                        💡 密碼建議：簡單好記，例如 japan2024
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
                            onPress={handleCreate}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>創建</Text>
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
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 8,
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
