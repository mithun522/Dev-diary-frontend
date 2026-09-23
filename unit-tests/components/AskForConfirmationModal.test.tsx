import { render, screen, fireEvent } from "@testing-library/react";
import AskForConfirmationModal from "../../src/components/AskForConfirmationModal";

describe("AskForConfirmationModal", () => {
  test("renders default title and message when none are provided", () => {
    render(<AskForConfirmationModal onCancel={() => {}} />);

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?")
    ).toBeInTheDocument();
  });

  test("renders a custom title and message when provided", () => {
    render(
      <AskForConfirmationModal
        title="Delete problem?"
        message="This cannot be undone."
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("Delete problem?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  test("always renders the Cancel button and calls onCancel when clicked", () => {
    const onCancel = jest.fn();
    render(<AskForConfirmationModal onCancel={onCancel} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("omits both the Accept and Delete buttons by default", () => {
    render(<AskForConfirmationModal onCancel={() => {}} />);

    expect(screen.queryByText("Accept")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("renders the Accept button and calls onAccept when clicked, when showAccept is true", () => {
    const onAccept = jest.fn();
    render(
      <AskForConfirmationModal
        showAccept
        onAccept={onAccept}
        onCancel={() => {}}
      />
    );

    const acceptButton = screen.getByText("Accept");
    expect(acceptButton).toBeInTheDocument();
    fireEvent.click(acceptButton);

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  test("renders the Delete button and calls onDelete when clicked, when showDelete is true", () => {
    const onDelete = jest.fn();
    render(
      <AskForConfirmationModal
        showDelete
        onDelete={onDelete}
        onCancel={() => {}}
      />
    );

    const deleteButton = screen.getByText("Delete");
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("shows both Accept and Delete when both flags are true", () => {
    render(
      <AskForConfirmationModal
        showAccept
        showDelete
        onAccept={() => {}}
        onDelete={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("when isDeleting is true, shows a spinner and 'Deleting...' instead of the Delete label", () => {
    render(
      <AskForConfirmationModal
        showDelete
        isDeleting
        onDelete={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("Deleting...")).toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-cy="confirmation-modal-delete-spinner"]')
    ).toBeInTheDocument();
  });

  test("disables the Delete and Cancel buttons while isDeleting is true", () => {
    render(
      <AskForConfirmationModal
        showDelete
        isDeleting
        onDelete={() => {}}
        onCancel={() => {}}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    const deleteButton = document.querySelector(
      '[data-cy="confirmation-modal-delete"]'
    );

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  test("Cancel is enabled (and Delete not present as disabled-by-deleting) when isDeleting is false", () => {
    render(
      <AskForConfirmationModal
        showDelete
        onDelete={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("Cancel")).not.toBeDisabled();
    expect(screen.getByText("Delete")).not.toBeDisabled();
  });
});
