export const EmptyState = ({ title, description, action }) => (
  <div className="surface-muted p-8 text-center">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate-300">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);
