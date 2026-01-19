'use client';
import { BellIcon, SettingsIcon, UserIcon, Menu, X } from "lucide-react";
import React, { JSX, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Button } from "../../components/button";

const navigationItems = [
  { label: "Investor Dashboard", active: true },
  { label: "Wallet", active: false },
  { label: "Community", active: false },
];

const dummyNotifications = [
  {
    id: 1,
    title: "New Investment Opportunity",
    message: "A new startup in AI sector is now available for investment",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Portfolio Update",
    message: "Your investment in TechCorp has increased by 15%",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    title: "Community Post",
    message: "John Smith mentioned you in a discussion",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    title: "Payment Received",
    message: "Dividend payment of $500 has been credited",
    time: "2 days ago",
    read: true,
  },
];

// Notification Dropdown Component
const NotificationDropdown = ({ 
  isOpen, 
  position, 
  notifications, 
  unreadCount,
  onClose 
}: {
  isOpen: boolean;
  position: { top: number; left: number; width: number };
  notifications: typeof dummyNotifications;
  unreadCount: number;
  onClose: () => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      className="w-[350px] sm:w-[400px] bg-[#2a2a2a] rounded-lg shadow-lg border border-white/10 max-h-[500px] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-semibold text-lg">Notifications</h3>
        {unreadCount > 0 && (
          <p className="text-gray-400 text-sm">{unreadCount} unread</p>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 border-b border-white/10 hover:bg-[#3a3a3a] cursor-pointer transition-colors ${
              !notification.read ? 'bg-[#3a3a3a]/50' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">
                  {notification.title}
                  {!notification.read && (
                    <span className="ml-2 inline-block w-2 h-2 bg-[#ef6b23] rounded-full"></span>
                  )}
                </h4>
                <p className="text-gray-400 text-xs mb-1">
                  {notification.message}
                </p>
                <span className="text-gray-500 text-xs">
                  {notification.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-center">
        <button className="text-[#ef6b23] hover:text-[#d95e1f] text-sm font-medium transition-colors">
          View all notifications
        </button>
      </div>
    </div>,
    document.body
  );
};

export const HeaderSection = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, left: 0, width: 0 });
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleUserProfileClick = () => {
    router.push('/userprofile');
  };

  const handleSettingsClick = () => {
    router.push('/Editprofile');
  };

  const handleNotificationClick = () => {
    if (!isNotificationOpen && bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      setNotificationPosition({
        top: rect.bottom + 8,
        left: rect.right - 400, // Position dropdown to the right edge
        width: rect.width,
      });
    }
    setIsNotificationOpen(!isNotificationOpen);
  };

  const unreadCount = dummyNotifications.filter(n => !n.read).length;

  return (
    <>
      {/* Black top strip */}
      <div className="w-full h-4 sm:h-5 lg:h-6 bg-black" />

      <header
        className="
          w-full
          max-w-[98vw]
          sm:max-w-[97vw]
          md:max-w-[96vw]
          lg:max-w-[1230px]
          xl:max-w-[1600px]
          2xl:max-w-[1850px]
          mx-auto
          bg-[#3a3a3a]
          rounded-[15px] sm:rounded-[20px] lg:rounded-[30px]
          overflow-hidden
          relative
          mt-1 sm:mt-2 lg:mt-2
        "
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-[26px] py-3 sm:py-4 lg:py-5 gap-2 sm:gap-4">
          {/* Logo Section */}
          <div className="flex-shrink-0 w-[120px] sm:w-[160px] lg:w-[200px] xl:w-[237px]">
            <img
              className="w-full h-[30px] sm:h-[40px] lg:h-[50px] object-contain"
              alt="Co build logo"
              src="/co-build-logo-01-1.png"
            />
          </div>

          {/* Desktop Navigation Section */}
          <nav className="hidden lg:flex items-center gap-3 ml-4">
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`
                  h-[60px]
                  px-8 py-4
                  rounded-[22px]
                  transition-colors
                  ${item.active
                    ? "bg-[#ef6b23] hover:bg-[#d95e1f]"
                    : "hover:bg-[#4a4a4a]"
                  }
                `}
              >
                <span className="font-normal text-white text-base whitespace-nowrap">
                  {item.label}
                </span>
              </Button>
            ))}
          </nav>

          {/* Desktop Icon Section */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Notification Button with Badge */}
            <Button
              ref={bellButtonRef}
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a] relative"
              onClick={handleNotificationClick}
            >
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#ef6b23] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a]"
              onClick={handleUserProfileClick}
            >
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a]"
              onClick={handleSettingsClick}
            >
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] rounded-full hover:bg-[#4a4a4a]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#2a2a2a] border-t border-white/10">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-[#ef6b23] hover:bg-[#d95e1f]"
                      : "hover:bg-[#4a4a4a]"
                  }`}
                >
                  <span className="font-normal text-white text-sm sm:text-base">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="md:hidden flex items-center justify-center gap-3 px-4 py-3 border-t border-white/10">
              <Button
                variant="ghost"
                size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a] relative"
                onClick={handleNotificationClick}
              >
                <BellIcon className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#ef6b23] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a]"
                onClick={handleUserProfileClick}
              >
                <UserIcon className="w-5 h-5 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a]"
                onClick={handleSettingsClick}
              >
                <SettingsIcon className="w-5 h-5 text-white" />
              </Button>
            </div>

            {/* Mobile Notification Dropdown */}
            {isNotificationOpen && (
              <div className="md:hidden bg-[#1a1a1a] border-t border-white/10 max-h-[400px] overflow-y-auto">
                <div className="px-4 py-3">
                  <h3 className="text-white font-semibold text-base mb-2">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-gray-400 text-sm mb-3">{unreadCount} unread</p>
                  )}
                </div>
                {dummyNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-white/10 ${
                      !notification.read ? 'bg-[#3a3a3a]/50' : ''
                    }`}
                  >
                    <h4 className="text-white font-medium text-sm mb-1">
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-2 inline-block w-2 h-2 bg-[#ef6b23] rounded-full"></span>
                      )}
                    </h4>
                    <p className="text-gray-400 text-xs mb-1">
                      {notification.message}
                    </p>
                    <span className="text-gray-500 text-xs">
                      {notification.time}
                    </span>
                  </div>
                ))}
                <div className="px-4 py-3 text-center">
                  <button className="text-[#ef6b23] text-sm font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Portal Notification Dropdown for Desktop */}
      <NotificationDropdown
        isOpen={isNotificationOpen}
        position={notificationPosition}
        notifications={dummyNotifications}
        unreadCount={unreadCount}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};
