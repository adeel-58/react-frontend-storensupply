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
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, paused

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

  // Fetch products
  const fetchProducts = async (status = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/product${status ? `?status=${status}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const onMainImageChange = (e) => setMainImageFile(e.target.files?.[0] ?? null);
  const onOtherImagesChange = (e) => setOtherImageFiles(Array.from(e.target.files || []));

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

      if (res.data.success) fetchProducts(statusFilter === "all" ? "" : statusFilter);

      // Reset
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
    } catch (err) {
      console.error("Failed to save product:", err);
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle product status
  const toggleStatus = async (product) => {
    const newStatus = product.status === "active" ? "out_of_stock" : "active";
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/product/${product.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts(statusFilter === "all" ? "" : statusFilter);
    } catch (err) {
      console.error(err);
      alert("Failed to update product status");
    }
  };

  // Filter products
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchProducts(status === "all" ? "" : status);
  };

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Inventory / Products
        </Typography>
        <Box>
          <Button
            variant={statusFilter === "all" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("all")}
            sx={{ mr: 1 }}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("active")}
            sx={{ mr: 1 }}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "paused" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("paused")}
          >
            Paused
          </Button>
          <Button variant="contained" sx={{ ml: 2 }} onClick={() => setOpenAddDialog(true)}>
            + Add Product
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {products.length === 0 ? (
        <Typography color="text.secondary">No products found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
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
                  <TableCell>${p.supplier_sold_price || "-"}</TableCell>
                  <TableCell>{p.stock_quantity ?? "-"}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setSelectedProduct(p); setOpenPreviewDialog(true); }}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => { setSelectedProduct(p); setNewProduct(p); setOpenEditDialog(true); }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => toggleStatus(p)}>
                      {p.status === "active" ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                      {deletingId === p.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Product Dialog */}
      <Dialog open={openAddDialog || openEditDialog} onClose={() => { setOpenAddDialog(false); setOpenEditDialog(false); }} fullWidth maxWidth="md">
        <DialogTitle>{openAddDialog ? "Add New Product" : "Edit Product"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            {["title", "ebay_link", "supplier_purchase_price", "supplier_sold_price", "stock_quantity", "category", "country", "source_type"].map((field) => (
              <TextField
                key={field}
                fullWidth
                margin="dense"
                label={field.replace("_", " ").toUpperCase()}
                name={field}
                value={newProduct[field] || ""}
                onChange={handleChange}
              />
            ))}

            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>Main Image</Typography>
              <input type="file" onChange={onMainImageChange} />
              {mainImageFile && <Typography variant="caption">{mainImageFile.name}</Typography>}
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>Other Images</Typography>
              <input ref={otherImagesInputRef} type="file" multiple accept="image/*" onChange={onOtherImagesChange} />
              {otherImageFiles.length > 0 && <Typography variant="caption">{otherImageFiles.length} files selected</Typography>}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddDialog(false); setOpenEditDialog(false); }} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={() => handleSaveProduct(openEditDialog)} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Product Dialog */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Product Preview</DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <Stack spacing={1}>
              <Typography variant="h6">{selectedProduct.title}</Typography>
              <Typography>Price: ${selectedProduct.supplier_sold_price}</Typography>
              <Typography>Stock: {selectedProduct.stock_quantity}</Typography>
              <Typography>Status: {selectedProduct.status}</Typography>
              <Typography>Category: {selectedProduct.category}</Typography>
              <Typography>Country: {selectedProduct.country}</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {selectedProduct.images?.map((img) => (
                  <Avatar key={img.id} src={img.image_url} variant="rounded" sx={{ width: 100, height: 100 }} />
                ))}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
