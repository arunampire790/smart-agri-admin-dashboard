// Tasks page — filled during page translation.
export default {
  en: {
    // Header
    title: 'Task Management',
    subtitle: 'Assign and track agricultural tasks',
    assignTask: 'Assign Task',
    // Stat cards
    totalTasks: 'Total Tasks',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    // Tabs
    tabAll: 'All',
    // Search
    searchPlaceholder: 'Search tasks by title or assignee...',
    searchAriaLabel: 'Search tasks',
    // Filters
    filterPriority: 'PRIORITY',
    filterType: 'TYPE',
    filterAssignedTo: 'ASSIGNED TO',
    // Results count
    showingPrefix: 'Showing',
    showingMid: 'of',
    showingSuffix: 'tasks',
    clearFilters: 'Clear Filters',
    // Table headers
    colTask: 'Task',
    colAssignedTo: 'Assigned to',
    colFarm: 'Farm',
    colType: 'Type',
    colPriority: 'Priority',
    colDueDate: 'Due date',
    colAction: 'Action',
    // Empty state
    emptyTitle: 'No tasks match your current filters',
    emptySubtitle: 'Try adjusting or clearing your filters',
    // Action buttons
    start: 'Start',
    complete: 'Complete',
    delete: 'Delete',
    deleteTooltip: 'Delete task',
    // Modal
    modalSubtitle: 'Schedule a new farming operation.',
    taskDetails: 'Task Details',
    fieldTaskTitle: 'Task Title',
    taskTitlePlaceholder: 'e.g., Irrigate plot 4',
    fieldAssignedTo: 'Assigned To',
    selectUserPlaceholder: 'Select a user',
    fieldFarmSector: 'Farm Sector',
    selectFarmPlaceholder: 'Select a farm',
    fieldType: 'Type',
    selectTypePlaceholder: 'Select type',
    fieldDueDate: 'Due Date',
    fieldFertilizerLevel: 'Fertilizer Level',
    fertilizerPlaceholder: 'Enter amount in liters (e.g. 25.5)',
    fieldWaterQuantity: 'Water Quantity',
    waterPlaceholder: 'Enter amount in liters (e.g. 100.0)',
    fieldPriorityTier: 'Priority Tier',
    cancel: 'Cancel',
    // Validation errors
    errTitleRequired: 'Task title is required',
    errAssigneeRequired: 'Select an assignee',
    errFarmRequired: 'Select a farm',
    errDueDateRequired: 'Select a due date',
    errFertilizerInvalid: 'Please enter a valid fertilizer amount in liters',
    errFertilizerNegative: 'Fertilizer amount cannot be negative',
    errWaterInvalid: 'Please enter a valid water quantity in liters',
    errWaterNegative: 'Water quantity cannot be negative',
  },
  ja: {
    // Header
    title: 'タスク管理',
    subtitle: '農作業タスクの割り当てと追跡',
    assignTask: 'タスクを割り当て',
    // Stat cards
    totalTasks: '総タスク数',
    pending: '保留中',
    inProgress: '進行中',
    completed: '完了',
    // Tabs
    tabAll: 'すべて',
    // Search
    searchPlaceholder: 'タイトルまたは担当者でタスクを検索...',
    searchAriaLabel: 'タスクを検索',
    // Filters
    filterPriority: '優先度',
    filterType: '種類',
    filterAssignedTo: '担当者',
    // Results count
    showingPrefix: '表示中',
    showingMid: '/',
    showingSuffix: '件のタスク',
    clearFilters: 'フィルターをクリア',
    // Table headers
    colTask: 'タスク',
    colAssignedTo: '担当者',
    colFarm: '農場',
    colType: '種類',
    colPriority: '優先度',
    colDueDate: '期限',
    colAction: '操作',
    // Empty state
    emptyTitle: '現在のフィルターに一致するタスクはありません',
    emptySubtitle: 'フィルターを調整またはクリアしてください',
    // Action buttons
    start: '開始',
    complete: '完了',
    delete: '削除',
    deleteTooltip: 'タスクを削除',
    // Modal
    modalSubtitle: '新しい農作業を予定します。',
    taskDetails: 'タスクの詳細',
    fieldTaskTitle: 'タスク名',
    taskTitlePlaceholder: '例: 区画4の灌漑',
    fieldAssignedTo: '担当者',
    selectUserPlaceholder: 'ユーザーを選択',
    fieldFarmSector: '農場区画',
    selectFarmPlaceholder: '農場を選択',
    fieldType: '種類',
    selectTypePlaceholder: '種類を選択',
    fieldDueDate: '期限',
    fieldFertilizerLevel: '肥料の量',
    fertilizerPlaceholder: 'リットル単位で入力 (例: 25.5)',
    fieldWaterQuantity: '水の量',
    waterPlaceholder: 'リットル単位で入力 (例: 100.0)',
    fieldPriorityTier: '優先度レベル',
    cancel: 'キャンセル',
    // Validation errors
    errTitleRequired: 'タスク名は必須です',
    errAssigneeRequired: '担当者を選択してください',
    errFarmRequired: '農場を選択してください',
    errDueDateRequired: '期限を選択してください',
    errFertilizerInvalid: '有効な肥料の量をリットル単位で入力してください',
    errFertilizerNegative: '肥料の量に負の値は指定できません',
    errWaterInvalid: '有効な水の量をリットル単位で入力してください',
    errWaterNegative: '水の量に負の値は指定できません',
  },
};
