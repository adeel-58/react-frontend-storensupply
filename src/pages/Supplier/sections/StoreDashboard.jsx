// SupplierDashboard.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import {
  Inventory2,
  Warning,
  TrendingUp,
  MonetizationOn,
  PieChart as PieIcon,
  Insights,
  BarChart as BarIcon,
  Height,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { FormControl, Select, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const COLORS = ["#00C49F", "#FF8042", "#1976d2", "#6d4c41", "#2e7d32"];

/**
 * SupplierDashboard
 * Simplified dashboard:
 * - KPIs (Total Products, Out of Stock, Total Sales (Month), Total Profit (Month), Inventory Value)
 * - Highest margin product
 * - Sales Trend (last 7 days), Top 5 best-selling (bar), Store Overview (pie)
 * - Inventory overview table
 * - Alerts: Low Stock (<5) and Out of Stock
 * - Products with No Sales
 */
export default function SupplierDashboard() {
  // ------------- State -------------
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalSales: 0,
    totalProfit: 0,
    inventoryValue: 0,
    uploadLimit: 0,
    planName: "Free Plan",
  });
  
  const [salesTrend, setSalesTrend] = useState([]); // [{date, sales}]
  const [topProducts, setTopProducts] = useState([]); // [{title, total_quantity}]
  const [stockData, setStockData] = useState([]); // pie
  const [inventory, setInventory] = useState([]); // inventory rows
  const [profitInsights, setProfitInsights] = useState({ highestMargin: null, noSales: [] });
  const [alerts, setAlerts] = useState({ low_stock: [], out_of_stock: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allSalesTrend, setAllSalesTrend] = useState([]);
  //const [salesTrend, setSalesTrend] = useState([]);      
  const [salesFilter, setSalesFilter] = useState("7days");


  const filterSalesTrend = (filter, data = allSalesTrend) => {
    setSalesFilter(filter);
    const now = new Date();
    let filtered = [];

    if (filter === "7days") {
      // last 7 days (including today)
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 6);

      filtered = data
        .filter(item => new Date(item.date) >= weekAgo && new Date(item.date) <= now)
        .map(item => ({
          // keep both date + time for uniqueness
          date: new Date(item.date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          sales: item.sales,
        }));

    } else if (filter === "daily") {
      // today’s sales
      filtered = data
        .filter(item => new Date(item.date).toDateString() === now.toDateString())
        .map(item => ({
          date: new Date(item.date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sales: item.sales,
        }));

    } else if (filter === "monthly") {
      // current month sales
      filtered = data
        .filter(item => {
          const d = new Date(item.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .map(item => ({
          date: new Date(item.date).toLocaleDateString("en-US", { day: "numeric" }),
          sales: item.sales,
        }));
    }

    setSalesTrend(filtered);
  };


  // ------------- Effects & API -------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchAllData(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchAllData = async (token) => {
    setLoading(true);
    setError(null);

    try {
      const storeRes = await axios.get(`${API_URL}/dashboard/store`, authHeaders(token));

      if (storeRes.data.success) {
        const uploadLimit = Number(storeRes.data.stats?.uploadLimit || 0);
        const totalProducts = Number(storeRes.data.stats?.totalProducts || 0);

        // Pie: listed vs remaining
        const stockOverview = [
          { name: "Products Listed", value: totalProducts },
          { name: "Remaining Slots", value: Math.max(uploadLimit - totalProducts, 0) },
        ];

        setStats({
          totalProducts,
          outOfStock: Number(storeRes.data.stats?.outOfStock || 0),
          totalSales: Number(storeRes.data.stats?.totalSales || 0),
          totalProfit: Number(storeRes.data.stats?.totalProfit || 0),
          inventoryValue: Number(storeRes.data.stats?.remainingInventory || 0),
          uploadLimit,
          planName: storeRes.data.stats?.planName || "Free Plan",
        });

        setSalesTrend(
          (storeRes.data.charts?.salesTrend || []).map((item) => ({
            date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            sales: Number(item.sales || 0),
          }))
        );

        setTopProducts(
          (storeRes.data.charts?.topProducts || []).slice(0, 5).map((p, i) => ({
            title: shortenName(p.name),
            total_quantity: Number(p.totalSold || 0),
            id: i,
          }))
        );

        setStockData(stockOverview);
      }
      const rawSales = (storeRes.data.charts?.salesTrend || []).map((item) => ({
        date: new Date(item.date),
        sales: Number(item.sales || 0),
      }));

      setAllSalesTrend(rawSales);
      filterSalesTrend("7days", rawSales);


      // Analytics endpoints
      const base = `${API_URL}/analytics`;
      const [
        kpisRes,
        inventoryRes,
        profitRes,
        alertsRes,
      ] = await Promise.all([
        axios.get(`${base}/kpis`, authHeaders(token)).catch(() => ({ data: {} })),
        axios.get(`${base}/inventory`, authHeaders(token)).catch(() => ({ data: [] })),
        axios.get(`${base}/profit-insights`, authHeaders(token)).catch(() => ({ data: {} })),
        axios.get(`${base}/alerts`, authHeaders(token)).catch(() => ({ data: {} })),
      ]);

      // inventory (array), profit insights, alerts
      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
      setProfitInsights(profitRes.data || { highestMargin: null, noSales: [] });
      setAlerts(alertsRes.data || { low_stock: [], out_of_stock: [] });
    } catch (err) {
      console.error("Dashboard load failed:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }, 1000);
      } else {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------- Helpers -------------
  const shortenName = (name) => {
    if (!name) return "Unnamed";
    const words = name.split(" ");
    const truncated = words.slice(0, 3).join(" ");
    return truncated.length > 20 ? truncated.slice(0, 20) + "…" : truncated;
  };

  const currency = (v) => `$${Number(v || 0).toLocaleString()}`;

  // ------------- Loading / Error UI -------------
  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center" minHeight="60vh">
        <CircularProgress size={56} />
        <Typography variant="h6" mt={2} color="text.secondary">
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error Loading Dashboard</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }
  const calculatePM = (profit, sales) => {
    if (!sales || sales === 0) return "0%";
    return ((profit / sales) * 100).toFixed(2) + "%";
  };
  // ------------- Render -------------
  return (
    <Box p={0} sx={{ px: 0 }}>
      {/* Header */}
      <Box
        sx={{
          height: 45,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#D4AF37",
          mt: 0,
          gap: 5, // spacing between items
          flexWrap: "wrap", // wrap if screen is small
        }}
      >
        <Typography variant="body2" color="black" >
          Active Plan: <strong>{stats.planName}</strong> | Upload Limit: <strong>{stats.uploadLimit}</strong>
        </Typography>

        {/* Inline Warning if product limit reaches 80% */}
        {stats.totalProducts / stats.uploadLimit >= 0.8 && (
          <Typography variant="body2" color="error" sx={{ fontWeight: "bold" }}>
            You have used {Math.round((stats.totalProducts / stats.uploadLimit) * 100)}% of your product limit.{" "}
            <Link
              to="/plans"
              style={{ textDecoration: "underline", color: "#000000ff" }}
            >
              See Plans
            </Link>
          </Typography>
        )}
      </Box>



      {/* KPI Row */}
      <Box
        sx={{
          width: "100%",
          height: 130,
          bgcolor: "#1a1a1a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          borderRadius: 0,
          p: 3,
        }}
      >
        <Box textAlign="center">
          <Typography variant="body2">TOTAL PRODUCTS</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#D4AF37" }}>{stats.totalProducts}</Typography>
        </Box>

        <Box textAlign="center">
          <Typography variant="body2">PROFIT MARGIN (LAST 30 DAYS)</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#D4AF37" }}>
            {calculatePM(stats.totalProfit, stats.totalSales)}
          </Typography>
        </Box>

        <Box textAlign="center">
          <Typography variant="body2">TOTAL SALES (LAST 30 DAYS)</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#D4AF37" }}>{currency(stats.totalSales)}</Typography>
        </Box>

        <Box textAlign="center">
          <Typography variant="body2">NET PROFIT (LAST 30 DAYS)</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#D4AF37" }}>{currency(stats.totalProfit)}</Typography>
        </Box>

        <Box textAlign="center">
          <Typography variant="body2">INVENTORY VALUE</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#D4AF37" }}>{currency(stats.inventoryValue)}</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 17, pt: 13, pb: 5, }}>
        <Grid container spacing={3}  >
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={6} sx={{ width: "40%" }}  >
            <Stack spacing={3}>
              {/* Wrapper to handle badge + card */}
              <Box sx={{ position: "relative", display: "inline-block" }}>
                {/* Badge outside the card */}
                <Box
                  component="img"
                  src="/highest-margin.png"
                  alt="Highest Margin Product"
                  sx={{
                    width: 150,
                    position: "absolute",
                    top: -60,
                    left: -60,
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                />
                {/* Card */}
                <Card
                  sx={{
                    height: 500,
                    position: "relative",
                    overflow: "hidden", // ✅ Allow border radius properly
                    //borderRadius: 3,
                    // boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  {profitInsights?.highestMargin ? (
                    <>
                      <Box
                        component="img"
                        src={`https://storensupply.com${profitInsights.highestMargin.main_image}`}
                        alt={profitInsights.highestMargin.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "brightness(0.9)",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          height: 120,
                          bottom: 0,
                          width: "100%",
                          bgcolor: "#d4af3788",
                          color: "#000000ff",
                          textAlign: "center",
                          py: 2,
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: "24px" }}>
                          {profitInsights.highestMargin.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "17px" }}>
                          {profitInsights.highestMargin.margin_percent}% margin
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Box p={3}>
                      <Typography color="text.secondary">No data available</Typography>
                    </Box>
                  )}
                </Card>
              </Box>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={6} sx={{ width: "57%" }}>
            <Stack spacing={3}>

              {/* Sales Trend Chart */}



              <Card sx={{ height: 240, position: "relative" }}>
                <CardContent sx={{ height: "100%", position: "relative" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight="bold">
                      Sales Trend
                    </Typography>

                    {/* Material-UI Select Filter */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={salesFilter}
                        onChange={(e) => filterSalesTrend(e.target.value)}
                        sx={{
                          fontSize: "14px",
                          backgroundColor: "#1a1a1a",
                          color: "#fff",
                          "& .MuiSvgIcon-root": { color: "#fff" },
                        }}
                      >
                        <MenuItem value="7days">Weekly</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ height: "calc(100% - 32px)" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" style={{ fontSize: "14px", fill: "#000" }} />
                        <YAxis style={{ fontSize: "14px", fill: "#000" }}
                          tickFormatter={(value) =>
                            value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value}`
                          } />
                        <ReTooltip />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#D4AF37"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>


              {/* Best Selling Products Chart */}
              <Card sx={{ height: 240 }}>
                <CardContent sx={{ height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold">Top 5 Best-Selling Products</Typography>
                  <Box sx={{ height: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" style={{ fontSize: "14px" }} />
                        <YAxis dataKey="title" type="category" width={100} style={{ fontSize: "14px" }} />
                        <ReTooltip />
                        <Bar dataKey="total_quantity" fill="#D4AF37" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Grid item xs={12} mt={1} sx={{ width: "100%" }}>
        <Grid container spacing={3}>
          {/* inventtory overview card */}
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">Inventory Overview</Typography>
              {inventory.length === 0 ? (
                <Typography color="text.secondary" mt={2}>No inventory data</Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table
                    size="small"
                    stickyHeader
                    sx={{
                      borderCollapse: "separate",
                      borderSpacing: "0 8px", // spacing between rows
                      "& .MuiTableCell-root": {
                        borderBottom: "none", // remove bottom line
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell align="right"><strong>Stock</strong></TableCell>
                        <TableCell align="right"><strong>Unit Cost</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventory.map((item) => (
                        <TableRow
                          key={item.id}
                          sx={{
                            backgroundColor: "#f9f9f9",
                            //borderRadius: 2,
                          }}
                        >
                          <TableCell>{item.title}</TableCell>
                          <TableCell align="right">{item.stock_quantity}</TableCell>
                          <TableCell align="right">{currency(item.supplier_purchase_price)}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.stock_status}
                              size="small"
                              sx={{
                                backgroundColor:
                                  item.stock_status === "Out of Stock"
                                    ? "#e74c3c"
                                    : item.stock_status === "Low Stock"
                                      ? "black"
                                      : "#D4AF37",
                                color: "white",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

        </Grid>
      </Grid>


      <Grid container mt={4} mb={5} justifyContent="center">
        <Grid item xs={12}>
          <Box
            display="flex"
            gap={2}
            justifyContent="center"
            sx={{
              px: 4, // padding left-right
              pt: 2  // padding top
            }}
          >

            {/* Low Stock */}
            <Card sx={{ flex: 1, width: 580 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1a1a1a" }}>
                  ⚠️ Low Stock (&lt; 5 units)
                </Typography>
                {alerts.low_stock.length === 0 ? (
                  <Typography sx={{ color: "gray", mt: 1 }}>All items well stocked</Typography>
                ) : (
                  alerts.low_stock.map((item) => (
                    <Box key={item.id} display="flex" justifyContent="space-between" mt={1}>
                      <Typography sx={{ fontSize: 14 }}>{item.title}</Typography>
                      <Chip
                        label={`${item.stock_quantity} left`}
                        size="small"
                        sx={{ backgroundColor: "black", color: "white", fontSize: 12 }}
                      />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Out of Stock */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1a1a1a" }}>
                  🚫 Out of Stock
                </Typography>
                {alerts.out_of_stock.length === 0 ? (
                  <Typography sx={{ color: "gray", mt: 1 }}>No items out of stock</Typography>
                ) : (
                  alerts.out_of_stock.map((item) => (
                    <Typography key={item.id} sx={{ mt: 1, fontSize: 14 }}>
                      {item.title}
                    </Typography>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Products with No Sales */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1a1a1a" }}>
                  ⚠️ Products with No Sales
                </Typography>
                {profitInsights.noSales?.length === 0 ? (
                  <Typography sx={{ color: "green", mt: 1 }}>✅ All products have sales</Typography>
                ) : (
                  profitInsights.noSales.map((item) => (
                    <Box key={item.id} display="flex" justifyContent="space-between" mt={1}>
                      <Typography sx={{ fontSize: 14 }}>{item.title}</Typography>
                      <Chip
                        label="0 sales"
                        size="small"
                        sx={{ backgroundColor: "#f39c12", color: "white" }}
                      />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

          </Box>
        </Grid>
      </Grid>


    </Box>
  );
}

