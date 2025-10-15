import { Box, Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export default function SupplierNavbar({ setActiveSection }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuType, setMenuType] = useState("");

  const handleOpen = (event, type) => {
    setAnchorEl(event.currentTarget);
    setMenuType(type);
  };

  const handleClose = (section) => {
    setAnchorEl(null);
    if (section) setActiveSection(section);
  };

  const menus = [
    { label: "Store Dashboard", key: "store-dashboard" },
    { label: "Plan", key: "plan" },
    { label: "Inventory / Products", key: "inventory" },
    { label: "Analytics Dashboard", key: "analytics" },
    { label: "Sales", key: "sales" },
  ];

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {menus.map((menu) => (
        <Button
          key={menu.key}
          color="primary"
          variant="outlined"
          onClick={(e) => handleOpen(e, menu.key)}
        >
          {menu.label}
        </Button>
      ))}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleClose()}>
        <MenuItem onClick={() => handleClose(menuType)}>View</MenuItem>
        <MenuItem onClick={() => handleClose(menuType)}>Settings</MenuItem>
        <MenuItem onClick={() => handleClose(menuType)}>Reports</MenuItem>
      </Menu>
    </Box>
  );
}
