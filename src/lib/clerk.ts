export const clerkAppearance = {
  variables: {
    colorPrimary: "#0066FF",
    colorTextOnPrimaryBackground: "#ffffff",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
  elements: {
    card: "shadow-xl border border-border bg-card",
    formButtonPrimary:
      "bg-electric hover:bg-electric/90 text-white rounded-full",
    footerActionLink: "text-electric hover:text-electric/80",
    identityPreviewEditButton: "text-electric",
    formFieldInput:
      "rounded-xl border-border bg-background focus:ring-electric/50",
    socialButtonsBlockButton:
      "rounded-full border-border bg-background hover:bg-muted",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
  },
};
