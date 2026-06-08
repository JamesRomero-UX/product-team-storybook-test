# Skipped Cloudscape components

- **AppLayout** (`app-layout`) — requires full app shell context (header + side-nav + content)
- **AppLayoutToolbar** (`app-layout-toolbar`) — requires full app shell context
- **AnnotationContext** (`annotation-context`) — provider used by Hotspot/TutorialPanel
- **Hotspot** (`hotspot`) — requires AnnotationContext + tutorial state
- **TutorialPanel** (`tutorial-panel`) — requires AnnotationContext + tutorial state
- **I18n** (`i18n`) — provider — wraps other components
- **S3ResourceSelector** (`s3-resource-selector`) — requires S3 configuration + AWS SDK
- **CodeEditor** (`code-editor`) — requires Ace editor builds + worker setup
- **SplitPanel** (`split-panel`) — only renders inside AppLayout
- **AnchorNavigation** (`anchor-navigation`) — requires scroll-spy context on a long-form page
- **HelpPanel** (`help-panel`) — renders inside AppLayout; trivial standalone
- **LiveRegion** (`live-region`) — screen-reader-only, no visible output
- **TreeView** (`tree-view`) — complex node state; not implementing
- **TopNavigation** (`top-navigation`) — requires full app shell
- **PropertyFilter** (`property-filter`) — complex query state — best inside Table
- **CollectionPreferences** (`collection-preferences`) — complex preferences UI — best inside Table
