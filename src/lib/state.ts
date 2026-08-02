// ═══════════════════════════════════════════════════════════════
//  STATE MANAGEMENT — Client-side state stores and hooks
//
//  Provides Zustand-style stores for managing client-side state
//  across the Harch Atelier dashboards. Includes stores for
//  console state, user preferences, dashboard configuration,
//  real-time data, and command palette.
// ═══════════════════════════════════════════════════════════════

import type { AccountType, Alert, Notification, Company, DashboardSection } from "@/lib/types/platform";

// ─── STORE TYPES ───────────────────────────────────────────────

export interface ConsoleState {
  // Session
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  accountType: AccountType | null;
  companyId: string | null;
  companyName: string | null;
  isDemoMode: boolean;
  isAuthenticated: boolean;

  // Navigation
  activeNav: DashboardSection | null;
  activeTab: "overview" | "deep_dive" | null;
  activeTimeRange: "24h" | "7d" | "30d";
  mobileMenuOpen: boolean;
  commandPaletteOpen: boolean;
  globalSearchOpen: boolean;
  dailyBriefingOpen: boolean;
  harchIQAssistantOpen: boolean;
  commandCenterOpen: boolean;
  whatsappSettingsOpen: boolean;
  notificationBellOpen: boolean;

  // Data
  alerts: Alert[];
  notifications: Notification[];
  unreadNotifications: number;
  weather: Record<string, unknown> | null;
  topics: unknown[];
  aiVisibility: unknown[];
  crisis: Record<string, unknown> | null;
  geoSignals: unknown[];
  insights: unknown[];
  neighbors: unknown[];
  narratives: unknown[];

  // Loading states
  alertsLoading: boolean;
  weatherLoading: boolean;
  topicsLoading: boolean;
  aiVisibilityLoading: boolean;
  crisisLoading: boolean;
  geoSignalsLoading: boolean;
  insightsLoading: boolean;
  neighborsLoading: boolean;
  narrativesLoading: boolean;

  // Errors
  alertsError: string | null;
  weatherError: string | null;
  topicsError: string | null;
  aiVisibilityError: string | null;
  crisisError: string | null;
  geoSignalsError: string | null;
  insightsError: string | null;
  neighborsError: string | null;
  narrativesError: string | null;

  // Dashboard configuration
  dashboardTemplate: string;
  navOrder: DashboardSection[];
  collapsedNav: boolean;

  // Sidebar
  sidebarItems: Array<{ id: string; label: string; badge?: number }>;
  draggedNavItem: string | null;

  // Theme
  theme: "light" | "dark";
  accentColor: string;

  // Last refreshed
  lastRefreshed: Record<string, number>;

  // Actions (these would be functions in a real store)
  // We define them as type signatures here
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setWeather: (weather: Record<string, unknown>) => void;
  setTopics: (topics: unknown[]) => void;
  setAIVisibility: (aiVisibility: unknown[]) => void;
  setCrisis: (crisis: Record<string, unknown>) => void;
  setGeoSignals: (geoSignals: unknown[]) => void;
  setInsights: (insights: unknown[]) => void;
  setNeighbors: (neighbors: unknown[]) => void;
  setNarratives: (narratives: unknown[]) => void;
  setActiveNav: (nav: DashboardSection) => void;
  setActiveTab: (tab: "overview" | "deep_dive") => void;
  setActiveTimeRange: (range: "24h" | "7d" | "30d") => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleGlobalSearch: () => void;
  setGlobalSearchOpen: (open: boolean) => void;
  toggleDailyBriefing: () => void;
  setDailyBriefingOpen: (open: boolean) => void;
  toggleHarchIQAssistant: () => void;
  setHarchIQAssistantOpen: (open: boolean) => void;
  toggleCommandCenter: () => void;
  setCommandCenterOpen: (open: boolean) => void;
  toggleWhatsappSettings: () => void;
  setWhatsappSettingsOpen: (open: boolean) => void;
  toggleNotificationBell: () => void;
  setNotificationBellOpen: (open: boolean) => void;
  setDashboardTemplate: (template: string) => void;
  setNavOrder: (order: DashboardSection[]) => void;
  toggleCollapsedNav: () => void;
  setCollapsedNav: (collapsed: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
  refresh: (section: string) => void;
  refreshAll: () => void;
  reset: () => void;
}

// ─── INITIAL STATE ─────────────────────────────────────────────

export function getInitialConsoleState(): ConsoleState {
  return {
    userId: null,
    userEmail: null,
    userName: null,
    userRole: null,
    accountType: null,
    companyId: null,
    companyName: null,
    isDemoMode: false,
    isAuthenticated: false,

    activeNav: null,
    activeTab: "overview",
    activeTimeRange: "7d",
    mobileMenuOpen: false,
    commandPaletteOpen: false,
    globalSearchOpen: false,
    dailyBriefingOpen: false,
    harchIQAssistantOpen: false,
    commandCenterOpen: false,
    whatsappSettingsOpen: false,
    notificationBellOpen: false,

    alerts: [],
    notifications: [],
    unreadNotifications: 0,
    weather: null,
    topics: [],
    aiVisibility: [],
    crisis: null,
    geoSignals: [],
    insights: [],
    neighbors: [],
    narratives: [],

    alertsLoading: false,
    weatherLoading: false,
    topicsLoading: false,
    aiVisibilityLoading: false,
    crisisLoading: false,
    geoSignalsLoading: false,
    insightsLoading: false,
    neighborsLoading: false,
    narrativesLoading: false,

    alertsError: null,
    weatherError: null,
    topicsError: null,
    aiVisibilityError: null,
    crisisError: null,
    geoSignalsError: null,
    insightsError: null,
    neighborsError: null,
    narrativesError: null,

    dashboardTemplate: "full-view",
    navOrder: [],
    collapsedNav: false,

    sidebarItems: [],
    draggedNavItem: null,

    theme: "light",
    accentColor: "#4A7B5F",

    lastRefreshed: {},

    // Actions are no-ops in the initial state
    setAlerts: () => {},
    addAlert: () => {},
    setNotifications: () => {},
    addNotification: () => {},
    markNotificationRead: () => {},
    markAllNotificationsRead: () => {},
    setWeather: () => {},
    setTopics: () => {},
    setAIVisibility: () => {},
    setCrisis: () => {},
    setGeoSignals: () => {},
    setInsights: () => {},
    setNeighbors: () => {},
    setNarratives: () => {},
    setActiveNav: () => {},
    setActiveTab: () => {},
    setActiveTimeRange: () => {},
    toggleMobileMenu: () => {},
    setMobileMenuOpen: () => {},
    toggleCommandPalette: () => {},
    setCommandPaletteOpen: () => {},
    toggleGlobalSearch: () => {},
    setGlobalSearchOpen: () => {},
    toggleDailyBriefing: () => {},
    setDailyBriefingOpen: () => {},
    toggleHarchIQAssistant: () => {},
    setHarchIQAssistantOpen: () => {},
    toggleCommandCenter: () => {},
    setCommandCenterOpen: () => {},
    toggleWhatsappSettings: () => {},
    setWhatsappSettingsOpen: () => {},
    toggleNotificationBell: () => {},
    setNotificationBellOpen: () => {},
    setDashboardTemplate: () => {},
    setNavOrder: () => {},
    toggleCollapsedNav: () => {},
    setCollapsedNav: () => {},
    setTheme: () => {},
    toggleTheme: () => {},
    setAccentColor: () => {},
    refresh: () => {},
    refreshAll: () => {},
    reset: () => {},
  };
}

// ─── USER PREFERENCES STATE ────────────────────────────────────

export interface UserPreferencesState {
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  theme: "light" | "dark" | "auto";
  accentColor: string;
  density: "compact" | "normal" | "comfortable";
  fontSize: "sm" | "md" | "lg";

  // Notification preferences
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  pushNotifications: boolean;
  whatsappNumber: string | null;
  alertSeverityThreshold: "info" | "low" | "medium" | "high" | "critical";
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;

  // Dashboard preferences
  defaultAccountType: AccountType | null;
  defaultTimeRange: "24h" | "7d" | "30d";
  defaultPageSize: number;
  autoRefresh: boolean;
  autoRefreshInterval: number;

  // Export preferences
  defaultExportFormat: "pdf" | "excel" | "csv" | "json";
  includeChartsInExport: boolean;
  includeRawDataInExport: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;

  // Actions
  setLanguage: (lang: string) => void;
  setTimezone: (tz: string) => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: "light" | "dark" | "auto") => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: "compact" | "normal" | "comfortable") => void;
  setFontSize: (size: "sm" | "md" | "lg") => void;
  setEmailNotifications: (enabled: boolean) => void;
  setWhatsappNotifications: (enabled: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
  setWhatsappNumber: (number: string) => void;
  setAlertSeverityThreshold: (threshold: "info" | "low" | "medium" | "high" | "critical") => void;
  setQuietHours: (enabled: boolean, start: string, end: string) => void;
  setDefaultAccountType: (type: AccountType) => void;
  setDefaultTimeRange: (range: "24h" | "7d" | "30d") => void;
  setAutoRefresh: (enabled: boolean) => void;
  setAutoRefreshInterval: (interval: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  reset: () => void;
}

export function getInitialUserPreferences(): UserPreferencesState {
  return {
    language: "fr",
    timezone: "Africa/Casablanca",
    currency: "MAD",
    dateFormat: "DD MMM YYYY",
    timeFormat: "24h",
    theme: "light",
    accentColor: "#4A7B5F",
    density: "normal",
    fontSize: "md",

    emailNotifications: true,
    whatsappNotifications: false,
    pushNotifications: false,
    whatsappNumber: null,
    alertSeverityThreshold: "medium",
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",

    defaultAccountType: null,
    defaultTimeRange: "7d",
    defaultPageSize: 20,
    autoRefresh: true,
    autoRefreshInterval: 30000,

    defaultExportFormat: "pdf",
    includeChartsInExport: true,
    includeRawDataInExport: false,

    reducedMotion: false,
    highContrast: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,

    setLanguage: () => {},
    setTimezone: () => {},
    setCurrency: () => {},
    setTheme: () => {},
    setAccentColor: () => {},
    setDensity: () => {},
    setFontSize: () => {},
    setEmailNotifications: () => {},
    setWhatsappNotifications: () => {},
    setPushNotifications: () => {},
    setWhatsappNumber: () => {},
    setAlertSeverityThreshold: () => {},
    setQuietHours: () => {},
    setDefaultAccountType: () => {},
    setDefaultTimeRange: () => {},
    setAutoRefresh: () => {},
    setAutoRefreshInterval: () => {},
    setReducedMotion: () => {},
    setHighContrast: () => {},
    reset: () => {},
  };
}

// ─── DASHBOARD STATE ───────────────────────────────────────────

export interface DashboardState {
  template: string;
  widgets: Array<{
    id: string;
    section: DashboardSection;
    visible: boolean;
    collapsed: boolean;
    order: number;
    config?: Record<string, unknown>;
  }>;
  layout: {
    columns: number;
    gap: number;
    padding: number;
  };
  filters: {
    dateRange: "24h" | "7d" | "30d" | "90d" | "365d" | "ytd" | "all";
    sentiment: "all" | "positive" | "neutral" | "negative";
    sourceType: "all" | "media" | "regulatory" | "market" | "financial" | "social" | "ai";
    language: "all" | "fr" | "ar" | "en" | "darija";
    search: string;
  };
  sort: {
    field: string;
    direction: "asc" | "desc";
  };
  pagination: {
    page: number;
    limit: number;
  };
  selectedItems: Set<string>;
  loadingSections: Set<string>;
  errorSections: Map<string, string>;
  lastRefreshed: Map<string, Date>;

  setTemplate: (template: string) => void;
  toggleWidget: (id: string) => void;
  collapseWidget: (id: string, collapsed: boolean) => void;
  reorderWidgets: (widgets: DashboardState["widgets"]) => void;
  setLayout: (layout: Partial<DashboardState["layout"]>) => void;
  setFilter: <K extends keyof DashboardState["filters"]>(key: K, value: DashboardState["filters"][K]) => void;
  setFilters: (filters: Partial<DashboardState["filters"]>) => void;
  resetFilters: () => void;
  setSort: (field: string, direction: "asc" | "desc") => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleSelectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setLoading: (section: string, loading: boolean) => void;
  setError: (section: string, error: string | null) => void;
  setRefreshed: (section: string) => void;
  reset: () => void;
}

export function getInitialDashboardState(): DashboardState {
  return {
    template: "full-view",
    widgets: [],
    layout: {
      columns: 3,
      gap: 16,
      padding: 16,
    },
    filters: {
      dateRange: "7d",
      sentiment: "all",
      sourceType: "all",
      language: "all",
      search: "",
    },
    sort: {
      field: "publishedAt",
      direction: "desc",
    },
    pagination: {
      page: 1,
      limit: 20,
    },
    selectedItems: new Set(),
    loadingSections: new Set(),
    errorSections: new Map(),
    lastRefreshed: new Map(),

    setTemplate: () => {},
    toggleWidget: () => {},
    collapseWidget: () => {},
    reorderWidgets: () => {},
    setLayout: () => {},
    setFilter: () => {},
    setFilters: () => {},
    resetFilters: () => {},
    setSort: () => {},
    setPage: () => {},
    setLimit: () => {},
    selectItem: () => {},
    deselectItem: () => {},
    toggleSelectItem: () => {},
    selectAll: () => {},
    clearSelection: () => {},
    setLoading: () => {},
    setError: () => {},
    setRefreshed: () => {},
    reset: () => {},
  };
}

// ─── REAL-TIME STATE ───────────────────────────────────────────

export interface RealTimeState {
  connected: boolean;
  connectionType: "sse" | "websocket" | "polling" | "none";
  clientId: string | null;
  channels: Set<string>;
  messages: Array<{
    id: string;
    channel: string;
    type: string;
    data: unknown;
    timestamp: string;
  }>;
  lastMessageAt: Date | null;
  messageCount: number;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  latency: number;

  setConnected: (connected: boolean) => void;
  setConnectionType: (type: "sse" | "websocket" | "polling" | "none") => void;
  setClientId: (id: string | null) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  addMessage: (message: RealTimeState["messages"][0]) => void;
  clearMessages: () => void;
  setReconnectAttempts: (attempts: number) => void;
  setLatency: (latency: number) => void;
  reset: () => void;
}

export function getInitialRealTimeState(): RealTimeState {
  return {
    connected: false,
    connectionType: "none",
    clientId: null,
    channels: new Set(),
    messages: [],
    lastMessageAt: null,
    messageCount: 0,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    latency: 0,

    setConnected: () => {},
    setConnectionType: () => {},
    setClientId: () => {},
    subscribe: () => {},
    unsubscribe: () => {},
    addMessage: () => {},
    clearMessages: () => {},
    setReconnectAttempts: () => {},
    setLatency: () => {},
    reset: () => {},
  };
}

// ─── COMMAND PALETTE STATE ─────────────────────────────────────

export interface CommandPaletteState {
  open: boolean;
  query: string;
  results: Array<{
    id: string;
    label: string;
    category: string;
    icon?: string;
    shortcut?: string;
    action: () => void;
  }>;
  selectedIndex: number;
  recentCommands: string[];
  maxResults: number;
  categories: string[];

  setOpen: (open: boolean) => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setResults: (results: CommandPaletteState["results"]) => void;
  setSelectedIndex: (index: number) => void;
  moveUp: () => void;
  moveDown: () => void;
  selectCurrent: () => void;
  addRecent: (commandId: string) => void;
  clearRecent: () => void;
  reset: () => void;
}

export function getInitialCommandPaletteState(): CommandPaletteState {
  return {
    open: false,
    query: "",
    results: [],
    selectedIndex: 0,
    recentCommands: [],
    maxResults: 10,
    categories: [],

    setOpen: () => {},
    toggle: () => {},
    setQuery: () => {},
    setResults: () => {},
    setSelectedIndex: () => {},
    moveUp: () => {},
    moveDown: () => {},
    selectCurrent: () => {},
    addRecent: () => {},
    clearRecent: () => {},
    reset: () => {},
  };
}

// ─── GLOBAL SEARCH STATE ───────────────────────────────────────

export interface GlobalSearchState {
  open: boolean;
  query: string;
  results: Array<{
    id: string;
    type: "alert" | "topic" | "report" | "company" | "person" | "article";
    title: string;
    subtitle?: string;
    url?: string;
    date?: string;
    sentiment?: string;
  }>;
  loading: boolean;
  error: string | null;
  recentSearches: string[];
  maxResults: number;
  minQueryLength: number;
  debounceMs: number;

  setOpen: (open: boolean) => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setResults: (results: GlobalSearchState["results"]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  reset: () => void;
}

export function getInitialGlobalSearchState(): GlobalSearchState {
  return {
    open: false,
    query: "",
    results: [],
    loading: false,
    error: null,
    recentSearches: [],
    maxResults: 20,
    minQueryLength: 2,
    debounceMs: 300,

    setOpen: () => {},
    toggle: () => {},
    setQuery: () => {},
    setResults: () => {},
    setLoading: () => {},
    setError: () => {},
    addRecentSearch: () => {},
    clearRecentSearches: () => {},
    reset: () => {},
  };
}

// ─── THEME STATE ───────────────────────────────────────────────

export interface ThemeState {
  mode: "light" | "dark" | "auto";
  accentColor: string;
  fontSize: "sm" | "md" | "lg";
  density: "compact" | "normal" | "comfortable";
  reducedMotion: boolean;
  highContrast: boolean;

  setMode: (mode: "light" | "dark" | "auto") => void;
  toggleMode: () => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: "sm" | "md" | "lg") => void;
  setDensity: (density: "compact" | "normal" | "comfortable") => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  reset: () => void;
}

export function getInitialThemeState(): ThemeState {
  return {
    mode: "light",
    accentColor: "#4A7B5F",
    fontSize: "md",
    density: "normal",
    reducedMotion: false,
    highContrast: false,

    setMode: () => {},
    toggleMode: () => {},
    setAccentColor: () => {},
    setFontSize: () => {},
    setDensity: () => {},
    setReducedMotion: () => {},
    setHighContrast: () => {},
    reset: () => {},
  };
}

// ─── TOAST STATE ───────────────────────────────────────────────

export interface Toast {
  id: string;
  type: "info" | "success" | "warning" | "danger";
  title: string;
  message?: string;
  duration: number;
  position: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible: boolean;
  createdAt: number;
}

export interface ToastState {
  toasts: Toast[];
  maxToasts: number;
  defaultDuration: number;
  defaultPosition: Toast["position"];

  addToast: (toast: Omit<Toast, "id" | "createdAt">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

export function getInitialToastState(): ToastState {
  return {
    toasts: [],
    maxToasts: 5,
    defaultDuration: 5000,
    defaultPosition: "top-right",

    addToast: () => "",
    removeToast: () => {},
    clearAll: () => {},
    updateToast: () => {},
  };
}

// ─── MODAL STATE ───────────────────────────────────────────────

export interface ModalState {
  openModals: Set<string>;
  modalStack: string[];
  activeModal: string | null;

  open: (id: string) => void;
  close: (id: string) => void;
  closeAll: () => void;
  closeTop: () => void;
  isOpen: (id: string) => boolean;
  isActive: (id: string) => boolean;
}

export function getInitialModalState(): ModalState {
  return {
    openModals: new Set(),
    modalStack: [],
    activeModal: null,

    open: () => {},
    close: () => {},
    closeAll: () => {},
    closeTop: () => {},
    isOpen: () => false,
    isActive: () => false,
  };
}

// ─── DRAG & DROP STATE ─────────────────────────────────────────

export interface DragDropState {
  draggedItem: {
    id: string;
    type: string;
    source: string;
    data?: unknown;
  } | null;
  dropTarget: {
    id: string;
    type: string;
    position?: "before" | "after" | "inside";
  } | null;
  isDragging: boolean;

  setDraggedItem: (item: DragDropState["draggedItem"]) => void;
  setDropTarget: (target: DragDropState["dropTarget"]) => void;
  clearDraggedItem: () => void;
  clearDropTarget: () => void;
  clearAll: () => void;
}

export function getInitialDragDropState(): DragDropState {
  return {
    draggedItem: null,
    dropTarget: null,
    isDragging: false,

    setDraggedItem: () => {},
    setDropTarget: () => {},
    clearDraggedItem: () => {},
    clearDropTarget: () => {},
    clearAll: () => {},
  };
}

// ─── ALL STATES COMBINED ───────────────────────────────────────

export interface AllStates {
  console: ConsoleState;
  userPreferences: UserPreferencesState;
  dashboard: DashboardState;
  realTime: RealTimeState;
  commandPalette: CommandPaletteState;
  globalSearch: GlobalSearchState;
  theme: ThemeState;
  toast: ToastState;
  modal: ModalState;
  dragDrop: DragDropState;
}

export function getInitialAllStates(): AllStates {
  return {
    console: getInitialConsoleState(),
    userPreferences: getInitialUserPreferences(),
    dashboard: getInitialDashboardState(),
    realTime: getInitialRealTimeState(),
    commandPalette: getInitialCommandPaletteState(),
    globalSearch: getInitialGlobalSearchState(),
    theme: getInitialThemeState(),
    toast: getInitialToastState(),
    modal: getInitialModalState(),
    dragDrop: getInitialDragDropState(),
  };
}

// ─── STATE SELECTORS ───────────────────────────────────────────

export function selectAlerts(state: ConsoleState): Alert[] {
  return state.alerts;
}

export function selectUnreadNotifications(state: ConsoleState): number {
  return state.unreadNotifications;
}

export function selectIsLoading(state: ConsoleState, section: string): boolean {
  const key = `${section}Loading` as keyof ConsoleState;
  return state[key] as boolean;
}

export function selectError(state: ConsoleState, section: string): string | null {
  const key = `${section}Error` as keyof ConsoleState;
  return state[key] as string | null;
}

export function selectActiveNav(state: ConsoleState): DashboardSection | null {
  return state.activeNav;
}

export function selectIsAuthenticated(state: ConsoleState): boolean {
  return state.isAuthenticated;
}

export function selectAccountType(state: ConsoleState): AccountType | null {
  return state.accountType;
}

export function selectTheme(state: ThemeState): "light" | "dark" | "auto" {
  return state.mode;
}

export function selectAccentColor(state: ThemeState): string {
  return state.accentColor;
}

export function selectToasts(state: ToastState): Toast[] {
  return state.toasts;
}

export function selectIsModalOpen(state: ModalState, id: string): boolean {
  return state.openModals.has(id);
}

export function selectActiveModal(state: ModalState): string | null {
  return state.activeModal;
}

// ─── STATE UTILITIES ───────────────────────────────────────────

export function shallowEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) return false;
  }

  return true;
}

export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

export function getChangedKeys<T extends Record<string, unknown>>(oldObj: T, newObj: T): string[] {
  const changed: string[] = [];
  for (const key of Object.keys(newObj)) {
    if (oldObj[key] !== newObj[key]) {
      changed.push(key);
    }
  }
  return changed;
}

export function createSelector<T, R>(selector: (state: T) => R): (state: T) => R {
  let lastState: T | null = null;
  let lastResult: R | null = null;

  return (state: T): R => {
    if (lastState !== null && shallowEqual(lastState, state)) {
      return lastResult as R;
    }
    lastState = state;
    lastResult = selector(state);
    return lastResult;
  };
}

// ─── LOCAL STORAGE PERSISTENCE ─────────────────────────────────

export function persistToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clearLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
}

// ─── SESSION STORAGE PERSISTENCE ───────────────────────────────

export function persistToSessionStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadFromSessionStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

export function removeFromSessionStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ─── STATE KEYS ────────────────────────────────────────────────

export const STORAGE_KEYS = {
  CONSOLE_STATE: "harchiq.console.state",
  USER_PREFERENCES: "harchiq.user.preferences",
  DASHBOARD_TEMPLATE: "harchiq.dashboard.template",
  NAV_ORDER: "harchiq.nav.order",
  THEME: "harchiq.theme",
  ACCENT_COLOR: "harchiq.accent.color",
  LANGUAGE: "harchiq.language",
  TIMEZONE: "harchiq.timezone",
  RECENT_SEARCHES: "harchiq.search.recent",
  RECENT_COMMANDS: "harchiq.commands.recent",
  SIDEBAR_COLLAPSED: "harchiq.sidebar.collapsed",
  LAST_VIEWED_SECTION: "harchiq.section.last",
  BRIEFING_LAST_VIEWED: "harchiq.briefing.lastViewed",
  DEMO_MODE: "harchiq.demo",
  AUTH_TOKEN: "harchiq.auth.token",
  REFRESH_TOKEN: "harchiq.auth.refresh",
} as const;

// ─── STATE VERSIONING ──────────────────────────────────────────

export const STATE_VERSION = "1.0.0";

export function migrateState<T>(key: string, stored: T, currentVersion: string): T {
  // In a real implementation, this would handle state migrations
  // between different versions of the state schema
  return stored;
}

export function getStateVersion(): string {
  return STATE_VERSION;
}

export function isStateVersionCompatible(version: string): boolean {
  return version === STATE_VERSION;
}
