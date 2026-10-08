import { cn } from "@/lib/cn";

type Common = { label: string; name: string; error?: string; hint?: string; required?: boolean; className?: string };

const control =
  "w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-coral aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-coral/20 border-line";

function Shell({ label, name, error, hint, required, className, children }: Common & { children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={name} className="block text-sm font-semibold">
        {label}
        {required && <span className="ml-0.5 text-coral" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p id={`${name}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${name}-error`} role="alert" className="text-xs font-medium text-coral">{error}</p>}
    </div>
  );
}

const aria = (name: string, error?: string, hint?: string) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${name}-error` : hint ? `${name}-hint` : undefined,
});

export function TextField({ label, name, error, hint, required, className, ...input }: Common & Omit<React.ComponentProps<"input">, "name">) {
  return (
    <Shell {...{ label, name, error, hint, required, className }}>
      <input id={name} name={name} required={required} className={control} {...aria(name, error, hint)} {...input} />
    </Shell>
  );
}

export function TextAreaField({ label, name, error, hint, required, className, maxLength, ...input }: Common & Omit<React.ComponentProps<"textarea">, "name">) {
  return (
    <Shell {...{ label, name, error, hint: hint ?? (maxLength ? `Up to ${maxLength} characters` : undefined), required, className }}>
      <textarea id={name} name={name} rows={4} required={required} maxLength={maxLength} className={control} {...aria(name, error, hint)} {...input} />
    </Shell>
  );
}

export function SelectField({ label, name, error, hint, required, className, options, placeholder = "Select…", ...input }: Common & Omit<React.ComponentProps<"select">, "name"> & { options: readonly { value: string; label: string }[]; placeholder?: string }) {
  return (
    <Shell {...{ label, name, error, hint, required, className }}>
      <select id={name} name={name} required={required} defaultValue="" className={control} {...aria(name, error, hint)} {...input}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Shell>
  );
}

export function FileField({ label, name, error, hint, required, className, ...input }: Common & Omit<React.ComponentProps<"input">, "name" | "type">) {
  return (
    <Shell {...{ label, name, error, hint, required, className }}>
      <input id={name} name={name} type="file" required={required} className={cn(control, "file:mr-4 file:rounded-full file:border-0 file:bg-mint-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand")} {...aria(name, error, hint)} {...input} />
    </Shell>
  );
}
