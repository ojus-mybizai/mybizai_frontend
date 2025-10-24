"use client";
import { useEffect } from "react";

export default function FacebookSDKLoader() {
  useEffect(() => {
    // Load SDK if not already loaded
    if (!window.FB) {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID, // keep in .env.local
          cookie: true,
          xfbml: true,
          version: "v23.0",
        });
      };
      document.body.appendChild(script);
    }
  }, []);

  return null; // this component just injects FB SDK
}
