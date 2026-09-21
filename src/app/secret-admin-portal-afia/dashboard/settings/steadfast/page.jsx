"use client";

import React, { useEffect, useState } from "react";

import axios from "axios";

import { toast } from "react-hot-toast";

import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Server,
  KeyRound,
} from "lucide-react";

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const DEFAULT_BASE_URL = "https://portal.packzy.com/api/v1";

export default function SteadfastSettingsPage() {

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [testing, setTesting] = useState(false);

  const [configured, setConfigured] = useState(false);

  const [showApiKey, setShowApiKey] = useState(false);

  const [showSecretKey, setShowSecretKey] = useState(false);

  const [formData, setFormData] = useState({
    apiKey: "",
    secretKey: "",
    baseUrl: DEFAULT_BASE_URL,
  });

  // ======================================================
  // LOAD SETTINGS
  // ======================================================

  const fetchSettings = async () => {

    try {

      setLoading(true);

      const response = await axios.get(
        `${apiUrl}/api/courier/steadfast-settings`
      );

      if (response.data?.success) {

        const settings = response.data.settings || {};

        setConfigured(Boolean(response.data.configured));

        setFormData((prev) => ({

          ...prev,

          // IMPORTANT:
          // API key / Secret key should remain blank
          // because backend does not expose them.

          apiKey: "",

          secretKey: "",

          baseUrl: settings.baseUrl || DEFAULT_BASE_URL,

        }));

      }

    } catch (error) {

      console.error("Fetch SteadFast Settings Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load SteadFast settings."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchSettings();

  }, []);

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

  };

  // ======================================================
  // SAVE SETTINGS
  // ======================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.baseUrl.trim()) {

      toast.error("SteadFast API Base URL is required.");

      return;

    }

    let cleanBaseUrl = formData.baseUrl.trim();

    // ====================================================
    // VALIDATE BASE URL
    // ====================================================

    try {

      const parsedUrl = new URL(cleanBaseUrl);

      if (parsedUrl.protocol !== "https:") {

        toast.error(
          "SteadFast API Base URL must use HTTPS."
        );

        return;

      }

      cleanBaseUrl = parsedUrl.href.replace(
        /\/+$/,
        ""
      );

    } catch {

      toast.error("Please enter a valid Base URL.");

      return;

    }

    // ====================================================
    // FIRST TIME SETUP
    // ====================================================

    if (!configured && !formData.apiKey.trim()) {

      toast.error("API Key is required.");

      return;

    }

    if (!configured && !formData.secretKey.trim()) {

      toast.error("Secret Key is required.");

      return;

    }

    try {

      setSaving(true);

      const payload = {

        baseUrl: cleanBaseUrl,

        isActive: true,

      };

      // ==================================================
      // SEND API KEY ONLY IF ENTERED
      // ==================================================

      if (formData.apiKey.trim()) {

        payload.apiKey = formData.apiKey.trim();

      }

      // ==================================================
      // SEND SECRET KEY ONLY IF ENTERED
      // ==================================================

      if (formData.secretKey.trim()) {

        payload.secretKey = formData.secretKey.trim();

      }

      console.log("STEADFAST SETTINGS SAVE:", {

        baseUrl: payload.baseUrl,

        hasApiKey: Boolean(payload.apiKey),

        hasSecretKey: Boolean(payload.secretKey),

      });

      const response = await axios.post(
        `${apiUrl}/api/courier/steadfast-settings`,
        payload
      );

      if (!response.data?.success) {

        throw new Error(
          response.data?.message ||
            "Failed to save SteadFast settings."
        );

      }

      toast.success(
        "SteadFast settings saved successfully."
      );

      setConfigured(true);

      // ==================================================
      // CLEAR SENSITIVE INPUTS
      // ==================================================

      setFormData((prev) => ({

        ...prev,

        apiKey: "",

        secretKey: "",

        baseUrl: cleanBaseUrl,

      }));

      // Reload non-sensitive settings

      await fetchSettings();

    } catch (error) {

      console.error(
        "Save SteadFast Settings Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save SteadFast settings."
      );

    } finally {

      setSaving(false);

    }

  };

  // ======================================================
  // TEST CONNECTION
  // ======================================================

  const handleTestConnection = async () => {

    try {

      setTesting(true);

      const response = await axios.post(
        `${apiUrl}/api/courier/steadfast-test`
      );

      if (response.data?.success) {

        toast.success(
          "SteadFast connection successful!"
        );

      } else {

        toast.error(
          response.data?.message ||
            "SteadFast connection failed."
        );

      }

    } catch (error) {

      console.error("SteadFast Test Error:", error);

      toast.error(
        error.response?.data?.message ||
          "SteadFast connection failed."
      );

    } finally {

      setTesting(false);

    }

  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (

      <div className="flex min-h-[400px] items-center justify-center">

        <Loader2 className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400" />

      </div>

    );

  }

  // ======================================================
  // UI
  // ======================================================

  return (

    <div className="w-full">

      <div className="mb-6">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/10">

            <ShieldCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />

          </div>

          <div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">

              SteadFast Settings

            </h1>

            <p className="text-sm text-gray-500 dark:text-slate-400">

              Configure your SteadFast courier API
              credentials.

            </p>

          </div>

        </div>

      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

        <form onSubmit={handleSubmit}>

          <div className="space-y-6 p-5 md:p-6">

            {/* STATUS */}

            <div
              className={`flex items-center justify-between rounded-xl border p-4 ${
                configured
                  ? "border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10"
                  : "border-yellow-200 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-500/10"
              }`}
            >

              <div className="flex items-center gap-3">

                {configured ? (

                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />

                ) : (

                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />

                )}

                <div>

                  <p className="font-semibold text-gray-900 dark:text-white">

                    {configured
                      ? "SteadFast is configured"
                      : "SteadFast setup required"}

                  </p>

                  <p className="text-sm text-gray-600 dark:text-slate-400">

                    {configured
                      ? "Your SteadFast credentials are saved."
                      : "Enter your SteadFast API credentials below."}

                  </p>

                </div>

              </div>

              {configured && (

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {testing ? (

                    <>

                      <Loader2 className="h-4 w-4 animate-spin" />

                      Testing...

                    </>

                  ) : (

                    <>

                      <RefreshCw className="h-4 w-4" />

                      Test Connection

                    </>

                  )}

                </button>

              )}

            </div>

            {/* BASE URL */}

            <div>

              <div className="mb-2 flex items-center gap-2">

                <Server className="h-4 w-4 text-gray-500 dark:text-slate-400" />

                <label className="text-sm font-semibold text-gray-800 dark:text-slate-200">

                  SteadFast API Base URL

                </label>

              </div>

              <input
                type="url"
                name="baseUrl"
                value={formData.baseUrl}
                onChange={handleChange}
                placeholder={DEFAULT_BASE_URL}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">

                Example: {DEFAULT_BASE_URL}

              </p>

            </div>

            {/* API KEY */}

            <div>

              <div className="mb-2 flex items-center gap-2">

                <KeyRound className="h-4 w-4 text-gray-500 dark:text-slate-400" />

                <label className="text-sm font-semibold text-gray-800 dark:text-slate-200">

                  API Key

                </label>

              </div>

              <div className="relative">

                <input
                  type={
                    showApiKey ? "text" : "password"
                  }
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  placeholder={
                    configured
                      ? "Leave blank to keep existing API Key"
                      : "Enter SteadFast API Key"
                  }
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 pr-12 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowApiKey((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
                >

                  {showApiKey ? (

                    <EyeOff className="h-5 w-5" />

                  ) : (

                    <Eye className="h-5 w-5" />

                  )}

                </button>

              </div>

            </div>

            {/* SECRET KEY */}

            <div>

              <div className="mb-2 flex items-center gap-2">

                <KeyRound className="h-4 w-4 text-gray-500 dark:text-slate-400" />

                <label className="text-sm font-semibold text-gray-800 dark:text-slate-200">

                  Secret Key

                </label>

              </div>

              <div className="relative">

                <input
                  type={
                    showSecretKey
                      ? "text"
                      : "password"
                  }
                  name="secretKey"
                  value={formData.secretKey}
                  onChange={handleChange}
                  placeholder={
                    configured
                      ? "Leave blank to keep existing Secret Key"
                      : "Enter SteadFast Secret Key"
                  }
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 pr-12 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowSecretKey((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
                >

                  {showSecretKey ? (

                    <EyeOff className="h-5 w-5" />

                  ) : (

                    <Eye className="h-5 w-5" />

                  )}

                </button>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-slate-800 p-5 md:flex-row md:items-center md:justify-between md:p-6">

            <p className="text-xs text-gray-500 dark:text-slate-400">

              API Key and Secret Key are never shown
              after saving.

            </p>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (

                <>

                  <Loader2 className="h-5 w-5 animate-spin" />

                  Saving...

                </>

              ) : (

                <>

                  <Save className="h-5 w-5" />

                  Save SteadFast Settings

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}