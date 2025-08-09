import { useState } from "react";
import { Mail, User, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateLeadForm } from "@/lib/validation";
import { useLeadStore } from "@/lib/lead-store";

// ==================== TYPES ====================
type FormField = "name" | "email" | "industry";
type Industry = (typeof INDUSTRIES)[number]["value"];

interface Lead {
  name: string;
  email: string;
  industry: Industry;
  submitted_at: string;
}

interface FormState {
  data: Lead;
  errors: ValidationError[];
  isSubmitted: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

// ==================== CONSTANTS ====================
const API_CONFIG = {
  endpoint: "https://ytyopyznqpnylebzibby.supabase.co/functions/v1/clever-task",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0eW9weXpucXBueWxlYnppYmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI3NTUsImV4cCI6MjA3MDEyODc1NX0.nr9WV_ybqZ6PpWT6GjAQm0Bsdr-Q5IejEhToV34VY4E`,
  },
} as const;

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
] as const;

const FORM_LABELS = {
  name: "Your name",
  email: "your@email.com",
  industry: "Select your industry",
} as const;

// ==================== HOOKS ====================
const useLeadForm = () => {
  const [state, setState] = useState<FormState>({
    data: { name: "", email: "", industry: "", submitted_at: "" },
    errors: [],
    isSubmitted: false,
  });

  const { addLead, leads } = useLeadStore();

  const updateField = (field: FormField, value: string) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: prev.errors.filter((e) => e.field !== field),
    }));
  };

  const submitForm = async (formData: Lead) => {
    const errors = validateLeadForm(formData);
    if (errors.length) return setState((prev) => ({ ...prev, errors }));

    try {
      const response = await fetch(API_CONFIG.endpoint, {
        method: "POST",
        headers: API_CONFIG.headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Submission failed");

      const newLead = {
        ...formData,
        submitted_at: new Date().toISOString(),
      };

      await addLead(newLead);
      setState((prev) => ({
        ...prev,
        isSubmitted: true,
        data: { name: "", email: "", industry: "", submitted_at: "" },
      }));
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const resetForm = () =>
    setState({
      data: { name: "", email: "", industry: "", submitted_at: "" },
      errors: [],
      isSubmitted: false,
    });

  return { state, updateField, submitForm, resetForm, leadCount: leads.length };
};

// ==================== COMPONENTS ====================
const FormField = ({
  error,
  children,
}: {
  error?: ValidationError;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    {children}
    {error && (
      <p className="text-destructive text-sm animate-fade-in">
        {error.message}
      </p>
    )}
  </div>
);

const FormInput = ({
  field,
  value,
  error,
  onChange,
  icon,
  type = "text",
}: {
  field: FormField;
  value: string;
  error?: ValidationError;
  onChange: (field: FormField, value: string) => void;
  icon: React.ReactNode;
  type?: React.HTMLInputTypeAttribute;
}) => (
  <FormField error={error}>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground">
        {icon}
      </span>
      <Input
        type={type}
        placeholder={FORM_LABELS[field]}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="pl-10 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground transition-smooth"
        data-error={!!error}
      />
    </div>
  </FormField>
);

const IndustrySelect = ({
  value,
  error,
  onChange,
}: {
  value: Industry;
  error?: ValidationError;
  onChange: (value: Industry) => void;
}) => (
  <FormField error={error}>
    <div className="relative">
      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="pl-10 h-12 bg-input border-border text-foreground transition-smooth"
          data-error={!!error}
        >
          <SelectValue placeholder={FORM_LABELS.industry} />
        </SelectTrigger>
        <SelectContent>
          {INDUSTRIES.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </FormField>
);

const SubmitButton = () => (
  <Button
    type="submit"
    className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold rounded-lg shadow-glow hover:shadow-[0_0_60px_hsl(210_100%_60%/0.3)] transition-smooth transform hover:scale-[1.02]"
  >
    <CheckCircle className="w-5 h-5 mr-2" />
    Get Early Access
  </Button>
);

const FormHeader = () => (
  <div className="text-center mb-8">
    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
      <Mail className="w-8 h-8 text-primary-foreground" />
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">
      Join Our Community
    </h2>
    <p className="text-muted-foreground">Be the first to know when we launch</p>
  </div>
);

const FormFooter = () => (
  <p className="text-xs text-muted-foreground text-center mt-6">
    By submitting, you agree to receive updates. Unsubscribe anytime.
  </p>
);

const SuccessIcon = () => (
  <div className="relative mb-6">
    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow animate-glow">
      <CheckCircle className="w-10 h-10 text-primary-foreground" />
    </div>
  </div>
);

const SuccessMessage = ({ leadCount }: { leadCount: number }) => (
  <>
    <h2 className="text-3xl font-bold text-foreground mb-3">
      Welcome aboard! 🎉
    </h2>
    <p className="text-muted-foreground mb-2">
      Thanks for joining! We'll be in touch soon with updates.
    </p>
    <p className="text-sm text-accent mb-8">
      You're #{leadCount} in this session
    </p>
  </>
);

const NextSteps = () => (
  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 mb-4">
    <p className="text-sm text-foreground">
      💡 <strong>What's next?</strong>
      <br />
      We'll send you exclusive updates, early access, and behind-the-scenes
      content.
    </p>
  </div>
);

const ResetButton = ({ onReset }: { onReset: () => void }) => (
  <Button
    onClick={onReset}
    variant="outline"
    className="w-full border-border hover:bg-accent/10 transition-smooth group"
  >
    Submit Another Lead
    <User className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
  </Button>
);

const SocialPrompt = () => (
  <div className="mt-6 pt-6 border-t border-border">
    <p className="text-xs text-muted-foreground">
      Follow our journey on social media for real-time updates
    </p>
  </div>
);

const SuccessScreen = ({
  leadCount,
  onReset,
}: {
  leadCount: number;
  onReset: () => void;
}) => (
  <div className="w-full max-w-md mx-auto">
    <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border backdrop-blur-sm animate-slide-up text-center">
      <SuccessIcon />
      <SuccessMessage leadCount={leadCount} />
      <NextSteps />
      <ResetButton onReset={onReset} />
      <SocialPrompt />
    </div>
  </div>
);

const FormContainer = ({
  onSubmit,
  children,
}: {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}) => (
  <div className="w-full max-w-md mx-auto">
    <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border backdrop-blur-sm animate-slide-up">
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
      </form>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
export const LeadCaptureForm = () => {
  const { state, updateField, submitForm, resetForm, leadCount } =
    useLeadForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(state.data);
  };

  return state.isSubmitted ? (
    <SuccessScreen leadCount={leadCount} onReset={resetForm} />
  ) : (
    <FormContainer onSubmit={handleSubmit}>
      <FormHeader />
      <FormInput
        field="name"
        value={state.data.name}
        error={state.errors.find((e) => e.field === "name")}
        onChange={updateField}
        icon={<User />}
      />
      <FormInput
        field="email"
        value={state.data.email}
        error={state.errors.find((e) => e.field === "email")}
        onChange={updateField}
        icon={<Mail />}
        type="email"
      />
      <IndustrySelect
        value={state.data.industry}
        error={state.errors.find((e) => e.field === "industry")}
        onChange={(value) => updateField("industry", value)}
      />
      <SubmitButton />
      <FormFooter />
    </FormContainer>
  );
};
