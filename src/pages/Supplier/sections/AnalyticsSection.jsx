// src/pages/dashboard/AnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  MonetizationOn,
  Inventory2,
  Warning,
  Insights,
  Height,
  BarChart,
  PieChart as PieIcon,
  Add,
} from "@mui/icons-material";

// Chart.js
import "chart.js/auto";
import { Line, Bar, Pie } from "react-chartjs-2";

const API_BASE = import.meta.env.VITE_API_URL || "https://storensupply.com";

export default function AnalyticsDashboard() {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState({ bestSelling: [], mostProfitable: [], categories: [] });
  const [inventory, setInventory] = useState([]);
  const [profitInsights, setProfitInsights] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [error, setError] = useState(null);

  // Auth / protection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchAll(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authHeaders = (token) => ({ 
    headers: { Authorization: `Bearer ${token}` } 
  });

  async function fetchAll(token) {
    setLoading(true);
    setError(null);
    
    try {
      const base = `${API_BASE}/analytics`;
      
      console.log("🔍 Fetching analytics data...");
      console.log("📍 API Base:", base);
      
      // Parallel requests - NO supplierId in URL, token handles authentication
      const [
        kpisRes,
        salesRes,
        topRes,
        inventoryRes,
        profitRes,
        alertsRes,
        heatmapRes,
      ] = await Promise.all([
        axios.get(`${base}/kpis`, authHeaders(token)),
        axios.get(`${base}/sales-trend?period=30`, authHeaders(token)),
        axios.get(`${base}/top-products`, authHeaders(token)),
        axios.get(`${base}/inventory`, authHeaders(token)),
        axios.get(`${base}/profit-insights`, authHeaders(token)),
        axios.get(`${base}/alerts`, authHeaders(token)),
        axios.get(`${base}/heatmap?period=30`, authHeaders(token)),
      ]);

      console.log("✅ KPIs:", kpisRes.data);
      console.log("✅ Sales Trend:", salesRes.data.length, "days");
      console.log("✅ Top Products:", topRes.data);
      console.log("✅ Inventory:", inventoryRes.data.length, "items");
      console.log("✅ Alerts:", alertsRes.data);

      setKpis(kpisRes.data || {});
      setSalesTrend(Array.isArray(salesRes.data) ? salesRes.data : []);
      setTopProducts(topRes.data || { bestSelling: [], mostProfitable: [], categories: [] });
      setInventory(inventoryRes.data || []);
      setProfitInsights(profitRes.data || {});
      setAlerts(alertsRes.data || {});
      setHeatmap(heatmapRes.data || {});
      
      console.log("🎉 All analytics data loaded successfully");
    } catch (err) {
      console.error("❌ Analytics fetch error:", err);
      console.error("Error details:", err.response?.data);
      console.error("Status:", err.response?.status);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(err.response?.data?.message || "Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  }

  // ---------- Chart Data builders ----------

  const salesLineData = {
    labels: salesTrend.map((r) => {
      const d = new Date(r.date);
      return isNaN(d) ? r.date : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }),
    datasets: [
      {
        label: "Total Sales ($)",
        data: salesTrend.map((r) => Number(r.total_sales || 0)),
        tension: 0.3,
        fill: true,
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        borderColor: "rgba(25, 118, 210, 1)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "rgba(25, 118, 210, 1)",
      },
    ],
  };

  const salesLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true, position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => `Sales: $${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { 
        ticks: { 
          beginAtZero: true,
          callback: (value) => `$${value.toLocaleString()}`
        } 
      },
    },
  };

  const topProdBarData = {
    labels: topProducts.bestSelling.map((p) => p.title || `Product #${p.id}`),
    datasets: [
      {
        label: "Units Sold",
        data: topProducts.bestSelling.map((p) => Number(p.total_quantity || 0)),
        backgroundColor: "rgba(76, 175, 80, 0.7)",
        borderColor: "rgba(76, 175, 80, 1)",
        borderWidth: 1,
      },
    ],
  };

  const topProdBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { beginAtZero: true } }
    }
  };

  const categoriesPieData = {
    labels: topProducts.categories.map((c) => c.category || "Uncategorized"),
    datasets: [
      {
        data: topProducts.categories.map((c) => Number(c.sales_value || 0)),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoriesPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  // ---------- UI pieces ----------

  const KpiCard = ({ title, value, icon, colorScheme = "primary" }) => {
    const colorMap = {
      primary: "#1976d2",
      success: "#2e7d32",
      warning: "#ed6c02",
      error: "#d32f2f",
      info: "#0288d1",
    };

    return (
      <Card sx={{ minWidth: 180, flex: 1, boxShadow: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ fontSize: 32, color: colorMap[colorScheme] || colorMap.primary }}>
              {icon}
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {title}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {typeof value === "number" 
                  ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : value ?? "-"}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // ---------- Render ----------

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2} color="text.secondary">
          Loading Analytics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error Loading Analytics</Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }
  

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📊 Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Comprehensive insights into your store performance
      </Typography>

      {/* KPI ROW */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            title="Total Sales Value"
            value={`$${kpis?.total_sales_value ?? 0}`}
            icon={<MonetizationOn />}
            colorScheme="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard 
            title="Total Profit" 
            value={`$${kpis?.total_profit ?? 0}`}
            icon={<TrendingUp />} 
            colorScheme="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard 
            title="Stock Value" 
            value={`$${kpis?.stock_value ?? 0}`}
            icon={<Inventory2 />} 
            colorScheme="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            title="Profit Margin"
            value={`${kpis?.profit_margin ?? 0}%`}
            icon={<Insights />}
            colorScheme="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            title="Out of Stock %"
            value={`${kpis?.out_of_stock_percentage ?? 0}%`}
            icon={<Warning />}
            colorScheme="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Trend */}
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Height color="action" />
                  <Typography variant="h6" fontWeight="bold">Sales Trend</Typography>
                </Stack>
                <Chip label="Last 30 Days" size="small" color="primary" />
              </Stack>

              {salesTrend.length === 0 ? (
                <Box py={10} textAlign="center">
                  <Typography color="text.secondary" variant="h6">
                    📉 No sales data available
                  </Typography>
                  <Typography color="text.secondary" variant="body2" mt={1}>
                    Sales will appear here once you start recording transactions
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ height: 320 }}>
                  <Line data={salesLineData} options={salesLineOptions} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products & Categories */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <BarChart color="action" />
                  <Typography variant="h6" fontWeight="bold">Top 5 Best-Selling</Typography>
                </Stack>

                {topProducts.bestSelling?.length === 0 ? (
                  <Box py={5} textAlign="center">
                    <Typography color="text.secondary">
                      🏆 No product sales yet
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ height: 220 }}>
                    <Bar data={topProdBarData} options={topProdBarOptions} />
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <PieIcon color="action" />
                  <Typography variant="h6" fontWeight="bold">Category Distribution</Typography>
                </Stack>

                {topProducts.categories?.length === 0 ? (
                  <Box py={5} textAlign="center">
                    <Typography color="text.secondary">
                      📊 No category data
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ height: 220 }}>
                    <Pie data={categoriesPieData} options={categoriesPieOptions} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Inventory Table */}
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Inventory2 color="action" />
                <Typography variant="h6" fontWeight="bold">Inventory Overview</Typography>
              </Stack>

              {inventory.length === 0 ? (
                <Box py={5} textAlign="center">
                  <Typography color="text.secondary" variant="h6">
                    📦 No inventory data
                  </Typography>
                  <Typography color="text.secondary" variant="body2" mt={1}>
                    Add products to see inventory details
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell align="right"><strong>Stock</strong></TableCell>
                        <TableCell align="right"><strong>Unit Cost</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell align="right"><strong>Age (days)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventory.map((r) => (
                        <TableRow key={r.id} hover>
                          <TableCell>{r.title}</TableCell>
                          <TableCell align="right">{r.stock_quantity}</TableCell>
                          <TableCell align="right">
                            ${Number(r.supplier_purchase_price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={r.stock_status}
                              size="small"
                              color={
                                r.stock_status === "Out of Stock"
                                  ? "error"
                                  : r.stock_status === "Low Stock"
                                  ? "warning"
                                  : "success"
                              }
                            />
                          </TableCell>
                          <TableCell align="right">{r.age_in_days}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profit Insights and Alerts */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Insights color="action" />
                  <Typography variant="h6" fontWeight="bold">Profitability Insights</Typography>
                </Stack>

                {(!profitInsights || (!profitInsights.highestMargin && profitInsights.noSales?.length === 0)) ? (
                  <Box py={3} textAlign="center">
                    <Typography color="text.secondary">
                      💡 No insights available yet
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {profitInsights.highestMargin ? (
                      <Box mb={2} p={2} bgcolor="#f0f7ff" borderRadius={2}>
                        <Typography variant="subtitle2" color="text.secondary">
                          🏆 Highest Margin Product
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" mt={0.5}>
                          {profitInsights.highestMargin.title}
                        </Typography>
                        <Chip 
                          label={`${profitInsights.highestMargin.margin_percent}% margin`}
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    ) : null}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                      ⚠️ Products with No Sales
                    </Typography>
                    {profitInsights.noSales?.length === 0 ? (
                      <Typography color="success.main" variant="body2">
                        ✓ Great! All products have sales
                      </Typography>
                    ) : (
                      <Stack spacing={0.5} maxHeight={200} overflow="auto">
                        {profitInsights.noSales.slice(0, 10).map((p) => (
                          <Box 
                            key={p.id} 
                            display="flex" 
                            justifyContent="space-between" 
                            py={1}
                            px={1.5}
                            bgcolor="#fff3e0"
                            borderRadius={1}
                          >
                            <Typography variant="body2">{p.title}</Typography>
                            <Chip label="0 sales" size="small" color="warning" />
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Warning color="action" />
                  <Typography variant="h6" fontWeight="bold">Alerts & Notifications</Typography>
                </Stack>

                {!alerts ? (
                  <Box py={3} textAlign="center">
                    <Typography color="text.secondary">🔔 No alerts</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {/* Low Stock */}
                    <Box>
                      <Typography variant="subtitle2" color="warning.main" mb={1}>
                        ⚠️ Low Stock (&lt; 5 units)
                      </Typography>
                      {alerts.low_stock?.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          All items well stocked
                        </Typography>
                      ) : (
                        <Stack spacing={0.5} maxHeight={120} overflow="auto">
                          {alerts.low_stock.map((r) => (
                            <Box 
                              key={r.id} 
                              display="flex" 
                              justifyContent="space-between" 
                              py={0.5}
                              px={1}
                              bgcolor="#fff3e0"
                              borderRadius={1}
                            >
                              <Typography variant="body2">{r.title}</Typography>
                              <Chip 
                                label={`${r.stock_quantity} left`} 
                                size="small" 
                                color="warning"
                              />
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <Divider />

                    {/* Out of Stock */}
                    <Box>
                      <Typography variant="subtitle2" color="error.main" mb={1}>
                        🚫 Out of Stock
                      </Typography>
                      {alerts.out_of_stock?.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No items out of stock
                        </Typography>
                      ) : (
                        <Stack spacing={0.5} maxHeight={120} overflow="auto">
                          {alerts.out_of_stock.map((r) => (
                            <Box 
                              key={r.id} 
                              py={0.5}
                              px={1}
                              bgcolor="#ffebee"
                              borderRadius={1}
                            >
                              <Typography variant="body2">{r.title}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <Divider />

                    {/* Aging Inventory */}
                    <Box>
                      <Typography variant="subtitle2" color="info.main" mb={1}>
                        📅 Aging Inventory (&gt; 30 days)
                      </Typography>
                      {alerts.aging_inventory?.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No aging inventory
                        </Typography>
                      ) : (
                        <Stack spacing={0.5} maxHeight={120} overflow="auto">
                          {alerts.aging_inventory.map((r) => (
                            <Box 
                              key={r.id} 
                              display="flex" 
                              justifyContent="space-between" 
                              py={0.5}
                              px={1}
                              bgcolor="#e3f2fd"
                              borderRadius={1}
                            >
                              <Typography variant="body2">{r.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {r.days_unsold} days
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <Divider />

                    {/* High Profit */}
                    <Box>
                      <Typography variant="subtitle2" color="success.main" mb={1}>
                        💰 High Margin Products (&gt; 40%)
                      </Typography>
                      {alerts.high_profit?.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No high margin products
                        </Typography>
                      ) : (
                        <Stack spacing={0.5} maxHeight={120} overflow="auto">
                          {alerts.high_profit.map((r) => (
                            <Box 
                              key={r.id} 
                              display="flex" 
                              justifyContent="space-between" 
                              py={0.5}
                              px={1}
                              bgcolor="#e8f5e9"
                              borderRadius={1}
                            >
                              <Typography variant="body2">{r.title}</Typography>
                              <Chip 
                                label={`${r.margin_percent}%`} 
                                size="small" 
                                color="success"
                              />
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Heatmap summary (daily + hourly) */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <BarChart color="action" />
                <Typography variant="h6" fontWeight="bold">Sales Time Insights</Typography>
              </Stack>

              {!heatmap || (!heatmap.daily_sales?.length && !heatmap.hourly_sales?.length) ? (
                <Box py={5} textAlign="center">
                  <Typography color="text.secondary" variant="h6">
                    📊 No time-based data available
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                      📅 Sales by Weekday
                    </Typography>
                    {heatmap.daily_sales?.length > 0 ? (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {heatmap.daily_sales.map((d, i) => (
                          <Chip
                            key={i}
                            label={`${d.day}: ${Number(d.total_sales || 0).toLocaleString()}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No daily data
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                      ⏰ Sales by Hour
                    </Typography>
                    {heatmap.hourly_sales?.length > 0 ? (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", maxHeight: 150, overflow: "auto" }}>
                        {heatmap.hourly_sales.map((h, i) => (
                          <Chip
                            key={i}
                            label={`${h.hour}:00 - ${Number(h.total_sales || 0).toLocaleString()}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hourly data
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Box mt={4}>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => window.location.href = "/add-product"}
              >
                Add Product
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Inventory2 />}
                onClick={() => window.location.href = "/inventory"}
              >
                View Inventory
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<MonetizationOn />}
                onClick={() => window.location.href = "/add-sale"}
              >
                Record Sale
              </Button>
              <Button 
                variant="outlined"
                color="info"
                onClick={() => window.location.reload()}
              >
                Refresh Data
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}