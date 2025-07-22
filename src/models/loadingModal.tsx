"use client";

import React from "react";
interface LoadingModalProps {
  message?: string; // Make the message prop optional (or required if it always needs one)
}
export default function LoadingModal({ message = "" }: LoadingModalProps) {
 
  return (
    <div
      // Outer overlay: fixed, full screen, centered, semi-transparent background with subtle blur
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999, // Ensure it's on top of everything
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.03)", // Darker, semi-transparent overlay
        backdropFilter: "blur(4px)", // Subtle blur for the whole background
        // Basic fade-in animation for the overlay itself when mounted
        animation: "fadeInOverlay 0.25s ease-out forwards",
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-description"
    >
      {/* Inner modal content box: styled, slightly transparent white with stronger blur */}
      <div
        style={{
          padding: "2.5rem", // Generous padding
          background: "rgba(255, 255, 255, 0.85)", // Slightly less transparent white for better contrast
          backdropFilter: "blur(12px)", // Stronger "frosted glass" effect for the modal content
          borderRadius: "1rem", // Rounded corners
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)", // Enhanced, softer shadow for depth
          maxWidth: "20rem", // Max width to keep it centered and readable
          textAlign: "center",
          display: "flex", // Use flexbox for centering content within the modal
          flexDirection: "column",
          alignItems: "center",
          // Basic fade-in and subtle scale-in animation for the modal box when mounted
          animation: "fadeInScaleIn 0.3s ease-out forwards",
          animationDelay: "0.05s", // Slight delay after overlay appears for layered effect
        }}
      >
        {/* Dual Spinning Loader */}
        <div
          style={{
            position: "relative",
            width: "5rem", // Consistent size
            height: "5rem",
            margin: "0 auto", // Center the spinner
          }}
        >
          {/* Outer spinner */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              border: "4px solid #6366f1", // Tailwind indigo-500
              borderTopColor: "transparent", // Makes it look like a segment
              borderRadius: "50%",
              animation: "spin 1.2s linear infinite", // Consistent rotation speed
              willChange: "transform", // Hint to the browser for GPU acceleration
            }}
            aria-hidden="true" // Decorative element, hide from screen readers
          />

          {/* Inner spinner */}
          <div
            style={{
              position: "absolute",
              top: "1rem", // Positioned inside the outer spinner
              left: "1rem",
              width: "3rem",
              height: "3rem",
              border: "4px solid #a855f7", // Tailwind purple-500
              borderBottomColor: "transparent", // Makes it look like a segment
              borderRadius: "50%",
              animation: "spin-reverse 1.6s linear infinite", // Counter-rotation
              willChange: "transform", // Hint to the browser for GPU acceleration
            }}
            aria-hidden="true" // Decorative element, hide from screen readers
          />
        </div>

        {/* Loading Message */}
        <h2
          id="loading-modal-title"
          style={{
            marginTop: "1.5rem",
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "#1f2937", // Tailwind gray-800
          }}
        >
        </h2>
        <p
          id="loading-modal-description"
          style={{
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: "#4b5563", // Tailwind gray-600
          }}
        >
          Please wait a moment.{message}
        </p>
      </div>

      {/* Define CSS Keyframes for animations */}
      <style>{`
        /* Fade in animation for the entire modal overlay */
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Fade in and scale in animation for the modal content box */
        @keyframes fadeInScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Spinner rotation animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Reverse spinner rotation animation */
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}