"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Server, Power, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { pingBackendAction } from "@/actions/backend-ping";
import { formatTime } from "@/lib/formatters";

type AppState = "idle" | "waking" | "ready";

export default function BackendPing() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    let pollingInterval: NodeJS.Timeout;

    if (appState === "waking") {
      timerInterval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      const checkStatus = async () => {
        const { isReady } = await pingBackendAction();
        if (isReady) {
          setAppState("ready");
        }
      };

      checkStatus();
      pollingInterval = setInterval(checkStatus, 5000);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(pollingInterval);
    };
  }, [appState]);

  const handleWakeUp = () => {
    setAppState("waking");
    setElapsedSeconds(0);
  };

  return (
    <div className="max-w-md w-full bg-white rounded-4xl shadow-xl p-8 text-center border border-gray-100">
      <div className="w-20 h-20 bg-blue-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Server className="w-10 h-10" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Kaucjapp</h1>
      <p className="text-gray-500 mb-8">Panel admina</p>

      {/* --- IDLE --- */}
      {appState === "idle" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            {
              "Kondziu muwi ze ma mało pieniędzy na Azure wiec backend moze akurat spać :("
            }
          </p>
          <button
            onClick={handleWakeUp}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <Power className="w-5 h-5" />
            Ping /api/auth/status
          </button>
        </div>
      )}

      {/* ---  WAKING --- */}
      {appState === "waking" && (
        <div className="space-y-6 py-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <div>
            <p className="text-gray-900 font-medium">Budzenie backendu...</p>
            <p className="text-gray-500 text-sm mt-1">GET /api/auth/status</p>
          </div>

          {/* The Timer */}
          <div className="text-3xl font-mono font-semibold text-blue-600 bg-blue-50 py-3 rounded-xl border border-blue-100">
            {formatTime(elapsedSeconds)}
          </div>
        </div>
      )}

      {/* --- READY --- */}
      {appState === "ready" && (
        <div className="space-y-6 py-4 animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <div>
            <p className="text-xl font-semibold text-gray-900">Backend stoi</p>
            <p className="text-gray-500 text-sm mt-1">
              Uzyskano odpowiedź w czasie {formatTime(elapsedSeconds)}.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            Przejdz do logowania
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
