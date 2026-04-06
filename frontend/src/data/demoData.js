/**
 * Fixed demo data shown when the dashboard is opened for the first time
 * without any uploaded data. Keeps the dashboard looking polished and populated.
 */
export const DEMO_KPI_DATA = {
  profit_sum: 124756.5,
  revenue_sum: 498924.25,
  orders_sum: 2187,
  expense_sum: 374167.75,
  customers_sum: 91,
  source_currency: 'USD',

  // Line chart: Revenue & Profit over time (monthly aggregates)
  date_data: [
    '2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19',
    '2024-01-20', '2024-01-21', '2024-01-22', '2024-01-23', '2024-01-24',
    '2024-01-25', '2024-01-26', '2024-01-27', '2024-01-28', '2024-01-29',
    '2024-01-30', '2024-02-01', '2024-02-02', '2024-02-03', '2024-02-04',
    '2024-02-05', '2024-02-06', '2024-02-07', '2024-02-08', '2024-02-09',
    '2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13', '2024-02-14',
    '2024-02-15', '2024-02-16', '2024-02-17', '2024-02-18', '2024-02-19',
    '2024-02-20', '2024-02-21', '2024-02-22', '2024-02-23', '2024-02-24',
  ],
  revenue_data: [
    12500, 18900, 15200, 22100, 9800, 16750, 13400, 19800, 11200, 24500,
    15600, 17800, 10200, 21300, 14100, 18950, 12300, 20100, 15900, 22700,
    10800, 17500, 13200, 19400, 11600, 23800, 14800, 18200, 10500, 21600,
    16100, 19100, 12400, 20300, 13700, 18700, 11000, 22900, 15400, 17900,
  ],
  profit_data: [
    3125, 4725, 3800, 5525, 2450, 4187, 3350, 4950, 2800, 6125,
    3900, 4450, 2550, 5325, 3525, 4737, 3075, 5025, 3975, 5675,
    2700, 4375, 3300, 4850, 2900, 5950, 3700, 4550, 2625, 5400,
    4025, 4775, 3100, 5075, 3425, 4675, 2750, 5725, 3850, 4475,
  ],

  // Per-row product names (parallel to date_data/profit_data/revenue_data)
  product_data: [
    'Tablet Stand', 'USB-C Cable', 'Bluetooth Adapter', 'USB-C Adapter',
    'Wireless Headphones', 'Tablet Case', 'Bluetooth Speaker', 'Tablet Stand',
    'USB-C Cable', 'Tablet Stand', 'Bluetooth Adapter', 'Bluetooth Speaker',
    'Wireless Headphones', 'USB-C Adapter', 'Tablet Case', 'USB-C Cable',
    'Bluetooth Speaker', 'Tablet Case', 'Tablet Stand', 'USB-C Adapter',
    'Wireless Headphones', 'Bluetooth Adapter', 'USB-C Cable', 'Wireless Headphones',
    'Bluetooth Speaker', 'Tablet Case', 'Tablet Stand', 'USB-C Adapter',
    'Bluetooth Adapter', 'USB-C Cable', 'Tablet Case', 'Bluetooth Adapter',
    'Wireless Headphones', 'Tablet Stand', 'USB-C Cable', 'Bluetooth Speaker',
    'USB-C Adapter', 'Bluetooth Adapter', 'Tablet Case', 'Wireless Headphones',
  ],

  // Per-row order counts (parallel to date_data; proportional to revenue, matches orders_sum)
  orders_data: [
    41, 62, 50, 73, 32, 55, 44, 65, 37, 81, 52, 59, 34, 70, 47, 63, 41, 66, 53, 75,
    36, 58, 44, 64, 38, 79, 49, 60, 35, 71, 53, 63, 41, 67, 45, 62, 36, 76, 51, 59,
  ],

  // Orders overview spark / API shape: daily aggregates
  orders_trend: [
    { date: '2024-01-15', orders: 41 },
    { date: '2024-01-16', orders: 62 },
    { date: '2024-01-17', orders: 50 },
    { date: '2024-01-18', orders: 73 },
    { date: '2024-01-19', orders: 32 },
    { date: '2024-01-20', orders: 55 },
    { date: '2024-01-21', orders: 44 },
    { date: '2024-01-22', orders: 65 },
    { date: '2024-01-23', orders: 37 },
    { date: '2024-01-24', orders: 81 },
    { date: '2024-01-25', orders: 52 },
    { date: '2024-01-26', orders: 59 },
    { date: '2024-01-27', orders: 34 },
    { date: '2024-01-28', orders: 70 },
    { date: '2024-01-29', orders: 47 },
  ],

  // Comparing Bar Chart — current vs previous period sales (by product)
  comparison_bar_labels: ['Electronics', 'Office Supplies', 'Accessories'],
  comparison_bar_current: [239500, 185200, 74224],
  comparison_bar_previous: [198200, 162100, 61500],
  comparison_bar_has_previous: true,

  // Multi-Line Chart — Revenue, Orders, AOV (server-side aggregated by month)
  multiline_labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'],
  multiline_revenue: [241305, 595510, 320400, 275800, 310200, 289600],
  multiline_orders: [852, 2229, 1150, 980, 1120, 1040],
  multiline_aov: [283.22, 267.16, 278.61, 281.43, 277.0, 278.46],

  // Top 5 by profit (table)
  top5_profit: [
    {
      date: '2024-02-10',
      revenue: 23800,
      profit: 5950,
      orders: 82,
      expense: 17850,
      customer_name: 'Modern Solutions',
      category: 'Electronics',
      region: 'East',
      product_name: 'Tablet Case',
      order_id: 'ORD-2024-0040',
      sales_rep: 'Lucas Scott',
      payment_method: 'PayPal',
    },
    {
      date: '2024-01-24',
      revenue: 24500.5,
      profit: 6125.12,
      orders: 85,
      expense: 18375.38,
      customer_name: 'Advanced Systems',
      category: 'Electronics',
      region: 'East',
      product_name: 'Tablet Stand',
      order_id: 'ORD-2024-0024',
      sales_rep: 'Christopher Brown',
      payment_method: 'Credit Card',
    },
    {
      date: '2024-02-22',
      revenue: 22900,
      profit: 5725,
      orders: 79,
      expense: 17175,
      customer_name: 'Innovation Tech',
      category: 'Electronics',
      region: 'East',
      product_name: 'Bluetooth Adapter',
      order_id: 'ORD-2024-0052',
      sales_rep: 'Michael Parker',
      payment_method: 'PayPal',
    },
    {
      date: '2024-01-18',
      revenue: 22100.25,
      profit: 5525.06,
      orders: 78,
      expense: 16575.19,
      customer_name: 'Digital Ventures',
      category: 'Electronics',
      region: 'West',
      product_name: 'USB-C Cable',
      order_id: 'ORD-2024-0018',
      sales_rep: 'David Kim',
      payment_method: 'Credit Card',
    },
    {
      date: '2024-02-28',
      revenue: 20900,
      profit: 5225,
      orders: 72,
      expense: 15675,
      customer_name: 'Advanced Office',
      category: 'Electronics',
      region: 'West',
      product_name: 'USB-C Adapter',
      order_id: 'ORD-2024-0058',
      sales_rep: 'Matthew Morris',
      payment_method: 'PayPal',
    },
  ],
  top5_columns: [
    'date', 'revenue', 'profit', 'orders', 'expense', 'customer_name',
    'category', 'region', 'product_name', 'order_id', 'sales_rep', 'payment_method',
  ],

  // Donut chart: Category breakdown (Electronics vs Office Supplies)
  pie_column: 'category',
  pie_data: [
    { name: 'Electronics', value: 48 },
    { name: 'Office Supplies', value: 43 },
  ],

  // Geographic Map — Orders by region (order count + percentage of total)
  map_column: 'region',
  map_data: [
    { name: 'East', value: 994, percentage: 28.6, coordinates: [-75.5, 43.0] },
    { name: 'West', value: 944, percentage: 27.2, coordinates: [-119.4, 36.8] },
    { name: 'North', value: 777, percentage: 22.4, coordinates: [-98.0, 47.5] },
    { name: 'South', value: 756, percentage: 21.8, coordinates: [-86.9, 32.4] },
  ],

  // Revenue insights by column (for Revenue page donut: category, region, payment_method, product_name, subcategory)
  revenue_by_column: {
    category: [
      { name: 'Electronics', value: 239500 },
      { name: 'Office Supplies', value: 185200 },
      { name: 'Accessories', value: 74224 },
    ],
    region: [
      { name: 'East', value: 185420 },
      { name: 'West', value: 162840 },
      { name: 'South', value: 91820 },
      { name: 'North', value: 58844 },
    ],
    payment_method: [
      { name: 'Credit Card', value: 198200 },
      { name: 'PayPal', value: 152400 },
      { name: 'Cash on Delivery', value: 98400 },
      { name: 'Bank Transfer', value: 49924 },
    ],
    product_name: [
      { name: 'Tablet Stand', value: 24500 },
      { name: 'Tablet Case', value: 23800 },
      { name: 'Bluetooth Adapter', value: 22900 },
      { name: 'USB-C Cable', value: 22100 },
      { name: 'USB-C Adapter', value: 20900 },
      { name: 'Wireless Headphones', value: 19400 },
      { name: 'Bluetooth Speaker', value: 19800 },
    ],
    subcategory: [
      { name: 'Phones & Tablets', value: 125000 },
      { name: 'Computing', value: 98000 },
      { name: 'Office Furniture', value: 87200 },
      { name: 'Supplies', value: 65400 },
      { name: 'Other', value: 123324 },
    ],
  },

  // Bar chart: Top 6 products by revenue
  bar_column: 'product_name',
  bar_data: [
    { name: 'Tablet Stand', value: 24500 },
    { name: 'Tablet Case', value: 23800 },
    { name: 'Bluetooth Adapter', value: 22900 },
    { name: 'USB-C Cable', value: 22100 },
    { name: 'USB-C Adapter', value: 20900 },
    { name: 'Wireless Headphones', value: 19400 },
  ],

  // Profit Composition: Top 6 products by profit (used on Profit Insights page)
  profit_by_product_column: 'product_name',
  profit_by_product_data: [
    { name: 'Tablet Stand', value: 6125 },
    { name: 'Tablet Case', value: 5950 },
    { name: 'Bluetooth Adapter', value: 5725 },
    { name: 'USB-C Cable', value: 5525 },
    { name: 'USB-C Adapter', value: 5225 },
    { name: 'Wireless Headphones', value: 4850 },
  ],
}
