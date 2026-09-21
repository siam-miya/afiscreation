'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  XCircle,
} from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const emptyForm = {
  name: '',
  slug: '',
  note: '',
  rate: '',
  freeAbove: '',
  minDays: '1',
  maxDays: '2',
  position: '0',
  isActive: true,
  isDefault: false,
};

const ShippingZonesPage = () => {
  const [zones, setZones] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [showModal, setShowModal] = useState(false);

  const [editingZone, setEditingZone] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(null);

  const [statusLoading, setStatusLoading] = useState(null);

  const [defaultLoading, setDefaultLoading] = useState(null);

  const [deleteZone, setDeleteZone] = useState(null);

  // -----------------------------------------
  // Fetch Shipping Zones
  // -----------------------------------------

  const fetchShippingZones = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/v1/shipping-zones`,
        {
          params: {
            search,
            page,
            limit,
          },
        }
      );

      if (response.data.success) {
        setZones(response.data.data || []);
        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit,
            totalPages: 1,
          }
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Failed to load shipping zones'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShippingZones();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, page, limit]);

  // -----------------------------------------
  // Generate Slug
  // -----------------------------------------

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // -----------------------------------------
  // Form Change
  // -----------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'name' && !editingZone) {
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));
    }
  };

  // -----------------------------------------
  // Open Create Modal
  // -----------------------------------------

  const openCreateModal = () => {
    setEditingZone(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // -----------------------------------------
  // Open Edit Modal
  // -----------------------------------------

  const openEditModal = (zone) => {
    setEditingZone(zone);

    setForm({
      name: zone.name || '',
      slug: zone.slug || '',
      note: zone.note || '',
      rate: zone.rate ?? '',
      freeAbove: zone.freeAbove ?? '',
      minDays: zone.minDays ?? '1',
      maxDays: zone.maxDays ?? '2',
      position: zone.position ?? '0',
      isActive: zone.isActive ?? true,
      isDefault: zone.isDefault ?? false,
    });

    setShowModal(true);
  };

  // -----------------------------------------
  // Close Modal
  // -----------------------------------------

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingZone(null);
    setForm(emptyForm);
  };

  // -----------------------------------------
  // Submit
  // -----------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Zone name is required');
      return;
    }

    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    if (Number(form.minDays) > Number(form.maxDays)) {
      toast.error(
        'Minimum delivery days cannot be greater than maximum days'
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        note: form.note.trim(),
        rate: Number(form.rate) || 0,
        freeAbove: Number(form.freeAbove) || 0,
        minDays: Number(form.minDays) || 0,
        maxDays: Number(form.maxDays) || 0,
        position: Number(form.position) || 0,
        isActive: form.isActive,
        isDefault: form.isDefault,
      };

      if (editingZone) {
        await axios.put(
          `${API_URL}/api/v1/shipping-zones/${editingZone._id}`,
          payload
        );

        toast.success('Shipping zone updated successfully');
      } else {
        await axios.post(
          `${API_URL}/api/v1/shipping-zones`,
          payload
        );

        toast.success('Shipping zone created successfully');
      }

      closeModal();

      fetchShippingZones();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Something went wrong'
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Delete
  // -----------------------------------------

  const handleDelete = async () => {
    if (!deleteZone) return;

    try {
      setDeleteLoading(deleteZone._id);

      await axios.delete(
        `${API_URL}/api/v1/shipping-zones/${deleteZone._id}`
      );

      toast.success('Shipping zone deleted successfully');

      setDeleteZone(null);

      fetchShippingZones();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Failed to delete shipping zone'
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  // -----------------------------------------
  // Toggle Status
  // -----------------------------------------

  const handleToggleStatus = async (zone) => {
    try {
      setStatusLoading(zone._id);

      await axios.patch(
        `${API_URL}/api/v1/shipping-zones/${zone._id}/toggle-status`
      );

      toast.success(
        zone.isActive
          ? 'Shipping zone deactivated'
          : 'Shipping zone activated'
      );

      fetchShippingZones();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to update status'
      );
    } finally {
      setStatusLoading(null);
    }
  };

  // -----------------------------------------
  // Set Default
  // -----------------------------------------

  const handleSetDefault = async (zone) => {
    if (zone.isDefault) return;

    try {
      setDefaultLoading(zone._id);

      await axios.patch(
        `${API_URL}/api/v1/shipping-zones/${zone._id}/set-default`
      );

      toast.success('Default shipping zone updated');

      fetchShippingZones();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to set default zone'
      );
    } finally {
      setDefaultLoading(null);
    }
  };

  // -----------------------------------------
  // Format Currency
  // -----------------------------------------

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('en-BD');
  };

  // -----------------------------------------
  // Pagination
  // -----------------------------------------

  const paginationText = useMemo(() => {
    if (pagination.total === 0) {
      return 'Showing 0 results';
    }

    const start = (page - 1) * limit + 1;

    const end = Math.min(
      page * limit,
      pagination.total
    );

    return `Showing ${start} to ${end} of ${pagination.total} results`;
  }, [pagination.total, page, limit]);

  return (
    <div className="min-h-full bg-gray-50 p-5 text-gray-900 transition-colors duration-200 dark:bg-[#0c0b0b] dark:text-white md:p-6">

      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <span>Shipping Zones</span>

            <span>›</span>

            <span className="text-gray-400 dark:text-gray-400">
              List
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Shipping Zones
          </h1>

        </div>

        <button
          onClick={openCreateModal}
          className="flex w-fit items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-600"
        >
          <Plus size={16} />

          New shipping zone
        </button>

      </div>


      {/* -------------------------------- */}
      {/* Table Card */}
      {/* -------------------------------- */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-200 dark:border-[#272321] dark:bg-[#191817]">

        {/* Search */}

        <div className="flex items-center justify-end border-b border-gray-200 px-4 py-3 dark:border-[#292725]">

          <div className="relative w-full md:w-48">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 dark:border-[#45413e] dark:bg-[#242220] dark:text-white dark:placeholder:text-gray-500"
            />

          </div>

        </div>


        {/* -------------------------------- */}
        {/* Table */}
        {/* -------------------------------- */}

        <div className="w-full overflow-x-auto">

          <table className="min-w-[1150px] w-full text-left">

            <thead>

              <tr className="border-b border-gray-200 bg-gray-100 dark:border-[#302e2c] dark:bg-[#242220]">

                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-orange-500"
                  />
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Name
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Slug
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Note
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Rate
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Free above
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Min days
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Max days
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Position
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Is active
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Is default
                </th>

                <th className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="12"
                    className="px-4 py-16 text-center"
                  >

                    <Loader2
                      size={25}
                      className="mx-auto animate-spin text-orange-500"
                    />

                    <p className="mt-3 text-xs text-gray-500">
                      Loading shipping zones...
                    </p>

                  </td>

                </tr>

              ) : zones.length === 0 ? (

                <tr>

                  <td
                    colSpan="12"
                    className="px-4 py-16 text-center"
                  >

                    <MapPin
                      size={30}
                      className="mx-auto text-gray-400 dark:text-gray-600"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      No shipping zones found
                    </p>

                    <button
                      onClick={openCreateModal}
                      className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                    >
                      Create shipping zone
                    </button>

                  </td>

                </tr>

              ) : (

                zones.map((zone) => (

                  <tr
                    key={zone._id}
                    className="border-b border-gray-200 transition hover:bg-gray-50 dark:border-[#292725] dark:hover:bg-[#211f1d]"
                  >

                    <td className="px-4 py-4">

                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-orange-500"
                      />

                    </td>


                    <td className="px-3 py-4">

                      <div className="flex items-center gap-2">

                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {zone.name}
                        </span>

                        {zone.isDefault && (
                          <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-orange-600 dark:text-orange-400">
                            Default
                          </span>
                        )}

                      </div>

                    </td>


                    <td className="px-3 py-4 text-xs text-gray-600 dark:text-gray-300">
                      {zone.slug}
                    </td>


                    <td className="max-w-[230px] px-3 py-4 text-xs text-gray-600 dark:text-gray-300">

                      <div className="truncate">
                        {zone.note || '-'}
                      </div>

                    </td>


                    <td className="px-3 py-4 text-xs text-gray-900 dark:text-gray-100">
                      {formatCurrency(zone.rate)}
                    </td>


                    <td className="px-3 py-4 text-xs text-gray-900 dark:text-gray-100">
                      {formatCurrency(zone.freeAbove)}
                    </td>


                    <td className="px-3 py-4 text-xs text-gray-900 dark:text-gray-100">
                      {zone.minDays}
                    </td>


                    <td className="px-3 py-4 text-xs text-gray-900 dark:text-gray-100">
                      {zone.maxDays}
                    </td>


                    <td className="px-3 py-4 text-xs text-gray-900 dark:text-gray-100">
                      {zone.position}
                    </td>


                    <td className="px-3 py-4">

                      <button
                        onClick={() => handleToggleStatus(zone)}
                        disabled={statusLoading === zone._id}
                        className="transition"
                      >

                        {statusLoading === zone._id ? (

                          <Loader2
                            size={17}
                            className="animate-spin text-orange-500"
                          />

                        ) : zone.isActive ? (

                          <Check
                            size={17}
                            className="rounded-full border border-green-500 p-0.5 text-green-500"
                          />

                        ) : (

                          <X
                            size={17}
                            className="rounded-full border border-red-500 p-0.5 text-red-500"
                          />

                        )}

                      </button>

                    </td>


                    <td className="px-3 py-4">

                      <button
                        onClick={() => handleSetDefault(zone)}
                        disabled={
                          zone.isDefault ||
                          defaultLoading === zone._id
                        }
                        className="transition"
                      >

                        {defaultLoading === zone._id ? (

                          <Loader2
                            size={17}
                            className="animate-spin text-orange-500"
                          />

                        ) : zone.isDefault ? (

                          <Check
                            size={17}
                            className="rounded-full border border-green-500 p-0.5 text-green-500"
                          />

                        ) : (

                          <X
                            size={17}
                            className="rounded-full border border-red-500 p-0.5 text-red-500"
                          />

                        )}

                      </button>

                    </td>


                    <td className="px-3 py-4">

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() => openEditModal(zone)}
                          className="text-xs font-medium text-orange-500 transition hover:text-orange-400 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setDeleteZone(zone)}
                          className="text-red-500 transition hover:text-red-400 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* -------------------------------- */}
        {/* Footer */}
        {/* -------------------------------- */}

        <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">

          <p className="text-xs text-gray-600 dark:text-gray-300">
            {paginationText}
          </p>


          <div className="flex items-center gap-2">

            <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-[#45413e]">

              <span className="px-3 py-2 text-xs text-gray-500">
                Per page
              </span>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border-l border-gray-300 bg-white px-2 py-2 text-xs text-gray-700 outline-none dark:border-[#45413e] dark:bg-[#242220] dark:text-gray-300"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>

            </div>


            <button
              onClick={() =>
                setPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#45413e] dark:bg-[#242220] dark:text-gray-400 dark:hover:text-white"
            >
              <ChevronLeft size={15} />
            </button>


            <span className="text-xs text-gray-500 dark:text-gray-400">
              {page} / {pagination.totalPages || 1}
            </span>


            <button
              onClick={() =>
                setPage((prev) =>
                  Math.min(
                    prev + 1,
                    pagination.totalPages || 1
                  )
                )
              }
              disabled={page >= pagination.totalPages}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#45413e] dark:bg-[#242220] dark:text-gray-400 dark:hover:text-white"
            >
              <ChevronRight size={15} />
            </button>

          </div>

        </div>

      </div>


      {/* ================================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ================================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/70">

          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-[#302e2c] dark:bg-[#191817]">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-[#302e2c]">

              <div>

                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {editingZone
                    ? 'Edit Shipping Zone'
                    : 'Create Shipping Zone'}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure delivery rate and zone settings.
                </p>

              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#292725] dark:hover:text-white"
              >
                <X size={18} />
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] overflow-y-auto p-5"
            >

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


                {/* Name */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Zone Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Inside Dhaka"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 dark:border-[#403d3a] dark:bg-[#242220] dark:text-white dark:placeholder:text-gray-600"
                  />

                </div>


                {/* Slug */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Slug *
                  </label>

                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="inside-dhaka"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 dark:border-[#403d3a] dark:bg-[#242220] dark:text-white dark:placeholder:text-gray-600"
                  />

                </div>


                {/* Rate */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Delivery Rate
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="rate"
                    value={form.rate}
                    onChange={handleChange}
                    placeholder="7000"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 dark:border-[#403d3a] dark:bg-[#242220] dark:text-white dark:placeholder:text-gray-600"
                  />

                </div>


                {/* Free Above */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Free Shipping Above
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="freeAbove"
                    value={form.freeAbove}
                    onChange={handleChange}
                    placeholder="5000000"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 dark:border-[#403d3a] dark:bg-[#242220] dark:text-white dark:placeholder:text-gray-600"
                  />

                </div>


                {/* Min Days */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Minimum Delivery Days
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="minDays"
                    value={form.minDays}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-orange-500 dark:border-[#403d3a] dark:bg-[#242220] dark:text-white"
                  />

                </div>


                {/* Max Days */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Maximum Delivery Days
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="maxDays"
                    value={form.maxDays}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-orange-500 dark:border-[#403d3a] dark:bg-[#242220] dark:text-white"
                  />

                </div>


                {/* Position */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Position
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-orange-500 dark:border-[#403d3a] dark:bg-[#242220] dark:text-white"
                  />

                </div>


                {/* Note */}

                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Note
                  </label>

                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Regular Delivery (1-2 days)"
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 dark:border-[#403d3a] dark:bg-[#242220] dark:text-white dark:placeholder:text-gray-600"
                  />

                </div>


                {/* Active */}

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-[#403d3a] dark:bg-[#242220]">

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 accent-orange-500"
                  />

                  <div>

                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      Active
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      Customers can use this zone.
                    </p>

                  </div>

                </label>


                {/* Default */}

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-[#403d3a] dark:bg-[#242220]">

                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={form.isDefault}
                    onChange={handleChange}
                    className="h-4 w-4 accent-orange-500"
                  />

                  <div>

                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      Default Zone
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      Use as default shipping zone.
                    </p>

                  </div>

                </label>

              </div>


              {/* Buttons */}

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-[#302e2c]">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-[#45413e] dark:text-gray-300 dark:hover:bg-[#292725]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {editingZone
                    ? 'Update Zone'
                    : 'Create Zone'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* DELETE MODAL */}
      {/* ================================= */}

      {deleteZone && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/70">

          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#302e2c] dark:bg-[#191817]">

            <div className="flex justify-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <XCircle
                  size={25}
                  className="text-red-500"
                />
              </div>

            </div>


            <div className="mt-4 text-center">

              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Delete Shipping Zone?
              </h3>

              <p className="mt-2 text-xs leading-5 text-gray-500">

                Are you sure you want to delete

                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {' '}
                  {deleteZone.name}
                </span>

                ? This action cannot be undone.

              </p>

            </div>


            <div className="mt-6 flex gap-3">

              <button
                onClick={() => setDeleteZone(null)}
                disabled={deleteLoading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-[#45413e] dark:text-gray-300 dark:hover:bg-[#292725]"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >

                {deleteLoading && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                )}

                Delete

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ShippingZonesPage;