'use client';

import React, { useState } from 'react';
import { FiPhone } from 'react-icons/fi';
import { TfiEmail } from 'react-icons/tfi';
import { toast } from 'react-toastify';
import Button from './Button';

const ContactFormSection = ({ contactInfo }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Please fill in all required (*) fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/contact/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send message.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-10 font-sans text-black">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-stretch">
        
        {/* Contact Info (Backend Dynamic) */}
        <div className="bg-white p-8 rounded shadow-[0_1px_13px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-xl">
                <FiPhone />
              </div>
              <h3 className="font-medium text-base">Call To Us</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-800">
              <p>{contactInfo?.availability || 'We are available 24/7, 7 days a week.'}</p>
              <p className="font-medium">
                Phone: {contactInfo?.phone || '01804673487'}
              </p>
            </div>
          </div>

          <hr className="border-gray-300" />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-xl">
                <TfiEmail />
              </div>
              <h3 className="font-medium text-base">Write To Us</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-800">
              <p>{contactInfo?.writeUsSubtext || 'Fill out our form and we will contact you within 24 hours.'}</p>
              {contactInfo?.email1 && <p>Emails: {contactInfo.email1}</p>}
              {contactInfo?.email2 && <p>Emails: {contactInfo.email2}</p>}
            </div>
          </div>
        </div>

        {/* Contact Form Submission */}
        <form onSubmit={handleSendMessage} className="bg-white p-8 rounded shadow-[0_1px_13px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name *"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-[#F5F5F5] rounded p-3 text-sm focus:outline-none border border-transparent focus:border-primary transition-all"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email *"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-[#F5F5F5] rounded p-3 text-sm focus:outline-none border border-transparent focus:border-primary transition-all"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone *"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-[#F5F5F5] rounded p-3 text-sm focus:outline-none border border-transparent focus:border-primary transition-all"
              required
            />
          </div>
          <div className="flex-1">
            <textarea
              name="message"
              placeholder="Your Message *"
              rows="6"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full bg-[#F5F5F5] rounded p-3 text-sm focus:outline-none border border-transparent focus:border-primary transition-all resize-none h-full min-h-[150px]"
              required
            ></textarea>
          </div>
          <div className="flex justify-end pt-2">
            <Button TagName={"button"} type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>

      </div>
    </section>
  );
};

export default ContactFormSection;