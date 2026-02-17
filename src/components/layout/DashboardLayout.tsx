"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Server,
    Shield,
    AlertTriangle,
    FileCheck,
    BarChart3,
    Settings,
    Users,
    Scan,
    Bell,
    Search,
    Menu,
    ChevronDown,
    LogOut,
    ClipboardList,
    Database,
    Sun,
    Moon,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useLoginAudit } from "@/hooks/useLoginAudit";
import {
    markAllNotificationsRead,
    markNotificationRead,
    normalizeNotificationsResponse,
    type NotificationItem,
    type NotificationsResponse,
} from "@/lib/notification-state";
import { useTheme } from "@/components/providers/ThemeProvider";

const ALL_ROLES = ["MAIN_OFFICER", "IT_OFFICER", "PENTESTER", "ANALYST"];

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL_ROLES },
    { name: "Assets", href: "/assets", icon: Server, roles: ALL_ROLES },
    { name: "Vulnerabilities", href: "/vulnerabilities", icon: Shield, roles: ALL_ROLES },
    { name: "Threats", href: "/threats", icon: AlertTriangle, roles: ALL_ROLES },
    { name: "Risk Register", href: "/risk-register", icon: ClipboardList, roles: ALL_ROLES },
    { name: "Compliance", href: "/compliance", icon: FileCheck, roles: ALL_ROLES },
    { name: "Reports", href: "/reports", icon: BarChart3, roles: ALL_ROLES },
    { name: "Scanners", href: "/scanners", icon: Scan, roles: ALL_ROLES },
    { name: "CVE Search", href: "/cves", icon: Database, roles: ALL_ROLES },
];

const secondaryNav = [
    { name: "Users", href: "/users", icon: Users, roles: ["MAIN_OFFICER"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["MAIN_OFFICER", "IT_OFFICER", "PENTESTER", "ANALYST"] },
];

const routeLabelMap: Record<string, string> = {
    "/dashboard": "Command_Center",
    "/assets": "Asset_Operations",
    "/vulnerabilities": "Vulnerability_Triage",
    "/threats": "Threat_Console",
    "/risk-register": "Risk_Register",
    "/compliance": "Compliance_Grid",
    "/reports": "Reporting_Hub",
    "/scanners": "Scanner_Orchestrator",
    "/cves": "CVE_Intel",
    "/users": "Access_Control",
    "/settings": "System_Settings",
};

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [showSignOut, setShowSignOut] = useState(false);

    const userRole = session?.user?.role || "ANALYST";
    const userName = session?.user?.name || "User";
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const filteredNav = navigation.filter(item => item.roles.includes(userRole));
    const filteredSecondaryNav = secondaryNav.filter(item => item.roles.includes(userRole));

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-in-out"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "sidebar transition-transform duration-400 ease-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="border-b border-[var(--border-color)] px-5 py-4">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <Image
                            src="/logo1.png"
                            alt="SecYourFlow"
                            width={34}
                            height={34}
                            className="rounded-full ring-1 ring-[var(--line-3)] shadow-[var(--glow-accent)]"
                        />
                        <span className="type-label text-[13px] tracking-[0.22em] text-[var(--text-primary)]">
                            SECYOUR<span className="text-[var(--accent-1)]">FLOW</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="min-h-0 flex-1 overflow-y-auto py-4">
                    <div className="px-4 mb-2">
                        <span className="type-label text-[var(--text-muted)]">
                            Main Menu
                        </span>
                    </div>
                    {filteredNav.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn("sidebar-link", isActive && "active")}
                                onClick={() => {
                                    if (window.innerWidth < 1024) setIsOpen(false);
                                }}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="px-4 mt-6 mb-2">
                        <span className="type-label text-[var(--text-muted)]">
                            Administration
                        </span>
                    </div>
                    {filteredSecondaryNav.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn("sidebar-link", isActive && "active")}
                                onClick={() => {
                                    if (window.innerWidth < 1024) setIsOpen(false);
                                }}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="mt-auto border-t border-[var(--border-color)] p-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowSignOut(!showSignOut)}
                            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 transition-colors hover:border-[var(--line-3)]"
                        >
                            <div className="type-mono flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line-3)] bg-[var(--accent-1-soft)] text-sm font-semibold text-[var(--accent-1)]">
                                {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                    {userName}
                                </p>
                                <p className="type-label text-[var(--text-muted)]">
                                    {userRole.replace('_', ' ')}
                                </p>
                            </div>
                            <div className="rounded-lg p-1.5 text-[var(--text-muted)]">
                                <ChevronDown size={14} />
                            </div>
                        </button>

                        {/* Click-triggered Sign Out Menu */}
                        {showSignOut && (
                            <div className="absolute bottom-full left-0 w-full mb-2 z-50 animate-fade-in">
                                <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-1 shadow-2xl">
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full flex items-center gap-2 rounded-lg p-2.5 text-sm text-[var(--badge-critical-text)] transition-colors hover:bg-[var(--badge-critical-bg)]"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

interface TopBarProps {
    onToggleSidebar: () => void;
}

interface ThreatsResponse {
    stats?: {
        activeThreatsCount?: number;
    };
}

function getApiErrorMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") {
        return null;
    }

    const error = (payload as { error?: unknown }).error;
    return typeof error === "string" ? error : null;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [threatsCount, setThreatsCount] = useState(0);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const redirectedForTwoFactorRef = useRef(false);

    const handleAuthFailure = useCallback(
        async (response: Response): Promise<boolean> => {
            if (response.status === 401) {
                router.replace("/login");
                return true;
            }

            if (response.status === 403) {
                let payload: unknown = null;
                try {
                    payload = await response.json();
                } catch {
                    payload = null;
                }

                const errorMessage = getApiErrorMessage(payload);
                if (errorMessage?.toLowerCase().includes("two-factor authentication required")) {
                    if (!redirectedForTwoFactorRef.current) {
                        redirectedForTwoFactorRef.current = true;
                        router.replace("/auth/2fa");
                    }
                    return true;
                }
            }

            return false;
        },
        [router],
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Threats
                const threatsRes = await fetch("/api/threats");
                if (!threatsRes.ok) {
                    const shouldStop = await handleAuthFailure(threatsRes);
                    if (shouldStop) {
                        return;
                    }
                } else {
                    const threatsData = await threatsRes.json() as ThreatsResponse;
                    if (threatsData.stats) {
                        setThreatsCount(threatsData.stats.activeThreatsCount || 0);
                    }
                }

                // Fetch Notifications
                const notifRes = await fetch("/api/notifications");
                if (!notifRes.ok) {
                    const shouldStop = await handleAuthFailure(notifRes);
                    if (shouldStop) {
                        return;
                    }

                    setNotificationsCount(0);
                    setNotifications([]);
                    return;
                }

                const notifData = await notifRes.json() as NotificationsResponse;
                const normalizedNotifications = normalizeNotificationsResponse(notifData);
                setNotificationsCount(normalizedNotifications.unreadCount);
                setNotifications(normalizedNotifications.notifications);
            } catch (error) {
                console.error("Failed to fetch topbar data", error);
            }
        };

        fetchData();
        // Poll every minute
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [handleAuthFailure]);

    const markAsRead = async () => {
        try {
            const response = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });

            if (!response.ok) {
                const shouldStop = await handleAuthFailure(response);
                if (shouldStop) {
                    return;
                }
                throw new Error("Failed to mark notifications as read");
            }

            setNotificationsCount(0);
            setNotifications((previousNotifications) =>
                markAllNotificationsRead(previousNotifications),
            );
        } catch (e) {
            console.error(e);
        }
    };

    const markOneNotificationAsRead = async (notification: NotificationItem) => {
        if (notification.isRead) {
            return;
        }

        const response = await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: notification.id, isRead: true }),
        });

        if (!response.ok) {
            const shouldStop = await handleAuthFailure(response);
            if (shouldStop) {
                return;
            }
            throw new Error("Failed to mark notification as read");
        }

        const updateResult = await response.json() as { changedToRead?: boolean };

        setNotifications((previousNotifications) =>
            markNotificationRead(previousNotifications, notification.id).notifications,
        );

        if (updateResult.changedToRead) {
            setNotificationsCount((previousCount) => Math.max(0, previousCount - 1));
        }
    };

    const navigateToNotification = (link: string) => {
        if (link.startsWith("http://") || link.startsWith("https://")) {
            window.location.href = link;
            return;
        }

        router.push(link);
    };

    const handleNotificationClick = async (notification: NotificationItem) => {
        // 1. Optimistically update local state
        if (!notification.isRead) {
            setNotifications((previous) =>
                markNotificationRead(previous, notification.id).notifications
            );
            setNotificationsCount((prev) => Math.max(0, prev - 1));
        }

        // 2. Clear state and navigate immediately if there's a link
        if (notification.link) {
            setShowNotifications(false);
            navigateToNotification(notification.link);
        }

        // 3. Perform the actual API call in the background
        if (!notification.isRead) {
            try {
                await fetch("/api/notifications", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: notification.id, isRead: true }),
                });
            } catch (error) {
                console.error("Failed to sync notification read state", error);
                // Optional: Revert optimistic update if critical, 
                // but usually fine for "read" state.
            }
        }
    };

    const activeRoutePrefix = Object.keys(routeLabelMap).find((route) => pathname === route || pathname.startsWith(`${route}/`));
    const shellLabel = activeRoutePrefix ? routeLabelMap[activeRoutePrefix] : "Security_Console";

    return (
        <header className="shell-topbar sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-color)]/70 bg-[var(--bg-secondary)]/75 px-6 backdrop-blur-md">
            <div className="min-w-0 flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-secondary)] transition-all duration-300 ease-in-out hover:border-[var(--line-3)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={20} />
                </button>

                <div className="min-w-0">
                    <h1 className="type-mono truncate text-[15px] font-bold uppercase tracking-tight text-[var(--text-primary)]">
                        {shellLabel} <span className="text-[var(--accent-1)]">{"//"}</span> System_Active
                    </h1>
                    <div className="type-mono type-caption mt-0.5 flex items-center gap-2 text-[var(--text-muted)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--badge-low-text)] shadow-[var(--glow-accent)]" />
                        LIVE FEED CONNECTED
                    </div>
                </div>
            </div>

            <div className="ml-4 flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-1.5 xl:flex">
                    <Search size={14} className="text-[var(--text-muted)]" />
                    <span className="type-mono type-caption text-[var(--text-muted)]">
                        <span className="rounded bg-[var(--surface-4)] px-1 text-[var(--text-primary)]">J</span> / <span className="rounded bg-[var(--surface-4)] px-1 text-[var(--text-primary)]">K</span> to navigate
                    </span>
                </div>

                {/* Live Threats Indicator */}
                <Link href="/threats">
                    <div className="hidden cursor-pointer items-center gap-2 rounded-lg border border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)] px-3 py-1.5 transition-all duration-300 ease-in-out hover:opacity-90 md:flex">
                        <span className="live-indicator type-caption font-semibold text-[var(--badge-critical-text)]">
                            {threatsCount} Active Threats
                        </span>
                    </div>
                </Link>

                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    className="relative p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-300 ease-in-out border border-[var(--border-color)]"
                >
                    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-secondary)] transition-all duration-300 ease-in-out hover:border-[var(--line-3)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    >
                        <Bell size={20} />
                        {notificationsCount > 0 && (
                            <span className="notification-badge">{notificationsCount}</span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {showNotifications && (
                        <div className="animate-fade-in absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-2xl">
                            <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]">
                                <h3 className="type-caption font-semibold">Notifications</h3>
                                {notificationsCount > 0 && (
                                    <button onClick={markAsRead} className="type-caption text-[var(--accent-1)] transition-all duration-300 ease-in-out hover:text-[var(--accent-1-strong)]">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <button
                                            key={notif.id}
                                            type="button"
                                            onClick={() => {
                                                void handleNotificationClick(notif);
                                            }}
                                            className={`w-full p-3 border-b border-[var(--border-color)] text-left hover:bg-[var(--bg-tertiary)] transition-all duration-300 ease-in-out ${!notif.isRead ? "bg-[var(--bg-tertiary)]/50" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium">{notif.title}</p>
                                                {!notif.isRead && (
                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-1)]" />
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">{notif.message}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Audit login events with IP and user agent
    useLoginAudit();

    // Close sidebar on initial mobile load
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="dashboard-scale min-h-screen bg-[var(--bg-primary)] bg-grid">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className={cn(
                "transition-all duration-400 ease-out",
                isSidebarOpen ? "lg:ml-[260px]" : "lg:ml-0"
            )}>
                <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="px-[var(--shell-rail-x)] pt-4">
                    <div className="command-strip glass-panel px-2 shadow-lg">
                        <div className="type-mono flex min-w-0 flex-1 items-center gap-3 px-3">
                            <span className="text-lg font-bold text-[var(--accent-1)]">&gt;</span>
                            <input
                                type="text"
                                placeholder="filter:critical status:open sort:newest..."
                                className="type-mono h-[var(--control-h-md)] w-full border-none bg-transparent p-0 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]/70"
                            />
                            <span className="block h-5 w-2 animate-pulse rounded-sm bg-[var(--accent-1)]/80" />
                        </div>
                        <div className="hidden items-center gap-2 border-l border-[var(--border-color)] pl-3 pr-1 lg:flex">
                            <button type="button" className="type-mono type-caption rounded border border-[var(--border-color)] px-2.5 py-1 text-[var(--text-muted)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--text-primary)]">
                                preset:my_tickets
                            </button>
                            <button type="button" className="type-mono type-caption rounded border border-[var(--border-color)] px-2.5 py-1 text-[var(--text-muted)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--text-primary)]">
                                preset:pci_dss
                            </button>
                        </div>
                    </div>
                </div>
                <main className="shell-main-rail min-h-[calc(100vh-var(--shell-topbar-h))]">{children}</main>
            </div>
        </div>
    );
}
