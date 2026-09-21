'use client';

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Save,
  Mail,
  Phone,
  Clock,
  Loader2
} from 'lucide-react';

const ContactAdmin = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  const [infoForm, setInfoForm] = useState({
    phone: '',
    availability: '',
    email1: '',
    email2: '',
    writeUsSubtext: ''
  });

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const loadInitialData = async () => {
      setIsFetching(true);
      await Promise.all([fetchInfo(), fetchMessages()]);
      setIsFetching(false);
    };

    loadInitialData();
  }, []);

  const fetchInfo = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/contact/info`);

      if (!res.ok) {
        throw new Error('Failed to fetch contact info');
      }

      const data = await res.json();

      if (data.success && data.data) {
        setInfoForm({
          phone: data.data.phone || '',
          availability: data.data.availability || '',
          email1: data.data.email1 || '',
          email2: data.data.email2 || '',
          writeUsSubtext: data.data.writeUsSubtext || ''
        });
      }
    } catch (err) {
      console.error('Fetch Info Error:', err.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/contact/messages`);

      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await res.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Fetch Messages Error:', err.message);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        phone: infoForm.phone,
        availability: infoForm.availability,
        email1: infoForm.email1,
        email2: infoForm.email2,
        writeUsSubtext: infoForm.writeUsSubtext
      };

      const res = await fetch(`${BASE_URL}/api/contact/info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Contact Info updated successfully!');
      } else {
        alert(data.message || 'Failed to update info');
      }
    } catch (err) {
      alert('Failed to update info. Check console/server logs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/contact/messages/${id}`,
        {
          method: 'DELETE'
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages((prev) =>
          prev.filter((m) => m._id !== id)
        );
      } else {
        alert(data.message || 'Failed to delete message');
      }
    } catch (err) {
      alert('Failed to delete message');
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-5 p-3 sm:p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl">
            Contact Management
          </h1>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Manage customer messages and contact information
          </p>
        </div>

        {/* Tabs */}
        <div className="w-full overflow-x-auto lg:w-auto">
          <div className="flex min-w-max gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-800">

            <button
              onClick={() => setActiveTab('messages')}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                activeTab === 'messages'
                  ? 'bg-white text-orange-500 shadow dark:bg-slate-900'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Customer Messages ({messages.length})
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                activeTab === 'info'
                  ? 'bg-white text-orange-500 shadow dark:bg-slate-900'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Update Contact Info
            </button>

          </div>
        </div>
      </div>

      {/* Loading */}
      {isFetching ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <Loader2
            className="animate-spin text-orange-500"
            size={32}
          />
        </div>
      ) : activeTab === 'messages' ? (

        /* Messages */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base">
              Customer Messages
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Messages received from your website contact form
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm text-slate-600 dark:text-slate-300">

              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <tr>
                  <th className="whitespace-nowrap p-3 sm:p-4">
                    Date
                  </th>

                  <th className="whitespace-nowrap p-3 sm:p-4">
                    Name
                  </th>

                  <th className="whitespace-nowrap p-3 sm:p-4">
                    Contact
                  </th>

                  <th className="p-3 sm:p-4">
                    Message
                  </th>

                  <th className="whitespace-nowrap p-3 text-right sm:p-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">

                {messages.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-sm text-slate-400 dark:text-slate-500"
                    >
                      No messages received yet.
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >

                      <td className="whitespace-nowrap p-3 text-xs text-slate-400 dark:text-slate-500 sm:p-4">
                        {msg.createdAt
                          ? new Date(
                              msg.createdAt
                            ).toLocaleDateString()
                          : 'N/A'}
                      </td>

                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 sm:p-4">
                        {msg.name}
                      </td>

                      <td className="p-3 sm:p-4">
                        <div className="max-w-[180px] break-all">
                          {msg.email}
                        </div>

                        <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {msg.phone}
                        </div>
                      </td>

                      <td className="max-w-md break-words p-3 leading-6 sm:p-4">
                        {msg.message}
                      </td>

                      <td className="p-3 text-right sm:p-4">
                        <button
                          onClick={() =>
                            handleDeleteMessage(msg._id)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                          aria-label="Delete message"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* Contact Info */
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5 md:p-6">

          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
              Update Contact Information
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Update the contact details displayed on your website.
            </p>
          </div>

          <form
            onSubmit={handleInfoSubmit}
            className="space-y-4"
          >

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                Phone Number
              </label>

              <input
                type="text"
                value={infoForm.phone}
                onChange={(e) =>
                  setInfoForm({
                    ...infoForm,
                    phone: e.target.value
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                Availability Subtext
              </label>

              <input
                type="text"
                value={infoForm.availability}
                onChange={(e) =>
                  setInfoForm({
                    ...infoForm,
                    availability: e.target.value
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                Email Address 1
              </label>

              <input
                type="email"
                value={infoForm.email1}
                onChange={(e) =>
                  setInfoForm({
                    ...infoForm,
                    email1: e.target.value
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                Email Address 2
              </label>

              <input
                type="email"
                value={infoForm.email2}
                onChange={(e) =>
                  setInfoForm({
                    ...infoForm,
                    email2: e.target.value
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                Write To Us Subtext
              </label>

              <textarea
                rows="3"
                value={infoForm.writeUsSubtext}
                onChange={(e) =>
                  setInfoForm({
                    ...infoForm,
                    writeUsSubtext: e.target.value
                  })
                }
                className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              ></textarea>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? (
                  <Loader2
                    className="animate-spin"
                    size={18}
                  />
                ) : (
                  <Save size={18} />
                )}

                {loading
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

export default ContactAdmin;

