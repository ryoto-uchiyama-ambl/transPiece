// // utils/pushNotifications.ts
// export async function registerPush(userId: string) {
//     if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

//     const registration = await navigator.serviceWorker.register('/sw.js');

//     const permission = await Notification.requestPermission();
//     if (permission !== 'granted') return;

//     const subscription = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
//     });

//     const body = {
//         endpoint: subscription.endpoint,
//         publicKey: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
//         authToken: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : '',
//     };

//     await fetch('/api/push-subscribe', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify(body),
//     });
// }

// function urlBase64ToUint8Array(base64String: string) {
//     const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
//     const base64 = (base64String + padding)
//         .replace(/\-/g, '+')
//         .replace(/_/g, '/');

//     const rawData = atob(base64);
//     const outputArray = new Uint8Array(rawData.length);
//     for (let i = 0; i < rawData.length; ++i) {
//         outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
// }
