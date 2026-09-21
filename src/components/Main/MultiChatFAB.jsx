"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FaWhatsapp,
  FaFacebookMessenger,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

import { BiCommentDetail } from "react-icons/bi";
import { IoClose } from "react-icons/io5";


const MultiChatFAB = () => {

  const [isOpen, setIsOpen] = useState(false);

  const [settings, setSettings] = useState({
    enableFloatingHub: true,

    enableWhatsapp: true,
    whatsappNumber: "",

    enableMessenger: true,
    messengerUsername: "",

    enablePhoneCall: true,
    phoneNumber: "",

    enableEmail: true,
    supportEmail: "",
  });


  // Fetch Floating Contact Settings
  useEffect(() => {

    const fetchSettings = async () => {

      try {

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000";


        const res =
          await axios.get(
            `${apiUrl}/api/settings`
          );


        if (
          res.data &&
          res.data.success &&
          res.data.data
        ) {

          const data =
            res.data.data;


          setSettings({
            enableFloatingHub:
              data.enableFloatingHub ??
              true,

            enableWhatsapp:
              data.enableWhatsapp ??
              true,

            whatsappNumber:
              data.whatsappNumber ??
              "",

            enableMessenger:
              data.enableMessenger ??
              true,

            messengerUsername:
              data.messengerUsername ??
              "",

            enablePhoneCall:
              data.enablePhoneCall ??
              true,

            phoneNumber:
              data.phoneNumber ??
              "",

            enableEmail:
              data.enableEmail ??
              true,

            supportEmail:
              data.supportEmail ??
              "",
          });

        }

      } catch (error) {

        console.error(
          "Error fetching floating contact settings:",
          error
        );

      }

    };


    fetchSettings();

  }, []);


  // If Floating Contact Hub Disabled
  if (
    settings.enableFloatingHub === false
  ) {

    return null;

  }


  // Clean Phone Number
  const whatsappNumber =
    settings.whatsappNumber
      ?.replace(
        /\D/g,
        ""
      );


  const phoneNumber =
    settings.phoneNumber
      ?.trim();


  const messengerUsername =
    settings.messengerUsername
      ?.trim();


  const emailAddress =
    settings.supportEmail
      ?.trim();


  // Actions
  const actions = [];


  // Email
  if (
    settings.enableEmail &&
    emailAddress
  ) {

    actions.push({

      id: "email",

      icon:
        <FaEnvelope size={20} />,

      bg:
        "bg-red-500 hover:bg-red-600",

      href:
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}`,

      label:
        "Email Us",

      target:
        "_blank",

    });

  }


  // Phone Call
  if (
    settings.enablePhoneCall &&
    phoneNumber
  ) {

    actions.push({

      id: "call",

      icon:
        <FaPhoneAlt size={18} />,

      bg:
        "bg-[#eb6e1b] hover:bg-[#d45e14]",

      href:
        `tel:${phoneNumber}`,

      label:
        "Call Us",

    });

  }


  // Messenger
  if (
    settings.enableMessenger &&
    messengerUsername
  ) {

    actions.push({

      id: "messenger",

      icon:
        <FaFacebookMessenger size={22} />,

      bg:
        "bg-[#0084FF] hover:bg-[#0073e6]",

      href:
        `https://m.me/${messengerUsername}`,

      label:
        "Messenger",

      target:
        "_blank",

    });

  }


  // WhatsApp
  if (
    settings.enableWhatsapp &&
    whatsappNumber
  ) {

    actions.push({

      id: "whatsapp",

      icon:
        <FaWhatsapp size={22} />,

      bg:
        "bg-[#25D366] hover:bg-[#20ba5a]",

      href:
        `https://wa.me/${whatsappNumber}`,

      label:
        "WhatsApp",

      target:
        "_blank",

    });

  }


  // If No Contact Method Is Available
  if (
    actions.length === 0
  ) {

    return null;

  }


  return (

    <div className="fixed bottom-18 right-5 md:bottom-15 md:right-30 z-[9999] flex flex-col items-center">

      <div className="flex flex-col-reverse items-center gap-3 mb-3 pointer-events-none">

        {actions.map(
          (action, index) => {

            const delayClass =
              isOpen
                ? "transition-all duration-300 ease-out"
                : "transition-all duration-200 ease-in";


            return (

              <a
                key={action.id}

                href={action.href}

                target={
                  action.target ||
                  "_self"
                }

                rel="noopener noreferrer"

                aria-label={
                  action.label
                }

                style={{
                  transitionDelay:
                    isOpen
                      ? `${index * 50}ms`
                      : `${(actions.length - 1 - index) * 30}ms`,
                }}

                className={`
                  w-12 h-12 rounded-full text-white ${action.bg} shadow-lg
                  flex items-center justify-center cursor-pointer
                  hover:scale-110 active:scale-95
                  ${delayClass}
                  ${
                    isOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                      : "opacity-0 translate-y-12 scale-50 pointer-events-none"
                  }
                `}
              >

                {action.icon}

              </a>

            );

          }
        )}

      </div>


      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }

        aria-label="Toggle Contact Menu"

        className={`
          w-14 h-14 bg-primary hover:bg-secondary text-white rounded-full
          shadow-xl hover:shadow-2xl transition-all duration-300
          flex items-center justify-center cursor-pointer relative
          ${
            isOpen
              ? "rotate-90 bg-black"
              : "rotate-0"
          }
        `}
      >

        <span
          className={`
            absolute transition-all duration-300
            ${
              isOpen
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-50"
            }
          `}
        >

          <IoClose
            size={30}
          />

        </span>


        <span
          className={`
            absolute transition-all duration-300
            ${
              isOpen
                ? "opacity-0 rotate-90 scale-50"
                : "opacity-100 rotate-0 scale-100"
            }
          `}
        >

          <BiCommentDetail
            size={28}
          />

        </span>

      </button>

    </div>

  );

};


export default MultiChatFAB;