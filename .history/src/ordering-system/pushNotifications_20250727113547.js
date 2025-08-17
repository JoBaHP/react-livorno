function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUser(api) {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription === null) {
        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error(
            "VAPID public key not found. Did you set REACT_APP_VAPID_PUBLIC_KEY in your .env file?"
          );
          return;
        }
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // Send the subscription object to the backend to be saved
      await api.saveSubscription(subscription);
      alert("You will now receive order notifications!");
    } catch (err) {
      console.error("Failed to subscribe the user: ", err);
      alert(
        "Failed to enable notifications. Please check your browser settings."
      );
    }
  } else {
    alert("Push notifications are not supported by your browser.");
  }
}
