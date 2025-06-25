// import { subscribeUserToPush } from '../utils/pushNotifications';

// async function savePushSubscription(subscription: PushSubscription) {
//     await fetch('/api/save-subscription', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(subscription),
//     });
// }

// export default function PushSetupButton() {
//     const setupPush = async () => {
//         const subscription = await subscribeUserToPush();
//         if (subscription) {
//             await savePushSubscription(subscription);
//             alert('Push 通知を登録しました');
//         } else {
//             alert('通知の許可が得られませんでした');
//         }
//     };

//     return <button onClick={setupPush}>通知を有効にする</button>;
// }


export default function TestPushPage() {
  return <div>Test Push Page</div>;
}
