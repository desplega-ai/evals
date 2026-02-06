"use client";

import Link from "next/link";
import { useState } from "react";

// --- Types ---

interface FormData {
  // Step 1: Account Type
  accountType: "personal" | "business" | "";
  // Step 2: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Step 2b: Business Info (conditional)
  companyName: string;
  companySize: string;
  industry: string;
  // Step 3: Preferences
  theme: "light" | "dark" | "system";
  notifications: Set<string>;
  language: string;
  // Step 4: Address (conditional on personal) / Billing (conditional on business)
  street: string;
  city: string;
  state: string;
  zip: string;
  // Step 5: Review & Confirm
}

interface ValidationErrors {
  [key: string]: string;
}

// --- Step Indicator ---
function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
              index < currentStep
                ? "bg-green-500 text-white"
                : index === currentStep
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {index < currentStep ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          <span
            className={`ml-2 text-sm font-medium ${
              index === currentStep ? "text-blue-600" : index < currentStep ? "text-green-600" : "text-gray-400"
            }`}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-2 ${index < currentStep ? "bg-green-400" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    accountType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    companySize: "",
    industry: "",
    theme: "system",
    notifications: new Set(["email"]),
    language: "en",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);

  // Dynamic steps based on account type
  const getSteps = () => {
    const base = ["Account Type", "Personal Info"];
    if (formData.accountType === "business") {
      base.push("Business Info");
    }
    base.push("Preferences", "Address", "Review");
    return base;
  };

  const steps = getSteps();

  const updateField = (field: keyof FormData, value: string | Set<string>) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for field on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleNotification = (type: string) => {
    setFormData((prev) => {
      const newSet = new Set(prev.notifications);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return { ...prev, notifications: newSet };
    });
  };

  // Validation per step
  const validateStep = (step: number): ValidationErrors => {
    const errs: ValidationErrors = {};
    const stepName = steps[step];

    if (stepName === "Account Type") {
      if (!formData.accountType) errs.accountType = "Please select an account type.";
    }

    if (stepName === "Personal Info") {
      if (!formData.firstName.trim()) errs.firstName = "First name is required.";
      if (!formData.lastName.trim()) errs.lastName = "Last name is required.";
      if (!formData.email.trim()) errs.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email format.";
      if (formData.phone && !/^\+?[\d\s-()]{7,}$/.test(formData.phone)) errs.phone = "Invalid phone format.";
    }

    if (stepName === "Business Info") {
      if (!formData.companyName.trim()) errs.companyName = "Company name is required.";
      if (!formData.companySize) errs.companySize = "Please select company size.";
      if (!formData.industry) errs.industry = "Please select an industry.";
    }

    if (stepName === "Address") {
      if (!formData.street.trim()) errs.street = "Street is required.";
      if (!formData.city.trim()) errs.city = "City is required.";
      if (!formData.state.trim()) errs.state = "State is required.";
      if (!formData.zip.trim()) errs.zip = "ZIP code is required.";
      else if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) errs.zip = "Invalid ZIP format (e.g., 12345).";
    }

    return errs;
  };

  const handleNext = () => {
    setAttemptedNext(true);
    const errs = validateStep(currentStep);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      setAttemptedNext(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors({});
    setAttemptedNext(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      accountType: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      companySize: "",
      industry: "",
      theme: "system",
      notifications: new Set(["email"]),
      language: "en",
      street: "",
      city: "",
      state: "",
      zip: "",
    });
    setCurrentStep(0);
    setErrors({});
    setSubmitted(false);
    setAttemptedNext(false);
  };

  // Input helper
  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  const errorMsg = (field: string) =>
    errors[field] ? <p className="text-red-500 text-sm mt-1">{errors[field]}</p> : null;

  if (submitted) {
    return (
      <div className="font-sans min-h-screen p-8">
        <main className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
          </div>
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Registration Complete!</h2>
            <p className="text-gray-600 mb-6">
              Account created for <strong>{formData.firstName} {formData.lastName}</strong> ({formData.email})
            </p>
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <p><strong>Account Type:</strong> {formData.accountType}</p>
              {formData.accountType === "business" && (
                <p><strong>Company:</strong> {formData.companyName} ({formData.companySize}, {formData.industry})</p>
              )}
              <p><strong>Theme:</strong> {formData.theme}</p>
              <p><strong>Notifications:</strong> {Array.from(formData.notifications).join(", ") || "None"}</p>
              <p><strong>Address:</strong> {formData.street}, {formData.city}, {formData.state} {formData.zip}</p>
              <p className="mt-2 text-green-600 font-medium">Confirmation code: WIZARD-OK-42</p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        </main>
      </div>
    );
  }

  const stepName = steps[currentStep];

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Multi-Step Wizard</h1>
        <p className="text-gray-600 mb-6">
          Complete the registration form across multiple steps. Some steps appear conditionally based on your choices.
        </p>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="border border-gray-200 rounded-lg p-6 bg-white mb-6">
          {/* Step: Account Type */}
          {stepName === "Account Type" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Choose Account Type</h2>
              <p className="text-gray-600 mb-6">Select the type of account you want to create. Business accounts have an extra step.</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateField("accountType", "personal")}
                  data-testid="account-personal"
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    formData.accountType === "personal"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900">Personal</p>
                  <p className="text-sm text-gray-500">For individual use</p>
                </button>
                <button
                  onClick={() => updateField("accountType", "business")}
                  data-testid="account-business"
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    formData.accountType === "business"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900">Business</p>
                  <p className="text-sm text-gray-500">For teams and organizations</p>
                </button>
              </div>
              {errors.accountType && <p className="text-red-500 text-sm mt-3">{errors.accountType}</p>}
            </div>
          )}

          {/* Step: Personal Info */}
          {stepName === "Personal Info" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className={inputClass("firstName")}
                      placeholder="John"
                      data-testid="input-firstName"
                    />
                    {errorMsg("firstName")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className={inputClass("lastName")}
                      placeholder="Doe"
                      data-testid="input-lastName"
                    />
                    {errorMsg("lastName")}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass("email")}
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
                  {errorMsg("email")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClass("phone")}
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-phone"
                  />
                  {errorMsg("phone")}
                </div>
              </div>
            </div>
          )}

          {/* Step: Business Info (conditional) */}
          {stepName === "Business Info" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Business Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className={inputClass("companyName")}
                    placeholder="Acme Inc."
                    data-testid="input-companyName"
                  />
                  {errorMsg("companyName")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size *</label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => updateField("companySize", e.target.value)}
                    className={inputClass("companySize")}
                    data-testid="select-companySize"
                  >
                    <option value="">Select size...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                  {errorMsg("companySize")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                    className={inputClass("industry")}
                    data-testid="select-industry"
                  >
                    <option value="">Select industry...</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                  {errorMsg("industry")}
                </div>
              </div>
            </div>
          )}

          {/* Step: Preferences */}
          {stepName === "Preferences" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="flex gap-3">
                    {(["light", "dark", "system"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => updateField("theme", t)}
                        data-testid={`theme-${t}`}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                          formData.theme === t
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Notifications</label>
                  <div className="space-y-2">
                    {["email", "sms", "push", "in-app"].map((type) => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications.has(type)}
                          onChange={() => toggleNotification(type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          data-testid={`notif-${type}`}
                        />
                        <span className="text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {formData.notifications.size > 0 ? Array.from(formData.notifications).join(", ") : "None"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateField("language", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    data-testid="select-language"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step: Address */}
          {stepName === "Address" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {formData.accountType === "business" ? "Billing Address" : "Mailing Address"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className={inputClass("street")}
                    placeholder="123 Main St"
                    data-testid="input-street"
                  />
                  {errorMsg("street")}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={inputClass("city")}
                      placeholder="New York"
                      data-testid="input-city"
                    />
                    {errorMsg("city")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className={inputClass("state")}
                      placeholder="NY"
                      data-testid="input-state"
                    />
                    {errorMsg("state")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => updateField("zip", e.target.value)}
                      className={inputClass("zip")}
                      placeholder="10001"
                      data-testid="input-zip"
                    />
                    {errorMsg("zip")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {stepName === "Review" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Review Your Information</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Account</h3>
                  <p className="text-sm text-gray-600">Type: <span className="font-medium capitalize">{formData.accountType}</span></p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Personal</h3>
                  <p className="text-sm text-gray-600">Name: <span className="font-medium">{formData.firstName} {formData.lastName}</span></p>
                  <p className="text-sm text-gray-600">Email: <span className="font-medium">{formData.email}</span></p>
                  {formData.phone && <p className="text-sm text-gray-600">Phone: <span className="font-medium">{formData.phone}</span></p>}
                </div>
                {formData.accountType === "business" && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Business</h3>
                    <p className="text-sm text-gray-600">Company: <span className="font-medium">{formData.companyName}</span></p>
                    <p className="text-sm text-gray-600">Size: <span className="font-medium">{formData.companySize}</span></p>
                    <p className="text-sm text-gray-600">Industry: <span className="font-medium capitalize">{formData.industry}</span></p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Preferences</h3>
                  <p className="text-sm text-gray-600">Theme: <span className="font-medium capitalize">{formData.theme}</span></p>
                  <p className="text-sm text-gray-600">Notifications: <span className="font-medium">{Array.from(formData.notifications).join(", ") || "None"}</span></p>
                  <p className="text-sm text-gray-600">Language: <span className="font-medium">{formData.language}</span></p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Address</h3>
                  <p className="text-sm text-gray-600">{formData.street}</p>
                  <p className="text-sm text-gray-600">{formData.city}, {formData.state} {formData.zip}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            data-testid="btn-back"
          >
            Back
          </button>

          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>

          {stepName === "Review" ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              data-testid="btn-submit"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="btn-next"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
