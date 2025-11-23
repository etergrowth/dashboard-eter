export async function getChatKitSessionToken(): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'chatkit_beta=v1',
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      workflow: { id: import.meta.env.VITE_OPENAI_WORKFLOW_ID },
      user: getOrCreateDeviceId(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create ChatKit session: ${response.statusText}`);
  }

  const { client_secret } = await response.json();
  return client_secret;
}

function getOrCreateDeviceId(): string {
  const DEVICE_ID_KEY = 'chatkit_device_id';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}
