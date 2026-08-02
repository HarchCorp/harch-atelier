// ═══════════════════════════════════════════════════════════════
//  UI COMPONENT LIBRARY — Reusable React component definitions
//
//  Type definitions and configuration for all reusable UI
//  components used across the Harch Atelier dashboards.
// ═══════════════════════════════════════════════════════════════

import type { ReactNode, CSSProperties, MouseEvent, KeyboardEvent, DragEvent } from "react";
import type { ChartType, SentimentLabel, RiskLevel, AlertSeverity, AccountType } from "@/lib/types/platform";

// ─── BASE COMPONENT PROPS ──────────────────────────────────────

export interface BaseComponentProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  "data-testid"?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  role?: string;
  tabIndex?: number;
}

export interface ClickableProps extends BaseComponentProps {
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onDoubleClick?: (e: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLElement>) => void;
  onFocus?: (e: never) => void;
  onBlur?: (e: never) => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface KeyboardProps extends ClickableProps {
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  onKeyUp?: (e: KeyboardEvent<HTMLElement>) => void;
}

export interface DraggableProps extends BaseComponentProps {
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLElement>) => void;
  onDragOver?: (e: DragEvent<HTMLElement>) => void;
  onDragEnter?: (e: DragEvent<HTMLElement>) => void;
  onDragLeave?: (e: DragEvent<HTMLElement>) => void;
  onDrop?: (e: DragEvent<HTMLElement>) => void;
}

// ─── CARD COMPONENT ────────────────────────────────────────────

export interface CardProps extends BaseComponentProps {
  variant?: "default" | "outlined" | "elevated" | "filled";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  radius?: "none" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  badge?: string | number;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
}

export interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  badge?: string | number;
  divider?: boolean;
}

export interface CardBodyProps extends BaseComponentProps {
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

export interface CardFooterProps extends BaseComponentProps {
  divider?: boolean;
  action?: ReactNode;
}

// ─── BUTTON COMPONENT ──────────────────────────────────────────

export interface ButtonProps extends ClickableProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "default" | "rounded" | "pill" | "square" | "circle";
  icon?: ReactNode;
  iconPosition?: "left" | "right" | "top" | "bottom";
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  type?: "button" | "submit" | "reset";
  badge?: string | number;
  badgeColor?: string;
}

export interface IconButtonProps extends ClickableProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "danger" | "ghost";
  shape?: "default" | "rounded" | "circle" | "square";
  badge?: number;
  tooltip?: string;
  active?: boolean;
}

export interface ButtonGroupProps extends BaseComponentProps {
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "contained";
  spacing?: "none" | "sm" | "md";
  fullWidth?: boolean;
}

// ─── INPUT COMPONENTS ──────────────────────────────────────────

export interface InputProps extends BaseComponentProps {
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "date" | "datetime-local" | "time";
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "filled" | "underlined";
  fullWidth?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  name?: string;
  id?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onFocus?: () => void;
  onKeyPress?: (key: string) => void;
  onKeyDown?: (key: string) => void;
  clearable?: boolean;
  loading?: boolean;
}

export interface TextareaProps extends InputProps {
  rows?: number;
  maxRows?: number;
  autoResize?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export interface SelectProps extends BaseComponentProps {
  value?: string | string[];
  defaultValue?: string | string[];
  options: SelectOption[];
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "filled";
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onChange?: (value: string | string[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  groupBy?: string;
  maxTagCount?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  group?: string;
  metadata?: Record<string, unknown>;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface RadioGroupProps extends BaseComponentProps {
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  label?: string;
  helperText?: string;
  errorText?: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
}

export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface SliderProps extends BaseComponentProps {
  value?: number | number[];
  defaultValue?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  helperText?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  marks?: Array<{ value: number; label?: string }>;
  range?: boolean;
  vertical?: boolean;
  onChange?: (value: number | number[]) => void;
  onChangeCommitted?: (value: number | number[]) => void;
}

export interface DatePickerProps extends BaseComponentProps {
  value?: Date | string | null;
  defaultValue?: Date | string;
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  format?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  minDate?: Date | string;
  maxDate?: Date | string;
  disablePast?: boolean;
  disableFuture?: boolean;
  onChange?: (value: Date | null) => void;
  onBlur?: () => void;
}

// ─── TABLE COMPONENT ───────────────────────────────────────────

export interface TableProps extends BaseComponentProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  pagination?: TablePagination;
  sorting?: TableSorting;
  filtering?: TableFiltering;
  selection?: TableSelection;
  density?: "compact" | "normal" | "comfortable";
  stickyHeader?: boolean;
  virtualized?: boolean;
  rowHeight?: number;
  overscan?: number;
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
  onRowDoubleClick?: (row: Record<string, unknown>, index: number) => void;
  onSelectionChange?: (selectedRows: Record<string, unknown>[]) => void;
  onSortChange?: (column: string, direction: "asc" | "desc") => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface TableColumn {
  key: string;
  header: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: "left" | "right" | "center";
  valign?: "top" | "middle" | "bottom";
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  fixed?: "left" | "right";
  hidden?: boolean;
  render?: (value: unknown, row: Record<string, unknown>, index: number) => ReactNode;
  headerRender?: (column: TableColumn) => ReactNode;
  footerRender?: (rows: Record<string, unknown>[]) => ReactNode;
  filter?: {
    type: "text" | "select" | "date" | "number" | "boolean";
    options?: SelectOption[];
    placeholder?: string;
  };
  format?: (value: unknown) => string;
  className?: string;
  style?: CSSProperties;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

export interface TableSorting {
  column: string;
  direction: "asc" | "desc";
  multiple?: boolean;
}

export interface TableFiltering {
  filters: Record<string, unknown>;
  mode?: "client" | "server";
}

export interface TableSelection {
  type?: "single" | "multiple" | "none";
  selectedKeys?: string[];
  getRowKey?: (row: Record<string, unknown>) => string;
}

// ─── CHART COMPONENT ───────────────────────────────────────────

export interface ChartProps extends BaseComponentProps {
  type: ChartType;
  data: unknown;
  config?: ChartConfig;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  height?: number | string;
  width?: number | string;
  responsive?: boolean;
  exportable?: boolean;
  onPointClick?: (point: unknown) => void;
  onLegendClick?: (item: unknown) => void;
}

export interface ChartConfig {
  colors?: string[];
  showLegend?: boolean;
  legendPosition?: "top" | "bottom" | "left" | "right";
  showGrid?: boolean;
  showAxisLabels?: boolean;
  showTooltip?: boolean;
  showDataLabels?: boolean;
  animate?: boolean;
  animationDuration?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxis?: {
    label?: string;
    format?: (value: unknown) => string;
    tickInterval?: number;
    min?: number;
    max?: number;
    type?: "category" | "linear" | "time" | "logarithmic";
  };
  yAxis?: {
    label?: string;
    format?: (value: unknown) => string;
    tickInterval?: number;
    min?: number;
    max?: number;
    type?: "category" | "linear" | "time" | "logarithmic";
  };
  series?: ChartSeriesConfig[];
  threshold?: {
    warning?: number;
    critical?: number;
    color?: string;
  };
  zoom?: boolean;
  pan?: boolean;
}

export interface ChartSeriesConfig {
  name: string;
  color: string;
  type?: ChartType;
  visible?: boolean;
  yAxis?: string;
  stack?: string;
  fill?: string | boolean;
  lineWidth?: number;
  dashed?: boolean;
  pointStyle?: "circle" | "square" | "triangle" | "none";
  pointSize?: number;
}

// ─── BADGE & TAG ───────────────────────────────────────────────

export interface BadgeProps extends BaseComponentProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "default" | "rounded" | "pill" | "square";
  dot?: boolean;
  pulse?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  overflowCount?: number;
}

export interface TagProps extends BaseComponentProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  closable?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  bordered?: boolean;
}

// ─── ALERT & NOTIFICATION ──────────────────────────────────────

export interface AlertProps extends BaseComponentProps {
  variant?: "info" | "success" | "warning" | "danger" | "default";
  title?: string;
  message?: string;
  closable?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  action?: ReactNode;
  showIcon?: boolean;
  banner?: boolean;
  floating?: boolean;
  duration?: number;
}

export interface ToastProps extends AlertProps {
  position?: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";
  stacked?: boolean;
}

// ─── MODAL & DIALOG ────────────────────────────────────────────

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  centered?: boolean;
  closable?: boolean;
  closeOnEsc?: boolean;
  closeOnOverlay?: boolean;
  overlay?: boolean;
  overlayBlur?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
  loading?: boolean;
  destroyOnClose?: boolean;
  autoFocus?: boolean;
}

export interface DrawerProps extends ModalProps {
  position?: "left" | "right" | "top" | "bottom";
  width?: string | number;
  height?: string | number;
}

export interface PopoverProps extends BaseComponentProps {
  content: ReactNode;
  trigger?: "hover" | "click" | "focus";
  position?: "top" | "bottom" | "left" | "right" | "auto";
  alignment?: "start" | "center" | "end";
  arrow?: boolean;
  closeOnEsc?: boolean;
  closeOnOutside?: boolean;
  delay?: number;
  hideDelay?: number;
  disabled?: boolean;
}

export interface TooltipProps extends PopoverProps {
  text: string;
}

// ─── NAVIGATION ────────────────────────────────────────────────

export interface TabsProps extends BaseComponentProps {
  tabs: TabItem[];
  activeTab?: string;
  defaultTab?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "pills" | "underline" | "segmented";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  centered?: boolean;
  onChange?: (tabId: string) => void;
  closable?: boolean;
  onClose?: (tabId: string) => void;
  animated?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content?: ReactNode;
  closable?: boolean;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  size?: "sm" | "md" | "lg";
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface PaginationProps extends BaseComponentProps {
  page: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
  onChange?: (page: number, pageSize: number) => void;
  size?: "sm" | "md" | "lg";
  simple?: boolean;
}

// ─── PROGRESS & LOADING ────────────────────────────────────────

export interface ProgressProps extends BaseComponentProps {
  value?: number;
  max?: number;
  min?: number;
  variant?: "linear" | "circular" | "step";
  size?: "sm" | "md" | "lg";
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
  labelPosition?: "top" | "bottom" | "right" | "inside";
  striped?: boolean;
  animated?: boolean;
  indeterminate?: boolean;
  steps?: ProgressStep[];
}

export interface ProgressStep {
  label: string;
  status?: "wait" | "process" | "finish" | "error";
  icon?: ReactNode;
  description?: string;
}

export interface SkeletonProps extends BaseComponentProps {
  variant?: "text" | "rect" | "circle" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  count?: number;
  spacing?: number;
}

export interface SpinnerProps extends BaseComponentProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "bars" | "ring";
  color?: string;
  label?: string;
  labelPosition?: "top" | "bottom" | "right" | "left";
  fullscreen?: boolean;
}

// ─── AVATAR ────────────────────────────────────────────────────

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square" | "rounded";
  variant?: "default" | "gradient" | "outlined" | "filled";
  color?: string;
  bgColor?: string;
  initials?: string;
  icon?: ReactNode;
  badge?: AvatarBadge;
  status?: "online" | "offline" | "away" | "busy";
  showStatus?: boolean;
  group?: AvatarGroupProps;
}

export interface AvatarBadge {
  content?: string | number;
  color?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  dot?: boolean;
  pulse?: boolean;
}

export interface AvatarGroupProps extends BaseComponentProps {
  avatars: AvatarProps[];
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  spacing?: "tight" | "normal" | "wide";
  showTotal?: boolean;
}

// ─── STAT & METRIC ─────────────────────────────────────────────

export interface StatCardProps extends CardProps {
  label: string;
  value: string | number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
  deltaDirection?: "up" | "down" | "neutral";
  deltaSuffix?: string;
  icon?: ReactNode;
  color?: string;
  trend?: number[];
  sparkline?: boolean;
  sparklineColor?: string;
  loading?: boolean;
  tooltip?: string;
  onClick?: () => void;
}

export interface KPIStripProps extends BaseComponentProps {
  items: StatCardProps[];
  columns?: number;
  gap?: "sm" | "md" | "lg";
  loading?: boolean;
}

// ─── LIST & FEED ───────────────────────────────────────────────

export interface ListProps extends BaseComponentProps {
  items: ListItem[];
  variant?: "default" | "compact" | "spaced" | "card";
  divided?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  selectedKey?: string;
  loading?: boolean;
  emptyMessage?: string;
  virtualized?: boolean;
  itemHeight?: number;
  overscan?: number;
  onSelect?: (item: ListItem) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  avatar?: AvatarProps;
  badge?: BadgeProps;
  tag?: TagProps;
  action?: ReactNode;
  metadata?: Record<string, unknown>;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  timestamp?: string;
  sentiment?: SentimentLabel;
  severity?: AlertSeverity;
  link?: string;
}

export interface FeedProps extends ListProps {
  realTime?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
  lastUpdated?: Date;
  showTimestamp?: boolean;
  showSource?: boolean;
  showSentiment?: boolean;
  filterable?: boolean;
  filterOptions?: SelectOption[];
}

// ─── SEARCH ────────────────────────────────────────────────────

export interface SearchBarProps extends InputProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  recentSearches?: string[];
  maxSuggestions?: number;
  showSuggestions?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
  searchOnType?: boolean;
  shortcut?: string;
  showShortcut?: boolean;
}

export interface CommandPaletteProps extends ModalProps {
  commands: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  maxResults?: number;
  recentCommands?: string[];
  categories?: string[];
  showRecentlyUsed?: boolean;
  onCommand?: (command: CommandItem) => void;
}

export interface CommandItem {
  id: string;
  label: string;
  category?: string;
  icon?: ReactNode;
  shortcut?: string;
  keywords?: string[];
  action: () => void;
  disabled?: boolean;
  group?: string;
}

// ─── DROPDOWN & MENU ───────────────────────────────────────────

export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode;
  items: MenuItem[];
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  alignment?: "start" | "end";
  width?: string | number;
  maxHeight?: string | number;
  closeOnSelect?: boolean;
  closeOnOutside?: boolean;
  closeOnEsc?: boolean;
  arrow?: boolean;
  bordered?: boolean;
  shadow?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  children?: MenuItem[];
  badge?: string | number;
}

export interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

export interface ContextMenuProps extends DropdownProps {
  x: number;
  y: number;
}

// ─── ACCORDION ─────────────────────────────────────────────────

export interface AccordionProps extends BaseComponentProps {
  items: AccordionItem[];
  defaultExpanded?: string[];
  expanded?: string[];
  multiple?: boolean;
  variant?: "default" | "card" | "plain" | "bordered";
  size?: "sm" | "md" | "lg";
  onChange?: (expandedKeys: string[]) => void;
  destroyInactive?: boolean;
}

export interface AccordionItem {
  id: string;
  header: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
  extra?: ReactNode;
}

// ─── TREE ──────────────────────────────────────────────────────

export interface TreeProps extends BaseComponentProps {
  data: TreeNode[];
  expandedKeys?: string[];
  selectedKeys?: string[];
  checkedKeys?: string[];
  multiple?: boolean;
  checkable?: boolean;
  draggable?: boolean;
  showLine?: boolean;
  showIcon?: boolean;
  blockNode?: boolean;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: string[];
  onExpand?: (keys: string[]) => void;
  onSelect?: (keys: string[]) => void;
  onCheck?: (keys: string[]) => void;
  onDragEnd?: (data: TreeDragData) => void;
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
}

export interface TreeNode {
  key: string;
  title: string;
  icon?: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  isLeaf?: boolean;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  loading?: boolean;
  metadata?: Record<string, unknown>;
}

export interface TreeDragData {
  node: TreeNode;
  dragNode: TreeNode;
  dropPosition: number;
  dropToGap?: boolean;
}

// ─── EMPTY STATES ──────────────────────────────────────────────

export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  image?: string;
  size?: "sm" | "md" | "lg";
  centered?: boolean;
}

export interface ErrorStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  error?: Error | string;
  action?: ReactNode;
  retryAction?: () => void;
  showDetails?: boolean;
}

// ─── THEME ─────────────────────────────────────────────────────

export interface ThemeProviderProps extends BaseComponentProps {
  theme?: "light" | "dark" | "auto";
  accountType?: AccountType;
  customColors?: Partial<Record<string, string>>;
  customTypography?: Partial<Record<string, string | number>>;
  customSpacing?: Partial<Record<string, number>>;
  customRadius?: Partial<Record<string, number>>;
  customShadows?: Partial<Record<string, string>>;
}

export interface ColorModeProps {
  mode: "light" | "dark";
  onToggle?: () => void;
  onChange?: (mode: "light" | "dark") => void;
}

// ─── LAYOUT ────────────────────────────────────────────────────

export interface LayoutProps extends BaseComponentProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  content?: ReactNode;
  sidebarPosition?: "left" | "right";
  sidebarWidth?: string | number;
  sidebarCollapsible?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  headerHeight?: string | number;
  footerHeight?: string | number;
  contentPadding?: string | number;
  maxWidth?: string | number;
  centered?: boolean;
  fullscreen?: boolean;
}

export interface GridProps extends BaseComponentProps {
  columns?: number;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
  minColumnWidth?: string | number;
  maxColumnWidth?: string | number;
  alignItems?: "start" | "center" | "end" | "stretch";
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

export interface StackProps extends BaseComponentProps {
  direction?: "horizontal" | "vertical";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  alignItems?: "start" | "center" | "end" | "stretch";
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
  divider?: ReactNode;
}

export interface ContainerProps extends BaseComponentProps {
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  centered?: boolean;
  fluid?: boolean;
}

// ─── UTILITIES ─────────────────────────────────────────────────

export interface DividerProps extends BaseComponentProps {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted" | "gradient";
  thickness?: number;
  color?: string;
  label?: string;
  labelPosition?: "left" | "center" | "right";
  spacing?: "sm" | "md" | "lg";
}

export interface SpacerProps extends BaseComponentProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  flex?: number;
  direction?: "horizontal" | "vertical";
}

export interface OverlayProps extends BaseComponentProps {
  open: boolean;
  onClose?: () => void;
  blur?: boolean;
  opacity?: number;
  color?: string;
  zIndex?: number;
}

export interface BackdropProps extends OverlayProps {
  animation?: "fade" | "slide" | "zoom" | "none";
  duration?: number;
}

// ─── SENTIMENT & RISK DISPLAY ──────────────────────────────────

export interface SentimentBadgeProps extends BadgeProps {
  sentiment: SentimentLabel;
  score?: number;
  showScore?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

export interface RiskLevelBadgeProps extends BadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  trajectory?: "rising" | "stable" | "falling";
  size?: "xs" | "sm" | "md" | "lg";
}

export interface SeverityBadgeProps extends BadgeProps {
  severity: AlertSeverity;
  size?: "xs" | "sm" | "md" | "lg";
  dot?: boolean;
  pulse?: boolean;
}

// ─── FORM ──────────────────────────────────────────────────────

export interface FormProps extends BaseComponentProps {
  onSubmit?: (data: Record<string, unknown>) => void;
  onError?: (errors: Record<string, string>) => void;
  onChange?: (data: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  validate?: (data: Record<string, unknown>) => Record<string, string>;
  resetOnSubmit?: boolean;
  submitOnEnter?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  warning?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  rules?: FormRule[];
  dependencies?: string[];
  shouldUpdate?: boolean;
  valuePropName?: string;
  trigger?: string;
  validateTrigger?: string | string[];
}

export interface FormRule {
  required?: boolean;
  message?: string;
  type?: "string" | "number" | "boolean" | "email" | "url" | "date";
  min?: number;
  max?: number;
  len?: number;
  pattern?: string;
  validator?: (value: unknown) => boolean | string;
  transform?: (value: unknown) => unknown;
  enum?: unknown[];
  whitespace?: boolean;
  fields?: Record<string, FormRule[]>;
}

// ─── EXPORTS ───────────────────────────────────────────────────

export const COMPONENT_VARIANTS = {
  button: ["primary", "secondary", "outline", "ghost", "danger", "success", "warning"],
  card: ["default", "outlined", "elevated", "filled"],
  badge: ["default", "primary", "success", "warning", "danger", "info", "outline"],
  alert: ["info", "success", "warning", "danger", "default"],
  input: ["default", "outlined", "filled", "underlined"],
  size: ["xs", "sm", "md", "lg", "xl"],
  shape: ["default", "rounded", "pill", "square", "circle"],
} as const;

export const SIZING = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 56,
} as const;

export const SPACING = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const SHADOWS = {
  none: "none",
  sm: "0 1px 3px rgba(0,0,0,0.04)",
  md: "0 4px 12px rgba(0,0,0,0.04)",
  lg: "0 8px 24px rgba(0,0,0,0.08)",
  xl: "0 16px 48px rgba(0,0,0,0.12)",
} as const;

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  drawer: 1060,
  popover: 1070,
  tooltip: 1080,
  toast: 1090,
  commandPalette: 1100,
  notification: 1110,
} as const;

export const SENTIMENT_COLORS_UI: Record<SentimentLabel, { bg: string; text: string; border: string }> = {
  positive: { bg: "rgba(5,150,105,0.08)", text: "#059669", border: "rgba(5,150,105,0.2)" },
  neutral: { bg: "rgba(115,115,115,0.08)", text: "#737373", border: "rgba(115,115,115,0.2)" },
  negative: { bg: "rgba(220,38,38,0.08)", text: "#DC2626", border: "rgba(220,38,38,0.2)" },
};

export const RISK_LEVEL_COLORS_UI: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  low: { bg: "rgba(5,150,105,0.08)", text: "#059669", border: "rgba(5,150,105,0.2)" },
  moderate: { bg: "rgba(133,105,20,0.08)", text: "#856914", border: "rgba(133,105,20,0.2)" },
  elevated: { bg: "rgba(217,119,6,0.08)", text: "#D97706", border: "rgba(217,119,6,0.2)" },
  high: { bg: "rgba(220,38,38,0.08)", text: "#DC2626", border: "rgba(220,38,38,0.2)" },
  critical: { bg: "rgba(127,29,29,0.12)", text: "#7F1D1D", border: "rgba(127,29,29,0.3)" },
};

export const SEVERITY_COLORS_UI: Record<AlertSeverity, { bg: string; text: string; border: string; dot: string }> = {
  info: { bg: "rgba(3,105,161,0.08)", text: "#0369A1", border: "rgba(3,105,161,0.2)", dot: "#0369A1" },
  low: { bg: "rgba(133,105,20,0.08)", text: "#856914", border: "rgba(133,105,20,0.2)", dot: "#856914" },
  medium: { bg: "rgba(217,119,6,0.08)", text: "#D97706", border: "rgba(217,119,6,0.2)", dot: "#D97706" },
  high: { bg: "rgba(220,38,38,0.08)", text: "#DC2626", border: "rgba(220,38,38,0.2)", dot: "#DC2626" },
  critical: { bg: "rgba(127,29,29,0.12)", text: "#7F1D1D", border: "rgba(127,29,29,0.3)", dot: "#7F1D1D" },
};

export function getSentimentColor(sentiment: SentimentLabel): { bg: string; text: string; border: string } {
  return SENTIMENT_COLORS_UI[sentiment] || SENTIMENT_COLORS_UI.neutral;
}

export function getRiskLevelColorUI(level: RiskLevel): { bg: string; text: string; border: string } {
  return RISK_LEVEL_COLORS_UI[level] || RISK_LEVEL_COLORS_UI.low;
}

export function getSeverityColor(severity: AlertSeverity): { bg: string; text: string; border: string; dot: string } {
  return SEVERITY_COLORS_UI[severity] || SEVERITY_COLORS_UI.info;
}

export function getSizeValue(size: keyof typeof SIZING): number {
  return SIZING[size] ?? SIZING.md;
}

export function getSpacingValue(spacing: keyof typeof SPACING): number {
  return SPACING[spacing] ?? SPACING.md;
}

export function getRadiusValue(radius: keyof typeof RADIUS): number {
  return RADIUS[radius] ?? RADIUS.md;
}

export function getShadowValue(shadow: keyof typeof SHADOWS): string {
  return SHADOWS[shadow] ?? SHADOWS.sm;
}

export function getZIndex(zIndex: keyof typeof Z_INDEX): number {
  return Z_INDEX[zIndex] ?? Z_INDEX.base;
}
