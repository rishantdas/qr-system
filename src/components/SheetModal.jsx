export const SheetModal = ({ open, title, children, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-[#050b18]/68 backdrop-blur-md md:hidden">
      <div className="max-h-[78vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#050b18] p-4">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#53627c]" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[1rem] font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/5 px-4 py-2 text-sm text-[#b7c1d5]"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
