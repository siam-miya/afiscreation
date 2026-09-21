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
} from "lucide-react";

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

export default function PathaoSettingsPage() {

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [showClientSecret, setShowClientSecret] =
    useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    clientSecret: "",
    username: "",
    password: "",
    storeId: "",
    baseUrl: "",
  });

  // ======================================================
  // LOAD SETTINGS
  // ======================================================

  const fetchSettings = async () => {

    try {

      setLoading(true);

      const response = await axios.get(
        `${apiUrl}/api/courier/pathao-settings`
      );

      if (response.data?.success) {

        const settings = response.data.settings || {};

        setConfigured(Boolean(response.data.configured));

        setFormData({
          clientId: settings.clientId || "",
          clientSecret: "",
          username: settings.username || "",
          password: "",
          storeId: settings.storeId
            ? String(settings.storeId)
            : "",
          baseUrl: settings.baseUrl || "",
        });

      }

    } catch (error) {

      console.error(
        "Fetch Pathao Settings Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load Pathao settings."
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

    if (!formData.clientId.trim()) {
      toast.error("Client ID is required.");
      return;
    }

    if (!formData.username.trim()) {
      toast.error("Username is required.");
      return;
    }

    if (!formData.storeId.trim()) {
      toast.error("Store ID is required.");
      return;
    }

    if (!/^\d+$/.test(formData.storeId.trim())) {
      toast.error("Store ID must be a valid number.");
      return;
    }

    if (!formData.baseUrl.trim()) {
      toast.error("Pathao API Base URL is required.");
      return;
    }

    let cleanBaseUrl = formData.baseUrl.trim();

    try {

      const parsedUrl = new URL(cleanBaseUrl);

      if (parsedUrl.protocol !== "https:") {
        toast.error(
          "Pathao API Base URL must use HTTPS."
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

    if (
      !configured &&
      !formData.clientSecret.trim()
    ) {
      toast.error("Client Secret is required.");
      return;
    }

    if (!configured && !formData.password.trim()) {
      toast.error("Password is required.");
      return;
    }

    try {

      setSaving(true);

      const payload = {
        clientId: formData.clientId.trim(),
        username: formData.username.trim(),
        storeId: Number(formData.storeId),
        baseUrl: cleanBaseUrl,
        isActive: true,
      };

      // Only send secrets when user entered them.

      if (formData.clientSecret.trim()) {
        payload.clientSecret =
          formData.clientSecret.trim();
      }

      if (formData.password.trim()) {
        payload.password =
          formData.password.trim();
      }

      const response = await axios.post(
        `${apiUrl}/api/courier/pathao-settings`,
        payload
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to save settings."
        );
      }

      toast.success(
        "Pathao settings saved successfully."
      );

      setConfigured(true);

      // Clear sensitive fields after save

      setFormData((prev) => ({
        ...prev,
        clientSecret: "",
        password: "",
      }));

      await fetchSettings();

    } catch (error) {

      console.error(
        "Save Pathao Settings Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save Pathao settings."
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
        `${apiUrl}/api/courier/pathao-test`
      );

      if (response.data?.success) {

        toast.success(
          "Pathao connection successful!"
        );

      } else {

        toast.error(
          response.data?.message ||
            "Pathao connection failed."
        );

      }

    } catch (error) {

      console.error(
        "Pathao Test Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Pathao connection failed."
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

      <div className="flex min-h-[400px] items-center justify-center bg-transparent">

        <Loader2 className="h-8 w-8 animate-spin text-green-600" />

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

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/10">

            <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />

          </div>

          <div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pathao Settings
            </h1>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Configure your Pathao courier API
              credentials and store.
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
                      ? "Pathao is configured"
                      : "Pathao setup required"}

                  </p>

                  <p className="text-sm text-gray-600 dark:text-slate-400">

                    {configured
                      ? "Your Pathao credentials are saved."
                      : "Enter your Pathao API credentials below."}

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
                  Pathao API Base URL
                </label>

              </div>

              <input
                type="url"
                name="baseUrl"
                value={formData.baseUrl}
                onChange={handleChange}
                placeholder="https://courier-api-sandbox.pathao.com"
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/10"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                Example: https://courier-api-sandbox.pathao.com
              </p>

            </div>

            {/* CLIENT ID */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-200">
                Client ID
              </label>

              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                placeholder="Enter Pathao Client ID"
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/10"
              />

            </div>

            {/* CLIENT SECRET */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-200">
                Client Secret
              </label>

              <div className="relative">

                <input
                  type={
                    showClientSecret
                      ? "text"
                      : "password"
                  }
                  name="clientSecret"
                  value={formData.clientSecret}
                  onChange={handleChange}
                  placeholder={
                    configured
                      ? "Leave blank to keep existing secret"
                      : "Enter Pathao Client Secret"
                  }
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 pr-12 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowClientSecret(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
                >

                  {showClientSecret ? (

                    <EyeOff className="h-5 w-5" />

                  ) : (

                    <Eye className="h-5 w-5" />

                  )}

                </button>

              </div>

            </div>

            {/* USERNAME */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-200">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Pathao merchant username"
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/10"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-200">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    configured
                      ? "Leave blank to keep existing password"
                      : "Pathao merchant password"
                  }
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 pr-12 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
                >

                  {showPassword ? (

                    <EyeOff className="h-5 w-5" />

                  ) : (

                    <Eye className="h-5 w-5" />

                  )}

                </button>

              </div>

            </div>

            {/* STORE ID */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-200">
                Store ID
              </label>

              <input
                type="number"
                name="storeId"
                value={formData.storeId}
                onChange={handleChange}
                placeholder="Example: 458517"
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500/10"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                Use the Store ID from your Pathao Merchant
                Panel.
              </p>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-slate-800 p-5 md:flex-row md:items-center md:justify-between md:p-6">

            <p className="text-xs text-gray-500 dark:text-slate-400">
              Client Secret and Password are never shown
              after saving.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (

                <>

                  <Loader2 className="h-5 w-5 animate-spin" />

                  Saving...

                </>

              ) : (

                <>

                  <Save className="h-5 w-5" />

                  Save Pathao Settings

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}