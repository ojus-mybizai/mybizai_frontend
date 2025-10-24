"use client";
import { useState } from "react";
import { useAuthStore } from "@/lib/stores";

export default function ConnectMetaButton({ channel }) {
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuthStore();

  const getScope = () => {
    switch (channel) {
      case "instagram":
        return "pages_show_list,pages_manage_metadata,instagram_basic,instagram_manage_messages,pages_messaging";
      case "messenger":
        return "pages_show_list,pages_manage_metadata,pages_messaging";
      default: // whatsapp
        return "whatsapp_business_management,whatsapp_business_messaging,business_management";
    }
  };

  const getBackendURL = () => {
    return `http://localhost:8000/api/v1/auth/facebook/exchange?channel=${channel}`;
  };

  const handleLogin = () => {
    if (!window.FB) {
      alert("Facebook SDK not loaded yet!");
      return;
    }

    setLoading(true);

    window.FB.login(
      function (response) {
        if (response.authResponse) {
          console.log(`FB login success for ${channel}:`, response.authResponse);

          fetch(getBackendURL(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              accessToken: response.authResponse.accessToken,
              state: {"channel" : channel},
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Backend exchange result:", data);
              alert(`${channel.charAt(0).toUpperCase() + channel.slice(1)} connected successfully!`);
            })
            .catch((err) => {
              console.error(`Error connecting ${channel}:`, err);
              alert(`Something went wrong while connecting ${channel}.`);
            })
            .finally(() => setLoading(false));
        } else {
          alert("Login failed or cancelled");
          setLoading(false);
        }
      },
      { scope: getScope() }
    );
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? `Connecting ${channel}...` : `Connect ${channel.charAt(0).toUpperCase() + channel.slice(1)}`}
    </button>
  );
}