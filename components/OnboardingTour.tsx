"use client";

import { useEffect } from "react";
import "driver.js/dist/driver.css";

const SEEN_KEY = "pay3_airdrop_tour_seen_v1";

/**
 * Runs once per browser, the first time someone lands on the connected
 * Dashboard view. Targets elements by id, so it only ever fires from a
 * page where those ids actually exist (see app/page.tsx and TopNav.tsx).
 */
export function OnboardingTour() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(SEEN_KEY)) return;

    let cancelled = false;

    // Give the DOM a beat to paint before measuring element positions.
    const timer = setTimeout(async () => {
      if (cancelled) return;
      const { driver } = await import("driver.js");
      if (cancelled) return;

      window.localStorage.setItem(SEEN_KEY, "1");

      const steps = [
        {
          element: "#tour-stats",
          popover: {
            title: "Your activity",
            description:
              "Your balance, transaction count, and airdrop points, pulled live from the chain.",
          },
        },
        {
          element: "#tour-earn-spin",
          popover: {
            title: "Earn a spin",
            description:
              "Send 1 P3 to the reward address shown here. Once it's confirmed on-chain, it credits exactly 1 spin -- send several and every one of them counts.",
          },
        },
        {
          element: "#tour-spin-link",
          popover: {
            title: "Spin now",
            description:
              "Head to the wheel once you've got a spin credit. You can spin one at a time or run a whole batch at once.",
          },
        },
        {
          element: "#tour-nav-rewards",
          popover: {
            title: "Rewards",
            description:
              "Your provisional USDT/USDC balance lives here, along with the exact odds table and where to set your withdrawal address.",
          },
        },
      ].filter((step) => document.querySelector(step.element));

      if (steps.length === 0) return;

      driver({
        showProgress: true,
        allowClose: true,
        steps,
      }).drive();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return null;
}
