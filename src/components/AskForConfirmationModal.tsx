import React from "react";

type AskForConfirmationModalProps = {
  title?: string;
  message?: string;
  showAccept?: boolean;
  showDelete?: boolean;
  onAccept?: () => void;
  onDelete?: () => void;
  onCancel: () => void;
};

const AskForConfirmationModal: React.FC<AskForConfirmationModalProps> = ({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  showAccept = false,
  showDelete = false,
  onAccept,
  onDelete,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          {showAccept && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={onAccept}
            >
              Accept
            </button>
          )}
          {showDelete && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={onDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskForConfirmationModal;
