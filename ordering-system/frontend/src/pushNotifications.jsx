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
  console.log("Attempting to subscribe for push notifications...");

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("Push notifications are not supported by this browser.");
    alert("Push notifications are not supported by your browser.");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    console.log("Service Worker is ready.");

    let subscription = await registration.pushManager.getSubscription();
    console.log("Existing subscription:", subscription);

    if (subscription === null) {
      console.log("No existing subscription found, creating a new one.");
      const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.error(
          "VAPID public key not found. Ensure REACT_APP_VAPID_PUBLIC_KEY is set in your frontend .env file."
        );
        alert("Configuration error: VAPID public key is missing.");
        return false;
      }
      console.log("Using VAPID public key.");
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
      console.log("New subscription created:", subscription);
    }

    console.log("Sending subscription to backend...");
    await api.saveSubscription(subscription);
    console.log("Subscription successfully sent to backend.");
    alert("You will now receive order notifications!");
    return true;
  } catch (err) {
    console.error("Failed to subscribe the user:", err);
    alert(
      "Failed to enable notifications. Please check browser permissions and console for errors."
    );
    return false;
  }
}
