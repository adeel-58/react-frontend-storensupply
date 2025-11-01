// SalesSection.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function SalesSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [productsInStock, setProductsInStock] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ total_amount: 0, total_units: 0, total_profit: 0 });

  const [filterRange, setFilterRange] = useState("last_7");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [openAddSale, setOpenAddSale] = useState(false);
  const [savingSale, setSavingSale] = useState(false);

  // edit
  const [openEditSale, setOpenEditSale] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [addSaleForm, setAddSaleForm] = useState({
    product_id: "",
    quantity: 1,
    sold_price_per_unit: "",
    sale_channel: "local",
    notes: "",
  });

  const [editSaleForm, setEditSaleForm] = useState({
    quantity_sold: undefined,
    sold_price_per_unit: undefined,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const pageSize = 20;

  const showSnackbar = (message, severity = "info") => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const getDateRange = (range) => {
    const today = new Date();
    const end = new Date(today);
    let start = new Date(today);
    if (range === "last_7") start.setDate(end.getDate() - 6);
    else if (range === "last_30") start.setDate(end.getDate() - 29);
    else if (range === "last_90") start.setDate(end.getDate() - 89);
    else if (range === "last_month") {
      const firstDayThisMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      start = new Date(firstDayThisMonth);
      start.setMonth(start.getMonth() - 1);
      const lastDayPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      return { start: start.toISOString().slice(0, 10), end: lastDayPrevMonth.toISOString().slice(0, 10) };
    } else if (range === "custom") {
      return { start: customRange.start, end: customRange.end };
    }
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  };

  // Fetch products (using your /product endpoint) then filter stock > 0
  const fetchProductsInStock = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/product`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const products = res.data.products || [];
      const inStock = products.filter((p) => Number(p.stock_quantity) > 0);
      setProductsInStock(inStock);
    } catch (err) {
      console.error("Failed to fetch products in stock", err);
      showSnackbar("Failed to load products", "error");
    }
  };

  // Fetch sales - note backend expects start_date & end_date
  const fetchSalesAndSummary = async (range = filterRange, pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { start, end } = getDateRange(range);
      const res = await axios.get(
        `${API_URL}/sales?start_date=${start}&end_date=${end}&page=${pageNum}&pageSize=${pageSize}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // backend returns { success: true, sales: [...] }
      const remoteSales = res.data.sales || [];
      // map image field fallback (product_image, product_main_image, main_image)
      const mapped = remoteSales.map((s) => ({
        ...s,
        product_image: s.product_image
          ? `${import.meta.env.VITE_IMAGE_BASE_URL2}${s.product_image}`
          : null
      }));
      setSales(mapped);

      // your backend currently doesn't return summary; if it does, use it. otherwise compute quick summary here
      if (res.data.summary) {
        setSummary(res.data.summary);
      } else {
        const total_amount = mapped.reduce((acc, r) => acc + Number(r.total_sale_amount || 0), 0);
        const total_units = mapped.reduce((acc, r) => acc + Number(r.quantity_sold || 0), 0);
        const total_profit = mapped.reduce((acc, r) => acc + Number(r.profit || 0), 0);
        setSummary({ total_amount, total_units, total_profit });
      }
    } catch (err) {
      console.error("Failed to fetch sales", err);
      showSnackbar("Failed to load sales", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsInStock();
    fetchSalesAndSummary(filterRange, 1);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchSalesAndSummary(filterRange, 1);
    // eslint-disable-next-line
  }, [filterRange, customRange]);

  // Form handlers
  const handleAddSaleFormChange = (e) => {
    const { name, value } = e.target;
    // convert product_id to number
    if (name === "product_id") {
      setAddSaleForm((p) => ({ ...p, [name]: Number(value) }));
    } else if (name === "quantity") {
      setAddSaleForm((p) => ({ ...p, quantity: Math.max(1, Number(value || 0)) }));
    } else {
      setAddSaleForm((p) => ({ ...p, [name]: value }));
    }
  };

  // Create sale
  const handleCreateSale = async () => {
    if (!addSaleForm.product_id) return showSnackbar("Please select a product", "warning");
    const product = productsInStock.find((p) => Number(p.id) === Number(addSaleForm.product_id));
    if (!product) return showSnackbar("Selected product not found", "error");

    const qty = Number(addSaleForm.quantity || 0);
    if (!qty || qty <= 0) return showSnackbar("Quantity must be greater than zero", "warning");
    if (qty > Number(product.stock_quantity)) return showSnackbar("Quantity exceeds available stock", "warning");

    const price = parseFloat(addSaleForm.sold_price_per_unit);
    if (isNaN(price) || price <= 0) return showSnackbar("Enter valid sold price", "warning");

    setSavingSale(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        product_id: Number(addSaleForm.product_id),
        quantity_sold: qty,
        sold_price_per_unit: price,
        sale_channel: addSaleForm.sale_channel,
        notes: addSaleForm.notes,
      };

      const res = await axios.post(`${API_URL}/sales/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        await fetchProductsInStock();
        await fetchSalesAndSummary(filterRange, 1);
        showSnackbar("Sale recorded successfully", "success");
        setOpenAddSale(false);
      } else {
        showSnackbar(res.data.message || "Failed to record sale", "error");
      }
    } catch (err) {
      console.error("Failed to create sale", err);
      showSnackbar(err.response?.data?.message || "Failed to create sale", "error");
    } finally {
      setSavingSale(false);
    }
  };

  // Delete sale
  const handleDeleteSale = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/sales/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showSnackbar("Sale deleted", "success");
      // refresh lists
      await fetchProductsInStock();
      await fetchSalesAndSummary(filterRange, 1);
    } catch (err) {
      console.error("Failed to delete sale", err);
      showSnackbar(err.response?.data?.message || "Failed to delete sale", "error");
    }
  };

  // Open edit dialog
  const openEditDialog = (sale) => {
    setEditingSale(sale);
    setEditSaleForm({
      quantity_sold: sale.quantity_sold,
      sold_price_per_unit: sale.sold_price_per_unit,
    });
    setOpenEditSale(true);
  };

  // Edit sale submit
  const handleSaveEdit = async () => {
    if (!editingSale) return;
    const payload = {};
    if (editSaleForm.quantity_sold !== undefined) payload.quantity_sold = Number(editSaleForm.quantity_sold);
    if (editSaleForm.sold_price_per_unit !== undefined) payload.sold_price_per_unit = Number(editSaleForm.sold_price_per_unit);

    if (Object.keys(payload).length === 0) return showSnackbar("No changes to save", "warning");

    setSavingEdit(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/sales/${editingSale.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        showSnackbar("Sale updated", "success");
        setOpenEditSale(false);
        setEditingSale(null);
        await fetchProductsInStock();
        await fetchSalesAndSummary(filterRange, 1);
      } else {
        showSnackbar(res.data.message || "Failed to update sale", "error");
      }
    } catch (err) {
      console.error("Failed to update sale", err);
      showSnackbar(err.response?.data?.message || "Failed to update sale", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // Helpers
  const formatCurrency = (v) => {
    if (v == null) return "-";
    return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        pb: isMobile ? 3 : 5,
        pt: isMobile ? 3 : 5,
        px: isMobile ? 2 : 8,
        backgroundColor: "#1a1a1a",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 2 : 0,
      }}>
        <Typography variant="h6" fontWeight="bold" color="white" sx={{ fontSize: isMobile ? "16px" : "20px" }}>
          Sales & Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setOpenAddSale(true); }}
          size={isMobile ? "small" : "medium"}
          sx={{ width: isMobile ? "100%" : "auto", fontSize: isMobile ? "12px" : "14px" }}
        >
          {isMobile ? "Add" : "Add Sale"}
        </Button>
      </Box>

      {/* Filter & Summary Section */}
      <Paper sx={{
        p: isMobile ? 2 : 2,
        pt: isMobile ? 3 : 6,
        px: isMobile ? 2 : 8,
      }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={isMobile ? 2 : 8}
          alignItems={isMobile ? "stretch" : "center"}
        >
          <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 180 }}>
            <InputLabel>Period</InputLabel>
            <Select label="Period" value={filterRange} onChange={(e) => setFilterRange(e.target.value)}>
              <MenuItem value="last_7">Last 7 days</MenuItem>
              <MenuItem value="last_30">Last 30 days</MenuItem>
              <MenuItem value="last_90">Last 90 days</MenuItem>
              <MenuItem value="last_month">Last month (calendar)</MenuItem>
              <MenuItem value="custom">Custom range</MenuItem>
            </Select>
          </FormControl>

          {filterRange === "custom" && (
            <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ width: isMobile ? "100%" : "auto" }}>
              <TextField
                label="Start"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={customRange.start}
                onChange={(e) => setCustomRange((c) => ({ ...c, start: e.target.value }))}
                sx={{ flex: 1 }}
              />
              <TextField
                label="End"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={customRange.end}
                onChange={(e) => setCustomRange((c) => ({ ...c, end: e.target.value }))}
                sx={{ flex: 1 }}
              />
            </Stack>
          )}

          {/* Summary Stats */}
          <Box sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 6,
            ml: isMobile ? 0 : "auto",
            width: isMobile ? "100%" : "auto",
          }}>
            <Box sx={{ textAlign: isMobile ? "center" : "left" }}>
              <Typography variant="subtitle2" sx={{ fontSize: isMobile ? "13px" : "17px" }}>
                Total Sales
              </Typography>
              <Typography variant="h6" color="#D4AF37" fontWeight={700} sx={{ fontSize: isMobile ? "16px" : "inherit" }}>
                $ {formatCurrency(summary.total_amount)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: isMobile ? "center" : "left" }}>
              <Typography variant="subtitle2" sx={{ fontSize: isMobile ? "13px" : "17px" }}>
                Units Sold
              </Typography>
              <Typography variant="h6" color="#D4AF37" fontWeight={700} sx={{ fontSize: isMobile ? "16px" : "inherit" }}>
                {summary.total_units}
              </Typography>
            </Box>
            <Box sx={{ textAlign: isMobile ? "center" : "left" }}>
              <Typography variant="subtitle2" sx={{ fontSize: isMobile ? "13px" : "17px" }}>
                Profit
              </Typography>
              <Typography variant="h6" color="#D4AF37" fontWeight={700} sx={{ fontSize: isMobile ? "16px" : "inherit" }}>
                $ {formatCurrency(summary.total_profit)}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Sales Table / Card View */}
      <Paper>
        {isMobile ? (
          // Mobile Card View
          <Box sx={{ p: 2, pb: 5 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : sales.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ p: 3 }}>
                No sales for selected period.
              </Typography>
            ) : (
              sales.map((s) => (
                <Card key={s.id} sx={{ mb: 2, p: 2, backgroundColor: "#f9f9f9" }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                      <Avatar src={s.product_image || "/no-image.png"} sx={{ width: 50, height: 50, flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                          {s.product_title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(s.sale_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Qty
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {s.quantity_sold}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Sold Price
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          $ {formatCurrency(s.sold_price_per_unit)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          $ {formatCurrency(s.total_sale_amount)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Profit
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: "#D4AF37" }}>
                          $ {formatCurrency(s.profit)}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Channel: <strong>{s.sale_channel}</strong>
                    </Typography>

                    {s.notes && (
                      <Typography variant="caption" color="text.secondary">
                        Notes: {s.notes}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <IconButton size="small" onClick={() => openEditDialog(s)} sx={{ flex: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteSale(s.id)} sx={{ flex: 1 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Card>
              ))
            )}
          </Box>
        ) : (
          // Desktop Table View
          <TableContainer sx={{ px: 8, pb: 7 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Product</TableCell>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Qty</TableCell>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Sold Price</TableCell>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Total</TableCell>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Profit</TableCell>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Channel</TableCell>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Notes</TableCell>
                  <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} align="center"><CircularProgress /></TableCell></TableRow>
                ) : sales.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center">No sales for selected period.</TableCell></TableRow>
                ) : (
                  sales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.sale_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={s.product_image || "/no-image.png"} sx={{ width: 40, height: 40 }} />
                          <Typography variant="body2">{s.product_title}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{s.quantity_sold}</TableCell>
                      <TableCell>$ {formatCurrency(s.sold_price_per_unit)}</TableCell>
                      <TableCell>$ {formatCurrency(s.total_sale_amount)}</TableCell>
                      <TableCell>$ {formatCurrency(s.profit)}</TableCell>
                      <TableCell>{s.sale_channel}</TableCell>
                      <TableCell>{s.notes || "-"}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openEditDialog(s)}><EditIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteSale(s.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Sale Dialog */}
      <Dialog open={openAddSale} onClose={() => setOpenAddSale(false)} fullWidth maxWidth={isMobile ? "xs" : "sm"}>
        <DialogTitle sx={{ fontSize: isMobile ? "16px" : "inherit" }}>Add Sale</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Product (in stock)</InputLabel>
              <Select label="Product (in stock)" name="product_id" value={addSaleForm.product_id} onChange={handleAddSaleFormChange}>
                {productsInStock.map((pr) => (
                  <MenuItem key={pr.id} value={pr.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={pr.main_image || "/no-image.png"} sx={{ width: 36, height: 36 }} />
                      <Box>
                        <Typography variant="body2">{pr.title}</Typography>
                        <Typography variant="caption">Stock: {pr.stock_quantity}</Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction={isMobile ? "column" : "row"} spacing={isMobile ? 1 : 2}>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                size="small"
                value={addSaleForm.quantity}
                onChange={handleAddSaleFormChange}
                sx={{ width: isMobile ? "100%" : 150 }}
                InputProps={{ inputProps: { min: 1 } }}
              />

              <TextField
                label="Sold Price / unit"
                name="sold_price_per_unit"
                size="small"
                value={addSaleForm.sold_price_per_unit}
                onChange={handleAddSaleFormChange}
                sx={{ width: isMobile ? "100%" : 200 }}
              />

              <FormControl size="small" sx={{ width: isMobile ? "100%" : 150, minWidth: isMobile ? "100%" : 150 }}>
                <InputLabel>Channel</InputLabel>
                <Select label="Channel" name="sale_channel" value={addSaleForm.sale_channel} onChange={handleAddSaleFormChange}>
                  <MenuItem value="local">Local</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Notes (optional)"
              name="notes"
              value={addSaleForm.notes}
              onChange={handleAddSaleFormChange}
              fullWidth
              multiline
              rows={2}
              size={isMobile ? "small" : "medium"}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontSize: isMobile ? "12px" : "inherit" }}>
                Total
              </Typography>
              <Typography variant="subtitle1" sx={{ fontSize: isMobile ? "14px" : "inherit" }}>
                $ {formatCurrency((Number(addSaleForm.quantity) || 0) * (parseFloat(addSaleForm.sold_price_per_unit) || 0))}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: isMobile ? "column" : "row", gap: isMobile ? 1 : 0 }}>
          <Button onClick={() => setOpenAddSale(false)} disabled={savingSale} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateSale} disabled={savingSale} fullWidth={isMobile}>
            {savingSale ? <CircularProgress size={18} /> : "Save Sale"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog open={openEditSale} onClose={() => setOpenEditSale(false)} fullWidth maxWidth={isMobile ? "xs" : "xs"}>
        <DialogTitle sx={{ fontSize: isMobile ? "16px" : "inherit" }}>Edit Sale</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Quantity"
              type="number"
              size="small"
              value={editSaleForm.quantity_sold ?? ""}
              onChange={(e) => setEditSaleForm((s) => ({ ...s, quantity_sold: Number(e.target.value) }))}
              fullWidth
            />
            <TextField
              label="Sold Price / unit"
              size="small"
              value={editSaleForm.sold_price_per_unit ?? ""}
              onChange={(e) => setEditSaleForm((s) => ({ ...s, sold_price_per_unit: Number(e.target.value) }))}
              fullWidth
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontSize: isMobile ? "12px" : "inherit" }}>
                New Total
              </Typography>
              <Typography variant="subtitle1" sx={{ fontSize: isMobile ? "14px" : "inherit" }}>
                $ {formatCurrency((Number(editSaleForm.quantity_sold) || 0) * (Number(editSaleForm.sold_price_per_unit) || 0))}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: isMobile ? "column" : "row", gap: isMobile ? 1 : 0 }}>
          <Button onClick={() => setOpenEditSale(false)} disabled={savingEdit} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={savingEdit} fullWidth={isMobile}>
            {savingEdit ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}