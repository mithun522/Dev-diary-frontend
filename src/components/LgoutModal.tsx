import type React from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import Button from "./ui/button";
import { removeAccessToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    removeAccessToken();
    navigate("/auth/login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogTitle>Logout</DialogTitle>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to logout?
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outlinePrimary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
