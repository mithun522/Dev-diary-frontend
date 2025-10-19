import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import Button from "./ui/button";
import { removeAccessToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

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
      <DialogContent
        className="max-w-md rounded-2xl"
        onClose={() => onOpenChange(false)}
      >
        <div className="flex flex-col items-center text-center p-2">
          {/* Icon Container with Gradient Background */}
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-full mb-4 border border-red-100">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full">
              <LogOut className="w-6 h-6 text-red-500" />
            </div>
          </div>

          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
            Logout Account
          </DialogTitle>

          <DialogDescription className="text-sm text-gray-600 mb-6 leading-relaxed">
            You're about to logout from your account.
            <br />
            Are you sure you want to continue?
          </DialogDescription>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outlinePrimary"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm hover:shadow-md transition-all"
            >
              Yes, Logout
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            You'll need to login again to access your account
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
