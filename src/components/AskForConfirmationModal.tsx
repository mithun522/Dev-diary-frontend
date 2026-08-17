import React from "react";

type AskForConfirmationModalProps = {
  title?: string;
  message?: string;
  showAccept?: boolean;
  showDelete?: boolean;
  onAccept?: () => void;
  onDelete?: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
};

const AskForConfirmationModal: React.FC<AskForConfirmationModalProps> = ({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  showAccept = false,
  showDelete = false,
  onAccept,
  onDelete,
  onCancel,
  isDeleting = false,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      data-cy="confirmation-modal"
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={isDeleting}
            data-cy="confirmation-modal-cancel"
          >
            Cancel
          </button>
          {showAccept && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={onAccept}
              data-cy="confirmation-modal-accept"
            >
              Accept
            </button>
          )}
          {showDelete && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[80px]"
              onClick={onDelete}
              disabled={isDeleting}
              data-cy="confirmation-modal-delete"
            >
              {isDeleting ? (
                <>
                  <span
                    className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                    data-cy="confirmation-modal-delete-spinner"
                  />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskForConfirmationModal;
