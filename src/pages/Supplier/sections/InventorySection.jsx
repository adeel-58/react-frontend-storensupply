import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
  Stack,
  Alert,
  IconButton,
  Snackbar,
  useMediaQuery,
  useTheme,
  Card,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function InventorySection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const categoryOptions = ["Electronics", "Fashion", "Home&Kitchen", "Health&Beauty", "Sports"];
  const countryOptions = ["USA", "UK", "Australia", "Germany", "Spain"];
  const sourceOptions = ["Local", "Ali Baba", "Ali Express", "Others"];


  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState("all");

  const [newProduct, setNewProduct] = useState({
    title: "",
    ebay_link: "",
    supplier_purchase_price: "",
    supplier_sold_price: "",
    stock_quantity: "",
    category: "",
    country: "",
    source_type: "",
    status: "active",
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [otherImageFiles, setOtherImageFiles] = useState([]);
  const otherImagesInputRef = useRef(null);

  // 🚨 Product limit dialog
  const [openLimitDialog, setOpenLimitDialog] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  // 🔔 Snackbar for quick notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch products
  const fetchProducts = async (status = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/product${status ? `?status=${status}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let serverProducts = res.data.products || [];

      // Normalize backend inconsistency
      serverProducts = serverProducts.map((p) => ({
        ...p,
        status: p.status === "paused" ? "out_of_stock" : p.status,
      }));

      // Filter correction
      if (status === "out_of_stock") {
        serverProducts = serverProducts.filter(
          (p) => p.status && p.status.toLowerCase() === "out_of_stock"
        );
      }

      setProducts(serverProducts);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err.response?.data || err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add or Edit Product
  const handleSaveProduct = async (isEdit = false) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v);
      });
      if (mainImageFile) formData.append("main_image", mainImageFile);
      otherImageFiles.forEach((f) => formData.append("other_images", f));

      const token = localStorage.getItem("token");
      const url = isEdit
        ? `${API_URL}/product/${selectedProduct.id}`
        : `${API_URL}/product/add`;
      const method = isEdit ? "put" : "post";

      const res = await axios({
        url,
        method,
        data: formData,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        fetchProducts(statusFilter === "all" ? "" : statusFilter);
        showSnackbar("Product saved successfully!", "success");

        // Reset form and close dialogs
        setOpenAddDialog(false);
        setOpenEditDialog(false);
        setNewProduct({
          title: "",
          ebay_link: "",
          supplier_purchase_price: "",
          supplier_sold_price: "",
          stock_quantity: "",
          category: "",
          country: "",
          source_type: "",
          status: "active",
        });
        setMainImageFile(null);
        setOtherImageFiles([]);
        if (otherImagesInputRef.current) otherImagesInputRef.current.value = "";
      } else {
        // 🚨 Show product limit popup
        setLimitMessage(res.data.message || "Product limit reached. Please upgrade your plan.");
        setOpenLimitDialog(true);
      }
    } catch (err) {
      console.error("Failed to save product:", err);
      showSnackbar(err.response?.data?.message || "Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showSnackbar("Product deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete product", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle product status
  const toggleStatus = async (product) => {
    const newStatus = product.status === "active" ? "paused" : "active";
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/product/${product.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fetchStatus =
        statusFilter === "paused"
          ? "out_of_stock"
          : statusFilter === "all"
            ? ""
            : statusFilter;

      fetchProducts(fetchStatus);
      showSnackbar("Product status updated!", "info");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to update product status", "error");
    }
  };

  // Filter products
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    const backendStatus = status === "paused" ? "out_of_stock" : status === "all" ? "" : status;
    fetchProducts(backendStatus);
  };

  // Limit Snackbar for validation warnings
  const [limitSnackbar, setLimitSnackbar] = useState({
    open: false,
    message: "",
  });

  const showLimitSnackbar = (message) => {
    setLimitSnackbar({ open: true, message });
  };

  const handleCloseLimitSnackbar = () => setLimitSnackbar({ ...limitSnackbar, open: false });

  // Handle input change with validations
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Title: truncate to 100 chars
    if (name === "title" && value.length > 100) {
      showLimitSnackbar("Title cannot exceed 100 characters. Extra characters were removed.");
      setNewProduct((prev) => ({ ...prev, [name]: value.slice(0, 100) }));
      return;
    }

    // Stock quantity & prices: must be positive
    if ((name === "stock_quantity" || name === "supplier_purchase_price" || name === "supplier_sold_price") && Number(value) < 0) {
      showLimitSnackbar(`${name.replace(/_/g, " ")} must be a positive number`);
      return;
    }

    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Main Image validation
  const onMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showLimitSnackbar("Only PNG, JPG, JPEG images are allowed for main image");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showLimitSnackbar("Main image size cannot exceed 3 MB");
      return;
    }

    setMainImageFile(file);
  };

  // Other Images validation
  const onOtherImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    const filteredFiles = [];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        showLimitSnackbar(`File "${file.name}" skipped. Only PNG, JPG, JPEG allowed`);
      } else if (file.size > 3 * 1024 * 1024) {
        showLimitSnackbar(`File "${file.name}" skipped. Max size 3 MB`);
      } else {
        filteredFiles.push(file);
      }
    });

    setOtherImageFiles(filteredFiles);
  };

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  return (
    <Box sx={{bgcolor:"#ffffff", border: "1px solid transparent",}}>
      {/* Header Section */}
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
        <Typography
          variant="h6"
          fontWeight="bold"
          color="white"
          sx={{ fontSize: isMobile ? "16px" : "20px" }}
        >
          Inventory / Products
        </Typography>

        {/* Filter & Add Button Container */}
        <Box sx={{
          display: "flex",
          gap: isMobile ? 1 : 1,
          flexWrap: isMobile ? "wrap" : "nowrap",
          width: isMobile ? "100%" : "auto",
        }}>
          <Button
            variant={statusFilter === "all" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("all")}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: isMobile ? "12px" : "14px", flex: isMobile ? "1 1 auto" : "auto" }}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("active")}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: isMobile ? "12px" : "14px", flex: isMobile ? "1 1 auto" : "auto" }}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "paused" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("paused")}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: isMobile ? "12px" : "14px", flex: isMobile ? "1 1 auto" : "auto" }}
          >
            Paused
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenAddDialog(true)}
            size={isMobile ? "small" : "medium"}
            sx={{
              fontSize: isMobile ? "12px" : "14px",
              ml: isMobile ? 0 : 2,
              flex: isMobile ? "1 1 100%" : "auto",
            }}
          >
            {isMobile ? "+ Add" : "+ Add Product"}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, mx: isMobile ? 2 : 0 }}>
          {error}
        </Alert>
      )}

      {products.length === 0 ? (
        <Typography color="text.secondary" sx={{ p: isMobile ? 2 : 4 }}>
          No products found.
        </Typography>
      ) : isMobile ? (
        /* Mobile Card View */
        <Box sx={{ px: 2, pb: 3 }}>
          {products.map((p) => (
            <Card
              key={p.id}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Avatar
                  src={p.main_image || "/no-image.png"}
                  variant="rounded"
                  sx={{ width: 80, height: 80, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                    {p.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Stock: {p.stock_quantity ?? "-"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Status: {p.status === "out_of_stock" ? "Paused" : p.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ${p.supplier_sold_price || "-"}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                {p.country || "-"} | {p.category || "-"}
              </Typography>

              {p.ebay_link && (
                <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                  <a
                    href={
                      p.ebay_link.startsWith("http://") || p.ebay_link.startsWith("https://")
                        ? p.ebay_link
                        : `https://${p.ebay_link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1976d2" }}
                  >
                    View eBay Link
                  </a>
                </Typography>
              )}

              <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between", mt: 2 }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedProduct(p);
                    setOpenPreviewDialog(true);
                  }}
                  sx={{ flex: 1 }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedProduct(p);
                    setNewProduct(p);
                    setOpenEditDialog(true);
                  }}
                  sx={{ flex: 1 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => toggleStatus(p)}
                  sx={{ flex: 1 }}
                >
                  {p.status === "active" ? (
                    <PauseCircleOutlineIcon fontSize="small" />
                  ) : (
                    <PlayCircleOutlineIcon fontSize="small" />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  sx={{ flex: 1 }}
                >
                  {deletingId === p.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                </IconButton>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer component={Paper} sx={{ px: 8 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Image</TableCell>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Title</TableCell>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Purchase Price + Tax</TableCell>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Sold Price</TableCell>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Country</TableCell>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>eBay Link</TableCell>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Stock</TableCell>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontSize: "17px", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Avatar
                      src={p.main_image || "/no-image.png"}
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  </TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>${p.supplier_purchase_price || "-"}</TableCell>
                  <TableCell>${p.supplier_sold_price || "-"}</TableCell>
                  <TableCell>{p.country || "-"}</TableCell>
                  <TableCell>
                    {p.ebay_link ? (
                      <a
                        href={
                          p.ebay_link.startsWith("http://") || p.ebay_link.startsWith("https://")
                            ? p.ebay_link
                            : `https://${p.ebay_link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{p.stock_quantity ?? "-"}</TableCell>
                  <TableCell>{p.status === "out_of_stock" ? "Paused" : p.status}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedProduct(p);
                        setOpenPreviewDialog(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedProduct(p);
                        setNewProduct(p);
                        setOpenEditDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => toggleStatus(p)}>
                      {p.status === "active" ? (
                        <PauseCircleOutlineIcon />
                      ) : (
                        <PlayCircleOutlineIcon />
                      )}
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Product Dialog */}
      <Dialog
        open={openAddDialog || openEditDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setOpenEditDialog(false);
        }}
        fullWidth
        maxWidth={isMobile ? "sm" : "md"}
      >
        <DialogTitle>{openAddDialog ? "Add New Product" : "Edit Product"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            {["title", "ebay_link", "supplier_purchase_price", "supplier_sold_price", "stock_quantity"].map((field) => (
              <TextField
                key={field}
                fullWidth
                margin="dense"
                label={field.replace(/_/g, " ").toUpperCase()}
                name={field}
                value={newProduct[field] || ""}
                onChange={handleChange}
                required
                size={isMobile ? "small" : "medium"}
              />
            ))}

            {/* Category Selector */}
            <TextField
              select
              fullWidth
              margin="dense"
              name="category"
              value={newProduct.category || ""}
              onChange={handleChange}
              SelectProps={{ native: true }}
              required
              size={isMobile ? "small" : "medium"}
            >
              <option value="">Select Category</option>
              {["Electronics", "Fashion", "Home&Kitchen", "Health&Beauty", "Sports"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </TextField>

            {/* Country Selector */}
            <TextField
              select
              fullWidth
              margin="dense"
              name="country"
              value={newProduct.country || ""}
              onChange={handleChange}
              SelectProps={{ native: true }}
              required
              size={isMobile ? "small" : "medium"}
            >
              <option value="">Select Country</option>
              {["USA", "UK", "Australia", "Germany", "Spain"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </TextField>

            {/* Source Selector */}
            <TextField
              select
              fullWidth
              margin="dense"
              name="source_type"
              value={newProduct.source_type || ""}
              onChange={handleChange}
              SelectProps={{ native: true }}
              required
              size={isMobile ? "small" : "medium"}
            >
              <option value="">Select Source</option>
              {["Local", "Ali Baba", "Ali Express", "Others"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </TextField>

            {/* Main Image */}
            <Box>
              <Typography variant={isMobile ? "caption" : "body2"} sx={{ mb: 0.5 }}>
                Main Image
              </Typography>
              <input type="file" onChange={onMainImageChange} required />
              {mainImageFile && (
                <Typography variant="caption">{mainImageFile.name}</Typography>
              )}
            </Box>

            {/* Other Images */}
            <Box>
              <Typography variant={isMobile ? "caption" : "body2"} sx={{ mb: 0.5 }}>
                Other Images
              </Typography>
              <input
                ref={otherImagesInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={onOtherImagesChange}
              />
              {otherImageFiles.length > 0 && (
                <Typography variant="caption">{otherImageFiles.length} files selected</Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddDialog(false);
              setOpenEditDialog(false);
            }}
            disabled={saving}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSaveProduct(openEditDialog)}
            disabled={saving}
            size={isMobile ? "small" : "medium"}
          >
            {saving ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Product Dialog */}
      <Dialog
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
        fullWidth
        maxWidth={isMobile ? "sm" : "md"}
      >
        <DialogTitle>Product Preview</DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontSize: isMobile ? "16px" : "inherit" }}>
                {selectedProduct.title}
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"}>
                Price: ${selectedProduct.supplier_sold_price}
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"}>
                Stock: {selectedProduct.stock_quantity}
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"}>
                Status: {selectedProduct.status}
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"}>
                Category: {selectedProduct.category}
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"}>
                Country: {selectedProduct.country}
              </Typography>
              <Box sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 1,
              }}>
                {selectedProduct.images?.map((img) => (
                  <Avatar
                    key={img.id}
                    src={img.image_url}
                    variant="rounded"
                    sx={{
                      width: isMobile ? 70 : 100,
                      height: isMobile ? 70 : 100,
                    }}
                  />
                ))}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)} size={isMobile ? "small" : "medium"}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🚨 Product Limit Reached Dialog */}
      <Dialog
        open={openLimitDialog}
        onClose={() => setOpenLimitDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { textAlign: "center", p: isMobile ? 1.5 : 2, borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main", fontSize: isMobile ? "16px" : "inherit" }}>
          Limit Reached
        </DialogTitle>
        <DialogContent>
          <Typography variant={isMobile ? "caption" : "body1"} sx={{ mt: 1 }}>
            {limitMessage || "Your product limit has been reached. Please upgrade your plan."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          justifyContent: "center",
          gap: 1,
          flexDirection: isMobile ? "column" : "row",
        }}>
          <Button
            variant="outlined"
            onClick={() => setOpenLimitDialog(false)}
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenLimitDialog(false);
              window.location.href = "/upgrade";
            }}
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            Upgrade Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔔 Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 🔔 Validation Limit Snackbar */}
      <Snackbar
        open={limitSnackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseLimitSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={handleCloseLimitSnackbar} sx={{ width: "100%" }}>
          {limitSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}