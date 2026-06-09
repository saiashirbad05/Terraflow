"use client";

import React, { useEffect } from "react";

interface MockGoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string, email: string, image: string) => void;
}

export default function MockGoogleModal({ isOpen, onClose, onLogin }: MockGoogleModalProps) {
  
  const handleCredentialResponse = async (response: any) => {
    const credential = response.credential;
    try {
      // Proxy rewrite forwards to Express backend on port 3001
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });
      
      const data = await res.json();
      if (data.success && data.user) {
        onLogin(data.user.name, data.user.email, data.user.image || "");
      } else {
        alert("Google Authentication failed: " + (data.error || "Verification issue"));
      }
    } catch (err) {
      alert("Verification Server unreachable. Please try again later.");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    const scriptId = "google-identity-gsi";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initializeGSI = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: "609619705519-c025n9k2r8vhb8ta2tfv0gv3bvjs4u6e.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });

        const container = document.getElementById("google-signin-btn-container");
        if (container) {
          google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 320,
          });
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGSI;
      document.head.appendChild(script);
    } else {
      // Defer slightly to allow container mount
      const timer = setTimeout(initializeGSI, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden font-sans relative">
        {/* Google Branding Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-7" viewBox="0 0 272 92">
              <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.62-5.7-12.98-12.51-12.98S80.99 39.56 80.99 47.18c0 7.53 5.7 12.98 12.51 12.98s12.51-5.45 12.51-12.98z"/>
              <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.86 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.62-5.7-12.98-12.51-12.98s-12.51 5.36-12.51 12.98c0 7.53 5.7 12.98 12.51 12.98s12.51-5.45 12.51-12.98z"/>
              <path fill="#4285F4" d="M209.75 47.18c0 12.77-9.99 22.18-22.25 22.18-4.85 0-9.28-1.51-12.98-4.07l4.36-7.21c2.44 1.7 5.35 2.56 8.62 2.56 6.89 0 12.51-5.27 12.51-12.98V43.6h-.38c-2.52 3.1-6.97 5.77-12.89 5.77-12.08 0-21.76-9.5-21.76-22.18s9.72-22.18 21.76-22.18c5.92 0 10.37 2.68 12.89 5.69h.38v-4.43h9.12v41.83zm-9.74-21.68c0-7.62-5.7-12.98-12.51-12.98s-12.51 5.36-12.51 12.98c0 7.53 5.7 12.98 12.51 12.98s12.51-5.45 12.51-12.98z"/>
              <path fill="#34A853" d="M225 3v64h-9.5V3H225z"/>
              <path fill="#EA4335" d="M262.01 55.44l7.6 5.07c-2.48 3.69-8.49 9.87-19.12 9.87-12.81 0-22.26-9.92-22.26-22.18 0-12.94 9.54-22.18 21.15-22.18 11.72 0 17.51 9.47 19.39 14.18l1.04 2.61-29.35 12.15c2.25 4.43 5.77 6.67 10.74 6.67 4.96 0 8.35-2.46 10.81-6.39zm-23.97-9.02l19.6-8.12c-1.07-2.7-4.13-4.62-7.85-4.62-4.78 0-11.99 4.25-11.75 12.74z"/>
              <path fill="#4285F4" d="M43 45.4v-8.6h40.9c.4 2.2.6 4.7.6 7.6 0 11.7-4.7 21.6-12.9 29.1C64 80.5 54.8 84 43 84 19.2 84 0 65.2 0 42S19.2 0 43 0c11.6 0 21.3 4.3 28.7 11.2l-12.1 12.1C55.2 18.9 49.9 16.6 43 16.6c-14.5 0-26.3 12-26.3 26.7s11.8 26.7 26.3 26.7c16.8 0 23.1-11.8 24.1-18H43z"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-800">Sign in with Google</h2>
          <p className="text-sm text-gray-500 mt-1">to continue to TerraFlow</p>
        </div>

        {/* Central Official branded Sign-in Button */}
        <div className="px-8 pb-6 flex flex-col items-center justify-center min-h-[80px]">
          <div id="google-signin-btn-container" className="w-full flex justify-center" />

          {/* Footer Notice */}
          <div className="mt-8 text-[11px] text-gray-400 text-center leading-relaxed">
            To continue, Google will share your name, email address, language preference, and profile picture with TerraFlow.
            <div className="mt-2 flex justify-center gap-4 text-blue-600 font-medium">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Modal Close option */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
