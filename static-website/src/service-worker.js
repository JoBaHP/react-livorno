self.addEventListener("push", (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "../src/assets/livorno-logo.png",
    badge: "/favicon.ico",
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
