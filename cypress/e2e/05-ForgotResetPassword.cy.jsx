/// <reference types="cypress" />

import { CORRECT_EMAIL } from "../constants/Dummy-data";
import {
  FORGOT_PASSWORD_TITLE,
  FORGOT_PASSWORD_EMAIL,
  FORGOT_PASSWORD_SUBMIT,
  FORGOT_PASSWORD_ERROR,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_ENTER_OTP,
  FORGOT_PASSWORD_BACK_TO_LOGIN,
  VERIFY_OTP_TITLE,
  VERIFY_OTP_EMAIL,
  VERIFY_OTP_INPUT,
  VERIFY_OTP_SUBMIT,
  VERIFY_OTP_RESEND,
  VERIFY_OTP_BACK_TO_LOGIN,
  RESET_PASSWORD_TITLE,
  RESET_PASSWORD_PASSWORD,
  RESET_PASSWORD_CONFIRM_PASSWORD,
  RESET_PASSWORD_SUBMIT,
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_STRENGTH,
  TOAST_ERROR,
  TOAST_SUCCESS,
} from "../constants/Selectors";

describe("Forgot Password Page", () => {
  beforeEach(() => {
    cy.visit("/auth/forgot-password");
  });

  it("Navigates to Forgot Password page", () => {
    cy.get(FORGOT_PASSWORD_TITLE).should("be.visible");
    cy.url().should("include", "/auth/forgot-password");
  });

  it("Should show an error when email is empty", () => {
    cy.get(FORGOT_PASSWORD_SUBMIT).click();
    cy.get(FORGOT_PASSWORD_ERROR)
      .should("be.visible")
      .and("contain", "Please enter your email address");
  });

  it("Should show a server error toast when the request fails", () => {
    cy.intercept("POST", "**/auth/otp", {
      statusCode: 400,
      body: { message: "Unable to send OTP" },
    }).as("sendOtpFailure");

    cy.get(FORGOT_PASSWORD_EMAIL).type(CORRECT_EMAIL);
    cy.get(FORGOT_PASSWORD_SUBMIT).click();
    cy.wait("@sendOtpFailure");
    cy.get(TOAST_ERROR).contains("Unable to send OTP").should("be.visible");
  });

  it("Should show the success state and link to verify-otp on success", () => {
    cy.intercept("POST", "**/auth/otp", {
      statusCode: 200,
      body: { message: "OTP sent" },
    }).as("sendOtpSuccess");

    cy.get(FORGOT_PASSWORD_EMAIL).type(CORRECT_EMAIL);
    cy.get(FORGOT_PASSWORD_SUBMIT).click();
    cy.wait("@sendOtpSuccess");

    cy.get(FORGOT_PASSWORD_SUCCESS).should("be.visible").and("contain", CORRECT_EMAIL);
    cy.get(FORGOT_PASSWORD_ENTER_OTP).click();
    cy.url().should("include", "/auth/verify-otp");
    cy.url().should("include", encodeURIComponent(CORRECT_EMAIL));
  });

  it("Should navigate back to login", () => {
    cy.get(FORGOT_PASSWORD_BACK_TO_LOGIN).click();
    cy.url().should("include", "/auth/login");
  });
});

describe("Verify OTP Page", () => {
  beforeEach(() => {
    cy.visit(`/auth/verify-otp?email=${encodeURIComponent(CORRECT_EMAIL)}`);
  });

  it("Navigates to Verify OTP page with the email pre-filled", () => {
    cy.get(VERIFY_OTP_TITLE).should("be.visible");
    cy.get(VERIFY_OTP_EMAIL).should("have.value", CORRECT_EMAIL);
  });

  it("Should show an error for an incomplete OTP", () => {
    cy.get(VERIFY_OTP_INPUT).find("input").first().type("123");
    cy.get(VERIFY_OTP_SUBMIT).click();
    cy.get(TOAST_ERROR)
      .contains("Please enter a valid 6-digit OTP")
      .should("be.visible");
  });

  it("Should show an error toast for an incorrect OTP", () => {
    cy.intercept("POST", "**/auth/verifyotp", {
      statusCode: 400,
      body: { message: "Invalid OTP" },
    }).as("verifyOtpFailure");

    cy.get(VERIFY_OTP_INPUT).find("input").first().type("000000");
    cy.get(VERIFY_OTP_SUBMIT).click();
    cy.wait("@verifyOtpFailure");
    cy.get(TOAST_ERROR).contains("Invalid OTP").should("be.visible");
  });

  it("Should navigate to reset-password on a correct OTP", () => {
    cy.intercept("POST", "**/auth/verifyotp", {
      statusCode: 200,
      body: { message: "OTP verified" },
    }).as("verifyOtpSuccess");

    cy.get(VERIFY_OTP_INPUT).find("input").first().type("123456");
    cy.get(VERIFY_OTP_SUBMIT).click();
    cy.wait("@verifyOtpSuccess");
    cy.get(TOAST_SUCCESS).contains("OTP verified successfully").should("be.visible");
    cy.url().should("include", "/auth/reset-password");
    cy.url().should("include", "otp=123456");
  });

  it("Should resend the OTP", () => {
    cy.intercept("POST", "**/auth/otp", {
      statusCode: 200,
      body: { message: "OTP resent" },
    }).as("resendOtp");

    cy.get(VERIFY_OTP_RESEND).click();
    cy.wait("@resendOtp");
    cy.get(TOAST_SUCCESS)
      .contains("A new OTP has been sent to your email")
      .should("be.visible");
  });

  it("Should navigate back to login", () => {
    cy.get(VERIFY_OTP_BACK_TO_LOGIN).click();
    cy.url().should("include", "/auth/login");
  });
});

describe("Reset Password Page", () => {
  const email = CORRECT_EMAIL;
  const otp = "123456";

  it("Redirects to forgot-password when email/otp are missing", () => {
    cy.visit("/auth/reset-password");
    cy.url().should("include", "/auth/forgot-password");
  });

  describe("with email and otp present", () => {
    beforeEach(() => {
      cy.visit(
        `/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`
      );
    });

    it("Navigates to Reset Password page", () => {
      cy.get(RESET_PASSWORD_TITLE).should("be.visible");
    });

    it("Should show an error when fields are empty", () => {
      cy.get(RESET_PASSWORD_SUBMIT).click();
      cy.get(RESET_PASSWORD_ERROR)
        .should("be.visible")
        .and("contain", "Please fill in all fields");
    });

    it("Should show an error when passwords do not match", () => {
      cy.get(RESET_PASSWORD_PASSWORD).type("Admin@123");
      cy.get(RESET_PASSWORD_CONFIRM_PASSWORD).type("Admin@124");
      cy.get(RESET_PASSWORD_SUBMIT).click();
      cy.get(RESET_PASSWORD_ERROR)
        .should("be.visible")
        .and("contain", "Passwords do not match");
    });

    it("Should show the password strength meter and reject a weak password", () => {
      cy.get(RESET_PASSWORD_PASSWORD).type("weak");
      cy.get(RESET_PASSWORD_STRENGTH).should("be.visible").and("contain", "Weak");
      cy.get(RESET_PASSWORD_CONFIRM_PASSWORD).type("weak");
      cy.get(RESET_PASSWORD_SUBMIT).click();
      cy.get(RESET_PASSWORD_ERROR)
        .should("be.visible")
        .and("contain", "Please use a stronger password");
    });

    it("Should show a server error toast when reset fails", () => {
      cy.intercept("POST", "**/auth/reset-password", {
        statusCode: 400,
        body: { message: "OTP has expired" },
      }).as("resetPasswordFailure");

      cy.get(RESET_PASSWORD_PASSWORD).type("Admin@123");
      cy.get(RESET_PASSWORD_CONFIRM_PASSWORD).type("Admin@123");
      cy.get(RESET_PASSWORD_SUBMIT).click();
      cy.wait("@resetPasswordFailure");
      cy.get(RESET_PASSWORD_ERROR)
        .should("be.visible")
        .and("contain", "OTP has expired");
    });

    it("Should reset the password successfully and redirect to login", () => {
      cy.intercept("POST", "**/auth/reset-password", {
        statusCode: 200,
        body: { message: "Password reset successfully" },
      }).as("resetPasswordSuccess");

      cy.get(RESET_PASSWORD_PASSWORD).type("Admin@123");
      cy.get(RESET_PASSWORD_CONFIRM_PASSWORD).type("Admin@123");
      cy.get(RESET_PASSWORD_SUBMIT).click();
      cy.wait("@resetPasswordSuccess");
      cy.get(TOAST_SUCCESS)
        .contains("Password reset successfully")
        .should("be.visible");
      cy.url().should("include", "/auth/login?reset=success");
    });
  });
});
