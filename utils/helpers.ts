import { Linking } from 'react-native';

export const openWhatsApp = (phoneNumber: string, message: string = '') => {
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const fullPhoneNumber = cleanPhoneNumber.startsWith('90') ? cleanPhoneNumber : `90${cleanPhoneNumber}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=${fullPhoneNumber}&text=${encodedMessage}`;

    Linking.canOpenURL(whatsappUrl).then((supported) => {
        if (supported) {
            return Linking.openURL(whatsappUrl);
        } else {
            console.error('WhatsApp is not available on this device');
        }
    });
};

export const sendSMSToAll = (phoneNumbers: string[], message: string) => {
    if (phoneNumbers.length === 0) return;

    const smsUrl = `sms:${phoneNumbers.join(',')}&body=${encodeURIComponent(message)}`;

    Linking.canOpenURL(smsUrl).then((supported) => {
        if (supported) {
            return Linking.openURL(smsUrl);
        } else {
            console.error('SMS is not available on this device');
        }
    });
};

export const generateId = (): string => {
    return Date.now().toString();
}; 